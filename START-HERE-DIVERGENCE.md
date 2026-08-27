# START HERE — ACCOUNT 2 WHOLE-SITE REPAIR

## Identity

- Repository: `thatoneweirdfella1/Claude-Project-02`
- Active writable branch: `account2/layer-8-candidate-v1`
- Purpose: independently repair and prove the 31 confirmed whole-site user-outcome failures
- Status: candidate work only; no merge or production authority

## Mandatory read order

1. `AGENTS.md`
2. `CLAUDE.md`
3. `docs/repair-authority/ACCOUNT2-REMAINING-SITE-REPAIR-WORK-ORDER.md`
4. `docs/layer-system/PERMISSIONS.yml`
5. `docs/layer-system/BATCH-SCOPE.json`

## Execution rule

For each task, reproduce the failure, determine the real cause, implement the smallest complete repair, add outcome-level regression tests, run affected tests and the production build, verify the visible workflow when possible, and commit a checkpoint.

A handler, form, build, or existing test does not prove the user outcome. If newer code already fixes a task, do not rewrite it; prove it.

## Isolation rule

Do not edit or merge any other branch. Do not deploy production, use credentials, call paid providers, spend money, or alter real user data. Those exact actions remain blocked; local and simulated work remains authorized.
