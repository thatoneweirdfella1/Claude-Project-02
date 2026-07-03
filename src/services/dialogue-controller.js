// Dialogue Loop Controller
// Orchestrates multi-AI dialogue flow, turn management, state transitions

const db = require('../database/init');
const dialogueModes = require('./dialogue-modes');
const accountRotator = require('./account-rotator');
const crypto = require('crypto');

/**
 * Create new dialogue
 */
async function createDialogue(questionId, goal, mode, modelA, modelB, userId) {
  try {
    const dialogueId = `d_${crypto.randomBytes(8).toString('hex')}`;
    const modeObj = dialogueModes.getMode(mode);

    await db.run(
      `INSERT INTO dialogues (id, question_id, goal, mode, model_a, model_b, rounds_completed, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dialogueId,
        questionId,
        goal,
        mode,
        modelA,
        modelB,
        0,
        'initiated',
        new Date().toISOString()
      ]
    );

    console.log(`✓ Dialogue created: ${dialogueId} (${mode})`);

    return {
      id: dialogueId,
      questionId,
      goal,
      mode,
      modelA,
      modelB,
      status: 'initiated',
      round: 0,
      modeDescription: modeObj.description
    };
  } catch (err) {
    console.error('Error creating dialogue:', err);
    throw err;
  }
}

/**
 * Get dialogue by ID with full history
 */
async function getDialogue(dialogueId) {
  try {
    const dialogue = await db.get(
      'SELECT * FROM dialogues WHERE id = ?',
      [dialogueId]
    );

    if (!dialogue) {
      throw new Error(`Dialogue ${dialogueId} not found`);
    }

    // Fetch all turns
    const turns = await db.all(
      'SELECT * FROM dialogue_turns WHERE dialogue_id = ? ORDER BY round, created_at',
      [dialogueId]
    );

    // Parse dialogue_content JSON if exists
    let content = [];
    if (dialogue.dialogue_content) {
      try {
        content = JSON.parse(dialogue.dialogue_content);
      } catch (e) {
        console.error('Error parsing dialogue_content:', e);
      }
    }

    return {
      ...dialogue,
      turns,
      content
    };
  } catch (err) {
    console.error('Error fetching dialogue:', err);
    throw err;
  }
}

/**
 * Add turn to dialogue
 */
async function addTurn(dialogueId, round, speaker, modelUsed, content, tokensUsed) {
  try {
    const turnId = `t_${crypto.randomBytes(8).toString('hex')}`;

    await db.run(
      `INSERT INTO dialogue_turns (id, dialogue_id, round, speaker, model_used, content, tokens_used, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        turnId,
        dialogueId,
        round,
        speaker,
        modelUsed,
        content,
        tokensUsed,
        new Date().toISOString()
      ]
    );

    return { id: turnId, speaker, modelUsed, round, content };
  } catch (err) {
    console.error('Error adding turn:', err);
    throw err;
  }
}

/**
 * Handle dialogue action: continue, accept, pause, stop, rewind, take_over
 */
