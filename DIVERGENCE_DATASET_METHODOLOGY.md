# Divergence.AI Training Dataset Extraction Methodology

Adapted from immaculate 5-phase conversation analysis framework. Same rigor, different extraction targets.

## Core Principle

**Reducing false confidence is more important than extracting maximum data.**

We extract patterns directly observable in conversations, respect epistemological boundaries, and avoid psychological interpretation or causality claims.

---

## Frozen Methodology: 5 Phases

### Phase 1: Mechanical Extraction (All ~830 conversations)
Extract all 6 pattern types from every conversation using EVENT_SCHEMA_DIVERGENCE. Record exactly, no interpretation.

### Phase 2: Preliminary Corpus-Wide Scan (All ~830 conversations)
Identify which patterns are most frequent, which combinations appear together, which topics trigger which escalations.

### Phase 3: Strategic Narrative Analysis (25-30 selected conversations)
Select conversations showing clear examples of each pattern. Document the full context and flow.

### Phase 4: Pattern Validation & Cross-Reference
Verify patterns hold across dataset. Identify edge cases. Test pattern reliability.

### Phase 5: Dataset Report & Implementation Guide
Final dataset with confidence scores, pattern frequencies, trigger mappings, and recommendations for Divergence.AI features.

Phases cannot be merged, reordered, or skipped.

---

## Pattern Types (Replaces 8 Event Types)

### 1. TRANSLATION_MISMATCH
What you ASKED ≠ what you MEANT.

**Indicators:**
- You clarify/rephrase later
- You say "no, that's not what I meant"
- AI answered the literal question but missed intent
- You express frustration about being misunderstood

**Extract:**
- Turn where original question/statement occurred
- What you literally asked
- What you actually wanted (inferred from clarification)
- Friction point (vague language, missing context, wrong frame)
- Turns to clarify (how many before intent was clear)
- Emotional intensity when realizing misunderstanding (calm/frustrated/escalated)

**Confidence Ceilings:**
- Mechanical facts (question + clarification text): 95%
- Intent inference: 60%
- Root cause of friction: 50%

---

### 2. ESCALATION_PATTERN
Observable escalation in your emotional state. Markers: caps, curse words, tone shift, punctuation changes.

**Indicators:**
- Caps percentage increases mid-conversation
- Curse words appear or increase
- Punctuation becomes aggressive (!!!, ???)
- Sentence length/complexity changes
- Specific frustrated phrases ("fuck", "stop", etc.)

**Extract:**
- Turn number escalation started
- What triggered it (topic, response type, question, etc.)
- Escalation level (1=calm, 5=maximum frustration)
- Specific markers used (list caps percentage, curse words, punctuation)
- Emotional intensity markers (short clipped sentences, repeated words)
- How it resolved (did AI response de-escalate? Was it conversation-ender?)
- Was de-escalation attempted? Effective?

**Confidence Ceilings:**
- Mechanical markers (caps %, curse count): 95%
- Escalation level assignment: 75%
- Root cause of escalation: 60%
- What would have prevented it: 30%

---

### 3. DE-ESCALATION_OPPORTUNITY
Moment where escalation COULD have been prevented. Identifies what worked vs. didn't work.

**Indicators:**
- AI response triggered escalation
- Different response would have prevented it
- You returned to conversation after escalation (shows de-escalation was possible)
- You explicitly stated what would have worked better

**Extract:**
- Turn where escalation occurred
- AI's response that failed
- Why it failed (asked clarifying question when context existed, hedged when you wanted direct answer, etc.)
- What you actually needed (direct answer, acknowledgment, no follow-up questions, etc.)
- De-escalation strategy that would have worked
- Confidence in this assessment
- Did you explicitly state what would have worked? (highest confidence if yes)

