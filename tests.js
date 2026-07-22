"use strict";
const R = require("./routing.js");

function show(r) {
  return `cx=${String(r.complexity).padStart(2)} eff=${String(r.effectiveComplexity).padStart(2)}  -> ${r.modelLabel.padEnd(10)} ${r.dimensions.domain.padEnd(16)} ${r.dimensions.scope.padEnd(6)} ${r.dimensions.certainty}`;
}

console.log("=".repeat(76));
console.log("PROBE: routing is not a stub (3 runs each, paid plan, no override)");
console.log("=".repeat(76));
const p1 = "what year did world war two end";
const p2 = "design a distributed consensus protocol and analyze its failure modes under network partition with byzantine actors";
for (const [name, p] of [["simple", p1], ["hard", p2]]) {
  const runs = [1, 2, 3].map(() => R.route({ prompt: p, confidence: 95, plan: "paid" }));
  const models = runs.map(r => r.model).join(",");
  console.log(`\n[${name}] 3 runs -> models: ${models}`);
  console.log("  " + show(runs[0]));
}
const a = R.route({ prompt: p1, confidence: 95, plan: "paid" });
const b = R.route({ prompt: p2, confidence: 95, plan: "paid" });
console.log(`\nDifferent models on auto: ${a.model !== b.model ? "YES (" + a.model + " vs " + b.model + ")" : "NO - STUB FAILURE"}`);

console.log("\n" + "=".repeat(76));
console.log("CLIFF TEST: 10 questions of ascending complexity (paid plan, conf 95)");
console.log("=".repeat(76));
const ramp = [
  "what year did world war two end",
  "convert 250 fahrenheit to celsius",
  "summarize the plot of hamlet in three sentences",
  "explain the difference between tcp and udp",
  "compare python and rust for a small web scraper and recommend one",
  "review this budget: income 3200 dollars, rent 1400 dollars, car 450 dollars, food 600 dollars, debt payments 900 dollars. diagnose the problem and propose two fixes",
  "design a caching strategy for a read-heavy api given a stale data tolerance of 5 minutes and limited to one region",
  "analyze the tradeoffs between microservices and a monolith for a six person startup, including failure modes and migration cost, and recommend a path",
  "design a distributed consensus protocol and analyze its failure modes under network partition",
  "design a distributed consensus protocol tolerant to byzantine actors, prove its safety and liveness properties, and analyze behavior under network partition with asynchronous message delivery"
];
let prev = 0, monotonicViolations = 0;
ramp.forEach((q, i) => {
  const r = R.route({ prompt: q, confidence: 95, plan: "paid" });
  const flag = r.complexity < prev ? "  <-- drop below previous level" : "";
  if (r.complexity < prev) monotonicViolations++;
  prev = r.complexity;
  console.log(`Q${String(i + 1).padStart(2)}  ${show(r)}${flag}`);
});
console.log(`\nMonotonicity violations on the ramp: ${monotonicViolations}`);
const rampModels = ramp.map(q => R.route({ prompt: q, confidence: 95, plan: "paid" }).model);
const distinct = [...new Set(rampModels)];
console.log(`Distinct models used across ramp: ${distinct.join(", ")}  ${distinct.length >= 3 ? "(all three tiers exercised)" : distinct.length === 1 ? "FLAT LINE - router not differentiating" : ""}`);

console.log("\n" + "=".repeat(76));
console.log("EDGE STRESS: the scoring model's own failure shapes");
console.log("=".repeat(76));
const edges = [
  ["long but trivial", "what year did world war two end, i mean the big one, the one with all the countries involved everywhere across europe and the pacific and africa and everything, the second one, world war two"],
  ["short but hard", "prove the halting problem is undecidable"],
  ["length-padded retrieval", "list the planets of the solar system in order from the sun please and thank you so much this is for my kid"],
  ["constraints w/o analysis", "convert 250 fahrenheit to celsius within 2 decimal places given standard pressure"],
  ["decision, medium", "should i take the job in austin or stay remote, the austin one pays 15% more"],
  ["health, surface", "what is a normal resting heart rate"],
  ["health, deep", "analyze whether my medication schedule could explain afternoon crashes given doses at 8am and 2pm"]
];
edges.forEach(([label, q]) => {
  const r = R.route({ prompt: q, confidence: 95, plan: "paid" });
  console.log(`${label.padEnd(26)} ${show(r)}`);
});

console.log("\n" + "=".repeat(76));
console.log("CONFIDENCE COUPLING: same question, three confidence levels (paid)");
console.log("=".repeat(76));
const q = "compare python and rust for a small web scraper and recommend one";
[95, 70, 45].forEach(c => {
  const r = R.route({ prompt: q, confidence: c, plan: "paid" });
  console.log(`conf=${String(c).padStart(3)}  ${show(r)}  ${r.notes.length ? "note: " + r.notes[0].slice(0, 70) + "..." : ""}`);
});

console.log("\n" + "=".repeat(76));
console.log("PLAN GATING: opus-tier question on free vs paid; override rules");
console.log("=".repeat(76));
const hard = ramp[9];
const freeR = R.route({ prompt: hard, confidence: 95, plan: "free" });
const paidR = R.route({ prompt: hard, confidence: 95, plan: "paid" });
console.log(`free : -> ${freeR.modelLabel}  downgraded=${freeR.downgraded}  thinkingApplied=${freeR.thinkingApplied}`);
console.log(`paid : -> ${paidR.modelLabel}  downgraded=${paidR.downgraded}  thinkingApplied=${paidR.thinkingApplied}`);
const ovFree = R.route({ prompt: "what year did world war two end", confidence: 95, plan: "free", override: "opus" });
const ovPaid = R.route({ prompt: "what year did world war two end", confidence: 95, plan: "paid", override: "opus" });
console.log(`free + opus override : -> ${ovFree.modelLabel} (override ${ovFree.model === "opus" ? "honored" : "blocked, plan-gated"})`);
console.log(`paid + opus override : -> ${ovPaid.modelLabel} (override ${ovPaid.model === "opus" ? "honored: user override always wins" : "BLOCKED - BUG"})`);

console.log("\n" + "=".repeat(76));
console.log("PORTED FROM PRIOR ATTEMPT: scorer lies and override edge");
console.log("=".repeat(76));
const lies = [
  ["mention is not use (verb in noun phrase)", "what year did the paper that analyzed byzantine consensus come out"],
  ["mention is not use (noun-verb ambiguous)", "what year did the design of the tcp protocol get standardized"],
  ["apology-padded lookup", "sorry to bother you but could you please tell me what year did world war two end thanks so much"]
];
lies.forEach(([label, q]) => {
  const r = R.route({ prompt: q, confidence: 95, plan: "paid" });
  console.log(`${label.padEnd(42)} cx=${r.complexity} -> ${r.modelLabel}`);
});
const hardQ = "design a distributed consensus protocol tolerant to byzantine actors, prove its safety and liveness properties, and analyze behavior under network partition with asynchronous message delivery";
const ovHaiku = R.route({ prompt: hardQ, confidence: 95, plan: "paid", override: "haiku" });
console.log(`haiku override on a complexity-10 question -> ${ovHaiku.modelLabel} (override ${ovHaiku.model === "haiku" ? "wins, as the spec requires" : "BLOCKED - BUG"})`);
