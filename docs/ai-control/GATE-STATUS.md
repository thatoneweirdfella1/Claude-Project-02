# AI Course-Control Gate Status

## Purpose

Keep an AI on the single approved task without requiring the user to continually reconstruct scope, detect drift, or police branches and files.

## Current state

| Control | State | Meaning |
|---|---|---|
| One active task | Self-check passed | Machine-readable policy names G0 only; F0 is locked. |
| Branch-flow restriction | Self-check passed | Validator accepts only reusable staging `divergence/reliability-staging` and protected integration `divergence/reliability-v1`; every other branch is rejected. |
| Safety branch preservation | Self-check passed | Safety branch is named protected and remains unchanged. |
| Allowed-file boundary | Self-check passed | Changes outside G0's explicit list fail. |
| Required continuity records | Self-check passed | Ledger, evidence, handoff, and hashes must change with every accepted checkpoint. |
| Append-only work history | Self-check passed | Rewriting or truncating the continuity ledger fails. |
| Evidence integrity | Self-check passed | Every listed SHA-256 hash must match. |
| Self-declared independent verification | Self-check passed | New independent-pass states require a separate review artifact. |
| GitHub workflow execution | Self-check passed | Run `34066339481` completed successfully for commit `d417f10cd3ee543fb0facde7bd620b0a029ebd72`. |
| Reusable staging branch | Self-check passed | `divergence/reliability-staging` was explicitly authorized and created from integration commit `7681344918a912f0ac35a2fb15c2b41b85638a3f`; no per-task branches are allowed. |
| GitHub non-bypass enforcement | Open | The repository owner must enable the rulesets in `GITHUB-RULESET-REQUIRED.md`. |
| Cold-start AI continuity trial | Open | A separate AI must attempt resumption using repository files only. |

F0 remains blocked while either Open item remains unresolved or the user has not explicitly approved the transition.

<!-- G0-LIVE-REJECTION-PROBE: intentionally invalid checkpoint; required continuity records and integrity hash are deliberately omitted so AI Course Control must reject it. -->
