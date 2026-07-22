# Instructions for Claude Session 2: Implement Task 2 (Learnable Signal Patterns)

**Your task**: Implement the Learnable Signal Patterns learning system into the Divergence app.

**Where to find the spec**: Open `PENDING-INTEGRATIONS.md` in the repo root. Read **TASK 2: Learnable Signal Patterns Verification & Integration**.

**What you need to do**:

The spec tells you to edit these files in order:

1. `src/stores/types.ts` — Expand `LearningAuditEntry` type with signal hierarchy
2. `src/stores/accountStore.ts` — Wire up learning loop with signal recording and refinement actions
3. `src/components/streaming/RatingRow.tsx` — Connect star ratings to PRIMARY signals in audit log
4. `src/services/learningEngine.ts` — Create NEW file with signal computation and recommendation logic
5. `src/stores/sessionStore.ts` — Add message tracking for secondary signals (edits, time deltas, model switches)
6. `src/components/layout/ScreenRouter.tsx` (SessionsScreen) — Record tertiary signals on session close
7. `src/services/debug/learningAuditViewer.ts` — Create NEW debug file for auditing signals
8. `CLAUDE.md` — Add Learning & Signal Hierarchy section

**Data to integrate** (copy from PENDING-INTEGRATIONS.md):

**Signal Hierarchy**:
- PRIMARY (max benefit): user rating (1-5), comment, confidence
- SECONDARY (moderate): time delta, edit distance, model/technique switches
- TERTIARY (lower): session close, download, search queries, topic returns

**Accuracy Degradation**:
- PRIMARY only: 100% (1.0)
- PRIMARY + SECONDARY: 85% (0.85)
- PRIMARY + SECONDARY + TERTIARY: 70% (0.70)
- No signals: 50% (0.50)

**LearningAuditEntry** type includes:
- signalType, signalValue, signalConfidence, hierarchy (tier), modelUsed, techniquesUsed, outcome, verified

**Acceptance criteria** (from PENDING-INTEGRATIONS.md):
- [ ] LearningAuditEntry type includes all three signal hierarchies
- [ ] RatingRow records PRIMARY signals to audit log
- [ ] Secondary signals (model switch, technique switch, time delta, edits) are recorded
- [ ] Tertiary signals (session close, download, search, topic return) are recorded
- [ ] Accuracy score computed: PRIMARY=1.0, PRIMARY+SECONDARY=0.85, ALL=0.70
- [ ] LearnedPreferences updated after collecting 5+ signals
- [ ] Model/Technique router uses learnedPreferences for future recommendations
- [ ] Audit log bounded at 500 entries (purges oldest)
- [ ] Debug viewer shows signal hierarchy and weights
- [ ] Full end-to-end test: rate answer → check audit log → verify signal recorded → check accuracy score

**When done**:
1. Make sure all checkboxes in PENDING-INTEGRATIONS.md Task 2 are checked off
2. Run a full end-to-end test: rate an answer → verify signal in audit log → check accuracy score calculation
3. Test that learnedPreferences feed back into model/technique selection
4. Commit with reference to PENDING-INTEGRATIONS.md
5. Push to `build` branch

**Don't forget**: 
- The accuracy degradation formula is NOT linear—each signal tier is intentionally noisy to force learning from primary signals first
- Keep audit log bounded at 500 entries to prevent unbounded growth
- This data came from analyzing behavior patterns across hundreds of conversations
- The signal hierarchy is battle-tested—don't restructure it

---

**Questions?** Read PENDING-INTEGRATIONS.md Task 2 section. Everything you need is there.
