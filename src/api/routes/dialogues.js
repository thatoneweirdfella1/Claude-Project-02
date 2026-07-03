// Dialogue Routes
// POST /dialogues - Create dialogue
// POST /dialogues/:id/turn - Submit dialogue turn
// GET /dialogues/:id - Get dialogue
// POST /dialogues/:id/rating - Rate dialogue

const express = require('express');
const router = express.Router();

const dialogueController = require('../../services/dialogue-controller');
const dialogueModes = require('../../services/dialogue-modes');

/**
 * POST /api/v1/dialogues
 * Create new multi-AI dialogue
 */
router.post('/', async (req, res, next) => {
  try {
    const { questionId, goal, mode, modelA, modelB, userId } = req.body;

    if (!questionId || !goal) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'questionId and goal are required'
      });
    }

    // If mode not specified, recommend one
    let selectedMode = mode;
    if (!mode) {
      const modeRec = dialogueModes.goalToModes(goal);
      selectedMode = modeRec.primary;
    }

    const dialogue = await dialogueController.createDialogue(
      questionId,
      goal,
      selectedMode,
      modelA || 'claude_a',
      modelB || 'gpt_a',
      userId
    );

    res.status(201).json(dialogue);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/dialogues/:id
 * Get full dialogue with all turns
 */
router.get('/:id', async (req, res, next) => {
  try {
    const dialogue = await dialogueController.getDialogue(req.params.id);

    if (!dialogue) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: `Dialogue ${req.params.id} not found`
      });
    }

    res.json(dialogue);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/dialogues/:id/turn
 * Submit action for dialogue: continue, accept, pause, stop, rewind, take_over
 */
router.post('/:id/turn', async (req, res, next) => {
  try {
    const { action, userInput, round, speaker, modelUsed, content, tokensUsed } = req.body;

    if (!action) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'action is required'
      });
    }

    // Handle action
    const result = await dialogueController.handleDialogueAction(
      req.params.id,
      action,
      userInput
    );

    // If adding turn, save it
    if (action === 'take_over' && content) {
      await dialogueController.addTurn(
        req.params.id,
        round,
        'user',
        'user_input',
        content,
        0
      );
    }

    // Check auto-stop after turn
    const stopCheck = await dialogueController.checkDialogueStop(req.params.id);
    result.autoStopped = stopCheck.shouldStop;
    result.stopReason = stopCheck.reason;

    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/dialogues/:id/rating
 * Submit feedback on completed dialogue
 */
router.post('/:id/rating', async (req, res, next) => {
  try {
    const { rating, whatWorked, comment, tags } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'rating must be 1-5'
      });
    }

    const result = await dialogueController.submitDialogueFeedback(
      req.params.id,
      rating,
      whatWorked || [],
      comment || '',
      tags || []
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
