# START HERE — DIVERGENCE.AI RECOVERY CONTROL

> [!IMPORTANT]
> **STATUS: APPROVED INTERACTION BASELINE IMPLEMENTED.**  
> Preserve the decisions recorded below. Do not substitute old branches, generated-image controls, or earlier “frozen” claims for them.

```yaml
control_version: 2
updated: 2026-08-21
repository: thatoneweirdfella1/Claude-Project-02
control_branch: build
candidate_branch: frozen-implementation-v1
ui_authority_status: PARTIALLY_APPROVED
implementation_permission: APPROVED_IMPLEMENTATION
next_task: VISUAL VERIFY CURRENT BUILD, THEN CONTINUE SMALL DECISION PACKETS
```

## User fast path

You only need to know four things:

1. **The interaction baseline below is approved and implemented.**
2. The existing `build`, `frozen-implementation-v1`, `main`, and backup branches are preserved.
3. The next task is visual verification of the implemented baseline, not a return to an old branch.
4. Decisions must be shown in small groups with one recommendation, not handed back to you as a giant branch audit.

## Mandatory start instruction for every AI

Read this complete file before reading other project instructions. Treat chat exports and older “frozen,” “approved,” “canon,” or “final” labels as historical evidence unless this file explicitly preserves the decision. Perform only `NEXT TASK`. Do not create a branch.

## Why this hold exists

The user reported on 2026-08-21 that the loaded site did not match the agreed design. The user then had another AI correct and freeze a different result, which may also be wrong. Earlier image generation also inserted a `Focus Area` control and displaced the intended composer controls. Therefore:

- passing tests does not prove that the right design was implemented;
- a file or branch named `frozen` does not prove user approval;
- a complete conversation transcript is not an executable specification;
- no existing screenshot, document, branch, or rendered site may silently win this conflict.

## Temporary authority order

Authority is:

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
| Composer control placement | User approval on 2026-08-21: visible `Destination AI`, `Directness`, `Technique`; `Translator Engine` under Advanced Controls | **APPROVED** |
| Main workspace geometry | User approval on 2026-08-21: fixed 1600×1024 logical canvas capped at 72%, conversation first, composer visible, no whole-page scroll | **APPROVED** |
| State Detection interaction | User approval on 2026-08-21: Manual—Free default, Manual—Paid, Automatic—Paid; review before applying; no silent changes | **APPROVED** |
| Navigation and right-rail contents | Provider-neutral candidate baseline adopted for implementation; verify visually before further changes | **IMPLEMENTED—VERIFY** |
| Exact control interactions | Current `build` implementation plus this file; older decision map remains evidence only where non-conflicting | **APPROVED BASELINE** |

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
- State Detection never runs continuously while typing. Manual modes run only on an explicit check. Automatic—Paid runs on submit only when explicitly enabled. Every reading is reviewable, correctable, and dismissible before it changes request settings.
- Directness and Technique are visible primary composer controls beside Destination AI. Translator Engine is a separate advanced setting.
- `Focus Area` is not an approved replacement for the intended composer controls; it was introduced by generated-image drift.
- Provider-neutral/free-first behavior, multiple AI destinations, and Fable support are functional requirements, but they must not dictate an unapproved layout.
- No paid route may be selected or charged silently.

## Current repository facts — not design approval

| Item | Verified state on 2026-08-21 | Meaning |
|---|---|---|
| Default/control branch | `build` | Use this branch. Do not create another branch. |
| Candidate implementation | `frozen-implementation-v1@18e4345f703bfe62c8a5fca87b1b2a11a549be4c` | Preserved read-only as evidence until reconciliation. |
| Branch relationship | Candidate is 20 commits ahead and 0 behind `build` | Candidate work is isolated; being ahead does not make it approved or safe to merge. |
| Last broad verification claim | `f07465f6a6385bd55c18e81e697da34e848bbcc6` | Build/lint/608 tests/browser suite were reported passing at this older commit, not at the candidate head. |
| Later checkpoint | `2e46e95d663058a3490b35c4e313842f2c03b142` | Provider-neutral workflow was implemented and focused tests were reported passing. |
| Unverified distance | Candidate head is 7 commits beyond `f07465...` and 4 commits beyond the recorded `2e46e95...` feature checkpoint | The candidate head requires fresh technical verification after visual reconciliation. |

## Known conflicts that must not be guessed away

| Decision area | Conflicting evidence | Current rule |
|---|---|---|
| Logical viewport | Older files conflict; user directly chose the capped composition | **APPROVED: 1600 × 1024, max 72% scale** |
| Left rail width | 200px, 240px, and 280px appear in different instructions/commits | **DISPUTED** |
| Right rail width | 300px and 380px appear in different instructions/commits | **DISPUTED** |
| Center controls | Generated `Focus Area` displaced the intended controls | **RESOLVED:** no Focus Area; show Destination AI, Directness, Technique; State Detection gets its own compact row |
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

## NEXT TASK — visual verification and the next small decision packet

1. Render the current `build` in light and dark mode at the approved capped desktop geometry.
2. Verify that conversation, composer, primary controls, compact bars, both rails, and overlays fit without a whole-page scrollbar.
3. Verify all three State Detection modes and confirm that no mode silently changes settings.
4. Show the user only concrete visual mismatches or at most five related decisions at once.
5. Record every new approval here and checkpoint it on `build`.

## Acceptance gate before UI implementation

Do not call the complete visual layout final until all are true:

- [ ] The user has seen the current loaded light and dark states.
- [ ] The user has approved the complete shell geometry.
- [x] The user has approved the composer controls and their placement.
- [ ] The user has approved left navigation and right-rail contents.
- [x] The user has approved the current interaction baseline.
- [ ] Approved reference files are named in the Approved Truth Sources table.
- [x] A fixed logical viewport and scale cap are defined.
- [x] `implementation_permission` is `APPROVED_IMPLEMENTATION` for the recorded decisions.

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
- [x] Approved provider-neutral conversation-first baseline implemented on `build`.
- [x] Visible Destination AI, Directness, and Technique controls restored; Translator Engine moved to Advanced Controls.
- [x] State Detection changed to explicit Manual—Free, Manual—Paid, and Automatic—Paid modes with review before application.
- [x] Fixed 1600×1024 logical canvas capped at 72% preserved.

## Copy/paste bootstrap prompt

> Open `thatoneweirdfella1/Claude-Project-02` on branch `build`. Read `START-HERE-DIVERGENCE.md` completely. Treat it as the recovery authority. Preserve its approved interaction baseline, perform only its `NEXT TASK`, do not create a branch, and checkpoint every approved change on `build`.
