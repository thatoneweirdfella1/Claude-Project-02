# DIVERGENCE.AI
# Complete Master Specification
**Version: 3.0 | Status: COMPREHENSIVE | Last Updated: July 11, 2026**

---

## EXECUTIVE SUMMARY

DIVERGENCE.AI is a premium, ADHD-friendly AI communication interface. It is a middleware application that translates raw, unstructured user input into optimized prompts and routes them intelligently across appropriate Claude model tiers.

The application is built around a canonical four-layer marble material system with frozen, non-regenerative textures. Every UI element is a window into one of four marble surfaces, never a painted replica.

**Core Constraint:** This is a completion and refinement project, not a redesign. Preserve existing architecture, reuse existing code, preserve existing visual identity unless explicitly directed otherwise.

---

## DESIGN PHILOSOPHY

### Material-First Architecture

The application is constructed from exactly four permanent material layers:

**Layer 1 — Foundation (Recessive)**
- Dark Theme: Black Marble
- Light Theme: White Marble
- Used for: Application background, empty margins, areas behind panels
- Luminance: Darkest in dark theme, lightest in light theme

**Layer 2 — Surface Panels (Structural)**
- Dark Theme: Dark Gray Marble
- Light Theme: Light Gray Marble
- Used for: Chat containers, sidebars, cards, large structural containers, state detection panels, memory panels, transparency panels
- Luminance: Mid-tone

**Layer 3 — Controls (Interactive)**
- Dark Theme: Light Gray Marble
- Light Theme: Dark Gray Marble
- Used for: Buttons, inputs, search bars, dropdowns, tabs, toggles, interactive elements
- Luminance: Inverted relative to panels

**Layer 4 — Content (Readable)**
- Dark Theme: White Marble
- Light Theme: Black Marble
- Used for: User messages, AI messages, prompt editor, reading cards, information surfaces
- Luminance: Opposite of foundation

### Visual Identity

**Overall Mood:**
- Quiet
- Premium
- Confident
- Intentional
- Minimal
- Architectural
- Like luxury desktop software, not a website

**Never:**
- Corporate
- Colorful
- Gamer aesthetic
- Futuristic neon
- Busy
- Startup dashboard feel
- Generic productivity software

**Influences:**
- High-end architectural materials
- Luxury watches
- Polished stone
- Apple-level restraint
- Minimalism
- Clean typography
- Large spacing
- High readability

### Theme Philosophy

The visual hierarchy never changes—only brightness inverts.

**Dark Theme Hierarchy:**
Foundation → Surface Panels → Controls → Content

**Light Theme Hierarchy:**
Same sequence, brightness inverted

Both themes should feel like identical applications photographed under different lighting.

### Marble Implementation (Critical)

**Core Rules:**
- Never generate marble
- Never recreate veins
- Never fake textures
- Load each uploaded marble image once
- Use clipping masks so controls reveal Controls marble, panels reveal Surface Panel marble, content reveals Content marble
- Foundation is one continuous marble surface across entire viewport
- Buttons are **windows revealing the Controls material beneath**, not painted-on marble
- All surfaces sample from one continuous global marble slab at 100% canonical scale
- Vein patterns flow continuously across component boundaries

---

## MATERIAL SYSTEM V3.0 (LOCKED FOREVER)

### Dark Theme Materials

| Material | Hex | Primary Use | Luminance | Hierarchy |
|----------|-----|-------------|-----------|-----------|
| **Graphite** | #0D0B0F | Background | 0.02 | Back (base) |
| **Slate** | #1A1823 | Cards/Panels | 0.03 | Middle |
| **Mist** | #2D2540 | Hover/Feedback | 0.05 | Forward |
| **Pearl** | #3D3650 | Active States | 0.07 | Front (highest) |
| **Obsidian** | #404040 | Borders (primary) | 0.10 | Structure |
| **Onyx** | #303030 | Borders (subtle) | 0.06 | Structure |
| **Luminescence** | #E0E0E0 | Text | 0.70 | Content |

### Light Theme Materials

| Material | Hex | Primary Use | Luminance |
|----------|-----|-------------|-----------|
| **Ash** | #F5F5F5 | Background | Inverted |
| **Silver** | #FFFFFF | Cards/Panels | Inverted |
| **Pearl** | #F0F0F0 | Feedback | Inverted |

