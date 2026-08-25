# DIVERGENCE.AI governed continuation

Read `START-HERE-DIVERGENCE.md` first.

`horizontal-layer-3-implementation-v1` is the completed Layer 3 source and is read-only. `horizontal-layer-4-implementation-v1` contains the implemented Layer 4 checkpoint and is sealed against further application edits while live Upstash proof remains queued. The required next working branch is `horizontal-layer-5-implementation-v1`, created from the current Layer 4 checkpoint.

Use `docs/layer-system/API-WORK-MODE.md` when only authenticated GitHub API access exists. A missing local checkout is never a blocker.

## External-dependency deferral

Obey `docs/layer-system/EXTERNAL-DEPENDENCY-DEFERRAL.md`. An owner-only marketplace integration, credential, billing confirmation, provider approval, or live external proof may block a completion claim, but it must not block safe implementation of later layers. Preserve the honest last proven/implemented labels, keep unavailable live paths fail-closed, queue the owner action once, create the next separate layer branch, and continue non-dependent deterministic work.

Never repeatedly return the same external setup task to the user. Never claim a deferred layer complete. Never modify, overwrite, rebase, force-push, merge into, or advance an earlier checkpoint branch. Never merge or deploy production unless explicitly granted.
