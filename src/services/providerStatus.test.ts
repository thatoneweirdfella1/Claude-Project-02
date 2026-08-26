import { describe, expect, it } from "vitest";
import { getProviderAvailability } from "./providerStatus";

describe("provider availability preflight", () => {
  it("accepts only explicit true flags and never receives secrets", async () => {
    const status = await getProviderAvailability(async () => new Response(JSON.stringify({
      anthropic: true,
      openai: false,
      google: "yes",
      xai: true,
    }), { status: 200 }) as unknown as Promise<Response>);
    expect(status).toEqual({
      anthropic: true,
      openai: false,
      google: false,
      xai: true,
      deepseek: false,
    });
    expect(JSON.stringify(status)).not.toContain("key");
  });

  it("fails every provider closed on network or authorization failure", async () => {
    const failed = await getProviderAvailability(async () => new Response("no", { status: 401 }) as unknown as Promise<Response>);
    expect(Object.values(failed).every((value) => value === false)).toBe(true);
  });
});
