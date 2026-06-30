# DIVERGENCE.AI
# INFORMATION ARCHITECTURE
Version: 2.0

---

## PURPOSE

This document defines where every element lives, how navigation flows, when things expand, and what happens when users interact with the interface.

Use this alongside Visual Specification (how it looks) and Feature Specification (what it does).

**Authority:** The final comprehensive layout image is the definitive reference.

---

## OVERVIEW

The conversation is the application. Everything else exists to support it.

The layout uses three persistent regions:

- **Left Sidebar (200px, fixed)** — Navigation only
- **Main Area (flex-grow)** — Conversation hub (input + answer)
- **Right Sidebar (300px, fixed)** — Tools, context, and session management (always visible, sections toggleable)

Nothing replaces the conversation. Secondary features expand inline, as dropdowns, or modally.

---

## TOP BAR (60px, fixed, full width)

Always visible. Global utilities. Expandable via cyan leader lines to designated content zones.

**Left Section:**
- Divergence.AI Logo (brain icon + wordmark + "AI" in purple)

**Right Section (all expandable):**
- Search (expands to search popup with recent searches)
- Templates (expands to template menu)
- Quick Reference (expands to shortcut variables panel)
- Settings (expands to settings menu)
- Profile/Account (expands to profile menu with user name, sign out, etc.)
- Notifications (expands to notification panel with mock notifications)
- Help (expands to help menu with docs, shortcuts, support, bug report)

**Interaction:** Click any icon opens its expanded content in designated margin area. Does not replace conversation.

**Leader Lines:** Cyan lines point from each icon to its expanded content zone.

---

## LEFT SIDEBAR (200px, fixed width)

Navigation only. Lightweight. Visually quiet.

**Primary Navigation (10 items):**
1. Home (default selected, blue highlight)
2. Dashboard
3. Messages
4. Archive
5. Resources
6. Projects
7. Integrations
8. Tasks
9. Customize
10. Translate (currently selected in final layout)

**Bottom Section:**
- Trash (soft delete, recoverable, click to view deleted items)
- System Status (green dot indicator + "All Systems Operational" or status text)

**Behavior:**
- Click item = navigate to that section
- Current section highlighted with blue background
- Does NOT contain conversation controls
- Conversation controls live in main area only
- Nav items are lightweight and visually quiet (supporting role)

---

## MAIN AREA (flex-grow, center)

The conversation hub. Receives largest visual priority and space allocation.

### INPUT CARD

**Title (Above Textarea):**
"WHAT'S ON YOUR MIND?" (cyan, all caps, small)

**Textarea:**
- Minimum height: 120px
- Maximum height: 200px
- Placeholder: "Type how you actually think..."
- Expands as user types (within min/max bounds)

**State Detection Display (Below Textarea, appears 300-500ms after pause):**
Shows as colored pills with label:
- Purple/Red pill: "Emotion: Overwhelmed"
- Red pill: "RSD: High"
- Green pill: "Interest: High"
- Blue pill: "Cognitive Mode: Analytical"
- X button to dismiss entire display
- Explanation text: "You sound overwhelmed. I told the AI to be extra supportive and break things down."

**Control Row 1 (Below State Detection):**

Three dropdowns (all expandable):

**Model ▼**
- Label: "Model"
- Closed state: shows label + dropdown arrow (▼)
- Open state: dropdown menu appears below showing:
  * Opus 4.8 — smartest (default)
  * Opus Fast
  * Haiku
- Selection persists in session
- Cyan leader line (if in comprehensive view) points from button to expansion area

**Directness ▼**
- Label: "Directness"
- Closed state: shows label + arrow
- Open state: dropdown shows:
  * Directness Level 1
  * Directness Level 2 (default)
  * Directness Level 3
- Selection persists
- Cyan leader line to expansion zone

**Technique ▼**
- Label: "Technique"
- Closed state: shows label + arrow
- Open state: large dropdown menu showing ALL techniques with auto-detect button:
  * Auto-detect (based on discussion vibe) — BUTTON at top
  * Socratic (checkmark shows selection)
  * Quote-First
  * Chain-of-Thought
  * Role-Prime
  * Verify
  * Examples
  * Simplify
  * Detailed
  * Step-by-step
  * Comparative
  * Metaphor
