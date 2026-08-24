# Unresolved findings

1. **Clean post-correction independent governance audit pending.** The earlier audits found real defects. Supported findings were reconciled, but structural self-validation by the installer is not independent proof.
2. **Real-checkout preflight and baseline test rerun pending.** The local staging directory has no `.git`, so it cannot issue a Resume Certificate or prove branch ancestry. CI or a fresh checkout must run the gates.
3. **Server protection unavailable.** Protected tag and repository-rules changes were not authorized. Procedural baseline comparison remains active.
4. **Five build-only commits require later ID-level audit.** They are listed in `BASELINE-STATE-AUDIT.md`; none was silently discarded or cherry-picked.
5. **Seven product decisions remain in four sessions.** They block only the IDs listed in `LAYER-DECISION-BLOCKERS.md`.
6. **No horizontal layer is complete.** Visible-site checkpoints exist, but a site-wide L1 baseline audit has not assigned credit.
