"use strict";

const { DatabaseSync } = require("node:sqlite");
const { randomBytes, scryptSync, timingSafeEqual, randomUUID } = require("node:crypto");

function now() { return Date.now(); }
function normalizeEmail(value) { return String(value || "").trim().toLowerCase(); }
function publicUser(row, account) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    createdAt: row.created_at,
    ...(account ? {
      creditBalance: Number(account.creditBalance || 0),
      plan: account.plan || "free",
      billingDate: Number(account.billingDate || 0),
      pendingPayments: (account.manualPaymentRequests || []).filter((request) => request.status === "pending"),
    } : {}),
  };
}

function hashPassword(password, salt = randomBytes(16)) {
  const digest = scryptSync(password, salt, 64);
  return { salt: salt.toString("base64"), digest: digest.toString("base64") };
}

function verifyPassword(password, saltBase64, digestBase64) {
  const expected = Buffer.from(digestBase64, "base64");
  const actual = scryptSync(password, Buffer.from(saltBase64, "base64"), expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function createDesktopDatabase(filename) {
  const db = new DatabaseSync(filename);
  db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      password_digest TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('operator', 'user')),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_state (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      session_json TEXT,
      account_json TEXT,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      details_json TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    INSERT OR IGNORE INTO schema_migrations(version, applied_at) VALUES (1, ${now()});
  `);

  const settingGet = db.prepare("SELECT value FROM app_settings WHERE key = ?");
  const settingSet = db.prepare(`
    INSERT INTO app_settings(key, value, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at
  `);
  const settingDelete = db.prepare("DELETE FROM app_settings WHERE key = ?");
  const activeId = () => settingGet.get("active_user_id")?.value || null;
  const activeRow = () => {
    const id = activeId();
    return id ? db.prepare("SELECT * FROM users WHERE id = ?").get(id) : null;
  };
  const requireOperator = () => {
    const row = activeRow();
    if (!row || row.role !== "operator") throw new Error("Operator access required.");
    return row;
  };
  const accountFor = (userId) => {
    const row = db.prepare("SELECT account_json FROM user_state WHERE user_id = ?").get(userId);
    return row?.account_json ? JSON.parse(row.account_json) : {};
  };
  const saveAccountFor = (userId, account) => {
    db.prepare("UPDATE user_state SET account_json=?, updated_at=? WHERE user_id=?")
      .run(JSON.stringify(account), now(), userId);
  };
  const audit = (userId, action, details = {}) => {
    db.prepare("INSERT INTO audit_log(id, user_id, action, details_json, created_at) VALUES (?, ?, ?, ?, ?)")
      .run(randomUUID(), userId, action, JSON.stringify(details), now());
  };

  return {
    currentUser() { return publicUser(activeRow()); },
    signUp({ email, password, displayName }) {
      const normalized = normalizeEmail(email);
      if (!/^\S+@\S+\.\S+$/.test(normalized)) throw new Error("Enter a valid email address.");
      if (String(password).length < 8) throw new Error("Password must contain at least 8 characters.");
      if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(normalized)) throw new Error("An account with that email already exists.");
      const first = db.prepare("SELECT COUNT(*) AS count FROM users").get().count === 0;
      const id = randomUUID();
      const hashed = hashPassword(String(password));
      const createdAt = now();
      const role = first ? "operator" : "user";
      db.prepare(`INSERT INTO users(id,email,display_name,password_salt,password_digest,role,created_at,updated_at)
                  VALUES (?,?,?,?,?,?,?,?)`)
        .run(id, normalized, String(displayName || normalized.split("@")[0]).trim(), hashed.salt, hashed.digest, role, createdAt, createdAt);
      db.prepare("INSERT INTO user_state(user_id,session_json,account_json,updated_at) VALUES (?,NULL,NULL,?)").run(id, createdAt);
      settingSet.run("active_user_id", id, createdAt);
      audit(id, "account.created", { role });
      return publicUser(db.prepare("SELECT * FROM users WHERE id = ?").get(id));
    },
    logIn({ email, password }) {
      const row = db.prepare("SELECT * FROM users WHERE email = ?").get(normalizeEmail(email));
      if (!row || !verifyPassword(String(password), row.password_salt, row.password_digest)) {
        throw new Error("Email or password is incorrect.");
      }
      settingSet.run("active_user_id", row.id, now());
      audit(row.id, "account.login");
      return publicUser(row);
    },
    logOut() {
      const id = activeId();
      if (id) audit(id, "account.logout");
      settingDelete.run("active_user_id");
    },
    listUsers() {
      requireOperator();
      return db.prepare("SELECT * FROM users ORDER BY created_at ASC").all()
        .map((row) => publicUser(row, accountFor(row.id)));
    },
    adjustUserCredits(userId, amount, note = "Operator adjustment") {
      const operator = requireOperator();
      const numeric = Number(amount);
      if (!Number.isFinite(numeric) || numeric === 0) throw new Error("Enter a non-zero credit adjustment.");
      if (!db.prepare("SELECT 1 FROM users WHERE id = ?").get(userId)) throw new Error("User not found.");
      const account = accountFor(userId);
      const before = Number(account.creditBalance || 0);
      const balanceAfter = Math.max(0, Math.round((before + numeric) * 1_000_000) / 1_000_000);
      account.creditBalance = balanceAfter;
      account.creditLedger = [...(account.creditLedger || []), {
        id: randomUUID(), timestamp: now(), kind: "admin-adjustment", amount: balanceAfter - before,
        balanceAfter, note, referenceId: `operator:${operator.id}`,
      }].slice(-1000);
      saveAccountFor(userId, account);
      audit(operator.id, "credits.adjusted", { userId, amount: balanceAfter - before, balanceAfter });
      return publicUser(db.prepare("SELECT * FROM users WHERE id = ?").get(userId), account);
    },
    resolveUserPayment(userId, requestId, approved) {
      const operator = requireOperator();
      const account = accountFor(userId);
      const request = (account.manualPaymentRequests || []).find((item) => item.id === requestId && item.status === "pending");
      if (!request) throw new Error("Pending payment request not found.");
      const resolvedAt = now();
      account.manualPaymentRequests = account.manualPaymentRequests.map((item) =>
        item.id === requestId ? { ...item, status: approved ? "approved" : "rejected", resolvedAt } : item,
      );
      if (approved) {
        const before = Number(account.creditBalance || 0);
        const balanceAfter = Math.round((before + Number(request.creditAmount || 0)) * 1_000_000) / 1_000_000;
        account.creditBalance = balanceAfter;
        account.creditLedger = [...(account.creditLedger || []), {
          id: randomUUID(), timestamp: resolvedAt, kind: request.kind, amount: Number(request.creditAmount || 0),
          balanceAfter, note: `${request.kind} payment approved`, referenceId: request.id,
        }].slice(-1000);
        if (request.kind === "subscription") {
          account.plan = request.tier || account.plan || "free";
          account.billingDate = resolvedAt + 30 * 24 * 60 * 60 * 1000;
        }
      }
      saveAccountFor(userId, account);
      audit(operator.id, approved ? "payment.approved" : "payment.rejected", { userId, requestId });
      return publicUser(db.prepare("SELECT * FROM users WHERE id = ?").get(userId), account);
    },
    loadState() {
      const id = activeId();
      if (!id) return null;
      const row = db.prepare("SELECT session_json, account_json FROM user_state WHERE user_id = ?").get(id);
      if (!row || (!row.session_json && !row.account_json)) return null;
      return {
        session: row.session_json ? JSON.parse(row.session_json) : undefined,
        account: row.account_json ? JSON.parse(row.account_json) : undefined,
      };
    },
    saveState(state) {
      const id = activeId();
      if (!id) throw new Error("Log in before saving application state.");
      const tx = db.prepare(`UPDATE user_state SET session_json=?, account_json=?, updated_at=? WHERE user_id=?`);
      tx.run(JSON.stringify(state.session || {}), JSON.stringify(state.account || {}), now(), id);
    },
    getSetting(key) { return settingGet.get(key)?.value || null; },
    setSetting(key, value) { settingSet.run(key, String(value), now()); },
    deleteSetting(key) { settingDelete.run(key); },
    close() { db.close(); },
  };
}

module.exports = { createDesktopDatabase };
