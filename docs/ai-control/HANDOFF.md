# Exact Handoff State

## Current state

- The reliability meta-blueprint has been finalized as a proposed planning artifact, not an approved or independently verified architecture.
- The standalone F0 task exists and now includes mandatory repository, branch, layout, scope, logging, and handoff controls.
- The cross-AI packet was installed on integration branch `divergence/reliability-v1`; exactly one reusable task branch, `divergence/reliability-staging`, now exists from integration commit `7681344918a912f0ac35a2fb15c2b41b85638a3f`.
- F0 has not been executed and is blocked while G0 is active.
- G0's fail-closed course controller is installed at commit `d417f10cd3ee543fb0facde7bd620b0a029ebd72`.
- The validator and revised adversarial harness pass 18/18 local tests. First staging-flow runs failed because G0's allowlist omitted its necessary standalone-handoff update; that failure is retained as E-013. The corrected integration run `34070234656` and staging run `34070235162` both passed.
- All four required DIVERGENCE rulesets are active and were independently read back with exact targets, rules, empty bypass lists, and no current-user bypass.
- Mechanical enforcement is implemented and tested: the validator has an 18-case adversarial harness, passed workflows on both reusable refs, and rejected live invalid checkpoint `4d6755ac14753d8dfa0bd0174b4f162f13c1d2cc` in run `34143620380`.
- Later cold-start retries were retained: one failed safely on a stale local object database, and the exact-remote retry found four additional stale status statements. Those manifest, policy, evidence, and decision-history conflicts are corrected; a fresh exact-remote trial remains required.
- The final fresh exact-remote cold-start trial passed at `e1b9f8960825aa9c18b1bc14182862d701f461ab`. RCG-04 is Independently verified; a new AI can resume from repository files without the blueprint or prior conversation.
- No application code, interface, visual baseline, or deployment was changed. G0 added only its authorized control files, reusable branches, records, tests, and workflows.
- The user's preferred Vercel site has been traced to safety/layout branch `claude/remaining-second-pass-v1` and deployed commit `10894f704a39b6c56a7fadfafb54275b82526c33`.
- Integration branch `divergence/reliability-v1` was created from that exact commit and verified identical at creation. The safety branch was not modified.
- All new task writes must use the single reusable staging branch; accepted work reaches integration only after the course-control check passes.

## Fixed decisions

- Use the existing Divergence repository, not a new repository.
- Preserve the existing Divergence interface/layout and the supplied three-part baseline.
- Do not create another branch. Reuse the existing staging branch.
- Maintain one active task and park extra ideas.
- Keep durable action/rationale, decision, evidence, and handoff records.

## Current blockers

- **GitHub mutation:** Task writes are allowed only on `divergence/reliability-staging`; accepted work may be merged into `divergence/reliability-v1` only after the required check passes.
- **Non-bypass enforcement:** Independently verified from exact GitHub API readback and the retained live rejection run.
- **Cold-start continuity:** Independently verified; earlier failures remain retained as evidence.
- **F0 independent verification:** Blocked until F0 is first completed with retained evidence.
- **S02/S03/S18/S20/F1:** Blocked by F0 and its independent audit.

## Exact next action

Stop. Await the user's explicit instruction to begin F0. Do not create another branch, merge, deploy, or execute F0 before that instruction.

## Required next handoff update

The F0 designer must replace this current-state section with the resulting artifact list, hashes, decisions, failures, gate states, exact blocked scope, and one exact next action while preserving the prior state in `CONTINUITY-LEDGER.md`.
