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
| GitHub non-bypass enforcement | Independently verified | API readback confirms all four required rulesets are Active with exact targets, rules, empty bypass lists, and no current-user bypass. Invalid checkpoint `4d6755ac14753d8dfa0bd0174b4f162f13c1d2cc` was rejected by run `34143620380`. |
| Cold-start AI continuity trial | Independently verified | A fresh AI used only exact-remote GitHub files at `e1b9f8960825aa9c18b1bc14182862d701f461ab`, followed the mandatory order, and reconstructed the complete state without the blueprint or conversational context. |

G0 is complete by self-check with external enforcement and RCG-04 independently verified. F0 remains locked until the user explicitly approves the transition.
