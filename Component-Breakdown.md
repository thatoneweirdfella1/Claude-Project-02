# Component Breakdown
## Detailed UI Components & Structure

**Status: COMPLETE FOR PHASE 12 PLANNING**

---

## OVERVIEW

This document breaks down all UI components organized by section/screen. Each component includes:
- Purpose and placement
- Visual hierarchy
- States (default, active, disabled, loading, error)
- Interactions
- Responsive behavior
- Accessibility notes

---

## SECTION 1: ONBOARDING & AUTH

### 1.1 Login Screen
**Component:** `LoginForm`

**Structure:**
```
┌─────────────────────────────────┐
│     ADHD-to-AI Assistant        │
│     AI answers for ADHD brains  │
├─────────────────────────────────┤
│                                 │
│ Email                           │
│ [_____________________]         │
│                                 │
│ Password                        │
│ [_____________________]         │
│                                 │
│ [Sign In] [Create Account]      │
│                                 │
│ [Forgot password?]              │
└─────────────────────────────────┘
```

**States:**
- Default: Inputs empty, buttons enabled
- Loading: Spinner in button, inputs disabled
- Error: Red border on failed field, error message below
- Success: Redirects to Home

**Responsive:** Full width on mobile, centered on desktop (max 400px)

---

### 1.2 Signup Screen
**Component:** `SignupForm`

**Structure:** Similar to login, with additional fields:
- Name field
- Email confirmation
- Password confirmation
- Terms checkbox

**Validation:** Real-time feedback, password strength indicator

---

### 1.3 Onboarding Walkthrough
**Component:** `OnboardingWalkthrough`

**Structure:**
```
┌─────────────────────────────────────┐
│ 1 of 3: Getting Started             │
├─────────────────────────────────────┤
│                                     │
│ 📝 You ask a question in natural    │
│    language, and I help you get     │
│    the best answer.                 │
│                                     │
│ [Screenshot/animation here]         │
│                                     │
│ [← Back]  [Next →]  [Skip All]      │
└─────────────────────────────────────┘
```

**Screens:** 3 steps (Ask, Answer, History) with optional video tutorials

**Skip option:** Available on every step

---

## SECTION 2: HOME & QUESTION INPUT

### 2.1 Main Input Card
**Component:** `QuestionInputCard`

**Structure:**
```
┌─────────────────────────────────┐
│ 🔇 Quiet Mode [toggle]          │
│ ⚙️  Settings    📋 History      │
├─────────────────────────────────┤
│                                 │
│ What do you want help with?     │
│ [text area, expandable]         │
│                                 │
│ [+] Add context (file/text/url) │
│                                 │
│ [📤 Ask] [Clear]                │
│                                 │
│ Translations: 3 examples shown  │
│ (collapsible "Show more")       │
└─────────────────────────────────┘
```

**States:**
- Default: Placeholder text visible
- Focused: Border highlight, keyboard open
- Loading: Button shows spinner
- Error: Red border, error message
- Filled: Character count shown (1/5000)

**Responsive:** Mobile: full width with expandable textarea; Desktop: max 600px centered

---

### 2.2 Context Loader
**Component:** `ContextLoader`

**Structure:**
```
[+] Add Context
├─ Text Input (paste/type)
├─ File Upload (drag-and-drop)
│  └─ Supported: .txt, .pdf, .md, .csv
├─ URL Input (paste URL)
└─ Load from Past (dropdown list)
    └─ "meeting-notes" [X]
    └─ "budget-file" [X]
```

**Interactions:**
- Click [+]: Dropdown opens
- Drag file: Visual feedback (border highlight)
- After load: Shows as tag with [X] to remove
- Max 3 context items at once
- Visual indicator: "📎 3 context items loaded"

---

## SECTION 3: TRANSLATION STAGE

### 3.1 Translation Result Card
**Component:** `TranslationResultCard`

