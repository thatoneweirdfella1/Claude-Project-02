# Divergence.AI — Claude Code Layout + Divergence Style

## Vision
**Claude Code's powerful layout structure** (sidebar nav, top breadcrumb, main workspace, action bars) **with Divergence.AI's visual identity** (marble background, Orbitron/Inter fonts, purple/blue theme, brain logo). Everything integrated, nothing hidden.

---

## Visual Style (From Current Design)

**Colors:**
- Primary accent: `#9b5cff` (purple)
- Secondary accent: `#4a9eff` (blue)
- Background: `#0d0f14` (dark, with marble texture)
- Text: `#e8eaed` (light gray)
- Dimmed text: `#8a9099` (dark gray)
- Card background: `#161921` (slightly lighter)
- Border: `#272b3a` (subtle divider)
- Green (success): `#2dd36f`
- Amber (warning): `#f5a623`
- Red (error): `#ff5c5c`

**Typography:**
- Headlines: `Orbitron`, 600-900 weight, letter-spaced
- Body: `Inter`, 400-600 weight, 16px base
- Mono (code): `Courier New`, 14px

**Background:**
- Dark marble texture (organic veining, stone-like)
- Applies to main container
- Cards have semi-transparent overlay for contrast

**Icons:**
- Feather-style (consistent with Claude Code)
- 20-24px base size
- Current Divergence icons preserved (⚡🧠🎯👥🗳⚛️)

**Logo/Branding:**
- Brain icon with lightning bolt (⚡ + 🧠)
- "Divergence.AI" header with purple ".AI" suffix
- Tagline: "Type how you actually think. Get back an answer with no flattery, no flow-breaking, no overwhelm."

---

## Full Layout Structure

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ File  Edit  View                              🔔    [⚙ Settings] [⋯ Menu] × │  CLAUDE CODE TOP (System bar)
├──────────────────────────────────────────────────────────────────────────────┤
│ 🧠 Divergence.AI   ⚡ New session    Divergence  •  quirky-rubin-s6rckq    │  BREADCRUMB/TABS (like Claude Code)
├──────────────────────────────────────────────────────────────────────────────┤
│ SIDEBAR          │ MAIN CONTENT AREA                                         │
│                  │                                                           │
│ 🧠 Divergence.AI │ ⚡ Divergence.AI [brain logo]                            │
│                  │ Type how you actually think.                             │
│ ⚡ New session   │                                                           │
│ 📋 Dashboard     │ ┌────────────────────────────────────────────────────┐  │
│                  │ │ ANTHROPIC API KEY                                  │  │
│ 💬 Messages      │ │ [sk-ant-...]                                       │  │
│ 🗄 Archive       │ └────────────────────────────────────────────────────┘  │
│ 🔗 Resources     │                                                           │
│ 💼 Projects      │ ┌────────────────────────────────────────────────────┐  │
│ ☑ Tasks          │ │ WHAT'S ON YOUR MIND? (RAMBLE FREELY)              │  │
│ ? Help           │ │ [Large textarea for input]                         │  │
│ 👤 Profile       │ │                                                    │  │
│ ⚙ Settings       │ └────────────────────────────────────────────────────┘  │
│                  │                                                           │
│ Recents:         │ MODEL           DIRECTNESS          [← More ▼]          │
│ • Session 1      │ [Opus 4.8 ▼]   [High ▼]            [💭 Memory stats]   │
│ • Session 2      │                                                           │
│ • Session 3      │ ┌────────────────────────────────────────────────────┐  │
│                  │ │ CONVERSATION THREAD                                │  │
│                  │ │ (scrollable, messages flow here)                   │  │
│                  │ │                                                    │  │
│                  │ │ [Your Q]  [AI Answer]  [Your Q]  [AI Answer]     │  │
│                  │ │                                                    │  │
│                  │ └────────────────────────────────────────────────────┘  │
│                  │                                                           │
│                  │ [Input box]                                              │
│                  │                                                           │
│                  │ ⚡ Translate  👥 Debate  🗳 Consensus  ⚛ Synthesis    │  │
│                  │ [⚙ Details ▼]  [+ Actions ▼]   [💾 Save] [⬇ Export]   │
│                  │                                                           │
└──────────────────┴───────────────────────────────────────────────────────────┘
│ [Approaching weekly usage limit]  [Upgrade]   |  Haiku 4.5  [Dark/Light] ⟳ │  BOTTOM BAR (Claude Code style)
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### LEFT SIDEBAR (Claude Code style, ~180px fixed)

