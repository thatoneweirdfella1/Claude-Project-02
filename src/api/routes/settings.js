// Settings Routes
// GET /settings - Get user settings
// POST /settings - Update settings
// GET /settings/milestones - Get feature unlock progress

const express = require('express');
const router = express.Router();
const db = require('../../database/init');

/**
 * GET /api/v1/settings
 * Get user's current settings
 */
router.get('/', async (req, res, next) => {
  try {
    // In production, fetch from user's settings record
    // For now, return defaults
    const settings = {
      default_model: 'opus-fast',
      transparency_level: 'normal',
      feedback_style: 'explicit',
      technique_limits: {
        haiku: 6,
        opus_fast: 9,
        opus_thinking: 6
      },
      quiet_mode: false,
      focus_mode: false,
      adhd_mode_enabled: false,
      adhd_mode_settings: {
        high_contrast: false,
        reduce_animations: false,
        plain_language: false,
        large_text: false,
        hide_advanced_buttons: false
      },
      output_format_default: 'prose',
      emotional_normalization: true,
      markdown_export_default: true,
      updated_at: new Date().toISOString()
    };

    res.json(settings);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/settings
 * Update user settings
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      default_model,
      transparency_level,
      quiet_mode,
      adhd_mode_settings,
      feedback_style,
      technique_limits,
      output_format_default
    } = req.body;

    // In production, save to database
    // For now, just echo back with updated timestamp

    const updatedSettings = {
      default_model: default_model || 'opus-fast',
      transparency_level: transparency_level || 'normal',
      quiet_mode: quiet_mode !== undefined ? quiet_mode : false,
      adhd_mode_enabled: adhd_mode_settings ? Object.values(adhd_mode_settings).some(v => v) : false,
      adhd_mode_settings: adhd_mode_settings || {},
      feedback_style: feedback_style || 'explicit',
      technique_limits: technique_limits || { haiku: 6, opus_fast: 9, opus_thinking: 6 },
      output_format_default: output_format_default || 'prose',
      updated_at: new Date().toISOString()
    };

    res.json(updatedSettings);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/settings/milestones
 * Get feature unlock progress
 */
router.get('/milestones', async (req, res, next) => {
  try {
    // Get total questions asked
    const questionCount = await db.get(
      'SELECT COUNT(*) as count FROM questions'
    );

    const totalQuestions = questionCount?.count || 0;

    const milestones = [
      {
        id: 1,
        threshold: 0,
        name: 'Day 1 (First Use)',
        unlocked: totalQuestions >= 0,
        unlocked_at: totalQuestions >= 0 ? new Date().toISOString() : null,
        features: ['basic_mode', '5star_feedback']
      },
      {
        id: 2,
        threshold: 10,
        name: 'After 10 Questions',
        unlocked: totalQuestions >= 10,
        unlocked_at: totalQuestions >= 10 ? new Date().toISOString() : null,
        features: ['technique_visibility', 'custom_multi_ai_goals', 'history_screen']
      },
      {
        id: 3,
        threshold: 25,
        name: 'After 25 Questions',
        unlocked: totalQuestions >= 25,
        unlocked_at: totalQuestions >= 25 ? new Date().toISOString() : null,
        features: ['advanced_routing', 'template_library', 'patterns_tab']
      },
      {
        id: 4,
        threshold: 50,
        name: 'After 50 Questions',
        unlocked: totalQuestions >= 50,
        unlocked_at: totalQuestions >= 50 ? new Date().toISOString() : null,
        features: ['dialogue_branching', 'focus_mode', 'custom_technique_stacks']
      },
      {
        id: 5,
        threshold: 100,
        name: 'After 100 Questions',
        unlocked: totalQuestions >= 100,
        unlocked_at: totalQuestions >= 100 ? new Date().toISOString() : null,
        features: ['account_management', 'custom_dialogue_modes', 'analytics_dashboard']
      }
    ];

    // Find current milestone
    let currentMilestone = 1;
    for (const m of milestones) {
      if (totalQuestions >= m.threshold) {
        currentMilestone = m.id;
      }
    }

    // Calculate progress to next
    const nextMilestone = milestones.find(m => m.threshold > totalQuestions);
    const progressToNext = nextMilestone ? nextMilestone.threshold - totalQuestions : 0;

    res.json({
      current_milestone: currentMilestone,
      milestones,
      questions_asked: totalQuestions,
      progress_to_next: progressToNext
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