**Structure:**
```
┌─────────────────────────────────┐
│ STEP 1: TRANSLATION             │
├─────────────────────────────────┤
│                                 │
│ Your question:                  │
│ "What should I do about..."     │
│                                 │
│ Translated to:                  │
│ "I'm considering a job change   │
│  and feel anxious. What are     │
│  key decision factors?"         │
│                                 │
│ [Show Details] [Retranslate]    │
│ [Continue]                      │
└─────────────────────────────────┘
```

**Show Details Expansion:**
```
Gap categories detected:
✓ Emotional context ("anxious")
✓ Decision framework needed
✓ Scope clarification

Operations applied:
• Emotional normalization
• Question decomposition
• Context enrichment
```

**Retranslate Options:**
```
More aggressive decomposition?
- More decomposition [vs] Less decomposition
Emotional handling?
- More normalization [vs] Less normalization
Multiple questions handling?
- Route together [vs] Route separately
```

---

## SECTION 4: ROUTING STAGE

### 4.1 Routing Decision Card
**Component:** `RoutingDecisionCard`

**Structure:**
```
┌─────────────────────────────────┐
│ STEP 2: ROUTING                 │
├─────────────────────────────────┤
│                                 │
│ Recommended model:              │
│ 🤖 Claude 3.5 Opus (Fast)       │
│                                 │
│ Confidence: 87%                 │
│                                 │
│ [Explain Routing]               │
│ [Change Model]                  │
│ 👎 Wrong model                  │
│                                 │
│ [Continue]                      │
└─────────────────────────────────┘
```

**Explain Routing Expansion:**
```
This is a career decision question requiring:
- Broad perspective: Opus-Fast is well-trained
- Speed: Quick response preferred (you asked
  for help with immediate decision)
- Accuracy: 87% confidence (high, no guardrails
  needed)

Alternatively:
- Opus-Thinking (thorough) for deeper analysis
- Haiku (fast) if speed critical
```

**Thumbs-Down Interaction:**
```
👎 Noted. Which would be better?
☐ Claude 3.5 Opus (Thinking)
☐ Claude 3.5 Haiku
☐ Other (choose from list)
[Use Selected]
```

**Boundary Question (Haiku vs Opus-Fast):**
```
This question is borderline between fast and thorough.
Pick your preference:
[Haiku (Quick)]  [Opus-Fast (Thorough)]
Or let me decide? [Auto]
```

---

## SECTION 5: TECHNIQUE SELECTION STAGE

### 5.1 Technique Selection Card
**Component:** `TechniqueSelectionCard`

**Structure:**
```
┌─────────────────────────────────┐
│ STEP 3: TECHNIQUES (3 selected) │
├─────────────────────────────────┤
│ ✓ T03 - Socratic Prompting      │
│ ✓ T01 - System Role Definition  │
│ ✓ T04 - Outcome Specification   │
│                                 │
│ [Show Reasoning]                │
│ 👎 Bad Selection                │
│                                 │
│ [Favorite This Stack]           │
│ [Continue]                      │
└─────────────────────────────────┘
```

**Show Reasoning Expansion:**
```
Selected for: Career Decision
- T03 (Socratic): Explores assumptions
- T01 (System Role): Establishes counselor role
- T04 (Outcome): Clarifies desired outcome

Removed (conflict):
- T02 (was: "Removed T02 - conflicts with T04")

Model capacity check:
- Opus-Fast: 3 techniques recommended (your 3/9 max)
```

**Thumbs-Down Interaction:**
```
👎 Noted. Which techniques would work better?
- Select different techniques (picker opens)
- Let system auto-select alternatives
[Apply Change] [Keep Original]
```

**Favorite Stack:**
```
Save this stack?
Name: [My Career Stack____________]
Auto-apply to: [All] [Career questions only]
[Save Stack]
```

---

## SECTION 6: COMPOSITION & ANSWER STAGE

### 6.1 Preview Button
**Component:** `PreviewButton`

