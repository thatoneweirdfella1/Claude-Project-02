// Feedback Routes
// POST /feedback/routing - Thumbs-down on routing decision
// POST /feedback/techniques - Thumbs-down on technique selection
// POST /feedback/answer - Final answer rating and feedback

const express = require('express');
const router = express.Router();

const feedbackService = require('../../services/feedback-service');

/**
 * POST /api/v1/feedback/routing
 * Submit routing feedback (thumbs-down on model choice)
 */
router.post('/routing', async (req, res, next) => {
  try {
    const { questionId, routingRecommended, userRated, modelPreferred, comment } = req.body;

    if (!questionId || !routingRecommended) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'questionId and routingRecommended are required'
      });
    }

    const result = await feedbackService.submitRoutingFeedback(
      questionId,
      routingRecommended,
      userRated || 'thumbs-down',
      modelPreferred,
      comment
    );

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/feedback/techniques
 * Submit technique feedback (thumbs-down on technique selection)
 */
router.post('/techniques', async (req, res, next) => {
  try {
    const { questionId, techniquesSelected, userRated, techniquesPreferred, comment } = req.body;

    if (!questionId || !techniquesSelected || !Array.isArray(techniquesSelected)) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'questionId and techniquesSelected (array) are required'
      });
    }

    const result = await feedbackService.submitTechniqueFeedback(
      questionId,
      techniquesSelected,
      userRated || 'thumbs-down',
      techniquesPreferred,
      comment
    );

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/feedback/answer
 * Submit final answer rating and feedback
 */
router.post('/answer', async (req, res, next) => {
  try {
    const { questionId, answerId, rating, comment, details } = req.body;

    if (!questionId || !answerId || !rating) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'questionId, answerId, and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'rating must be between 1 and 5'
      });
    }

    const result = await feedbackService.submitAnswerFeedback(
      questionId,
      answerId,
      rating,
      comment || '',
      details
    );

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
