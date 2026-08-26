# Layer 3 Evaluation Checkpoint 02

Date: 2026-08-26

## Lineage

- Clean source checkpoint: `codex-verified/layer-3-v2@2a2c8b2f784d8d7aa4cf1045f40c737fbf76c420`
- Disposable evaluation branch: `evaluation/l3-candidate-onto-codex-v2`
- Candidate staging commit: `95ec80863b59c361696f19de1d50b8fe003d495b`
- Frozen candidate checkpoint: `checkpoint/l3-evaluation-20260826-02@95ec80863b59c361696f19de1d50b8fe003d495b`
- Clean verified branch remains untouched by candidate application code.

The candidate commit is parented directly to the clean checkpoint and contains candidate file content only. It does not merge contaminated Account 2 or Codex-v1 ancestry.

## Candidate batch

Exactly 18 application/test files differ from the clean checkpoint:

1. `src/components/layout/AppShell.tsx`
2. `src/components/layout/ScreenRouter.tsx`
3. `src/components/pipeline/CenterColumn.tsx`
4. `src/components/settings/LocalDryRunPanel.tsx`
5. `src/components/streaming/MessageBubble.tsx`
6. `src/components/streaming/RatingRow.tsx`
7. `src/components/translation/ConversationArea.tsx`
8. `src/services/debug/learningAuditViewer.ts`
9. `src/services/learningEngine.test.ts`
10. `src/services/learningEngine.ts`
11. `src/services/localDataset.ts`
12. `src/services/localLayer3.test.ts`
13. `src/services/localWorkspace.ts`
14. `src/services/pipeline/orchestrator.ts`
15. `src/services/techniques/autoDetect.ts`
16. `src/stores/accountStore.ts`
17. `src/stores/sessionStore.ts`
18. `src/stores/types.ts`

Staged diff: 928 additions, 257 deletions.

## Automated proof at staging commit

GitHub Actions run `32969529888` tested the candidate checkpoint.

- `npm ci`: PASS
- `npm run build`: PASS
- `npm run lint`: PASS
- `npm test`: PASS
- Playwright E2E: FAIL, with 12 failed / 1 passed / 2 skipped.

The E2E failure is **not a newly introduced Layer 3 candidate regression**. The clean source checkpoint `2a2c8b2f...` was separately tested by run `32966405979` and produced the same 12 failed / 1 passed / 2 skipped result, with the same visible failure classes (review flow locator, draft reload locator, frozen-layout authority expectation, All Tools/pin click interception, duplicate Trash locator, session-history expectation, appearance-settings locator). Therefore the existing E2E suite exposes a pre-existing Layer 1/2 baseline/test-authority mismatch that must be resolved before any clean Layer 3 verification claim.

The workflow's artifact upload also failed because GitHub Actions artifact storage quota is full. This prevents retaining new Playwright reports through that upload step but does not erase the console failure evidence above.

Passing build/lint/unit tests is necessary but is not Layer 3 verification by itself.

## Confirmed evaluation findings

### Learning/signals

- Primary, secondary and tertiary signal types are represented and captured in candidate code.
- Learned technique weights are consumed by the real auto-technique selector.
- Model/routing learning is not implemented: `applySignalLearning` leaves `routing` unchanged and `recommendModelAndTechniques` always returns model `auto`.
- Current signal batching is unsafe at the 500-entry cap. Once the bounded log remains at 500 signals, the `signals.length % 5 === 0` gate can fire on every new signal and repeatedly reuse four prior signals.
- A rating plus comment can add two signals at once and jump across a five-signal boundary, skipping a learning batch.
- `edit_distance` currently uses absolute string-length difference, not actual edit distance. Same-length rewrites can incorrectly record zero.
- Several secondary/tertiary signals are stored as `neutral` or `unknown`; the current learning applier assigns those no direction, so capture does not yet prove useful learning from them.
- Real-feedback outcome validation remains unproved.

### Local dataset

Candidate repairs already add:

- 50 MB import bound
- unsafe-key rejection
- basic dataset/workspace shape validation
- pre-restore snapshots
- rollback after persistence failure

Still missing/unproved:

- checksum/integrity field and validation
- full account/session schema validation before mutation
- evidence that rollback is durable across restart rather than only restored in current process memory plus a best-effort save

### Large-job local workflow

Synthetic batching works deterministically without calling a provider, but job progress is returned as caller-owned arrays and is not part of `LocalWorkspaceSnapshot`. Stop/reload/resume durability is therefore not proved.

## Baseline blocker discovered

Clean Layer 3 promotion depends on a trustworthy inherited Layer 1/2 base. The current clean checkpoint's E2E suite already fails 12 tests, so inherited Layer 1/2 remains implemented-but-not-independently-proven. This is now a direct gate item, not an assumption.

The next baseline step is to classify each failure as either:

- stale test expectation that conflicts with current frozen authority, or
- genuine current UI/behavior defect.

Only authority-supported test corrections or genuine app repairs should be made. Do not change the app merely to satisfy stale tests.

## Promotion status

**DO NOT PROMOTE THIS CANDIDATE TO `codex-verified/layer-3-v2` YET.**

The evaluation branch is buildable and does not worsen the existing E2E failure count, but the learning defects and inherited Layer 1/2 proof gap remain.

## Exact next action

1. Classify the 12 inherited E2E failures against current frozen navigation/layout behavior and repair the smallest baseline/test mismatch needed to recover a trustworthy L1/2 gate.
2. In parallel-sized bounded work, repair Layer 3 learning correctness: actual edit distance and one-time five-signal batching across multi-signal writes and the 500-entry cap.
3. Add focused regression tests.
4. Re-run CI and create the next hard checkpoint before routing, dataset-integrity, or large-job-resume work.
