# G3-A Host Preflight

**Observed:** 2026-09-08 through authenticated GitHub read-only API.

## Result

The default-branch trusted-workflow option is rejected for this repository. The candidate-independent GitHub App/controller is selected.

## Evidence

- Repository ID: `1272469738`.
- Default branch: `build` at observed commit `ebbda8c0ab16c556b7920239765dde8d4432e322`.
- Ruleset `build` (`20917696`) is Active, targets only `refs/heads/build`, and applies deletion, non-fast-forward, and update restrictions.
- The build ruleset has an empty bypass list and reports `current_user_can_bypass: never`.
- Integration ruleset `DIVERGENCE Course Control — Integration` (`22454197`) is Active and requires generic GitHub Actions check `Enforce one task, branch, scope, evidence, and history` from integration ID `15368`.
- Existing build workflows are only `ci.yml` and `windows-installer.yml`; no trusted autonomy workflow exists there.

## Decision

Do not weaken or modify the build ruleset. Do not modify `build`. Do not change the default branch. Use a narrowly permissioned external GitHub App/controller whose deployed release digest is independent of candidate-branch edits. After hostile verification, the integration ruleset must require the App-specific check source instead of generic candidate-controlled Actions.

This preflight is evidence for architecture selection; it is not proof that the external App, hosting, secrets, queue, status check, or ruleset update exists.

