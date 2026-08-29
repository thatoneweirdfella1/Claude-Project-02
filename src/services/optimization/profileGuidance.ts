import type {
  CustomerPersonalizationProfile,
  OptimizationGoalId,
  PersonalizationRule,
  PersonalizationUiPreferences,
} from "../../stores/types";

const TRANSLATION_CATEGORIES = new Set<OptimizationGoalId>(["C02", "C03", "C05", "C06", "C08"]);
const RESPONSE_CATEGORIES = new Set<OptimizationGoalId>([
  "C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09",
]);
const OVERRIDE_RULE = "These are learned defaults only. The current request, its explicit constraints, and the customer's current choices always override them.";

export interface PersonalizationGuidance {
  translation: string[];
  response: string[];
}

function formatRule(rule: PersonalizationRule): string {
  const contexts = rule.contexts.length > 0 ? ` Apply when relevant to: ${rule.contexts.join("; ")}.` : "";
  const exclusions = rule.exclusions.length > 0 ? ` Do not apply when: ${rule.exclusions.join("; ")}.` : "";
  return `${rule.instruction}${contexts}${exclusions}`.trim();
}

function activeRules(
  profile: CustomerPersonalizationProfile | undefined,
  categories: Set<OptimizationGoalId>,
): PersonalizationRule[] {
  if (!profile) return [];
  return Object.entries(profile.rules)
    .flatMap(([categoryId, rules]) => categories.has(categoryId as OptimizationGoalId) ? rules ?? [] : [])
    .filter((rule) => rule.confidence >= 0.7)
    .sort((left, right) => right.confidence - left.confidence)
    .slice(0, 12);
}

function guidanceFor(rules: PersonalizationRule[]): string[] {
  return rules.length === 0 ? [] : [OVERRIDE_RULE, ...rules.map(formatRule)];
}

export function buildPersonalizationGuidance(
  profile: CustomerPersonalizationProfile | undefined,
): PersonalizationGuidance {
  return {
    translation: guidanceFor(activeRules(profile, TRANSLATION_CATEGORIES)),
    response: guidanceFor(activeRules(profile, RESPONSE_CATEGORIES)),
  };
}

export function getPersonalizationUiPreferences(
  profile: CustomerPersonalizationProfile | undefined,
): PersonalizationUiPreferences {
  return profile ? { ...profile.ui } : {};
}
