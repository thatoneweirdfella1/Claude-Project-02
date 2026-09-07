# One-Time GitHub Enforcement Required

The repository validator is installed, but these four GitHub rulesets must be configured once so task work cannot bypass the intended branch flow. Use no bypass entries.

## 1. Integration — required checks before merge

- **Name:** `DIVERGENCE Course Control — Integration`
- **Enforcement:** Active
- **Target:** include branch `divergence/reliability-v1` only
- **Enable:** Restrict deletions; Require a pull request before merging; Require status checks to pass; Block force pushes
- **Required check:** `Enforce one task, branch, scope, evidence, and history`
- **If GitHub offers it:** require the branch to be up to date before merging
- **Leave off:** required approval count, Code Owner review, signed commits, deployments, and all unrelated rules

No approval is required by this ruleset because the repository account that submits the work may be the same account that must accept it. Task-transition approval remains governed by the course-control records and the user's explicit instruction.

## 2. Reusable staging — preserve the single task branch

- **Name:** `DIVERGENCE Course Control — Staging`
- **Enforcement:** Active
- **Target:** include branch `divergence/reliability-staging` only
- **Enable:** Restrict deletions; Block force pushes
- **Leave all other rules off.**

Task commits go only to this existing reusable branch. Accepted commits reach integration only through a pull request that passes the required check.

## 3. Safety/layout — make the known-good source immutable

- **Name:** `DIVERGENCE Safety Layout — Immutable`
- **Enforcement:** Active
- **Target:** include branch `claude/remaining-second-pass-v1` only
- **Enable:** Restrict updates; Restrict deletions; Block force pushes
- **Leave all other rules off.**

## 4. Repository-wide — prohibit branch proliferation

- **Name:** `DIVERGENCE — No New Branches`
- **Enforcement:** Active
- **Target:** include all branches
- **Enable:** Restrict creations
- **Leave all other rules off.**

This does not delete or disable existing branches. It prevents creation of any additional branch until the user explicitly changes this rule.

## Completion evidence

G0 cannot be Independently verified until retained GitHub evidence shows all four rules active and a deliberately invalid test change is rejected. Until then, the validator and branch flow may be Self-check passed, while external non-bypass enforcement remains `Open`.
