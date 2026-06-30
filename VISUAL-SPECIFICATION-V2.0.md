# DIVERGENCE.AI
# VISUAL SPECIFICATION
Version: 2.0

---

## CANONICAL DESIGN AUTHORITY

The final comprehensive layout image is the definitive visual authority for Divergence.AI.

Treat it as you would treat a production Figma file from the original design team.

It is **not** inspiration.
It is **not** a mood board.
It is **not** a style reference.

It is the application's canonical visual identity.

Every future screen must appear to have been created by the same designer using the same materials, proportions, lighting, spacing, typography, and construction methods.

This specification explains the image in words. If this specification and the image ever disagree, **the image is always correct.**

---

## GOLDEN RULE

Every future interface should appear as though it was designed by the exact same person that created the final comprehensive layout.

When uncertain, preserve existing visual language instead of inventing something new.

Do not modernize.
Do not simplify.
Do not reinterpret.

Continue.

---

## VISUAL IDENTITY

Overall mood:

- Quiet
- Premium
- Confident
- Intentional
- Minimal
- Architectural
- Like luxury desktop software, not a website

Never:

- Corporate
- Colorful
- Gamer aesthetic
- Futuristic neon
- Busy
- Startup dashboard feel
- Generic productivity software

---

## MATERIAL SYSTEM

The entire application is built from exactly four materials. No more. No alternatives.

### Material 1: BLACK MARBLE (Foundation)

**Purpose:**
Application foundation. The universe the interface exists in.

**Coverage:**
The entire viewport. The marble extends beneath every panel, every card, every sidebar.

There should never be separate background materials for different regions. The application feels carved from one continuous polished slab.

**Characteristics:**