**Structure:**
```
┌─────────────────────────────────┐
│ STEP 4: ANSWER                  │
│                                 │
│ Your question is ready.         │
│ [Fast Preview]                  │
│ (See 50-word opening first)     │
├─────────────────────────────────┤
│                                 │
│ Here's a possible opening...    │
│ [word word word...]             │
│                                 │
│ [Get Full Answer]               │
│ [Edit & Retry]                  │
│ [⌫ Back]                        │
└─────────────────────────────────┘
```

**Interactions:**
- Click "Get Full Answer": Full streaming response
- Click "Edit & Retry": Show prompt editor (if transparency enabled)
- Click "⌫ Back": Return to composition options

---

### 6.2 Answer Display Card
**Component:** `AnswerDisplayCard`

**Structure:**
```
┌─────────────────────────────────┐
│ 🤖 Claude (Opus-Fast)           │
├─────────────────────────────────┤
│ [Full answer text here, fully  │
│  scrollable, no truncation]     │
│                                 │
│ ... (continues for 500+ words)  │
│                                 │
│ [Copy]  [Regen]  [Reroute]      │
│                                 │
│ [Details] (metadata, tokens)    │
└─────────────────────────────────┘
```

**Metadata Details (Collapsed by default):**
```
Model: Claude 3.5 Opus (Fast)
Tokens used: 1,250
Latency: 2.3 seconds
Confidence: 0.92
Max tokens: 4,000
Stop reason: end_turn
```

**Buttons:**
- Copy: Markdown format (default), option for plaintext/HTML
- Regen: Same model, same prompt, new response
- Reroute: Different model, same prompt (shows dialog)

---

### 6.3 Feedback Section (After Answer)
**Component:** `AnswerFeedbackCard`

**Structure:**
```
┌─────────────────────────────────┐
│ How helpful was this answer?    │
│                                 │
│ ⭐ ⭐ ⭐ ⭐ ⭐                    │
│ (5 stars - click to rate)       │
│                                 │
│ Comment (optional)              │
│ [text box]                      │
│                                 │
│ More details? [✓] Expand        │
│                                 │
│ [Submit] [Skip]                 │
└─────────────────────────────────┘
```

**Expanded Details:**
```
What could have been better?
☐ Too long
☐ Wrong model
☐ Missing detail
☐ Hallucination
☐ Format issue
```

**Quiet Mode:** This card completely hidden if Quiet Mode ON, but 5-star rating still works in background

---

## SECTION 7: MULTI-AI DIALOGUE

### 7.1 Dialogue Goal Picker
**Component:** `DialogueGoalPicker`

**Structure:**
```
┌─────────────────────────────────┐
│ Want to explore more?           │
│ Start a Multi-AI Dialogue       │
│                                 │
│ Pick your goal:                 │
│ [Solid Answer] [Understand]     │
│ [Improve Idea] [Decision]       │
│ [Debate]                        │
│                                 │
│ [Show All Modes]                │
└─────────────────────────────────┘
```

**After Goal Selection:**
```
├─ How deep?
│  [Surface] [Medium] [Deep]
│
└─ Your position? (if applicable)
   [For] [Against] [Undecided]
```

**Recommendation:**
```
Recommended Mode: Devil's Advocate
(Critique & Refine)

Alternative: Synthesis
(Combine perspectives)

[Use Recommended] [Show All] [Choose Different]
```

---

### 7.2 Dialogue Display Container
**Component:** `DialogueContainer`

**Structure:**
```
┌──────────────────────────────────────┐
│ GOAL: Improve idea                   │
│ MODE: Devil's Advocate               │
│ [×] Close Dialogue                   │
├──────────────────────────────────────┤
│                                      │
│ Your Idea:                           │
│ ┌──────────────────────────────────┐ │
│ │ "Launch new feature next quarter │ │
│ │  based on early user testing"    │ │
│ └──────────────────────────────────┘ │
│                                      │
├──────────────────────────────────────┤
│ ROUND 1                              │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Model A (Claude A) - PROPOSER    │ │
│ ├──────────────────────────────────┤ │
│ │ Your proposal is good, but let   │ │
│ │ me highlight considerations:     │ │
│ │ ...                              │ │
│ │ [Copy]  [Regenerate]             │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Model B (GPT A) - CRITIC         │ │
│ ├──────────────────────────────────┤ │
│ │ I'd strengthen that critique.    │ │
│ │ The proposal assumes:            │ │
│ │ ...                              │ │
│ │ [Copy]  [Regenerate]             │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Quality Score: 82%                   │
│ [✅ Accept] [🔄 Continue] [⏸ Pause] │
│ [❌ Stop]                            │
│                                      │
├──────────────────────────────────────┤
│ ROUND 2                              │
│ ... (continues)                      │
│                                      │
└──────────────────────────────────────┘
```

