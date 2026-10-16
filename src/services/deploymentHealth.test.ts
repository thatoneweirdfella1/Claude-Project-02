import { describe, expect, it } from "vitest";
import { deploymentHealth } from "./deploymentHealth";

describe("deployment identity", () => {
  it("reports the exact running commit without exposing configuration", async () => {
    const response = deploymentHealth(new Request("https://app.test/api/health"), {
      VERCEL_GIT_COMMIT_SHA: "abc123",
      VERCEL_GIT_COMMIT_REF: "build-1",
      VERCEL_ENV: "preview",
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "ok",
      commit: "abc123",
      branch: "build-1",
      environment: "preview",
    });
  });

  it("reports local identity when deployment environment values are absent", async () => {
    const response = deploymentHealth(new Request("https://app.test/api/health"), {});
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "ok",
      commit: "local",
      branch: "local",
      environment: "local",
    });
  });

  it("rejects mutation methods", () => {
    expect(deploymentHealth(new Request("https://app.test/api/health", { method: "POST" }), {}).status).toBe(405);
  });
});