**Structure:**
- Divergence.AI logo + "⚡" at top
- New session button
- Nav items (stacked, vertical)
- Recents section at bottom
- Fixed width, scrolls if needed

**Nav Items:**
```
⚡ New session        (onclick: newConversation(); showPanel('translate'))
📋 Dashboard          (show stats)
─────────────────────
💬 Messages           (search current thread)
🗄 Archive            (saved conversations)
🔗 Resources          (pinned links)
💼 Projects           (named groups)
☑ Tasks               (to-do list)
─────────────────────
? Help                (glossary)
👤 Profile            (display name, avatar)
⚙ Settings            (API key, theme, etc.)
```

**Styling:**
- Background: `#0d0f14` (dark, matches main)
- Item hover: `rgba(255,255,255,.12)` (subtle highlight)
- Active item: `#4a9eff` text + `rgba(74,158,255,.18)` bg
- Icons: 20px, feather-style
- Font: Inter, 14px

---

### TOP BREADCRUMB / TABS

**Left side:**
```
🧠 Divergence.AI  ⚡ New session  │  Divergence  •  quirky-rubin-s6rckq
```
- Logo + name (clickable → home)
- Active session indicator
- Branch/version info

**Right side (top-right corner buttons):**
```
🔔  [⚙ Settings]  [⋯ Menu]  [−]  [□]  [×]
```
- Bell icon: notifications (if any)
- Gear: quick settings (theme, font size, accent color)
- Three dots: more options (share, export, archive, etc.)
- Window controls (minimize, maximize, close)

---

### MAIN CONTENT AREA

**Header section:**
```
⚡ Divergence.AI  [brain logo, animated/subtle glow]
Type how you actually think. Get back an answer with no flattery, 
no flow-breaking, no overwhelm.
```
- Large, centered title
- Logo on left or above
- Tagline below (dimmed)

**API Key card:**
```
┌─────────────────────────────────────┐
│ ANTHROPIC API KEY (text: #8a9099)   │
│ (stored only in this browser...)    │
│ [sk-ant-...] (password input)       │
│ Get one free at console.anthropic.  │
└─────────────────────────────────────┘
```
- Card background: `#161921`
- Border: `#272b3a`, 1px
- Border-radius: 10px
- Padding: 16px

**Input section:**
```
┌─────────────────────────────────────┐
│ WHAT'S ON YOUR MIND? (RAMBLE FREELY)│
│ [Large textarea, 120px min height]  │
└─────────────────────────────────────┘

MODEL              DIRECTNESS       [← More ▼]
[Opus 4.8 ▼]      [High ▼]         [💭 5 convs learned | 🎯 6 skills | 😌 calm]
```

**[← More ▼] dropdown (inline, appears on hover/click):**
```
├─ Directness: [Max] [High] [Off] (radio buttons)
├─ Model: [Haiku] [Sonnet] [Opus] (radio buttons)
├─ Feedback tally: 👍 12  👎 3
└─ Multi-AI: [Toggle] On/Off
```

**Conversation thread (main scrollable area):**
```
┌─────────────────────────────────────┐
│ CONVERSATION THREAD                 │
│ (large, prominent)                  │
│                                     │
│ [Your message bubble]               │
│ ↓                                   │
│ [AI answer bubble]                  │
│ ↓                                   │
│ [Your message bubble]               │
│                                     │
│ (auto-scroll to latest)             │
└─────────────────────────────────────┘
```

**Below conversation (action bar 1):**
```
⚡ Translate →   👥 Debate   🗳 Consensus   ⚛ Synthesis   [⚙ Details ▼]
```
- Buttons: 120px wide, 44px tall
- Color: `#4a9eff` (blue accent)
- Text: Inter, 14px, bold, white
- Hover: slightly darker/lighter shade
- Spacing: 8px gap between buttons
- Icon + label

