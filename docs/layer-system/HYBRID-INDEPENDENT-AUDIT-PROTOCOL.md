# Hybrid Independent Audit Protocol

**Status:** Active governance procedure  
**Effective:** 2026-08-24  
**Scope:** Governance audits and horizontal-layer exit audits  
**Application behavior:** This procedure does not authorize or modify application behavior.

## Purpose and cumulative-evidence rule

Completed independent audits are cumulative evidence. Findings are merged by underlying failure mode, not majority vote. A supported blocking defect remains open until verified corrected or specifically disproved by stronger governing evidence; another auditor's silence is not disproof. Duplicate findings preserve all source attributions and the strongest supported severity.

For the 2026-08-24 checkpoint, GPT-5.6 Sol reported 23 required corrections and Claude Sonnet 4.6 reported two overlapping corrections. The canonical denominator is therefore 23 unique defects, not 25 and not 2.

## Delta versus full audit

After corrections, delta verification is sufficient only when authority, denominator, layer semantics, validator architecture, evidence semantics, permission semantics, and packet scope remain materially unchanged.

A new full audit is mandatory when any of these changes materially. The current second-hybrid correction changes the obligation model, validator architecture, evidence and permission semantics, protection model, and packet scope; it therefore requires a clean full audit of the new checkpoint. The prior audits remain evidence and must not be discarded.

## Audit roles

Use both roles:

1. **Structural/coherence:** omissions, authority conflicts, provenance, mappings, branch identity, packet completeness, permissions, and internal consistency.
2. **Adversarial false-pass:** attempt to exploit validators, evidence, baselines, protected paths, blockers, permissions, stale state, deployment identity, and layer gates.

Cross-model review is preferred, but no vendor or model can override deterministic evidence.

## Verdict

- `FAIL` while any supported required defect remains open.
- `PASS` only when all required defects are verified closed and no new blocker is found.
- Optional improvements never substitute for required corrections.
- The implementation session cannot issue the independent verdict.

## Authority boundary

This protocol changes governance procedure only. It does not grant application edits, merge, deployment, paid/provider activity, secret access, or external effects.
