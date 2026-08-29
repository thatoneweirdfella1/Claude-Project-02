import type { OptimizationGoalId } from "../../stores/types";

export interface CustomerOptimizerDataset {
  id: string;
  question: string;
}

export interface CustomerOptimizerCategory {
  id: OptimizationGoalId;
  label: string;
  description: string;
  groupId: string;
  profileArea: string;
  datasets: CustomerOptimizerDataset[];
  /** Candidate locator only. A match is never itself a profile finding. */
  candidatePatterns: RegExp[];
}

export const CUSTOMER_OPTIMIZER_CATEGORIES: CustomerOptimizerCategory[] = [
  {
    id: "C01",
    label: "Keep Responses the Right Length",
    description: "Learn when you need a short answer, more detail, or information revealed gradually.",
    groupId: "G01",
    profileArea: "Response length, initial detail, progressive disclosure, and task-specific detail",
    datasets: [
      { id: "G01-D01", question: "Find direct requests for shorter, longer, simpler, fuller, or more detailed responses and preserve their context." },
      { id: "G01-D02", question: "Find cases where length, density, repetition, or unnecessary background contributed to confusion, frustration, disengagement, or abandonment." },
      { id: "G01-D03", question: "Find cases where missing explanation, omitted steps, or unsupported conclusions caused follow-up questions, errors, or dissatisfaction." },
      { id: "G01-D04", question: "Compare successful interactions across task types to determine which amount of detail worked." },
      { id: "G01-D05", question: "Find when a short initial answer followed by optional expansion did or did not work." },
    ],
    candidatePatterns: [/\b(shorter|longer|too long|too short|too much detail|more detail|wall of text|brief|concise|summari[sz]e|expand|step by step)\b/i],
  },
  {
    id: "C02",
    label: "Explain Things in the Way I Understand",
    description: "Learn which wording, examples, and instruction formats work best for you.",
    groupId: "G02",
    profileArea: "Explanation format, vocabulary, examples, sequencing, and copy-ready formatting",
    datasets: [
      { id: "G02-D01", question: "Find where understanding broke down and preserve the explanation immediately before it." },
      { id: "G02-D02", question: "Find rewording, examples, comparisons, demonstrations, or structures that resolved confusion." },
      { id: "G02-D03", question: "Compare steps, examples, analogies, definitions, comparisons, demonstrations, and summaries against outcomes." },
      { id: "G02-D04", question: "Find preferred wording, jargon tolerance, requested definitions, and repeatedly misunderstood or corrected terms." },
      { id: "G02-D05", question: "Find which instruction formats most often led to successful use." },
    ],
    candidatePatterns: [/\b(confus|unclear|understand|what do you mean|explain|example|analogy|show me|copy.?paste|plain english|jargon|bullet|numbered|checklist|format|wording|definition|demonstration)\b/i],
  },
  {
    id: "C03",
    label: "Match My Tone and Directness",
    description: "Learn how direct, gentle, formal, casual, concise, or conversational responses should be.",
    groupId: "G03",
    profileArea: "Directness, warmth, formality, conversational style, and acknowledgment style",
    datasets: [
      { id: "G03-D01", question: "Find direct instructions or corrections about tone, directness, politeness, formality, warmth, brevity, and conversational style." },
      { id: "G03-D02", question: "Find when caveats, qualification, avoidance, or indirect answers helped or harmed." },
      { id: "G03-D03", question: "Compare reactions to blunt, gentle, neutral, enthusiastic, or emotionally expressive responses." },
      { id: "G03-D04", question: "Determine whether preferred tone changes by task, emotional state, urgency, error severity, or conversation stage." },
      { id: "G03-D05", question: "Find acknowledgments that restore trust and those that feel repetitive or performative." },
    ],
    candidatePatterns: [/\b(direct|blunt|gentle|formal|casual|tone|stop apolog|don.t apologize|warm|supportive|patroniz|talk to me|just answer)\b/i],
  },
  {
    id: "C04",
    label: "Prevent and Reduce Overwhelm",
    description: "Learn what creates cognitive overload and what reliably reduces it.",
    groupId: "G04",
    profileArea: "Information density, chunk size, pacing, and simultaneous demands",
    datasets: [
      { id: "G04-D01", question: "Reconstruct what happened before overload, including structure, demands, options, questions, repetition, and unresolved context." },
      { id: "G04-D02", question: "Aggregate recurring overload triggers without requiring the customer to name overwhelm." },
      { id: "G04-D03", question: "Find changes that reduced overload and allowed the customer to continue." },
      { id: "G04-D04", question: "Find attempted de-escalation that worsened overload or caused disengagement." },
      { id: "G04-D05", question: "Compare successful and unsuccessful instruction sizes, pacing, simultaneous choices, nested steps, and topic changes." },
    ],
    candidatePatterns: [/\b(overwhelm|too much|can.?t process|one thing at a time|slow down|lost me|adhd|too many|simplif|confus)\b/i],
  },
  {
    id: "C05",
    label: "Respond Better When I’m Frustrated or Correcting the AI",
    description: "Learn what causes escalation and what successfully repairs the interaction.",
    groupId: "G05",
    profileArea: "Correction handling, reflection, verification, apology, and repair behavior",
    datasets: [
      { id: "G05-D01", question: "Find frustration signals and preserve the assumptions, omissions, or repeated behavior immediately beforehand." },
      { id: "G05-D02", question: "Find instructions, facts, boundaries, or preferences the customer had to repeat and why." },
      { id: "G05-D03", question: "Find responses that restored cooperation, trust, clarity, or progress after failure." },
      { id: "G05-D04", question: "Find apologies, explanations, retries, or redirections that escalated frustration or caused the customer to stop." },
      { id: "G05-D05", question: "Compare when restating, quoting, confirming, or asking one targeted question prevented another mistake." },
    ],
    candidatePatterns: [/\b(frustrat|not listening|already (said|told)|this is wrong|stop doing|annoy|again|you missed|that.s not what|correcting you)\b/i],
  },
  {
    id: "C06",
    label: "Stay Focused on What I Asked",
    description: "Learn how to preserve your objective, constraints, context, and place in a task.",
    groupId: "G06",
    profileArea: "Objective preservation, scope control, constraint retention, and resume behavior",
    datasets: [
      { id: "G06-D01", question: "Find when the AI pursued an adjacent goal instead of the customer’s actual goal and the consequences." },
      { id: "G06-D02", question: "Find requirements the AI forgot, altered, or contradicted." },
      { id: "G06-D03", question: "Find techniques that preserved the original goal, exclusions, and success conditions through long work." },
      { id: "G06-D04", question: "Find what information was needed to resume correctly after pauses, sessions, interruptions, or topic changes." },
      { id: "G06-D05", question: "Determine when initiative helped and when additions, alternatives, future steps, or redesign created friction." },
    ],
    candidatePatterns: [/\b(not what i asked|stay focused|off topic|don.t add|only asked|lost the plot|forgot|constraint|continue where|resume|scope|stop changing)\b/i],
  },
  {
    id: "C07",
    label: "Help Me Start, Continue, and Finish Things",
    description: "Learn which assistance improves starting, resuming, progressing, and completing tasks.",
    groupId: "G07",
    profileArea: "Starting support, next-action size, planning, resumption, and completion support",
    datasets: [
      { id: "G07-D01", question: "Find what prevented action from beginning and which first step initiated progress." },
      { id: "G07-D02", question: "Reconstruct where progress stopped, what preceded it, and what assistance failed." },
      { id: "G07-D03", question: "Find response patterns associated with sustained progress." },
      { id: "G07-D04", question: "Find what allowed an interrupted task to resume without manual reconstruction." },
      { id: "G07-D05", question: "Compare completed and uncompleted tasks for differences in pacing, instruction size, examples, decisions, and assistance." },
    ],
    candidatePatterns: [/\b(stuck|start|begin|continue|resume|finish|gave up|can.?t finish|completed|finally done|next step|checkpoint|hold|go)\b/i],
  },
  {
    id: "C08",
    label: "Give Me the Right Amount of Choice",
    description: "Learn when to recommend one answer, offer options, ask a question, or make an objective default decision.",
    groupId: "G08",
    profileArea: "Option count, recommendation strength, clarification frequency, and default decisions",
    datasets: [
      { id: "G08-D01", question: "Find when the number, similarity, or presentation of options delayed action or created frustration." },
      { id: "G08-D02", question: "Find when one recommendation or ranked choice helped the customer move forward." },
      { id: "G08-D03", question: "Compare helpful questions with unnecessary, repeated, technical, or decision-transferring questions." },
      { id: "G08-D04", question: "Find objective decisions the customer expects the AI to make and subjective decisions the customer retains." },
      { id: "G08-D05", question: "Find decisions reversed because a recommendation ignored a requirement, preference, risk, or missing context." },
    ],
    candidatePatterns: [/\b(too many options|just pick|recommend|which one|don.t ask|stop asking|make the decision|give me options|choice|yes or no|best one)\b/i],
  },
  {
    id: "C09",
    label: "Personalize Encouragement and Emotional Support",
    description: "Learn which acknowledgment, reassurance, encouragement, urgency, or accountability helps or harms.",
    groupId: "G09",
    profileArea: "Encouragement, validation, reassurance, pressure, and accountability style",
    datasets: [
      { id: "G09-D01", question: "Compare encouragement that improved engagement with encouragement that felt distracting, excessive, generic, or patronizing." },
      { id: "G09-D02", question: "Find when acknowledgment or reassurance helped and when it replaced the requested work." },
      { id: "G09-D03", question: "Find whether deadlines, urgency, challenge, or pressure motivated action or increased avoidance." },
      { id: "G09-D04", question: "Find responses to reminders, check-ins, progress acknowledgment, and commitment language." },
      { id: "G09-D05", question: "Find wording that communicated errors, disagreement, refusals, or limits without unnecessary escalation." },
    ],
    candidatePatterns: [/\b(encourag|reassur|validate|support|pressure|deadline|accountab|patroniz|generic|praise|motivat|don.t lecture)\b/i],
  },
  {
    id: "C10",
    label: "Adapt the Interface and Workflow to Me",
    description: "Learn supported preferences about information density, visible tools, defaults, navigation, notifications, and workflow.",
    groupId: "G10",
    profileArea: "Supported interface density, visibility, defaults, navigation, and notification preferences",
    datasets: [
      { id: "G10-D01", question: "Find direct statements about layout, density, visibility, themes, controls, navigation, notifications, and workflow." },
      { id: "G10-D02", question: "Find evidence that the customer could not locate, understand, or use a feature or control." },
      { id: "G10-D03", question: "Find evidence about crowded screens, hidden controls, progressive disclosure, labels, and visual hierarchy." },
      { id: "G10-D04", question: "Find repeated workflows, preferred starting locations, frequently requested actions, and safe defaults." },
      { id: "G10-D05", question: "Find supported preferences about notification timing, frequency, urgency, dismissal, and interruption." },
    ],
    candidatePatterns: [/\b(interface|layout|screen|button|menu|navigation|hidden|visible|crowded|density|default|notification|shortcut|workflow|scroll|accordion)\b/i],
  },
];

const CATEGORY_IDS = new Set(CUSTOMER_OPTIMIZER_CATEGORIES.map((category) => category.id));

export function isOptimizationGoalId(value: unknown): value is OptimizationGoalId {
  return typeof value === "string" && CATEGORY_IDS.has(value as OptimizationGoalId);
}

export function getCustomerOptimizerCategory(id: OptimizationGoalId): CustomerOptimizerCategory {
  const category = CUSTOMER_OPTIMIZER_CATEGORIES.find((item) => item.id === id);
  if (!category) throw new Error(`Unknown customer optimizer category: ${id}`);
  return category;
}
