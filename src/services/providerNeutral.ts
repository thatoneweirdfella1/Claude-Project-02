import type {
  ContextItem,
  DestinationProviderId,
  DestinationSelection,
  DirectnessLevel,
  TechniqueId,
} from "../stores/types";

export interface DestinationModel {
  id: string;
  label: string;
}

export interface DestinationProvider {
  id: DestinationProviderId;
  label: string;
  officialUrl: string | null;
  models: DestinationModel[];
}

export const DESTINATION_PROVIDERS: DestinationProvider[] = [
  { id: "universal", label: "Any AI — Universal", officialUrl: null, models: [{ id: "universal", label: "Universal" }] },
  { id: "anthropic", label: "Claude", officialUrl: "https://claude.ai/new", models: [
    { id: "auto", label: "Auto" }, { id: "claude-haiku-4-5", label: "Haiku" },
    { id: "claude-sonnet-5", label: "Sonnet" }, { id: "fable", label: "Fable" },
    { id: "claude-opus-4-8", label: "Opus" },
  ] },
  { id: "openai", label: "ChatGPT", officialUrl: "https://chatgpt.com/", models: [{ id: "auto", label: "Auto" }] },
  { id: "google", label: "Gemini", officialUrl: "https://gemini.google.com/", models: [{ id: "auto", label: "Auto" }] },
  { id: "xai", label: "Grok", officialUrl: "https://grok.com/", models: [{ id: "auto", label: "Auto" }] },
  { id: "perplexity", label: "Perplexity", officialUrl: "https://www.perplexity.ai/", models: [{ id: "auto", label: "Auto" }] },
  { id: "deepseek", label: "DeepSeek", officialUrl: "https://chat.deepseek.com/", models: [{ id: "auto", label: "Auto" }] },
  { id: "mistral", label: "Mistral", officialUrl: "https://chat.mistral.ai/", models: [{ id: "auto", label: "Auto" }] },
];

export interface MeaningPacket {
  version: 1;
  original: string;
  intent: string;
  context: string[];
  directness: "supportive" | "balanced" | "blunt";
  techniques: string[];
  requestedOutput: string;
}

const DIRECTNESS_LABEL: Record<DirectnessLevel, MeaningPacket["directness"]> = {
  1: "supportive",
  2: "balanced",
  3: "blunt",
};

export function compileMeaningPacket(input: {
  rawInput: string;
  directness: DirectnessLevel;
  techniques: TechniqueId[];
  context: ContextItem[];
}): MeaningPacket {
  const original = input.rawInput.trim();
  const sentences = original.split(/(?<=[.!?])\s+/).filter(Boolean);
  return {
    version: 1,
    original,
    intent: sentences[0] || original,
    context: input.context.map((item) => item.label),
    directness: DIRECTNESS_LABEL[input.directness],
    techniques: input.techniques.filter((id) => id !== "auto-detect"),
    requestedOutput: "Answer the request directly, preserve the user's meaning, and make the next action obvious.",
  };
}

export function buildAiReadyRequest(packet: MeaningPacket): string {
  const context = packet.context.length ? "\nCONTEXT\n- " + packet.context.join("\n- ") : "";
  const techniques = packet.techniques.length
    ? "\nMETHODS\nUse: " + packet.techniques.join(", ") + "."
    : "";
  return [
    "REQUEST",
    packet.original,
    context,
    "",
    "RESPONSE STYLE",
    "Use a " + packet.directness + " tone. " + packet.requestedOutput,
    techniques,
  ].filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n");
}

export function destinationLabel(selection: DestinationSelection): string {
  const provider = DESTINATION_PROVIDERS.find((item) => item.id === selection.providerId);
  const model = provider?.models.find((item) => item.id === selection.modelId);
  if (!provider) return "Any AI — Universal";
  return provider.id === "universal" ? provider.label : provider.label + (model ? " · " + model.label : "");
}

export function destinationOfficialUrl(selection: DestinationSelection): string | null {
  return DESTINATION_PROVIDERS.find((item) => item.id === selection.providerId)?.officialUrl ?? null;
}

export const NO_CREDIT_BADGE = "No Divergence credits";
