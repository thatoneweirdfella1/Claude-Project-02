# Quiet Mode Specification
## For When Everything Feels Like Too Much

---

## PROBLEM STATEMENT

**User feedback:** "Add a button to turn off all questions, ratings and suggestions. Something that can cut out all the Noise if I feel overwhelmed or bombarded with questions."

User sometimes feels **overloaded** by:
- Follow-up questions prompting interaction
- Technique explanations
- Routing reasoning shown
- Pattern suggestions popping up
- Confidence scores
- Multi-AI mode toggle
- Feedback request prompts

**Solution:** Single **Quiet Mode toggle** that silences all optional notifications and suggestions.

---

## QUIET MODE BEHAVIOR

### When QUIET MODE is ON

All of the following are **hidden:**

- ❌ Follow-up questions after answer ("Want to ask a variant?" "Save as template?")
- ❌ Technique explanations ("Here are the techniques used...")
- ❌ Routing reasoning shown ("Explanation" button hidden)
- ❌ Pattern suggestions ("I notice you use X for Y type questions...")
- ❌ Confidence scores and metrics
- ❌ Multi-AI mode toggle ("Continue with another perspective?")
- ❌ Structured feedback options ("More details" expansion)
- ❌ Learning notifications ("Detected pattern X")
- ❌ All suggestion buttons and prompts

**User sees only:**
```
Question: [what user asked]
Answer: [what model answered]
```

**That's it.** Minimal visual noise.

### When QUIET MODE is OFF

All normal features active:
- Follow-up questions
- Explanations
- Multi-AI toggle
- Feedback requests
- Suggestions

---

## UI IMPLEMENTATION

### Toggle Location

**After answer displayed, above feedback section:**

```
┌─────────────────────────────────┐
│ [Answer text]                   │
└─────────────────────────────────┘

🔇 Quiet Mode (OFF)  ← toggle button

┌─────────────────────────────────┐
│ Rate this answer:               │
│ ⭐⭐⭐⭐⭐                         │
│                                 │
│ [Submit] [Skip]                 │
└─────────────────────────────────┘
```

**When user clicks toggle:**

```
🔇 Quiet Mode (ON)

┌─────────────────────────────────┐
│ [Answer text]                   │
└─────────────────────────────────┘
```

Feedback section disappears. No prompts.

---

## PERSISTENCE

### Session-Based (Default)
- User toggles ON
- Quiet Mode stays ON for current session
- When user closes app/navigates away, resets to OFF for next session

### Persistent (if enabled in Settings)
- User toggles ON
- Settings → Quiet Mode preferences → "Remember Quiet Mode preference"
- Stays ON across sessions until user manually toggles OFF

### User Control
- Toggle available on every answer card
- Settings section: "Quiet Mode" with options:
  - ON/OFF toggle (quick access)
  - "Remember preference" checkbox (persist across sessions)
  - Restore all notifications button (reset to OFF if stuck)

---

## WHAT DOES NOT HIDE

**Core feedback mechanism still visible in Quiet Mode:**

- ✅ 5-star rating input (optional)
- ✅ Comment text box (optional)
- ✅ Submit/Skip buttons
- ✅ History access (not hidden, just not promoted)

**Rationale:** User might still want to rate the answer, but doesn't want explanations/suggestions. Quiet Mode hides the "noise" (optional features) but preserves the "signal" (core rating feedback).

---

## LEARNING SYSTEM IMPLICATIONS

