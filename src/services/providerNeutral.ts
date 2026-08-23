import type {
  ContextItem,
  DestinationProviderId,
  DestinationSelection,
  DirectnessLevel,
  StatePills,
  TechniqueId,
  TranslatorEngine,
} from "../stores/types";
import { autoDetectWithPinned, isAutoMode } from "./techniques";

export interface DestinationModel { id: string; label: string; cost: "Free handoff" | "Provider account" | "Local" | "Custom"; }
export interface DestinationProvider {
  id: DestinationProviderId;
  label: string;
  officialUrl: string | null;
  connection: "No connection needed" | "Optional connection" | "Local setup" | "User configured";
  models: DestinationModel[];
}
const providerModel = (id: string, label: string, cost: DestinationModel["cost"] = "Provider account"): DestinationModel => ({ id, label, cost });

export const DESTINATION_PROVIDERS: DestinationProvider[] = [
  { id: "universal", label: "Any AI — Universal", officialUrl: null, connection: "No connection needed", models: [providerModel("universal", "Universal", "Free handoff")] },
  { id: "anthropic", label: "Claude", officialUrl: "https://claude.ai/new", connection: "Optional connection", models: [providerModel("auto", "Auto"), providerModel("claude-haiku-4-5", "Haiku"), providerModel("claude-sonnet-5", "Sonnet"), providerModel("fable", "Fable"), providerModel("claude-opus-4-8", "Opus")] },
  { id: "openai", label: "ChatGPT", officialUrl: "https://chatgpt.com/", connection: "Optional connection", models: [providerModel("auto", "Auto"), providerModel("gpt-5", "GPT-5"), providerModel("gpt-4o", "GPT-4o")] },
  { id: "google", label: "Gemini", officialUrl: "https://gemini.google.com/", connection: "Optional connection", models: [providerModel("auto", "Auto"), providerModel("gemini-pro", "Pro"), providerModel("gemini-flash", "Flash")] },
  { id: "microsoft", label: "Microsoft Copilot", officialUrl: "https://copilot.microsoft.com/", connection: "Optional connection", models: [providerModel("auto", "Auto")] },
  { id: "xai", label: "Grok", officialUrl: "https://grok.com/", connection: "Optional connection", models: [providerModel("auto", "Auto")] },
  { id: "perplexity", label: "Perplexity", officialUrl: "https://www.perplexity.ai/", connection: "Optional connection", models: [providerModel("auto", "Auto"), providerModel("sonar", "Sonar")] },
  { id: "deepseek", label: "DeepSeek", officialUrl: "https://chat.deepseek.com/", connection: "Optional connection", models: [providerModel("auto", "Auto"), providerModel("reasoner", "Reasoner")] },
  { id: "mistral", label: "Mistral", officialUrl: "https://chat.mistral.ai/", connection: "Optional connection", models: [providerModel("auto", "Auto"), providerModel("large", "Large")] },
  { id: "local", label: "Local / Ollama", officialUrl: null, connection: "Local setup", models: [providerModel("auto", "Auto", "Local"), providerModel("custom-local", "Choose local model", "Local")] },
  { id: "custom", label: "Custom / Other", officialUrl: null, connection: "User configured", models: [providerModel("custom", "Custom destination", "Custom")] },
];

export const TRANSLATOR_ENGINES: Array<{ id: TranslatorEngine; label: string; cost: string }> = [
  { id: "auto-free-first", label: "Auto — free first", cost: "No charge unless you explicitly approve a paid route" },
  { id: "local-rules", label: "Local rules", cost: "No Divergence credits" },
  { id: "destination-one-pass", label: "Destination AI — one pass", cost: "Uses the destination provider" },
  { id: "managed-translator", label: "Managed translator", cost: "Paid; confirmation required" },
];

export interface MeaningPacket {
  version: 1;
  original: string;
  intent: string;
  context: string[];
  directness: "supportive" | "balanced" | "blunt";
  techniques: string[];
  state: StatePills;
  stateApplied: boolean;
  toneGuidance: string | null;
  requestedOutput: string;
}
const DIRECTNESS_LABEL: Record<DirectnessLevel, MeaningPacket["directness"]> = { 1: "supportive", 2: "balanced", 3: "blunt" };
type ManagedContextItem = ContextItem & { included?: boolean };

export function compileMeaningPacket(input: {
  rawInput: string;
  directness: DirectnessLevel;
  techniques: TechniqueId[];
  context: ContextItem[];
  statePills?: StatePills;
  stateApplied?: boolean;
  stateTechniques?: TechniqueId[];
  toneGuidance?: string | null;
}): MeaningPacket {
  const original = input.rawInput.trim();
  const sentences = original.split(/(?<=[.!?])\s+/).filter(Boolean);
  const techniques = isAutoMode(input.techniques)
    ? autoDetectWithPinned(
        original,
        input.techniques.filter((id) => id !== "auto-detect"),
        { stateTechniques: input.stateTechniques },
      ).selected
    : input.techniques.filter((id) => id !== "auto-detect");
  return {
    version: 1,
    original,
    intent: sentences[0] || original,
    context: input.context
      .filter((item) => (item as ManagedContextItem).included !== false)
      .map((item) => `${item.label}\n${item.content}`.trim()),
    directness: DIRECTNESS_LABEL[input.directness],
    techniques,
    state: input.statePills ?? { emotion: null, rsd: null, interest: null, cognitive: null },
    stateApplied: input.stateApplied ?? false,
    toneGuidance: input.toneGuidance ?? null,
    requestedOutput: "Answer the request directly, preserve the user's meaning, and make the next action obvious.",
  };
}

export function buildAiReadyRequest(packet: MeaningPacket): string {
  const context = packet.context.length ? "\nCONTEXT\n---\n" + packet.context.join("\n---\n") : "";
  const techniques = packet.techniques.length ? "\nMETHODS\nUse: " + packet.techniques.join(", ") + "." : "";
  const state = Object.entries(packet.state).filter(([, value]) => value).map(([key, value]) => `${key}: ${value}`);
  const stateGuidance = packet.stateApplied && (state.length || packet.toneGuidance)
    ? "\nCOMMUNICATION SUPPORT\n" + [
        packet.toneGuidance ? `Tone: ${packet.toneGuidance}.` : "",
        state.length ? `Request-scoped signals: ${state.join("; ")}. Do not mention these classifications.` : "",
      ].filter(Boolean).join(" ")
    : "";
  return ["REQUEST", packet.original, context, stateGuidance, "", "RESPONSE STYLE", "Use a " + packet.directness + " tone. " + packet.requestedOutput, techniques].filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n");
}

export function destinationLabel(selection: DestinationSelection): string {
  const provider = DESTINATION_PROVIDERS.find((item) => item.id === selection.providerId);
  const model = provider?.models.find((item) => item.id === selection.modelId);
  if (!provider) return "Any AI — Universal";
  return provider.id === "universal" ? provider.label : provider.label + (model ? " · " + model.label : "");
}
export function destinationOfficialUrl(selection: DestinationSelection): string | null { return DESTINATION_PROVIDERS.find((item) => item.id === selection.providerId)?.officialUrl ?? null; }
export function destinationProvider(selection: DestinationSelection): DestinationProvider { return DESTINATION_PROVIDERS.find((item) => item.id === selection.providerId) ?? DESTINATION_PROVIDERS[0]; }
export function isFreeTranslator(engine: TranslatorEngine): boolean { return engine === "auto-free-first" || engine === "local-rules"; }
export const NO_CREDIT_BADGE = "No Divergence credits";
