// Account Routes
// GET /accounts - List all accounts
// GET /accounts/:id - Get account details
// POST /accounts - Add custom account
// POST /accounts/:id/rotate - Rotate to account
// GET /accounts/token-status - Current token availability

const express = require('express');
const router = express.Router();

const accountManager = require('../../services/account-manager');
const accountRotator = require('../../services/account-rotator');

/**
 * GET /api/v1/accounts
 * List all available accounts with token status
 */
router.get('/', async (req, res, next) => {
  try {
    const accounts = await accountManager.getAllAccounts();

    res.json({
      accounts,
      total_available: accounts.reduce((sum, acc) => sum + acc.tokens_remaining, 0),
      total_used_session: accounts.reduce((sum, acc) => sum + (acc.tokens_used_this_session || 0), 0),
      current_account: accountRotator.getCurrentAccount()
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/accounts/token-status
 * Current session token status
 */
router.get('/token-status', async (req, res, next) => {
  try {
    const status = await accountRotator.checkAccountStatus();
    const accounts = await accountManager.getAllAccounts();

    res.json({
      current_account: accountRotator.getCurrentAccount(),
      accounts: accounts.map(acc => ({
        id: acc.id,
        tokens_available: acc.tokens_available,
        status: acc.status,
        warning: acc.tokens_remaining < acc.tokens_available * 0.2
      })),
      session_tokens_used: accounts.reduce((sum, acc) => sum + (acc.tokens_used_this_session || 0), 0),
      status: status
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/accounts/:id
 * Get specific account details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const account = await accountManager.getAccount(req.params.id);

    if (!account) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: `Account ${req.params.id} not found`
      });
    }

    res.json(account);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/accounts
 * Add custom API account (M5+ feature)
 */
router.post('/', async (req, res, next) => {
  try {
    const { provider, apiKey, alias } = req.body;

    if (!provider || !apiKey) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'provider and apiKey are required'
      });
    }

    const account = await accountManager.addCustomAccount(provider, apiKey, alias);

    res.status(201).json(account);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/accounts/:id/rotate
 * Manually rotate to specific account
 */
router.post('/:id/rotate', async (req, res, next) => {
  try {
    const { nextAccountId } = req.body;

    if (!nextAccountId) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'nextAccountId is required'
      });
    }

    const result = await accountRotator.rotateToAccount(nextAccountId);

    res.json({
      previous_account: result.previousAccount,
      current_account: result.newAccount,
      reason: result.reason,
      rotated_at: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
