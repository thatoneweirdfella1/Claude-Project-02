/* Client-side app access storage — confirms the header helper reads exactly
   what's stored, storage round-trips through localStorage, and clearing
   actually clears (rather than leaving a stale empty string that would
   still satisfy a server checking against an empty configured password —
   appAccess.ts's own isAuthorized already guards that server-side, but the
   client shouldn't rely solely on that). */

import { beforeEach, describe, expect, it } from "vitest";
import { APP_PASSWORD_HEADER } from "./appAccess";
import {
  appAccessHeaders,
  clearStoredAppPassword,
  getStoredAppPassword,
  setStoredAppPassword,
} from "./appAccessClient";

beforeEach(() => {
  localStorage.clear();
});

describe("getStoredAppPassword / setStoredAppPassword", () => {
  it("returns an empty string when nothing is stored", () => {
    expect(getStoredAppPassword()).toBe("");
  });

  it("round-trips a stored value", () => {
    setStoredAppPassword("hunter2");
    expect(getStoredAppPassword()).toBe("hunter2");
  });
});

describe("clearStoredAppPassword", () => {
  it("removes a previously stored value", () => {
    setStoredAppPassword("hunter2");
    clearStoredAppPassword();
    expect(getStoredAppPassword()).toBe("");
  });
});

describe("appAccessHeaders", () => {
  it("is empty when nothing is stored", () => {
    expect(appAccessHeaders()).toEqual({});
  });

  it("carries the stored password under the shared header name", () => {
    setStoredAppPassword("hunter2");
    expect(appAccessHeaders()).toEqual({ [APP_PASSWORD_HEADER]: "hunter2" });
  });
});
