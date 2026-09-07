# Verified Vercel and Git Baseline

## User-selected site

`https://claude-project-02-git-claud-f1d4e8-thatoneweirdfella1s-projects.vercel.app/`

The user identified this as the Divergence.AI site and layout they use and want preserved.

## Read-only deployment lookup

Verified from the live Vercel deployment metadata on 2026-09-06 UTC:

| Field | Verified value |
|---|---|
| Vercel team | `thatoneweirdfella1's projects` |
| Vercel project | `claude-project-02` |
| Project ID | `prj_7NzfxBrOVzDXs87ohK05yIUZJ0FS` |
| Deployment ID | `dpl_D1ngxz1mmJrfSB7LHsEnHfbuA5ej` |
| Deployment state | `READY` |
| Deployment source | `git` |
| GitHub repository | `thatoneweirdfella1/Claude-Project-02` |
| Complete Git branch | `claude/remaining-second-pass-v1` |
| Exact deployed commit | `10894f704a39b6c56a7fadfafb54275b82526c33` |
| GitHub pull request | `#13` |
| Deployment created | `2026-08-29 14:15:02 UTC` |
| Branch alias | `claude-project-02-git-claud-f1d4e8-thatoneweirdfella1s-projects.vercel.app` |

## Meaning

- `claude/remaining-second-pass-v1` is the untouched safety/layout branch.
- Commit `10894f704a39b6c56a7fadfafb54275b82526c33` identifies the exact deployed snapshot returned for the user's site at lookup time.
- `divergence/reliability-v1` was created from that exact commit for all new reliability work; GitHub comparison reported zero commits ahead, zero behind, and status `identical` at creation.
- Continuity controls were then installed only on the working branch in commit `58c89578c825a2c445df7408db059d7fb3f1586f`; the post-installation comparison listed exactly 19 control/handoff paths and no application-code path. The safety branch remained identical to the deployed baseline.
- The shortened `claud-f1d4e8` URL segment was a branch alias, not the complete branch name.
- Future layout work must begin by comparing the checked-out branch and mounted interface with this baseline; it must not invent a replacement interface.

## Authority and limitations

- This record authorizes using the safety branch and commit as the read-only baseline, `divergence/reliability-v1` as protected integration, and the explicitly authorized reusable `divergence/reliability-staging` branch for task commits.
- It does not authorize touching the safety branch, creating another branch, merging, rebasing, force-updating, deleting, or deploying.
- No repository checkout or browser workflow test occurred during this lookup.
- A branch alias can later point to a newer commit. Use the exact commit above when reproducing this specific snapshot, and record any later intentional baseline change.
