# DIVERGENCE.AI
# Implementation Roadmap & Checklist
**Phase: UI/Frontend Build**

---

## PHASE 0: PROJECT SETUP (Prerequisite)

Before any implementation begins, establish project foundation.

### 0.1 Project Structure

- [ ] Create `/public` directory for static assets
- [ ] Create `/src` directory for source code
- [ ] Create `/src/components` for React components
- [ ] Create `/src/styles` for CSS/SCSS
- [ ] Create `/src/assets` for images, icons, marble textures
- [ ] Create `/src/hooks` for custom React hooks
- [ ] Create `/src/utils` for utility functions
- [ ] Create `/src/constants` for constant values

### 0.2 Build Configuration

- [ ] Initialize package.json with dependencies
- [ ] Install React/build tools
- [ ] Set up bundler (Vite/Webpack)
- [ ] Configure CSS preprocessor (SCSS/Tailwind as needed)
- [ ] Set up linting (ESLint)
- [ ] Set up formatting (Prettier)
- [ ] Create `.env` template for configuration

### 0.3 Design Assets

- [ ] Import uploaded marble texture images
- [ ] Create SVG/icon assets
- [ ] Set up image optimization pipeline
- [ ] Create favicon/logo assets
- [ ] Verify marble images load correctly

### 0.4 CSS Foundation

- [ ] Create CSS reset/normalize file
- [ ] Set up CSS custom properties (material colors, spacing, typography)
- [ ] Create base typography styles
- [ ] Create utility classes (margin, padding, display)
- [ ] Set up media queries for responsive design

### 0.5 Git & Version Control

- [ ] Initialize git repository (if not already)
- [ ] Create `.gitignore` with node_modules, .env, build artifacts
- [ ] Create initial commit
- [ ] Push to designated branch

---

## PHASE 1: LAYOUT FRAMEWORK (Foundation)

Build the overall three-region layout structure before components.

### 1.1 Viewport & Wrapper

- [ ] Create main app wrapper component
- [ ] Set viewport to Graphite material
- [ ] Verify marble texture loads and repeats correctly
- [ ] Test on different screen sizes

### 1.2 Top Bar (60px, fixed)

- [ ] Create Top Bar component
- [ ] Apply Slate material
- [ ] Add placeholder content areas: Logo | Search | Icons | Profile
- [ ] Verify fixed positioning doesn't obscure content below
- [ ] Test responsiveness (hide icons on small screens if needed)

### 1.3 Left Sidebar (200px, fixed)

- [ ] Create Left Sidebar component
- [ ] Apply Slate material
- [ ] Add navigation item placeholder sections
- [ ] Add spacing between nav items (8px)
- [ ] Add bottom sections: Trash, System Status
- [ ] Test fixed positioning

### 1.4 Right Sidebar (300px, fixed)

- [ ] Create Right Sidebar component
- [ ] Apply Slate material
- [ ] Add placeholder for Quick Tools grid
- [ ] Add placeholder for accordion sections
- [ ] Add ⚙️ visibility toggle button (cyan, top-right)
- [ ] Test fixed positioning

### 1.5 Main Area (flex-grow, center)

- [ ] Create Main Area wrapper component
- [ ] Set flex-grow on container
- [ ] Verify it fills between sidebars
- [ ] Add overflow handling (scroll if content exceeds)
- [ ] Test with no content (empty state)

### 1.6 Layout Grid Test

- [ ] Create dummy content in each region
- [ ] Verify layout matches master image
- [ ] Test sidebar visibility/collapse
- [ ] Test responsive breakpoints
- [ ] Verify no horizontal scroll on main content

---

## PHASE 2: INPUT CARD (User Interface)

Build the textarea and controls where user enters prompts.

### 2.1 Input Card Container

- [ ] Create InputCard component
- [ ] Apply Slate material
- [ ] Add 20px padding
- [ ] Add 12-16px corner radius
- [ ] Add subtle shadow (offset 0 2px, blur 8px, opacity 0.15)
- [ ] Test material appearance (marble texture visible)

### 2.2 Header Section

- [ ] Add "WHAT'S ON YOUR MIND?" header
- [ ] Style: Cyan color, all caps, 12px, light weight
- [ ] Add 12px spacing below header
- [ ] Verify typography matches spec

### 2.3 Textarea Component

- [ ] Create custom textarea element
- [ ] Minimum height: 120px
- [ ] Maximum height: 200px
- [ ] Auto-expand as user types (if desired)
- [ ] Placeholder text: "Type your message..."
- [ ] White text on transparent background (shows Slate marble)
- [ ] 12px padding inside textarea
- [ ] Verify focus state (subtle highlight, not intrusive)

