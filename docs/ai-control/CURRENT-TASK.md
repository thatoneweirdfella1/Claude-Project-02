# Current Task Status

**Task ID:** G2 autonomy correction / G3-A trusted controller
**Status:** Active; durable controller source Self-check passed and confirmed remote; external provisioning and hostile proof Open
**Starting remote checkpoint:** `d1ef5539a6693358c284c28cacf26b07924b313a`

## Authority and outcome

D-016 and the user's 2026-09-08 continuation instruction require a candidate-independent controller that automatically validates, assigns a distinct authenticated auditor, retains failures, launches correction and re-audit, accepts verified work, unlocks satisfied dependencies, and recovers interrupted work. Routine user approval, a second GitHub account, and manual audit routing are forbidden dependencies. Only an unresolved material product decision may interrupt the user.

The complete task source is `docs/reliability/control/DIVERGENCE-G3-A-TRUSTED-AUTONOMY-BOOTSTRAP.md`. F0, S02, S03, S18, S20, F1, product/application/UI work, production deployment, branch creation, integration/safety/build mutation, and ruleset changes before hostile proof remain prohibited.

## Completed before this checkpoint

- Six schemas, transition table, and reference transition engine.
- Adapter-driven controller core and in-memory tests.
- Host preflight selecting an external GitHub App instead of modifying `build`.
- Signed-webhook normalization, duplicate-delivery boundary, and Check Run builder.

## Current atomic checkpoint

The deployable source under `control-plane/g3a-controller/` now contains:

- the same transition/controller core imported by repository tests;
- Redis REST durable state, history, queue, lease, heartbeat, retry, dead-letter, correction, attestation, and delivery records;
- host-derived GitHub repository/ref/comparison validation bound to repository ID `1272469738` and exact base/candidate SHAs;
- GitHub App installation-token and Check Run adapter;
- credential-separated author/correction and auditor launchers;
- preview-only Vercel configuration and `observe` mode that cannot emit acceptance;
- health, signed webhook, worker callback, bootstrap, and recovery endpoints;
- controller threat model and least-privilege permission manifest.

Focused G3-A tests pass 27/27 at the checkpoint. The exact course gate passed from `716a16367d7207a7ce87fb3482336ce39bc529f3`; the connected GitHub boundary advanced only staging with `force:false`; remote commit `d1ef5539a6693358c284c28cacf26b07924b313a` has verified tree `38850ee1aebc6cce450e8116055e0881f2896c17`, identical to the tested local tree. This remains author self-check evidence. It is not evidence of deployment, App registration/installation, Redis provisioning, live worker credentials, live Check Runs, independence, or activation.

## Exact next action

1. Create a new non-production Vercel project with no product Git linkage; provision Redis and secrets; deploy exact tree `38850ee1aebc6cce450e8116055e0881f2896c17` in `observe` mode.
2. Register a GitHub App with only metadata:read, contents:read, pull_requests:read, and checks:write; install it only on repository `1272469738`.
3. Configure distinct authenticated author and auditor principals, then run G3A-01 through G3A-10 hostile tests against disposable inputs. Do not activate enforcement or change the integration ruleset before they pass.

## Safe to switch

**SAFE TO SWITCH: YES** — the source checkpoint is remotely recoverable at the exact commit and tree above; provisioning is the first unfinished action.
