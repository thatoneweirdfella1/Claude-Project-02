# Current Task Status

**Task ID:** G2 autonomy correction / G3-A trusted controller
**Status:** Interrupted — resumable; Phase 1 published and exact controller deployed, bootstrap blocked on action-time secret authorization
**Starting remote checkpoint:** `83b2fc21c10113df1a8f2c21ab8a7c6daf837944`

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

## Exact next action

After required action-time authorization, replace only the inaccessible bootstrap secret and stale release value in controller project `prj_2tCUMX2TrV6ZIdKQnGDmOXZDPST3`, redeploy exact subtree `ccf15ce25afa6d01c0694085c7d58d9a97752ef3`, bootstrap Redis exactly once, and diagnose the genuine signed-webhook HTTP 400. Then continue honest G3A-01 through G3A-10 proof. Do not activate enforcement or change a ruleset.

## Safe to switch

**SAFE TO SWITCH: YES** — resume from E-047 and the exact next action above. Redis is not initialized; do not treat the three HTTP 400 signed webhook deliveries as a pass.
