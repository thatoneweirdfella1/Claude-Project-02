# Layer 4 data and conflict contract

This contract resolves the active Layer 4 ownership, source-of-truth, migration, deletion, export, rollback, and cross-device conflict questions without authorizing later-layer effects.

## Ownership and source of truth

- User-created sessions, saved tools, preferences, optimization state, large-job checkpoints, and recovery versions belong to the authenticated account when an account is present.
- IndexedDB is the crash-safe write-through cache and offline working copy.
- A server-confirmed account revision is the durable cross-device record. A local save is never described as remotely synchronized until the server confirms it.
- Anonymous data stays local until the user explicitly signs in and confirms migration.

## Revisions and synchronization

- Every durable envelope has a schema version, stable owner/account identifier, device identifier, base revision, update time, payload checksum, and deletion metadata.
- Remote writes use conditional revision checks. A stale base revision must return a conflict and must never overwrite a newer record.
- Retries are idempotent. Interrupted writes retain the last confirmed revision and the unconfirmed local version.

## Conflict policy

- Never silently choose last-write-wins across devices.
- Preserve both recoverable versions when local and remote work diverge.
- Show the source, time, and affected data for each version and require the user to keep local, keep remote, or keep both.
- Destructive resolution creates a recovery version first.

## Recovery, deletion, migration, and rollback

- Recovery versions and job checkpoints are durable, bounded, and visibly restorable.
- Trash is soft deletion. Purge is explicit, scoped, and irreversible only after confirmation.
- Imports and migrations validate before commit, create a rollback point, and fail atomically.
- Export contains all restorable user-owned data plus schema/provenance metadata; it excludes credentials and server-only secrets.
- Personal optimization is opt-in, records its input scope and prior state, and supports safe rollback.

## Security and privacy boundaries

- Browser clients never store provider secrets or privileged database credentials.
- Account records are authorized server-side for the authenticated owner on every read and write.
- Signed-out, expired, malformed, oversized, cross-account, and revision-conflicting requests fail closed.
- Layer 4 cannot mutate money, credit, allowance, entitlement, payment, or external AI-provider state.
