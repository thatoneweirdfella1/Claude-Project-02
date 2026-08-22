import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_REQUEST_SETTINGS, useSettingsDefaultsStore } from "./settingsDefaultsStore";
import { createInitialSessionState, useSessionStore } from "./sessionStore";

beforeEach(() => {
  localStorage.clear();
  useSettingsDefaultsStore.setState({
    directness: DEFAULT_REQUEST_SETTINGS.directness,
    requestDefaults: {
      ...DEFAULT_REQUEST_SETTINGS.requestDefaults,
      destination: { ...DEFAULT_REQUEST_SETTINGS.requestDefaults.destination },
      techniques: [...DEFAULT_REQUEST_SETTINGS.requestDefaults.techniques],
    },
  });
  useSessionStore.setState(createInitialSessionState());
});

describe("persistent request settings", () => {
  it("keeps Directness across a finished session", () => {
    useSessionStore.getState().setDirectness(3);
    useSessionStore.getState().resetSession();
    expect(useSessionStore.getState().directness).toBe(3);
    expect(JSON.parse(localStorage.getItem("divergence-ai-request-defaults-v1") ?? "null").directness).toBe(3);
  });

  it("uses saved Advanced Controls defaults for the next finished session", () => {
    useSettingsDefaultsStore.getState().setRequestDefaults({
      ...DEFAULT_REQUEST_SETTINGS.requestDefaults,
      reviewBeforeSend: false,
      stateDetectionMode: "manual-paid",
      techniques: ["verify"],
    });
    useSessionStore.getState().resetSession();
    const session = useSessionStore.getState();
    expect(session.reviewBeforeSend).toBe(false);
    expect(session.stateDetectionMode).toBe("manual-paid");
    expect(session.techniques).toEqual(["verify"]);
  });
});

