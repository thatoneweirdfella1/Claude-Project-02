# Granular Feedback Specification
## Thumbs-Down on Routing & Techniques

**Status: CONFIRMED (B.12.3 = YES)**

---

## OVERVIEW

In addition to the **final answer rating** (5 stars + comment), system collects **intermediate step feedback**.

User can signal "wrong" at two points:
1. **Routing card** → "You picked the wrong model"
2. **Technique card** → "Bad technique selection"

This data feeds learning system immediately for faster pattern detection.

---

## FEATURE 1: ROUTING FEEDBACK (Thumbs-Down on Model)

### Trigger Point

After routing is shown, before composition:

```
┌─────────────────────────────────┐
│ ROUTING DECISION                │
├─────────────────────────────────┤
│ Question: [user's question]     │
│ Recommended model: Opus-Fast    │
│ Confidence: 87%                 │
│ [Explain routing]               │
├─────────────────────────────────┤
│ 👎 Wrong model (thumbs-down)    │
│ [Other options: Haiku / Thinking]
│                                 │
│ [Continue] [Use different]      │
└─────────────────────────────────┘
```

### User Action

User clicks 👎 "Wrong model"

### System Response

Option 1: Show alternatives
```
👎 Noted. Which would be better?
☐ Haiku (faster)
☐ Opus-Thinking (more thorough)
[Use selected]
```

Option 2: User proceeds anyway
- If user clicks [Continue], system uses recommended model BUT logs the thumbs-down

### Data Logged

```json
{
  "question_id": "...",
  "routing_feedback": {
    "model_recommended": "opus-fast",
    "user_rated": "thumbs-down",
    "timestamp": "...",
    "was_overridden": false/true,
    "model_used": "opus-fast" // even if they rated it wrong
  }
}
```

### Learning System Uses This

After 10+ thumbs-down on routing for same question type:
- "For research questions, users thumbs-down Opus-Fast 60% of the time"
- Next research question: suggest Opus-Thinking or ask user first

---

## FEATURE 2: TECHNIQUE FEEDBACK (Thumbs-Down on Techniques)

### Trigger Point

After techniques are selected, before composition:

```
┌─────────────────────────────────┐
│ TECHNIQUES (3 selected)         │
├─────────────────────────────────┤
│ ✓ T03 - Socratic Prompting      │
│ ✓ T01 - System Role Definition  │
│ ✓ T04 - Outcome Specification   │
│                                 │
│ [Show reasoning]                │
├─────────────────────────────────┤
│ 👎 Bad selection (thumbs-down)  │
│ [Reselect techniques]           │
│                                 │
│ [Continue] [Change techniques]  │
└─────────────────────────────────┘
```

### User Action

User clicks 👎 "Bad selection"

### System Response

```
👎 Noted. Which techniques would work better?
[Custom technique picker - let user select]
or
[Auto-select alternatives]
```

### Data Logged

```json
{
  "question_id": "...",
  "technique_feedback": {
    "techniques_selected": ["T03", "T01", "T04"],
    "user_rated": "thumbs-down",
    "timestamp": "...",
    "was_changed": false/true,
    "techniques_used": ["T03", "T01", "T04"]
  }
}
```

### Learning System Uses This

After 10+ thumbs-down on techniques for same question type:
- "For product research, selected techniques get thumbs-down 70%"
- "These 3 techniques conflict for your style"
- Next product research: avoid that combo, suggest alternatives

---

## UI PLACEMENT

### Routing Feedback
- Location: Right on routing card
- Size: Small button (thumbs icon, text "Wrong model")
- Visibility: Always visible
- Never intrusive

### Technique Feedback
- Location: Right on technique card
- Size: Small button (thumbs icon, text "Bad selection")
- Visibility: Always visible
- Never intrusive

---

## DATA FLOW

```
User clicks 👎 on routing/technique
    ↓
System logs feedback immediately
    ↓
After question complete:
  - User rates final answer (5 stars)
  - System correlates all feedback (routing + technique + answer)
  ↓
Learning system detects patterns
    ↓
After 10+ same-type questions:
  - "This feedback pattern emerged"
  - "Should I adjust for next time?"
  - Suggest routing/technique changes
```

---

## EXAMPLES

### Example 1: Routing Thumbs-Down → Learn Preference

**Question 1-10:** User asks 10 career questions
- Routing suggests Opus-Fast (confidence 80%)
- User gives thumbs-down on Routing 6 times
- User rates final answers 5 stars

**Learning detection:** "Career questions: thumbs-down on routing 60% of time"

**Question 11:** Same type question
- System: "For career questions, users prefer Opus-Thinking. Use that?" or suggest both

---

### Example 2: Technique Thumbs-Down → Learn Conflict

**Question 1-10:** Product research questions
- Techniques selected: T03 (Socratic) + T16 (Constraint Definition)
- User gives thumbs-down on techniques 5 times
- User rates final answers 2-3 stars

**Learning detection:** "T03 + T16 conflict for product research questions"

**Question 11:** Same type question
- System: Avoid T03 + T16 combo, suggest different pairing

---

## IMPLEMENTATION NOTES

### Storage
- Log to database immediately (don't wait for final rating)
- Link to question_id for correlation

### Display
- Don't force user to explain thumbs-down
- Optional comment: "Tell us why?" (but not required)
- Never intrusive or guilt-inducing

### Learning Threshold
- Need 10+ same-question-type with thumbs-down before surfacing pattern
- Only suggest change if confidence > 70%
- User can dismiss patterns ("No, keep using that")

### Granularity
- Collect at 2 points: routing and technique
- NOT at individual technique level (keep simple)
- NOT at composition level (happens before final prompt shown)

---

## COMPARISON: WITH vs WITHOUT

### WITHOUT Granular Feedback
- Only final answer rating (5 stars)
- Learning system sees: "User rated career question 3 stars"
- Can't tell: was routing wrong? techniques wrong? composition wrong?
- Slower pattern detection

### WITH Granular Feedback
- Routing: thumbs-down
- Techniques: thumbs-down
- Final answer: 3 stars
- Learning system sees: "Routing AND technique issues"
- Faster, clearer pattern detection

---

**Status: COMPLETE. Ready for implementation in Phase 13.**
