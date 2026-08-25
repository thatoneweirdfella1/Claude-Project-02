# DIVERGENCE.AI — candidate-worker boundary

Read and obey `START-HERE-DIVERGENCE.md`, `AGENTS.md`, and `docs/layer-system/DUAL-LINEAGE-GOVERNANCE.md`.

Claude/Account 2 must work only on an explicitly assigned `account2/layer-<N>-candidate-v<revision>` branch descended from its own candidate lineage. It must never modify or inherit authority over `codex-verified/*`.

The Codex lineage may inspect candidate work but may not merge it. Candidate research, tests, and patches remain untrusted until independently adopted under the dual-lineage gate.

Never modify archive branches, earlier checkpoints, `build`, `frozen-implementation-v1`, backups, or another account's active branch.
