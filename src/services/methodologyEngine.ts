import type {
  ConversationMessage,
  HallucinationAudit,
  MethodologyPhase,
  MethodologyType,
} from "../stores/types";

/** ADHD Constraints discovered from 824-conversation analysis
 * Exported for documentation; incorporated into analyzeADHDCompliance() */
export const ADHD_CONSTRAINTS = {
  ZERO_PROCEDURAL_MEMORY: "User cannot retain multi-step procedures",
  COGNITIVE_SHUTDOWN: "Long explanations trigger shutdown",
  WORKING_MEMORY_LIMITS: "False choices cause loops",
  PRESSURE_FAILURE: "User fails under pressure/time constraints",
  LOOP_WITHOUT_CLOSURE: "Unresolved loops cause disengagement",
  DOPAMINE_DRIVEN: "Success depends on visible reward markers",
  CONTEXT_LOSS: "Context degrades on long sessions",
  VAGUE_INSTRUCTION_SENSITIVITY: "Ambiguous instructions cause paralysis",
  MULTIPLE_PATHS_PARALYSIS: "Multiple options trigger infinite calculation",
};

/** Communication Rules proven to work with ADHD users
 * Exported for documentation; incorporated into analyzeADHDCompliance() */
export const ADHD_COMMUNICATION_RULES = {
  DIRECTIVE_ONLY: "No 'if you want to' — direct commands only",
  EXTREME_BREVITY: "Max ~10 lines per response",
  NO_EXPLANATIONS: "Explain only when explicitly asked",
  NO_BRANCHING_PATHS: "Single chosen path, system decides not user",
  VISIBLE_PROGRESS: "Every response shows forward movement",
  LOCKED_PROBLEM: "Problem statement repeats at each phase",
  NO_OPTIONAL_STATEMENTS: "Every statement is required",
};

/** Failure modes to detect and prevent */
const FAILURE_MODES = {
  CLARIFICATION_QUESTIONS: "Triggers expansion and loops",
  OPTIONAL_STATEMENTS: "Triggers infinite calculation",
  LONG_EXPLANATIONS: "Triggers cognitive shutdown",
  BACK_AND_FORTH_LOOPS: "Triggers disengagement",
  GOAL_DRIFT: "Requires complete restart",
};

/** Phase transition rules for 3-state methodology */
const PHASE_TRANSITIONS: Record<
  MethodologyPhase,
  { description: string; messageThreshold: number; nextPhase: MethodologyPhase }
> = {
  define: {
    description: "Lock and define the problem",
    messageThreshold: 1,
    nextPhase: "test",
  },
  test: {
    description: "Validate approach with fact-checking and critique",
    messageThreshold: 3,
    nextPhase: "stabilize",
  },
  stabilize: {
    description: "Deliver final, audited result",
    messageThreshold: 2,
    nextPhase: "define",
  },
};

export interface PhaseDetectionResult {
  currentPhase: MethodologyPhase;
  readyForTransition: boolean;
  messagesInPhase: number;
  threshold: number;
}

export interface HallucinationCheckResult {
  totalClaims: number;
  verifiedClaims: number;
  unreliableClaims: number;
  confidence: number;
  audits: HallucinationAudit[];
}

export interface ADHDCommunicationAnalysis {
  complies: boolean;
  breaches: string[];
  briefnessScore: number;
  directiveScore: number;
  visibilityScore: number;
}

/**
 * Detect which phase a session should transition to based on message count
 */
export function detectPhaseTransition(
  currentPhase: MethodologyPhase,
  messageCount: number,
): PhaseDetectionResult {
  const phaseConfig = PHASE_TRANSITIONS[currentPhase];
  const readyForTransition = messageCount >= phaseConfig.messageThreshold;

  return {
    currentPhase,
    readyForTransition,
    messagesInPhase: messageCount,
    threshold: phaseConfig.messageThreshold,
  };
}

/**
 * Analyze a message for ADHD communication rule compliance
 */
export function analyzeADHDCompliance(message: string): ADHDCommunicationAnalysis {
  const lines = message.split("\n").filter((l) => l.trim().length > 0);
  const breaches: string[] = [];

  // Check briefness
  if (lines.length > 10) {
    breaches.push(FAILURE_MODES.LONG_EXPLANATIONS);
  }
  const briefnessScore = Math.max(0, Math.min(1, (10 - lines.length) / 10));

  // Check for clarification questions
  if (message.match(/\?(?:\s|$)/g)?.length ?? 0 > 1) {
    breaches.push(FAILURE_MODES.CLARIFICATION_QUESTIONS);
  }

  // Check for optional statements
  if (
    message.includes("if you want") ||
    message.includes("optionally") ||
    message.includes("you could") ||
    message.includes("may want to")
  ) {
    breaches.push(FAILURE_MODES.OPTIONAL_STATEMENTS);
  }

  // Check for directives vs suggestions
  const directivePatterns = /^(?:Do|Make|Create|Set|Run|Start|Stop|Change)/m;
  const directiveScore = (message.match(directivePatterns)?.length ?? 0) / Math.max(1, lines.length);

  // Check for visible progress markers
  const progressMarkers = message.match(/✓|→|Done|Complete|Next|Step/g) ?? [];
  const visibilityScore = Math.min(1, progressMarkers.length / Math.max(1, lines.length / 2));

  return {
    complies: breaches.length === 0,
    breaches,
    briefnessScore,
    directiveScore,
    visibilityScore,
  };
}