async function handleDialogueAction(dialogueId, action, userInput = null) {
  try {
    const dialogue = await getDialogue(dialogueId);
    const mode = dialogueModes.getMode(dialogue.mode);

    let result = { action, dialogueId, status: 'ok' };

    switch (action) {
      case 'continue':
        result.message = 'Continue dialogue to next round';
        result.nextAction = 'generate_response';
        break;

      case 'accept':
        // End dialogue with acceptance
        await db.run(
          'UPDATE dialogues SET status = ?, completed_at = ? WHERE id = ?',
          ['accepted', new Date().toISOString(), dialogueId]
        );
        result.message = `Dialogue ended. Goal: ${dialogue.goal} achieved.`;
        result.nextAction = 'show_feedback';
        break;

      case 'pause':
        // Pause dialogue (can resume later)
        await db.run(
          'UPDATE dialogues SET status = ? WHERE id = ?',
          ['paused', dialogueId]
        );
        result.message = 'Dialogue paused. You can resume later.';
        result.nextAction = 'save_state';
        break;

      case 'stop':
        // Stop dialogue permanently
        await db.run(
          'UPDATE dialogues SET status = ?, completed_at = ? WHERE id = ?',
          ['stopped', new Date().toISOString(), dialogueId]
        );
        result.message = 'Dialogue stopped.';
        result.nextAction = 'show_feedback';
        break;

      case 'rewind':
        // Rewind to previous round and branch
        const newBranchId = `${dialogueId}_branch_${Date.now()}`;
        result.message = `Dialogue branched to ${newBranchId}`;
        result.nextAction = 'start_new_dialogue';
        result.branchId = newBranchId;
        break;

      case 'take_over':
        // User inserts their own response
        if (!userInput) {
          throw new Error('take_over requires userInput');
        }
        const turnId = await addTurn(
          dialogueId,
          dialogue.rounds_completed + 1,
          'user',
          'user_input',
          userInput,
          0
        );
        result.message = 'Your response added to dialogue.';
        result.nextAction = 'generate_response';
        result.turnId = turnId;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return result;
  } catch (err) {
    console.error('Error handling dialogue action:', err);
    throw err;
  }
}

/**
 * Check if dialogue should auto-stop
 */
async function checkDialogueStop(dialogueId) {
  try {
    const dialogue = await getDialogue(dialogueId);
    const turns = dialogue.turns;

    if (turns.length < 2) {
      return { shouldStop: false, reason: 'not_enough_turns' };
    }

    // Get last two turns (last full round from both models)
    const lastTurns = turns.slice(-2);
    const allPreviousTurns = turns.slice(0, -2);

    const stopCheck = dialogueModes.checkAutoStop(
      dialogue.mode,
      dialogue.rounds_completed,
      lastTurns[0].content,
      lastTurns[1].content,
      allPreviousTurns
    );

    if (stopCheck.shouldStop) {
      // Update dialogue with stop reason
      await db.run(
        'UPDATE dialogues SET stop_reason = ?, status = ?, completed_at = ? WHERE id = ?',
        [stopCheck.reason, 'completed', new Date().toISOString(), dialogueId]
      );
    }

    return stopCheck;
  } catch (err) {
    console.error('Error checking dialogue stop:', err);
    throw err;
  }
}

/**
 * Update dialogue round count and status
 */
async function updateDialogueRound(dialogueId, newRoundCount) {
  try {
    await db.run(
      'UPDATE dialogues SET rounds_completed = ?, status = ? WHERE id = ?',
      [newRoundCount, 'in_progress', dialogueId]
    );
  } catch (err) {
    console.error('Error updating dialogue round:', err);
    throw err;
  }
}

/**
 * Submit dialogue rating and feedback
 */
async function submitDialogueFeedback(dialogueId, rating, whatWorked, comment, tags) {
  try {
    await db.run(
      `UPDATE dialogues SET user_rating = ?, user_comment = ? WHERE id = ?`,
      [rating, comment, dialogueId]
    );

    // Log activity
    await db.run(
      `INSERT INTO activity_log (id, action, action_text, created_at)
       VALUES (?, ?, ?, ?)`,
      [
        `fb_${crypto.randomBytes(8).toString('hex')}`,
        'dialogue_rated',
        `Dialogue rated ${rating} stars - ${whatWorked.join(', ')}`,
        new Date().toISOString()
      ]
    );

    return { id: dialogueId, rating, feedback: 'recorded' };
  } catch (err) {
    console.error('Error submitting dialogue feedback:', err);
    throw err;
  }
}

/**
 * Calculate quality score for dialogue
 * Based on: mode effectiveness, auto-stop conditions, turn quality
 */
function calculateQualityScore(dialogue) {
  let score = 50; // Base score

  // Bonus: Auto-stopped (goal achieved)
  if (dialogue.stop_reason && dialogue.stop_reason !== 'max_rounds_reached') {
    score += 20;
  }

  // Bonus: User rated highly
  if (dialogue.user_rating >= 4) {
    score += 15;
  }

  // Bonus: Healthy round count (not at max, not too short)
  if (dialogue.rounds_completed >= 2 && dialogue.rounds_completed < 4) {
    score += 15;
  }

  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Get dialogue summary (auto-generated)
 */
function generateSummary(dialogue, turns) {
  const summaries = {
    consensus: `Models reached agreement on the topic. ${dialogue.rounds_completed} rounds of discussion.`,
    adversarial: `Core weakness identified and discussed. ${dialogue.rounds_completed} rounds of critique.`,
    socratic: `Explored understanding progressively. ${dialogue.rounds_completed} rounds of questions.`,
    devils_advocate: `Idea refined through feedback cycles. ${dialogue.rounds_completed} iterations.`,
    synthesis: `Different perspectives integrated. ${dialogue.rounds_completed} rounds of synthesis.`
  };

  return summaries[dialogue.mode] || `Dialogue completed in ${dialogue.rounds_completed} rounds.`;
}

module.exports = {
  createDialogue,
  getDialogue,
  addTurn,
  handleDialogueAction,
  checkDialogueStop,
  updateDialogueRound,
  submitDialogueFeedback,
  calculateQualityScore,
  generateSummary
};
