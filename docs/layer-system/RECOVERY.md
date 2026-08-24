# Interrupted-session and unsafe-patch recovery

Recovery is fail-closed. It restores a trustworthy checkpoint; it never promotes product depth.

## Trigger

Enter recovery when any of these is true: local HEAD differs from the recorded active checkpoint unexpectedly; remote branch head moved since inspection; protected-path verification fails; a usage cutoff interrupts a coherent batch; an unverified/partial patch exists; evidence references a commit/deployment that no longer matches; or status/handoff disagree about the active layer or next action.

Report exactly:

```text
STALE-CHECKPOINT — RECOVERY REQUIRED
```

## Required recovery record

Before another implementation batch, record all of the following in the handoff/change record:

- repository and branch;
- local HEAD and remote HEAD;
- verified source checkpoint and last stable layer checkpoint;
- changed paths since the stable checkpoint;
- whether each change is committed, uncommitted, or remote-only;
- affected permanent IDs/evidence records;
- whether protected paths are involved;
- disposition: KEEP, ISOLATE, REVERT-BY-NEW-COMMIT, or UNKNOWN;
- one exact next action.

## Procedure

1. Run read-only preflight and preserve its certificate even when it fails.
2. Fetch/derive remote HEAD and compare it with the inspected HEAD. If remote moved, do not overwrite it; re-read the changed commits and restart the affected correction from the new head.
3. Enumerate committed and uncommitted changes since the last stable checkpoint. Never delete, reset, clean, or force-push user work as a recovery shortcut.
4. For an interrupted patch, preserve it first. If its behavior cannot be proven coherent, isolate it from the stable checkpoint or revert it only through a normal new commit that leaves history recoverable.
5. Mark every evidence record dependent on changed implementation/evidence as stale. Demote affected working-branch layer claims to incomplete/unknown until re-proven; preserve the separately recorded last stable checkpoint.
6. If a protected path changed without an exact allowed exception, stop that change and require governance correction/authorization; do not bless it by rewriting the baseline.
7. If usage is near cutoff, do not begin another coherent batch. Finish only the recovery metadata/checkpoint needed for deterministic resumption.
8. Update `CURRENT-LAYER-STATUS.md` and `HANDOFF.md` so both name the same branch, stable checkpoint, active batch, blocker, and exact next action.
9. Resume only when the remote-head lease is current, the patch disposition is explicit, protected-path checks are resolved, and the next action is deterministic.

## Forbidden recovery shortcuts

Recovery may not force-push, delete unknown work, rewrite history, rewrite the governance baseline to make a diff disappear, mark partial work `PROVEN`, or silently switch branches/checkpoints.
