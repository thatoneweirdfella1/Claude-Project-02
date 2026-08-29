import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApprovedKeyboardShortcutsModal } from "../ApprovedKeyboardShortcutsModal";
import { createInitialAccountState, useAccountStore } from "../../stores/accountStore";
import { PersonalOptimization } from "../optimization/PersonalOptimization";
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
  it("keeps the deterministic plan checkout isolated from real account state", () => {
    mount(<InteractivePlanControls />);
    act(() => button("Start Plus sandbox checkout").click());
    expect(host?.querySelector('[role="dialog"]')?.textContent).toContain("No balance or entitlement changes");
    expect(host?.querySelector('[role="dialog"]')?.textContent).toContain("No real payment can occur");
    expect(useAccountStore.getState().manualPaymentRequests).toHaveLength(0);
    expect(useAccountStore.getState().plan).toBe("free");
    expect(useAccountStore.getState().creditBalance).toBe(0);
    act(() => button("Cancel").click());
    expect(host?.querySelector('[role="dialog"]')).toBeNull();
  });

  it("shows all frozen choices and makes no model call without eligible conversations", () => {
    const runOptimizer = vi.fn();
    mount(<PersonalOptimization runOptimizer={runOptimizer} />);
    const checks = [...(host?.querySelectorAll('input[type="checkbox"]') ?? [])] as HTMLInputElement[];
    expect(checks).toHaveLength(10);
    act(() => { checks[0].click(); });
    act(() => button("Personalize My Divergence").click());
    expect(host?.querySelector('[role="status"]')?.textContent).toContain("no eligible conversations");
    expect(runOptimizer).not.toHaveBeenCalled();
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
