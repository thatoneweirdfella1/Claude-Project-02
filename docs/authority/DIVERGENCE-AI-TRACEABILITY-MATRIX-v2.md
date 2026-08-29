# DIVERGENCE.AI — TRACEABILITY MATRIX v2

| Class | Denominator | Mapped | Result |
|---|---:|---:|---|
| Upstream recovered decision/task rows | 59 | 59 | PASS |
| Existing detailed control/source IDs | 156 | 156 | PASS |
| New/expanded permanent requirement IDs | 62 | 62 | PASS |
| **Total permanent requirement/control IDs** | **218** | **218** | **PASS** |
| Existing workflows | 34 | 34 | PASS |
| New workflows | 14 | 14 | PASS |
| **Total workflows** | **48** | **48** | **PASS** |
| v2 repair groups | 39 | 39 | PASS |
| Open decisions | 7 | 7 | PASS |
| Old acceptance-test handles retained | 190 | 190 | PASS |
| New feature acceptance-test handles | 62 | 62 | PASS |
| New workflow acceptance-test handles | 14 | 14 | PASS |
| **Total acceptance-test handles** | **266** | **266** | **PASS** |

## Status accounting

- Existing 156 control statuses after Developer-scope correction: **{'MISSING': 21, 'WRONG': 65, 'PARTIAL': 46, 'UNTESTED': 16, 'UNDECIDED': 4, 'BROKEN': 4}**.
- New 62 requirement statuses: **{'WRONG': 5, 'MISSING': 19, 'PARTIAL': 34, 'OUT_OF_SCOPE': 1, 'BROKEN': 2, 'UNDECIDED': 1}**.
- Deterministic existing defects (`WRONG/PARTIAL/MISSING/BROKEN`): **136**.
- Deterministic new/expanded defects: **60**.
- Total deterministic defect IDs in the v2 denominator: **196**.

## Non-circularity proof

- The 218 denominator is not inferred from this matrix. It comes from 156 previously static-inventoried controls plus 62 permanent IDs created from the independent 59-row upstream authority recovery.
- The 59-row upstream recovery was built from designated decision/approval/branch-history sources before this matrix was calculated.
- `UNDECIDED` and platform-scoped items are counted as decisions/scope, not converted into fake implementation defects.
- No `WORKING` whole-product claim is made from source/test arithmetic.

## Cross-artifact integrity

- Every `SPEC-*` v2 addition appears in Canonical Decision Authority v2, Control & Behavior Map v2, and the v2 acceptance additions.
- Every deterministic v2 addition is covered by at least one `V2-RQ-*` repair.
- Decision-dependent Developer design is isolated in `V2-DQ-006`/`V2-DQ-007`; it does not block unrelated repairs.
- Cowork's unrelated `RQ-*` numbering is not used as authority.

**VERDICT: PASS — v2 traceability uses an independently recovered authority denominator rather than the old circular 156-ID universe.**