# Instructions for Claude Session 1: Implement Task 1 (3-State Methodology)

**Your task**: Implement the 3-State Methodology integration into the Divergence app.

**Where to find the spec**: Open `PENDING-INTEGRATIONS.md` in the repo root. Read **TASK 1: 3-State Methodology Validation & Integration**.

**What you need to do**:

The spec tells you to edit these files in order:

1. `src/stores/types.ts` — Add type for `MethodologyEntry`
2. `src/stores/accountStore.ts` — Add fields and actions for methodology tracking
3. `src/stores/sessionStore.ts` — Add phase tracking and problem locking
4. `src/components/composer/ControlRow.tsx` — Add methodology selector dropdown
5. `src/services/methodologyEngine.ts` — Create NEW file with phase detection and ADHD rules
6. `src/components/streaming/TransparencyCard.tsx` — Add self-critique display for TEST phase
7. `CLAUDE.md` — Add 3-State Methodology section

**Data to integrate** (copy from PENDING-INTEGRATIONS.md):
- 9 ADHD Constraints (memory, cognitive shutdown, pressure failure, etc.)
- 7 Communication Rules (directive-only, extreme brevity, no branching, etc.)
- 4 Failure Modes to Avoid
- 5 Hallucination Reduction Techniques

**Acceptance criteria** (from PENDING-INTEGRATIONS.md):
- [ ] User can select 3-State Methodology from dropdown
- [ ] Phase indicator shows current phase (DEFINE/TEST/STABILIZE)
- [ ] Problem statement stays locked across all messages in DEFINE
- [ ] TEST phase automatically shows self-critique section
- [ ] Hallucination audit runs and displays during TEST
- [ ] Confidence scores appear on claims
- [ ] ADHD communication rules applied to all outputs when 3-State is active
- [ ] Methodology usage logged to accountStore
- [ ] User can switch between Standard and 3-State mid-session
- [ ] Audit shows which methodology was used for each past session

**When done**:
1. Make sure all checkboxes in PENDING-INTEGRATIONS.md Task 1 are checked off
2. Test the full DEFINE → TEST → STABILIZE cycle
3. Commit with reference to PENDING-INTEGRATIONS.md
4. Push to `build` branch

**Don't forget**: This data came from a prior analysis of ADHD workflows. It's battle-tested. Don't second-guess it—implement it as specified.

---

**Questions?** Read PENDING-INTEGRATIONS.md Task 1 section. Everything you need is there.
