// Dialogue Mode Configuration & Auto-Stop Detectors
// 5 core dialogue modes with system prompts and auto-stop logic

const db = require('../database/init');

/**
 * DIALOGUE MODES CONFIGURATION
 * Each mode has: system prompt template, max rounds, auto-stop detection
 */
const DIALOGUE_MODES = {
  consensus: {
    id: 'consensus',
    name: 'Consensus Mode',
    description: 'Both models find agreement',
    goal: 'debate',
    systemPromptTemplate: (userInput) => `You are in a consensus-building dialogue.

Your role: Find areas of agreement with the other model.

The user asked: "${userInput}"

Guidelines:
1. Listen actively to the other model's points
2. Acknowledge valid arguments
3. Build toward mutual understanding
4. Use phrases like: "I agree that...", "That's a fair point...", "I concede that..."
5. Aim for consensus, not winning the argument`,
    maxRounds: 4,
    autoStopKeywords: [
      'agree', 'fair point', 'concede', 'i see your point',
      'you\'re right', 'i agree', 'that makes sense', 'agreed'
    ],
    stopDetectionLogic: 'keywords' // Both models say agree-like keywords
  },

  adversarial: {
    id: 'adversarial',
    name: 'Adversarial Mode',
    description: 'Stress-test the idea, find flaws',
    goal: 'solid_answer',
    systemPromptTemplate: (userInput) => `You are in an adversarial dialogue designed to find weaknesses.

Your role: Challenge and critique the other model's arguments rigorously.

The user asked: "${userInput}"

Guidelines:
1. Attack the core assumptions
2. Find logical inconsistencies
3. Challenge evidence quality
4. Propose counter-examples
5. Push for better reasoning
6. Use phrases like: "But what about...", "That assumes...", "The core issue is..."`,
    maxRounds: 5,
    autoStopKeywords: [
      'core weakness', 'fundamental flaw', 'i concede the point',
      'that\'s a valid flaw', 'you found the weakness', 'critical issue'
    ],
    stopDetectionLogic: 'keywords' // Both acknowledge flaw/weakness
  },

  socratic: {
    id: 'socratic',
    name: 'Socratic Mode',
    description: 'Explore through questions, build understanding',
    goal: 'understand',
    systemPromptTemplate: (userInput) => `You are in a Socratic dialogue focused on understanding.

Your role: Ask probing questions to deepen understanding.

The user asked: "${userInput}"

Guidelines:
1. Ask clarifying questions
2. Explore assumptions
3. Build knowledge progressively
4. Use open-ended questions
5. Help user discover insights
6. Reflect back what you hear
7. Use phrases like: "What do you mean by...", "Have you considered...", "How would you..."`,
    maxRounds: 3,
    autoStopKeywords: [
      'now i see', 'that\'s insightful', 'deeper understanding',
      'much clearer', 'learned that', 'hadn\'t considered'
    ],
    stopDetectionLogic: 'meta_understanding' // Evidence of deeper understanding
  },

  devils_advocate: {
    id: 'devils_advocate',
    name: 'Devil\'s Advocate Mode',
    description: 'Critique and refine the idea',
    goal: 'improve_idea',
    systemPromptTemplate: (userInput) => `You are in a Devil's Advocate dialogue to improve an idea.

Your role: Play devil's advocate to strengthen the proposal.

The user's idea: "${userInput}"

Guidelines:
1. Point out gaps and weaknesses
2. Suggest refinements
3. Challenge the assumptions
4. Propose stronger versions
5. Help evolve the idea
6. Be constructive while critical
7. Use phrases like: "Consider adding...", "What if...", "A stronger version would..."`,
    maxRounds: 4,
    autoStopKeywords: [
      'refined proposal', 'stronger version', 'improved upon',
      'iteration complete', 'better approach', 'incorporated feedback'
    ],
    stopDetectionLogic: 'proposal_refined' // Evidence of iteration/refinement
  },

  synthesis: {
    id: 'synthesis',
    name: 'Synthesis Mode',
    description: 'Combine different perspectives',
    goal: 'decision',
    systemPromptTemplate: (userInput) => `You are in a Synthesis dialogue to combine perspectives.

Your role: Integrate insights from different viewpoints.

The user asked: "${userInput}"

Guidelines:
1. Take best points from each perspective
2. Identify underlying agreements
3. Create integrated view
4. Build comprehensive understanding
5. Show how views complement each other
6. Use phrases like: "Combining these...", "Integrating...", "Both perspectives suggest..."`,
    maxRounds: 3,
    autoStopKeywords: [
      'synthesis', 'combines', 'integrates', 'comprehensive view',
      'brings together', 'unified perspective', 'both perspectives'
    ],
    stopDetectionLogic: 'synthesis_complete' // Evidence of integration
  }
};

/**
 * Get mode configuration
 */
function getMode(modeId) {
  const mode = DIALOGUE_MODES[modeId];
  if (!mode) {
    throw new Error(`Unknown dialogue mode: ${modeId}`);
  }
  return mode;
}

/**
 * Get all modes
 */
function getAllModes() {
  return Object.values(DIALOGUE_MODES);
}

/**
 * Map goal to recommended mode(s)
 */
function goalToModes(goal) {
  const goalModeMap = {
    solid_answer: { primary: 'adversarial', alternatives: ['devils_advocate'] },
    understand: { primary: 'socratic', alternatives: ['synthesis'] },
    improve_idea: { primary: 'devils_advocate', alternatives: ['synthesis'] },
    decision: { primary: 'synthesis', alternatives: ['socratic', 'consensus'] },
    debate: { primary: 'consensus', alternatives: ['adversarial', 'synthesis'] }
  };

  if (!goalModeMap[goal]) {
    throw new Error(`Unknown goal: ${goal}`);
  }

  return goalModeMap[goal];
}