### Material Specifications

#### GRAPHITE — Program Background
- **Color:** #0D0B0F (deep charcoal, not pure black)
- **Finish:** Mirror polished, ultra-smooth
- **Veins:** Sparse (8-12 times across full screen), white (#FFFFFF) at 15-20% opacity, organic branching pattern
- **Application:** Entire viewport background, behind all sidebars and content areas
- **Aesthetic:** Premium, calm, recessive; deep stone appearance

#### SLATE — Interactive Controls & Cards
- **Color:** #1A1823 (slightly lighter than Graphite)
- **Finish:** Mirror polished, ultra-smooth
- **Veins:** Sparse (5-8 times per card/panel), white at 12-18% opacity
- **Application:** Card backgrounds, panel backgrounds, dropdown menus, modal backgrounds, button backgrounds (secondary), form input backgrounds
- **Aesthetic:** Creates depth perception, feels contained and intentional

#### MIST — Content & Feedback Surfaces
- **Color:** #2D2540 (noticeably lighter, creates visual hierarchy)
- **Finish:** Mirror polished, ultra-smooth
- **Veins:** Sparse (4-6 times per surface), white at 10-15% opacity
- **Application:** State detection displays, hover states on panels, emphasis backgrounds, feedback surfaces, secondary panel backgrounds
- **Aesthetic:** Lighter, creates visual emphasis; feels active and present

#### PEARL — Active & Highlighted Elements
- **Color:** #3D3650 (lightest dark theme material)
- **Finish:** Mirror polished, ultra-smooth
- **Veins:** Minimal (3-5 times per surface), white at 10-15% opacity
- **Application:** Active button states, active accordion sections, highlighted rows, focus backgrounds, primary interactive states, active tabs
- **Aesthetic:** Lightness indicates activity/importance; highest visual weight

#### OBSIDIAN — Borders & Dividers (Primary)
- **Color:** #404040 (flat, no marble)
- **Finish:** Flat color only, no texture
- **Application:** All 1px borders on cards/panels/modals, divider lines between sections, focus ring borders
- **Contrast:** 5:1 against Graphite (WCAG AA compliant)
- **Aesthetic:** Functional, creates clear structure

#### ONYX — Subtle Dividers & Outlines
- **Color:** #303030 (flat, no marble)
- **Finish:** Flat color only, no texture
- **Application:** Subtle border colors, secondary divider lines, faint section separators
- **Contrast:** 3:1 against Graphite (more subtle than Obsidian)
- **Aesthetic:** Understated separation

#### LUMINESCENCE — Text & Content
- **Color:** #E0E0E0 (warm gray, not pure white)
- **Application:** All body text, labels, input placeholder text, secondary button text, card titles, standard interface text
- **Contrast:** 13:1 on Graphite, 12:1 on Slate, 10:1 on Mist (all WCAG AA compliant)
- **Aesthetic:** Readable, restful, professional

### Material Rules (Inviolable)

1. **Material Names Are Fixed** — Once named (Graphite, Slate, Mist, Pearl), never regenerated or reinterpreted. All instances identical.

2. **No Custom Tweaking** — Use the defined material or define a new one; never create variants.

3. **Material Hierarchy** — Graphite/Ash (background), Slate/Silver (standard surfaces), Mist/Pearl (interactive/active), Obsidian/Onyx (structure only), Luminescence (text only).

4. **No Material Mixing** — A card is Slate. Hover state becomes Mist. Never "70% Slate, 30% Mist."

5. **Vein Consistency** — All veins follow organic, branching marble pattern. Vein properties may vary by material, but generation rules remain consistent.

6. **Theme Switching** — Light and dark themes use same material system. Only luminance/exposure changes, not material names or formation rules.

7. **Material Scale: 100% Canonical** — Marble pattern has one fixed world scale, never changes. All surfaces sample at 100% scale from continuous global slab. Do not regenerate at different scales.

8. **Continuous Global Slab** — Every surface (buttons, cards, panels, modals, backgrounds) samples from the same continuous marble. Veins flow continuously across component boundaries. Position determines what portion is visible.

---

## INFORMATION ARCHITECTURE

### Layout Structure (Three-Region)

```
┌─────────────────────────────────────────────────────────┐
│                    TOP BAR (60px fixed)                 │
├─────────┬───────────────────────────────────┬───────────┤
│ LEFT    │         MAIN AREA (flex)          │   RIGHT   │
│ SIDEBAR │                                   │  SIDEBAR  │
│(200px)  │   Input Card                      │  (300px)  │
│         │   Answer Area                     │           │
│         │   Answer Expansion Cards          │           │
│         │                                   │           │
└─────────┴───────────────────────────────────┴───────────┘
```

### Top Bar (60px, fixed, full width)

**Content:**
- Logo
- Search
- Templates
- Quick Reference
- Settings
- Profile
- Notifications
- Help

**Material:** Slate (embedded look, not floating)
**Expandable:** Each icon expands to popup/panel in margin areas with cyan leader lines
**Spacing:** 16px padding inside bar, icons spaced 12-16px apart

### Left Sidebar (200px, fixed width)

**Content:**
- Logo area or whitespace
- 10 nav items (Home, Dashboard, Messages, Archive, Resources, Projects, Integrations, Tasks, Customize, Translate)
- Trash
- System Status (green dot + text)

**Material:** Slate (same depth as main area)
**Nav Item Styles:**
- Default: White text, 14px, medium weight
- Hover: Subtle brightening or slight background highlight
- Active: Blue marble background or cyan accent bar on left edge
**Spacing:** 16px padding, nav items spaced 8px vertically

### Main Area (flex-grow, center)

#### Input Card Section

**Header:**
- "WHAT'S ON YOUR MIND?" (cyan, all caps, 12px)

**Textarea:**
- Minimum 120px height, maximum 200px
- Smoked glass background
- White text
- Generous padding

**State Detection Pills:**
- Below textarea, 8px spacing
- Colored pills with labels
- Display detected states

**Control Row 1:**
- Model ▼ | Directness ▼ | Technique ▼
- Dropdown pattern with white labels, cyan arrows
- 12px spacing to next row

**Control Row 2:**
- Attach ▼ | Context > | [spacer] | TRANSLATE & ASK →
- Secondary buttons: Smoked Glass
- Primary button: Blue Marble
- 12px spacing between elements

**Quick Actions Row:**
- Secondary buttons below controls
- 16px spacing from control row

#### Answer Area

**Content Sequence:**
1. Translation Confidence line (small, muted, "92% confident...")
2. Answer text card (Smoked glass background, white text, 14px, generous 20px padding)
3. Feedback section (5-star rating, "What could be better?" field)
4. Transparency Details ▼ (accordion, expands to three cards: Routing, Techniques, Confidence)
5. Multi-AI Actions ▼ (accordion, expands to three buttons: Debate, Consensus, Synthesis)
6. Download ↓ button (bottom-right of answer card)

**Spacing:**
- Confidence to answer text: 8px
- Answer text to feedback: 12px
- Feedback to Transparency Details: 12px
- Transparency Details to Multi-AI Actions: 12px

### Right Sidebar (300px, fixed width)

**Content:**
- **Quick Tools:** 2×3 grid of tool buttons with icons on Slate background, colorful icons
- **Accordions** (Revolving-door behavior—only one expanded at a time):
  - Recent Sessions
  - Context Snapshot
  - Recent Activity
  - Token Usage
  - Model Status
  - Active Session
  - Collapsed: Thin title bar (cyan text, right chevron ►)
  - Expanded: Full content, down chevron (▼)

**Visibility Toggle:**
- ⚙️ icon, cyan color, top-right corner
- Transparent background, cyan icon
- Blue marble glow on hover
- Opens dropdown menu when clicked

**Material:** All sections Slate
**Spacing:** Quick Tools 12px between buttons, 16px to first accordion, sections stack directly

---

## FEATURE SPECIFICATIONS

### 1. Translation Engine

**Purpose:** Convert raw, unstructured user input into optimized prompts.

**Behavior:**
- Accepts free-form user text ("hey can u help me with this weird python thing???")
- Detects intent, context, tone, urgency
- Translates to Claude-optimized prompt structure
- Displays confidence percentage

**Output Format:**
```
Original: [user's raw input]
Translated: [optimized prompt]
Confidence: [percentage]
Detected Intent: [category]
Tone: [identified tone]
Context Detected: [relevant context]
```

**Interaction:**
- User types in textarea
- TRANSLATE & ASK button becomes active
- Click to translate and route
- Can review translation before sending

### 2. Routing Engine

**Purpose:** Intelligently select Claude model tier based on prompt complexity.

**Models Available:**
- Claude Haiku (simple tasks, fast, cost-efficient)
- Claude Sonnet (balanced, most versatile)
- Claude Opus (complex reasoning, highest capability)

**Routing Logic:**
- Analyzes translated prompt
- Calculates complexity score
- Suggests appropriate model
- User can override selection
- Transparency Details card shows routing reasoning

**User Control:**
- Model dropdown allows manual selection
- Routing card shows "Why this model?" explanation
- Can thumbs-down routing if disagree (feeds learning system)

### 3. Directness Control

**Purpose:** Let user specify communication style preference.

**Options:**
- Direct (get to the point)
- Detailed (full explanation)
- Socratic (ask guiding questions)
- Conversational (friendly, casual)
- Formal (professional, structured)

**Application:**
- Passed to Claude as instruction modifier
- Affects response tone and structure
- User adjusts via Directness dropdown in input area
- Can be toggled per-message

### 4. Technique Selection

**Purpose:** Choose Claude's reasoning approach for problem-solving.

**Technique Options:**
- Chain of Thought (step-by-step reasoning)
- Tree of Thought (explore multiple paths)
- Persona-Based (adopt specific expertise)
- Collaborative (iterative refinement)
- Direct Solution (fastest path to answer)

**Application:**
- Affects Claude's internal reasoning structure
- Influences response depth and exploration
- User selects via Technique dropdown in input area
- Can thumbs-down technique if ineffective (feeds learning system)

### 5. State Detection

**Purpose:** Automatically recognize user's emotional/cognitive state from input text.

**Detected States:**
- Emotional State (frustrated, confused, excited, anxious, overwhelmed)
- RSD Detection (Rejection Sensitive Dysphoria indicators)
- Cognitive Load Status (high, medium, low capacity)
- Interest Level (high, moderate, low engagement)
- Urgency (immediate, soon, low priority)

**Display:**
- Colored pills below textarea showing detected states
- Pills update as user types
- Example: [FRUSTRATED] [OVERWHELMED] [HIGH_URGENCY]

**Application:**
- Informs routing and technique selection
- Modifies response style (compassionate for anxiety, etc.)
- Triggers visibility of relevant features
- Enables ADHD Mode if cognitive load detected as high

### 6. Context Management

**Purpose:** Let user add and manage contextual information for better responses.

**Context Types:**
- Previous conversation history (auto-linked)
- Document attachments (uploaded files)
- Explicit context (copy-paste relevant info)
- System context (current date, location, constraints)
- Memory (persistent user preferences)

**Interaction:**
- "Context >" button in input area opens Context modal
- Add/remove context items
- View current context "weight" (how much context)
- ADHD Mode can auto-hide context management if overwhelming

**Storage:**
- Context persists across conversation turns
- Stored in session memory
- Exportable with conversation

### 7. Feedback & Rating System

**Purpose:** Collect user feedback to improve routing, technique, and translation over time.

**Feedback Types:**

**Answer Feedback:**
- 5-star rating on response quality
- "What could be better?" free text field

**Routing Feedback:**
- Thumbs-down on routing card if wrong model selected
- "Why was that wrong?" explanation
- Stores negative example (pattern detection)

**Technique Feedback:**
- Thumbs-down on technique card if ineffective
- Stores negative example
- Feeds into technique selection learning

**Confidence Feedback:**
- Agree/disagree with confidence percentage
- Helps calibrate confidence estimation

**Application:**
- All feedback stored in SQLite database
- Patterns extracted when 10+ similar examples collected
- Quarterly summary shows top patterns
- Drives continuous improvement of routing and technique selection

### 8. Transparency Details

**Purpose:** Show why the app made specific choices (model, technique, directness, confidence).

**Three Expansion Cards:**
1. **Routing Card**
   - Which model selected
   - Why that model
   - Complexity score
   - Confidence in routing
   - Thumbs-down option

2. **Techniques Card**
   - Which technique selected
   - Why that technique
   - Historical effectiveness
   - Thumbs-down option

3. **Confidence Card**
   - Overall response confidence percentage
   - Breakdown by component (routing, translation, technique)
   - Calibration metrics
   - Agree/disagree option

**Behavior:**
- Accordion expansion (revolving-door)
- Only one expanded at a time
- Clicking new accordion collapses previous
- Can collapse all (clicking same accordion twice)

### 9. Multi-AI Actions (Debate/Consensus/Synthesis)

**Purpose:** Enable advanced multi-model reasoning when user wants multiple perspectives.

**Three Buttons in Accordion:**

**Debate:**
- Sends prompt to multiple Claude models
- Models argue different positions on the topic
- User sees formatted debate
- Models can respond to each other's points

**Consensus:**
- Sends prompt to multiple models
- Models independently respond
- Synthesis extracts common themes
- Shows points of agreement and disagreement

**Synthesis:**
- Combines multiple model responses
- Creates unified answer
- Preserves nuanced disagreements
- Explains integration logic

**Interaction:**
- Click desired action
- Modal shows processing status
- Results display in expandable cards
- Can save/export comparison

### 10. Download & Export

**Purpose:** Let user save conversations and responses.

**Export Options:**
- Download as Markdown
- Download as PDF
- Copy to clipboard
- Email to self
- Save to file system

**Content Included:**
- Full conversation thread
- All translations shown
- Routing explanation
- Response with formatting
- Metadata (timestamp, models, confidence)

**Location:**
- Download button on answer card (bottom-right)
- Can also export entire session from Session Management

### 11. Session Management

**Purpose:** Manage conversations and history.

**Features:**
- Auto-save all conversations
- Name/rename sessions
- Archive old sessions
- Search conversations
- Delete sessions
- Resume previous conversations
- Session list in Left Sidebar

**Display:**
- Recent Sessions accordion in Right Sidebar
- Shows last 5-10 sessions
- Click to resume
- Can expand to see full history

### 12. Visibility Toggle (⚙️)

**Purpose:** Hide/show optional UI sections to reduce visual clutter.

**Toggle Menu Options:**
- Hide Right Sidebar
- Hide Left Sidebar
- Hide State Detection Pills
- Hide Transparency Details
- Hide Quick Actions Row
- Hide Accordion Headers (show only when expanded)
- Collapse all Accordions (collapse to thin bars)

**Behavior:**
- Non-destructive (hidden content preserved)
- Can toggle visibility via dropdown menu
- Setting persists during session

### 13. Quick Tools (Right Sidebar Grid)

**Purpose:** One-click access to common actions.

**2×3 Grid (6 Tools):**
- Examples: Save, Export, Share, Settings, Help, Templates
- Colorful icons on Slate background
- Hover shows tooltip
- Click performs action

### 14. Accordions (Right Sidebar)

**Purpose:** Organize information in collapsible sections.

**Behavior:**
- Revolving-door (only one expanded at a time)
- Collapsed state: Thin title bar, cyan text, right chevron (►)
- Expanded state: Full content, down chevron (▼)
- Click same accordion twice to collapse all
- No scrolling within accordions (content fits or hides)

---

## DESIGN DECISION HIERARCHY

When design goals conflict, this hierarchy determines which principle wins.

### Priority 1: Preserve Visual Identity

**Rule:** Never sacrifice the established aesthetic.

**Authority:** The final comprehensive layout image is the canonical visual reference.

**Principle:** Every component must appear carved from the same marble material system (Graphite, Slate, Mist, Pearl, Obsidian, Onyx, Luminescence).

**Application:** Every surface, color, spacing, corner radius, shadow, and proportion must match the reference image exactly.

**Tiebreaker Example:**
- IF: Adding a feature makes interface feel cluttered
- THEN: Don't simplify the visual language
- INSTEAD: Hide feature via accordion, move to modal, reorganize via toggle, don't change materials

### Priority 2: Maximize Conversation Readability

**Rule:** Never reduce conversation space unless absolutely necessary.

**Principle:** The conversation is the application. Everything else exists to support it.

**Non-Negotiable:**
- Answer card must receive maximum visual priority
- Textarea must always be accessible
- TRANSLATE & ASK button must never be hidden or obscured

**Solution Strategies:**
- Use accordion collapses to hide non-essential sidebar sections via ⚙️
- Move secondary features to modals
- Reuse dropdowns instead of showing all options at once
- Hide sections behind "View All" links that expand to main area

**Tiebreaker Example:**
- IF: Right sidebar and answer card can't both fit comfortably
- THEN: Don't shrink answer card or reduce padding
- INSTEAD: Hide sidebar sections via visibility toggle or collapse accordions

### Priority 3: Keep Controls Close to Where They Are Used

**Rule:** Place controls near the action they trigger.

**Guidelines:**
- Model/Directness/Technique dropdowns → Input area (not settings panel)
- Attach/Context buttons → Input area (not sidebar or top bar)
- Feedback buttons → Below answer (not elsewhere)
- Download → On answer card (not separate menu)
- State detection pills → Below textarea (not in sidebar)

**Tiebreaker Example:**
- IF: Adding control to input area makes it crowded
- THEN: Don't move control to sidebar
- INSTEAD: Nest in dropdown, expand via modal, keep controls near purpose

### Priority 4: Reduce Navigation Depth

**Rule:** Get users to content in fewest clicks.

**Constraint:** Don't invent new visual patterns or break Priority 1.

**Strategies:**
- Prefer dropdowns over hidden menus
- Prefer inline expansion over modals (when possible)
- Prefer visible options over buried options
- Prefer "View All" links that expand in main area over small preview panes

**Target:** ≤2 clicks to reach any feature

**Tiebreaker Example:**
- IF: Showing all options makes interface feel full
- THEN: Don't hide them completely
- INSTEAD: Use dropdowns, accordions, or "View All" links

### Priority 5: Consistency Beats Novelty

**Rule:** Reuse established patterns instead of inventing new ones.

**Guidelines:**
- Every dropdown works the same way
- Every button behaves the same way
- Every card feels like it belongs to the same family
- Every accordion follows revolving-door behavior
- Every modal overlays with semi-transparent background

**Application:** If a feature needs a new interaction pattern, verify no existing pattern fits.

**Tiebreaker Example:**
- IF: Dropdown could be more elegant as custom select box
- THEN: Don't create new pattern
- INSTEAD: Use existing dropdown pattern (consistency matters more than elegance)

### Priority 6: Never Invent Visual Patterns When Existing Ones Can Be Reused

**Rule:** The component library exists so you don't invent.

**Application:**
- If button exists → Use that button
- If dropdown exists → Use that dropdown
- If accordion exists → Use that accordion
- If modal pattern exists → Use that pattern

**Principle:** Copy. Don't redesign.

---

## DECISION TREE

```
Does this conflict with visual identity?
  YES → Use Priority 1 (Preserve Visual Identity)
        Reference: Master image materials, colors, spacing, typography
  NO → Continue

Does this conflict with conversation readability?
  YES → Use Priority 2 (Maximize Conversation Readability)
        Solution: Use accordions, visibility toggle, modals, dropdowns
  NO → Continue

Does this conflict with control proximity?
  YES → Use Priority 3 (Keep Controls Close)
        Guideline: Keep Model/Directness/Technique near input
        Keep Attach/Context near input
        Keep Feedback/Download near answer
  NO → Continue

Does this conflict with navigation depth?
  YES → Use Priority 4 (Reduce Navigation Depth)
        Solution: Use dropdowns, accordions, "View All" links (≤2 clicks)
  NO → Continue

Does this conflict with consistency?
  YES → Use Priority 5 (Consistency Beats Novelty)
        Solution: Match existing button/dropdown/accordion patterns
  NO → Continue

Is there an existing component I can reuse?
  YES → Use Priority 6 (Never Invent)
        Action: Reuse exact component, exact behavior
  NO → Make decision based on master layout image
```

---

## VISUAL SPECIFICATIONS

### Typography

**Font Family:** Anthropic Sans or equivalent clean sans-serif
**Fallback:** System sans-serif (SF Pro Display, Segoe UI)

**Font Sizes & Weights:**
- Section Headers (Top Bar, Sidebars): 12px, all caps, Cyan color, light weight
- Card Titles / Answer Headers: 14px, weight 500 (medium), white (Luminescence)
- Body Text / Answer Content: 14px, weight 400 (regular), white (Luminescence), line-height 1.6
- UI Labels (buttons, dropdowns): 14px, weight 500, white (Luminescence)
- Secondary Labels (small text): 12px, weight 400, muted gray (reduced opacity)
- Timestamps / Metadata: 12px, weight 400, opacity 0.6

**Weight Restrictions:**
- Use only weights 400 (regular) and 500 (medium)
- Never use 600 or 700 (too heavy, out of place)

**Line Height:**
- Body text: 1.6 (spacious, reads easily)
- Labels: 1.4 (slightly tighter, buttons don't need extra space)
- Headings: 1.3 (tighter, short text)

**Letter Spacing:** Minimal; default or slightly increased for all-caps headers (0.05em)

### Spacing & Layout

**Philosophy:** Whitespace is intentional and generous. Large breathing room everywhere. Content never feels compressed. Interface communicates confidence through restraint, not density.

**Guideline:** If two layouts are equally functional, choose the one with more breathing room.

**Padding (Inside Components):**
- Buttons: 12px vertical, 16px horizontal (minimum)
- Cards/Panels: 20px (minimum, can be more)
- Input areas: 12px (textarea padding inside control)
- Dropdowns: 12px
- Modals: 24px around content

**Margins (Between Components):**
- Between major sections: 24px or more
- Between rows: 16px or more
- Between list items: 12px or more
- Never cramped; always generous

**Container Max-Width:**
- No hard limit, but layout should breathe
- Conversation area should never feel squeezed
- Right sidebar can hide sections/collapse accordions to preserve conversation space

### Corners & Borders

**Border Radius:**
- Cards/Panels: 12-16px (soft, inviting)
- Buttons: 8px (slightly tighter)
- Dropdowns/Modals: 12px
- All rounded elements feel like one family

**Borders:**
- Minimal; prefer material depth separation over visible borders
- If border needed:
  - Hairline: 0.5px stroke
  - Color: Very subtle darker charcoal or cyan for interactive elements
  - Never bold borders, high-contrast outlines, heavy strokes

### Shadows

**Philosophy:** Shadows separate surfaces only. Never decorative, never theatrical.

**Shadow Style:**
- Spread: Wide, soft
- Blur: 8-16px (depending on elevation)
- Opacity: Very low (0.1-0.25)
- Offset: Subtle vertical offset (0-4px down)

**Examples:**
- Card shadow: offset 0 2px, blur 8px, opacity 0.15
- Dropdown/Modal shadow: offset 0 4px, blur 16px, opacity 0.2
- Hover elevation: offset 0 4px, blur 12px, opacity 0.2

**Rule:** Always single shadow (not multiple layers)

### Color Philosophy

**Primary Palette:** Almost entire interface is monochrome (black/white/gray).

**Color is Earned. Not Decorative.**

**Cyan (#00D9FF approximately):**
- Secondary interactive elements
- Section headers (Top Bar, Sidebars)
- Toggle buttons, gear icon
- Links and "View All" text
- Dropdown arrows

**Blue Marble (#2B4E9C to #4478E5):**
- Primary action buttons only (TRANSLATE & ASK, Download, etc.)
- Selected states
- Primary CTAs in modals
- Active selection highlights

**Purple (#8B5CF6 approximately):**
- Brand identity (logo "AI" text)
- Inside branding elements only
- Never for interactive elements
- Almost exclusively logo

**White/Gray:**
- All body text (Luminescence #E0E0E0)
- All labels
- All section headers (with Cyan as color accent)
- Background surfaces

**Red (Destructive Only):**
- Close Session button (red outline)
- Replace Current Answer button (red border)
- Only for destructive/dangerous actions

### Interactive States

**Button States:**

**Default:**
- Material visible (Slate or Blue Marble)
- Text clear, readable
- Cursor pointer

**Hover:**
- Subtle brightening or glow (20% increase in lightness)
- Slight shadow increase
- Cursor pointer stays active

**Active/Selected:**
- Blue Marble background OR cyan accent
- Deeper, more visible change
- Solid, committed appearance

**Disabled:**
- Opacity reduced to 50-60%
- Cursor not-allowed
- No hover state

**Text Link States:**

**Default:** Cyan text

**Hover:** Lighter cyan OR underline appears

**Visited:** Slightly muted cyan

### Component Specifications

#### Dropdown Pattern

**Closed State:**
- Label text (white, 14px)
- Dropdown arrow (cyan ▼, 14px)
- Material: Slate or transparent
- Height: 40px
- Padding: 12px

**Open State:**
- Menu below (never above unless near bottom of screen)
- Menu background: Slate with shadow
- Menu items: white text, 14px, 12px padding
- Hover: subtle background brightening
- Selected: Blue Marble background OR cyan highlight
- Corner radius: 8px

**Interaction:**
- Click to open
- Click option to select and close
- Click elsewhere to close without selecting
- Single selection (not multi-select)

#### Accordion Pattern

**Collapsed State:**
- Title bar: Cyan text, 12px all-caps, white chevron (►) on right
- Height: 36-40px
- Padding: 12px

**Expanded State:**
- Content displays below title
- Content material: Slate (same as sidebar)
- Chevron flips down (▼)
- Space below accordion: intentional whitespace (not filled)

**Revolving-Door Behavior:**
- Only one accordion expanded at a time
- Clicking new accordion collapses previous one
- Clicking same accordion twice collapses it
- All collapsed state is possible

#### Modal Pattern

**Background:**
- Color: Black with opacity (rgba(0, 0, 0, 0.45))
- Effect: Dims main area, focuses attention on modal

**Modal Panel:**
- Material: Slate
- Corners: 12px radius
- Shadow: Pronounced but not harsh (offset 0 4px, blur 16px, opacity 0.25)
- Padding: 24px
- Position: Centered on screen

**Modal Content:**
- Title: 14px, weight 500, white, cyan underline or separator
- Body: 14px, weight 400, white
- Form fields: Slate background, white text, 12px radius corners
- Buttons: Blue Marble (primary), Slate (secondary), Red (destructive)

**Buttons in Modal:**
- Primary (Download, Add, Merge, Debate): Blue Marble, 44px height, generous padding
- Secondary (Cancel, Close): Slate outline, 44px height
- Destructive (Replace, Close Session): Red outline, 44px height
- Button spacing: 8px between buttons

---

## IMPLEMENTATION NOTES

### Project Structure

The application already contains significant existing systems. Before implementation:

1. **Audit Existing Code** — Review what's already built
2. **Reuse Functionality** — Don't duplicate logic
3. **Complete Unfinished Features** — Before creating new ones
4. **Preserve Compatibility** — With existing architecture
5. **Work One Task at a Time** — Verify each before moving forward

### Development Philosophy

- Never redesign working UI
- Never invent solutions that contradict specifications
- Preserve existing visual identity unless explicitly directed otherwise
- Always reference the master layout image for authority on spacing/proportions/materials
- When ambiguous, consult the Design Decision Hierarchy

### Marble Texture Implementation

- Marble images are uploaded assets; never regenerate or recreate
- Use clipping masks to reveal appropriate layer for each component
- All surfaces sample from continuous global 100% scale
- Veins flow across component boundaries naturally

### ADHD-Friendly Design Principles

- Reduce cognitive load everywhere
- Group information naturally
- Important actions stand out immediately
- Reading surfaces extremely comfortable
- Remain calm even displaying complex information
- Provide explicit state detection as alternative to pattern recognition
- Allow hiding/showing features to prevent overwhelm

---

## ACCESSIBILITY

All materials meet WCAG AA contrast ratios:
- Luminescence on Graphite: 13:1 contrast
- Luminescence on Slate: 12:1 contrast
- Luminescence on Mist: 10:1 contrast
- Luminescence on Pearl: 9:1 contrast
- Border colors (Obsidian/Onyx): 5:1+ contrast

Light theme materials meet or exceed same standards in reverse.

---

## AUTHORITY CHAIN

When making decisions, follow this order:

1. **Visual Identity** — Does it preserve the master layout image materials and spacing?
2. **Feature Specification** — What should the feature do and how should it behave?
3. **Information Architecture** — Where does this component belong in the layout?
4. **Design Decision Hierarchy** — If conflicts exist, which principle wins?
5. **Visual Specification** — Exactly how should this look (material, color, spacing)?
6. **Material System** — Which material from v3.0 applies?
7. **Master Layout Image** — Final authority on all visual matters

---

## VERSION & STATUS

**Version:** 3.0
**Status:** COMPREHENSIVE AND FINAL
**Last Updated:** July 11, 2026
**Authority:** This document + uploaded marble images + master layout image

Once implemented, materials are frozen. Design system is stable. Visual identity is preserved forever.

**All future work references this document exclusively.**

