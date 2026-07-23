# Backup Changes Log

This file tracks every authorized modification to backup branches. Use this to verify that changes were explicitly permitted and to see what changed.

## Format

Each entry includes:
- **Date/Time**: When the change was made
- **Backup Branch**: Which backup was modified
- **Files Changed**: What was modified
- **Authorization**: Your explicit permission (quote or reference)
- **Snapshot Reference**: The immutable snapshot created before this change (if any)

## Entries

### 2026-07-23 23:17 — Branch Consolidation: `claude/pensive-mayer-rm8qhf` → `build`

**Backup Branch:** N/A (branch consolidation, not backup modification)

**Files Changed:**
- `CLAUDE.md` — Merged Backup protection system + 3-State Methodology sections
- `src/stores/types.ts` — Methodology state type definitions
- `src/stores/accountStore.ts` — Methodology logging (accountStore.methodologyLog)
- `src/stores/sessionStore.ts` — Phase management (sessionStore.methodology)
- `src/components/composer/ControlRow.tsx` — UI dropdown for methodology selector
- `src/components/methodology/MethodologyDropdown.tsx` — NEW: Methodology selector component
- `src/services/methodologyEngine.ts` — NEW: Core 3-State engine with ADHD rules
- `src/components/streaming/TransparencyCard.tsx` — NEW: Transparency display for self-critique
- `src/services/*.test.ts` (sessionStore, accountStore, persistence) — Contract fixes for new fields

**Authorization:** User requested: "need all information and files transferred over" to preserve 2 test/projects from old conversation history that could benefit the main project but were left on wrong branch.

**Snapshot Reference:** None (branch consolidation from orphaned feature branch to canonical build branch).

**Commits Transferred:**
- `e3942ac` — Implement 3-State Methodology with ADHD communication rules
- `9db60f3` — Fix persistence key tests to reflect new methodology fields
- `31baa44` — Fix persistence.test.ts to include new methodology fields

**Status:** ✅ Transferred to `build`, tested, pushed. Ready for future incorporation.

---

## Backup Branches

- backup-reference-do-not-touch — Frozen reference. Never modified.
- backup-snapshot-2024-07-23-090804 — Immutable snapshot. Never modified.
- backup-independent-1 — Independent copy. Modifications require authorization.
- backup-independent-2 — Independent copy. Modifications require authorization.
- safe-backup-17647641341 — Safe copy. Modifications require authorization.

## Rule: Snapshot Protection

Before Claude modifies any backup, a new snapshot is created: backup-snapshot-YYYY-MM-DD-HHMM

This snapshot preserves the exact state before the change, so you can always see:
1. What existed before
2. Whether authorization was given
3. What changed