/**
 * CONSENSUS AUTO-STOP DETECTION
 * Detects when both models agree
 */
function detectConsensusStop(turn1Content, turn2Content) {
  const keywords = DIALOGUE_MODES.consensus.autoStopKeywords;
  const turn1HasKeyword = keywords.some(kw => turn1Content.toLowerCase().includes(kw));
  const turn2HasKeyword = keywords.some(kw => turn2Content.toLowerCase().includes(kw));

  return turn1HasKeyword && turn2HasKeyword ? 'consensus_reached' : null;
}

/**
 * ADVERSARIAL AUTO-STOP DETECTION
 * Detects when weakness/flaw is found and acknowledged
 */
function detectAdversarialStop(turn1Content, turn2Content) {
  const keywords = DIALOGUE_MODES.adversarial.autoStopKeywords;
  const turn1HasKeyword = keywords.some(kw => turn1Content.toLowerCase().includes(kw));
  const turn2HasKeyword = keywords.some(kw => turn2Content.toLowerCase().includes(kw));

  // At least one should find weakness, other should acknowledge
  return (turn1HasKeyword || turn2HasKeyword) ? 'weakness_found' : null;
}

/**
 * SOCRATIC AUTO-STOP DETECTION
 * Detects increased understanding (longer responses, meta-commentary, specificity)
 */
function detectSocraticStop(turn1Content, turn2Content, previousTurns = []) {
  // Look for evidence of understanding
  const understandingKeywords = ['now i see', 'deeper', 'learned', 'understand', 'insight'];
  const hasUnderstanding = understandingKeywords.some(kw =>
    turn1Content.toLowerCase().includes(kw) ||
    turn2Content.toLowerCase().includes(kw)
  );

  // Check for increased specificity/length
  const avgPreviousLength = previousTurns.length > 0
    ? previousTurns.reduce((sum, t) => sum + t.content.length, 0) / previousTurns.length
    : 0;
  const currentAvgLength = (turn1Content.length + turn2Content.length) / 2;
  const getsMoreSpecific = currentAvgLength > avgPreviousLength * 1.2;

  return (hasUnderstanding || getsMoreSpecific) ? 'understanding_achieved' : null;
}

/**
 * DEVIL'S ADVOCATE AUTO-STOP DETECTION
 * Detects proposal refinement (iteration keywords, length increase)
 */
function detectDevilsAdvocateStop(turn1Content, turn2Content, previousTurns = []) {
  const refinementKeywords = [
    'refined', 'improved', 'strengthened', 'revised', 'adjusted',
    'incorporating feedback', 'iteration', 'better approach'
  ];
  const hasRefinement = refinementKeywords.some(kw =>
    turn1Content.toLowerCase().includes(kw) ||
    turn2Content.toLowerCase().includes(kw)
  );

  // Check for length increase (more detailed proposal)
  const avgPreviousLength = previousTurns.length > 0
    ? previousTurns.reduce((sum, t) => sum + t.content.length, 0) / previousTurns.length
    : 0;
  const currentAvgLength = (turn1Content.length + turn2Content.length) / 2;
  const getsMoreDetailed = currentAvgLength > avgPreviousLength * 1.3;

  return (hasRefinement || getsMoreDetailed) ? 'proposal_refined' : null;
}

/**
 * SYNTHESIS AUTO-STOP DETECTION
 * Detects integration/synthesis keywords
 */
function detectSynthesisStop(turn1Content, turn2Content) {
  const keywords = DIALOGUE_MODES.synthesis.autoStopKeywords;
  const turn1HasKeyword = keywords.some(kw => turn1Content.toLowerCase().includes(kw));
  const turn2HasKeyword = keywords.some(kw => turn2Content.toLowerCase().includes(kw));

  return (turn1HasKeyword || turn2HasKeyword) ? 'synthesis_complete' : null;
}

/**
 * CHECK IF DIALOGUE SHOULD AUTO-STOP
 * Returns: { shouldStop: boolean, reason: string }
 */
function checkAutoStop(modeId, round, turn1, turn2, allPreviousTurns = []) {
  const mode = getMode(modeId);

  // Hard max rounds enforced
  if (round >= mode.maxRounds) {
    return { shouldStop: true, reason: 'max_rounds_reached' };
  }

  // Check mode-specific auto-stop conditions
  let stopReason = null;

  switch (modeId) {
    case 'consensus':
      stopReason = detectConsensusStop(turn1, turn2);
      break;
    case 'adversarial':
      stopReason = detectAdversarialStop(turn1, turn2);
      break;
    case 'socratic':
      stopReason = detectSocraticStop(turn1, turn2, allPreviousTurns);
      break;
    case 'devils_advocate':
      stopReason = detectDevilsAdvocateStop(turn1, turn2, allPreviousTurns);
      break;
    case 'synthesis':
      stopReason = detectSynthesisStop(turn1, turn2);
      break;
  }

  return {
    shouldStop: stopReason !== null,
    reason: stopReason || 'continuing'
  };
}

module.exports = {
  DIALOGUE_MODES,
  getMode,
  getAllModes,
  goalToModes,
  checkAutoStop,
  detectConsensusStop,
  detectAdversarialStop,
  detectSocraticStop,
  detectDevilsAdvocateStop,
  detectSynthesisStop
};
