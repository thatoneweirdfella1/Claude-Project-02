import type {
  CustomerPersonalizationProfile,
  LearnedPreferences,
  OptimizationEvidenceRef,
  OptimizationGoalId,
  OptimizationRun,
  Rating,
  SessionRecord,
} from "../../stores/types";
import {
  getCustomerOptimizerCategory,
  isOptimizationGoalId,
} from "./customerOptimizerRegistry";

const MAX_EVIDENCE_PER_CATEGORY = 16;
const MAX_EVIDENCE_TOTAL = 100;
const EXCERPT_LIMIT = 360;
const CONTEXT_LIMIT = 520;

function compact(value: string, limit: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, limit);
}

function hashText(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export function emptyCustomerPersonalizationProfile(): CustomerPersonalizationProfile {
  return {
    schemaVersion: 1,
    version: 0,
    rules: {},
    ui: {},
    processedSessionHashes: {},
    updatedAt: null,
  };
}

export function cloneLearnedPreferences(value: LearnedPreferences): LearnedPreferences {
  const personalization = value.personalization;
  return {
    routing: { ...value.routing },
    technique: Object.fromEntries(
      Object.entries(value.technique).map(([key, preference]) => [key, { ...preference }]),
    ),
    ...(personalization
      ? {
          personalization: {
            schemaVersion: 1,
            version: personalization.version,
            rules: Object.fromEntries(
              Object.entries(personalization.rules).map(([categoryId, rules]) => [
                categoryId,
                rules?.map((rule) => ({
                  ...rule,
                  datasetIds: [...rule.datasetIds],
                  contexts: [...rule.contexts],
                  exclusions: [...rule.exclusions],
                  evidenceIds: [...rule.evidenceIds],
                  counterEvidenceIds: [...rule.counterEvidenceIds],
                })),
              ]),
            ) as CustomerPersonalizationProfile["rules"],
            ui: { ...personalization.ui },
            processedSessionHashes: Object.fromEntries(
              Object.entries(personalization.processedSessionHashes).map(([categoryId, hashes]) => [
                categoryId,
                { ...hashes },
              ]),
            ) as CustomerPersonalizationProfile["processedSessionHashes"],
            updatedAt: personalization.updatedAt,
          },
        }
      : {}),
  };
}

function ratingsForSession(session: SessionRecord, ratings: Rating[]): Rating[] {
  const messageIds = new Set(session.conversation.map((message) => message.id));
  return ratings
    .filter((rating) => rating.sessionId === session.id || messageIds.has(rating.messageId))
    .sort((left, right) => left.messageId.localeCompare(right.messageId));
}

function sessionFingerprint(session: SessionRecord, ratings: Rating[]): string {
  const conversation = session.conversation.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp,
    ratingStars: message.ratingStars,
    ratingComment: message.ratingComment,
  }));
  const feedback = ratingsForSession(session, ratings).map((rating) => ({
    messageId: rating.messageId,
    stars: rating.stars,
    comment: rating.comment ?? "",
    timestamp: rating.timestamp,
  }));
  return hashText(JSON.stringify({ conversation, feedback }));
}

function looksExplicit(value: string): boolean {
  return /\b(?:i (?:prefer|need|want|like)|please (?:always|never|keep|use|give|show|stop)|always|never|do not|don['’]?t|stop|keep (?:it|this|responses?)|give me|one thing at a time|too much|too long|too short|not what i asked|that['’]?s not what)\b/i.test(value);
}

function contextAt(session: SessionRecord, index: number, offset: -1 | 1): string | undefined {
  const message = session.conversation[index + offset];
  if (!message) return undefined;
  return compact(`${message.role}: ${message.content}`, CONTEXT_LIMIT);
}

function feedbackForMessage(
  session: SessionRecord,
  messageId: string,
  ratings: Rating[],
): { stars?: number; comment?: string } {
  const stored = ratingsForSession(session, ratings).find((rating) => rating.messageId === messageId);
  const message = session.conversation.find((item) => item.id === messageId);
  return {
    stars: stored?.stars ?? message?.ratingStars,
    comment: stored?.comment ?? message?.ratingComment,
  };
}

function observedOutcomeAt(session: SessionRecord, index: number, ratings: Rating[]): string | undefined {
  const center = session.conversation[index];
  const nextAssistantIndex = center.role === "assistant"
    ? index
    : session.conversation.findIndex((message, candidateIndex) => candidateIndex > index && message.role === "assistant");
  const parts: string[] = [];
  if (nextAssistantIndex >= 0) {
    const assistant = session.conversation[nextAssistantIndex];
    const feedback = feedbackForMessage(session, assistant.id, ratings);
    if (feedback.stars !== undefined) parts.push(`Customer rating: ${feedback.stars}/5.`);
    if (feedback.comment) parts.push(`Customer feedback: ${compact(feedback.comment, 240)}`);
    const nextUser = session.conversation.find(
      (message, candidateIndex) => candidateIndex > nextAssistantIndex && message.role === "user",
    );
    if (nextUser) parts.push(`Next customer response: ${compact(nextUser.content, 240)}`);
  }
  return parts.length > 0 ? compact(parts.join(" "), CONTEXT_LIMIT) : undefined;
}

