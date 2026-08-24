# Interrupted-session recovery

If the status, evidence, working tree, or remote head does not match the last safe checkpoint, report:

```text
STALE-CHECKPOINT — RECOVERY REQUIRED
```

Then perform one governance-only recovery action:

1. Derive actual branch, HEAD, remote head, and source ancestry.
2. Enumerate every committed and uncommitted change since the last safe record.
3. Preserve any patch without deleting or resetting user work.
4. Mark affected ledger/evidence as stale, unsafe, or unknown.
5. Write one exact next recovery action.
6. Commit only recovery metadata if permission allows.

Do not modify app behavior or promote a status during recovery. Never force-push.
