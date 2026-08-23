import { create } from "zustand";
import type {
  DestinationSelection,
  DirectnessLevel,
  MethodologyType,
  TechniqueId,
  TranslatorEngine,
} from "./types";

export interface RequestDefaults {
  destination: DestinationSelection;
  translatorEngine: TranslatorEngine;
  reviewBeforeSend: boolean;
  paidFallbackEnabled: boolean;
  maxRequestCost: number;
  techniques: TechniqueId[];
  methodology: MethodologyType;
}

interface SettingsDefaultsState {
  directness: DirectnessLevel;
  requestDefaults: RequestDefaults;
  setDirectness: (directness: DirectnessLevel) => void;
  setRequestDefaults: (defaults: RequestDefaults) => void;
}

const STORAGE_KEY = "divergence-ai-request-defaults-v2";

export const DEFAULT_REQUEST_SETTINGS: Pick<SettingsDefaultsState, "directness" | "requestDefaults"> = {
  directness: 2,
  requestDefaults: {
    destination: { providerId: "universal", modelId: "universal" },
    translatorEngine: "auto-free-first",
    reviewBeforeSend: true,
    paidFallbackEnabled: false,
    maxRequestCost: 0.25,
    techniques: ["auto-detect"],
    methodology: "standard",
  },
};

function readPersistedDefaults(): Pick<SettingsDefaultsState, "directness" | "requestDefaults"> {
  if (typeof localStorage === "undefined") return DEFAULT_REQUEST_SETTINGS;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<SettingsDefaultsState> | null;
    const directness = parsed?.directness === 1 || parsed?.directness === 2 || parsed?.directness === 3
      ? parsed.directness
      : DEFAULT_REQUEST_SETTINGS.directness;
    const saved = parsed?.requestDefaults;
    return {
      directness,
      requestDefaults: saved
        ? {
            ...DEFAULT_REQUEST_SETTINGS.requestDefaults,
            ...saved,
            destination: saved.destination ?? DEFAULT_REQUEST_SETTINGS.requestDefaults.destination,
            techniques: Array.isArray(saved.techniques) && saved.techniques.length
              ? [...saved.techniques]
              : ["auto-detect"],
            maxRequestCost: Math.max(0, Number(saved.maxRequestCost) || 0),
          }
        : { ...DEFAULT_REQUEST_SETTINGS.requestDefaults, techniques: ["auto-detect"] },
    };
  } catch {
    return DEFAULT_REQUEST_SETTINGS;
  }
}

function persist(state: Pick<SettingsDefaultsState, "directness" | "requestDefaults">): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Browser storage can be unavailable; session persistence still protects active work.
  }
}

export const useSettingsDefaultsStore = create<SettingsDefaultsState>((set, get) => ({
  ...readPersistedDefaults(),
  setDirectness: (directness) => {
    set({ directness });
    persist({ directness, requestDefaults: get().requestDefaults });
  },
  setRequestDefaults: (requestDefaults) => {
    const next = { ...requestDefaults, techniques: [...requestDefaults.techniques] };
    set({ requestDefaults: next });
    persist({ directness: get().directness, requestDefaults: next });
  },
}));
