# Progressive Feature Unlock Matrix
## User Milestones & Feature Availability

**Based on: "YES 1000000%" to progressive unlocking**

---

## MILESTONE STRUCTURE

User progression determined by **question count** (simplest metric, tracks actual usage):

- **Milestone 1:** 0 questions (Day 1, first use)
- **Milestone 2:** 10 questions
- **Milestone 3:** 25 questions
- **Milestone 4:** 50 questions
- **Milestone 5:** 100 questions

Each milestone unlocks new features. **No unlock reversals—once unlocked, features stay available.**

---

## MILESTONE 1: DAY 1 (FIRST USE)

### Philosophy
**Simplicity first. Single workflow. No confusion.**

### Features AVAILABLE
- ✅ Translate question
- ✅ Get routing suggestion (model picked)
- ✅ Get answer from model
- ✅ Rate answer (5-star only)
- ✅ One toggle: "Multi-AI Mode" (OFF by default)
- ✅ Basic ADHD Mode toggle (simple preset, not customizable)

### Features HIDDEN
- ❌ See which techniques were selected
- ❌ See routing reasoning
- ❌ Custom multi-AI goals (if Multi-AI on, single mode only: Consensus)
- ❌ History screen (no past interactions visible)
- ❌ Advanced Settings
- ❌ Templates
- ❌ Patterns learning
- ❌ Focus Mode
- ❌ Custom ADHD settings (only preset available)
- ❌ Account management
- ❌ Dialogue branching
- ❌ Custom technique stacks

### UI Complexity
- 2-3 essential buttons per screen
- Single happy path: ask question → get answer
- No optional deep-dives
- Text-only, minimal visual clutter

### Feedback
- 5-star rating only
- Optional comment
- No structured checkboxes
- No intermediate ratings on routing/techniques

---

## MILESTONE 2: AFTER 10 QUESTIONS

### Philosophy
**User understands the system. Time to see under the hood.**

### New Features UNLOCKED
- ✅ **Technique selection visibility:** "Show which techniques were used" button → expands to list + one-line descriptions
- ✅ **Multi-AI custom goals:** Instead of single Consensus mode, user can pick all 5 goals (Solid Answer, Understand, Improve Idea, Make Decision, Debate)
- ✅ **History screen:** View past questions, answers, ratings (basic list, no filters yet)
- ✅ **Advanced Translation options:** "Retranslate" button with parameters (decomposition aggressiveness, emotional normalization toggle, etc.)

### Still Hidden
- ❌ Routing reasoning detail
- ❌ History filters/search
- ❌ Patterns tab
- ❌ Templates
- ❌ Advanced Settings (beyond ADHD Mode toggle)
- ❌ Focus Mode
- ❌ Custom ADHD settings
- ❌ Account management
- ❌ Dialogue branching

### Learning System Begins
- Starts tracking question types, model performance, user ratings
- No pattern surface yet (too little data)

---

## MILESTONE 3: AFTER 25 QUESTIONS

### Philosophy
**User is power user now. Time to explain our decisions.**

### New Features UNLOCKED
- ✅ **Advanced routing explanation:** "Explain routing" button → expands to show which rule fired, confidence score, why we picked this model
- ✅ **Boundary question choice:** For Haiku-vs-Opus-Fast borderline questions, offer both: "Haiku (fast) or Opus-Fast (thorough)?" User picks.
- ✅ **Template library:** "Career Decision," "Product Research," "Learning New Skill," "Making a Tough Call," "Project Planning" → pre-fill common sub-questions
- ✅ **Patterns tab:** History → Patterns showing: "You prefer Opus-Fast for research (75% of time)" and other learned patterns
- ✅ **History filters:** Basic filters (by date, by rating)
- ✅ **Technique reasoning:** "Show reasoning" button expands to explain why each technique was chosen

### Still Hidden
- ❌ Focus Mode
- ❌ Custom technique stacks (save/favorite)
- ❌ Dialogue branching (rewind/retry)
- ❌ Advanced ADHD customization
- ❌ Account management
- ❌ Custom dialogue modes

### Learning System Activity
- Generates first pattern suggestions ("I notice you use Adversarial mode for arguments. Should I suggest it automatically?")
- User can confirm/dismiss patterns

---

## MILESTONE 4: AFTER 50 QUESTIONS

### Philosophy
**User knows the system inside and out. Time for power features.**

### New Features UNLOCKED
- ✅ **Custom technique stacks:** "Save this stack as 'My Research Stack'" → auto-apply to future research questions
- ✅ **Dialogue branching:** "Rewind" button in Multi-AI mode → go back to any round, branch off with different reasoning
- ✅ **Focus Mode:** Settings toggle → One question at a time, hide history/settings until explicitly asked
- ✅ **ADHD Mode customization:** Instead of preset, individual toggles:
  - Hide advanced options (yes/no)
  - Reduce animations (yes/no)
  - High contrast (yes/no)
  - Plain language (yes/no)
  - Larger text (yes/no)
  - Min visual noise (yes/no)
- ✅ **Advanced History features:** Full filters (by model, by question type, by date, by rating), search, sort
- ✅ **Take-over mode in Multi-AI:** Insert your own response in dialogue → models respond to YOU
- ✅ **Confidence score in Multi-AI:** "Dialogue health: 78%" shown unobtrusive

