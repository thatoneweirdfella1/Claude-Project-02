// Feedback Collection & Learning Integration
// Handles routing, technique, and final answer feedback

const db = require('../database/init');
const crypto = require('crypto');

/**
 * Submit routing feedback (thumbs-down on model choice)
 */
async function submitRoutingFeedback(questionId, routingRecommended, userRated, modelPreferred = null, comment = null) {
  try {
    const feedbackId = `fb_routing_${crypto.randomBytes(8).toString('hex')}`;

    await db.run(
      `INSERT INTO granular_feedback (id, question_id, feedback_type, value, routing_recommended, routing_correct, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        feedbackId,
        questionId,
        'routing',
        userRated, // thumbs-down value
        routingRecommended,
        modelPreferred,
        new Date().toISOString()
      ]
    );

    console.log(`✓ Routing feedback recorded: ${questionId} - ${userRated}`);

    // Trigger pattern detection
    await detectPatterns('routing', questionId, routingRecommended);

    return { id: feedbackId, type: 'routing', recorded: true };
  } catch (err) {
    console.error('Error submitting routing feedback:', err);
    throw err;
  }
}

/**
 * Submit technique feedback (thumbs-down on technique selection)
 */
async function submitTechniqueFeedback(questionId, techniquesSelected, userRated, techniquesPreferred = null, comment = null) {
  try {
    const feedbackId = `fb_technique_${crypto.randomBytes(8).toString('hex')}`;

    await db.run(
      `INSERT INTO granular_feedback (id, question_id, feedback_type, value, techniques_selected, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        feedbackId,
        questionId,
        'technique',
        userRated, // thumbs-down value
        JSON.stringify(techniquesSelected),
        new Date().toISOString()
      ]
    );

    console.log(`✓ Technique feedback recorded: ${questionId} - ${techniquesSelected.join(', ')}`);

    // Trigger pattern detection
    await detectPatterns('technique', questionId, techniquesSelected);

    return { id: feedbackId, type: 'technique', recorded: true };
  } catch (err) {
    console.error('Error submitting technique feedback:', err);
    throw err;
  }
}

/**
 * Submit final answer feedback (5-star rating + optional details)
 */