**Below that (action bar 2):**
```
[+ Actions ▼]   [💾 Save]   [⬇ Export]   [🔄 New]
```
- Secondary button style (background: `#161921`, border: `#272b3a`)
- Smaller, 36px tall
- Grouped at left

---

### DROPDOWNS / MENUS

**[⚙ Details ▼] expands to show:**
```
┌────────────────────────────────────┐
│ Route / Model (which model, why)   │
├────────────────────────────────────┤
│ Techniques (active ADHD engines)   │
├────────────────────────────────────┤
│ Transparency (system prompt, etc)  │
├────────────────────────────────────┤
│ Confidence (grounded/inferred map) │
└────────────────────────────────────┘
```
- Slides open below button
- Cards stacked vertically
- Background: slight transparency/blur

**[+ Actions ▼] menu:**
```
📋 Copy last answer
☑ Make task
🔗 Save as resource
📥 Archive conversation
⬇ Export (Markdown/JSON/Text)
📝 New conversation
```
- Dropdown, not inline
- Icon + label
- Hover highlight

**[⋯ Menu] (top-right):**
```
⚙ Settings
📤 Share
💾 Archive
🔄 New session
? Help
```

---

### BOTTOM STATUS BAR (Claude Code style)

```
[⏳ Approaching weekly usage limit]  [Upgrade]  │  Haiku 4.5  [🌙/☀]  🔃
```
- Left: status messages (usage, warnings)
- Center: model indicator
- Right: theme toggle, refresh

---

## Color Application Map

```
Backgrounds:
- Main container: #0d0f14 (dark marble)
- Cards: #161921 (slightly lighter)
- Hover state: rgba(255,255,255,.07)
- Active: rgba(74,158,255,.18) (blue tint)

Text:
- Primary: #e8eaed (light)
- Secondary: #8a9099 (dimmed)
- Labels: #c2c8d0 (medium gray)
- Links: #4a9eff (blue)

Accents:
- Primary action: #4a9eff (blue)
- Highlight: #9b5cff (purple)
- Success: #2dd36f (green)
- Warning: #f5a623 (amber)
- Error: #ff5c5c (red)

Borders/Dividers:
- Subtle: #272b3a
- Strong: #3a3f52
```

---

## Spacing / Grid

```
Base unit: 8px

Padding:
- Cards: 16px
- Buttons: 12px vertical, 16px horizontal
- Input box: 12px
- Sidebar items: 5px vertical, 6px horizontal

Margins:
- Between sections: 12px
- Between rows: 8px
- Gap (flex): 8px

Border radius:
- Cards: 10px
- Buttons: 9px
- Icons: 8px
- Input: 9px

Font sizes:
- Title: Orbitron, 32px, 900 weight
- Subtitle: Orbitron, 20px, 600 weight
- Label: Inter, 13px, 600 weight, uppercase, letter-space 0.5px
- Body: Inter, 14-16px, 400-500 weight
- Meta: Inter, 12px, 400 weight, dimmed color
- Mono: 13px, Courier New
```

---

## Responsive Behavior

**Desktop (> 1200px):**
- Sidebar fixed left (180px)
- Main area full width minus sidebar
- All buttons visible
- Conversation takes up 60-70% of space

**Tablet (900px - 1200px):**
- Sidebar collapses to icon bar (60px)
- Nav labels hidden (icons only)
- Main area expands
- Action buttons stack vertically if needed

**Mobile (< 900px):**
- Sidebar becomes hamburger drawer
- Main area full width
- Input box takes up more space
- Action buttons wrap to 2 rows
- Fonts slightly smaller

---

## Interaction States

**Buttons:**
- Default: solid color, sharp edges
- Hover: 10-15% lighter shade, subtle shadow
- Active: full opacity, darker shade, small glow
- Disabled: 50% opacity, cursor not-allowed

**Input:**
- Unfocused: border `#272b3a`, background `#0d0f14`
- Focused: border `#4a9eff`, shadow `0 0 8px rgba(74,158,255,.2)`
- Error: border `#ff5c5c`, shadow red tint