### Still Hidden
- ❌ Account management (can't add own API keys yet)
- ❌ Custom dialogue modes (can't create new ones yet)
- ❌ Analytics dashboard
- ❌ Real-time feedback on intermediate steps (IF user confirmed yes to B.12.3)

### Learning System Activity
- Generates detailed pattern reports ("You rate Opus-Fast 4.7/5 for research but Haiku only 3.2/5. Should I stop suggesting Haiku for research?")
- User can adjust learning weights per pattern

---

## MILESTONE 5: AFTER 100 QUESTIONS

### Philosophy
**User is co-creator. Full system access.**

### New Features UNLOCKED
- ✅ **Account management:** Add own API keys, manually rotate accounts, see token tracking, manage account pool
- ✅ **Custom dialogue modes:** "Create custom mode" → define button labels, detection functions, max rounds, auto-stop logic
- ✅ **Analytics dashboard:** Comprehensive patterns, heatmaps (question type × model × rating), time-of-day analysis, effectiveness by technique
- ✅ **Real-time feedback on intermediate steps:** (IF clarification B.12.3 = YES)
  - Thumbs-down on routing card = "wrong model"
  - Thumbs-down on techniques = "bad selection"
  - This data feeds learning immediately
- ✅ **Dialogue templates:** Pre-built debate setups for common topics ("AI Safety," "Career vs. Family," "Technical vs. Product," etc.)
- ✅ **Advanced technique customization:** Edit technique stacks, reorder, adjust weights

### Still Hidden (Post-MVP v2.0+)
- ❌ Collaboration (share dialogue with others)
- ❌ Mobile app
- ❌ Browser extension
- ❌ Notion integration (auto-save)
- ❌ Advanced ML (predictive routing)

### Learning System Activity
- User can manually refine learning rules
- System generates weekly summaries
- User has full control over what system learns

---

## FEATURE SUMMARY TABLE

| Feature | M1 (0) | M2 (10) | M3 (25) | M4 (50) | M5 (100) |
|---------|--------|---------|---------|---------|----------|
| Basic translate/route/answer | ✅ | ✅ | ✅ | ✅ | ✅ |
| 5-star feedback | ✅ | ✅ | ✅ | ✅ | ✅ |
| Multi-AI Mode (basic) | ✅ | ✅ | ✅ | ✅ | ✅ |
| See techniques chosen | ❌ | ✅ | ✅ | ✅ | ✅ |
| Multi-AI custom goals | ❌ | ✅ | ✅ | ✅ | ✅ |
| History screen | ❌ | ✅ | ✅ | ✅ | ✅ |
| Retranslate with options | ❌ | ✅ | ✅ | ✅ | ✅ |
| Routing explanation | ❌ | ❌ | ✅ | ✅ | ✅ |
| Boundary question choice | ❌ | ❌ | ✅ | ✅ | ✅ |
| Templates | ❌ | ❌ | ✅ | ✅ | ✅ |
| Patterns tab | ❌ | ❌ | ✅ | ✅ | ✅ |
| Custom technique stacks | ❌ | ❌ | ❌ | ✅ | ✅ |
| Dialogue branching | ❌ | ❌ | ❌ | ✅ | ✅ |
| Focus Mode | ❌ | ❌ | ❌ | ✅ | ✅ |
| ADHD Mode customization | ❌ | ❌ | ❌ | ✅ | ✅ |
| Take-over mode (Multi-AI) | ❌ | ❌ | ❌ | ✅ | ✅ |
| Account management | ❌ | ❌ | ❌ | ❌ | ✅ |
| Custom dialogue modes | ❌ | ❌ | ❌ | ❌ | ✅ |
| Analytics dashboard | ❌ | ❌ | ❌ | ❌ | ✅ |
| Real-time intermediate feedback | ❌ | ❌ | ❌ | ❌ | ✅* |

*Only if user answers B.12.3 = YES

---

## IMPLEMENTATION NOTES

### Milestone Triggers
- Check after every question completion
- When question_count reaches threshold, show modal: "🎉 New features unlocked!"
- List 2-3 new features briefly
- "Explore Settings" button takes to new section

### Never Hide Again
- Once feature is unlocked, stays unlocked forever
- User can disable individual features in Settings (except core ones)
- No regression

### Notification Strategy
- Non-intrusive: modal appears, but can be dismissed
- No spam: only one notification per session
- Learning system learns which unlocks user actually uses (feeds analytics)

### Settings Impact
- M1: Only ADHD Mode toggle visible
- M2+: Advanced Settings tab appears (confidence thresholds, feedback style, etc.)
- M4+: Full customization available
- M5+: Power user section (edit learning rules, custom modes, etc.)

---

## WHY THIS STRUCTURE

**Day 1 user** is overwhelmed. Give them: ask question, get answer. Done.

**After 10 questions** user understands flow. Show them what's happening (techniques, multi-AI).

**After 25 questions** user is ready to see "why" (routing, templates, patterns).

**After 50 questions** user is power user. Give them customization (stacks, modes, focus).

**After 100 questions** user IS the system. Let them build it (custom modes, analytics, accounts).

---

**This structure prevents Day-1 overwhelm while scaling to unlimited customization.**