- Default: Socratic
- Single selection only
- Cyan leader line to large expansion zone

**Control Row 2 (Below Control Row 1):**

**Attach ▼**
- Button: "Attach" with dropdown arrow
- Click to expand showing options:
  * Upload file
  * Paste text
  * Paste URL
  * Create variable
- File size limits: 10MB per file, 50MB total context
- Cyan leader line to expansion zone

**Context >**
- Button: "Context" with chevron (>)
- Click to open modal overlay
- Modal contains:
  * Title: "Manage context"
  * File upload area (drag-and-drop)
  * Paste text field
  * Paste URL field
  * Variable name/value form
  * Mock loaded files list:
    - "research_notes.pdf" (with × remove icon)
    - "previous_context.txt" (with × remove icon)
  * "Add Context" button (blue marble)
- Context persists across all subsequent questions in session
- Modal overlays entire center area with semi-transparent dark background

**Import ▼**
- Button: "Import" with dropdown arrow
- Click to expand showing sources:
  * Import previous conversation
  * Import from file (.json, .txt)
  * Import from URL
  * Import variables from another session
  * Import context snapshot
  * Import saved prompts
  * Import chat history
  * Import template settings
- Cyan leader line to expansion zone

**Spacer then Primary Button:**
- **TRANSLATE & ASK →** (Blue Marble primary button)
  * Label: "TRANSLATE & ASK →" with arrow icon
  * Full-width button (or near-full width)
  * Blue marble material (sapphire stone appearance)
  * Submits question, triggers entire pipeline
  * Shows "Thinking..." while processing
  * All controls disable during processing
  * Alternative submit: Press Enter in textarea

**Quick Actions Row (Below Control Rows):**

Horizontal row of secondary buttons:
- New Session (blue marble for first button)
- Load Template
- Saved Prompts
- Duplicate Session
- ... More (empty dropdown, reserved for future)

Each button is clickable. Most open modals. "... More" is empty in current design.

---

### ANSWER AREA (Below Quick Actions, appears after TRANSLATE & ASK)

**Translation Confidence (Small Text Above Answer):**
- "92% confident this is what you meant"
- Small, muted, communicates translation accuracy
- Helps user understand if AI understood correctly

**Answer Text (Primary Content):**
- Main response from AI
- Largest visual element
- Receives maximum visual priority
- Wrapped in smoked glass card
- Readable, spacious typography

**Feedback Section:**
- 5-star rating row: ⭐ ⭐ ⭐ ⭐ ⭐ (clickable stars)
- Optional text field below: "What could be better?" (placeholder visible)
- User clicks star to rate (1-5 scale)
- Rating persists in session

**Transparency Details ▼**
- Button: "TRANSPARENCY DETAILS ▼" (cyan text, icon present)
- Closed state: shows label + dropdown arrow
- Open state: expands inline (below button) to show three cards:
  * **Routing Card**: "Claude Opus 4.8" (shows selected model, routing decision)
  * **Techniques Card**: "Socratic, Chain-of-Thought" (techniques applied)
  * **Confidence Card**: "92%" (overall confidence breakdown)
- Cards appear in row or grid below button
- Cyan leader line (in comprehensive view) points from button to card area

**Multi-AI Actions ▼**
- Button: "MULTI-AI ACTIONS ▼" (cyan text, icon present)
- Closed state: shows label + dropdown arrow
- Open state: expands inline below to show three buttons/options:
  * **Debate** — Click to open modal. Shows two AI perspectives arguing opposite sides. Modal title: "Debating: [topic]". Two columns: "Position A" | "Position B". Buttons: "Merge to Conversation", "Download Debate", "Close"
  * **Consensus** — Click to open modal. Shows common ground finding. Title: "Finding Common Ground: [topic]". Sections: Disagreement statement, Common ground, Unified perspective. Buttons: "Merge to Conversation", "Download", "Close"
  * **Synthesis** — Click to open modal. Shows unified answer combining all viewpoints. Title: "Synthesis". Content: Unified answer. Buttons: "Replace Current Answer", "Merge Below", "Download", "Close"