**Account Swap Notification (Banner):**
```
🔄 Claude A tokens depleted. Claude B continuing.
[Dismiss]
```

**Account Swap Notation (Inline):**
```
← Claude B joins (Claude A tokens depleted)
```

---

### 7.3 Dialogue Turn Cards
**Component:** `DialogueTurnCard`

**Structure Per Response:**
```
┌──────────────────────────────────┐
│ Model A (Claude A)  ⚙️ Label      │
├──────────────────────────────────┤
│ [Full response text, scrollable] │
│ [No truncation, full text]       │
│                                  │
│ [Copy]     [Regenerate]          │
└──────────────────────────────────┘
```

**Colors:**
- Model A: One color scheme (e.g., blue tint)
- Model B: Different scheme (e.g., amber tint)
- Swap notation: Highlight color (not jarring)

---

### 7.4 Dialogue Buttons (Context-Aware)
**Component:** `DialogueActionButtons`

**Structure:**
```
┌──────────────────────────────────┐
│ Quality: 82%                     │
│                                  │
│ [✅ Accept]  [🔄 Continue]       │
│ [⏸ Pause]   [❌ Stop]            │
└──────────────────────────────────┘
```

**Button Meanings by Mode:**

| Mode | Accept | Continue |
|------|--------|----------|
| Consensus | "We agree" | "Counter that" |
| Adversarial | "Good point" | "Attack again" |
| Socratic | "I understand" | "Ask more" |
| Devil's Advocate | "Idea is good" | "Refine more" |
| Synthesis | "Accept view" | "Try different" |

---

### 7.5 Dialogue Completion Card
**Component:** `DialogueCompletionCard`

**Structure:**
```
┌──────────────────────────────────┐
│ ✅ DIALOGUE COMPLETE             │
│                                  │
│ Mode: Devil's Advocate           │
│ Rounds: 2                        │
│ Stop Reason: Proposal refined    │
│                                  │
│ [📋 Summary]  [⤴️ Export]         │
│ [💾 Save]                        │
│                                  │
│ Rating this dialogue:            │
│ ⭐ ⭐ ⭐ ⭐ ⭐                    │
│                                  │
│ What did it do well?             │
│ ☐ Found weakness                │
│ ☐ Improved my idea               │
│ ☐ Explored thoroughly            │
│ ☐ Clear reasoning                │
│ ☐ Other                          │
│                                  │
│ Comment:                         │
│ [Phased rollout was key insight] │
│                                  │
│ [Submit] [Skip]                  │
└──────────────────────────────────┘
```

---

## SECTION 8: HISTORY & DISCOVERY

### 8.1 History List Screen
**Component:** `HistoryListScreen`

**Structure:**
```
┌──────────────────────────────────┐
│ 📋 HISTORY                       │
│                                  │
│ [Search: ___________]            │
│                                  │
│ Filters:                         │
│ [Model▼] [Rating▼] [Date▼]      │
│ [Type▼]  [Tags▼]                │
│                                  │
│ Sort: [Recency▼]                 │
│                                  │
├──────────────────────────────────┤
│                                  │
│ Q: What should I do about...     │
│ Model: Opus-Fast | ⭐⭐⭐⭐ (4)    │
│ Date: Jun 22, 2:30 PM           │
│ Tags: [career] [important]       │
│ [View] [Rerate] [Delete]         │
│                                  │
│ D: Multi-AI Dialogue             │
│ Goal: Improve Idea | Mode: Devil │
│ Models: Claude, GPT              │
│ Rating: 5 stars | 2 rounds       │
│ Tags: [product] [refined]        │
│ [View Full] [Export] [Delete]    │
│                                  │
│ [← Previous]  [Next →]           │
└──────────────────────────────────┘
```

