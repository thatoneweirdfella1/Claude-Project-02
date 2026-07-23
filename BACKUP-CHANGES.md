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

### Transfer Details: 3-State Methodology

**Project/Test Name:** 3-State Methodology (DEFINE → TEST → STABILIZE)

**Purpose:**  
Problem-solving framework optimized for ADHD users, discovered from friction analysis across 824 conversations. Provides phase-based structure with locked problem statements, self-critique generation, hallucination auditing, and ADHD communication rule compliance checking.

**How It Benefits Main Project:**

1. **Seven Proven ADHD Communication Rules**
   - Directive-only statements (no "if you want to")
   - Extreme brevity (max ~10 lines per response)
   - No explanations unless explicitly requested
   - Single chosen path (system decides, not user)
   - Visible progress markers (✓, →, "Next:", etc)
   - Locked problem statement (repeats to prevent drift)
   - No optional statements (every statement required)

2. **Prevents Nine ADHD Failure Modes**
   - Zero procedural memory → system handles sequencing
   - Cognitive shutdown → enforced brevity
   - Working memory limits → locked problem prevents loops
   - Pressure-induced failure → directive guidance
   - Loop-without-closure → structured phase closure
   - Dopamine/reward driven → visible progress markers
   - Context loss → problem statement repeats
   - Vague instruction sensitivity → directives eliminate ambiguity
   - Multiple paths paralysis → single chosen path

3. **Three-Phase Methodology**
   - DEFINE: Lock problem statement, directive output only
   - TEST: Validate with self-critique and hallucination audit
   - STABILIZE: Deliver final audited result

4. **Compliance Scoring & Auditing**
   - Briefness score (line count vs. max 10)
   - Directive score (proportion of imperative statements)
   - Visibility score (progress markers detected)
   - Hallucination audit with confidence scoring

**Complete Implementation Status:** ✅ All features implemented and tested

**Files Included:**
- Type definitions (types.ts — MethodologyEntry, MethodologyPhase, HallucinationAudit)
- Store actions (accountStore.ts — recordMethodology with 200-entry cap; sessionStore.ts — phase/statement setters)
- UI components (MethodologyDropdown.tsx in new methodology/ folder; TransparencyCard.tsx for TEST phase display)
- Core engine (methodologyEngine.ts — 300+ lines with ADHD rules, compliance analysis, phase detection, critique generation)
- Updated CLAUDE.md documentation section
- All persistence/contract tests updated and validated

**Test Coverage:** ✅ 598 unit tests passing, all contract tests updated

**Integration Note:** Ready for immediate use. Methodology defaults to "Standard" and is optional via UI dropdown. Fully type-safe, persisted across reloads, audited with bounded logging.

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
