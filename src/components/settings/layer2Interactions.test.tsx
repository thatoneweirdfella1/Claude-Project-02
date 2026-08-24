import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { ApprovedKeyboardShortcutsModal } from "../ApprovedKeyboardShortcutsModal";
import { createInitialAccountState, useAccountStore } from "../../stores/accountStore";
import { InteractivePersonalOptimization } from "./InteractivePersonalOptimization";
import { InteractivePlanControls } from "./InteractivePlanControls";

let root: Root | null = null;
let host: HTMLDivElement | null = null;

function mount(node: React.ReactNode) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(node));
  return host;
}

function button(label: string) {
  const match = [...(host?.querySelectorAll("button") ?? [])].find((item) => item.textContent?.includes(label));
  if (!(match instanceof HTMLButtonElement)) throw new Error(`Missing button: ${label}`);
  return match;
}

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
  useAccountStore.setState(createInitialAccountState());
});

describe("Layer 2 safe interaction surfaces", () => {
  it("previews a plan without creating a payment or changing the plan", () => {
    mount(<InteractivePlanControls />);
    act(() => button("Preview Plus").click());
    expect(host?.querySelector('[role="dialog"]')?.textContent).toContain("No checkout was created");
    expect(useAccountStore.getState().manualPaymentRequests).toHaveLength(0);
    expect(useAccountStore.getState().plan).toBe("free");
    act(() => button("Close preview").click());
    expect(host?.querySelector('[role="dialog"]')).toBeNull();
  });

  it("previews optimization without processing conversations", () => {
    mount(<InteractivePersonalOptimization />);
    const checks = [...(host?.querySelectorAll('input[type="checkbox"]') ?? [])] as HTMLInputElement[];
    act(() => { checks[0].click(); checks[1].click(); });
    act(() => button("Preview analysis state").click());
    expect(host?.querySelector('[role="status"]')?.textContent).toContain("No conversation was processed");
    expect(useAccountStore.getState().optimizationRuns).toHaveLength(0);
  });

  it("closes the shortcuts dialog with Escape", () => {
    function Harness() {
      const [open, setOpen] = useState(true);
      return <ApprovedKeyboardShortcutsModal open={open} onClose={() => setOpen(false)} />;
    }
    mount(<Harness />);
    expect(host?.querySelector('[role="dialog"]')).not.toBeNull();
    act(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(host?.querySelector('[role="dialog"]')).toBeNull();
  });
});
