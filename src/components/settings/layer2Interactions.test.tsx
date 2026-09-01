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
  it("applies a verified sandbox checkout to both local ledgers without creating a payment request", async () => {
    mount(<InteractivePlanControls />);
    act(() => button("Start Plus sandbox checkout").click());
    expect(host?.querySelector('[role="dialog"]')?.textContent).toContain("No balance or entitlement changes");
    expect(host?.querySelector('[role="dialog"]')?.textContent).toContain("No real payment can occur");
    expect(useAccountStore.getState().manualPaymentRequests).toHaveLength(0);
    await act(async () => button("Apply verified sandbox callback").click());
    expect(host?.querySelector('[role="dialog"]')).toBeNull();
    expect(useAccountStore.getState().plan).toBe("plus");
    expect(useAccountStore.getState().creditBalance).toBe(15);
    expect(useAccountStore.getState().creditLedger).toHaveLength(1);
    expect(useAccountStore.getState().creditLedger[0].referenceId).toMatch(/^sandbox-checkout:/);
    expect(useAccountStore.getState().manualPaymentRequests).toHaveLength(0);
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