- Cyan leader line (in comprehensive view) points to button area

**Download Button (↓ icon)**
- Position: Bottom-right of answer card
- Icon: Down arrow (↓)
- Click to open download modal with:
  * Checkboxes for content selection:
    - ☑ Answer text
    - ☑ Confidence
    - ☐ Rating
    - ☐ Transparency details
    - ☐ State detection pills
  * Format selector: Markdown (default), HTML, JSON, PDF
  * Buttons: Download (blue marble), Copy to Clipboard, Cancel
- Modal overlays center area

---

## RIGHT SIDEBAR (300px, fixed width)

Always visible. Secondary information and visibility controls. Sections are toggleable via ⚙️ button.

### Visibility Toggle (⚙️)

**Button:**
- Location: Top-right corner of right sidebar
- Icon: Cyan gear (⚙️)
- Size: 40×40px
- Material: Transparent background, cyan icon, blue marble glow on hover
- Click to open dropdown menu

**Dropdown Menu (when opened):**
- Position: Absolute, below button, right-aligned
- Width: 280px
- Material: Smoked Glass
- Contains 7 checkboxes:
  * ☑ Recent Sessions (default ON)
  * ☑ Context Snapshot (default ON)
  * ☑ Recent Activity (default ON)
  * ☑ Token Usage (default ON)
  * ☑ Model Status (default ON)
  * ☐ Quick Tools (default OFF)
  * ☐ Active Session (default OFF)
- "Reset to defaults" button at bottom
- Settings persist in session/account

---

### QUICK TOOLS (Always visible, pinned at top of sidebar)

**Header:**
- "QUICK TOOLS" (cyan text, all caps, small)
- Gear icon (⚙️) to the right (opens visibility dropdown)

**Grid Layout (2 columns × 3 rows = 6 buttons):**

Each button shows icon + label, arranged in 2×3 grid:

Row 1:
- **Router** (icon + label) — Click to view routing decision details (which model chosen, why)
- **Techniques** (icon + label) — Click to view techniques applied to this response
- **Prompt Library** (icon + label) — Click to save/load prompt templates

Row 2:
- **Variables** (icon + label) — Click to manage context variables
- **Checkpoints** (icon + label) — Click to save/restore conversation states
- **Dashboard** (icon + label) — Click to view session statistics

**Behavior:**
- Each button click opens modal or expands inline details (depending on feature)
- Does not replace conversation view
- Icons are colorful (matching visual spec icons)
- Labels are white text, small (12px)

---

### ACCORDIONS (Below Quick Tools, toggleable via ⚙️)

Each accordion section can be collapsed or expanded. Only one expanded at a time (revolving-door behavior).

**1. Recent Sessions (Default: ON, visible, EXPANDED in final layout)**

**Header:**
- "RECENT SESSIONS" (cyan text)
- Right arrow chevron (►) when collapsed, down arrow (▼) when expanded

**Content (When Expanded):**
- Scrollable list of recent sessions (5-6 items shown):
  * "Quantum entanglement explained" — 2m ago
  * "ADHD communication strategies" — 15m ago
  * "How to phrase difficult feedback" — 1h ago
  * "Advanced Python patterns" — 3h ago
  * "Meeting notes summary" — 1d ago
  * "API design best practices" — 2d ago
- Each row is clickable (click to restore/switch to that session)
- "View All" link at bottom (cyan) — click to expand full list into main viewing area

**Behavior:**
- Click "View All" → Recent Sessions takes over main area showing full searchable list
- Click session row → switches to that conversation
- Clicking another accordion section collapses Recent Sessions and expands that section instead

---

**2. Context Snapshot (Default: ON, visible, COLLAPSED in final layout)**

**Header:**
- "CONTEXT SNAPSHOT" (cyan text)
- Badge showing item count ("0 items" or "3 items")
- Right arrow chevron (►) when collapsed

