import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it } from "vitest";
import { createInitialAccountState, useAccountStore } from "../../stores/accountStore";
import { VisibilityMenu } from "./VisibilityMenu";

let root: Root | null = null;
let host: HTMLDivElement | null = null;

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
  useAccountStore.setState(createInitialAccountState());
});

it("keeps Theme and Sidebar Visibility settings without obsolete layout choices", () => {
  useAccountStore.setState(createInitialAccountState());
  host = document.createElement("div");
  document.body.append(host);
  act(() => {
    root = createRoot(host!);
    root.render(<VisibilityMenu />);
  });
  const gear = host.querySelector<HTMLButtonElement>('[data-testid="visibility-gear"]');
  expect(gear).not.toBeNull();
  act(() => gear!.click());

  const menu = host.querySelector('[role="menu"]');
  expect(menu).not.toBeNull();
  const theme = menu!.querySelector('[role="radiogroup"][aria-label="Theme"]');
  expect(theme).not.toBeNull();
  expect([...theme!.querySelectorAll('[role="radio"]')].map((radio) => radio.getAttribute("aria-label")))
    .toEqual(["Light", "Dark", "Auto"]);
  expect(menu!.textContent).toContain("Sidebar Visibility");
  for (const label of ["Recent Sessions", "Context Snapshot", "Recent Activity", "Token Usage", "Model Status", "Quick Tools", "Active Session"]) {
    const row = [...menu!.querySelectorAll("label")].find((node) => node.textContent?.trim() === label);
    expect(row?.querySelector('input[type="checkbox"]'), label).toBeTruthy();
  }
  expect([...menu!.querySelectorAll("button")].some((button) => button.textContent === "Reset to defaults")).toBe(true);
  expect(menu!.querySelector('[role="radiogroup"][aria-label="Layout"]')).toBeNull();
  expect(menu!.querySelector('[role="radio"][aria-label="Original"]')).toBeNull();
  expect(menu!.querySelector('[role="radio"][aria-label="Gold"]')).toBeNull();
});
