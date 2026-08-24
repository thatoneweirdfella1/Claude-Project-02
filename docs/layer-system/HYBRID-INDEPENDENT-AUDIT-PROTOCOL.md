# Hybrid Independent Audit Protocol

**Status:** Active governance procedure  
**Effective:** 2026-08-24  
**Scope:** Governance audits and horizontal-layer exit audits  
**Application behavior:** This procedure does not authorize or modify application behavior.

## 1. Purpose

Completed independent audits are cumulative evidence. A later audit does not make an earlier audit pointless merely because the later model finds more defects.

The hybrid method combines:

1. deterministic repository checks;
2. structural/coherence review;
3. adversarial false-pass review;
4. deterministic reconciliation of supported findings.

## 2. Existing audit preservation rule

For the 2026-08-24 post-correction governance packet, the completed GPT-5.6 Sol and Claude Sonnet 4.6 audits are authoritative source audits for reconciliation. They MUST NOT be discarded or replaced by a mandatory repeat full audit of the same packet.

Their supported findings are merged by union, not majority vote.

If one audit finds a supported blocking defect that the other misses, the defect remains open until corrected or specifically disproved by stronger governing evidence.

Duplicate findings are merged into one canonical defect while preserving both source attributions.

## 3. Current reconciled source set

- GPT-5.6 Sol: 23 required corrections, verdict FAIL.
- Claude Sonnet 4.6: 2 required corrections, verdict PASS WITH REQUIRED CORRECTIONS.
- Claude DEFECT-01 overlaps GPT finding 9 and strengthens it with an explicit working-tree baseline substitution failure mode.
- Claude DEFECT-02 overlaps GPT finding 1 and strengthens the packet-completeness/router-verification requirement.

Therefore the canonical reconciled denominator for this audit cycle is **23 unique required defects**, not 25 and not 2.

## 4. Reconciliation rule

For each finding:

1. Normalize the defect by underlying failure mode, not wording.
2. Merge duplicates.
3. Preserve the strongest supported severity.
4. Preserve all non-conflicting supporting evidence and exact corrections.
5. If two audits conflict on verdict but at least one supported blocking defect exists, the reconciled verdict is FAIL.
6. A finding may be removed only when it is explicitly disproved by governing evidence or verified corrected.
7. Silence from another auditor is not disproof.

## 5. No ceremonial re-audit rule

After fixes are applied to the 23 canonical defects, a reviewer performs **delta verification**, not a mandatory fresh full audit of the unchanged 4,063-line packet.

Delta verification checks:

- each changed governance file;
- each defect's exact correction criterion;
- validators or schemas affected by the change;
- regression impact on previously verified governance rules;
- whether any correction introduced a new authority conflict or false-pass route.

A new full audit is required only if one of these is true:

- the permanent denominator changes;
- authority hierarchy changes materially;
- layer semantics change materially;
- validator architecture is replaced rather than corrected;
- evidence or permission semantics are redesigned;
- the audit packet scope changes enough that prior evidence is no longer representative.

## 6. Future audit roles

Future independent reviews should intentionally separate two reasoning roles:

### Structural/coherence role

Focus on omissions, authority conflicts, provenance, mappings, branch identity, packet completeness, permissions, and internal consistency.

### Adversarial false-pass role

Assume an implementation agent is trying to obtain a false PASS. Attempt to exploit validators, evidence records, baselines, protected paths, blockers, permissions, stale state, deployment identity, and layer gates.

The roles may be performed by different model families where available. Cross-model review is preferred, but the procedure does not depend on any single vendor or model.

## 7. Deterministic checks

Machine checks are necessary but never sufficient. A machine PASS cannot override a supported reasoning defect.

Where governance prose claims a condition is mechanically enforced, the audit must verify the code actually enforces it. If it does not, that mismatch is itself a finding.

## 8. Verdict rule

The reconciled verdict is:

- **FAIL** if any required blocking defect remains open;
- **PASS** only when all required defects are verified closed and no new blocking defect is found;
- optional improvements never substitute for required corrections.

## 9. Implementation authority boundary

This protocol changes governance procedure only. It does not grant permission to modify application behavior, merge, deploy, connect paid providers, or alter secrets.
