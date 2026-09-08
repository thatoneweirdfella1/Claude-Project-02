# Exact Handoff State

## Simple status

**SAFE TO SWITCH: NO — G1-A is not yet confirmed on GitHub.**

Current work is activating the control upgrade that will make interrupted tasks resumable and block unaudited or contaminated downstream work. Do not start the F0 audit or any product-system task.

## Current task

- **Task:** G1 — Continuity, Acceptance, and Contamination Controls
- **Current phase:** G1-A — activation and exact standalone assignment
- **Status:** Active; local checkpoint being validated
- **Task source:** `DIVERGENCE-G1-CONTROL-UPGRADE-HANDOFF.md`
- **Source hash:** `e940049e4dffd0d87a9b303526df82c7a8f61c0a496f6afc1f6f34b9b8f75db8`
- **Starting remote commit:** `f6e8a344b414a5e909028fbdf547ae879ade4b58`
- **Only writable branch:** existing `divergence/reliability-staging`
- **Accepted integration branch:** `divergence/reliability-v1`
- **Untouched safety/layout baseline:** `claude/remaining-second-pass-v1` at `10894f704a39b6c56a7fadfafb54275b82526c33`

## What remains in G1

1. Publish G1-A so takeover is remotely recoverable.
2. G1-B: audit and fill only real authority-package gaps.
3. G1-C: implement checkpoint, task-transition, dependency, audit, acceptance, lineage, and contamination enforcement.
4. G1-D: run every hostile enforcement and recovery test and retain failures/corrections.
5. Stop with G1-E independent audit as the only permitted next task.

## Preserved completed work

- G0 repository enforcement and context-free continuation remain independently verified by existing evidence.
- The canonical blueprint remains installed unchanged.
- F0 and its four follow-on briefs remain completed by author self-check and unchanged.
- Independent F0 audit remains Open and pinned behind G1 verification.

## Prohibited continuation

Do not perform the independent F0 audit, S02/S03/S18/S20, F1, product implementation, app/test/UI/layout changes, branch creation, merge, rebase, force update, deployment, deletion, or safety-branch write. Do not claim independent verification.

## Exact replacement-AI instruction

> Open `thatoneweirdfella1/Claude-Project-02` on existing branch `divergence/reliability-staging`. Read the mandatory control files and `DIVERGENCE-G1-CONTROL-UPGRADE-HANDOFF.md`. Resume the first unfinished G1 checkpoint recorded in `CURRENT-TASK.md` and this handoff. Do not restart G1, begin F0 audit or system work, create a branch, merge, deploy, or change the existing Divergence layout.

## Exact next action

Validate, commit, gate, push, and read back G1-A. After remote confirmation, change the simple status to `SAFE TO SWITCH: YES` and make G1-B the first unfinished phase.
