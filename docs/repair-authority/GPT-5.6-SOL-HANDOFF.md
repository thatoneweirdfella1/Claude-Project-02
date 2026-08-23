# GPT-5.6 Sol continuation handoff

Use this as operational state, not as a user-facing document. Continue the app repair immediately.

## Repository and branch

- Repository: `thatoneweirdfella1/Claude-Project-02`
- Working branch: `cowork-complete-preview-20260823`
- Never modify `build` or `frozen-implementation-v1`.
- The obsolete archive `DIVERGENCEAICOWORKCOMPLETE.zip` is not the app source and must not be used.
- The correct source is the GitHub branch above.

## Authority

Read these committed files before changing the next repair:

1. `docs/repair-authority/DIVERGENCE-AI-CANONICAL-DECISION-AUTHORITY-v2.md`
2. `docs/repair-authority/DIVERGENCE-AI-CONTROL-BEHAVIOR-MAP-v2.md`
3. `docs/repair-authority/DIVERGENCE-AI-REPAIR-QUEUE-v2.md`
4. `docs/repair-authority/DIVERGENCE-AI-DECISION-QUEUE-v2.md`
5. `docs/repair-authority/DIVERGENCE-AI-UPSTREAM-DECISION-RECOVERY-AUDIT-v1.md` only when provenance is needed.

The queue has 39 repair groups. V2-RQ-001 through V2-RQ-003 are complete and verified. Thirty-six remain. Start at V2-RQ-004.

## Completed and verified

### V2-RQ-001 — app access credential flow

- Commit: `972e1313eceb6df3411da748798432f92ad5c35a`
- Added the normal app-access gate and retained authorization path for protected calls, with tests.
- Vercel deployment passed.

### V2-RQ-002 — paid route and cost enforcement

- Commits:
  - `d0944cfad7c045b9d5936936ee6acf7bb7a5cf90`
  - `12b07eb6be2d99f7575d9bc051348449ac09e2b1`
  - `2dd453444f015dbf498e21ae73be7b990c6f6b7c`
- Enforces paid-fallback consent, visible preflight, per-request maximum, free-route option, and the same guard at normal, Multi-AI, and personal-optimization paid entry points.
- Verified READY deployment `dpl_ANkQXjxEARYZwBLkrX8kXdJX2vYK`, HTTP 200, and deployed bundle markers.

### V2-RQ-003 — recovery and session lifecycle

- Code commit: `2b4ccfb8cbf8597f03a4d01fa3b59758a331ae86`
- Added stable live-session identity, complete recovery snapshots, serialized/debounced persistence, pre-transition saves, correct Save/Archive/Discard semantics, Trash + Undo, startup restore/start-fresh recovery, caret and scroll recovery, and active autosaved-session listing.
- Vercel deployment `dpl_DM2HHafCWcE9Rw3qCGif9mLm44hS` is READY.
- Live URL: `https://claude-project-02-jpq0q6svy-thatoneweirdfella1s-projects.vercel.app`
- HTTP 200 verified.
- Build log verified: TypeScript + Vite build passed, and the Cowork overlay preserved five repaired source files.
- Deployed JS contains the recovery strings `Last work moved to Trash`, `Current work is recovery-saved.`, `Move this session to Trash?`, and `Recovery save failed`.

## Next exact action

Implement V2-RQ-004: complete the approved main composer and translation/send pipeline for SPEC-MC-01 through SPEC-MC-13.

Before editing:

1. Extract the SPEC-MC rows from the control map and the matching sections of `docs/frozen-implementation-v1/DIVERGENCE-AI-COMPREHENSIVE-SPECIFICATION.md`.
2. Audit the current branch and the encoded Cowork overlay, not the obsolete ZIP.
3. Map each acceptance behavior to its actual entry point and test.
4. Implement the full repair, then test, build, deploy, and inspect the live bundle/flow before marking it complete.

V2-RQ-004 depends on RQ-001 and RQ-002, which are done. Final managed-free acceptance also depends on later RQ-010/RQ-011; do not falsely claim that later dependency complete during RQ-004.

## Cowork overlay warning

Vercel install runs `scripts/apply-cowork-preview.cjs`, which extracts encoded overlay files from `cowork-preview/parts/part-00` through `part-07`. The overlay can overwrite source changes.

For every edited file, determine whether the overlay owns it. If it does, either update the overlay content or add the repaired branch file to `repairedSourcePaths` so deployment preserves it. Always verify the deployed artifact, not just local source.

The RQ-003 commit currently preserves these five post-overlay files:

- `src/main.tsx`
- `src/components/session/QuickActionsRow.tsx`
- `src/stores/types.ts`
- `src/stores/sessionStore.test.ts`
- `src/services/persistence.test.ts`

## User interaction rules

- Work autonomously. Do not sit idle waiting for approval when an unrelated repair can continue.
- Pause only for a genuine blocker, missing authority, or the exact user decision required at that point.
- Do not narrate 36 separate repairs. Batch progress and report only verified milestones.
- Do not make the user read long documents. Keep user-facing updates to a few plain lines.
- Do not ask about keyboard shortcuts again.
- The user plans phone support. Make shared site changes responsive where applicable, but do not interrupt core completion with repeated mobile-scope questions; run the dedicated phone pass after core functionality is working.
- Do actual app repair, not more methodology/document production.
- Never claim a repair is done from code alone: require relevant tests, successful production build/deployment, and live evidence.
- Surface unresolved decisions one at a time, only when they become blocking. Fill everything already answered by authority without asking.

## Decision state recovered from this chat

- V2-DQ-001 through V2-DQ-004 (Ctrl+T/S/L/P): the user does not want time spent on keyboard shortcuts. Do not ask again. Remove/deprioritize the browser-conflicting overrides when that repair is reached unless later approved authority requires them.
- V2-DQ-005 (mobile): direction is yes, mobile is planned. Keep core changes reusable/responsive; finish core first, then do the dedicated phone pass.
- V2-DQ-006 (Developer Mode heavy-use routing/cost policy): still unresolved. When it becomes necessary, ask only this one compact A/B/C decision:
  - A, recommended: automatically choose the lowest-cost model still powerful enough, use available credits first, and never silently downgrade an exact model the user selected.
  - B: disable Auto and manually select the exact provider/model every time.
  - C: always begin with the cheapest model and upgrade only after poor performance.
- V2-DQ-007 (operator-only Developer Mode entry location): still unresolved; ask only when RQ-036 needs the permanent location.

## Verification identifiers

- GitHub repo: `thatoneweirdfella1/Claude-Project-02`
- Vercel team: `team_N7ZF1dROn3XXdr57O3ibzTff`
- Vercel project: `prj_7NzfxBrOVzDXs87ohK05yIUZJ0FS`
- Vercel project name: `claude-project-02`

Continue from V2-RQ-004 without asking the user to restate any of this.
