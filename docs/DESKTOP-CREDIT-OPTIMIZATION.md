# Divergence.AI Desktop Test Program

This branch adds a standalone Electron build without replacing the existing web build. The renderer remains the same React product; Electron supplies local accounts, SQLite persistence, secure API-key storage, and packaging for Windows, macOS, and Linux.

## Run and package

```bash
npm install
npm run desktop:install
npm run desktop:start
```

Create installers with:

```bash
npm run desktop:package
```

The packaged app stores `divergence.sqlite` and `crash.log` in Electron's platform-specific user-data folder. Settings includes an **Open Local Data Folder** button.

## Accounts and persistence

- The first local account is the operator; later accounts are regular users.
- Passwords use salted `scrypt` hashes. Plain-text passwords are never stored.
- Each user's session and account snapshots occupy a separate SQLite row.
- Session and account state are written together. SQLite WAL mode plus the existing five-second/page-hide autosave preserves the last complete checkpoint.
- When SQLite is empty, the renderer performs a one-time IndexedDB import when legacy state is available.

## Credits and manual payments

| Tier | Monthly payment | Usable credits |
|---|---:|---:|
| Free | $0 | $0 |
| Plus | $15 | $10.50 |
| Pro | $75 | $52.50 |
| Insane | $200 | $140.00 |

User Mode is credit-limited. Every AI action displays its whole-action estimate before the first provider request; Free is UI-only and a zero/insufficient balance fails closed. Developer Mode is operator-only and unlimited, but keeps the cost dialog visible for realistic customer-flow testing.

This personal tester uses the requested **manual payment** option. A purchase creates a durable request; the operator approves or rejects it in Developer Lab. The lab also lists local users, balances, and pending payments. Stripe is intentionally not embedded in Electron: a public Stripe version must keep secret keys and webhook authority on a hosted backend.

## Desktop AI key

Settings accepts an Anthropic API key. Electron encrypts it through the operating system's secure-storage facility; the renderer and SQLite never receive the plain key. If secure storage is unavailable, launch with `ANTHROPIC_API_KEY` instead.

## Personal optimization

The user chooses only what to improve:

- Reduce Overwhelm
- Recover From Frustration
- Improve Clarity
- Match My Detail Level
- Support Follow-Through

Conversation selection is automatic. A deterministic prefilter scans eligible saved sessions, sends only capped evidence excerpts and candidate changes to Haiku, enforces a minimum-evidence threshold, and applies only validated changes. Whole conversations are not sent for this job. Developer Mode adds preview, evidence/change counts, bad-run marking, and rollback.

## Security boundary

The local desktop credit system is a product-flow testing implementation, not a public billing authority. A customer-facing release must move balances, subscription activation, payment approval, and API dispatch to a trusted hosted service. Renderer-side state is not an acceptable security boundary for real money.
