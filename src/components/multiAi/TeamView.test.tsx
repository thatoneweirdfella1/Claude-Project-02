import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TeamPanel, TeamView } from "./TeamView";
import { MODEL_REGISTRY, type ModelId } from "../../services/modelRegistry";
import type { TeamResult } from "../../services/team/runTeam";
const mocks = vi.hoisted(() => ({ run: vi.fn() }));
vi.mock("../../services/team/client", () => ({ runBrowserTeam: mocks.run }));
let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
  for (const name of ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GOOGLE_API_KEY", "XAI_API_KEY", "DEEPSEEK_API_KEY", "GROQ_API_KEY", "OPENROUTER_API_KEY", "HF_TOKEN", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "NVIDIA_API_KEY"]) vi.stubEnv(name, "");
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Unexpected network"); }));
  mocks.run.mockReset();
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
function result(): TeamResult {
  return { status: "ready", members: (["llama-3.3-70b-versatile", "gemini-flash", "@cf/meta/llama-3.1-8b-instruct"] as ModelId[]).map((id, i) => {
    const model = MODEL_REGISTRY[id];
    return { model: id, provider: model.provider, label: model.label, status: "answered", revision: "revised", roundOne: "FIRST_" + i, roundTwo: "SHARED\n\nCHOICE_" + i };
  }) };
}
describe("S3 Team view", () => {
  it("renders agreement, visible disagreements and changes in that order with source names", () => {
    act(() => root.render(<TeamView result={result()} />));
    expect([...host.querySelectorAll("[data-team-part]")].map((n) => n.getAttribute("data-team-part"))).toEqual(["agreement", "disagreement", "changed"]);
    expect(host.querySelector("details")).toBeNull();
    for (const text of ["SHARED", "CHOICE_0", "CHOICE_1", "CHOICE_2", "FIRST_0", "Groq", "Gemini", "Cloudflare"]) expect(host.textContent).toContain(text);
  });

  it("shows failed and unrevised members honestly and counts only returned answers", () => {
    const value = result();
    value.members[1] = { ...value.members[1], roundTwo: undefined, revision: "unrevised" };
    value.members[2] = { ...value.members[2], status: "unreachable", roundOne: undefined, roundTwo: undefined, revision: undefined };
    act(() => root.render(<TeamView result={value} />));
    expect(host.textContent).toContain("2 answering members");
    expect(host.textContent).toContain("unreachable");
    expect(host.textContent).toContain("not revised");
    expect(host.textContent).toContain("FIRST_1");
  });

  it("shows the plain refusal when only one provider is available", async () => {
    const message = "Team mode needs at least two reachable free providers with keys and available allowance.";
    mocks.run.mockResolvedValue({ status: "refused", members: [], message });
    act(() => root.render(<TeamPanel question="SYNTHETIC_QUESTION" />));
    await act(async () => host.querySelector<HTMLButtonElement>("button")!.click());
    expect(host.textContent).toContain(message);
    expect(host.querySelector("[data-team-part]")).toBeNull();
  });

  it("prevents duplicate starts and cancels the pending request on unmount", async () => {
    let signal: AbortSignal | undefined;
    let finish!: (value: TeamResult) => void;
    mocks.run.mockImplementation((_question, options) => { signal = options.signal; return new Promise((resolve) => { finish = resolve; }); });
    act(() => root.render(<TeamPanel question="SYNTHETIC_QUESTION" />));
    act(() => { host.querySelector<HTMLButtonElement>("button")!.click(); host.querySelector<HTMLButtonElement>("button")!.click(); });
    expect(mocks.run).toHaveBeenCalledTimes(1);
    act(() => root.render(<div />));
    expect(signal?.aborted).toBe(true);
    await act(async () => finish(result()));
    expect(host.querySelector('[data-testid="team-view"]')).toBeNull();
  });
});
