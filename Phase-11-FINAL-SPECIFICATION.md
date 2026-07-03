# Phase 11: Multi-AI Conversation Mode
## FINAL SPECIFICATION (Complete, All Answers Locked)

---

## PART 1: MULTI-AI DIALOGUE SYSTEM

### 1.1 DIALOGUE GOAL FRAMEWORK (5 Core Goals)

User selects from **5 core dialogue goals** (collapsed from 7 for clarity):

1. **Get a solid answer** → Stress-test it (Adversarial mode)
2. **Understand something** → Explore deeply (Socratic mode)
3. **Improve an idea** → Get feedback (Devil's Advocate mode)
4. **Make a decision** → Weigh both sides (Synthesis mode)
5. **Have a debate** → Just see what happens (Consensus mode)

**Flow:**
- User picks goal
- System optionally asks: "How deep?" (Surface / Medium / Deep) via quick buttons
- System optionally asks: "Your position?" (For / Against / Undecided) if applicable
- System recommends primary mode + shows alternative
- User picks mode or clicks "Show all options"

---

### 1.2 DIALOGUE DISPLAY (Chat-Box Top-to-Bottom Layout)

**NOT side-by-side. Stream conversation vertically like texting.**

```
Model A (Claude A): [speaks]

Model B (GPT A): [responds]

Model A (Claude B): [responds]  ← 🔄 Claude B joins (tokens depleted)

Model B (GPT A): [responds]

[Full scrollable history, nothing hidden]
```

**Per-turn buttons:** Copy + Regenerate only. No thumbs up/down on individual turns.

---

### 1.3 ACCOUNT ROTATION & TOKEN MANAGEMENT

**User has 8 free accounts pooled:**
- Claude A, Claude B (Anthropic)
- GPT A, GPT B (OpenAI)
- Perplexity A, B, C (Perplexity)
- (Other)

**Auto-swap logic:**
- Current account tokens depleted → Next available account takes over
- **Swap notification:** Banner ("🔄 Claude B taking over") + inline in dialogue ("← Claude B joins (Claude A tokens depleted)")
- Context transferred automatically via system prompt
- User sees: seamless handoff, transparent notification

**Swap scenarios:**
- Single account depletes → swap to next of same provider
- Both Claude accounts depleted → ask user: "Both Claude depleted. Use Perplexity?" (don't auto-abort)
- Token warning: Pre-dialogue check shows "Claude A has 200 tokens left. Dialogue might swap. Proceed?"

---

### 1.4 UNIVERSAL BUTTON SYSTEM (Context-Aware)

Two buttons on every turn: **✅ Accept** and **🔄 Continue**

**Button meanings shift by mode/context:**

| Mode | ✅ Accept | 🔄 Continue |
|------|-----------|------------|
| Consensus | "We agree" | "Counter that point" |
| Adversarial | "Good point, move on" | "Attack again" |
| Socratic | "I understand" | "Ask another question" |
| Devil's Advocate | "Idea is good" | "Refine based on feedback" |
| Synthesis | "Accept this view" | "Propose alternative" |

**Always present:** ❌ Stop Dialogue button

---

### 1.5 DIALOGUE-SPECIFIC AUTO-STOP CONDITIONS

**Consensus mode:**
- Detects agreement (both models say "agree," "fair point," "concede")
- Max 4 rounds
- Stops when: consensus reached OR max rounds

**Adversarial mode:**
- Detects core weakness identified (both models acknowledge flaw)
- OR detects argument refined
- Max 5 rounds
- Stops when: weakness found OR refined OR max rounds

**Socratic mode:**
- Detects deep understanding (meta-commentary, increased specificity)
- Max 3 rounds
- Stops when: understanding achieved OR max rounds

**Devil's Advocate mode:**
- Detects proposal refined (iteration detected, length increased, "revised" language)
- Max 4 rounds
- Stops when: proposal refined OR max rounds

**Synthesis mode:**
- Detects synthesis complete (integration keywords: "combines," "integrates," "both," "synthesis")
- Max 3 rounds
- Stops when: synthesis complete OR max rounds

---

### 1.6 FEATURES LOCKED IN

✅ **Interrupt mid-response?** No. Each model finishes, natural flow.

✅ **Long responses (500+ words)?** Full text always visible. No truncation. Scrolling is fine.

✅ **Switch modes mid-dialogue?** Yes. Keep history, restart under new rules.

✅ **Rewind button (branch dialogue tree)?** Yes. "Let me retry Round 3 with different reasoning."

✅ **Take over mode (I type responses)?** Yes. Insert your own thought, see models respond to YOU.

✅ **Models reference specific statements?** Yes. "But you said in Round 1..." with quotes.

✅ **Pause indefinitely?** Yes. Life happens. Support resume hours later.

✅ **Learn model preferences?** Yes. After 10 dialogues, system detects: "Claude is better at Devil's Advocate, GPT better at Socratic."

❌ **PDF export?** No. User doesn't like PDFs.

✅ **Markdown + Text + Copy to Clipboard export?** Yes. All three options in dropdown.

✅ **Dialogue summary auto-generated?** Yes, but hidden. "Dialogue Summary" button expands optional summary.

✅ **Permanently saved + searchable + tagged?** Yes. "career-decision, important, refined-idea" tags. Forever history.

✅ **Feedback on individual turns?** See B.12.3 clarification needed (Yes/No to granular feedback).

✅ **Dialogue saved in History screen?** Yes. Accessible, searchable, tagged.

✅ **Confidence score (dialogue health)?** Yes, unobtrusive. "78%" bottom-right, small text.

---

### 1.7 FEEDBACK AFTER DIALOGUE

```
HOW HELPFUL WAS THIS DIALOGUE?
⭐⭐⭐⭐⭐ (5 stars)

What did it do well?
☐ Found agreement
☐ Surfaced weaknesses
☐ Explored deeply
☐ Improved my idea
☐ Showed perspectives
☐ Something else

Comment (optional):
[text box]

[Submit] [Skip]
```

**Learning system detects:**
- Which goals map to which modes (refinement)
- Which mode × question-type combos are most helpful
- Model performance by role (Claude vs. GPT at each mode)

---

## PART 2: FULL APP REFINEMENT

### 2.1 STAGE 1: TRANSLATION

✅ **Re-translate with parameter options?** Yes. "Retranslate" button shows:
  - "More aggressive decomposition"
  - "Less emotional normalization"
  - "Force separate questions"
  - User picks, re-translates

✅ **Compound questions (e.g., 3 questions at once)?** Yes. Ask user: "Route together (faster) or separately (thorough)?" User decides.

✅ **Translation display default?** Just final translated question. "Show translation details" button expands to gap category + operations applied.

✅ **Translation dictionary visible?** Reference screen yes. Real-time suggestions no. "Translation Reference" tab browse 28 "when I say X" entries.

✅ **Emotional normalization?** Ask permission first time: "I detected emotional language. Normalize it?" Then toggle in Settings for future.

---

### 2.2 STAGE 2: ROUTING

✅ **Show model + confidence + reason?** Default: model + confidence. "Explain routing" button expands to decision (power users click, casual users don't).

✅ **Safety override for high-consequence?** Yes. If Consequence gate says Opus-Fast, override to Haiku with warning: "This is high-stakes. You sure?" Make override explicit.

✅ **Boundary questions (Haiku vs. Opus-Fast)?** Show both options: "Borderline. Haiku (fast) or Opus-Fast (thorough)?" User picks.

✅ **Consider past satisfaction in routing?** Yes. After 15-20 of same question type, learning system weights history: "You always rate Opus-Fast higher for research. Using that."

---

### 2.3 STAGE 3: TECHNIQUE SELECTION

✅ **Show technique names only, descriptions, or why chosen?** Default: names + one-line descriptions. "Show reasoning" button expands why chosen. Power users nerd out, casual users don't.

✅ **Are technique limits right (Haiku 6, Opus-Fast 9, Opus-Thinking 6)?** Yes for now. Learning system adjusts: "You're hitting max techniques. Want to increase per-question limit?"

✅ **Favorite technique combinations?** YES. "Save this stack as 'My Research Stack'" → auto-apply to future research questions.

✅ **Conflicting techniques (auto-pick, ask, both)?** Auto-pick (higher score wins) but show note: "Removed T14 (conflicts with T15)." User can override if disagree.

---

### 2.4 STAGE 4: COMPOSITION

✅ **See final prompt before sending?** Optional "Show Prompt" button. Default hidden (trust system but option to peek).

✅ **Preview answer (max_tokens=50)?** Yes. "Fast Preview" button. Show opening, let user decide: "Get full answer" or "Edit and retry."

✅ **Output format options?** Smart detection + Settings default. "You asked 'list all X'" → suggest JSON. Override per-question. Settings: default format (prose/JSON/markdown/bullets).

---

### 2.5 STAGE 5: EXECUTION & FEEDBACK

✅ **See answer + metadata?** Default: just answer. "Details" button shows tokens, latency, model, confidence. Keep main clean.

✅ **Regenerate vs. Reroute button?** Both. Regenerate = same model, same prompt. Reroute = different model, same prompt. User picks fix strategy.

✅ **Long answers (1000+ words)?** Full text always. No truncation. Scrolling fine.

✅ **Structured feedback (checkboxes)?** Optional. Default: 5 stars + comment. "More details" → expand to checkboxes (too long, wrong model, missing detail, hallucination, format issue). Only check if needed.

✅ **System acknowledgment of feedback?** Immediate. "Got it. I'll try Opus-Thinking for complex questions next time." Brief confirmation.

✅ **Un-rate or change rating?** Yes. Update rating in History anytime.

✅ **Surface pattern detections?** Not auto-pop-up. Show in History → Patterns tab. Quarterly summary: "Here's what I learned about you in Q2." Opt-in.

---

### 2.6 HISTORY & DISCOVERY

✅ **History filters?** All of them: search + filter by model, rating, date, question type. Sort by rating, recency, usefulness.

✅ **Similar questions feature?** Yes. "You've asked about career changes 7 times. See them?"

✅ **Duplicate and variant question?** Yes. Copy question, auto-prefill, change one parameter.

✅ **Patterns tab auto-insights?** Auto-generate + let user add notes. "You prefer Opus-Fast for research (85%)" as system insight. User can add own notes.

---

### 2.7 SETTINGS & PRESETS

✅ **Most important settings?** 
  - Default model preference
  - Transparency level (how much metadata to see)
  - ADHD Mode toggle
  - Feedback style (explicit vs. inferred)
  - Technique limits

✅ **Presets?** Yes. Power User / Simple / ADHD-Optimized.
  - ADHD-Optimized: minimal visual noise, sequential animations, one goal at a time, high contrast, larger text option

✅ **Per-question-type preferences?** After 20+ of a type, offer it: "Research questions usually work best with Opus-Fast. Set as default?" Yes/No remember.

✅ **Auto-apply preferences or explicit control?** Auto-apply with transparency. "Using your Research preference (Opus-Fast)" shown on routing card. Override anytime.

---

### 2.8 EXPERIENCE & PERFORMANCE

✅ **Wait tolerance?** Haiku 2-3s fine. Opus-Fast 5-10s acceptable. Opus-Thinking 20-30s max before progress indicator. Show "Model is thinking..." for >3s.

✅ **Error handling?** User-friendly message + recovery options. "Couldn't reach Claude. Retry? Try GPT instead? Save as draft?" Never leave user hanging.

✅ **Offline mode?** Nice-to-have, not critical. Queue locally, sync when online.

---

### 2.9 ADHD-SPECIFIC DESIGN

✅ **Most distracting?** Too many buttons visible, visual clutter (too many colors), frequent animations, lots of text where bullets would help.

✅ **ADHD Mode settings?**
  - Hide advanced options (show only 3-4 essential buttons)
  - Reduce animations (slower/fewer)
  - High contrast toggle
  - Plain language (avoid jargon)
  - Smaller, focused UI

✅ **Long wait times (30+ seconds)?** Show progress ("Model is thinking... 10 seconds elapsed"). Encouraging messages ("Claude is considering multiple angles..."). Sound notification when done (optional, can disable).

✅ **Focus mode?** Yes. One question at a time. Hide history/settings until explicitly asked. Minimal distractions.

---

### 2.10 INTEGRATION & WORKFLOW

✅ **Copy answers to clipboard?** Yes. Markdown default, option for plain text or HTML.

✅ **Shareable answers?** PDF export = No (user doesn't like). Link to dialogue = yes. Share as markdown link.

✅ **Templates for common question types?** YES. "Career Decision," "Product Research," "Learning New Skill," "Making a Tough Call," "Project Planning." Pre-fill sub-questions, show recommended routing/dialogue mode.

✅ **External integrations?** Copy-paste enough for MVP. Notion integration nice (save to Notion auto) but not critical.

---

### 2.11 GROWTH & PROGRESSIVE UNLOCKING

✅ **Progressive feature unlock?** **YES 1000000%**

**Day 1 (First Use):**
- Simple mode: Translate → Route → Get answer
- One toggle: "Multi-AI mode" (off by default)
- Feedback: 5 stars only

**After 10 questions:**
- Unlock: Technique selection visibility ("See which techniques")
- Unlock: Custom goals for Multi-AI
- Unlock: History screen

**After 25 questions:**
- Unlock: Advanced routing (see routing reasoning)
- Unlock: Template library
- Unlock: Patterns tab

**After 50 questions:**
- Unlock: Custom technique stacks (save + favorite)
- Unlock: Dialogue branching (rewind, retry rounds)
- Unlock: Focus Mode
- Unlock: ADHD Mode in Settings

**After 100 questions:**
- Unlock: Account management (add own API keys, manual rotation)
- Unlock: Custom dialogue modes (define your own)
- Unlock: Analytics dashboard (question patterns)

**Why:** No Day-1 overwhelm. System teaches itself as you use it. By Day 100, deep customization unlocked.

✅ **Onboarding?** Walkthrough on first use (skippable). Tooltips on hover (always available). Help button on every screen. Video tutorials optional. Don't overwhelm.

✅ **Real-time feedback on intermediate steps?** **[AWAITING 1-2 WORD CLARIFICATION]** See B.12.3.

✅ **6-month evolution?** Mobile app (most important) > Better learning (predictive) > Dialogue templates (pre-built debate setups) > Integration with Notion/Docs > Maybe collaboration.

---

## PART 3: NEW FEATURES IDENTIFIED

### 3.1 QUIET MODE (NEW)

**Problem:** Sometimes user feels overwhelmed by suggestions, questions, pattern alerts.

**Solution:** **🔇 Quiet Mode toggle** (visible after every answer)

**When ON:**
- No follow-up questions
- No technique explanations
- No routing reasoning shown
- No pattern suggestions
- No confidence scores
- No multi-AI mode toggle shown
- Just: [Question] → [Answer]

**When OFF:**
- All normal features active

**Persistence:** User preference saved. Stays on until toggled off (via button or Settings).

**Why this matters:** Sometimes you don't want to think. Just want the answer. Quiet Mode gives you that.

---

## PART 4: IMPLEMENTATION PRIORITY

### Tier 1 (MVP - Must Have)
- [x] 5 core dialogue goals
- [x] Chat-box top-to-bottom dialogue display
- [x] Account rotation + auto-swap
- [x] Swap notification (banner + inline)
- [x] Universal button system (✅ Accept, 🔄 Continue)
- [x] Auto-stop conditions per mode
- [x] Quiet Mode toggle
- [x] Progressive feature unlocking (5 milestones)
- [x] ADHD Mode preset
- [x] History with search + tags

### Tier 2 (v1.1)
- [ ] Dialogue branching (rewind/retry)
- [ ] Take-over mode (user types responses)
- [ ] Custom dialogue modes
- [ ] Template library
- [ ] Notion integration
- [ ] Mobile app

### Tier 3 (v2.0+)
- [ ] Collaboration (share dialogue)
- [ ] Analytics dashboard
- [ ] Advanced ML learning
- [ ] Browser extension

---

## PART 5: KEY DECISIONS FINALIZED

| Decision | Answer | Reason |
|----------|--------|--------|
| Dialogue layout | Chat-box top-to-bottom | Easier to follow, like texting |
| Export formats | Markdown + Text + Clipboard | All options, user picks |
| Per-turn buttons | Copy + Regenerate only | Minimal, clean UI |
| Dialogue history | Full scrollable, never hidden | No truncation desired |
| Account swap notification | Banner + inline | Transcription accuracy |
| Quiet Mode | Yes | Handle overwhelm moments |
| Progressive unlock | 5 milestones (10/25/50/100 questions) | No Day-1 overwhelm |
| PDF export | No | User doesn't like PDFs |
| Focus Mode | Yes | Deep work sessions |
| ADHD Mode | Yes, full preset | High contrast, plain language, fewer buttons |

---

## PART 6: B.12.3 CONFIRMED - GRANULAR FEEDBACK (YES)

✅ **LOCKED: Granular feedback system enabled**

System collects:
- **Thumbs-down on routing card** → "wrong model" signal
- **Thumbs-down on techniques** → "bad selection" signal

This data feeds learning system immediately (faster pattern detection).

---

**Phase 11 Final Specification: COMPLETE ✅**

**Status: Ready for Phase 12 (Implementation Planning)**
