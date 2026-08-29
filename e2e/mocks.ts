import type { Page, Route } from "@playwright/test";
import { TRANSLATION_SYSTEM_PROMPT } from "../src/services/translation/prompt";
import { DETECTION_SYSTEM_PROMPT } from "../src/services/detection/prompt";
import { debateSystemPrompt } from "../src/services/debate/prompt";
import { CONSENSUS_SYSTEM_PROMPT, SYNTHESIS_SYSTEM_PROMPT } from "../src/services/multiAi/prompt";

/* e2e/mocks.ts (Step 12.2) — the network-boundary stub every E2E test uses.

   Nothing in this build's sandbox can reach a real model (proxy live-deploy
   is parked for Step 12.3 — BUILD-LOG.md). Rather than skip the flows that
   need a model reply, this intercepts at the exact seam the real app already
   isolates for testing: proxyClient.ts POSTs JSON to /api/proxy and expects
   either a non-streamed Anthropic Messages response or an SSE stream of
   content_block_delta events (see proxyClient.ts's own parser, mirrored
   exactly here); createPartnerClient POSTs to /api/proxy-<provider> and
   expects the serverless function's own already-normalized {text} shape
   (see debate/client.ts). Every route below returns exactly what the real
   serverless functions would return to the browser — only the model
   inference itself is stubbed, not any client-side app logic.

   Requests are routed to the right canned reply by SYSTEM PROMPT, imported
   directly from the real source files (not re-typed strings) so a prompt
   change elsewhere in the app can't silently desync this mock from what the
   app actually sends. The one ambiguity that can't be resolved by prompt
   alone — the final answer's streamed execution call also uses whichever
   model routing.js picked, sharing no fixed system prompt — is resolved by
   the `stream: true` flag, which only that call ever sets. */

export interface MockAnswer {
  /** Text fixture streamed back for the final "answering" pipeline stage. */
  answerText: string;
}

/** Every mocked call waits this long before fulfilling. Without it, every
    stage (translate -> detect -> route/compose -> stream) resolves within
    the same tick, so transient UI (the stage indicator, TranslationCard,
    partial streaming text) never gets a chance to actually render before
    CenterColumn.handleDone clears it — real network latency is what makes
    those states observable in production, so a zero-latency mock hides
    exactly the rendering this suite exists to check. */
const MOCK_LATENCY_MS = 250;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function anthropicJson(text: string): unknown {
  return {
    content: [{ type: "text", text }],
    usage: { input_tokens: 50, output_tokens: 50 },
  };
}

function sseBody(text: string): string {
  // Split into a few chunks so the client's streaming parser genuinely
  // processes multiple content_block_delta events, not just one — same
  // shape real Anthropic SSE takes, mirrored against proxyClient.ts's own
  // parser (content_block_delta / text_delta, message_start, message_delta).
  const words = text.split(" ");
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += 3) {
    chunks.push(words.slice(i, i + 3).join(" ") + (i + 3 < words.length ? " " : ""));
  }
  const lines: string[] = [
    `data: ${JSON.stringify({ type: "message_start", message: { usage: { input_tokens: 40, output_tokens: 0 } } })}`,
  ];
  for (const chunk of chunks) {
    lines.push(
      `data: ${JSON.stringify({ type: "content_block_delta", delta: { type: "text_delta", text: chunk } })}`,
    );
  }
  lines.push(`data: ${JSON.stringify({ type: "message_delta", usage: { output_tokens: chunks.length } })}`);
  lines.push("data: [DONE]");
  return lines.join("\n\n") + "\n\n";
}

const TRANSLATION_REPLY = {
  translatedPrompt: "What is the boiling point of water at sea level?",
  confidence: 95,
  detectedGaps: [],
  reasoning: "The question was clear and specific; no reframing was needed beyond tidying phrasing.",
};

const DETECTION_REPLY = {
  emotion: { value: "calm", confidence: 80 },
  rsd: { value: "low", confidence: 70 },
  interest: { value: "high", confidence: 85 },
  cognitive: { value: "analytical", confidence: 75 },
  summary: "You sound calm and analytical, genuinely curious about the answer.",
};

