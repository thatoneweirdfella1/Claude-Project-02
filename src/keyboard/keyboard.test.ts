/* Step 1.9 verification — the keyboard framework's core logic, exercised
   under happy-dom (window/document, focus, activeElement) without a component
   renderer. Covers the four required capabilities: focus trap + return,
   Escape-dismisses-topmost, typing isolation, destructive-action gating. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { isTypingTarget } from "./isTypingTarget";
import { pushDismissLayer, activeDismissLayerCount } from "./dismissLayers";
import { registerShortcut } from "./shortcutRegistry";
import { createFocusTrap, getFocusable } from "./focusTrap";
import { createConfirmable } from "./confirmable";

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

function pressKey(init: KeyboardEventInit, target: EventTarget = document): void {
  target.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, ...init }));
}

describe("isTypingTarget (the Critical typing-isolation predicate)", () => {
  it("is true for text input, textarea, select, and contenteditable", () => {
    const input = document.createElement("input");
    const textarea = document.createElement("textarea");
    const select = document.createElement("select");
    const editable = document.createElement("div");
    editable.contentEditable = "true";
    for (const el of [input, textarea, select, editable]) {
      expect(isTypingTarget(el)).toBe(true);
    }
  });

  it("is false for non-text inputs and non-fields", () => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    const button = document.createElement("button");
    expect(isTypingTarget(checkbox)).toBe(false);
    expect(isTypingTarget(button)).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });
});

describe("dismissLayers (Escape closes the topmost)", () => {
  it("dismisses only the topmost layer, LIFO", () => {
    const order: string[] = [];
    const popOuter = pushDismissLayer(() => order.push("outer"));
    const popInner = pushDismissLayer(() => order.push("inner"));
    expect(activeDismissLayerCount()).toBe(2);

    pressKey({ key: "Escape" });
    expect(order).toEqual(["inner"]); // only topmost fired

    popInner();
    pressKey({ key: "Escape" });
    expect(order).toEqual(["inner", "outer"]);

    popOuter();
    expect(activeDismissLayerCount()).toBe(0);
    pressKey({ key: "Escape" }); // no layers, no throw, no fire
    expect(order).toEqual(["inner", "outer"]);
  });

  it("fires Escape even from inside a focused text field (dismiss is not a shortcut)", () => {
    const input = document.createElement("input");
    document.body.appendChild(input);
    let dismissed = false;
    const pop = pushDismissLayer(() => (dismissed = true));
    pressKey({ key: "Escape" }, input);
    expect(dismissed).toBe(true);
    pop();
  });
});

describe("shortcutRegistry (global shortcuts + typing isolation)", () => {
  it("fires a matching combo and stops after unregister", () => {
    let count = 0;
    const off = registerShortcut("mod+k", () => count++);
    pressKey({ key: "k", ctrlKey: true });
    expect(count).toBe(1);
    pressKey({ key: "k", metaKey: true }); // mod = ctrl OR meta
    expect(count).toBe(2);
    off();
    pressKey({ key: "k", ctrlKey: true });
    expect(count).toBe(2);
  });

  it("does NOT fire a shortcut while typing in a field (the Critical rule)", () => {
    const input = document.createElement("input");
    document.body.appendChild(input);
    let fired = 0;
    const off = registerShortcut("mod+k", () => fired++);
    pressKey({ key: "k", ctrlKey: true }, input);
    expect(fired).toBe(0);
    off();
  });

  it("fires in a field when allowInTextField is set (e.g. ctrl+enter to send)", () => {
    const input = document.createElement("input");
    document.body.appendChild(input);
    let sent = 0;
    const off = registerShortcut("mod+enter", () => sent++, {
      allowInTextField: true,
    });
    pressKey({ key: "Enter", ctrlKey: true }, input);
    expect(sent).toBe(1);
    off();
  });

  it("a bare-key shortcut does not fire when a modifier is held", () => {
    let fired = 0;
    const off = registerShortcut("?", () => fired++);
    pressKey({ key: "?", ctrlKey: true });
    expect(fired).toBe(0);
    pressKey({ key: "?" });
    expect(fired).toBe(1);
    off();
  });
});

describe("focusTrap (containment + return to trigger)", () => {
  function buildModal(): { trigger: HTMLButtonElement; modal: HTMLDivElement } {
    const trigger = document.createElement("button");
    trigger.textContent = "open";
    const modal = document.createElement("div");
    modal.innerHTML =
      '<button id="a">a</button><button id="b">b</button><button id="c">c</button>';
    document.body.append(trigger, modal);
    return { trigger, modal };
  }

  it("lists focusable descendants in DOM order, skipping disabled/tabindex=-1", () => {
    const modal = document.createElement("div");
    modal.innerHTML =
      '<button id="a">a</button><button id="x" disabled>x</button>' +
      '<input id="b"><span tabindex="-1">no</span><a id="c" href="#">c</a>';
    document.body.appendChild(modal);
    expect(getFocusable(modal).map((el) => el.id)).toEqual(["a", "b", "c"]);
  });

  it("moves focus inside on activate and returns to trigger on release", () => {
    const { trigger, modal } = buildModal();
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const trap = createFocusTrap(modal);
    trap.activate();
    expect(document.activeElement).toBe(modal.querySelector("#a"));

    trap.release();
    expect(document.activeElement).toBe(trigger);
  });

  it("wraps Tab from last to first and Shift+Tab from first to last", () => {
    const { modal } = buildModal();
    const first = modal.querySelector<HTMLElement>("#a")!;
    const last = modal.querySelector<HTMLElement>("#c")!;
    const trap = createFocusTrap(modal);
    trap.activate();

    last.focus();
    pressKey({ key: "Tab" }, last);
    expect(document.activeElement).toBe(first);

    first.focus();
    pressKey({ key: "Tab", shiftKey: true }, first);
    expect(document.activeElement).toBe(last);

    trap.release();
  });
});

describe("confirmable (destructive action can't fire from one keypress)", () => {
  it("requires two triggers to run the action", () => {
    let ran = 0;
    const c = createConfirmable(() => ran++);
    c.trigger();
    expect(c.armed).toBe(true);
    expect(ran).toBe(0); // one stray keypress did NOTHING
    c.trigger();
    expect(ran).toBe(1);
    expect(c.armed).toBe(false);
    c.dispose();
  });

  it("auto-disarms after the timeout so a stale arm can't be confirmed later", () => {
    vi.useFakeTimers();
    let ran = 0;
    const c = createConfirmable(() => ran++, { timeoutMs: 4000 });
    c.trigger();
    expect(c.armed).toBe(true);
    vi.advanceTimersByTime(4000);
    expect(c.armed).toBe(false);
    c.trigger(); // this is now a fresh first-arm, not a confirm
    expect(ran).toBe(0);
    c.dispose();
  });

  it("cancel disarms without running", () => {
    let ran = 0;
    const c = createConfirmable(() => ran++);
    c.trigger();
    c.cancel();
    expect(c.armed).toBe(false);
    c.trigger();
    expect(ran).toBe(0); // back to needing two again
    c.dispose();
  });
});