**Content (When Expanded):**
- List of loaded context items (if any)
- Each item shows: type, filename/source, size
- Remove button (×) for each item
- If no items: "No active context" message with explanation
- "Add Context" button (blue marble) — click to open context modal
- "Use Context" toggle switch (enable/disable context for next question)

---

**3. Recent Activity (Default: ON, visible, COLLAPSED in final layout)**

**Header:**
- "RECENT ACTIVITY" (cyan text)
- Right arrow chevron (►) when collapsed

**Content (When Expanded):**
- Activity log for current session
- Activity types and timestamps:
  * "Session created" — 2m ago
  * "Template loaded" — 15m ago
  * "Context imported" — 1h ago
  * "Variables updated" — 2h ago
  * "Question asked" — Just now
- Scrollable list
- "View All Activity" link at bottom (cyan)

---

**4. Token Usage (Default: ON, visible, COLLAPSED in final layout)**

**Header:**
- "TOKEN USAGE" (cyan text)
- Right arrow chevron (►) when collapsed

**Content (When Expanded):**
- "This Session" label
- Token count: "12,450 / 100K tokens"
- Visual meter/progress bar (12% usage shown)
- Reset timer: "Resets in 2h 45m"
- Helps user track API costs and remaining quota

---

**5. Model Status (Default: ON, visible, COLLAPSED in final layout)**

**Header:**
- "MODEL STATUS" (cyan text)
- Right arrow chevron (►) when collapsed

**Content (When Expanded):**
- Currently active model badge: "Claude Opus 4.8" (or "Opus fast" or "Haiku")
- System health indicator: "All Systems Operational" (green dot + text)
- Model availability: "5 of 5 models online"
- Quick visual indicator of what's running now

---

**6. Active Session (Default: OFF, hidden, COLLAPSED in final layout)**

**Header:**
- "ACTIVE SESSION" (cyan text)
- Right arrow chevron (►) when collapsed
- Hidden by default (checkbox unchecked in visibility menu)

**Content (When Expanded, if visible):**
- Session metadata:
  * Start time: "10:34 AM"
  * Questions asked: "7"
  * Tokens used: "12,450 / 100K"
  * Context items: "2 files loaded"
- "Close Session" button (red outline, destructive action)

**Note:** This section is hidden by default because Token Usage + Model Status + Recent Activity already show this information. User can enable if they want session metadata always visible.

---

## ACCORDION BEHAVIOR (CRITICAL)

- **Revolving-door behavior:** Only one accordion section expanded at a time
- Click section header to expand it
- Expanding a new section automatically collapses the previously expanded one
- Clicking same section header twice collapses it (returning to all-collapsed state)
- Collapsed sections show only title bar + chevron (►)
- Expanded sections show full content + down chevron (▼)
- Space below expanded section is empty (intentional whitespace, not filled)

---

## MODAL BEHAVIORS

Modals overlay the center area with semi-transparent dark background (rgba(0,0,0,0.45)).

**Context Modal**
- Title: "Manage context"
- File upload area
- Paste text field
- Paste URL field
- Variable form (name = value)
- Loaded files list (with remove icons)
- "Add Context" button (blue marble)
- "Cancel" button
- Context persists across questions

**Template Picker Modal**
- Title: "Load template"
- Search field
- Template cards showing preview, name, description
- "Edit before apply" button
- "Load" button (blue marble)
- "Cancel" button

**Download Modal**
- Title: "Download answer"
- Checkboxes: Answer text, Confidence, Rating, Transparency details, State detection pills
- Format selector: Markdown (default) | HTML | JSON | PDF
- "Download" button (blue marble)
- "Copy to Clipboard" button
- "Cancel" button

**Debate Modal**
- Title: "Debating: [topic]"
- Two-column layout: "Position A" | "Position B"
- Real-time generation visible as content fills
- "Merge to Conversation" button (blue marble)
- "Download Debate" button
- "Close" button

