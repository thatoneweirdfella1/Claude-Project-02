# Codex Layer 3 v1 contamination audit — 2026-08-26

## Verdict

**QUARANTINE. DO NOT PROMOTE `codex-verified/layer-3-v1` AS A VERIFIED CHECKPOINT.**

The work at `320da68fc06944f15488f208e3ccd91dce000740` is preserved because it contains useful repaired Layer 3 behavior and tests. It is not lost. However, the branch violated the isolation/adoption rules that were installed immediately before its application commit, so it must be treated as donor/evaluation material rather than trusted Codex ancestry.

## Exact preserved state

- Original branch: `codex-verified/layer-3-v1`
- Application commit: `9c030f64577283a099c1a4646c45bc7c946c3dfa` — `Layer 3: adopt audited local workflows and repair learning/data paths`
- Final candidate commit: `320da68fc06944f15488f208e3ccd91dce000740` — saved-prompt lint correction
- Frozen archive: `archive/codex-layer-3-v1-contaminated-20260826@320da68fc06944f15488f208e3ccd91dce000740`
- Clean restart branch: `codex-verified/layer-3-v2`
- Clean restart point: `c966953bc0377fe978edc630fbdff43965b16e6e`, the immediate parent of the Layer 3 application commit

## Why v1 is contaminated

### 1. The branch's own gate denied the application edits

Immediately before `9c030f6`, the installed governance required all three of these before application behavior could change:

1. `PERMISSIONS.yml` explicitly grants the exact application/test edit;
2. `BATCH-SCOPE.json` names the active permanent IDs and allowed paths; and
3. the governing Layer 3 obligation rows authorize the exact batch.

At the final v1 candidate, `PERMISSIONS.yml` still has `modify_application_behavior:false` and `modify_application_tests:false`. `BATCH-SCOPE.json` still has `active_layer:"NONE"`, an empty `permanent_ids` array, and an empty `allowed_paths` array. No intervening commit granted the Layer 3 application patch.

### 2. Account 2 donor code entered v1 before an adoption gate

The Account 2 Layer 3 snapshot and Codex-v1 contain line-for-line equivalent donor implementations in files including:

- `src/services/localWorkspace.ts`; and
- `src/services/learningEngine.ts`.

Their histories diverge at the trusted baseline `df90e4bb...`, so this is code reuse across separate lineages, not shared Git ancestry. That reuse happened without an evaluation branch, a pre-adoption line review, a frozen requirement/path batch, or an accepted independent audit record.

The larger file pattern supports the same conclusion: Account 2 Layer 3 and Codex-v1 modify the same local-workflow/learning files, with Codex-v1 then adding repairs to several of them. That makes v1 valuable donor work, but not independent implementation.

### 3. A green deployment cannot repair the governance violation

The final v1 candidate received a successful Vercel status check. The horizontal-layer rules expressly distinguish compilation/deployment success from requirement-level proof and independent adoption. Therefore the deployment is preserved as useful evidence, not treated as retroactive authorization.

## Preserved value

Do not throw this work away. V1 remains useful for:

- reproducible defect cases;
- test ideas and expected outcomes;
- identifying which Account 2 Layer 3 defects were already noticed and repaired;
- architecture/behavior comparison against authority;
- evaluating a *narrow* donor patch on a disposable evaluation branch when that is cheaper and safer than independent reimplementation.

It may not be merged wholesale or treated as the parent of a clean verified layer.

## Recovery rule

`codex-verified/layer-3-v2` starts from `c966953...`, preserving all isolation/audit governance but excluding the unauthorized Layer 3 application commit. Before any v2 application edit:

1. finish the per-obligation Layer 3 comparison;
2. freeze a bounded batch with exact permanent IDs and allowed paths;
3. choose independent reimplementation or a narrow pre-reviewed adoption route per item;
4. explicitly grant application/test edits only for that batch;
5. run focused tests during the batch and the complete layer gate at exit; and
6. record independent audit evidence before calling the result Codex-verified.

This keeps Account 2, quarantined Codex-v1, and clean Codex-v2 separately recoverable instead of pretending the earlier mistake never happened.