**Conversation thread:**
- User bubble: background `rgba(74,158,255,.15)`, text left-aligned
- AI bubble: background `rgba(155,92,255,.12)`, text left-aligned
- Hover: slight background highlight

---

## What Goes Where

**Sidebar (persistent, always accessible):**
- Navigation to secondary features
- Dashboard, Messages, Archive, Resources, Projects, Tasks, Help, Profile, Settings

**Main area (primary workspace):**
- Large conversation thread (centerpiece)
- Input box with model/directness controls
- Action buttons for Translate, Debate, Consensus, Synthesis
- Details dropdown (Route, Techniques, Transparency, Confidence)
- Actions dropdown (Copy, Task, Resource, Archive, Export, New)

**Top breadcrumb:**
- Session info, branch indicator
- Quick access to current workspace

**Top-right corner:**
- Quick settings (theme, font size)
- Three-dot menu (more options)
- Notifications (if any)

**Bottom bar:**
- Status messages
- Model indicator
- Theme toggle

---

## Implementation Priority

1. **Phase 1 (structure):** Layout grid, sidebar, main area, breadcrumb
2. **Phase 2 (styling):** Colors, fonts, marble background, cards
3. **Phase 3 (components):** Buttons, inputs, dropdowns, conversation thread
4. **Phase 4 (interactions):** Hover states, animations, responsive behavior
5. **Phase 5 (features):** Wire up all buttons to their functions

---

## Testing Checklist

- [ ] Marble background loads and tiles properly
- [ ] Sidebar navigation works, items highlight correctly
- [ ] Main area conversation flows naturally
- [ ] Action buttons (Translate, Debate, etc.) positioned correctly and styled
- [ ] Dropdowns open/close smoothly
- [ ] Colors match from design (purple/blue accents, dark theme)
- [ ] Typography is Orbitron (headers) + Inter (body)
- [ ] Responsive: sidebar collapses on tablet, drawer on mobile
- [ ] All Claude Code-style elements present (breadcrumb, top-right buttons, bottom bar)
- [ ] Marble background visible behind all content (semi-transparent cards)

---

## Top Right Buttons (3-4 strategic buttons)

| Button | Icon | Action | Tooltip |
|--------|------|--------|---------|
| API Key | 📝 | Show/hide API key input | "Paste your Anthropic key" |
| Settings | ⚙️ | Theme, font, accent color, customize | "Tune colors, fonts, preferences" |
| Theme | 🌙 | Toggle dark/light | "Dark ↔ Light" |
| Share | 📤 | (future) | "Export & share this convo" |

---

## Above Input Box (Quick Stats + Expandable Menu)

**Always visible (inline):**
```
💭 Memory: 5 convs learned  │  🎯 Skills: 6 active  │  😌 State: calm  │  [← More ▼]
```

**[← More ▼] dropdown shows:**
- Directness preference (Max/High/Off selector)
- Current model (Haiku/Sonnet/Opus selector)
- Feedback stats (👍/👎 tally)
- Quick toggle: Multi-AI On/Off

---

## Below Input Box (Action Buttons)

**Always visible (left to right):**
```
⚡ Translate →   👥 Debate   🗳 Consensus   ⚛ Synthesis   [⚙ Details ▼]   [+ Actions ▼]
```

### Primary buttons (always shown):
- **⚡ Translate →** — sends current input + full conversation to Claude, streams answer into thread
- **👥 Debate** — "Should I X?" → two AI perspectives argue this exact question from context
- **🗳 Consensus** — same question to Haiku/Sonnet/Opus, compare answers
- **⚛ Synthesis** — distill entire conversation into conclusions/decisions/open Qs
- **[⚙ Details ▼]** — collapsible dropdown:
  - Route/Model (which model, why)
  - Techniques (which ADHD engines active)
  - Transparency (system prompt, tokens, stages)
  - Confidence (grounded/inferred/speculative map)

### Secondary buttons:
- **[+ Actions ▼]** dropdown menu:
  - 📋 Copy last answer
  - ☑ Make task from last answer
  - 🔗 Save as resource
  - 📥 Archive this conversation
  - ⬇ Export (Markdown/JSON/Plain text)
  - 📝 New conversation

