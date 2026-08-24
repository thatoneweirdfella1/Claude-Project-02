import { create } from "zustand";
import type {
  ContextItem,
  ConversationMessage,
  DestinationSelection,
  DirectnessLevel,
  MethodologyPhase,
  MethodologyType,
  ModelSelection,
  ScreenId,
  ScreenSectionId,
  SessionRecord,
  SessionState,
  StatePills,
  TechniqueId,
  TranslatorEngine,
} from "./types";
import { useSettingsDefaultsStore } from "./settingsDefaultsStore";

export const DEFAULT_MAX_REQUEST_COST = 0.25;

function newLiveSessionId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `session-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export function createInitialSessionState(): SessionState {
  const now = Date.now();
  const saved = useSettingsDefaultsStore.getState();
  const defaults = saved.requestDefaults;
  return {
    sessionId: newLiveSessionId(),
    sessionCreatedAt: now,
    sessionTitle: "",
    draftInput: "",
    draftSelectionStart: 0,
    draftSelectionEnd: 0,
    conversationScrollTop: 0,
    model: "auto",
    destination: { ...defaults.destination },
    translatorEngine: defaults.translatorEngine,
    reviewBeforeSend: defaults.reviewBeforeSend,
    paidFallbackEnabled: defaults.paidFallbackEnabled,
    maxRequestCost: defaults.maxRequestCost,
    directness: saved.directness,
    techniques: [...defaults.techniques],
    context: [],
    conversation: [],
    statePills: { emotion: null, rsd: null, interest: null, cognitive: null },
    variables: {},
    currentScreen: "translate",
    currentSection: null,
    methodology: defaults.methodology,
    methodologyPhase: "define",
    lockedProblemStatement: "",
  };
}

export const SESSION_PERSISTED_KEYS: (keyof SessionState)[] = [
  "sessionId", "sessionCreatedAt", "sessionTitle", "draftInput",
  "draftSelectionStart", "draftSelectionEnd", "conversationScrollTop", "model",
  "destination", "translatorEngine", "reviewBeforeSend", "paidFallbackEnabled",
  "maxRequestCost", "directness", "techniques", "context", "conversation",
  "statePills", "variables", "currentScreen", "currentSection", "methodology", "methodologyPhase",
  "lockedProblemStatement",
];

interface SessionActions {
  setDraftInput: (draftInput: string) => void;
  setDraftSelection: (start: number, end: number) => void;
  setConversationScrollTop: (scrollTop: number) => void;
  setModel: (model: ModelSelection) => void;
  setDestination: (destination: DestinationSelection) => void;
  setTranslatorEngine: (translatorEngine: TranslatorEngine) => void;
  setReviewBeforeSend: (reviewBeforeSend: boolean) => void;
  setPaidFallbackEnabled: (paidFallbackEnabled: boolean) => void;
  setMaxRequestCost: (maxRequestCost: number) => void;
  setDirectness: (directness: DirectnessLevel) => void;
  setTechniques: (techniques: TechniqueId[]) => void;
  addContextItem: (item: ContextItem) => void;
  removeContextItem: (id: string) => void;
  addMessage: (message: ConversationMessage) => void;
  setStatePills: (statePills: StatePills) => void;
  setSessionVariable: (name: string, value: string) => void;
  removeSessionVariable: (name: string) => void;
  setMessageRating: (messageId: string, stars: number, comment?: string) => void;
  updateMessage: (messageId: string, patch: Partial<ConversationMessage>) => void;
  resetSession: () => void;
  newSession: () => void;
  setCurrentScreen: (screen: ScreenId) => void;
  setScreenLocation: (screen: ScreenId, section?: ScreenSectionId | null) => void;
  loadSessionRecord: (record: SessionRecord) => void;
  setMethodology: (methodology: MethodologyType) => void;
  setMethodologyPhase: (phase: MethodologyPhase) => void;
  setLockedProblemStatement: (statement: string) => void;
  hydrate: (state: Partial<SessionState>) => void;
}

export type SessionStore = SessionState & SessionActions;

const VALID_SCREENS = new Set<ScreenId>([
  "translate", "insights", "projects", "techniques", "variables", "sessions",
  "saved-tools", "settings", "checkpoints", "large-jobs", "trash",
]);

const VALID_SECTIONS = new Set<ScreenSectionId>([
  "active", "saved", "archived", "trash", "templates", "saved-prompts",
  "overview", "usage", "activity", "patterns", "tasks", "resources",
  "integrations", "account", "plan", "connections", "personalization",
  "appearance", "data", "status",
]);

function resolvePersistedLocation(value: unknown): { currentScreen: ScreenId; currentSection: ScreenSectionId | null } {
  if (typeof value === "string" && VALID_SCREENS.has(value as ScreenId)) return { currentScreen: value as ScreenId, currentSection: null };
  const migrated: Record<string, { currentScreen: ScreenId; currentSection: ScreenSectionId | null }> = {
    home: { currentScreen: "translate", currentSection: null },
    dashboard: { currentScreen: "insights", currentSection: "overview" },
    messages: { currentScreen: "sessions", currentSection: "active" },
    archive: { currentScreen: "sessions", currentSection: "archived" },
    resources: { currentScreen: "techniques", currentSection: null },
    integrations: { currentScreen: "projects", currentSection: "integrations" },
    tasks: { currentScreen: "projects", currentSection: "tasks" },
    customize: { currentScreen: "variables", currentSection: null },
    templates: { currentScreen: "saved-tools", currentSection: "templates" },
    "saved-prompts": { currentScreen: "saved-tools", currentSection: "saved-prompts" },
  };
  return migrated[String(value)] ?? { currentScreen: "translate", currentSection: null };
}

export const useSessionStore = create<SessionStore>((set) => ({
  ...createInitialSessionState(),
  setDraftInput: (draftInput) => set({
    draftInput,
    draftSelectionStart: draftInput.length,
    draftSelectionEnd: draftInput.length,
  }),
  setDraftSelection: (start, end) => set((state) => ({
    draftSelectionStart: Math.max(0, Math.min(state.draftInput.length, Math.floor(start))),
    draftSelectionEnd: Math.max(0, Math.min(state.draftInput.length, Math.floor(end))),
  })),
  setConversationScrollTop: (conversationScrollTop) => set({
    conversationScrollTop: Number.isFinite(conversationScrollTop)
      ? Math.max(0, conversationScrollTop)
      : 0,
  }),
  setModel: (model) => set({ model }),
  setDestination: (destination) => set({ destination }),
  setTranslatorEngine: (translatorEngine) => set({ translatorEngine }),
  setReviewBeforeSend: (reviewBeforeSend) => set({ reviewBeforeSend }),
  setPaidFallbackEnabled: (paidFallbackEnabled) => set({ paidFallbackEnabled }),
  setMaxRequestCost: (maxRequestCost) => set({
    maxRequestCost: Number.isFinite(maxRequestCost) ? Math.max(0, maxRequestCost) : 0,
  }),
  setDirectness: (directness) => set({ directness }),
  setTechniques: (techniques) => set({ techniques }),
  addContextItem: (item) => set((s) => ({ context: [...s.context, item] })),
  removeContextItem: (id) => set((s) => ({ context: s.context.filter((c) => c.id !== id) })),
  addMessage: (message) => set((s) => ({ conversation: [...s.conversation, message] })),
  setStatePills: (statePills) => set({ statePills }),
  setSessionVariable: (name, value) => set((s) => ({ variables: { ...s.variables, [name]: value } })),
  removeSessionVariable: (name) => set((s) => {
    const { [name]: _removed, ...rest } = s.variables;
    return { variables: rest };
  }),
  setMessageRating: (messageId, stars, comment) => set((s) => ({
    conversation: s.conversation.map((m) =>
      m.id === messageId
        ? { ...m, ratingStars: stars, ...(comment !== undefined ? { ratingComment: comment } : {}) }
        : m,
    ),
  })),
  updateMessage: (messageId, patch) => set((s) => ({
    conversation: s.conversation.map((m) => m.id === messageId ? { ...m, ...patch } : m),
  })),
  resetSession: () => set(createInitialSessionState()),
  newSession: () => {
    const now = Date.now();
    set({
      sessionId: newLiveSessionId(),
      sessionCreatedAt: now,
      sessionTitle: "",
      draftInput: "",
      draftSelectionStart: 0,
      draftSelectionEnd: 0,
      conversationScrollTop: 0,
      conversation: [],
      context: [],
      variables: {},
      statePills: { emotion: null, rsd: null, interest: null, cognitive: null },
    });
  },
  setCurrentScreen: (currentScreen) => set({ currentScreen, currentSection: null }),
  setScreenLocation: (currentScreen, currentSection = null) => set({ currentScreen, currentSection }),
  loadSessionRecord: (record) => set({
    sessionId: record.id,
    sessionCreatedAt: record.createdAt,
    sessionTitle: record.tag ?? "",
    model: record.model,
    destination: record.destination ?? { providerId: "anthropic", modelId: record.model === "auto" ? "auto" : record.model },
    translatorEngine: record.translatorEngine ?? "legacy-claude",
    reviewBeforeSend: record.reviewBeforeSend ?? true,
    paidFallbackEnabled: record.paidFallbackEnabled ?? false,
    maxRequestCost: record.maxRequestCost ?? DEFAULT_MAX_REQUEST_COST,
    directness: record.directness,
    techniques: record.techniques,
    context: record.context,
    variables: record.variables,
    conversation: record.conversation,
    draftInput: record.draftInput ?? "",
    draftSelectionStart: record.draftSelectionStart ?? (record.draftInput?.length ?? 0),
    draftSelectionEnd: record.draftSelectionEnd ?? (record.draftInput?.length ?? 0),
    conversationScrollTop: record.conversationScrollTop ?? 0,
    statePills: record.statePills ?? { emotion: null, rsd: null, interest: null, cognitive: null },
    methodology: record.methodology ?? "standard",
    methodologyPhase: record.methodologyPhase ?? "define",
    lockedProblemStatement: record.lockedProblemStatement ?? "",
  }),
  setMethodology: (methodology) => set({ methodology }),
  setMethodologyPhase: (methodologyPhase) => set({ methodologyPhase }),
  setLockedProblemStatement: (lockedProblemStatement) => set({ lockedProblemStatement }),
  hydrate: (state) => set((current) => ({
    ...state,
    ...(state.sessionId !== undefined
      ? { sessionId: typeof state.sessionId === "string" && state.sessionId ? state.sessionId : current.sessionId }
      : {}),
    ...(state.sessionCreatedAt !== undefined
      ? { sessionCreatedAt: Number.isFinite(state.sessionCreatedAt) ? state.sessionCreatedAt : current.sessionCreatedAt }
      : {}),
    ...(state.sessionTitle !== undefined ? { sessionTitle: String(state.sessionTitle) } : {}),
    ...(state.draftSelectionStart !== undefined
      ? { draftSelectionStart: Math.max(0, Number(state.draftSelectionStart) || 0) }
      : {}),
    ...(state.draftSelectionEnd !== undefined
      ? { draftSelectionEnd: Math.max(0, Number(state.draftSelectionEnd) || 0) }
      : {}),
    ...(state.conversationScrollTop !== undefined
      ? { conversationScrollTop: Math.max(0, Number(state.conversationScrollTop) || 0) }
      : {}),
    ...(state.context !== undefined ? { context: Array.isArray(state.context) ? state.context : current.context } : {}),
    ...(state.conversation !== undefined ? { conversation: Array.isArray(state.conversation) ? state.conversation : current.conversation } : {}),
    ...(state.techniques !== undefined ? { techniques: Array.isArray(state.techniques) ? state.techniques : current.techniques } : {}),
    ...(state.destination !== undefined && state.destination && typeof state.destination === "object"
      ? { destination: state.destination }
      : {}),
    ...(state.translatorEngine !== undefined ? { translatorEngine: state.translatorEngine } : {}),
    ...(state.reviewBeforeSend !== undefined ? { reviewBeforeSend: Boolean(state.reviewBeforeSend) } : {}),
    ...(state.paidFallbackEnabled !== undefined ? { paidFallbackEnabled: Boolean(state.paidFallbackEnabled) } : {}),
    ...(state.maxRequestCost !== undefined ? { maxRequestCost: Math.max(0, Number(state.maxRequestCost) || 0) } : {}),
    ...(state.currentScreen !== undefined
      ? resolvePersistedLocation(state.currentScreen)
      : {}),
    ...(state.currentSection !== undefined
      ? { currentSection: state.currentSection && VALID_SECTIONS.has(state.currentSection) ? state.currentSection : null }
      : {}),
  })),
}));
