import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterAll, afterEach, beforeAll, expect, it } from "vitest";
import { createInitialAccountState, useAccountStore } from "../../stores/accountStore";
import { BrainMark } from "./BrainMark";

let root: Root | null = null;
let host: HTMLDivElement | null = null;
const actEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
const previousActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;

beforeAll(() => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
});

afterAll(() => {
  if (previousActEnvironment === undefined) delete actEnvironment.IS_REACT_ACT_ENVIRONMENT;
  else actEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
});

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