**Confidence Ceilings:**
- Mechanical facts (what was said): 95%
- Why AI's response failed: 60%
- What would have worked: 50%
- Counterfactual effectiveness: 0% (OFF-LIMITS - don't claim)

---

### 4. MOOD_SIGNAL
Detectable pattern indicating your actual mood/emotional state.

**Indicators:**
- Caps on specific word types (emphasis vs. anger)
- Short vs. long sentences
- Curse words: creative/descriptive vs. pure emphasis
- Specific phrases ("I fucking hate", "goddammit", etc.)
- Response time patterns
- Topic switches when frustrated

**Extract:**
- Detected mood (frustrated, overwhelmed, bored, confused, urgent, sarcastic, engaged)
- Specific signals present (list each)
- Signal combinations (caps + curse + short sentences = different from just caps)
- Confidence in detection (is this reliable marker?)
- Frequency across dataset (how often does this pattern appear?)
- Common triggers for this mood (what tends to cause it?)
- Reliability score (how consistently does this signal predict mood?)

**Confidence Ceilings:**
- Mechanical markers present: 95%
- Mood label assignment: 75%
- Reliability of this signal: 60%
- What caused the mood: 50%

---

### 5. BLUNTNESS_PREFERENCE
When you preferred direct/harsh truth vs. softened/hedged answers.

**Indicators:**
- You rejected hedging language ("maybe", "could", "might")
- You rejected explanations, wanted action
- You appreciated direct contradiction
- Context matters: technical vs. emotional topics
- Bluntness preference varies by conversation stage

**Extract:**
- Context (topic type: technical/personal/meta, conversation stage: early/middle/resolving)
- Response that failed (what softening/hedging you rejected)
- Response that worked (what direct language you preferred)
- Pattern (always prefer bluntness? Only in technical? Depends on mood?)
- Applies to emotional topics? (separate assessment)
- Bluntness markers you preferred (examples of effective directness)
- When hedging was rejected vs. accepted

**Confidence Ceilings:**
- Mechanical facts (what language was present): 95%
- Context assessment (why this context): 75%
- Bluntness preference in this context: 80%
- Generalization to other contexts: 60%

---

### 6. FRICTION_POINT
Recurring pattern causing misunderstanding or frustration.

**Indicators:**
- Happens multiple times in same conversation
- Happens across multiple conversations
- Causes repeated clarification need
- Triggers escalation
- Slows down problem-solving

**Extract:**
- Category of friction (vague language, assumptions, missing context, follow-up questions when context exists, hedging, etc.)
- Specific problem (AI does X which requires you to do Y to clarify)
- Frequency in this conversation
- Frequency in dataset (rough: rare/occasional/common/very common)
- Impact (slows interaction, causes escalation, causes misunderstanding, forces restart)
- Solution that worked (what prevented this friction)
- Effectiveness of solution (always works, usually works, sometimes works)

**Confidence Ceilings:**
- Mechanical facts (friction occurred): 95%
- Root cause identification: 75%
- Frequency count: 90%
- Solution effectiveness: 70%

---

## JSON Schema (Replaces EVENT_SCHEMA)

```json
{
  "pattern_id": "C001_P001",
  "conversation_id": "C001",
  "conversation_filename": "conversation_001_archive.md",
  "turn_number": 5,
  "turn_label": "turn_5_of_12",
  "pattern_type": "ESCALATION_PATTERN",
  
  "raw_text": "are you fucking serious?? you asked me that ALREADY",
  "extracted_content": "User escalated: caps + curse words, frustrated about repeated question",
  "confidence_level": "DIRECT_OBSERVATION",
  
  "pattern_specific_fields": {
    "escalation_level": 4,
    "trigger": "AI asked clarifying question already answered earlier",
    "markers": {
      "caps_percentage": 35,
      "curse_words": ["fucking"],
      "punctuation_style": "??",
      "sentence_length": "short"
    },
    "emotional_intensity": "high",
    "was_de_escalated": true,
    "de_escalation_strategy_used": "direct_answer_without_questions"
  },
  
  "edge_case_encountered": false,
  "edge_case_notes": "",
  "decision_log": "Clear escalation marker: caps, curse word, frustration explicit. Trigger: redundant question.",
  "extraction_timestamp": "2025-07-24T14:30:00Z"
}
```

---

## Implementation: Phase 1 Pilot

**STEP 1: Setup**
- Locate all ~830 conversation files
- Create extraction_output/ folder structure
- Load this methodology document

**STEP 2: Extract from 5 pilot conversations**
Extract all 6 patterns from conversations [1, 100, 250, 500, 800].

For each pattern found, record one JSON object per line in pilot_ledger.jsonl.

**STEP 3: Pilot Report**
- Total patterns extracted
- Distribution by type
- Edge cases encountered
- Estimated time for full 830
- Issues with definitions
- Confidence score distribution

**STEP 4: Approval Gate**
STOP after pilot. Report results. Do NOT continue to full extraction until approved.

---

## What You CAN'T Claim

OFF-LIMITS (Confidence = 0%):
- Counterfactuals ("if AI had said X, you would have...")
- Causality ("AI's response caused your escalation")
- Psychological diagnosis ("you have ADHD" — can observe pattern, not label)
- Learning ("you learned from this")
- Success ("implementation worked because...")
- Comparisons to other systems

---

## What You CAN Claim

ON-LIMITS (Use confidence ceilings):
- Mechanical facts: "User typed X"
- Pattern frequency: "Escalation appeared in 40% of conversations"
- Signal correlation: "Caps + curse words appeared together in 85% of escalations"
- Observable markers: "Short sentences increase when frustrated"
- Pattern triggers: "Redundant questions triggered escalation in these X conversations"
- Recommended strategies: "De-escalation via direct-answer-without-questions worked in Y% of cases"

---

## Field Validation Before Extraction

- [ ] pattern_id is unique (C[NNN]_P[NNN] format)
- [ ] conversation_id matches actual conversation
- [ ] turn_number accurate for this turn
- [ ] pattern_type is exactly one of 6 types
- [ ] raw_text is exact quote from conversation
- [ ] extracted_content is 10-20 words, summarizing pattern
- [ ] confidence_level is DIRECT_OBSERVATION or INFERENCE_*
- [ ] pattern_specific_fields are fully populated for this pattern type
- [ ] edge_case_encountered boolean matches edge_case_notes population
- [ ] decision_log explains why classified as this pattern type
- [ ] extraction_timestamp is ISO 8601 format

---

## Next Steps

1. Load this file
2. Locate your 830 conversation files
3. Run Phase 1 Pilot on 5 conversations
4. Generate pilot_report.txt
5. Send pilot report and pilot_ledger.jsonl
6. Wait for approval before continuing

