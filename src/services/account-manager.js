// Account Management & Token Tracking
// Handles 8 free accounts, token monitoring, auto-swap logic

const db = require('../database/init');
const crypto = require('crypto');

// 8 default free accounts (Phase 11+ system)
const DEFAULT_ACCOUNTS = [
  { id: 'claude_a', provider: 'anthropic', tier: 'free', tokens: 100000 },
  { id: 'claude_b', provider: 'anthropic', tier: 'free', tokens: 100000 },
  { id: 'claude_c', provider: 'anthropic', tier: 'free', tokens: 100000 },
  { id: 'gpt_a', provider: 'openai', tier: 'free', tokens: 150000 },
  { id: 'gpt_b', provider: 'openai', tier: 'free', tokens: 150000 },
  { id: 'perplexity_a', provider: 'perplexity', tier: 'free', tokens: 100000 },
  { id: 'perplexity_b', provider: 'perplexity', tier: 'free', tokens: 100000 },
  { id: 'perplexity_c', provider: 'perplexity', tier: 'free', tokens: 100000 }
];

// Encryption key for API keys (in production: use env var)
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY || crypto.randomBytes(32);

/**
 * Initialize default accounts in database
 */
async function initializeDefaultAccounts() {
  try {
    for (const account of DEFAULT_ACCOUNTS) {
      const existing = await db.get('SELECT id FROM accounts WHERE id = ?', [account.id]);

      if (!existing) {
        await db.run(
          `INSERT INTO accounts (id, provider, tier, tokens_available, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [account.id, account.provider, account.tier, account.tokens, 'ready', new Date().toISOString()]
        );
      }
    }
    console.log('✓ Default accounts initialized');
  } catch (err) {
    console.error('Error initializing accounts:', err);
    throw err;
  }
}

/**
 * Encrypt API key
 */
function encryptApiKey(apiKey) {
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY.toString());
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * Decrypt API key
 */
function decryptApiKey(encrypted) {
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY.toString());
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Get all accounts with token status
 */
async function getAllAccounts() {
  try {
    const accounts = await db.all(`
      SELECT id, provider, tier, tokens_available, tokens_used_this_session, status, last_used, created_at
      FROM accounts
      ORDER BY provider, id
    `);

    return accounts.map(acc => ({
      ...acc,
      tokens_remaining: acc.tokens_available - (acc.tokens_used_this_session || 0),
      status: getAccountStatus(acc.tokens_available - (acc.tokens_used_this_session || 0))
    }));
  } catch (err) {
    console.error('Error fetching accounts:', err);
    throw err;
  }
}

/**
 * Get single account
 */
async function getAccount(accountId) {
  try {
    const account = await db.get(
      'SELECT * FROM accounts WHERE id = ?',
      [accountId]
    );

    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }

    return {
      ...account,
      tokens_remaining: account.tokens_available - (account.tokens_used_this_session || 0),
      status: getAccountStatus(account.tokens_available - (account.tokens_used_this_session || 0))
    };
  } catch (err) {
    console.error('Error fetching account:', err);
    throw err;
  }
}

/**
 * Determine account status based on token availability
 */
function getAccountStatus(tokensRemaining) {
  if (tokensRemaining < 100) return 'depleted';
  if (tokensRemaining < tokensRemaining * 0.2) return 'warning'; // 20% remaining
  return 'active';
}

/**
 * Decrement token count after API call
 */
async function decrementTokens(accountId, tokensUsed) {
  try {
    const account = await getAccount(accountId);
    const newCount = account.tokens_used_this_session + tokensUsed;

    await db.run(
      `UPDATE accounts SET tokens_used_this_session = ? WHERE id = ?`,
      [newCount, accountId]
    );

    // Mark last_used
    await db.run(
      `UPDATE accounts SET last_used = ? WHERE id = ?`,
      [new Date().toISOString(), accountId]
    );

    return newCount;
  } catch (err) {
    console.error('Error decrementing tokens:', err);
    throw err;
  }
}

/**
 * Check if account is depleted (< 100 tokens)
 */
async function isAccountDepleted(accountId) {
  try {
    const account = await getAccount(accountId);
    const remaining = account.tokens_available - account.tokens_used_this_session;
    return remaining < 100;
  } catch (err) {
    console.error('Error checking account depletion:', err);
    throw err;
  }
}

/**
 * Get next available account for rotation
 * Priority: same provider > different provider
 */
async function getNextAvailableAccount(currentAccountId) {
  try {
    const current = await getAccount(currentAccountId);
    const allAccounts = await getAllAccounts();

    // Filter out depleted accounts and current account
    const available = allAccounts.filter(acc =>
      acc.id !== currentAccountId &&
      (acc.tokens_available - acc.tokens_used_this_session) > 100
    );

    if (available.length === 0) {
      return null; // No accounts available
    }

    // Priority: same provider first
    const sameProvider = available.find(acc => acc.provider === current.provider);
    if (sameProvider) {
      return sameProvider;
    }

    // Fall back to different provider
    return available[0];
  } catch (err) {
    console.error('Error getting next available account:', err);
    throw err;
  }
}

/**
 * Reset session token count (for new session/day)
 */
async function resetSessionTokens(accountId = null) {
  try {
    if (accountId) {
      await db.run(
        `UPDATE accounts SET tokens_used_this_session = 0 WHERE id = ?`,
        [accountId]
      );
    } else {
      // Reset all accounts
      await db.run(
        `UPDATE accounts SET tokens_used_this_session = 0`
      );
    }
  } catch (err) {
    console.error('Error resetting session tokens:', err);
    throw err;
  }
}

/**
 * Add custom API account (M5+ feature)
 */
async function addCustomAccount(provider, apiKey, alias) {
  try {
    const id = `custom_${provider}_${Date.now()}`;
    const encryptedKey = encryptApiKey(apiKey);

    // Fetch initial token limit from API (simplified: use defaults)
    const tokenDefaults = {
      openai: 150000,
      anthropic: 100000,
      perplexity: 100000
    };

    await db.run(
      `INSERT INTO accounts (id, provider, tier, api_key, tokens_available, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, provider, 'custom', encryptedKey, tokenDefaults[provider] || 100000, 'active', new Date().toISOString()]
    );

    return { id, provider, alias, status: 'active' };
  } catch (err) {
    console.error('Error adding custom account:', err);
    throw err;
  }
}

/**
 * Rotate to next account manually
 */
async function rotateToAccount(accountId) {
  try {
    const account = await getAccount(accountId);

    // Mark as last_used
    await db.run(
      `UPDATE accounts SET last_used = ? WHERE id = ?`,
      [new Date().toISOString(), accountId]
    );

    return account;
  } catch (err) {
    console.error('Error rotating to account:', err);
    throw err;
  }
}

module.exports = {
  initializeDefaultAccounts,
  encryptApiKey,
  decryptApiKey,
  getAllAccounts,
  getAccount,
  decrementTokens,
  isAccountDepleted,
  getNextAvailableAccount,
  resetSessionTokens,
  addCustomAccount,
  rotateToAccount
};