**Filters:**
- Model: Claude, GPT, Perplexity, etc.
- Rating: 1-5 stars
- Date: Last week, Last month, Custom range
- Question Type: Inferred categories
- Tags: User-created or system-generated

**Sort:** Recency, Rating, Usefulness (engagement metric)

---

### 8.2 Patterns Tab
**Component:** `PatternsTab`

**Structure:**
```
┌──────────────────────────────────┐
│ 🧠 PATTERNS                      │
│                                  │
│ Detected learning patterns:      │
│                                  │
│ ✓ Model Performance              │
│   "Opus-Fast consistently rated  │
│    higher for research (85%)"    │
│   Confidence: 85%                │
│   [Apply] [Dismiss]              │
│                                  │
│ ✓ Technique Effectiveness        │
│   "T03 + T16 conflict for        │
│    product research (70%)"       │
│   Confidence: 70%                │
│   [Apply] [Dismiss]              │
│                                  │
│ ✓ Mode Preference                │
│   "You prefer Socratic for       │
│    learning new skills"          │
│   Confidence: 80%                │
│   [Apply] [Dismiss]              │
│                                  │
│ 📊 [Quarterly Summary]           │
│    (Q2 2026 report)              │
└──────────────────────────────────┘
```

**Quarterly Summary Card:**
```
Q2 2026: Summary of Patterns
You've asked 127 questions this quarter.
Key insights:
• You prefer Opus-Fast (80% rating)
• Career questions most common (35%)
• Socratic mode most effective (4.2/5 avg)
• Technique stack "Research Stack" reused 12x
```

---

### 8.3 Similar Questions Feature
**Component:** `SimilarQuestionsCard`

**Structure:**
```
You've asked about "career changes" 7 times.
View them together?
[Show All Career Questions]

Or:
You asked this before (Jun 15):
"How do I change careers in tech?"
Rating: 4 stars
[View Comparison]
```

---

## SECTION 9: SETTINGS & PREFERENCES

### 9.1 Settings Panel
**Component:** `SettingsPanel`

**Structure:**
```
┌──────────────────────────────────┐
│ ⚙️  SETTINGS                     │
│                                  │
│ [Tabs: Basics | Advanced | Help] │
│                                  │
│ BASICS:                          │
│                                  │
│ Default Model                    │
│ [Opus-Fast▼]                     │
│ (What to use when not routed)    │
│                                  │
│ Transparency Level               │
│ Minimal [○] Normal [●] Full      │
│ (How much metadata to show)      │
│                                  │
│ Quiet Mode                       │
│ [Toggle OFF/ON]                  │
│ (Hide all optional prompts)      │
│                                  │
│ ADHD Mode Preset                 │
│ [Toggle OFF/ON]                  │
│ └─ High Contrast [Toggle]        │
│ └─ Reduce Animations [Toggle]    │
│ └─ Plain Language [Toggle]       │
│ └─ Large Text [Toggle]           │
│                                  │
│ Output Format Default            │
│ [Prose▼]                         │
│ (For all new answers)            │
│                                  │
│ Feedback Style                   │
│ Explicit [○] Inferred [●]        │
│ (Structured vs open comment)     │
│                                  │
│ [ADVANCED TAB]                   │
│ └─ Technique Limits (per model)  │
│ └─ Emotional Normalization       │
│ └─ Auto-apply patterns           │
│ └─ Export default format         │
│                                  │
│ [SAVE] [RESET] [Export Settings] │
└──────────────────────────────────┘
```

---

### 9.2 Presets
**Component:** `PresetSelector`

