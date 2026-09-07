# Exact Handoff State

## Current state

- The reliability meta-blueprint has been finalized as a proposed planning artifact, not an approved or independently verified architecture.
- The standalone F0 task exists and now includes mandatory repository, branch, layout, scope, logging, and handoff controls.
- The cross-AI packet was installed on integration branch `divergence/reliability-v1`; exactly one reusable task branch, `divergence/reliability-staging`, now exists from integration commit `7681344918a912f0ac35a2fb15c2b41b85638a3f`.
- F0 has not been executed and is blocked while G0 is active.
- G0's fail-closed course controller is installed at commit `d417f10cd3ee543fb0facde7bd620b0a029ebd72`.
- The validator and original adversarial harness passed 17/17 local tests, and GitHub Actions runs `34066339481` and `34067841730` passed every course-control step. The staging-flow revision is pending its final repository run.
- The existing GitHub ruleset protects only branch `build`; the four required DIVERGENCE rulesets remain Open.
- No application code, interface, test, or deployment was changed during this preparation. The only repository change so far was creation of the isolated working branch at the unchanged baseline commit.
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
- **Non-bypass enforcement:** Open until the repository owner enables the GitHub ruleset described in `GITHUB-RULESET-REQUIRED.md` or explicitly accepts weaker procedural enforcement.
- **Cold-start continuity:** Open until a separate AI attempts to resume from repository files alone.
- **F0 independent verification:** Blocked until F0 is first completed with retained evidence.
- **S02/S03/S18/S20/F1:** Blocked by F0 and its independent audit.
- **Mechanical enforcement:** Not implemented or tested; the present packet is procedural.

## Exact next action

Enable the exact GitHub rulesets in `GITHUB-RULESET-REQUIRED.md`, perform a separate cold-start AI continuity trial, record the evidence, and stop. Do not execute F0 or create another branch.

## Required next handoff update

The F0 designer must replace this current-state section with the resulting artifact list, hashes, decisions, failures, gate states, exact blocked scope, and one exact next action while preserving the prior state in `CONTINUITY-LEDGER.md`.
