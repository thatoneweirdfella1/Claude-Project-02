# Baseline state audit — governance installation discovery

**Selected source:** `cowork-complete-preview-20260823` at `16beca26c305bd9bdae088eb8e977ca1e9730747`.

## Branch findings

| Branch | Head | Relative finding | Classification |
|---|---|---|---|
| `cowork-complete-preview-20260823` | `16beca26c305bd9bdae088eb8e977ca1e9730747` | Newest authority-named verified checkpoint | INCLUDE / selected source |
| `frozen-implementation-v1` | `18e4345f703bfe62c8a5fca87b1b2a11a549be4c` | Ancestor; source is 78 commits ahead | INCLUDED in source |
| `build` | `ebbda8c0ab16c556b7920239765dde8d4432e322` | Diverged; 5 build-only commits and 98 source-only commits | EXCLUDE from baseline; retain five commits for ID-level audit |
| `agent/add-codex-governance` | `8cf549aeb2241694a03d5a7ea4c4297a8e178151` | One obsolete governance commit; 134 commits behind source | EXCLUDE / superseded by governed handoff v2 |
| `codex/frozen-reference-layout` | `d362a6e06770695f425d775fe60f2086c731bdb6` | Divergent historical visual implementation | REFERENCE ONLY; frozen authority in source controls |
| `agent/desktop-credit-system` | `83a9b14be4fdf1986e1dca827d3fad49bd356e77` | Fully behind source | INCLUDED historically |
| `claude/gracious-babbage-eu11cq` | `62b97ec900cbf5e18096a2b8f2e2f153bfaff9d7` | 3 old divergent commits | EXCLUDE / superseded implementation evidence |
| `claude/pensive-mayer-rm8qhf` | `b1ead8952b9773a89f3e78ade7bc096f4939fbd5` | 3 old divergent commits | EXCLUDE / authority-history evidence only |
| `claude/quirky-rubin-s6rckq` | `338254332cee95e082f3bb3786f519155730a6df` | 4 old divergent docs/tests commits | EXCLUDE / decision recovery already incorporated in v2 audit |
| `claude/tasks-tonight-9qc45v` | `38fe16060f671aa713eec5ae7b69e23ee0a11ae9` | 2 old divergent commits with no net file diff | EXCLUDE |
| `claude/verify-npm-access-2qb9qj` | `4c9b6c10cc4ab5571a4b3bd365cd2e0c6741593f` | Fully behind source | INCLUDED historically |
| `main`, snapshot and safe backups | `2a1be17a2d9703127f6255c2c6c0e7ed7956a3df` | 275 commits behind source | REFERENCE ONLY / untouched |
| `backup-independent-1` | `175f607e2d75085adee8265933a0732aca039ec5` | No common ancestor | REFERENCE ONLY / untouched |
| `backup-independent-2` | `03b9150fa2b16253081a159f8c1678d7fdca2ef8` | No common ancestor | REFERENCE ONLY / untouched |

## Five build-only commits retained for later audit

`66a5879b4aa3c818d67fd9c0c149ff75998a9654`, `125f8973dc19f4c7b8ca15fe6d71e38e71a2c112`, `bacbdec1f48a6e9f057300713002b7e0999bcbdf`, `103c1e41a048b1e7ca8803d9a31d65b95ca6d76b`, `ebbda8c0ab16c556b7920239765dde8d4432e322`.

They are not cherry-picked during governance installation. Their approved behavior must be checked ID-by-ID against the newer source before any missing behavior is reimplemented.

## Test truth

The installation session could not rerun the repository locally. Source evidence records 68 files / 643 tests plus TypeScript and Vite build at app commit `91feb54684326b53d0db56968b5307771dea5a32`; subsequent source commits are documented checkpoints. Independent rerun remains required before initial `PROVEN` credit.
