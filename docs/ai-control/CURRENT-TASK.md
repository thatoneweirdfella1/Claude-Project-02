# Current Task Status

**Task ID:** G2 autonomy correction / G3-A trusted controller
**Status:** Active; forward-only ledger recovery and exact diagnostic deployment passed; genuine signed/duplicate-redelivery proof remains pending
**Starting remote checkpoint:** `4d76dbea0ba872ed4426af2a7c4a242ed1beb467`

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

## External provisioning decision

The deploy action reported preview while authenticated readback reports deployment `dpl_4NLyjv7qFrTSzwxP6JNxr5euUMXF` and project `prj_2tCUMX2TrV6ZIdKQnGDmOXZDPST3` as `target: production`. The retained failure evidence remains valid. D-017 resolves the ambiguity: this stable target is accepted strictly as permanent non-product controller infrastructure because the project is isolated (`link: null`), contains only the controller package, and does not alter the `claude-project-02` product deployment. It remains non-authoritative until its store, App identity, separated workers, and hostile proof are complete.

## Live checkpoint

Remote correction `a968bff2ded4db6f1df0ef501da2d0927fcd248c` has tested tree `6c47fdbd79494015cd3ada8f89c0fc286f375034`. Exact controller-source digest `675a965131519111495e877e7d3b95502d213637` is configured and reported by health. Production controller deployment `dpl_7igFACJPxHH9K19NrLG5AaR6C4rN` is READY at the isolated stable alias. Bootstrap returned `created:true` once and `created:false` on the required second call. Post-bootstrap health returns `ok:true`, `mode:observe`, `durable_state_initialized:true`, and `authoritative_enforcement_active:false`. An unsigned live delivery returns HTTP 400 `Invalid webhook signature`.

`AUTHOR_WORKER_URL` and `AUDITOR_WORKER_URL` are not configured and remain blocking. Local worker tests do not prove live autonomous worker execution.

Remote staging subsequently advanced to `b9af1b0b91afabd850d4c6667ccb2887d9027e0f`, but that records-only publication corrupted `CONTINUITY-LEDGER.md` and did not produce successful genuine signed-delivery evidence. The corruption is retained in Git history. The current recovery restores the ledger bytes from the last trusted checkpoint `a968bff2ded4db6f1df0ef501da2d0927fcd248c`, appends a correction entry, adds safe rejection metadata logging, and adds valid-signed, duplicate, and invalid-signature hostile tests. No payload or secret is logged.

Recovery commit `4d76dbea0ba872ed4426af2a7c4a242ed1beb467` is remotely confirmed with exact tested tree `a33332e934eff1476181b45f79feea0cf17f5e83`. Its controller subtree digest is `b8a044d14415d97cfe41853548d3ef50d61e00d9`. That digest is configured in Vercel and exact source deployment `dpl_8N5fdgtDovjrrjyHf8e6BubmqALM` is READY on the stable controller alias. Health returns the exact new digest with durable state initialized, observe mode, and authoritative enforcement inactive.

## Exact next action

Publish this synchronized records-only checkpoint to generate a genuine GitHub Hookshot request against deployment `dpl_8N5fdgtDovjrrjyHf8e6BubmqALM`. Diagnose and correct any rejection from safe live metadata, prove one successful genuine delivery plus one authenticated duplicate redelivery, and publish the final synchronized evidence. Do not activate enforcement, begin the independent audit, merge, change rulesets, or modify product files.

## Safe to switch

**SAFE TO SWITCH: NO** — deployment and bootstrap are complete, but genuine signed and duplicate-redelivery live proof remain unfinished.