async function submitAnswerFeedback(questionId, answerId, rating, comment, details = null) {
  try {
    const feedbackId = `fb_answer_${crypto.randomBytes(8).toString('hex')}`;

    await db.run(
      `INSERT INTO feedback (id, question_id, answer_id, rating, comment, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        feedbackId,
        questionId,
        answerId,
        rating,
        comment,
        new Date().toISOString()
      ]
    );

    console.log(`✓ Answer feedback recorded: ${questionId} - ${rating} stars`);

    // Log activity
    await db.run(
      `INSERT INTO activity_log (id, action, action_text, created_at)
       VALUES (?, ?, ?, ?)`,
      [
        `log_${crypto.randomBytes(8).toString('hex')}`,
        'answer_rated',
        `Question answered and rated ${rating} stars`,
        new Date().toISOString()
      ]
    );

    return { id: feedbackId, type: 'answer', rating, recorded: true };
  } catch (err) {
    console.error('Error submitting answer feedback:', err);
    throw err;
  }
}

/**
 * PATTERN DETECTION: Run after feedback collected
 * Threshold: 10+ feedback points of same type for same question_type
 */
async function detectPatterns(feedbackType, questionId, feedbackValue) {
  try {
    // Get question details
    const question = await db.get(
      'SELECT * FROM questions WHERE id = ?',
      [questionId]
    );

    if (!question) return; // Question not found

    // For routing feedback: track by model
    if (feedbackType === 'routing') {
      const routingFeedback = await db.all(
        `SELECT COUNT(*) as count FROM granular_feedback
         WHERE feedback_type = 'routing' AND routing_recommended = ?`,
        [feedbackValue]
      );

      const thumbsDownCount = routingFeedback[0]?.count || 0;

      // If 10+ thumbs-down for same model on similar questions
      if (thumbsDownCount >= 10) {
        const existingPattern = await db.get(
          `SELECT * FROM patterns WHERE pattern_type = 'routing_preference' AND pattern_text LIKE ?`,
          [`%${feedbackValue}%`]
        );

        if (!existingPattern) {
          const patternId = `p_${crypto.randomBytes(8).toString('hex')}`;
          const confidence = Math.min(thumbsDownCount / 20, 1.0); // 0-1 scale

          await db.run(
            `INSERT INTO patterns (id, pattern_type, pattern_text, confidence, data_points, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              patternId,
              'routing_preference',
              `Users prefer different model than ${feedbackValue} (${thumbsDownCount} negatives)`,
              confidence,
              thumbsDownCount,
              new Date().toISOString()
            ]
          );

          console.log(`✓ Pattern detected: routing_preference for ${feedbackValue}`);
        }
      }
    }

    // For technique feedback: track conflicts
    if (feedbackType === 'technique') {
      const techniqueStr = JSON.stringify(feedbackValue);
      const techniqueFeedback = await db.all(
        `SELECT COUNT(*) as count FROM granular_feedback
         WHERE feedback_type = 'technique' AND techniques_selected = ?`,
        [techniqueStr]
      );

      const thumbsDownCount = techniqueFeedback[0]?.count || 0;

      if (thumbsDownCount >= 10) {
        const existingPattern = await db.get(
          `SELECT * FROM patterns WHERE pattern_type = 'technique_effectiveness' AND pattern_text LIKE ?`,
          [`%${feedbackValue[0]}%`]
        );

        if (!existingPattern) {
          const patternId = `p_${crypto.randomBytes(8).toString('hex')}`;
          const confidence = Math.min(thumbsDownCount / 20, 1.0);

          await db.run(
            `INSERT INTO patterns (id, pattern_type, pattern_text, confidence, data_points, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              patternId,
              'technique_effectiveness',
              `Technique combination ${feedbackValue.join(', ')} conflicts (${thumbsDownCount} negatives)`,
              confidence,
              thumbsDownCount,
              new Date().toISOString()
            ]
          );

          console.log(`✓ Pattern detected: technique_effectiveness for ${feedbackValue}`);
        }
      }
    }
  } catch (err) {
    console.error('Error detecting patterns:', err);
    // Don't throw - pattern detection is secondary
  }
}

/**
 * Get all patterns
 */
async function getPatterns(patternType = null) {
  try {
    let query = 'SELECT * FROM patterns';
    let params = [];

    if (patternType) {
      query += ' WHERE pattern_type = ?';
      params = [patternType];
    }

    query += ' ORDER BY confidence DESC, updated_at DESC';

    const patterns = await db.all(query, params);
    return patterns;
  } catch (err) {
    console.error('Error fetching patterns:', err);
    throw err;
  }
}

/**
 * User accepts or dismisses pattern suggestion
 */
async function handlePatternAction(patternId, action, reason = null) {
  try {
    if (action === 'apply') {
      // Update pattern to applied
      await db.run(
        'UPDATE patterns SET applied = 1, updated_at = ? WHERE id = ?',
        [new Date().toISOString(), patternId]
      );
      console.log(`✓ Pattern applied: ${patternId}`);
    } else if (action === 'dismiss') {
      // Mark as dismissed
      await db.run(
        'UPDATE patterns SET dismissed = 1, updated_at = ? WHERE id = ?',
        [new Date().toISOString(), patternId]
      );
      console.log(`✓ Pattern dismissed: ${patternId}`);
    }

    return { id: patternId, action, handled: true };
  } catch (err) {
    console.error('Error handling pattern action:', err);
    throw err;
  }
}

/**
 * Correlate all feedback for question
 * Links routing FB + technique FB + final rating
 */
async function correlateQuestionFeedback(questionId) {
  try {
    const routingFb = await db.get(
      'SELECT * FROM granular_feedback WHERE question_id = ? AND feedback_type = "routing"',
      [questionId]
    );

    const techniqueFb = await db.get(
      'SELECT * FROM granular_feedback WHERE question_id = ? AND feedback_type = "technique"',
      [questionId]
    );

    const answerFb = await db.get(
      'SELECT * FROM feedback WHERE question_id = ?',
      [questionId]
    );

    return {
      questionId,
      routingFeedback: routingFb || null,
      techniqueFeedback: techniqueFb || null,
      answerFeedback: answerFb || null,
      correlationComplete: true
    };
  } catch (err) {
    console.error('Error correlating feedback:', err);
    throw err;
  }
}

/**
 * Get quarterly pattern summary
 */
async function getQuarterlyPatternSummary(quarter = null) {
  try {
    if (!quarter) {
      const now = new Date();
      const q = Math.ceil((now.getMonth() + 1) / 3);
      quarter = `Q${q}-${now.getFullYear()}`;
    }

    const patterns = await getPatterns();
    const activities = await db.all(
      `SELECT COUNT(*) as count FROM activity_log WHERE action = 'question_asked' AND strftime('%Y', created_at) = ? AND strftime('%q', created_at) = ?`,
      [quarter.slice(-4), quarter[1]]
    );

    const summary = {
      quarter,
      totalQuestions: activities[0]?.count || 0,
      patternsDetected: patterns.length,
      topPatterns: patterns.slice(0, 5),
      timestamp: new Date().toISOString()
    };

    return summary;
  } catch (err) {
    console.error('Error generating pattern summary:', err);
    throw err;
  }
}

module.exports = {
  submitRoutingFeedback,
  submitTechniqueFeedback,
  submitAnswerFeedback,
  detectPatterns,
  getPatterns,
  handlePatternAction,
  correlateQuestionFeedback,
  getQuarterlyPatternSummary
};
