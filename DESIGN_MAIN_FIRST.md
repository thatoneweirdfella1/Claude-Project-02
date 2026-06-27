# Divergence.AI — Main-First Layout Redesign

## Vision
**Conversation-first workspace** like Claude Code — all power tools embedded contextually, not hidden in dropdowns. One unified screen, seamless workflows.

---

## Layout Structure

```
╔══════════════════════════════════════════════════════════════════════════╗
║  ⚡ Divergence.AI                          [📝API]  [⚙Settings]  [🌙]   ║  TOP RIGHT
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║                      CONVERSATION THREAD                                 ║
║                    (messages, answers flowing)                           ║
║                   (auto-scroll to latest msg)                            ║
║                                                                           ║
║                    [Your Q]  [AI Answer]  [Your Q]                       ║
║                                                                           ║
╠══════════════════════════════════════════════════════════════════════════╣
║  💭 Memory Stats  │  🎯 Active Skills  │  📊 State  │  [← More ▼]       ║  ABOVE INPUT
╠══════════════════════════════════════════════════════════════════════════╣
║  [Type your rambling thought...                                       ]  ║
║  [Keep typing, be yourself, don't worry about grammar]                  ║
╠══════════════════════════════════════════════════════════════════════════╣
║  ⚡Translate→   👥Debate    🗳Consensus   ⚛Synthesis   [⚙Details ▼]    ║  BELOW INPUT
║  [+ Actions ▼]                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝

SIDEBAR (minimal, secondary):
├─ 💬 Messages (search current thread)
├─ 🗄 Archive (saved conversations)
├─ 🔗 Resources (pinned links)
├─ 💼 Projects
├─ ☑ Tasks
├─ 🕐 History
├─ ? Help
├─ 👤 Profile
└─ ⚙ Settings
```

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

