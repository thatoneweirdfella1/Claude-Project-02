"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { createDesktopDatabase } = require("./db.cjs");

test("isolates state by local user and protects operator-only listing", () => {
  const folder = mkdtempSync(path.join(tmpdir(), "divergence-db-"));
  const db = createDesktopDatabase(path.join(folder, "test.sqlite"));
  try {
    const operator = db.signUp({ email: "owner@example.com", password: "password-one", displayName: "Owner" });
    assert.equal(operator.role, "operator");
    db.saveState({ account: { creditBalance: 10 }, session: { draftInput: "owner" } });
    db.logOut();

    const user = db.signUp({ email: "user@example.com", password: "password-two", displayName: "User" });
    assert.equal(user.role, "user");
    assert.equal(db.loadState(), null);
    assert.throws(() => db.listUsers(), /Operator access required/);
    db.saveState({ account: { creditBalance: 1 }, session: { draftInput: "user" } });
    db.logOut();

    db.logIn({ email: "owner@example.com", password: "password-one" });
    assert.equal(db.loadState().account.creditBalance, 10);
    assert.equal(db.listUsers().length, 2);
    const adjusted = db.adjustUserCredits(user.id, 5, "support test");
    assert.equal(adjusted.creditBalance, 6);
    assert.throws(() => db.logIn({ email: "user@example.com", password: "wrong-pass" }), /incorrect/);
  } finally {
    db.close();
    rmSync(folder, { recursive: true, force: true });
  }
});