**Consensus Modal**
- Title: "Finding Common Ground: [topic]"
- Three sections:
  * Disagreement statement
  * Common ground
  * Unified perspective
- "Merge to Conversation" button (blue marble)
- "Download" button
- "Close" button

**Synthesis Modal**
- Title: "Synthesis"
- Unified answer combining viewpoints
- "Replace Current Answer" button (destructive, red)
- "Merge Below" button
- "Download" button
- "Close" button

---

## USER FLOWS

### Flow 1: Ask a Question

1. User navigates to Home (main area shows input card)
2. Types in textarea: "Type how you actually think..."
3. State detection display appears after 300-500ms (emotion, RSD, interest, cognitive mode)
4. User selects/confirms Model, Directness, Technique (or uses defaults)
5. User clicks "TRANSLATE & ASK" or presses Enter
6. Button shows "Thinking..." state, all controls disable
7. Backend: translate → route → compose → call API
8. Answer appears with confidence line, rating, transparency, multi-AI options
9. User rates answer (1-5 stars)
10. User can explore transparency details, debate/consensus/synthesis, download, or ask follow-up

### Flow 2: Toggle Sidebar Visibility

1. User clicks ⚙️ button (top-right of right sidebar)
2. Dropdown menu opens showing 7 checkboxes
3. User checks/unchecks sections they want visible
4. Sidebar updates immediately
5. Settings persist in session/account
6. User can click "Reset to defaults" to restore original state

### Flow 3: Expand Accordion Section

1. User sees collapsed accordion sections in right sidebar
2. Clicks section title to expand it
3. Content expands below title (replaces nothing, just opens)
4. Previous expanded section automatically collapses (revolving-door)
5. Clicking another section expands that one, collapses current one
6. Click same section title twice to collapse it

### Flow 4: Manage Context

1. User clicks "Context >" button in input area
2. Context modal opens overlaying center area
3. User uploads files, pastes text, adds URLs, or creates variables
4. User sees loaded context items list
5. User clicks "Add Context" to save
6. Modal closes
7. Context persists in session (included in all subsequent questions)
8. User can also access via Context Snapshot accordion in sidebar

### Flow 5: Use Multi-AI Actions

1. User receives answer
2. Clicks "Multi-AI ACTIONS ▼" dropdown below answer
3. Three buttons appear: Debate, Consensus, Synthesis
4. User clicks one (e.g., "Debate")
5. Debate modal opens showing two AI perspectives arguing opposite sides
6. User can merge response to conversation, download, or close
7. Returning to conversation with merged response updates context

---

## INFORMATION HIERARCHY

**Tier 1 (Largest Visual Priority):**
- Main answer text
- Textarea (input)

**Tier 2 (High Priority):**
- State detection pills
- Model/Directness/Technique dropdowns
- Confidence line
- 5-star rating

**Tier 3 (Medium Priority):**
- Attach, Context, TRANSLATE & ASK buttons
- Transparency Details, Multi-AI Actions
- Download button

**Tier 4 (Supporting):**
- Quick Actions row
- Quick Tools (right sidebar)
- Accordions (Recent Sessions, etc.)

**Tier 5 (Navigation/Background):**
- Left sidebar
- Top bar (when not expanded)

---

## CONSTRAINTS (NON-NEGOTIABLE)

1. Conversation never leaves screen (no full-page replacements)
2. Main input card always visible (textarea always accessible)
3. Main answer always visible (core content never hidden)
4. Feedback buttons always visible (5-star rating always visible)
5. Blue marble TRANSLATE & ASK button always visible (primary action)
6. Right sidebar always visible (but sections can toggle on/off)
7. Left sidebar always visible (lightweight navigation)
8. Visibility toggle (⚙️) always accessible (top-right of sidebar)
9. Quick Tools always pinned open (visible by default in sidebar)
10. Accordions follow revolving-door behavior (only one expanded at a time)

---

**Version:** 2.0 (Updated from final comprehensive layout)
**Authority:** Final comprehensive layout image is the definitive reference
**Purpose:** Reference for Claude Design + Claude Code implementation
**Status:** Final architecture document