### 2.4 State Detection Pills

- [ ] Create pill component (small badge)
- [ ] Display below textarea with 8px spacing
- [ ] Show example states: [FRUSTRATED] [OVERWHELMED] [HIGH_URGENCY]
- [ ] Use colors to indicate state type (different hues)
- [ ] Implement state detection logic (placeholder: hardcoded examples)
- [ ] Pills update as user types (future: real detection)

### 2.5 Control Row 1 (Model, Directness, Technique)

- [ ] Create dropdown component (reusable)
- [ ] Dropdown 1: Model (Haiku, Sonnet, Opus)
- [ ] Dropdown 2: Directness (Direct, Detailed, Socratic, Conversational, Formal)
- [ ] Dropdown 3: Technique (Chain of Thought, Tree of Thought, etc.)
- [ ] Each dropdown: White label (14px), Cyan arrow, Slate material
- [ ] Spacing between dropdowns: 12px
- [ ] Add 12px spacing below this row

### 2.6 Control Row 2 (Actions & Button)

- [ ] Create Action Button: "Attach ▼" (secondary button, Slate material)
- [ ] Create Action Button: "Context >" (secondary button, Slate material)
- [ ] Create spacer (flex-grow between Context and TRANSLATE & ASK)
- [ ] Create Primary Button: "TRANSLATE & ASK →" (Blue Marble material)
- [ ] Primary button: 44px height, generous padding, white text
- [ ] Spacing between buttons: 12px
- [ ] Add 16px spacing below this row

### 2.7 Quick Actions Row

- [ ] Create secondary action buttons (placeholder: 3-5 examples)
- [ ] Button style: Slate material, 12px text, muted colors
- [ ] Examples: Save Draft, Clear, History, etc.
- [ ] Spacing: 8px between buttons
- [ ] 16px below this row

---

## PHASE 3: ANSWER AREA (Response Display)

Build the section that displays Claude's responses.

### 3.1 Answer Card Container

- [ ] Create AnswerCard component
- [ ] Apply Slate material
- [ ] Add 20px padding
- [ ] Add shadow (offset 0 2px, blur 8px, opacity 0.15)
- [ ] Add 12-16px corner radius
- [ ] Add 24px spacing above (from Quick Actions row)

### 3.2 Confidence Header

- [ ] Small text: "92% confident this is a good response"
- [ ] Style: 12px, weight 400, reduced opacity (muted gray)
- [ ] Add 8px spacing below header

### 3.3 Answer Text Content