**When Quiet Mode is ON:**
- System still logs the question, answer, and rating (if provided)
- System does NOT log intermediate feedback (routing thumbs-down, technique thumbs-down) — because user doesn't see these
- Patterns are still generated from collected data
- But NO pattern surface prompts shown to user (they're quiet)

**Why:** System keeps learning. User just doesn't see the noise while learning happens.

---

## USE CASES

### Case 1: User is Tired
> User gets answer, feels bombarded by "Want to try multi-AI?" and "Here are the techniques used" and "I detected a pattern about your questions."
> 
> **Action:** Clicks 🔇 Quiet Mode → answer stays visible, everything else disappears. User rates, moves on.

### Case 2: User is in Deep Focus
> User is working on important problem. Gets answer. Needs to think, not interact.
> 
> **Action:** Toggles Quiet Mode → just sees answer, no prompts. No distraction.

### Case 3: User is Overwhelmed (ADHD Moment)
> User's executive function is depleted. Too many options feel paralyzing.
> 
> **Action:** Quiet Mode → simplest possible interface: answer + optional rating. No cognitive load.

### Case 4: User is Just Browsing
> User has quick question, doesn't care about optimization or patterns.
> 
> **Action:** Quiet Mode → ask → get answer → move on. Zero friction.

---

## ACCESSIBILITY NOTES

### For ADHD Users
- Quiet Mode is **separate from ADHD Mode preset**
  - ADHD Mode = Preset colors, text, animations, accessibility
  - Quiet Mode = Silencing optional prompts
  - Both can be enabled together
  
- Quiet Mode checkbox easily accessible via:
  - Toggle button on answer card
  - Settings → Quiet Mode
  - Keyboard shortcut (if applicable)

### For All Users
- Quiet Mode doesn't remove core functionality
- All features still available, just not pushed
- User always in control

---

## COMPARISON WITH ADHD MODE

| Feature | ADHD Mode | Quiet Mode |
|---------|-----------|-----------|
| Purpose | Visual accessibility | Reduce information overload |
| Affects | Colors, text size, animations | Prompts and suggestions |
| Configurable | Yes (M4+) | Yes (session or persistent) |
| Can combine | Yes | Yes |
| Affects learning | No | No (system still learns) |
| Default | No (opt-in) | No (opt-in) |
| Scoped to | Entire session | Entire session (or persistent) |

---

## SETTINGS PANEL

### Quiet Mode Settings Location
**Settings → Preferences → Quiet Mode**

```
┌─────────────────────────────────────┐
│ QUIET MODE                          │
├─────────────────────────────────────┤
│ Quiet Mode helps you focus by       │
│ hiding non-essential suggestions    │
│ and prompts.                        │
│                                     │
│ Quick toggle: 🔇 Quiet Mode (OFF)  │
│                                     │
│ ☐ Remember Quiet Mode preference   │
│   (stay ON across sessions)         │
│                                     │
│ ☐ Hide feedback section entirely    │
│   (even rating) when ON             │
│                                     │
│ [Reset to defaults]                 │
│ [Learn more about Quiet Mode]       │
└─────────────────────────────────────┘
```

---

## INTERACTION FLOW

### Scenario: User Enables Quiet Mode

```
1. User gets answer from model
2. Sees: Answer + feedback section + prompts
3. Clicks: 🔇 Quiet Mode toggle
4. Button changes to: 🔇 Quiet Mode (ON)
5. All prompts fade out / disappear
6. Feedback section minimizes (optional: stays or collapses)
7. User sees: Answer only
8. User can still click "Show feedback" if they want to rate
```

### Scenario: Persistent Quiet Mode Enabled

```
1. First time: User enables Quiet Mode, checks "Remember preference"
2. Settings updated: Quiet Mode = persistent ON
3. Next session: User opens app, gets answer
4. Quiet Mode automatically ON
5. User can toggle OFF anytime to return to normal
```

---

## TECHNICAL IMPLEMENTATION

### Data Storage
```javascript
{
  quietMode: {
    enabled: false,              // Current session state
    persistent: false,           // Remember across sessions
    hideFeatureX: {
      followUpQuestions: true,   // Hidden when quiet mode ON
      routingExplanation: true,
      techniqueSummary: true,
      patternSuggestions: true,
      confidenceScore: true,
      multiAIToggle: true,
      learningNotifications: true
    }
  }
}
```

### Frontend Logic
```javascript
function renderAnswerCard(answer, quietMode = false) {
  let card = {
    answer: answer,               // Always shown
    feedback: true,               // Always shown (but maybe hidden UI)
    followUpQuestions: !quietMode,
    routingExplanation: !quietMode,
    techniqueSummary: !quietMode,
    multiAIToggle: !quietMode,
    learningNotifications: !quietMode
  };
  
  return buildCard(card);
}

function toggleQuietMode(persistent = false) {
  state.quietMode.enabled = !state.quietMode.enabled;
  if (persistent) {
    state.quietMode.persistent = true;
    localStorage.save(state.quietMode);
  }
  reRenderAllAnswers();
}
```

---

## TESTING SCENARIOS

- [ ] Toggle Quiet Mode ON, all prompts hide
- [ ] Toggle Quiet Mode OFF, all prompts reappear
- [ ] Answer still visible and functional in Quiet Mode
- [ ] Feedback section still accessible in Quiet Mode
- [ ] Rating still saves in Quiet Mode
- [ ] Learning system still collects data in Quiet Mode
- [ ] Persistent setting survives page reload
- [ ] Toggle button clearly labeled and accessible
- [ ] No visual lag when toggling
- [ ] Works on mobile (compact UI)

---

## FUTURE ENHANCEMENTS (Post-MVP)

- **Granular Quiet Mode**: User picks which specific prompts to hide (Settings → Advanced → "Customize Quiet Mode")
- **Smart Quiet Mode**: System detects when user is overwhelmed (rapid clicks, multiple skip buttons) and suggests Quiet Mode
- **Time-based Quiet Mode**: "Enable Quiet Mode after 5pm" or "Quiet Mode on weekends only"
- **Context-aware Quiet Mode**: "Enable Quiet Mode for this question type" (e.g., "Quiet for research, normal for decisions")

---

## SUMMARY

**Quiet Mode** is a **single toggle** that:

✅ Hides optional prompts and suggestions  
✅ Keeps core functionality visible  
✅ Respects user's cognitive load  
✅ Can be session-based or persistent  
✅ Doesn't affect learning  
✅ Complementary to ADHD Mode  
✅ Accessible and easy to understand  

**One click. Zero noise. Just answers.**

---

**Status: COMPLETE. Ready for Phase 12 implementation.**
