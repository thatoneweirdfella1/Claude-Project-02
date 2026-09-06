# Exact Handoff State

## Current state

- The reliability meta-blueprint has been finalized as a proposed planning artifact, not an approved or independently verified architecture.
- The standalone F0 task exists and now includes mandatory repository, branch, layout, scope, logging, and handoff controls.
- The cross-AI packet is installed on the new working branch in commit `58c89578c825a2c445df7408db059d7fb3f1586f`.
- F0 has not been executed and is blocked while G0 is active.
- G0's fail-closed course controller is installed at commit `d417f10cd3ee543fb0facde7bd620b0a029ebd72`.
- The validator and adversarial harness pass 17/17 local tests, and GitHub Actions run `34066339481` passed every course-control step.
- The existing GitHub ruleset protects only branch `build`; non-bypass rules for the working/safety branches and new-branch restriction remain Open.
- No application code, interface, test, or deployment was changed during this preparation. The only repository change so far was creation of the isolated working branch at the unchanged baseline commit.
- The user's preferred Vercel site has been traced to safety/layout branch `claude/remaining-second-pass-v1` and deployed commit `10894f704a39b6c56a7fadfafb54275b82526c33`.
- Working branch `divergence/reliability-v1` was created from that exact commit and verified identical at creation. The safety branch was not modified.
- The working branch is now one commit ahead solely because 19 control/handoff files were added or replaced; GitHub comparison found no application-code changes. The safety branch remains exactly at the baseline commit.

## Fixed decisions

- Use the existing Divergence repository, not a new repository.
- Preserve the existing Divergence interface/layout and the supplied three-part baseline.
- Do not create or perform any branch operation without the user's exact authorization.
- Maintain one active task and park extra ideas.
- Keep durable action/rationale, decision, evidence, and handoff records.

## Current blockers

- **GitHub mutation:** Allowed only on `divergence/reliability-v1` and only for G0 and its required control records.
- **Non-bypass enforcement:** Open until the repository owner enables the GitHub ruleset described in `GITHUB-RULESET-REQUIRED.md` or explicitly accepts weaker procedural enforcement.
- **Cold-start continuity:** Open until a separate AI attempts to resume from repository files alone.
- **F0 independent verification:** Blocked until F0 is first completed with retained evidence.
- **S02/S03/S18/S20/F1:** Blocked by F0 and its independent audit.
- **Mechanical enforcement:** Not implemented or tested; the present packet is procedural.

## Exact next action

Enable the exact GitHub rulesets in `GITHUB-RULESET-REQUIRED.md`, perform a separate cold-start AI continuity trial, record the evidence, and stop. Do not execute F0 or create another branch.

## Required next handoff update

The F0 designer must replace this current-state section with the resulting artifact list, hashes, decisions, failures, gate states, exact blocked scope, and one exact next action while preserving the prior state in `CONTINUITY-LEDGER.md`.