- [ ] Display AI response text
- [ ] Style: 14px, weight 400, Luminescence (#E0E0E0)
- [ ] Line-height: 1.6 (spacious reading)
- [ ] Add 12px spacing below content

### 3.4 Feedback Section

- [ ] Create 5-star rating component
- [ ] Add "What could be better?" text field
- [ ] Style: 12px label, white placeholder text
- [ ] Add 12px spacing below feedback

### 3.5 Transparency Details Accordion

- [ ] Create accordion header: "Transparency Details ▼"
- [ ] Style: Cyan text, 12px all-caps, chevron (▼) right
- [ ] Create three expandable cards inside:
  - **Routing Card:** "Which model? Why? Confidence score. Thumbs-down option"
  - **Techniques Card:** "Which technique? Why? Historical effectiveness. Thumbs-down option"
  - **Confidence Card:** "Overall confidence %. Breakdown by component. Agree/disagree option"
- [ ] Default: All collapsed (thin title bars)
- [ ] Revolving-door: Only one expanded at a time
- [ ] Clicking same accordion = collapse all
- [ ] Add 12px spacing below accordion

### 3.6 Multi-AI Actions Accordion

- [ ] Create accordion header: "Multi-AI Actions ▼"
- [ ] Style: Cyan text, 12px all-caps, chevron (▼) right
- [ ] Create three buttons inside:
  - **Debate Button:** "Debate" (Blue Marble)
  - **Consensus Button:** "Consensus" (Blue Marble)
  - **Synthesis Button:** "Synthesis" (Blue Marble)
- [ ] Default: Collapsed (thin title bar)
- [ ] Clicking opens accordion, shows three buttons
- [ ] Button styling: 44px height, generous padding
- [ ] Spacing between buttons: 8px
- [ ] Add 12px spacing below accordion

### 3.7 Download Button

- [ ] Create Download button (icon + "Download")
- [ ] Position: Bottom-right of answer card
- [ ] Style: Blue Marble material (primary action)
- [ ] Spacing: 12px from bottom and right edges
- [ ] Hover: 20% brighter, subtle shadow

---

## PHASE 4: RIGHT SIDEBAR (Tools & Accordions)

Build the right sidebar with Quick Tools and expandable sections.

### 4.1 Quick Tools Grid

- [ ] Create 2×3 grid container
- [ ] Add 6 tool button placeholders (icons + labels)
- [ ] Apply Slate material to buttons
- [ ] Add colorful icons (placeholder SVGs)
- [ ] Button size: ~60px square or similar
- [ ] Spacing: 12px between buttons
- [ ] Hover: Subtle brightening
- [ ] Add 16px spacing below grid

### 4.2 Visibility Toggle (⚙️)

- [ ] Create gear icon button (⚙️)
- [ ] Position: Top-right corner of Right Sidebar
- [ ] Style: Cyan color, transparent background
- [ ] Hover: Blue Marble glow
- [ ] Click: Opens dropdown menu with visibility options
- [ ] Menu options (checkboxes):
  - Hide Right Sidebar
  - Hide Left Sidebar
  - Hide State Detection Pills
  - Hide Transparency Details
  - Hide Quick Actions Row
  - Collapse All Accordions

### 4.3 Accordion Sections

Create revolving-door accordion with these sections:
- Recent Sessions
- Context Snapshot
- Recent Activity
- Token Usage
- Model Status
- Active Session

#### For Each Accordion:

- [ ] Create collapsed state: Cyan title (12px all-caps) + Chevron (►)
- [ ] Height when collapsed: 36-40px
- [ ] Padding: 12px
- [ ] Create expanded state: Content displays, Chevron (▼)
- [ ] Content material: Slate
- [ ] Add placeholder content (mock data)
- [ ] Implement revolving-door: Only one expanded at a time
- [ ] Clicking same accordion twice = collapse all

### 4.4 Accordion Content Examples

**Recent Sessions:**
- List of previous conversations
- Click to resume
- Each item: title + timestamp

**Context Snapshot:**
- Current context items
- File attachments (icons + names)
- Context "weight" indicator

**Token Usage:**
- Usage statistics
- This session | Today | This week
- Visual meter/indicator

**Model Status:**
- Current model (Haiku/Sonnet/Opus)
- Confidence % in model choice
- Option to override

---

## PHASE 5: LEFT SIDEBAR (Navigation)

Build the left sidebar navigation menu.

### 5.1 Navigation Container

- [ ] Create LeftSidebar component
- [ ] Apply Slate material
- [ ] Add 16px padding
- [ ] Verify 200px fixed width

### 5.2 Logo/Header Area

- [ ] Add logo placeholder or whitespace
- [ ] Add 12px spacing below

### 5.3 Navigation Items

Create nav items list (placeholder):
- [ ] Home
- [ ] Dashboard
- [ ] Messages
- [ ] Archive
- [ ] Resources
- [ ] Projects
- [ ] Integrations
- [ ] Tasks
- [ ] Customize
- [ ] Translate

#### For Each Nav Item:

- [ ] Style: White text, 14px, medium weight
- [ ] Padding: 12px
- [ ] Default: No background
- [ ] Hover: Subtle brightening or slight Mist background
- [ ] Active: Pearl background or Cyan accent bar on left edge
- [ ] Spacing: 8px between items
- [ ] Implement click handler (placeholder: console log)

### 5.4 Bottom Sections

- [ ] Add divider (Obsidian border, 1px, margin 16px 0)
- [ ] Add "Trash" item (12px, reduced opacity)
- [ ] Add divider
- [ ] Add "System Status" section: Green dot + "All Systems Operational"
- [ ] Style status text: 12px, muted gray

---

## PHASE 6: TOP BAR (Header)

Build the fixed top navigation bar.

### 6.1 Top Bar Container

- [ ] Create TopBar component
- [ ] Apply Slate material
- [ ] Height: 60px
- [ ] Fixed positioning (sticky to top)
- [ ] Full viewport width
- [ ] Add 16px padding

### 6.2 Logo/Brand

- [ ] Add "DIVERGENCE.AI" logo or wordmark
- [ ] Style: White text, medium weight
- [ ] Position: Left side
- [ ] Include icon or branding element (if available)

### 6.3 Search Bar

- [ ] Create search input (placeholder: "Search conversations...")
- [ ] Style: Slate material background, white text, Luminescence
- [ ] Icon: Search icon (left side of input)
- [ ] Padding: 12px
- [ ] Hover/focus: Mist background or subtle highlight

### 6.4 Top Bar Items (Right Side)

Placeholder icons/buttons:
- [ ] Templates (icon + label)
- [ ] Quick Reference (icon + label)
- [ ] Settings (icon + label)
- [ ] Profile (icon + label)
- [ ] Notifications (icon + label with badge)
- [ ] Help (icon + label)

#### For Each Item:

- [ ] Icon + optional label
- [ ] Spacing: 12-16px between items
- [ ] Hover: Subtle highlight
- [ ] Click: Placeholder action (modal or dropdown)

### 6.5 Expandable Panels

- [ ] Each top bar item can expand to panel/modal
- [ ] Panel style: Centered modal or side panel
- [ ] Use cyan leader lines (optional visual connection)
- [ ] Click elsewhere to close

---

## PHASE 7: MODALS & OVERLAYS

Create reusable modal system.

### 7.1 Modal Component (Reusable)

- [ ] Create Modal wrapper component
- [ ] Background: Semi-transparent black (rgba(0,0,0,0.45))
- [ ] Panel: Centered, Slate material, 12px radius
- [ ] Padding: 24px inside modal
- [ ] Shadow: offset 0 4px, blur 16px, opacity 0.25
- [ ] Close button: Top-right corner (X icon)

### 7.2 Button Styles in Modals

- [ ] Primary button (Blue Marble): 44px height, generous padding
- [ ] Secondary button (Slate): 44px height, outline style
- [ ] Destructive button (Red): 44px height, outline style
- [ ] Spacing: 8px between buttons

### 7.3 Form Fields in Modals

- [ ] Text input: Slate background, white text, 12px padding
- [ ] Textarea: Same as above, expandable
- [ ] Dropdowns: Standard dropdown pattern
- [ ] Labels: 14px, weight 500, Luminescence
- [ ] Spacing: 12px between fields

### 7.4 Modal Examples (Placeholder Content)

Create placeholder modals for:
- [ ] Context Management Modal
- [ ] Settings Modal
- [ ] Help Modal
- [ ] Attachment Modal
- [ ] Multi-AI Actions Results Modal

---

## PHASE 8: RESPONSIVE & MOBILE

Adapt layout for smaller screens.

### 8.1 Breakpoints

- [ ] Desktop: Default (both sidebars visible)
- [ ] Tablet: Right sidebar collapses to icons
- [ ] Mobile: Both sidebars collapse, top bar becomes hamburger menu

### 8.2 Sidebar Collapse

- [ ] Create toggle for sidebar visibility
- [ ] Left sidebar collapses to icons-only
- [ ] Right sidebar collapses to icons-only
- [ ] Use ⚙️ visibility toggle to control

### 8.3 Input Card Adaptation

- [ ] Verify textarea still accessible on small screens
- [ ] Stack buttons vertically if needed
- [ ] Maintain minimum 300px width for readability

### 8.4 Testing

- [ ] Test on phone (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1440px width)
- [ ] Verify all content accessible
- [ ] No horizontal scroll

---

## PHASE 9: INTERACTIVITY & STATE

Implement interactive behaviors and state management.

### 9.1 Dropdown Behavior

- [ ] Click to open/close
- [ ] Click option to select and close
- [ ] Click outside to close
- [ ] Keyboard support (arrow keys, Enter, Escape)
- [ ] Store selected value in state

### 9.2 Accordion Behavior

- [ ] Click title to toggle expanded/collapsed
- [ ] Revolving-door: Only one expanded at a time
- [ ] Click same title twice = collapse all
- [ ] Smooth transition between states

### 9.3 Textarea Behavior

- [ ] Auto-expand/contract as user types
- [ ] Max height: 200px (scroll after)
- [ ] Enable TRANSLATE & ASK button only when text entered
- [ ] Real-time state detection (placeholder: hardcoded)

### 9.4 Button States

- [ ] Implement hover states (20% brighter, shadow increase)
- [ ] Implement active states (solid color change)
- [ ] Implement disabled states (50-60% opacity, not-allowed cursor)
- [ ] Smooth transitions

### 9.5 Modal Interaction

- [ ] Click overlay to close (optional)
- [ ] Close button closes modal
- [ ] Escape key closes modal
- [ ] Buttons trigger actions (placeholder)

### 9.6 Visibility Toggle (⚙️)

- [ ] Implement dropdown menu
- [ ] Toggle each option stores in session storage
- [ ] Hidden sections are display: none (not removed from DOM)
- [ ] Persist settings during session

---

## PHASE 10: STYLING & POLISH

Final visual refinement.

### 10.1 Typography

- [ ] Verify all text uses correct font, size, weight
- [ ] Line heights correct (1.6 body, 1.4 labels, 1.3 headings)
- [ ] Letter spacing correct (minimal, 0.05em for all-caps)
- [ ] All text is Luminescence (#E0E0E0)

### 10.2 Spacing

- [ ] Verify padding: 20px cards, 12px controls, 24px modals
- [ ] Verify margins: 24px major sections, 16px rows, 12px items
- [ ] Remove any cramped layouts
- [ ] Generous breathing room throughout

### 10.3 Colors & Materials

- [ ] Verify all colors use CSS variables
- [ ] Verify correct material on each component
- [ ] Verify marble textures load and display
- [ ] Verify no color drift (all Cyan exactly #00D9FF, etc.)

### 10.4 Shadows

- [ ] Verify shadow formulas correct (offset, blur, opacity)
- [ ] Verify shadows only for separation (not decorative)
- [ ] Verify no harsh shadows (keep soft and subtle)

### 10.5 Corners

- [ ] Verify all rounded elements: 12-16px (cards) or 8px (buttons)
- [ ] Verify no sharp corners (except structural elements)
- [ ] Consistency across all components

### 10.6 Interactions

- [ ] Smooth transitions (150-300ms)
- [ ] No jarring color changes
- [ ] Hover/active states clear but subtle
- [ ] Disabled states obvious but not ugly

---

## PHASE 11: TESTING & VERIFICATION

Systematic testing before handoff.

### 11.1 Visual Testing

- [ ] Compare layout to master layout image
- [ ] Verify spacing matches reference
- [ ] Verify colors match reference
- [ ] Verify materials applied correctly
- [ ] Screenshot comparison (before/after against master)

### 11.2 Functional Testing

- [ ] All dropdowns work correctly
- [ ] All buttons clickable and functional
- [ ] All accordions open/close properly
- [ ] Textarea expands as typed
- [ ] Modals open and close
- [ ] Visibility toggle hides/shows sections

### 11.3 Responsive Testing

- [ ] Desktop layout correct
- [ ] Tablet layout correct
- [ ] Mobile layout correct
- [ ] No horizontal scroll
- [ ] All content accessible

### 11.4 Accessibility Testing

- [ ] Text contrast meets WCAG AA
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Screen reader labels present (if applicable)
- [ ] Colors not the only way to convey info

### 11.5 Browser Testing

- [ ] Chrome/Edge latest
- [ ] Firefox latest
- [ ] Safari latest
- [ ] Mobile browsers

### 11.6 Performance Testing

- [ ] Page loads quickly (< 3 seconds)
- [ ] Marble textures load efficiently
- [ ] Smooth scrolling
- [ ] Interactions responsive (< 100ms)

---

## PHASE 12: DOCUMENTATION & HANDOFF

Prepare for development and maintenance.

### 12.1 Component Library

- [ ] Document all components (usage, props, states)
- [ ] Create Storybook or component gallery (optional)
- [ ] Include visual examples and code snippets

### 12.2 CSS Architecture

- [ ] Document CSS variables and their uses
- [ ] Document naming conventions
- [ ] Document color palette
- [ ] Provide SCSS/CSS organization guide

### 12.3 Implementation Guide

- [ ] Document folder structure
- [ ] Document build commands
- [ ] Document deployment process
- [ ] Provide troubleshooting guide

### 12.4 Design System Handoff

- [ ] Finalize master layout image location
- [ ] Finalize marble texture assets location
- [ ] Create asset manifest (what each file is)
- [ ] Document any deviations from spec (and why)

---

## COMPLETION CRITERIA

The UI is ready for integration with backend when:

- [ ] All layout phases (1-6) complete
- [ ] All components render correctly
- [ ] All interactivity (Phase 9) implemented
- [ ] Visual polish (Phase 10) complete
- [ ] All tests pass (Phase 11)
- [ ] Documentation complete (Phase 12)
- [ ] Master layout image matches implementation
- [ ] All material colors verified
- [ ] Responsive design verified
- [ ] Accessibility verified
- [ ] Code review passed
- [ ] No console errors or warnings

---

## NOTES

- This roadmap is sequential but flexible; complete phases in order
- Each phase builds on previous phases
- Test frequently; don't wait until end
- Reference DIVERGENCE-AI-MASTER-SPECIFICATION.md constantly
- When stuck, check DIVERGENCE-AI-QUICK-REFERENCE.md
- Master layout image is final authority on spacing/proportions
- Never shrink answer card or hide TRANSLATE & ASK button
- Preserve existing architecture (this is UI layer only)

