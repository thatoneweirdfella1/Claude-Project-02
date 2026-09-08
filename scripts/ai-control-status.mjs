#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { blockNotice, validateControlState } from "./ai-control-state.mjs";

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const statePath = argument("state") || "docs/ai-control/CONTROL-STATE.json";
const state = JSON.parse(readFileSync(statePath, "utf8"));
const requested = argument("requested-task") || state.active_task;
const errors = validateControlState(state, { requestedTask: requested });

console.log(`REQUESTED TASK: ${requested}`);
console.log(`CURRENT TASK: ${state.active_task} / ${state.current_phase}`);
console.log(`SAFE TO SWITCH: ${state.safe_to_switch}`);
if (errors.length) {
  const notice = errors.find((error) => error.startsWith("BLOCKED:")) || blockNotice(requested, errors[0], state.first_unfinished_action);
  console.log(notice);
  process.exitCode = 2;
} else {
  console.log(`NEXT: ${state.first_unfinished_action}`);
}
