# Rejected Patterns

## 2C: Conversation Length Median (NOT SUPPORTED)

**Confidence:** High  
**Claim:** Median = 38 events; 70+ events = derailment indicator

**Actual Finding:**
- Median = 12 events (NOT 38) — **68% discrepancy**
- Min = 1 event, Max = 599 events
- Conversations with 70+ events: 95/761 (12.5%) — exist but not inherently derailed

**Evidence of Claim's Failure:**
1. Median calculation verified across entire dataset = 12
2. Conv C621 (70 events), C155 (72), C305 (72), C649 (72), C247 (73) — multiple 70+ conversations without explicit derailment
3. Success markers present in conversations exceeding 70 events

**Counter-Evidence (Pattern Inversion):**
1. Conversations WITH SUCCESS_MARKER average 71.7 events (above "derailment" threshold)
2. Conversations WITHOUT SUCCESS_MARKER average 14.9 events (well below claimed 38 median)
3. Length alone does not predict failure; marker presence does

**Why Rejected:**
- Empirical median (12) contradicts claimed median (38) by 2/3
- Conversational length correlates with success markers, not failure
- 70+ events characteristic of complex/extended tasks, not pathological derailment
- No correlation between conversation length inflation and failure rate

**Recommendation:** Replace with inverse model — longer conversations with success markers = extended engagement on complex tasks; short conversations without markers = quick disengagement, not success