function evidenceForCategory(
  session: SessionRecord,
  categoryId: OptimizationGoalId,
  ratings: Rating[],
): OptimizationEvidenceRef[] {
  const category = getCustomerOptimizerCategory(categoryId);
  const datasetIds = category.datasets.map((dataset) => dataset.id);
  const found = new Map<string, OptimizationEvidenceRef>();

  session.conversation.forEach((message, messageIndex) => {
    if (message.role !== "user") return;
    if (!category.candidatePatterns.some((pattern) => pattern.test(message.content))) return;
    const id = `${categoryId}:${session.id}:${message.id}:statement`;
    found.set(id, {
      id,
      categoryId,
      datasetIds,
      sessionId: session.id,
      messageId: message.id,
      messageIndex,
      role: message.role,
      timestamp: message.timestamp,
      excerpt: compact(message.content, EXCERPT_LIMIT),
      signal: `${category.label}: candidate customer statement`,
      contextBefore: contextAt(session, messageIndex, -1),
      contextAfter: contextAt(session, messageIndex, 1),
      observedOutcome: observedOutcomeAt(session, messageIndex, ratings),
      explicit: looksExplicit(message.content),
    });
  });

  session.conversation.forEach((message, messageIndex) => {
    if (message.role !== "assistant") return;
    const feedback = feedbackForMessage(session, message.id, ratings);
    const commentMatches = Boolean(
      feedback.comment && category.candidatePatterns.some((pattern) => pattern.test(feedback.comment ?? "")),
    );
    if (feedback.stars === undefined && !commentMatches) return;
    if (!commentMatches && feedback.stars !== undefined && feedback.stars === 3) return;
    const id = `${categoryId}:${session.id}:${message.id}:rating`;
    const ratingText = feedback.stars === undefined ? "Customer feedback" : `Customer rating ${feedback.stars}/5`;
    found.set(id, {
      id,
      categoryId,
      datasetIds,
      sessionId: session.id,
      messageId: message.id,
      messageIndex,
      role: message.role,
      timestamp: message.timestamp,
      excerpt: compact(
        `${ratingText}${feedback.comment ? `: ${feedback.comment}` : ` for response: ${message.content}`}`,
        EXCERPT_LIMIT,
      ),
      signal: `${category.label}: observed customer outcome`,
      contextBefore: contextAt(session, messageIndex, -1),
      contextAfter: contextAt(session, messageIndex, 1),
      observedOutcome: observedOutcomeAt(session, messageIndex, ratings),
      explicit: Boolean(feedback.comment && looksExplicit(feedback.comment)),
    });
  });

  return [...found.values()].slice(0, MAX_EVIDENCE_PER_CATEGORY);
}

export interface PersonalOptimizationInput {
  sessions: SessionRecord[];
  ratings?: Rating[];
  goals: OptimizationGoalId[];
  currentPreferences: LearnedPreferences;
  minimumEvidence?: number;
  apply?: boolean;
  now?: number;
}

/**
 * Produces bounded, contextual candidate windows and an incremental scan
 * checkpoint. Regex matches only locate evidence for the validator; this
 * function never turns a keyword into a personalization rule.
 */
export function runPersonalOptimization(input: PersonalOptimizationInput): OptimizationRun {
  const beforePreferences = cloneLearnedPreferences(input.currentPreferences);
  const afterPreferences = cloneLearnedPreferences(input.currentPreferences);
  const currentProfile = afterPreferences.personalization ?? emptyCustomerPersonalizationProfile();
  const processedSessionHashes: CustomerPersonalizationProfile["processedSessionHashes"] =
    Object.fromEntries(
      Object.entries(currentProfile.processedSessionHashes).map(([categoryId, hashes]) => [
        categoryId,
        { ...hashes },
      ]),
    );
  const goals = [...new Set(input.goals)].filter(isOptimizationGoalId);
  const ratings = input.ratings ?? [];
  const evidence: OptimizationEvidenceRef[] = [];
  const scannedSessionIds = new Set<string>();
  let skippedUnchangedSessions = 0;
  const now = input.now ?? Date.now();

  for (const goal of goals) {
    const categoryEvidence: OptimizationEvidenceRef[] = [];
    const categoryHashes = { ...(processedSessionHashes[goal] ?? {}) };
    for (const session of input.sessions) {
      const fingerprint = sessionFingerprint(session, ratings);
      if (categoryHashes[session.id] === fingerprint) {
        skippedUnchangedSessions += 1;
        continue;
      }
      categoryHashes[session.id] = fingerprint;
      scannedSessionIds.add(session.id);
      categoryEvidence.push(...evidenceForCategory(session, goal, ratings));
    }
    processedSessionHashes[goal] = categoryHashes;
    evidence.push(...categoryEvidence.slice(0, MAX_EVIDENCE_PER_CATEGORY));
  }

  afterPreferences.personalization = {
    ...currentProfile,
    processedSessionHashes,
  };

  const boundedEvidence = evidence.slice(0, MAX_EVIDENCE_TOTAL);
  const noCandidates = boundedEvidence.length === 0;
  return {
    id: `optimization-${now}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: now,
    goals,
    status: input.apply && noCandidates ? "no-change" : "preview",
    scannedSessions: scannedSessionIds.size,
    skippedUnchangedSessions,
    evidence: boundedEvidence,
    changes: [],
    beforePreferences,
    afterPreferences,
    summary: noCandidates
      ? scannedSessionIds.size === 0
        ? "Everything selected is already up to date."
        : "No candidate evidence was found in the new or changed conversations."
      : `Prepared ${boundedEvidence.length} contextual evidence window${boundedEvidence.length === 1 ? "" : "s"} for semantic validation.`,
  };
}
