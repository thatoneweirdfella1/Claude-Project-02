import { describe, expect, it } from "vitest";
import * as markdown from "./renderMarkdown";
import type { ConversationMessage, MultiAiRunRecord } from "../../stores/types";

const conversation: ConversationMessage[] = [
  { id: "m1", role: "user", content: "Conversation question", timestamp: 1 },
  { id: "m2", role: "assistant", content: "Conversation answer", timestamp: 2 },
];
const debate: MultiAiRunRecord = {
  id: "debate-1", sourceMessageIds: ["m2"], createdAt: 3,
  question: "Debate question", status: "complete",
  participants: [
    { label: "Claude", provider: "anthropic", model: "claude-sonnet-5", status: "ok", text: "First debate view" },
    { label: "GPT-5.5", provider: "openai", model: "gpt-5.5", status: "ok", text: "Second debate view" },
  ], totalEstimatedCost: 0, totalActualCost: null,
};
const render = (markdown as unknown as {
  renderConversationMarkdown: (messages: ConversationMessage[], runs: MultiAiRunRecord[], scope: "conversation" | "debate" | "both") => string;
}).renderConversationMarkdown;

describe("U4 conversation and debate Markdown", () => {
  for (const scope of ["conversation", "debate", "both"] as const) {
    it(`renders ${scope} from the same fixture with exact inclusion and exclusion`, () => {
      const output = render(conversation, [debate], scope);
      if (scope !== "debate") {
        expect(output).toContain("## Conversation");
        expect(output).toContain("### User\n\nConversation question");
        expect(output).toContain("### Assistant\n\nConversation answer");
        expect(output.indexOf("Conversation question")).toBeLessThan(output.indexOf("Conversation answer"));
      } else {
        expect(output).not.toContain("## Conversation");
        expect(output).not.toContain("Conversation question");
        expect(output).not.toContain("Conversation answer");
      }
      if (scope !== "conversation") {
        expect(output).toContain("## Debate");
        expect(output).toContain("Debate question");
        expect(output).toContain("CLAUDE [anthropic");
        expect(output).toContain("GPT-5.5 [openai");
        expect(output).toContain("First debate view");
        expect(output).toContain("Second debate view");
        expect(output.indexOf("First debate view")).toBeLessThan(output.indexOf("Second debate view"));
      } else {
        expect(output).not.toContain("## Debate");
        expect(output).not.toContain("Debate question");
        expect(output).not.toContain("First debate view");
        expect(output).not.toContain("Second debate view");
      }
    });
  }
});
