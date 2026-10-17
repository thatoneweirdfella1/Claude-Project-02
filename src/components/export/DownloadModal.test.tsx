import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { DownloadModal } from "./DownloadModal";
import { createInitialSessionState, useSessionStore } from "../../stores/sessionStore";

let root: Root | null = null;
let host: HTMLDivElement | null = null;
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
  useSessionStore.setState(createInitialSessionState());
});
function mount() {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(<DownloadModal message={{ id: "m", role: "assistant", content: "Answer", timestamp: 1 }} telemetryEntry={null} onClose={() => undefined} />));
  return host;
}
function radio(label: string) {
  // The dialog is portaled outside the conversation's clipping container.
  const row = Array.from(document.querySelectorAll('[role="dialog"] label')).find((node) => node.textContent?.trim() === label);
  const input = row?.querySelector<HTMLInputElement>("input");
  expect(input, label).toBeDefined();
  return input!;
}

describe("U4 export chooser", () => {
  it("keeps single-answer selection, content controls and every legacy format", () => {
    mount();
    expect(radio("This answer").checked).toBe(true);
    expect(radio("Markdown").checked).toBe(true);
    for (const label of ["HTML", "JSON", "PDF"]) {
      expect(radio(label).disabled).toBe(false);
      act(() => radio(label).click());
      expect(radio(label).checked).toBe(true);
    }
    expect(radio("Answer text").checked).toBe(true);
  });
  it("keeps unavailable debate choices visible and explained", () => {
    mount();
    expect(radio("Just the conversation").disabled).toBe(false);
    expect(radio("Just the debate").disabled).toBe(true);
    expect(radio("Both").disabled).toBe(true);
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("No debate in this conversation yet.");
  });
  it("uses Markdown for conversation content while preserving the previous single-answer format", () => {
    mount();
    act(() => radio("HTML").click());
    act(() => radio("Just the conversation").click());
    expect(radio("Markdown").checked).toBe(true);
    for (const label of ["HTML", "JSON", "PDF"]) expect(radio(label).disabled).toBe(true);
    act(() => radio("This answer").click());
    expect(radio("HTML").checked).toBe(true);
    expect(radio("HTML").disabled).toBe(false);
  });
});