const CONSENSUS_REPLY = {
  disagreement: "Claude and the partner differ on how much nuance to include.",
  commonGround: "Both agree water boils at 100°C (212°F) at standard sea-level pressure.",
  unifiedView: "At sea level, water boils at 100°C / 212°F under standard atmospheric pressure (1 atm).",
};

const SYNTHESIS_REPLY = {
  refinedAnswer:
    "Water boils at 100°C (212°F) at sea level, where standard atmospheric pressure is 1 atm. This refined answer merges both sides' framing into one clear statement.",
};

/** Registers every /api/proxy* interception this suite needs. Call once per
    test, before navigating — Playwright routes registered on a Page apply to
    all subsequent requests from that page.

    Also mocks /api/verify-access as "no password configured" (requiresPassword:
    false) — AppAccessGate.tsx calls this once at mount before rendering
    anything else, mirroring the real behavior when APP_ACCESS_PASSWORD isn't
    set server-side (true for local dev and this whole E2E suite, same as it
    was before the access gate existed). Tests that specifically need to
    exercise the gate itself (e2e/access-gate.spec.ts) register their own,
    more specific route instead — Playwright matches the LAST-registered
    route for a URL first, so a test-specific route added after this call
    still wins. */
export async function installModelMocks(page: Page, answer: MockAnswer): Promise<void> {
  await page.route("**/api/account", async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        configured: false,
        user: null,
      }),
    });
  });

  await page.route("**/api/verify-access", async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ requiresPassword: false, ok: true }),
    });
  });

  await page.route("**/api/provider-status", async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        anthropic: true,
        openai: false,
        google: false,
        xai: false,
        deepseek: false,
      }),
    });
  });

  await page.route("**/api/proxy", async (route: Route) => {
    await delay(MOCK_LATENCY_MS);
    const request = route.request();
    const body = request.postDataJSON() as {
      model?: string;
      system?: string;
      stream?: boolean;
      messages?: Array<{ role: string; content: string }>;
    };

    // The one call that sets stream:true is always the pipeline's final
    // answer execution (Stage 5) — translation/detection/debate/consensus/
    // synthesis are all non-streamed completions (see each service's own
    // client.ts doc comment).
    if (body.stream) {
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        body: sseBody(answer.answerText),
      });
      return;
    }

    const system = body.system ?? "";

    if (system === TRANSLATION_SYSTEM_PROMPT) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(anthropicJson(JSON.stringify(TRANSLATION_REPLY))) });
      return;
    }
    if (system === DETECTION_SYSTEM_PROMPT) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(anthropicJson(JSON.stringify(DETECTION_REPLY))) });
      return;
    }
    if (system === CONSENSUS_SYSTEM_PROMPT) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(anthropicJson(JSON.stringify(CONSENSUS_REPLY))) });
      return;
    }
    if (system === SYNTHESIS_SYSTEM_PROMPT) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(anthropicJson(JSON.stringify(SYNTHESIS_REPLY))) });
      return;
    }
    if (system === debateSystemPrompt("for") || system === debateSystemPrompt("against")) {
      const stance = system === debateSystemPrompt("for") ? "for" : "against";
      const text =
        stance === "for"
          ? "Yes — water reliably boils at 100°C (212°F) at sea level under standard atmospheric pressure; this is a well-established physical constant."
          : "It depends on conditions — altitude, pressure, and dissolved solutes all shift the real boiling point away from the textbook 100°C figure.";
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(anthropicJson(text)) });
      return;
    }

    throw new Error(`Unrecognized /api/proxy request in E2E mock: ${JSON.stringify(body).slice(0, 300)}`);
  });

  await page.route("**/api/proxy-openai", async (route: Route) => {
    await delay(MOCK_LATENCY_MS);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        text: "From GPT-5.5: water's boiling point at sea level is 100°C (212°F) at 1 atm — though real-world results vary with impurities and exact pressure.",
      }),
    });
  });
}
