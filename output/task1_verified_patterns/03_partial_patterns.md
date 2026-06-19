# Partially Supported Patterns

## 1A: Early Clarifications (PARTIALLY SUPPORTED)

**Confidence:** Medium  
**Claim:** 88% of successful conversations have 2+ clarifications in first 15 events

**Verified Count:**
- 255/761 (33.5%) have 2+ early clarifications
- 215/761 (28.3%) have 1 early clarification
- 291/761 (38.2%) have 0 early clarifications

**Evidence:**
1. Conv C001 (clarifications at events 6, 14) matches pattern
2. Conv C003 (clarifications at events 3, 12) — scope + detail chain
3. Conv C010 (4 clarifications in first 15) — high early engagement

**Contradictions:**
1. Conv C008 (0 clarifications, only EXPLICIT_STATEMENT)
2. Conv C015 (0 clarifications despite SUCCESS_MARKER present)
3. 38% of conversations lack early clarifications entirely

**Gap Analysis:** 33.5% vs 88% suggests claim applies only to successful subset, not general population

---

## 1B: Clarification Chains (PARTIALLY SUPPORTED)

**Confidence:** High (pattern exists)  
**Claim:** Successful: 2-3 complete chains; Failed: 4+ consecutive without correction

**Verified Count:**
- 2,374 complete chains (CLARIF → CORR) found
- 15+ conversations show failure pattern of 4+ consecutive without correction

**Evidence:**
1. Conv C001 chain 1 (Event 6 CLARIF → Event 12 CORR, gap=6)
2. Conv C001 chain 2 (Event 14 CLARIF → Event 17 CORR, gap=3)
3. Conv C003 (Event 3 CLARIF → Event 9 CORR, gap=6) — clean chain

**Contradictions:**
1. Conv C055 (7 consecutive CLARIF without immediate CORR)
2. Conv C059 (5 consecutive CLARIF at events 109, 112, 113)
3. Conv C001 late stage (Events 24, 26, 27 CLARIF without resolution)

**Status:** Both success and failure modes confirmed; pattern distinguishes paths effectively

---

## 1C: Scope vs Detail Clarifications (PARTIALLY SUPPORTED)

**Confidence:** Medium  
**Claim:** Scope clarifications first 5%; detail clarifications middle 40%

**Verified Count:**
- Scope found at 1.7-7.1% through conversation
- Detail found at 20-45% through conversation

**Evidence:**
1. Conv C003 (Event 3 at 1.7% — "what is it you think you made a checklist for?")
2. Conv C010 (Event 2 at 7.1% — "What is the exact Bible verse...")
3. Conv C004 (detail clarifications at 27-41%)

**Contradictions:**
1. Conv C002 (clarification at 86.7% only — too late)
2. Conv C007 (clarifications at 50% and 90% — no early scope)
3. Conv C009 (0 clarifications throughout)

**Status:** Pattern valid but boundaries too strict; 5% threshold needs expansion to ~7-10%

---

## 2A: Goal Changes with Clarification (PARTIALLY SUPPORTED)

**Confidence:** Medium  
**Claim:** Isolated goal change = 18% success; with clarification = 85% success

**Verified Count:** Outcome mapping needed for exact percentages

**Evidence:**
1. Conv C001 (shift at event 1 → clarification at event 6)
2. Conv C003 (topic progression with clarifications at events 3, 10+)
3. Conv C002 (shift from apps to Epstein with clarification support)

**Contradictions:**
1. Conv C007 (goal shift at events 6-10 with only 2 total clarifications)
2. Conv C005 (abrupt shift with single clarification)
3. Conv C009 (goal change with no intervening clarification)

**Status:** Pattern evident structurally; success rate differential (85% vs 18%) cannot verify without outcome labels

---

## 3B: Correction-Clarification Pairing (PARTIALLY SUPPORTED)

**Confidence:** Medium  
**Claim:** Paired: 87% progress; unpaired: 52%

**Verified Count:**
- 1,849/4,322 (42.7%) corrections paired with recent clarification
- 2,473/4,322 (57.3%) corrections unpaired

**Evidence:**
1. Conv C001 (Event 14 CLARIF → Event 17 CORR, gap=3)
2. Conv C001 (Event 18 CLARIF → Event 22 CORR, gap=4)
3. Conv C003 (Event 3 CLARIF → Event 9 CORR, gap=6)

**Contradictions:**
1. Conv C001 (Events 2, 5, 12 CORR without preceding clarification)
2. Conv C034 (Event 19 FAILURE → Event 21 CORR, no clarification)
3. Conv C041 (Event 83 FAILURE → Event 85 CORR, no clarification)

**Status:** Pairing exists but not dominant (43% vs 87% claimed); both patterns coexist frequently

---

## 4A: Success Markers & Length (PARTIALLY SUPPORTED - INVERTED)

**Confidence:** High  
**Claim:** With markers avg 38 events; without markers avg 78 events

**Verified Count:**
- WITH SUCCESS_MARKER: 219/761 (28.8%), avg 71.7 events
- WITHOUT SUCCESS_MARKER: 542/761 (71.2%), avg 14.9 events

**Evidence:**
1. Conv C001 (75 events, SUCCESS_MARKER at event 3)
2. Conv C004 (44 events, SUCCESS_MARKER at event 41)
3. Conv C014 (55 events, SUCCESS_MARKER at event 4)

**Contradictions:**
1. Conv C002 (15 events, NO SUCCESS_MARKER)
2. Conv C003 (118 events, NO SUCCESS_MARKER — longer than claimed 78)
3. Inverse relationship: markers correlate with longer conversations, not shorter

**Status:** INVERTED from claim; success markers indicate extended engagement/complex tasks, not brevity or failure prevention
