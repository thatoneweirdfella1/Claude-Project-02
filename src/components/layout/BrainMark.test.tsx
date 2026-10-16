import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it } from "vitest";
import { createInitialAccountState, useAccountStore } from "../../stores/accountStore";
import { BrainMark } from "./BrainMark";

let root: Root | null = null;
let host: HTMLDivElement | null = null;

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
  useAccountStore.setState(createInitialAccountState());
});

it("uses the frozen gold mark even when saved account data selects original", () => {
  useAccountStore.setState({ ...createInitialAccountState(), layout: "original" });
  host = document.createElement("div");
  document.body.append(host);
  act(() => {
    root = createRoot(host!);
    root.render(<BrainMark />);
  });
  expect(host.querySelector("img.brain-mark")?.getAttribute("src")).toBe("/logo-mark-gold.png");
});