**Color:**
Very deep charcoal. Not absolute black (#000000). Not medium dark gray.

Approximate range: #0B0C0E to #151618

Test: In a dark room, the marble should be barely visible, like looking into a deep cave.

**Texture:**
Highly polished. Very low contrast veining.

Sparse white/gray veining only. Veins should be extremely subtle. User notices the marble only after several seconds of looking, never immediately, never intrusive, never repetitive or busy.

Think: Real marble with subtle grain, not a noise filter.

**Gloss:**
Soft, diffuse reflection. No mirror finish. No plastic shine. No glossy appearance.

Surface feels like polished stone you could touch.

**Lighting:**
Caught under soft, diffuse light (like professional product photography in a softbox).

No harsh shadows. No dramatic reflections. No neon glow.

---

### Material 2: SMOKED GLASS (Cards, Panels, Controls)

**Purpose:**
Cards, panels, sidebars, dropdowns, modals, input areas, buttons (except primary).

**Characteristics:**

**Color:**
Dark charcoal with transparency. Approximately 88-92% opacity.

Permits marble beneath to show through slightly. Creates sense of depth and embedding.

**Background Blur:**
Heavy background blur (glassmorphism). Marble beneath is blurred and slightly dimmed.

Effect: Panel feels embedded inside the environment, not floating on top.

**Edge Definition:**
Very subtle. No obvious borders. No hard lines.

Hint of definition: slight gradient or 0.5px hairline stroke in darker charcoal (slightly darker than the panel).

**Corners:**
Large radius. Soft, rounded appearance. Not sharp. Not rectangular.

Approximate radius: 12-16px for cards, 8-12px for buttons/dropdowns.

**Shadow:**
Wide, soft, low-opacity shadow. Only enough to separate surfaces.

Never dramatic. Never theatrical.

Example: subtle drop shadow (offset 0 2px, blur 8px, opacity 0.2) to show panel sits slightly forward from marble.

---

### Material 3: BLUE MARBLE (Primary Actions)

**Purpose:**
Primary action buttons only. Use sparingly.

Examples:
- **TRANSLATE & ASK** main button
- **Active/hover states** on selectable items
- **Primary CTAs** in modals (Download, Add Context, Merge to Conversation)
- **Blue marble glow** on selected options in dropdowns

**Characteristics:**

**Color:**
Deep sapphire blue. Not bright. Not electric. Deep, rich, jewel-like.

Approximate range: #2B4E9C to #4478E5

Think: Polished blue stone (like lapis lazuli or sapphire), not plastic or glass.

**Texture:**
Very subtle marble-like texture. Visible only at close inspection. Polished, glossy stone appearance.

No gradients pretending to be marble. Texture is integrated into the material, not overlaid.

**Gloss:**
Glossy but not plastic. Reflects light like polished stone, not like polished plastic.

**Glow/Highlight:**
Soft internal glow (subtle highlight at top of button) suggesting light reflecting off curved surface.

No neon. No bloom. No excessive shine.

**Scale:**
Large enough to command attention (primary action). Not tiny.

Minimum 44px height for clickable area. Padding allows breathing room around text.

---

### Material 4: LIGHT (Separation Only)

**Purpose:**
Layer separation. Never decoration.

**Characteristics:**

**Type:**
Soft, diffuse reflections. Professional product photography lighting.

No bloom.
No neon glow.
No aggressive rim lighting.
No volumetric light.

**Usage:**
Subtle internal highlights on buttons/cards to suggest light hitting curved surfaces.

Small glows around interactive elements on hover (very subtle).

Slight brightening of edges where surfaces overlap (to show depth).

**Mood:**
Confident, premium. Like luxury product in a high-end studio shoot, not like sci-fi.

---

## COLOR PHILOSOPHY

### Primary Palette:

Almost the entire interface is monochrome (black/white/gray).

**Color is earned. Not decorative.**

**Cyan (#00D9FF approximately):**
- Secondary interactive elements
- Section headers (Top Bar, Sidebars)
- Toggle buttons, gear icon
- Links and "View All" text
- Dropdown arrows

**Blue Marble (#2B4E9C to #4478E5):**
- Primary action buttons only
- Selected states
- Primary CTAs in modals
- Active selection highlights

**Purple (#8B5CF6 approximately):**
- Brand identity (logo "AI" text)
- Inside branding elements
- Never used for interactive elements
- Almost exclusively logo

**White/Gray:**
- All body text
- All labels
- All section headers (with Cyan as color accent)
- Background surfaces

**Red (Destructive):**
- Close Session button (red outline)
- Replace Current Answer button (red border)
- Only for destructive/dangerous actions

### Text Colors:

- **Primary text:** White (#FFFFFF or very light gray)
- **Secondary text:** Muted gray (reduce opacity, don't change color)
- **Tertiary text:** Further reduced opacity
- **Interactive text:** Cyan for links, section headers
- **On Blue Marble:** White text (stands out against deep blue)

---

## TYPOGRAPHY

Typography communicates hierarchy through:

- Spacing
- Size
- Weight
- Opacity
- Positioning

**Never** through excessive color.

### Font Choices:

Use "Anthropic Sans" or equivalent clean sans-serif throughout.

Fallback: System sans-serif (SF Pro Display, Segoe UI, etc.)

### Font Sizes:

- **Section Headers** (Top Bar, Sidebars): 12px, all caps, Cyan color, light weight
- **Card Titles / Answer Headers**: 14px, weight 500 (medium), white
- **Body Text / Answer Content**: 14px, weight 400 (regular), white, line-height 1.6
- **UI Labels** (buttons, dropdowns): 14px, weight 500, white
- **Secondary Labels** (small text): 12px, weight 400, muted gray
- **Timestamps / Metadata**: 12px, weight 400, opacity 0.6 (reduced)

### Weight Hierarchy:

- **400 (Regular):** Body text, longer content, explanations
- **500 (Medium):** Labels, buttons, section headers, emphasis
- Never use weights 600 or 700 (too heavy, looks out of place)

### Line Height:

- Body text: 1.6 (spacious, reads easily)
- Labels: 1.4 (slightly tighter, buttons don't need as much space)
- Headings: 1.3 (tighter, short text)

### Letter Spacing:

Minimal. Default or slightly increased for all-caps headers (0.05em).

---

## SPACING & LAYOUT

Whitespace is intentional and generous.

Large breathing room everywhere.

Content never feels compressed.

The interface communicates confidence through restraint, not density.

**If two layouts are equally functional, choose the one with more breathing room.**

### Padding (inside components):

- **Buttons:** 12px vertical, 16px horizontal (minimum)
- **Cards/Panels:** 20px (minimum, can be more)
- **Input areas:** 12px (textarea padding inside the control)
- **Dropdowns:** 12px
- **Modals:** 24px around content

### Margins (between components):

- **Between major sections:** 24px or more
- **Between rows:** 16px or more
- **Between list items:** 12px or more
- **Never cramped. Generous.**

### Container Max-Width:

No hard limit, but layout should breathe.

Conversation area (center column) should never feel squeezed.

Right sidebar can hide sections or collapse accordions to preserve conversation space.

---

## CORNERS & BORDERS

### Border Radius:

Everything is soft, rounded. Nothing sharp. Nothing rectangular.

- **Cards/Panels:** 12-16px radius (soft, inviting)
- **Buttons:** 8px radius (slightly tighter)
- **Dropdowns/Modals:** 12px radius
- **Consistency:** All rounded elements feel like one family

### Borders:

Minimal. Prefer smoked glass depth separation over visible borders.

If a border is needed:

- **Hairline:** 0.5px stroke
- **Color:** Very subtle darker charcoal or cyan for interactive elements
- **Never:** Bold borders, high-contrast outlines, heavy strokes

---

## SHADOWS

Shadows serve one purpose: separate surfaces.

Never decorative. Never theatrical.

### Shadow Style:

- **Spread:** Wide, soft
- **Blur:** 8-16px (depending on elevation)
- **Opacity:** Very low (0.1-0.25)
- **Offset:** Subtle vertical offset (0-4px down)

### Examples:

- **Card shadow:** offset 0 2px, blur 8px, opacity 0.15
- **Dropdown/Modal shadow:** offset 0 4px, blur 16px, opacity 0.2
- **Hover elevation:** offset 0 4px, blur 12px, opacity 0.2

Always single shadow (not multiple layers).

---

## COMPONENT LOCATIONS (From Final Layout)

### Top Bar (60px, fixed, full width)

**Content:** Logo | Search | Templates | Quick Reference | Settings | Profile | Notifications | Help

**Material:** Smoked Glass (embedded look, not floating)

**Expandable:** Each icon expands to popup/panel in margin areas with cyan leader lines

**Spacing:** 16px padding inside bar, icons spaced 12-16px apart

---

### Left Sidebar (200px, fixed width)

**Content:**
- Logo area (if included) or just whitespace
- 10 nav items (Home, Dashboard, Messages, Archive, Resources, Projects, Integrations, Tasks, Customize, Translate)
- Trash
- System Status (green dot + text)

**Material:** Smoked Glass (same depth as main area, feels embedded)

**Nav Item Styles:**
- Default: white text, 14px, medium weight
- Hover: subtle brightening or slight background highlight
- Active (current): blue marble background OR cyan accent bar on left edge

**Spacing:** 16px padding, nav items spaced 8px vertically

---

### Main Area (flex-grow, center)

**Input Card:**
- "WHAT'S ON YOUR MIND?" header (cyan, all caps, 12px)
- Textarea (120px min, 200px max, smoked glass background, white text)
- State detection pills (below textarea, colored pills with labels)
- Control Row 1: Model ▼ | Directness ▼ | Technique ▼ (dropdowns with white labels, cyan arrows)
- Control Row 2: Attach ▼ | Context > | [spacer] | TRANSLATE & ASK → (buttons)
- Quick Actions row (secondary buttons below)

**Material for controls:**
- Dropdowns/buttons: Smoked Glass or transparent with hover state
- Primary button (TRANSLATE & ASK): Blue Marble
- Secondary buttons: Smoked Glass

**Spacing:**
- Textarea to pills: 8px
- Pills to Control Row 1: 12px
- Control Rows to each other: 12px
- Control Row 2 to Quick Actions: 16px

---

### Answer Area (below Quick Actions)

**Content:**
- Translation Confidence line (small, muted, "92% confident...")
- Answer text (smoked glass background card, white text, 14px, generous padding)
- Feedback section: 5-star rating, "What could be better?" field
- Transparency Details ▼ (expands to three cards: Routing, Techniques, Confidence)
- Multi-AI Actions ▼ (expands to three buttons: Debate, Consensus, Synthesis)
- Download ↓ button (bottom-right of answer card)

**Material:**
- Answer card: Smoked Glass, 20px padding
- Cards inside Transparency Details: Smoked Glass, 16px padding
- Buttons: Blue Marble (primary), Smoked Glass (secondary)

**Spacing:**
- Confidence to answer text: 8px
- Answer text to feedback: 12px
- Feedback to Transparency Details: 12px
- Transparency Details to Multi-AI Actions: 12px

---

### Right Sidebar (300px, fixed width)

**Content:**
- Quick Tools (pinned open, always visible)
  * 2×3 grid of tool buttons with icons
  * Colorful icons on dark smoked glass background
  * Each button is smoked glass with subtle hover effect
  
- Accordions below (Recent Sessions, Context Snapshot, Recent Activity, Token Usage, Model Status, Active Session)
  * Collapsed: thin title bar (cyan text, right chevron ►)
  * Expanded: full content display, down chevron (▼)
  * Revolving-door behavior (only one expanded at a time)

- Visibility toggle (⚙️ icon, cyan color, top-right corner)
  * Transparent background, cyan icon
  * Blue marble glow on hover
  * Opens dropdown menu when clicked

**Material:**
- All sections: Smoked Glass
- Section headers: Cyan text
- Tool buttons: Colorful icons on dark background
- Visibility toggle: Transparent with cyan icon

**Spacing:**
- Quick Tools grid: 12px between buttons
- Quick Tools to first accordion: 16px
- Between sections: 0px (they stack directly)
- Section headers: 12px padding, 16px padding if expanded

---

## MODAL BEHAVIORS

Modals overlay the main area with semi-transparent dark background.

**Background:**
- Color: Black with opacity (rgba(0, 0, 0, 0.45))
- Effect: Dims main area, focuses attention on modal

**Modal Panel:**
- Material: Smoked Glass
- Corners: 12px radius
- Shadow: Pronounced but not harsh (offset 0 4px, blur 16px, opacity 0.25)
- Padding: 24px
- Position: Centered on screen

**Modal Content:**
- Title: 14px, weight 500, white, cyan underline or separator
- Body: 14px, weight 400, white
- Form fields: Smoked Glass background, white text, 12px radius corners
- Buttons: Blue Marble (primary), Smoked Glass (secondary), Red (destructive)

**Buttons in Modal:**
- Primary (Download, Add, Merge, Debate): Blue Marble, 44px height, generous padding
- Secondary (Cancel, Close): Smoked Glass outline, 44px height
- Destructive (Replace, Close Session): Red outline, 44px height
- Button spacing: 8px between buttons

---

## DROPDOWN BEHAVIORS

All dropdowns follow the same pattern (Model, Directness, Technique, Attach, etc.).

**Closed State:**
- Label text (white, 14px)
- Dropdown arrow (cyan ▼, 14px)
- Material: Smoked Glass or transparent (depending on context)
- Height: 40px
- Padding: 12px

**Open State:**
- Dropdown menu appears below (never above, unless near bottom of screen)
- Menu background: Smoked Glass with shadow
- Menu items: white text, 14px, 12px padding
- Hover: subtle background brightening
- Selected: Blue Marble background OR cyan highlight
- Corner radius: 8px

**Interaction:**
- Click to open
- Click option to select and close
- Click elsewhere to close without selecting
- Single selection (not multi-select)

---

## ACCORDION BEHAVIORS

All accordions in right sidebar follow the same pattern.

**Collapsed State:**
- Title bar: Cyan text, 12px all-caps, white chevron (►) on right
- Height: 36-40px
- Padding: 12px

**Expanded State:**
- Content displays below title
- Content material: Smoked Glass (same as sidebar)
- Chevron flips down (▼)
- Space below accordion: intentional whitespace (not filled)

**Revolving-Door:**
- Only one accordion expanded at a time
- Clicking new accordion collapses previous one
- Clicking same accordion twice collapses it (all collapsed state possible)

---

## INTERACTIVE STATES

### Button States:

**Default:**
- Material visible (Smoked Glass or Blue Marble)
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

### Text Link States:

**Default:** Cyan text

**Hover:** Lighter cyan OR underline appears

**Visited:** Slightly muted cyan

---

## DESIGN TEST

Before approving any new screen, ask:

**"If I showed this beside the final comprehensive layout image, would someone believe they were designed by the same person?"**

If the answer is not an immediate yes, revise the design.

---

## REFERENCE MATERIALS

**Master Reference:** Final comprehensive layout image (definitive authority)

**Colors (Hex):**
- Black Marble: #0B0C0E to #151618
- Smoked Glass: Dark charcoal, 88-92% opacity
- Blue Marble: #2B4E9C to #4478E5
- Cyan: #00D9FF (approximately)
- Purple (branding): #8B5CF6 (approximately)

**Typography:**
- Font: Anthropic Sans (or system sans-serif)
- Weights: 400 regular, 500 medium (no 600, 700)
- Sizes: 12px (labels), 14px (body/labels), 16px (large headings)

**Spacing:**
- Padding: 12px (controls), 20px (cards)
- Margins: 16px+ between sections
- Line-height: 1.6 (body), 1.4 (labels)

---

## FINAL PRINCIPLE

Never ask: "How would I redesign this interface?"

Always ask: "How would the original designer naturally evolve this exact interface while preserving its identity?"

Then: Copy that approach exactly.

---

**Version:** 2.0 (Updated from final comprehensive layout)
**Authority:** Final comprehensive layout image is law
**Purpose:** Design specification for implementation
**Status:** Final reference document