**Structure:**
```
Preset Configurations:

[Power User]
Full visibility into all decisions
- Transparency: Full
- Buttons: All shown
- Learning: Explicit alerts
[Apply Preset]

[Simple]
Minimal options, just answers
- Transparency: Minimal
- Buttons: Core only
- Learning: Silent
[Apply Preset]

[ADHD-Optimized]
High contrast, plain language, fewer distractions
- High Contrast: ON
- Reduce Animations: ON
- Plain Language: ON
- Large Text: ON
[Apply Preset]
```

---

### 9.3 Feature Unlock Status
**Component:** `MilestoneProgress`

**Structure:**
```
┌──────────────────────────────────┐
│ 🎯 FEATURE UNLOCK PROGRESS       │
│                                  │
│ ✅ M1: Day 1 (UNLOCKED Jun 1)    │
│    Basic mode, 5-star feedback   │
│                                  │
│ ✅ M2: 10 Questions (Jun 5)      │
│    Technique visibility, history │
│                                  │
│ ✅ M3: 25 Questions (Jun 15)     │
│    Advanced routing, templates   │
│                                  │
│ ⏳ M4: 50 Questions (23/50)      │
│    Dialogue branching, focus mode│
│    27 more questions until unlock│
│                                  │
│ ⏳ M5: 100 Questions (23/100)    │
│    Account management, analytics │
│    77 more questions until unlock│
│                                  │
│ [Progress visualization bar]    │
└──────────────────────────────────┘
```

---

## SECTION 10: ACCOUNT MANAGEMENT (M5+)

### 10.1 Account Rotation Status
**Component:** `AccountRotationCard`

**Structure:**
```
┌──────────────────────────────────┐
│ 🔐 ACCOUNT & TOKEN STATUS        │
│                                  │
│ Current Account:                 │
│ Claude A (Anthropic) - ACTIVE   │
│                                  │
│ This Session:                    │
│ 2,340 tokens used (of 5,000)    │
│ [████████░░] (47%)               │
│                                  │
│ All Accounts:                    │
│ ├─ Claude A: 2,660 remaining     │
│ │  Status: Active, Warning ⚠️    │
│ │  [Will swap in ~20 min]        │
│ ├─ Claude B: 8,000 remaining     │
│ │  Status: Ready                 │
│ ├─ GPT A: 150,000 remaining      │
│ │  Status: Ready                 │
│ └─ Perplexity A: 100,000         │
│    Status: Ready                 │
│                                  │
│ [Manual Rotation] [Add Account]  │
│ [View Usage History]             │
└──────────────────────────────────┘
```

---

### 10.2 Manual Account Rotation
**Component:** `ManualRotationDialog`

**Structure:**
```
┌──────────────────────────────────┐
│ Switch to Different Account?     │
│                                  │
│ Current: Claude A (2,660 tokens) │
│                                  │
│ Choose next account:             │
│ ☐ Claude B (8,000 tokens)       │
│ ☐ GPT A (150,000 tokens)        │
│ ☐ Perplexity A (100,000 tokens) │
│                                  │
│ Note: Current dialogue will      │
│ transfer context automatically   │
│                                  │
│ [Rotate Now]  [Cancel]          │
└──────────────────────────────────┘
```

---

## SECTION 11: GLOBAL COMPONENTS

### 11.1 Top Navigation Bar
**Component:** `TopNavBar`

**Structure:**
```
┌──────────────────────────────────────────┐
│ ADHD-to-AI  🔇 Quiet  ⚙️ Settings  📋 History  👤 Account│
│ (Logo)      (toggle)   (link)      (link)     (menu)   │
└──────────────────────────────────────────┘
```

**Sticky:** Remains visible while scrolling

**Responsive:** Collapses to hamburger menu on mobile

---

### 11.2 Footer
**Component:** `Footer`

**Structure:**
```
┌──────────────────────────────────┐
│ © 2026 ADHD-to-AI                │
│                                  │
│ [Docs] [Privacy] [Terms]         │
│ [Support] [Feedback]             │
│                                  │
│ Status: All systems operational  │
└──────────────────────────────────┘
```

