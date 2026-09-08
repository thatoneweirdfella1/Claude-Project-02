# Current Task — G2 Only

## Identity

- **ID:** G2
- **Title:** Maximum-Feasible Automation and Non-Bypass Hardening
- **Phase:** Execution-control correction
- **Status:** Active; authored work; independent audit required
- **Authority:** User's two-phase instruction dated 2026-09-08; D-015
- **Only writable-continuation base:** c4c6ec2e06dd18bed3158377db3c11a9903baf1c

## Purpose

Implement every useful safeguard currently feasible within the existing control architecture after preserving the failed G1-E audit. Mechanically detect stale/overlapping checkpoints, require explicit ownership and audit queues, constrain failed-task correction transitions, and prevent a protected control-plane change from carrying its own approval claim.

## Allowed paths

Control/governance records, validators, focused tests, the existing course-control workflow, and G2 audit/evidence artifacts only.

## Prohibited work

No product or application code/test changes, F0 or F0 audit, S02/S03/S18/S20, F1, design-package work, UI/layout changes, deployment, merge/rebase, new branch, integration-branch write, safety-branch write, or independent approval of this author's G2 work.

## Gates

- G2-G01 freshness, ownership, audit queue, and next action: Self-check pending.
- G2-G02 correction/dependency/contamination/recovery: Self-check pending.
- G2-G03 protected control-plane change separation: Self-check pending.
- G2-G04 live GitHub ruleset/check/reviewer binding: Open pending host readback.
- G2-G05 residual-risk and semantic/notification disclosure: Self-check pending.
- G2-G06 independent audit by another AI: Open.

## Exact next action

Finish the focused hostile tests and durable records for G2, run all required repository checks, publish a small gated checkpoint to the existing staging branch, and stop for a different independent auditor.
