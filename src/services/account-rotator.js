// Account Auto-Swap Logic & Context Transfer
// Handles automatic account rotation when tokens deplete

const accountManager = require('./account-manager');
const db = require('../database/init');

// Current session's active account (in-memory, can be extended to session store)
let currentAccount = 'claude_a';
let lastSwapReason = null;
let swapHistory = [];

/**
 * Initialize account rotator for session
 */
async function initializeSession(startingAccount = 'claude_a') {
  currentAccount = startingAccount;
  swapHistory = [];
  console.log(`✓ Session initialized with account: ${currentAccount}`);
}

/**
 * Check if current account needs rotation
 * Returns: { needsRotation: boolean, reason: string }
 */
async function checkAccountStatus() {
  try {
    const account = await accountManager.getAccount(currentAccount);
    const remaining = account.tokens_available - account.tokens_used_this_session;

    if (remaining < 100) {
      return {
        needsRotation: true,
        reason: 'tokens_depleted',
        tokensRemaining: remaining,
        accountId: currentAccount
      };
    }

    if (remaining < account.tokens_available * 0.2) {
      return {
        needsRotation: false,
        reason: 'warning',
        tokensRemaining: remaining,
        accountId: currentAccount
      };
    }

    return {
      needsRotation: false,
      reason: 'ok',
      tokensRemaining: remaining,
      accountId: currentAccount
    };
  } catch (err) {
    console.error('Error checking account status:', err);
    throw err;
  }
}

/**
 * Perform automatic account rotation
 * Returns: { previousAccount, newAccount, swapReason, contextTransferPrompt }
 */
async function performAutoSwap(dialogueHistory = null) {
  try {
    const previousAccount = currentAccount;
    const nextAccount = await accountManager.getNextAvailableAccount(currentAccount);

    if (!nextAccount) {
      throw new Error('No available accounts for swap');
    }

    // Update current account
    currentAccount = nextAccount.id;
    lastSwapReason = 'tokens_depleted';

    // Record swap in history
    swapHistory.push({
      timestamp: new Date().toISOString(),
      from: previousAccount,
      to: nextAccount.id,
      reason: lastSwapReason
    });

    // Build context transfer prompt
    const contextTransfer = buildContextTransferPrompt(previousAccount, nextAccount.id, dialogueHistory);

    // Log swap to database
    await db.run(
      `INSERT INTO activity_log (id, action, action_text, created_at)
       VALUES (?, ?, ?, ?)`,
      [
        `swap_${Date.now()}`,
        'account_swapped',
        `${previousAccount} depleted → ${nextAccount.id} activated`,
        new Date().toISOString()
      ]
    );

    console.log(`✓ Account swapped: ${previousAccount} → ${nextAccount.id}`);

    return {
      previousAccount,
      newAccount: nextAccount.id,
      swapReason: lastSwapReason,
      contextTransferPrompt: contextTransfer.systemPrompt,
      swapNotification: contextTransfer.notification
    };
  } catch (err) {
    console.error('Error performing auto-swap:', err);
    throw err;
  }
}

/**
 * Build system prompt for context transfer to new account
 */
function buildContextTransferPrompt(previousAccountId, newAccountId, dialogueHistory) {
  let contextString = '';

  if (dialogueHistory && dialogueHistory.length > 0) {
    contextString = dialogueHistory
      .map(turn => `${turn.speaker} (${turn.model}): ${turn.content}`)
      .join('\n\n');
  }

  const systemPrompt = `You are continuing a conversation that was started with ${previousAccountId}.

Account Status: ${previousAccountId} has run out of tokens. You (${newAccountId}) are continuing.

Previous Conversation Context:
${contextString || '(No previous turns in this dialogue)'}

Instructions:
1. Continue seamlessly from where the previous model left off
2. Reference the previous responses if needed
3. Maintain the same tone and conversation state
4. Complete the current response naturally

Remember: The user is aware of the account swap and expects continuity.`;

  const notification = {
    banner: `🔄 ${previousAccountId} tokens depleted. ${newAccountId} continuing.`,
    inline: `← ${newAccountId} joins (${previousAccountId} tokens depleted)`
  };

  return {
    systemPrompt,
    notification
  };
}

/**
 * Check if swap is needed before API call
 * If yes, perform swap and return new account
 * If no, return current account
 */
async function getActiveAccount(dialogueHistory = null) {
  try {
    const status = await checkAccountStatus();

    if (status.needsRotation) {
      const swap = await performAutoSwap(dialogueHistory);
      return {
        accountId: swap.newAccount,
        swapped: true,
        swapNotification: swap.swapNotification,
        contextTransferPrompt: swap.contextTransferPrompt
      };
    }

    return {
      accountId: currentAccount,
      swapped: false
    };
  } catch (err) {
    console.error('Error getting active account:', err);
    throw err;
  }
}

/**
 * Get current active account
 */
function getCurrentAccount() {
  return currentAccount;
}

/**
 * Get swap history for this session
 */
function getSwapHistory() {
  return swapHistory;
}

/**
 * Manual rotation to specific account
 */
async function rotateToAccount(accountId) {
  try {
    const targetAccount = await accountManager.getAccount(accountId);

    const previousAccount = currentAccount;
    currentAccount = accountId;

    swapHistory.push({
      timestamp: new Date().toISOString(),
      from: previousAccount,
      to: accountId,
      reason: 'manual_rotation'
    });

    console.log(`✓ Manual rotation: ${previousAccount} → ${accountId}`);

    return {
      previousAccount,
      newAccount: accountId,
      reason: 'manual_rotation'
    };
  } catch (err) {
    console.error('Error rotating to account:', err);
    throw err;
  }
}

module.exports = {
  initializeSession,
  checkAccountStatus,
  performAutoSwap,
  buildContextTransferPrompt,
  getActiveAccount,
  getCurrentAccount,
  getSwapHistory,
  rotateToAccount
};
