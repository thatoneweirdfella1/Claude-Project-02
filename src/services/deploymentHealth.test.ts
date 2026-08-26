import { describe, expect, it } from "vitest";
import { deploymentHealth } from "./deploymentHealth";

describe("Layer 7 deployment identity", () => {
  it("reports the exact running commit without exposing configuration", async () => {
    const response = deploymentHealth(new Request("https://app.test/api/health"), {
      VERCEL_GIT_COMMIT_SHA: "abc123",
      VERCEL_ENV: "preview",
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "ok",
      layer: 7,
      commit: "abc123",
      environment: "preview",
      connectedExecution: true,
    });
  });

  it("rejects mutation methods", () => {
    expect(deploymentHealth(new Request("https://app.test/api/health", { method: "POST" }), {}).status).toBe(405);
  });
});
