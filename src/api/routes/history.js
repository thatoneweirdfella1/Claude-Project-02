// History Routes
// GET /history - List questions/answers with search and filters
// GET /history/dialogues - List dialogues
// POST /history/export - Export dialogue

const express = require('express');
const router = express.Router();
const db = require('../../database/init');

/**
 * GET /api/v1/history
 * List user's question history with filters and search
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      search,
      filter_model,
      filter_rating,
      filter_date_from,
      filter_date_to,
      filter_type,
      sort_by = 'recency',
      limit = 20,
      offset = 0
    } = req.query;

    let query = `
      SELECT q.id, q.text, a.model_used, f.rating, q.created_at
      FROM questions q
      LEFT JOIN answers a ON q.id = a.question_id
      LEFT JOIN feedback f ON a.id = f.answer_id
      WHERE 1=1
    `;
    let params = [];

    // Search
    if (search) {
      query += ` AND (q.text LIKE ? OR a.content LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Filters
    if (filter_model) {
      query += ` AND a.model_used = ?`;
      params.push(filter_model);
    }

    if (filter_rating) {
      query += ` AND f.rating = ?`;
      params.push(parseInt(filter_rating));
    }

    if (filter_date_from) {
      query += ` AND q.created_at >= ?`;
      params.push(filter_date_from);
    }

    if (filter_date_to) {
      query += ` AND q.created_at <= ?`;
      params.push(filter_date_to);
    }

    // Sort
    switch (sort_by) {
      case 'rating':
        query += ` ORDER BY f.rating DESC`;
        break;
      case 'usefulness':
        query += ` ORDER BY f.rating DESC, q.created_at DESC`;
        break;
      case 'recency':
      default:
        query += ` ORDER BY q.created_at DESC`;
    }

    // Pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const items = await db.all(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as count FROM questions q`;
    let countParams = [];

    if (search) {
      countQuery += ` WHERE q.text LIKE ?`;
      countParams.push(`%${search}%`);
    }

    const countResult = await db.get(countQuery, countParams);

    res.json({
      items,
      total: countResult.count,
      limit: parseInt(limit),
      offset: parseInt(offset),
      has_more: (parseInt(offset) + parseInt(limit)) < countResult.count
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/history/dialogues
 * List user's dialogue history
 */
router.get('/dialogues', async (req, res, next) => {
  try {
    const {
      search,
      filter_goal,
      filter_mode,
      filter_rating,
      sort_by = 'recency',
      limit = 20,
      offset = 0
    } = req.query;

    let query = `
      SELECT id, goal, mode, model_a, model_b, user_rating, created_at, rounds_completed
      FROM dialogues
      WHERE 1=1
    `;
    let params = [];

    // Filters
    if (filter_goal) {
      query += ` AND goal = ?`;
      params.push(filter_goal);
    }

    if (filter_mode) {
      query += ` AND mode = ?`;
      params.push(filter_mode);
    }

    if (filter_rating) {
      query += ` AND user_rating = ?`;
      params.push(parseInt(filter_rating));
    }

    // Sort
    if (sort_by === 'rating') {
      query += ` ORDER BY user_rating DESC`;
    } else {
      query += ` ORDER BY created_at DESC`;
    }

    // Pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const dialogues = await db.all(query, params);

    res.json({
      dialogues,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/history/export
 * Export dialogue or question in specified format
 */
router.post('/export', async (req, res, next) => {
  try {
    const { dialogueId, format = 'markdown' } = req.body;

    if (!dialogueId) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'dialogueId is required'
      });
    }

    // Get dialogue
    const db_instance = require('../../database/init');
    const dialogue = await db_instance.get(
      'SELECT * FROM dialogues WHERE id = ?',
      [dialogueId]
    );

    if (!dialogue) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: `Dialogue ${dialogueId} not found`
      });
    }

    // Get turns
    const turns = await db_instance.all(
      'SELECT * FROM dialogue_turns WHERE dialogue_id = ? ORDER BY round, created_at',
      [dialogueId]
    );

    // Format based on request
    let content = '';
    let filename = `dialogue_${dialogueId}`;

    if (format === 'markdown') {
      content = `# Multi-AI Dialogue\n\n`;
      content += `**Goal:** ${dialogue.goal}\n`;
      content += `**Mode:** ${dialogue.mode}\n\n`;

      turns.forEach(turn => {
        content += `### ${turn.speaker} (${turn.model_used})\n\n`;
        content += `${turn.content}\n\n`;
      });

      filename += '.md';
    } else if (format === 'text') {
      turns.forEach(turn => {
        content += `${turn.speaker.toUpperCase()} (${turn.model_used}):\n`;
        content += `${turn.content}\n\n`;
      });

      filename += '.txt';
    }

    res.json({
      format,
      content,
      filename
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
