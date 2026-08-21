# START HERE — DIVERGENCE.AI RECOVERY CONTROL

> [!CAUTION]
> **STATUS: RECONCILIATION HOLD — THE CURRENT UI IS NOT USER-APPROVED.**  
> Do not change interface code, merge the candidate implementation, or call any visual source “final,” “canonical,” or “frozen” until the reconciliation task in this file is completed with the user.

```yaml
control_version: 1
updated: 2026-08-21
repository: thatoneweirdfella1/Claude-Project-02
control_branch: build
candidate_branch: frozen-implementation-v1
ui_authority_status: DISPUTED
implementation_permission: READ_ONLY_AUDIT
next_task: CURRENT-UI RECONCILIATION AUDIT
```

## User fast path

You only need to know four things:

1. **Nothing visual is considered approved right now.**
2. The existing `build`, `frozen-implementation-v1`, `main`, and backup branches are preserved.
3. The next task is a read-only comparison. It changes no interface code.
4. Decisions must be shown in small groups with one recommendation, not handed back to you as a giant branch audit.

## Mandatory start instruction for every AI

Read this complete file before reading other project instructions. Treat chat exports and old “frozen,” “approved,” “canon,” or “final” labels as historical evidence, not current authority. Perform only `NEXT TASK`. Do not create a branch. Do not modify UI code while `implementation_permission` is `READ_ONLY_AUDIT`.

## Why this hold exists

The user reported on 2026-08-21 that the loaded site did not match the agreed design. The user then had another AI correct and freeze a different result, which may also be wrong. Earlier image generation also inserted a `Focus Area` control and displaced the intended composer controls. Therefore:

- passing tests does not prove that the right design was implemented;
- a file or branch named `frozen` does not prove user approval;
- a complete conversation transcript is not an executable specification;
- no existing screenshot, document, branch, or rendered site may silently win this conflict.

## Temporary authority order

Until the user approves a reconciled target, authority is:

1. The user's direct instructions dated after this file.
2. This file.
3. Items explicitly entered as `APPROVED` in the Approved Truth Sources table below.
4. Existing code, tests, screenshots, and documents as evidence only.
5. Chat history and obsolete branches as discovery material only.

This temporary order supersedes conflicting visual-authority statements in `CLAUDE.md`, `CANON.md`, `FROZEN-LAYOUT.md`, and `docs/frozen-implementation-v1/*`. Their non-conflicting product information remains evidence and must not be deleted.

## Approved Truth Sources

| Area | Approved source | Status |
|---|---|---|
| Complete light-mode layout | None yet | **UNRESOLVED** |
| Complete dark-mode layout | None yet | **UNRESOLVED** |
| Composer control placement | None yet | **UNRESOLVED** |
| Navigation and right-rail contents | None yet | **UNRESOLVED** |
| Exact control interactions | `frozen-implementation-v1:docs/frozen-implementation-v1/DIVERGENCE-AI-COLORED-DECISION-MAP.docx` is recommendation evidence | **REVIEW REQUIRED** |

An AI may change `UNRESOLVED` to `APPROVED` only after the user approves the named source or reconciled result directly.

## Confirmed constraints that may be preserved

These are safe requirements, but they do not make any existing screenshot canonical:

- Divergence.AI is an ADHD-friendly communication bridge between a person and AI.
- The conversation history and complete message composer are the dominant workspace.
- The main conversation screen has no whole-page scrollbar.
- Conversation history may scroll internally inside a bounded pane.
- The composer and primary action remain visible.
- Secondary workspace material uses compact 26-pixel collapsed bars, anchored overlays, a fixed drawer, or a dedicated screen instead of increasing page height.
- Only one competing utility overlay or accordion is open at a time.
- Controls use plain-language labels, visible consequences, progressive disclosure, Apply/Cancel where needed, recovery, and no silent changes.
- State Detection runs on submit, not continuously while typing, and any recommendation remains visible, correctable, and dismissible.
- Directness and Technique are intentional composer controls. Their exact final position and contents must be reconciled.
- `Focus Area` is not an approved replacement for the intended composer controls; it was introduced by generated-image drift.
- Provider-neutral/free-first behavior, multiple AI destinations, and Fable support are functional requirements, but they must not dictate an unapproved layout.
- No paid route may be selected or charged silently.

## Current repository facts — not design approval