---

## Workflow Examples

### Example 1: Stuck Question → Multi-AI Resolution
```
1. Type your stuck question in the input box
2. Click ⚡ Translate → answer appears in thread
3. Still not satisfied? Click 👥 Debate (right there, no nav)
   → Two AI arguments appear in thread, still in same view
4. Or click 🗳 Consensus (same spot)
   → All 3 models' takes appear inline
5. Ready to wrap? Click ⚛ Synthesis
   → Distilled summary shows in thread
6. Click [+ Actions ▼] → Export the whole thing
```

**Key:** Never leave the main view. Everything flows.

---

### Example 2: Need Memory/Skills Context
```
1. Mid-conversation, hover [← More ▼] above input
2. See: "Memory: learned you get overwhelmed with choice overload"
3. See: "Skills: 6 active (Summarize matched last Q)"
4. Adjust "Directness" slider if needed, right there
5. Type next question with updated context
```

---

## Sidebar (Minimal, Secondary)

Only navigation to:
- **💬 Messages** — search/filter current thread
- **🗄 Archive** — list of past conversations
- **🔗 Resources** — pinned links/notes
- **💼 Projects** — named project groups
- **☑ Tasks** — to-do list
- **🕐 History** — all archived convos
- **? Help** — glossary/definitions
- **👤 Profile** — display name, avatar
- **⚙ Settings** — API key (also in top-right), locale, advanced

**NOT in sidebar anymore** (moved to main):
- Memory Stores (stats above input)
- Skills (stats above input, full list accessible via [+ Actions ▼])
- Debate, Consensus, Synthesis (buttons below input)
- Route/Model, Techniques, Transparency, Confidence (in [⚙ Details ▼])
- Feedback, Execute (in [+ Actions ▼] or [⚙ Details ▼])
- Multi-AI toggle (in [← More ▼])

---

## Input Box Enhancements

```
[Your question here...                                    ] ⌨️ Paste from anywhere
 ↳ Placeholder text changes based on state:
   - "ramble freely..." (default)
   - "what's your next thought?" (after 1st answer)
   - "still stuck? let's try another angle..." (after 3+ Qs on same topic)
   - "type here to debate..." (if Debate mode active)
```

**Right side of input:**
- 🎤 Record button (future: voice input)
- ⌨️ Keyboard shortcut hint (Cmd+Enter to submit)

---

## Color/Visual Hierarchy

- **Conversation thread:** Large, prominent, white/light background
- **Input box:** Clear visual separation, subtle border
- **Action buttons:** Bold, colored pills (accent color)
- **Stats (above input):** Muted, small font, secondary color
- **Sidebar:** 1/5 screen width, minimal visual weight

---

## Responsive (Mobile/Tablet)

- **Desktop:** Sidebar 200px fixed left, main area 100% - 200px
- **Tablet (< 900px):** Sidebar collapses to icon bar, main area expands
- **Mobile (< 600px):** Sidebar drawer (hamburger), main area full width

---

## State Persistence

All settings (theme, directness, model, multi-ai toggle) stored in localStorage, restored on page load. Active selection in "More" dropdown persists in a small inline badge if set non-default.

---

## File Structure Impact

**Current:** 
- `index.html` (main app)
- Sidebar-driven panel system

**After redesign:**
- `index.html` (unchanged structure, just CSS/JS tweaks)
- Sidebar reduced to nav
- Main content area becomes the primary workspace
- All panels exist but are triggered by main-area buttons, not sidebar clicks

**No new files needed** — restructure existing panels.

---

## Testing Checklist

- [ ] Conversation flows naturally (Q → A → Q → A)
- [ ] All buttons accessible without scrolling (except on mobile)
- [ ] Stats above input update in real-time
- [ ] Debate/Consensus/Synthesis work inline (don't require panel switch)
- [ ] [+ Actions ▼] menu has clear visual hierarchy
- [ ] Directness/model changes take effect immediately on next Translate
- [ ] Export downloads correct format
- [ ] Sidebar navigation still works for secondary features
- [ ] Responsive: sidebar hides on tablet, drawer on mobile