/**
 * Generate self-critique for TEST phase
 */
export function generateSelfCritique(
  answer: string,
  lockedProblem: string,
): { critique: string; confidence: number } {
  const compliance = analyzeADHDCompliance(answer);
  const issues: string[] = [];

  if (!compliance.complies) {
    issues.push(`Communication breaches: ${compliance.breaches.join(", ")}`);
  }

  if (compliance.briefnessScore < 0.7) {
    issues.push("Response may be too long for ADHD user");
  }

  if (compliance.directiveScore < 0.5) {
    issues.push("Insufficient directive language; too many suggestions");
  }

  if (compliance.visibilityScore < 0.5) {
    issues.push("Lacking visible progress markers");
  }

  // Check if answer stays focused on locked problem
  if (
    lockedProblem &&
    !answer.toLowerCase().includes(lockedProblem.toLowerCase().substring(0, 20))
  ) {
    issues.push("Response may have drifted from locked problem statement");
  }

  const critique =
    issues.length === 0
      ? "✓ Response adheres to ADHD communication rules"
      : `⚠ Issues detected:\n${issues.map((i) => `• ${i}`).join("\n")}`;

  const confidence = 1 - issues.length * 0.15;

  return {
    critique,
    confidence: Math.max(0.3, confidence),
  };
}

/**
 * Create hallucination audit entries from claims in a message
 */
export function extractClaimsForAudit(message: string): HallucinationAudit[] {
  const audits: HallucinationAudit[] = [];

  // Simple pattern: sentences with specific/numeric claims
  const sentencePattern = /[^.!?]+[.!?]+/g;
  const sentences = message.match(sentencePattern) || [];

  sentences
    .filter((s) => /[\d%$£€]|said|claimed|reported|found|showed|proved/i.test(s))
    .slice(0, 5)
    .forEach((sentence, idx) => {
      const text = sentence.trim();
      audits.push({
        claimId: `claim-${Date.now()}-${idx}`,
        text: text.substring(0, 100),
        confidence: 0.5, // Conservative default
        verified: false,
        notes: "Requires fact-checking",
      });
    });

  return audits;
}

/**
 * Get the prompt template for a specific phase
 */
export function getPhasePromptTemplate(phase: MethodologyPhase): string {
  const templates = {
    define: `Problem Definition Phase:
Lock the exact problem statement. No exploration yet.
State what needs solving.`,
    test: `Testing Phase:
Validate your approach. Fact-check claims.
Show your self-critique.`,
    stabilize: `Stabilization Phase:
Deliver the final, audited result.
No reversals or caveats.`,
  };

  return templates[phase];
}

/**
 * Check if a session should auto-advance methodology phases
 */
export function checkPhaseAutoAdvance(
  currentPhase: MethodologyPhase,
  messages: ConversationMessage[],
  methodology: MethodologyType,
): { shouldAdvance: boolean; nextPhase?: MethodologyPhase } {
  if (methodology !== "3-state") {
    return { shouldAdvance: false };
  }

  // Count messages just in this phase (after the last explicit phase set)
  const phaseConfig = PHASE_TRANSITIONS[currentPhase];
  const recentMessages = messages.slice(-phaseConfig.messageThreshold);
  const aiMessages = recentMessages.filter((m) => m.role === "assistant");

  if (aiMessages.length >= phaseConfig.messageThreshold) {
    return {
      shouldAdvance: true,
      nextPhase: phaseConfig.nextPhase,
    };
  }

  return { shouldAdvance: false };
}

/**
 * Apply ADHD rules to generated output before sending
 */
export function applyADHDRules(output: string): string {
  // Truncate if too long
  const lines = output.split("\n");
  if (lines.length > 10) {
    return lines.slice(0, 10).join("\n") + "\n[truncated for ADHD clarity]";
  }

  // Ensure directives, no suggestions
  let refined = output
    .replace(/you (could|may|might) want to/gi, "")
    .replace(/if you want to,? ?/gi, "");

  // Ensure at least one progress marker
  if (!refined.match(/✓|→|Done|Complete|Next|Step/)) {
    refined = "✓ " + refined;
  }

  return refined;
}