---

### 11.3 Toast Notifications
**Component:** `ToastNotification`

**Placement:** Bottom-right (mobile: bottom-center)

**Types & Colors:**
- Success (green): "Saved to history"
- Error (red): "Could not reach Claude"
- Warning (amber): "Claude A tokens running low"
- Info (blue): "New feature unlocked!"

**Duration:** 4-6 seconds, dismiss button [×]

**Example:**
```
✓ Answer copied to clipboard [×]
```

---

### 11.4 Loading States
**Component:** `LoadingIndicator`

**Types:**
- Spinner: Default loading state
- Progress bar: For long operations (>3 seconds)
- Skeleton: Pre-load layout while fetching

**Text:** "Claude is thinking..." (variable by context)

---

### 11.5 Error Boundary
**Component:** `ErrorBoundary`

**Structure:**
```
┌──────────────────────────────────┐
│ ⚠️  Something went wrong         │
│                                  │
│ We encountered an error.         │
│ Error: [error_code]              │
│                                  │
│ Try:                             │
│ [Retry]  [Go Home]  [Contact]   │
│                                  │
│ Request ID: req_abc123           │
│ (for support)                    │
└──────────────────────────────────┘
```

---

### 11.6 Modal Dialogs
**Component:** `Modal`

**Base Structure:**
```
┌──────────────────────────────────┐
│ Dialog Title            [×] Close │
├──────────────────────────────────┤
│ Content here                     │
│                                  │
│ [Action Button] [Cancel]         │
└──────────────────────────────────┘
```

**Backdrop:** Dim overlay, clicking outside doesn't close (button required)

---

## SECTION 12: RESPONSIVE BREAKPOINTS

### Mobile (< 768px)
- Single column layout
- Full-width cards
- Bottom sheet for dialogues (swiping)
- Hamburger navigation menu
- Larger touch targets (44px minimum)

### Tablet (768px - 1024px)
- Two-column layout where applicable
- Narrower cards (max 600px)
- Sidebar navigation
- Medium-sized buttons

### Desktop (> 1024px)
- Three-column layout possible
- Max-width containers (800-1000px)
- Full navigation bar
- Full-size buttons and hover states

---

## SECTION 13: ACCESSIBILITY

### WCAG 2.1 Compliance (Level AA)

**Color Contrast:**
- Text: 4.5:1 ratio minimum
- UI components: 3:1 ratio minimum
- High Contrast Mode: 7:1 ratio

**Focus Indicators:**
- Visible outline on keyboard focus
- Minimum 2px border
- Contrasting color (not just color)

**Keyboard Navigation:**
- Tab order logical (top-to-bottom, left-to-right)
- Escape to close modals
- Enter to submit forms
- Arrow keys in lists/dropdowns

**Screen Readers:**
- ARIA labels on all interactive elements
- Form field labels associated
- Alt text on images
- Semantic HTML (nav, main, aside, etc.)

**Motion:**
- No auto-playing animations
- Respect `prefers-reduced-motion`
- Animation duration: 200-400ms max

---

## SECTION 14: DARK MODE SUPPORT

**Implementation:** CSS custom properties + prefers-color-scheme media query

**Color Scheme:**
- Light: Marble Material System white/gray/accent
- Dark: Inverted with sufficient contrast

**Storage:** User preference in localStorage, system default if not set

---

## SECTION 15: ANIMATION SPECS

### Transitions (200ms default)
- Button hover state
- Card transitions
- Dropdown open/close
- Dialog appear/disappear

### Animations (with ADHD mode reduction)
- Loading spinner: 1s rotation
- Toast slide-in: 300ms
- Feature unlock modal: Expand 400ms
- Milestone progress bar: 600ms slide

**ADHD Mode:** All animations reduced to 50% speed or disabled

---

**Status: COMPLETE**

**Next task: Phase 12 Implementation Checklist**