| Item | Verified state on 2026-08-21 | Meaning |
|---|---|---|
| Default/control branch | `build@0de85b93328eebf55f2cf7a68e2938960c60a02d` | Use this branch for the recovery control. Do not create another branch. |
| Candidate implementation | `frozen-implementation-v1@18e4345f703bfe62c8a5fca87b1b2a11a549be4c` | Preserved read-only as evidence until reconciliation. |
| Branch relationship | Candidate is 20 commits ahead and 0 behind `build` | Candidate work is isolated; being ahead does not make it approved or safe to merge. |
| Last broad verification claim | `f07465f6a6385bd55c18e81e697da34e848bbcc6` | Build/lint/608 tests/browser suite were reported passing at this older commit, not at the candidate head. |
| Later checkpoint | `2e46e95d663058a3490b35c4e313842f2c03b142` | Provider-neutral workflow was implemented and focused tests were reported passing. |
| Unverified distance | Candidate head is 7 commits beyond `f07465...` and 4 commits beyond the recorded `2e46e95...` feature checkpoint | The candidate head requires fresh technical verification after visual reconciliation. |

## Known conflicts that must not be guessed away

| Decision area | Conflicting evidence | Current rule |
|---|---|---|
| Logical viewport | `1543 × 1019` in `FROZEN-LAYOUT.md`; `1600 × 1024` in the provider-neutral checkpoint | **DISPUTED** |
| Left rail width | 200px, 240px, and 280px appear in different instructions/commits | **DISPUTED** |
| Right rail width | 300px and 380px appear in different instructions/commits | **DISPUTED** |
| Center controls | Generated `Focus Area` layout versus Model/Destination AI, Directness, Technique, State Detection, and context controls | Preserve the real controls; reconcile exact placement |
| Navigation | Earlier feature-oriented menu versus later outcome-oriented menu | **DISPUTED** |
| Quick Tools | Permanently visible versus user-configurable/optional presentations | **DISPUTED** |
| Visual authority | `Divergence_AI_App_Screenshot_V3.png`, Gold references, frozen light files, and later generated references all claim priority | None wins until user approval |
| Current loaded site | It renders and has tests, but the user says it is not what was agreed | Candidate evidence only |

## Branch and safety rules

- Work on `build`; do not create another branch.
- Treat `frozen-implementation-v1` as a preserved candidate, not an approved destination.
- Do not touch `main` or any `backup-*` / `safe-backup-*` branch.
- Do not merge, rebase, force-push, delete, reset, or cherry-pick during the reconciliation audit.
- Do not overwrite or rename older evidence.
- When implementation resumes, commit one small approved change at a time and update this file in the same commit.

## NEXT TASK — current-UI reconciliation audit

**Permission: read-only. No UI edits.**

1. Render the current `build` and `frozen-implementation-v1` interfaces in light and dark mode at their existing intended desktop viewport.
2. Capture the actual loaded states, including the conversation, composer, both rails, topbar, and every compact/expanded control state needed to understand behavior.
3. Inventory the candidate reference images and specifications without assuming their priority.
4. Compare implementation versus references in one table: `region`, `current placement`, `candidate placement`, `current behavior`, `candidate behavior`, `conflict`, and `recommended route`.
5. Present at most five related decisions to the user at one time. Put the recommended route first and explain it in one sentence.
6. Record each approval in this file immediately. Do not wait until the end of the session.
7. After the complete layout and interactions are approved, replace `READ_ONLY_AUDIT` with `APPROVED_IMPLEMENTATION` and name the exact truth-source files and commit.

## Acceptance gate before UI implementation

UI implementation remains blocked until all are true:

- [ ] The user has seen the current loaded light and dark states.
- [ ] The user has approved the complete shell geometry.
- [ ] The user has approved the composer controls and their placement.
- [ ] The user has approved left navigation and right-rail contents.
- [ ] The user has approved the control interaction map.
- [ ] Approved reference files are named in the Approved Truth Sources table.
- [ ] A fixed viewport and screenshot acceptance comparison are defined.
- [ ] `implementation_permission` is changed to `APPROVED_IMPLEMENTATION` by an authorized update.

## Mandatory checkpoint protocol

After every completed task or approved decision:

1. Update `updated`, repository facts if changed, Approved Truth Sources, Completed, and `NEXT TASK` in this file.
2. Commit only the files belonging to that completed task.
3. Push to `build` without force.
4. If usage may end, make the checkpoint immediately; never rely on the remaining conversation.

If a contradiction appears, stop implementation, record it under Known Conflicts, and ask one concrete question. Never resolve it by selecting whichever old document sounds most authoritative.

## Completed

- [x] Repository and branch relationship verified.
- [x] Existing frozen/canon claims demoted to evidence pending user reconciliation.
- [x] Recovery control created without changing UI code.

## Copy/paste bootstrap prompt

> Open `thatoneweirdfella1/Claude-Project-02` on branch `build`. Read `START-HERE-DIVERGENCE.md` completely. Treat it as the recovery authority. Perform only its `NEXT TASK`. Do not create a branch or modify UI code while it says `READ_ONLY_AUDIT`. Update the file and checkpoint the result before stopping.
