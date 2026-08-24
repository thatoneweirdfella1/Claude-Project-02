# Governed handoff

## Current state

- Repository: `thatoneweirdfella1/Claude-Project-02`
- Branch: `horizontal-layer-completion-v1`
- Source: `16beca26c305bd9bdae088eb8e977ca1e9730747`
- Governance: the 23-defect hybrid closure is applied; clean full independent audit pending because validator/layer/evidence/permission/packet semantics materially changed
- Last completed horizontal layer: none
- Active layer/batch: none
- App behavior changes: not authorized

## Preserved completed work

The source handoff records V2-RQ-001 through V2-RQ-003 as completed/verified and verified slices of V2-RQ-004/V2-RQ-005, including visible navigation, paid Review first, truthful manual handoff, exact supported destination routing, and included-context delivery. Read `docs/repair-authority/GPT-5.6-SOL-HANDOFF.md`; do not rebuild those slices merely because the layer ledger is awaiting baseline credit.

## Exact next action

From a real checkout, run `node scripts/governance/preflight.mjs --action=read-only`, return its certificate, then audit the new post-hybrid evidence packet against the 23 canonical defects and full checklist in a clean independent session without app edits. After audit `PASS`, record the result and user acceptance, establish an immutable protected governance ref, request a dated `modify_application_behavior` grant, and only then define one L1 batch.

The governance installer's local staging directory had no `.git`, so it could not issue a local Resume Certificate. This is an environment limitation, not a preflight pass. A real checkout/CI must supply that proof.

## Stop conditions

Stop for wrong repo/branch/source, changed protected path, branch collision, remote-head movement, missing permission, authority conflict, unsupported status promotion, or an unresolved decision affecting the exact batch. Do not stop unrelated work for a scoped decision.
