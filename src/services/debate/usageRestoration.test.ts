import { describe, expect, it, vi } from "vitest";
import { handleOpenAiRequest } from "./openaiHandler";
import { handleXaiRequest } from "./xaiHandler";
import { handleDeepseekRequest } from "./deepseekHandler";
import { handleGoogleRequest } from "./googleHandler";

function request(model: string): Request {
  return new Request("https://app.test/api/partner", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ model, system: "s", input: "i" }),
  });
}
function upstream(payload: unknown) {
  return vi.fn<typeof fetch>(async () => new Response(JSON.stringify(payload), {
    status: 200, headers: { "content-type": "application/json" },
  }));
}
const chat = { choices: [{ message: { content: "Measured answer" } }] };

describe("M3 provider usage survives the complete proxy path", () => {
  it.each([
    { model: "gpt-5.5", handler: handleOpenAiRequest },
    { model: "grok-4.3", handler: handleXaiRequest },
    { model: "deepseek-v4-pro", handler: handleDeepseekRequest },
  ])("preserves measured tokens for $model without exposing the raw reply", async ({ model, handler }) => {
    const fetchImpl = upstream({ ...chat, usage: { prompt_tokens: 123, completion_tokens: 45 }, privateProviderDetail: "not-for-the-browser" });
    const response = await handler(request(model), "unit-test-placeholder", fetchImpl);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ text: "Measured answer", usage: { inputTokens: 123, outputTokens: 45 } });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("normalizes the alternate OpenAI-compatible token field names", async () => {
    const response = await handleOpenAiRequest(request("gpt-5.5"), "unit-test-placeholder", upstream({
      ...chat, usage: { input_tokens: 17, output_tokens: 9 },
    }));
    expect(await response.json()).toEqual({ text: "Measured answer", usage: { inputTokens: 17, outputTokens: 9 } });
  });

  it("preserves Gemini token counts and calls the required upstream model id", async () => {
    const fetchImpl = upstream({
      candidates: [{ content: { parts: [{ text: "Measured Gemini answer" }] } }],
      usageMetadata: { promptTokenCount: 200, candidatesTokenCount: 50 },
    });
    const response = await handleGoogleRequest(request("gemini-3.1-pro"), "unit-test-placeholder", fetchImpl);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ text: "Measured Gemini answer", usage: { inputTokens: 200, outputTokens: 50 } });
    expect(String(fetchImpl.mock.calls[0][0])).toBe("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent");
  });

  it("keeps missing usage absent instead of inventing a zero-cost measurement", async () => {
    const response = await handleOpenAiRequest(request("gpt-5.5"), "unit-test-placeholder", upstream(chat));
    expect(await response.json()).toEqual({ text: "Measured answer" });
  });
});
