# DIVERGENCE.AI Comprehensive Specification

**Version:** 1.0  
**Status:** FROZEN — implementation source of truth  
**Scope:** Light-mode desktop conversation experience  
**Date locked:** 2026-08-14

---

## 0. Authority, interpretation, and non-negotiable rules

### 0.1 The three truth sources

| Priority | Source | Authority |
|---:|---|---|
| 1 | `LIGHT GOLD LAYOUT - MAIN LAYOUT DIVERGENCE FROZEN(2).png` | Outer shell, marble, material system, column geometry, visual alignment, and light-mode identity. |
| 2 | `GOLD Light Version(1).jpg` | Conversation history, message composition hierarchy, and the relationship between the thread, composer, compact utilities, and right rail. |
| 3 | `DIVERGENCE-AI-COLORED-DECISION-MAP.docx` | Every approved GREEN route: control names, options, actions, state transitions, progressive disclosure, recovery, and information architecture. |

### 0.1.1 Source identity locks

| Source | SHA-256 |
|---|---|
| `LIGHT GOLD LAYOUT - MAIN LAYOUT DIVERGENCE FROZEN(2).png` | `3c090d66e413e49ef076edc104a7e1e834208823835db8497c69ba7da6a21597` |
| `GOLD Light Version(1).jpg` | `0b5b2761c928d84e7cc97dfa255ed7a907984950c1866a7261d975570025b079` |
| `DIVERGENCE-AI-COLORED-DECISION-MAP.docx` | `982a1c615dfda91d2d2a272efb194576f31e4b88508bf41765aedc626c35e8bf` |

Any file with the same name but a different hash is not one of the frozen sources for Version 1.0.

### 0.2 Conflict rule

The sources govern different layers. They are not blended by visual averaging.

1. The Light Gold Layout controls the **outer frame and visual material**.
2. The Gold Light Version controls the **conversation-and-composer hierarchy inside that frame**.
3. The GREEN routes control **what the controls are and how they behave**.
4. When a pictured control conflicts with a GREEN decision, the GREEN decision wins without moving the frozen outer frame.

Consequences:

- `Focus Area`, `AI Model Preference`, the User/Developer mode switch, the static AI Translation showcase, and `Clear All` are not canonical simply because they appear in the visual layout reference.
- The center workspace contains a genuine conversation thread and composer, not a static translation demonstration.
- `Model`, `Directness`, `Technique`, `Add Context`, State Detection, `Translate & Ask`, Transparency Details, Multi-AI Actions, and compact Quick Actions are canonical.
- Left-navigation labels follow the GREEN outcome-based structure while occupying the frozen sidebar footprint.
- Right-rail cards follow the GREEN compact, customizable, one-open-at-a-time behavior while occupying the frozen right-rail footprint.

### 0.3 Meaning of “frozen”

The following are locked:

- logical canvas and coordinate system;
- header, sidebar, workspace, connector gutter, and right-rail rectangles;
- panel alignment, gutters, padding, radii, and borders;
- marble asset treatment and frosted-glass recipes;
- typography scale and control heights;
- conversation-first vertical priority;
- no whole-page scrolling on the conversation screen;
- all GREEN interaction decisions in Part 4.

The following may change only through a new numbered version of this document:

- a control’s label, options, location, action, state sequence, or persistence;
- a component’s dimensions or spacing;
- a visual token;
- a flow step;
- a keyboard command;
- the default right-rail configuration.

### 0.4 Measurement rule

The reference images communicate appearance but do not contain CSS declarations. This document converts their visual result into exact implementation values. These values are the locked implementation values; engineers must not re-estimate them from the images.

### 0.5 Main-screen space rule

The browser/app document is height-locked. It never shows a whole-page scrollbar on the conversation screen.

- The conversation thread is the only normally scrollable region.
- The full composer and `Translate & Ask` remain visible.
- Long lists scroll inside their own popup or dedicated screen.
- Compact utilities are 26 pixels high when closed.
- Compact utilities expand upward as anchored overlays; they do not increase page height.
- Only one composer utility overlay is open at a time.
- Only one right-rail card is expanded at a time.
- A second open request closes the first surface before opening the second.

---

# PART 1 — FROZEN VISUAL SPECIFICATION

## 1.1 Canonical canvas and scaling

### Logical canvas

- Width: **1600 px**
- Height: **1024 px**
- Aspect ratio: **25:16**
- Coordinate origin: top-left, `(0, 0)`
- All coordinates in this document are logical pixels on this canvas.

The supplied Light Gold Layout attachment is a cropped view of this logical canvas. The canonical canvas restores the missing right-edge space so Profile is never clipped.

### Window scaling

```text
scale = min(actual_inner_width / 1600, actual_inner_height / 1024)
```

- Scale the entire logical canvas uniformly.
- Center it in unused space.
- Do not reflow, stack, reorder, or independently resize columns.
- Minimum supported inner window: **1200 × 768 px** (`scale = 0.75`).
- Maximum automatic scale: **1.25**. Above that, center the 2000 × 1280 rendered canvas.
- Below the minimum, the window refuses further shrinking; it does not introduce page scrolling.
- Native operating-system title-bar controls sit outside the logical canvas. If a frameless shell is used, reserve separate non-content chrome; do not cover Profile.

## 1.2 Frozen outer geometry

| Region | X | Y | Width | Height | Notes |
|---|---:|---:|---:|---:|---|
| Full canvas | 0 | 0 | 1600 | 1024 | Marble fills the entire canvas. |
| Topbar | 0 | 0 | 1600 | 76 | Fixed; never scrolls. |
| Left sidebar | 32 | 84 | 214 | 928 | Fixed translucent shell. |
| Sidebar-to-workspace gutter | 246 | 84 | 56 | 928 | Marble remains visible. |
| Main workspace | 302 | 84 | 826 | 928 | Fixed-height conversation shell. |
| Connector gutter | 1128 | 84 | 124 | 928 | Marble plus conditional blue connectors. |
| Right rail | 1252 | 84 | 348 | 928 | Fixed translucent shell. |

### Outer shell properties

- Major-panel radius: **14 px**.
- Major-panel border: **1 px solid `rgba(255,255,255,0.82)`**.
- Major-panel internal highlight: **inset 0 1px 0 `rgba(255,255,255,0.80)`**.
- Major-panel shadow: **0 8px 24px `rgba(45,50,55,0.10)`**.
- The three columns never overlap.
- No control may extend into the 56-pixel left gutter.
- Only connector paths and their nodes may occupy the connector gutter.

## 1.3 Frozen topbar geometry

| Item | X | Y | Width | Height | Control class |
|---|---:|---:|---:|---:|---|
| Brand lockup | 32 | 12 | 294 | 52 | Static brand/home target |
| Quick Reference | 346 | 20 | 218 | 48 | Topbar button |
| Search | 580 | 20 | 256 | 48 | Topbar search field |
| Context slot A: Templates on Talk to AI | 848 | 20 | 176 | 48 | Contextual topbar action |
| Notifications | 1036 | 20 | 176 | 48 | Topbar popup button |
| Context slot B: Help on Talk to AI | 1224 | 20 | 96 | 48 | Contextual topbar action |
| Context slot C: Settings on Talk to AI | 1332 | 20 | 132 | 48 | Contextual topbar action |
| Profile | 1476 | 20 | 124 | 48 | Account dropdown |

Topbar horizontal gaps are **12 px** except the 16-pixel gap before Search. Context slots retain these rectangles when their labels change on another screen. When a screen needs no action in a slot, its surface becomes transparent but its space is not redistributed.

## 1.4 Frozen left-sidebar geometry

- Sidebar inner X: **44 px**.
- Sidebar inner width: **190 px**.
- Top padding: **16 px**.
- Navigation slot height: **56 px**.
- Slot-to-slot gap: **8 px**.
- Icon box: **28 × 28 px**.
- Icon-to-label gap: **14 px**.
- Row horizontal padding: **16 px**.
- Active-row radius: **10 px**.
- Main navigation slots begin at Y **100 px**.

| Slot | Y | Canonical content |
|---:|---:|---|
| 1 | 100 | Talk to AI |
| 2 | 164 | Sessions |
| 3 | 228 | Saved Tools |
| 4 | 292 | Projects |
| 5 | 356 | Insights |
| 6 | 420 | Settings |
| 7 | 484 | All Tools |
| 8 | 548 | Optional pinned tool; transparent when none is pinned |

- Lower divider: X **52**, Y **812**, width **174**, height **1**.
- Trash row: X **44**, Y **828**, width **190**, height **56**.
- Status card: X **44**, Y **912**, width **190**, height **84**.
- The space between the pinned-tool slot and lower divider remains quiet breathing space. It is not filled with additional permanent destinations.

## 1.5 Frozen main-workspace geometry

### Workspace interior

- Inner X: **318 px**.
- Inner width: **794 px**.
- Top and bottom padding: **16 px** and **14 px**.
- Vertical gap between major sections: **8 px**.

| Section | X | Y | Width | Height | Scroll behavior |
|---|---:|---:|---:|---:|---|
| Screen heading | 318 | 100 | 794 | 44 | Never scrolls |
| Conversation thread | 318 | 152 | 794 | 420 | Scrolls internally |
| Composer | 318 | 580 | 794 | 350 | Fixed; internal text field may scroll |
| Transparency Details | 318 | 938 | 393 | 26 | Overlay opens upward |
| Multi-AI Actions | 719 | 938 | 393 | 26 | Overlay opens upward |
| Quick Actions | 318 | 972 | 794 | 26 | Tray opens upward |

The conversation and composer consume **770 px** of vertical space. Compact utilities consume only **60 px including their gaps**. No utility may reduce the conversation below 320 px or the composer below 350 px.

### Conversation-thread interior

- Panel padding: **16 px**.
- Message stack gap: **8 px**.
- Message-card width: **762 px**.
- Message-card horizontal padding: **16 px**.
- Message-card vertical padding: **12 px**.
- User-message minimum height: **68 px**.
- AI-response minimum height: **124 px**.
- Message-card radius: **8 px**.
- Response-action row height: **28 px**.
- New-response indicator: **32 × 32 px**, fixed 12 px from the thread’s lower-right inside edge.

### Composer interior

| Element | X | Y | Width | Height |
|---|---:|---:|---:|---:|
| “WHAT’S ON YOUR MIND?” label | 334 | 596 | 762 | 18 |
| Message field | 334 | 622 | 762 | 122 |
| Model label | 334 | 754 | 242 | 14 |
| Directness label | 588 | 754 | 242 | 14 |
| Technique label | 842 | 754 | 254 | 14 |
| Model selector | 334 | 770 | 242 | 32 |
| Directness selector | 588 | 770 | 242 | 32 |
| Technique selector | 842 | 770 | 254 | 32 |
| Add Context | 334 | 814 | 136 | 44 |
| Translate & Ask | 854 | 814 | 242 | 44 |
| Show advanced controls bar | 334 | 866 | 372 | 26 |
| State Detection status bar | 714 | 866 | 382 | 26 |
| Reserved inline-feedback line | 334 | 900 | 762 | 26 |

Active context chips render inside the lower 24 pixels of the message-field rectangle. They never create a new row or increase composer height. The message text receives matching bottom padding while chips are present.

## 1.6 Frozen right-rail geometry

- Rail inner X: **1264 px**.
- Rail inner width: **324 px**.
- Rail top padding: **12 px**.
- Rail header: X **1264**, Y **96**, width **324**, height **32**.
- Card stack begins at Y **136 px**.
- Closed card header: **324 × 26 px**.
- Card gap: **8 px**.
- Expanded card total height: **182 px**: 26-pixel header plus 156-pixel body.
- Exactly one card may use the 182-pixel expanded budget.
- Opening a new card reduces the former card to 26 px and expands the selected card to 182 px in the same animation.
- All enabled card headers remain visible without a rail scrollbar.
- Long data uses `View All`, which opens a dedicated screen with an internally scrolling list.

Recommended default enabled cards:

1. Context Snapshot
2. Model Status
3. Active Session

Recommended default disabled cards:

1. Recent Sessions
2. Recent Activity
3. Token Usage
4. Quick Tools

Recent Sessions is optional. It is never a required center-workspace section.

## 1.7 Connector gutter

Connectors are contextual visual feedback, not permanent decoration.

- Stroke: **2 px solid `#00A8F0`**.
- Node: **8 × 8 px circle**, fill `#FFFFFF`, border **2 px `#00A8F0`**.
- Path shape: orthogonal 90-degree segments only.
- Corner radius: **8 px**.
- Default opacity: **0**.
- Active opacity: **1**.
- Transition: **160 ms ease-out**.
- A connector appears only while its related rail card or tool is selected.
- Connectors do not accept pointer or keyboard input.

## 1.8 Light-mode color tokens

### Base and text

| Token | Exact value | Use |
|---|---|---|
| `--canvas-fallback` | `#D8D5D1` | Color beneath the marble asset |
| `--canvas-softener` | `rgba(218,216,212,0.30)` | Global layer above marble |
| `--text-primary` | `#17191C` | Titles, labels, primary body text |
| `--text-secondary` | `#4D5660` | Descriptions and supporting text |
| `--text-tertiary` | `#68737E` | Metadata and timestamps |
| `--text-disabled` | `#8D969F` | Disabled text |
| `--white` | `#FFFFFF` | Highlights and inverse text |

### Gold identity

| Token | Exact value | Use |
|---|---|---|
| `--gold-primary` | `#D79A16` | Brand accent and structural emphasis |
| `--gold-bright` | `#F2A312` | Logo highlights and active gold icons |
| `--gold-dark` | `#9B6A08` | Gold text requiring contrast |
| `--gold-soft` | `rgba(215,154,22,0.12)` | Gold-selected background |
| `--gold-border` | `rgba(183,128,14,0.55)` | Gold button border |

### Electric blue interaction

| Token | Exact value | Use |
|---|---|---|
| `--blue-primary` | `#00A8F0` | Active border, connector, focus accent |
| `--blue-strong` | `#0077D9` | Active text and values |
| `--blue-soft` | `rgba(0,168,240,0.12)` | Selected/active fill |
| `--blue-hover` | `rgba(0,168,240,0.08)` | Hover fill |
| `--blue-ring` | `rgba(0,168,240,0.34)` | Focus glow |

### Semantic colors

| Token | Exact value | Use |
|---|---|---|
| `--success` | `#2EAD57` | Saved, connected, operational |
| `--success-soft` | `rgba(46,173,87,0.12)` | Success background |
| `--warning` | `#D97706` | Caution and estimates |
| `--warning-soft` | `rgba(217,119,6,0.12)` | Warning background |
| `--danger` | `#D83A3A` | Destructive action and error |
| `--danger-soft` | `rgba(216,58,58,0.10)` | Error background |
| `--purple` | `#7C3AED` | Optional technique/quality accent only |

### Glass and borders

| Token | Exact value | Use |
|---|---|---|
| `--glass-shell` | `rgba(232,234,235,0.50)` | Sidebar, workspace, right rail |
| `--glass-panel` | `rgba(239,240,240,0.56)` | Conversation, composer, rail cards |
| `--glass-control` | `rgba(246,247,247,0.62)` | Buttons, fields, compact bars |
| `--glass-elevated` | `rgba(248,249,249,0.82)` | Popups, menus, modal bodies |
| `--border-light` | `rgba(255,255,255,0.82)` | Outer/highlight border |
| `--border-silver` | `rgba(159,169,178,0.54)` | Control definition |
| `--border-muted` | `rgba(116,126,136,0.30)` | Dividers |
| `--overlay-scrim` | `rgba(55,61,67,0.18)` | Modal-only background scrim |

## 1.9 Marble and frosted-material recipe

### Marble foundation

- Use the exact muted gray-beige marble asset represented by the Light Gold Layout reference.
- `background-size: cover`.
- `background-position: center center`.
- `background-repeat: no-repeat`.
- Do not tile, stretch independently by axis, recolor, sharpen, or increase vein contrast.
- Apply `--canvas-softener` over the complete image before rendering interface glass.
- The marble remains visible through every shell and panel, but body text must never sit directly on unsoftened marble.

### Glass recipes

| Material | Fill | Blur | Saturation | Shadow |
|---|---|---:|---:|---|
| Shell glass | `--glass-shell` | 18 px | 82% | `0 8px 24px rgba(45,50,55,0.10)` |
| Panel glass | `--glass-panel` | 14 px | 86% | `0 4px 14px rgba(45,50,55,0.08)` |
| Control glass | `--glass-control` | 10 px | 90% | `0 2px 8px rgba(45,50,55,0.07)` |
| Elevated popup | `--glass-elevated` | 22 px | 88% | `0 14px 36px rgba(35,40,45,0.18)` |

Every glass surface also receives `inset 0 1px 0 rgba(255,255,255,0.78)`. No surface uses an opaque white block.

## 1.10 Typography

### Font families

- Interface: **Inter Tight**.
- Fallbacks: **Inter, Segoe UI, Arial, sans-serif**.
- Brand wordmark: use the supplied brand artwork; do not reconstruct it with a font.
- Numbers: tabular numerals enabled with `font-variant-numeric: tabular-nums`.

### Type scale

| Role | Size | Weight | Line height | Letter spacing | Case |
|---|---:|---:|---:|---:|---|
| Page title | 22 px | 600 | 28 px | 0 | Title case |
| Major section | 16 px | 600 | 22 px | 0.01 em | Title case |
| Compact section label | 12 px | 600 | 16 px | 0.045 em | Uppercase |
| Navigation label | 15 px | 500 | 20 px | 0.01 em | Title case |
| Body | 14 px | 400 | 21 px | 0 | Sentence case |
| Button | 13 px | 600 | 18 px | 0.01 em | Title case |
| Field value | 13 px | 500 | 18 px | 0 | Sentence case |
| Field label | 11 px | 600 | 14 px | 0.04 em | Uppercase |
| Metadata | 12 px | 400 | 16 px | 0 | Sentence case |
| Data value | 13 px | 600 | 18 px | 0 | As entered |
| Tooltip | 12 px | 500 | 17 px | 0 | Sentence case |

## 1.11 Iconography

- Icon family: one coherent 2-pixel outline family.
- Standard stroke: **2 px**, rounded line caps and joins.
- Navigation icon: **24 × 24 px** inside the 28-pixel icon box.
- Topbar icon: **20 × 20 px**.
- Standard button icon: **18 × 18 px**.
- Compact-bar icon: **14 × 14 px**.
- Quick Tool icon: **30 × 30 px**.
- Default icon color: `--text-primary`.
- Brand/structural icon color: `--gold-primary`.
- Active/connected icon color: `--blue-strong`.
- Status icon color: its semantic token.
- Do not mix filled, duotone, emoji, and outline icon styles.

## 1.12 Radius, spacing, and elevation scales

### Spacing scale

| Token | Value |
|---|---:|
| `space-1` | 4 px |
| `space-2` | 8 px |
| `space-3` | 12 px |
| `space-4` | 16 px |
| `space-5` | 20 px |
| `space-6` | 24 px |
| `space-8` | 32 px |

No unlisted spacing value is used except the frozen outer gutters and coordinates in Sections 1.2–1.6.

### Radius scale

| Token | Value | Use |
|---|---:|---|
| `radius-xs` | 4 px | Chips, small tags |
| `radius-sm` | 6 px | Compact bars, small buttons |
| `radius-md` | 8 px | Fields, message cards, standard buttons |
| `radius-lg` | 10 px | Active navigation, popups |
| `radius-xl` | 14 px | Major shells |
| `radius-pill` | 9999 px | Status dots and count badges only |

## 1.13 Exact control classes

| Class | Height | Horizontal padding | Radius | Border |
|---|---:|---:|---:|---|
| Primary action | 44 px | 18 px | 8 px | 1 px `--gold-border` |
| Standard button | 32 px | 12 px | 8 px | 1 px `--border-silver` |
| Topbar button | 48 px | 16 px | 10 px | 1 px `--border-light` plus silver outer definition |
| Icon button | 40 × 40 px | 0 | 8 px | 1 px `--border-silver` |
| Select field | 32 px | 10 px | 6 px | 1 px `--border-silver` |
| Text field | As specified | 12 px | 8 px | 1 px `--border-silver` |
| Compact utility bar | 26 px | 10 px | 6 px | 1 px `--border-silver` |
| Navigation row | 56 px | 16 px | 10 px active; 0 px idle | 1 px transparent idle |
| Rail header | 26 px | 10 px | 6 px | 1 px `--border-silver` |
| Context chip | 24 px | 8 px | 4 px | 1 px `--border-silver` |
| Count badge | 20 px minimum | 6 px | 9999 px | 1 px `rgba(0,119,217,0.30)` |

## 1.14 Universal visual states

| State | Exact visual result |
|---|---|
| Idle | Class fill and border from Sections 1.8 and 1.13; text `--text-primary`. |
| Hover | Add `--blue-hover`; border becomes `rgba(0,168,240,0.42)`; transition 120 ms ease-out. |
| Keyboard focus | 2-pixel `--blue-primary` outline with 2-pixel offset and `0 0 0 4px --blue-ring`; hover may coexist. |
| Pressed | Fill `rgba(0,168,240,0.15)`; translate Y by 1 px for 80 ms. |
| Selected/open | Fill `--blue-soft`; border `--blue-primary`; icon/text `--blue-strong`; chevron points up. |
| Gold primary | Fill `rgba(215,154,22,0.10)`; border `--gold-border`; icon `--gold-dark`. Hover raises fill to 0.16 alpha. |
| Disabled | Opacity 0.42; no shadow; cursor not-allowed; tooltip explains the unmet condition. |
| Loading | Preserve dimensions; disable repeat activation; replace leading icon with 16-pixel spinner; show present-tense label. |
| Success | Restore idle state; show adjacent success mark for 1600 ms and a toast for 2400 ms when confirmation would otherwise be missed. |
| Error | Border `--danger`; background `--danger-soft`; plain-language message appears beside or below the control without erasing input. |

## 1.15 Motion

| Motion | Duration | Easing | Rule |
|---|---:|---|---|
| Hover/focus color | 120 ms | ease-out | No movement except pressed state |
| Popup/menu | 140 ms | cubic-bezier(0.2,0,0,1) | Fade plus 4-pixel upward movement |
| Accordion swap | 160 ms | cubic-bezier(0.2,0,0,1) | Old body closes while new body opens; total rail height is constant |
| Modal | 180 ms | cubic-bezier(0.2,0,0,1) | Scrim fade plus 8-pixel body movement |
| Connector | 160 ms | ease-out | Opacity only |
| Spinner | 900 ms per rotation | linear | Continuous until completion |
| Toast | 160 ms in, 160 ms out | ease-out/ease-in | No spring or bounce |

When Reduced Motion is on, all durations become **0 ms** except the loading spinner, which becomes a static progress glyph with changing text.

---

# PART 2 — COMPLETE BEHAVIORAL SPECIFICATION

## 2.0 Global interaction contract

These rules apply to every control unless a component entry explicitly overrides one.

1. **Single click** performs the named action once.
2. **Double click has no separate action anywhere in the application.** Two clicks inside 300 ms are debounced into one activation for buttons and menu items.
3. **Enter** activates a focused button, link, menu item, or single-select option.
4. **Space** activates a focused button or toggles a focused checkbox.
5. **Escape** closes the topmost non-destructive popup, menu, drawer, or modal and restores focus to its trigger.
6. Clicking outside closes a non-destructive popup if it contains no unsaved typed text.
7. A popup containing unsaved typed text asks `Discard changes?` before closing.
8. A destructive action always names the item and consequence, uses the red visual state, and requires confirmation.
9. Loading controls cannot be activated again.
10. Errors preserve the user’s message, selections, context, and current screen.
11. Tab order is Topbar → Left navigation → Main workspace → Right rail.
12. Tooltips appear after 500 ms of pointer hover or immediately on keyboard focus, use a maximum width of 260 px, and explain what changes—not merely repeat the label.
13. Menus and popups remain inside the 1600 × 1024 logical canvas.
14. A menu that would cross an edge flips alignment; it does not change size or create page scrolling.
15. All remembered choices state their persistence scope: request, session, or global.

## 2.1 Topbar controls

### TB-01 — Divergence.AI brand lockup

- **Location/size:** `(32,12)`, `294 × 52 px`.
- **Type:** single-click home control containing the supplied gold logo, wordmark, and `ADHD-to-AI Translator` subtitle.
- **Idle:** transparent surface; artwork is not recolored.
- **Hover/focus:** `--blue-hover` surface with the universal focus ring; tooltip `Return to Talk to AI`.
- **Single click:** opens Talk to AI and restores the active session. It never clears the draft or conversation.
- **Double click:** same as one click.
- **Keyboard:** Enter/Space activates.
- **Disabled/loading:** never disabled; no loading state.
- **Persistence:** current session and draft remain unchanged.

### TB-02 — Quick Reference

- **Location/size:** `(346,20)`, `218 × 48 px`.
- **Type:** drawer button.
- **Single click:** opens the Quick Reference drawer in the right-rail rectangle without leaving the current task.
- **Contents:** contextual topic title; `What this control changes`; one example; `Why this was suggested` when a recommendation exists; Back; Search help.
- **Selected state:** blue selected/open state; drawer replaces rail-card bodies while preserving their order and state.
- **Close:** click again, Back, Escape, or drawer Close.
- **Keyboard:** `?` opens it unless focus is in a text field; Enter/Space activates.
- **Hover tooltip:** `Explain the current screen or control`.
- **Disabled/loading:** never disabled; search inside the drawer uses the standard loading state.
- **Persistence:** returns to the same rail card and scroll position when closed.

### TB-03 — Search

- **Location/size:** `(580,20)`, `256 × 48 px`.
- **Type:** global search field.
- **Idle:** search icon, `Search` placeholder.
- **Single click/focus:** caret appears; a `520 × 400 px` results popup anchors at X 580, Y 72.
- **Typing:** debounced by 150 ms; results group Sessions, Saved Tools, Projects, and Settings.
- **Result selection:** opens the highlighted item; the prior screen is retained in Back history.
- **Empty state:** `No matches. Try a shorter phrase.` plus links to All Tools and Quick Reference.
- **Loading:** 16-pixel spinner replaces the search icon; typed text remains visible.
- **Error:** inline message `Search is unavailable. Your current work is safe.` with Retry.
- **Close:** Enter on a result, Escape, or click outside. Closing restores the previous focus.
- **Keyboard:** `Ctrl+K` or `Cmd+K` focuses; Up/Down moves; Enter opens; Escape closes.
- **Double click:** no extra behavior.
- **Persistence:** recent searches are stored locally; the current query is cleared when its result opens.

### TB-04 — Context slot A / Templates on Talk to AI

- **Location/size:** `(848,20)`, `176 × 48 px`.
- **Type:** contextual single-click page action.
- **Talk to AI label/action:** `Templates`; opens Saved Tools with Templates selected.
- **Other screens:** may become that screen’s primary non-destructive page action, such as `New Template`.
- **No action available:** transparent, unfocusable placeholder retains the rectangle.
- **Hover tooltip:** states the destination or exact action.
- **States:** Idle → Hover/Focus → Pressed → destination; Disabled only when the current operation must finish first.
- **Persistence:** returning restores the active conversation and draft.

### TB-05 — Notifications

- **Location/size:** `(1036,20)`, `176 × 48 px`.
- **Type:** popup button with unread count.
- **Single click:** opens a `360 × 420 px` popup aligned to the button’s right edge.
- **Contents:** unread first; each row has type, plain-language summary, time, and related destination; `Mark all read`; `Notification settings`.
- **Selecting a notification:** marks that item read and opens the related screen, session, or setting.
- **Selected state:** open styling; unread badge remains until the item is marked read.
- **Empty state:** `You’re caught up.`
- **Close:** click again, Escape, or outside click.
- **Loading/error:** popup retains its shell; loading rows use three static skeleton lines; failure shows Retry.
- **Keyboard:** Enter/Space opens; arrow keys move; Enter selects.
- **Persistence:** read state is global.

### TB-06 — Context slot B / Help on Talk to AI

- **Location/size:** `(1224,20)`, `96 × 48 px`.
- **Type:** contextual help button.
- **Single click:** opens Quick Reference focused on the current screen.
- **Other screens:** may display a context-specific non-destructive action while the `?` keyboard command still opens help.
- **Hover tooltip:** `Explain this screen`.
- **Close/states:** same as Quick Reference.

### TB-07 — Context slot C / Settings on Talk to AI

- **Location/size:** `(1332,20)`, `132 × 48 px`.
- **Type:** contextual destination button.
- **Single click on Talk to AI:** opens Settings at the last-used Settings section.
- **Other screens:** may display a screen-specific action in the same rectangle.
- **Close:** Back returns to the exact conversation position.
- **States:** Idle → Hover/Focus → Pressed → destination; loading is used only while reading stored settings.

### TB-08 — Profile

- **Location/size:** `(1476,20)`, `124 × 48 px`.
- **Type:** account dropdown showing avatar and first name or `Profile`.
- **Single click:** opens a `240 × auto px` menu aligned to the right edge.
- **Options:** Profile; Account and plan; Keyboard shortcuts; Sign out.
- **Selection consequences:** each opens its named screen; Sign out opens confirmation and never deletes local work.
- **Close:** click again, Escape, or outside click.
- **Loading/error:** account data may show a spinner beside the name; local Talk to AI remains usable if remote account details fail.
- **Persistence:** last account state is global.

## 2.2 Left navigation

All rows use the frozen 56-pixel slot. Selecting a destination changes only the main workspace. The topbar and right rail remain fixed. The selected row uses the blue selected state.

| ID | Control | Type and single-click result | Additional behavior |
|---|---|---|---|
| LN-01 | Talk to AI | Destination; opens/restores the active conversation. | Default selected item. If no session exists, opens a blank recovery-saved draft. |
| LN-02 | Sessions | Destination; opens searchable Active, Saved, Archived, and Trash tabs. | Selecting a session loads it into Talk to AI. Lists scroll internally. |
| LN-03 | Saved Tools | Destination; opens Templates and Saved Prompts tabs. | Remembers the last tab globally. |
| LN-04 | Projects | Destination; opens project list with Tasks, Resources, and Integrations inside each project. | Remembers the last open project and tab. |
| LN-05 | Insights | Destination; opens Overview, Usage, Activity, and Communication Patterns. | No separate Dashboard destination is created. |
| LN-06 | Settings | Destination; opens Appearance, AI Behavior, Right Rail, Notifications, Data, and Account sections. | Remembers last section globally. |
| LN-07 | All Tools | Searchable popup. | Typing filters all tools; selecting opens it; Pin adds it to LN-08. |
| LN-08 | Pinned tool | Optional destination. | Hidden/transparent when none is pinned. Pin menu: Move up, Move down, Unpin. |
| LN-09 | Trash | Destination; opens deleted sessions, templates, prompts, and projects grouped by type. | Restore is immediate; permanent delete requires typed or second-click confirmation. |
| LN-10 | System Status | Status indicator plus details popup. | Green when normal. Click shows service, model, sync, and local-storage status. Escape/outside closes. |

### Shared navigation states

- **Hover:** blue hover fill; label and icon remain black until selected.
- **Focus:** universal focus ring confined inside the row.
- **Selected:** blue soft fill, blue border, blue icon/text.
- **Disabled:** used only for a destination unavailable under current account permissions; tooltip explains why.
- **Loading:** a 14-pixel spinner appears after the icon while the destination loads; the prior workspace remains until ready.
- **Error:** row returns to idle and the current workspace shows a non-destructive retry banner.
- **Double click:** no additional behavior.

## 2.3 Conversation workspace

### CW-01 — Screen heading

- **Location/size:** `(318,100)`, `794 × 44 px`.
- **Type:** static page heading.
- **Content:** `TALK TO AI` plus `Turn what you mean into a request an AI can understand.`
- **Interaction:** none. It is announced as the page heading to assistive technology.

### CW-02 — Conversation thread

- **Location/size:** `(318,152)`, `794 × 420 px`.
- **Type:** internally scrollable message history.
- **Default:** newest message at the bottom.
- **Scroll:** only this pane scrolls; scrolling upward never moves the composer, topbar, or rails.
- **New response while reading older content:** a nonblocking `New response` button appears at the lower-right. Clicking jumps to the newest message.
- **Empty state:** one short prompt: `What would you like help communicating?` plus three optional example starters. No full tutorial.
- **Loading:** a single AI message card shows `Thinking…` with a static or rotating progress glyph according to Reduced Motion.
- **Error:** failed response card preserves the user message and offers Retry and Edit request.
- **Keyboard:** Page Up/Down and Home/End operate only when the thread has focus.

### CW-03 — User message card

- **Type:** message card inside CW-02.
- **Default content:** avatar, `You`, timestamp, message text, and context-count badge when applicable.
- **Hover/focus actions:** Edit; Copy; Add to Saved Prompts.
- **Edit:** replaces the composer text with a copy, preserving the original message. Sending creates a response branch rather than overwriting history.
- **Copy:** copies plain text and shows `Copied` for 1600 ms.
- **Add to Saved Prompts:** opens a small editor with Name, Prompt text, optional Tags, Save, and Cancel.
- **Double click:** no action; text selection remains possible.
- **Error:** a message that failed to send remains editable and shows Retry.

### CW-04 — AI response card

- **Type:** response card inside CW-02.
- **Default content:** Divergence.AI identity, confidence sentence when available, response text, source links when used, and action row.
- **Action row:** Copy; Refine; Rating; Why this worked; Export; More.
- **Streaming state:** content appears in place; Stop is available; composer remains visible.
- **Stopped state:** partial content is retained and labeled `Stopped`; Continue and Retry are available.
- **Error state:** error text is plain-language; Retry uses the same prepared request unless the user edits it.
- **Selected text:** a contextual Copy control may appear; it never replaces the permanent action row.

### CW-05 — Response branch switcher

- **Type:** previous/next control under an edited user message or refined AI response.
- **Visibility:** hidden when only one version exists.
- **Content:** previous arrow, `current / total`, next arrow.
- **Single click:** changes the displayed branch without deleting any branch.
- **Keyboard:** Left/Right arrows when focused.
- **Loading:** selected branch card shows a local loading glyph; the branch count remains visible.
- **Persistence:** current branch is remembered per session.

### CW-06 — New-response indicator

- **Location:** 12 px from CW-02 lower-right inside edge.
- **Size/type:** `32 × 32 px` icon button.
- **Visibility:** only when newer content exists below the current thread scroll position.
- **Single click:** smooth-scrolls CW-02 to the newest message in 160 ms; Reduced Motion jumps immediately.
- **Disabled:** hidden rather than disabled when no newer content exists.

## 2.4 Main message composer

### MC-01 — Composer dock

- **Location/size:** `(318,580)`, `794 × 350 px`.
- **Type:** persistent fixed-budget input panel.
- **Default:** empty or restored recovery draft; all controls remain inside the fixed rectangle.
- **Draft behavior:** every text, selection, and context change is recovery-saved after 500 ms of inactivity.
- **Overflow:** message text scrolls inside MC-02; popups and recommendation cards open upward over the lower conversation thread.
- **Disabled:** the entire composer is never disabled. Only the specific action currently processing is disabled.
- **Error:** the draft remains available and editable.

### MC-02 — What’s on your mind?

- **Location/size:** field `(334,622)`, `762 × 122 px`; label `(334,596)`, `762 × 18 px`.
- **Type:** multiline text field.
- **Placeholder:** `Type how you actually think…`
- **Maximum:** 20,000 Unicode characters. The visible counter uses `current / 20,000`.
- **Typing:** recovery-saves automatically; the field grows only inside its 122-pixel rectangle, then scrolls internally.
- **Enter:** inserts a new line.
- **Ctrl+Enter / Cmd+Enter:** activates Translate & Ask.
- **Paste:** preserves plain text; rich formatting is reduced to headings, lists, links, and paragraphs.
- **Active context chips:** occupy the field’s lower 24 pixels; text receives 32 pixels of bottom padding.
- **Hover:** no tooltip; pointer becomes text cursor.
- **Focus:** universal focus ring.
- **Disabled:** never disabled.
- **Error:** validation appears on MC-09’s reserved feedback line; text remains untouched.

### MC-03 — Model

- **Location/size:** `(334,770)`, `242 × 32 px`.
- **Type:** single-select dropdown; label `MODEL`.
- **Initial default:** `Auto — recommended`.
- **Options, in order:**

  1. `Auto — recommended`: chooses the best available model for the task.
  2. `Haiku — fastest`: shortest wait and lowest depth.
  3. `Sonnet — balanced`: balanced speed and analysis.
  4. `Opus — deepest`: maximum depth and analysis.

- **Single click:** opens a `242 × 188 px` anchored option list above the field when space below is unavailable.
- **Selection:** applies immediately to the current session and closes the list.
- **Unavailable model:** remains visible but disabled with the reason and suggested available alternative.
- **Loading:** selected model remains readable; status glyph appears on its right.
- **Keyboard:** Up/Down moves; Enter selects; Escape closes unchanged.
- **Double click:** no additional behavior.
- **Persistence:** session. Settings can define the initial value for new sessions.

### MC-04 — Directness

- **Location/size:** `(588,770)`, `242 × 32 px`.
- **Type:** single-select radio dropdown; label `DIRECTNESS`.
- **Initial default:** `Balanced — clear and human`.
- **Popup size:** `300 × 188 px`, aligned to the field’s left edge and opening upward.
- **Options:**

  1. `Supportive — gentle guidance`; preview: `Encouraging, empathetic tone.`
  2. `Balanced — clear and human`; preview: `Straightforward, natural language.`
  3. `Blunt — brief and direct`; preview: `Concise, no extra softening.`

- **Single click:** opens the popup; the current choice is checked.
- **Selection:** applies immediately to the current request and closes.
- **State Detection:** may recommend a different choice but cannot apply it silently.
- **Keyboard:** Up/Down, Enter, Escape.
- **Hover tooltip:** the selected option’s preview sentence.
- **Persistence:** session; Settings controls the new-session default.
- **Disabled:** only while the request is actively sending.

### MC-05 — Technique

- **Location/size:** `(842,770)`, `254 × 32 px`.
- **Type:** recommendation-first checkbox popup; label `TECHNIQUE`.
- **Collapsed text:** recommended technique name, or `N techniques` when several are selected.
- **Popup size:** `320 × 456 px`; opens upward and may scroll internally without moving the page.
- **Recommendation block:** shows `Recommended: [technique]` and one sentence explaining why.
- **Auto recommend toggle:** on by default. It updates the recommendation but never removes manually checked techniques.
- **Selection limit:** up to four techniques. A fifth selection is blocked with `Choose up to 4. Remove one to add another.`
- **Options, in order:**

  1. `Socratic` — guide with questions.
  2. `Quote-First` — begin with relevant supplied quotations.
  3. `Verify` — fact-check and identify uncertainty.
  4. `Examples` — demonstrate with concrete examples.
  5. `Simplify` — use easier language without losing meaning.
  6. `Detailed` — provide comprehensive coverage.
  7. `Step-by-step` — divide the answer into clear steps.
  8. `Comparative` — compare alternatives directly.
  9. `Metaphor` — explain through analogies or metaphors.
  10. `Role-Prime` — answer from a named useful perspective.

- **Apply:** saves checked choices to the session and closes.
- **Cancel/Escape/outside:** restores the selections that existed when opened.
- **Keyboard:** arrows move; Space toggles; Enter on Apply commits.
- **Loading:** recommendation block shows `Finding the best technique…`; the checklist remains usable.
- **Error:** recommendation block shows `Recommendation unavailable`; manual selection remains available.
- **Persistence:** session; Settings controls whether Auto recommend starts on in new sessions.

### MC-06 — Add Context

- **Location/size:** `(334,814)`, `136 × 44 px`.
- **Type:** single-click popup button.
- **Idle label/icon:** `Add Context` plus add/document icon.
- **Popup size:** `240 × 228 px`, anchored to the button and opening upward.
- **Options:** File; Paste Text; URL; Variable; Manage All.
- **Single click:** opens the popup; choosing an option starts the corresponding AC flow in Section 2.5.
- **Selected state:** gold primary styling while the popup is open.
- **Disabled:** only while a selected file is being attached; existing message editing remains available.
- **Loading:** label becomes `Adding…`; progress appears on the related context chip.
- **Error:** failed item remains as an error chip with Retry and Remove.
- **Keyboard:** Enter/Space opens; arrows move; Enter selects; Escape closes.
- **Persistence:** successfully added context belongs to the current draft/session until removed.

### MC-07 — Active context chips

- **Location:** inside the lower 24 pixels of MC-02.
- **Type:** compact removable chips.
- **Visibility:** hidden when no context is active.
- **Display limit:** first two chips plus `+N` when more exist.
- **Single click on named chip:** opens the context preview popup.
- **Single click on X:** removes only that item after immediately recovery-saving the draft.
- **Single click on +N:** opens Manage All.
- **Loading:** chip shows a 12-pixel progress glyph and percentage when supplied.
- **Error:** red outline with Retry and Remove available in preview.
- **Keyboard:** Tab reaches each visible chip; Enter previews; Delete/Backspace removes after confirmation if upload completed.
- **Persistence:** session until removed.

### MC-08 — Translate & Ask

- **Location/size:** `(854,814)`, `242 × 44 px`.
- **Type:** primary single-click action.
- **Idle:** gold primary style; brain/translation icon; label `Translate & Ask`.
- **Disabled conditions:** message is empty; validation error exists; request is already preparing or sending.
- **Disabled tooltip:** names the exact unmet condition, such as `Type a message first`.
- **Single click sequence:** validate → save recovery → run State Detection → resolve any recommendation → prepare AI-ready request → either show Review or send automatically according to the remembered preference.
- **Loading labels:** `Checking state…`, then `Preparing…`, then `Sending…`. The button width never changes.
- **Success:** message enters the thread; field clears only after the send is accepted; context remains if marked reusable, otherwise clears with the sent draft.
- **Error:** message, settings, and context remain; label returns to `Translate & Ask`; inline Retry appears.
- **Keyboard:** Ctrl+Enter/Cmd+Enter; focused Enter/Space.
- **Double click:** debounced to one submission.
- **Persistence:** Review-first preference is global; all per-request selections are recorded in Transparency Details.

### MC-09 — Show advanced controls

- **Location/size:** `(334,866)`, `372 × 26 px`.
- **Type:** compact utility bar.
- **Default:** collapsed; label, sliders icon, and downward chevron.
- **Single click:** opens a `372 × 188 px` anchored panel upward over the lower conversation thread.
- **Contents:** Methodology; Review before sending; `Set as defaults` link.
- **Single-open rule:** opening it closes State Detection, Transparency Details, Multi-AI Actions, or Quick Actions overlays.
- **Close:** click again, Escape, or outside; selected values remain.
- **Selected:** blue selected/open state; chevron points up.
- **Persistence:** selected values follow their component rules.

### MC-10 — Methodology

- **Location:** inside MC-09 advanced panel.
- **Type:** single-select dropdown.
- **Default:** `Standard`.
- **Options:**

  1. `Standard` — answer the prepared request normally.
  2. `3-State` — separate current situation, desired state, and transition path.

- **Contextual suggestion:** when complexity or uncertainty makes 3-State useful, a nonblocking recommendation chip explains why and offers Accept or Dismiss.
- **Selection:** applies to the current session; closes the dropdown.
- **Pin:** `Pin to composer` places a compact methodology indicator inside MC-09 without creating another main-row dropdown.
- **Persistence:** session; Settings controls new-session default and pin state.

### MC-11 — Review before sending

- **Location:** inside MC-09 advanced panel.
- **Type:** two-choice radio setting.
- **Initial default for a new installation:** `Review first`.
- **Options:**

  1. `Review first` — pause on an editable AI-ready translation.
  2. `Send automatically` — send after State Detection is resolved.

- **Selection:** remembered globally after the user checks `Remember this choice`; otherwise session-only.
- **Per-request override:** the Review screen can choose `Send this and use automatically next time`.

### MC-12 — State Detection status bar

- **Location/size:** `(714,866)`, `382 × 26 px`.
- **Type:** compact status/overlay trigger.
- **Before first send:** `State Detection — runs when you send` in tertiary text.
- **Checking:** `Checking state…` plus progress glyph.
- **No recommendation:** `State checked — no change suggested` plus downward chevron.
- **Recommendation available:** warning dot plus `A response adjustment may help`.
- **After response:** `State used` plus chevron.
- **Single click after a check:** opens details or the pending recommendation upward in a fixed `382 × 206 px` panel.
- **Close:** click again, Escape, or outside.
- **Persistence:** the result is recorded for that request; only an explicitly remembered correction affects future suggestions.

### MC-13 — Reserved inline-feedback line

- **Location/size:** `(334,900)`, `762 × 26 px`.
- **Type:** noninteractive status region.
- **Idle:** transparent and empty.
- **Use:** validation, recovery-save confirmation, request error, or one concise next-step message.
- **Priority:** error > warning > success > informational.
- **Constraint:** one message at a time; longer explanations open Quick Reference.

## 2.5 Add Context flows and surfaces

### AC-01 — File

- **Trigger:** choose File in MC-06.
- **Surface:** operating-system file picker.
- **Supported types shown before selection:** PDF, DOCX, TXT, MD, JSON, CSV, common image formats, and any provider-supported file type.
- **Selection result:** creates a loading context chip immediately; upload/read progress appears on that chip.
- **Success:** chip changes to normal; its preview contains filename, type, size, extracted-text summary, and inclusion state.
- **Failure:** chip turns red and offers Retry and Remove; the draft is preserved.
- **Cancel:** returns to the composer unchanged.
- **Multiple files:** permitted; each receives its own chip; Manage All controls inclusion.

### AC-02 — Paste Text

- **Trigger:** choose Paste Text.
- **Surface:** `520 × 420 px` modal with Name, large text field, Add, and Cancel.
- **Validation:** text is required; generated default name uses its first meaningful phrase.
- **Add:** creates one named context chip and closes.
- **Cancel/Escape:** closes without saving; unsaved typed text requires discard confirmation.
- **Error:** remains in the modal with text preserved.

### AC-03 — URL

- **Trigger:** choose URL.
- **Surface:** `520 × 300 px` modal with URL field, Preview, Add, and Cancel.
- **Preview:** retrieves and displays page title, domain, readable-text summary, and access status.
- **Add:** enabled only after a successful preview or explicit `Add without preview` confirmation when retrieval is blocked.
- **Success:** creates a URL context chip.
- **Failure:** explains the cause and offers Retry or Add without preview when safe.
- **Cancel/Escape:** closes unchanged.

### AC-04 — Variable

- **Trigger:** choose Variable.
- **Surface:** `520 × 420 px` searchable checkbox modal.
- **Contents:** search; saved variable name; value preview; last updated; Create Variable; Add Selected; Cancel.
- **Selection:** one or more variables may be checked.
- **Add Selected:** creates/updates chips and closes.
- **Create Variable:** opens an editor with Name, Value, optional Description, Save, and Cancel; Save returns to the checked list.
- **Delete:** available only in the variable manager and requires confirmation.
- **Cancel:** preserves the prior active context.

### AC-05 — Manage All

- **Trigger:** choose Manage All or click the `+N` chip.
- **Surface:** `680 × 560 px` context manager modal.
- **Columns:** Included checkbox; Name; Source type; Size; Status; Remove.
- **Actions:** include/exclude without deleting; Preview; Retry failed; Remove; Add more; Done.
- **Done:** applies inclusion changes and closes.
- **Remove:** removes from this session after confirmation; it does not delete a saved variable or source file.
- **Overflow:** list scrolls internally; modal and page stay fixed.

### AC-06 — Context preview

- **Trigger:** click a visible context chip or a name in Manage All/Context Snapshot.
- **Surface:** `420 × 360 px` anchored popup.
- **Contents:** source name; type; size; extracted summary; inclusion state; Open source when available; Include/Exclude; Remove.
- **Close:** Escape, outside click, or Close.
- **Selection consequences:** Include/Exclude updates the chip and Context Snapshot immediately; Remove deletes only the session reference.

### AC-07 — Context Snapshot rail card

- **Type:** right-rail accordion card.
- **Closed:** 26-pixel header with active-item count.
- **Expanded:** shows up to four active names and total count; a name opens AC-06; `Manage context` opens AC-05.
- **Update:** refreshes immediately after add, remove, include, or exclude.
- **View All:** opens the dedicated Context screen when more than four items exist.

## 2.6 State Detection and send routing

### SD-01 — Detection trigger

- **Start:** MC-08 is activated and validation passes.
- **Timing:** after recovery-save and before AI-ready translation preparation.
- **Input:** current message and explicit session settings. It does not monitor every keystroke.
- **Dimensions:** Emotion; RSD sensitivity signal; Interest; Cognitive Mode.
- **Privacy:** results are request-scoped unless the user explicitly remembers a correction.
- **No silent behavior change:** a proposed change requires the user’s choice.

### SD-02 — Detectable values

| Dimension | Allowed values |
|---|---|
| Emotion | Neutral; Calm; Focused; Frustrated; Overwhelmed; Anxious; Low-energy; Excited |
| RSD sensitivity signal | Low; Medium; High |
| Interest | Low; Medium; High |
| Cognitive Mode | Exploratory; Analytical; Creative; Decision; Execution |

These are communication-support signals, not medical diagnoses.

### SD-03 — No change recommended

- **Immediate result:** sending continues according to Review-before-sending preference.
- **Visual:** MC-12 shows `State checked — no change suggested`.
- **Expanded details:** detected values, short plain-language reason, and Correct.
- **Correct:** uses SD-07; a correction may be remembered only by explicit checkbox.

### SD-04 — Change recommended panel

- **Trigger:** detection finds a response adjustment that may improve communication.
- **Surface:** `382 × 206 px` anchored above MC-12, over the lower conversation area.
- **Sending:** paused until one of the four actions is chosen.
- **Contents:** `State change suggested`; four detected chips; one-sentence reason; Accept & Continue; Keep Current & Continue; Correct; Dismiss; optional `Remember for a similar situation` checkbox.
- **No layout shift:** composer, compact bars, and page height do not move.

### SD-05 — Accept & Continue

- **Type:** primary single-click action.
- **Result:** applies the explicitly stated adjustment to this request, records it in Transparency Details, and continues to Review or send.
- **Remember checked:** stores the same preference only for sufficiently similar future signals.
- **Loading:** `Applying…`; repeat clicks blocked.

### SD-06 — Keep Current & Continue

- **Type:** secondary single-click action.
- **Result:** keeps current Model, Directness, Technique, and Methodology, records that the recommendation was declined, and continues.
- **Persistence:** no future change unless Remember was explicitly selected.

### SD-07 — Correct

- **Type:** edit popup within the State panel.
- **Contents:** the four dimensions as plain-language dropdowns using the allowed values in SD-02; Save & Continue; Cancel.
- **Save & Continue:** uses the corrected state for this request and continues.
- **Cancel:** returns to the unchanged recommendation panel.
- **Remember:** optional and off by default.

### SD-08 — Dismiss

- **Type:** close action in the recommendation panel’s upper-right.
- **Result:** equivalent to Keep Current & Continue for this request.
- **Persistence:** dismissal is not learned unless `Remember for a similar situation` was checked.

### SD-09 — Detection failure

- **Visual:** MC-13 says `State Detection could not run. Continue with current settings?`
- **Actions:** Continue; Retry; Cancel send.
- **Continue:** uses current explicit settings and records detection as unavailable.
- **Cancel:** returns to the editable composer without losing anything.

## 2.7 Review, transparency, and Multi-AI

### RV-01 — AI-ready translation review

- **Trigger:** MC-11 is `Review first` and State Detection has been resolved.
- **Surface:** replaces MC-02’s editable field inside the same composer rectangle; no page geometry changes.
- **Contents:** `AI-ready request`; editable translated request; Show changes; Send to AI; Back; Cancel; `Send automatically next time` checkbox.
- **Edit:** changes only the prepared request; the original draft remains recoverable.
- **Show changes:** toggles inline additions, removals, and clarifications using accessible text labels as well as color.
- **Send to AI:** submits the edited prepared request; original and prepared versions are recorded in Transparency Details.
- **Back:** returns to the original composer with the prepared version retained for re-entry.
- **Cancel:** returns to the original composer and cancels sending.
- **Loading/error:** same as MC-08; content remains editable after failure.

### RV-02 — Transparency Details

- **Location/size closed:** `(318,938)`, `393 × 26 px`.
- **Type:** compact utility bar.
- **Single click:** opens a `393 × 270 px` panel upward.
- **Contents:** AI-ready request; State used; Model; Directness; Techniques; Methodology; routing reason; confidence; Copy.
- **One-open rule:** opening closes Multi-AI, Advanced controls, State Detection, and Quick Actions overlays.
- **Copy:** copies the complete transparency record as plain text.
- **Close:** click again, Escape, or outside.
- **Empty state:** before a request, `Details will appear after you send.`
- **Persistence:** request record stored with the session.

### RV-03 — Why this worked

- **Location/type:** link-style response action under each AI response.
- **Single click:** opens RV-02 focused on a plain-language explanation of the choices that shaped that response.
- **Contents:** no private chain-of-thought; it summarizes the prepared request, explicit controls, state adaptation, and routing reason.
- **Close:** same as RV-02.

### MA-01 — Multi-AI Actions

- **Location/size closed:** `(719,938)`, `393 × 26 px`.
- **Type:** compact utility bar.
- **Single click:** opens a `393 × 260 px` panel upward.
- **Options:** Debate; Consensus; Synthesis.
- **Each option shows:** one-sentence result description; recommended participating models; estimated time; estimated usage when available.
- **One-open rule:** opening closes RV-02 and all other utility overlays.
- **Unavailable state:** option remains visible but disabled with the reason, such as fewer than two models available.
- **Close:** click again, Escape, or outside.

### MA-02 — Debate

- **Type:** single-click action with confirmation popup.
- **Purpose:** models debate different perspectives; the final debate is added as one response branch.
- **Confirmation contents:** models; estimated time; estimated usage; Start; Cancel; `Change models` link.
- **Start:** adds a progress card to the conversation; Cancel before completion stops remaining calls and retains completed material.
- **Result:** appended to the current conversation; sources and disagreements are labeled.

### MA-03 — Consensus

- **Type:** single-click action with confirmation popup.
- **Purpose:** models produce agreements, disagreements, and a shared conclusion.
- **Start/cancel/loading:** same as MA-02.
- **Result:** added to the conversation as a new response branch, not a replacement.

### MA-04 — Synthesis

- **Type:** single-click action with confirmation popup.
- **Purpose:** combines selected existing responses into one answer.
- **Confirmation contents:** selectable response list; models; estimate; Start; Cancel.
- **Validation:** at least two responses must be selected.
- **Result:** appended without deleting source responses.

## 2.8 Quick Actions and session protection

### QA-01 — Quick Actions bar

- **Location/size closed:** `(318,972)`, `794 × 26 px`.
- **Type:** compact utility bar.
- **Default:** collapsed; label `Quick Actions`; Resume-available dot when unfinished work exists; downward chevron.
- **Single click:** opens a `794 × 64 px` horizontal tray upward over the conversation/composer boundary.
- **Visible actions:** New Session; Templates; Saved Prompts; Resume when applicable; More.
- **Never contains:** Clear All.
- **One-open rule:** opening closes every other workspace overlay.
- **Close:** click again, Escape, or outside.

### QA-02 — New Session

- **Type/size:** standard button, 132 × 40 px inside QA-01 tray.
- **Single click:** recovery-saves current work, creates a blank session, and focuses MC-02.
- **Toast:** `New session started` plus Undo for 10 seconds.
- **Undo:** returns to the prior session and draft.
- **Loading/error:** the old session remains visible until the new session exists; failure does not clear anything.
- **Keyboard shortcut:** Ctrl+Shift+N / Cmd+Shift+N.

### QA-03 — Templates

- **Type/size:** standard button, 132 × 40 px.
- **Single click:** opens a `460 × 420 px` searchable selection popup with Recent and Favorites first.
- **Selecting a template:** opens Preview with Use, Edit copy, and Cancel.
- **Use:** inserts the template structure into MC-02 without sending.
- **Cancel:** leaves the draft unchanged.
- **Persistence:** last Templates tab is global; temporary search is not remembered.

### QA-04 — Saved Prompts

- **Type/size:** standard button, 132 × 40 px.
- **Single click:** opens a `460 × 420 px` searchable popup.
- **Selecting a prompt:** shows Preview, Insert, Edit copy, and Cancel.
- **Insert:** places the prompt into MC-02 and never sends automatically.
- **Persistence:** favorites are global; insertion is current-draft only.

### QA-05 — Resume

- **Type/size:** conditional standard button, 132 × 40 px.
- **Visibility:** appears only when recoverable unfinished work exists outside the current draft.
- **Single click:** opens a `360 × auto px` popup ordered by most recently updated.
- **Selecting work:** recovery-saves the current draft first, then restores the selected draft/session.
- **Empty state:** the button is hidden, not disabled.

### QA-06 — More

- **Type/size:** menu button, 104 × 40 px.
- **Options:** Duplicate; Import; Finish Session.
- **Single click:** opens menu upward; selecting starts its named action.
- **Close:** click again, Escape, or outside.

### QA-07 — Duplicate

- **Type:** single-click action inside More.
- **Result:** creates a copy named `[Original name] — Copy`, opens it, and preserves the original unchanged.
- **Toast:** contains Undo, which deletes the copy only after returning to the original.
- **Error:** original remains active.

### QA-08 — Import

- **Type:** file-picker action inside More.
- **Supported session formats:** JSON, TXT, and MD exports created by this application.
- **Sequence:** choose file → validate → show import preview → Import or Cancel.
- **Import:** creates a new session; it never merges silently into the current session.
- **Failure:** explains invalid or unsupported content and preserves the current screen.

### QA-09 — Finish Session

- **Type:** `480 × 360 px` modal with four explicit choices.
- **Options and consequences:**

  1. `Keep Active` — closes the modal and continues without changing status.
  2. `Save` — marks complete and retains it in Saved Sessions.
  3. `Archive` — marks complete and moves it to Archived.
  4. `Discard` — moves it to Trash after a second confirmation.

- **Footer:** `Current work is recovery-saved.`
- **Close:** Escape/Cancel returns to the active session.
- **Destructive rule:** Discard is red and cannot be the default-focused button.

### QA-10 — Automatic recovery

- **Type:** background protection; no button required.
- **Saved data:** draft text; Model; Directness; Technique; Methodology; Review preference override; context references; active session; branch position.
- **Write delay:** 500 ms after last change and immediately before navigation, send, close, import, or new session.
- **Crash/close recovery:** next launch offers `Restore last work` and `Start fresh`.
- **Start fresh:** moves the recovery record to Trash for Undo; it does not permanently erase it.
- **Failure:** MC-13 shows `Recovery save failed`; Retry and Open data location are available.

## 2.9 Right rail

### RR-01 — Rail header and Customize

- **Location/size:** `(1264,96)`, `324 × 32 px`.
- **Content:** `RIGHT RAIL` and a 32 × 32 gear button.
- **Gear single click:** opens RR-02.
- **Keyboard:** Enter/Space; Escape closes RR-02.

### RR-02 — Customize rail

- **Type:** `340 × 500 px` popup aligned to the rail’s right edge.
- **Contents:** each available card with checkbox, drag handle, and pin control; Apply; Cancel; Restore recommended.
- **Available cards:** Recent Sessions; Context Snapshot; Recent Activity; Token Usage; Model Status; Active Session; Quick Tools.
- **Checkbox:** controls visibility.
- **Drag:** changes order. Keyboard alternative uses Move up/Move down buttons.
- **Pin:** fixes a card near the top of the order but does not keep it expanded.
- **Apply:** saves globally and closes.
- **Cancel/Escape:** restores the configuration that existed when opened.
- **Restore recommended:** checks Context Snapshot, Model Status, and Active Session; unchecks the other four; asks for confirmation before replacing custom order.
- **Constraint:** configuration that would exceed the rail uses the same 26-pixel headers and one 182-pixel expansion budget; it does not create a scrollbar.

### RR-03 — Accordion system

- **Type:** fixed-height, one-open-at-a-time accordion.
- **Closed header:** 324 × 26 px.
- **Expanded card:** 324 × 182 px total.
- **Single click on closed header:** collapses the previous open card and expands the selected card simultaneously.
- **Single click on open header:** collapses it; no card remains open.
- **Chevron:** down when closed, up when open.
- **Keyboard:** Up/Down moves between headers; Enter/Space toggles; Home/End jumps first/last.
- **Overflow:** summary is clipped only at a defined row limit and followed by View All; text is never cut mid-line.
- **Persistence:** enabled cards/order are global; current open card is session-only.

### RR-04 — Helpful card selection

- **Type:** automatic choice among enabled cards, not an additional permanent card.
- **Rule:** the rail initially expands the enabled card with the most useful summary for the current task.
- **Explanation:** a `Why this card?` link gives one sentence; the user can Pin or choose another card.
- **No recommendation:** Context Snapshot opens if enabled; otherwise the first enabled card opens.
- **Privacy:** card choice is based on current task state, not hidden personality scoring.

### RR-05 — Recent Sessions

- **Default:** disabled.
- **Closed:** label plus recoverable/active count.
- **Expanded:** at most three recent sessions with title and relative time; View all sessions.
- **Selection:** recovery-saves current draft, then loads the selected session into Talk to AI.
- **View All:** opens Sessions.
- **Empty:** `No recent sessions.`
- **Constraint:** never appears as a required main-workspace section.

### RR-06 — Context Snapshot

- **Default:** enabled.
- **Closed:** label plus active-item count.
- **Expanded:** up to four active context names; inclusion count; Manage context; View All when needed.
- **Selection:** name opens AC-06; Manage opens AC-05.
- **Empty:** `No active context` plus Add Context, which focuses MC-06.

### RR-07 — Recent Activity

- **Default:** disabled.
- **Expanded:** last four saves, imports, template loads, context changes, and exports; View All.
- **Selection:** opens the related item or screen.
- **Empty:** `No activity yet.`
- **Persistence:** activity history follows the application’s data-retention setting.

### RR-08 — Token Usage

- **Default:** disabled.
- **Expanded:** current-session input; output; total; provider-reported limit when available; progress meter.
- **No provider limit:** display `No limit supplied by provider`; never invent a quota.
- **Warning:** at 80% of a known limit, uses warning color and offers Reduce context or Choose faster model.
- **Error:** `Usage unavailable` plus Retry; conversation remains usable.

### RR-09 — Model Status

- **Default:** enabled.
- **Expanded:** configured models, availability, current model, and plain-language errors; Retry status.
- **Unavailable model selection:** blocked in MC-03 with the same explanation.
- **All normal:** green `All configured models available`.
- **Loading:** model rows retain names and show status glyphs.

### RR-10 — Active Session

- **Default:** enabled.
- **Expanded:** session name; duration; message count; created time; recovery/save state; tags; Edit name/tags.
- **Edit:** small popup with Name, Tags, Save, Cancel.
- **Save:** updates immediately and closes.
- **No active session:** `Start typing to begin a session.`

### RR-11 — Quick Tools card

- **Default:** disabled.
- **Expanded body:** six tiles in a 3 × 2 grid; each tile is `96 × 66 px` with an 8-pixel gap.
- **Tiles:** Router; Techniques; Prompt Library; Variables; Checkpoints; Dashboard.
- **Selection:** follows Section 2.10.

## 2.10 Quick Tools behavior

### QT-01 — Router

- **Type:** right-rail tool drawer destination.
- **Single click:** replaces rail cards temporarily with current route, reason, available overrides, Apply, and Back.
- **Apply:** changes routing for the current session and records it in Transparency Details.
- **Back/Escape:** returns to the rail stack without applying unsaved changes.

### QT-02 — Techniques

- **Type:** technique drawer.
- **Single click:** opens the same recommendation, explanation, and checklist used by MC-05.
- **Apply:** updates the current session and closes to the rail.
- **Back:** discards changes made after opening.

### QT-03 — Prompt Library

- **Type:** Saved Tools destination.
- **Single click:** opens Saved Tools with Saved Prompts selected.
- **Back:** returns to the prior workspace and scroll position.

### QT-04 — Variables

- **Type:** right-rail manager drawer.
- **Single click:** shows Search, Create, Edit, Delete, and `Add to context` checkboxes.
- **Add to context:** attaches checked variables to the current draft.
- **Delete:** requires confirmation; used variables remain as broken references until replaced or removed, never silently vanish.

### QT-05 — Checkpoints

- **Type:** right-rail checkpoint drawer.
- **Single click:** lists automatic and manual checkpoints.
- **Create:** asks for a checkpoint name and creates it from the current session.
- **Restore:** previews messages/settings/context that will change, then requires confirmation.
- **After restore:** pre-restore state becomes a new checkpoint so Undo is possible.

### QT-06 — Dashboard

- **Type:** Insights destination.
- **Single click:** opens Insights > Overview.
- **Constraint:** does not create a second dashboard screen or popup.

## 2.11 Search, templates, and saved prompts

### ST-01 — Saved Tools screen

- **Outer geometry:** retains topbar, left sidebar, workspace, connector gutter, and right rail.
- **Workspace:** uses an internally scrolling list within the fixed workspace rectangle; the page itself does not scroll.
- **Tabs:** Templates; Saved Prompts.
- **Search:** fixed above the list; filters after 150 ms.
- **Filters:** Recent and Favorites. Only one special filter is active at a time.
- **Back:** returns to Talk to AI without losing the draft.

### ST-02 — Templates tab

- **Card actions:** Preview; Use; Edit; Duplicate; Favorite/Unfavorite; Delete.
- **Preview:** `560 × 520 px` modal showing name, description, content structure, variables, and tags.
- **Use:** inserts into MC-02 unsent and returns to Talk to AI.
- **Edit:** opens ST-03.
- **Duplicate:** creates `[Name] — Copy` and opens it for editing.
- **Favorite:** updates immediately.
- **Delete:** moves to Trash after confirmation.

### ST-03 — Create/Edit Template

- **Type:** editor screen inside the fixed workspace.
- **Fields:** Name required; Description; Content required; Variables; Tags; Favorite.
- **Actions:** Save; Cancel.
- **Save:** validates, stores, and returns to Templates with the saved card focused.
- **Cancel:** if changed, asks Discard changes; otherwise returns immediately.
- **Error:** fields and unsaved text remain.

### ST-04 — Saved Prompts tab

- **Card actions:** Preview; Insert; Edit; Duplicate; Favorite/Unfavorite; Delete.
- **Insert:** places prompt text in MC-02 unsent and returns to Talk to AI.
- **Other actions:** same preservation and confirmation rules as Templates.

### ST-05 — Create/Edit Saved Prompt

- **Fields:** Name required; Prompt text required; Tags optional; Favorite optional.
- **Actions:** Save; Cancel.
- **Save:** validates and returns to the Saved Prompts list with the item focused.
- **Cancel/error:** same as ST-03.

## 2.12 Response actions and export

### RA-01 — Copy

- **Type:** response action.
- **Single click:** copies only that response as plain text and shows `Copied` for 1600 ms.
- **Menu arrow:** optional secondary menu with `AI-ready request` and `Response with details`; it never changes the main click.
- **Error:** `Couldn’t copy. Select the text and try again.`

### RA-02 — Refine

- **Type:** menu button.
- **Options:** Clearer; Shorter; More detailed; More supportive; More direct; Custom.
- **Selection:** creates a new response branch; the current response is preserved.
- **Custom:** opens a small instruction field with Refine and Cancel.
- **Loading:** progress card appears in the thread; repeat activation blocked.
- **Error:** original remains selected; Retry available.

### RA-03 — Rating

- **Type:** five-star single-select control.
- **Single click:** saves 1–5 stars and opens optional `What should change?` text with Submit and Skip.
- **Change:** clicking another star updates the rating.
- **Keyboard:** Left/Right chooses; Enter saves.
- **Persistence:** stored with that response only.

### RA-04 — Export

- **Type:** smart-default popup button under a response and in session More.
- **Popup size:** `440 × 480 px`.
- **Default scope:** Current response when opened from a response; Whole session when opened from More.
- **Scope options:** Current response; Selected responses; Whole session.
- **Format options:** Markdown; PDF; JSON.
- **Detail checkboxes:** Response; Confidence; State; Transparency; Rating; Sources/quotations when present.
- **Smart defaults:** remembers the last format and detail set; always derives scope from the trigger location.
- **Primary action:** Save Result.
- **Cancel/Escape:** closes without losing choices for the next open.

### RA-05 — Save exported file

- **Sequence:** validate scope → generate → open operating-system Save As → save → success toast.
- **Loading labels:** `Preparing export…`, then `Saving…`.
- **Success toast:** filename plus Open file and Open folder.
- **Overwrite:** operating system confirmation is required.

### RA-06 — Export failure

- **Visual:** inline error inside RA-04.
- **Behavior:** preserves scope, format, details, and conversation.
- **Actions:** Retry; Choose another folder; Cancel.
- **Closing:** Cancel closes; Retry uses the same selections.

## 2.13 Settings and appearance

### SE-01 — Settings screen

- **Outer geometry:** frozen shell remains.
- **Workspace sections:** Appearance; AI Behavior; Right Rail; Notifications; Data; Account.
- **Scroll:** selected section’s content scrolls internally only when necessary; topbar/sidebar do not move.
- **Apply model:** changes preview immediately when safe; explicit Apply saves; Cancel restores prior values.

### SE-02 — Theme

- **Type:** three-choice selector.
- **Options:** Dark; Light; System.
- **Light:** uses every visual token in Part 1.
- **Dark/System:** may select a separately specified dark token set; geometry never changes.
- **Preview:** immediate; Apply commits globally; Cancel restores.

### SE-03 — Visual intensity

- **Type:** Low / Standard / High selector.
- **Default:** Standard.
- **Effect:** changes marble contrast, glow strength, and decorative intensity only.
- **Invariant:** text contrast, focus ring, active-state meaning, sizes, and positions remain accessible and unchanged.
- **Persistence:** global.

### SE-04 — Reduced Motion

- **Type:** on/off toggle.
- **Effect:** applies the zero-duration rule in Section 1.15 and changes spinner to a static progress glyph.
- **Persistence:** global and immediate.

### SE-05 — Text size

- **Type:** Standard / Large selector.
- **Standard:** Part 1 type scale.
- **Large:** text increases 15%; line height increases proportionally; controls retain outer dimensions and use wrapping or internal scrolling where defined.
- **Invariant:** columns do not rearrange.
- **Persistence:** global.

### SE-06 — AI behavior defaults

- **Type:** settings group.
- **Controls:** Model; Directness; Technique Auto recommendation; Methodology; Review before sending.
- **Apply:** becomes the initial state for new sessions.
- **Existing sessions:** unchanged unless `Apply to current session` is explicitly checked.
- **Restore recommended:** Auto model; Balanced directness; Auto recommendation on; Standard methodology; Review first.

### SE-07 — Right rail defaults

- **Type:** same checklist, order, and pin controls as RR-02.
- **Apply:** changes global defaults and the current rail immediately.
- **Restore recommended:** Context Snapshot, Model Status, Active Session enabled; others disabled.

### SE-08 — AI provider key

- **Type:** masked password field with Save and Remove.
- **Save:** validates without exposing the full key and stores it using operating-system protection.
- **Remove:** confirmation names models/features that will stop working.
- **Error:** key remains masked; no secret is written to logs.
- **Keyboard/paste:** paste allowed; copy and reveal are not provided after save.

### SE-09 — Data location

- **Type:** read-only path plus Choose and Open.
- **Choose:** opens folder picker and previews the move.
- **Confirm move:** migrates safely, keeps old path until validation succeeds, then switches.
- **Open:** opens current folder in the operating system.
- **Failure:** current location remains authoritative; Retry available.

### SE-10 — Restore defaults

- **Type:** secondary button at the bottom of each Settings section.
- **Single click:** lists exactly which settings in that section will reset.
- **Confirm:** resets only that section.
- **Invariant:** user content, sessions, templates, prompts, and projects are never deleted.

## 2.14 Complete cross-component flows

The following are the cross-component flows. A component-local action not repeated here follows its complete component entry above.

### Flow F-01 — Launch and restore work

**Start:** application is closed.

1. User launches the application.
2. System loads visual/settings defaults and recovery index without changing the frozen shell.
3. If no unfinished recovery exists, Talk to AI opens with the most recent active session or a blank draft.
4. If unfinished recovery exists, a `Restore last work` / `Start fresh` panel appears inside the composer area.
5. User chooses Restore last work.
6. System restores draft text, context, Model, Directness, Technique, Methodology, Review preference override, session, and branch.
7. Composer focuses the prior caret position; the conversation restores its prior scroll position.

**End:** user is in Talk to AI with all recoverable work restored and no page scrollbar.

### Flow F-02 — Send with Review first and no State change

**Start:** user has text in MC-02; Review first is selected.

1. User clicks Translate & Ask or presses Ctrl/Cmd+Enter.
2. System validates text and context.
3. System writes recovery state.
4. MC-08 changes to `Checking state…`; MC-12 shows progress.
5. State Detection returns no recommended change.
6. MC-12 changes to `State checked — no change suggested`.
7. System prepares the AI-ready request.
8. Composer enters RV-01 without changing its rectangle.
9. User edits or accepts the prepared request.
10. User selects Send to AI.
11. User message is appended to CW-02; AI loading card appears beneath it.
12. Response streams into that card.
13. Response actions and Why this worked become available.
14. MC-02 clears only after send acceptance and receives focus.

**End:** completed response is visible; original and prepared requests are recorded in Transparency Details.

### Flow F-03 — Send with a State recommendation

**Start:** user submits a valid message.

1. Steps 1–4 of F-02 occur.
2. Detection identifies a potentially helpful change.
3. Sending pauses; SD-04 opens upward from MC-12.
4. User reads the four state chips and one-sentence reason.
5. User chooses exactly one action:
   - Accept & Continue → stated adjustment applies to this request.
   - Keep Current & Continue → explicit controls remain unchanged.
   - Correct → user edits detected values, then Save & Continue.
   - Dismiss → current settings are used.
6. System records the choice and whether Remember was checked.
7. If Review first is active, RV-01 opens; otherwise sending continues.
8. Response enters CW-02 and the panel becomes the compact `State used` bar.

**End:** user sees the response and can inspect the exact adaptation through MC-12 or Transparency Details.

### Flow F-04 — Send automatically

**Start:** Review-before-sending is `Send automatically`.

1. User activates Translate & Ask.
2. Validation, recovery, and State Detection run.
3. Any recommendation is resolved through F-03; no recommendation proceeds automatically.
4. System prepares the AI-ready request without opening RV-01.
5. The user message and AI loading card appear in CW-02.
6. Response streams; Transparency Details stores the prepared request.

**End:** completed response is visible; the composer is ready for the next message.

### Flow F-05 — Edit a message and preserve branches

**Start:** a prior user message is visible.

1. User hovers/focuses the card and selects Edit.
2. System copies the text and request settings into MC-02; original message remains visible.
3. User changes text/settings/context.
4. User sends through F-02, F-03, or F-04.
5. System creates a new response branch connected to the edited message.
6. CW-05 appears with previous/next and count.
7. User may switch branches without deleting either.

**End:** both original and revised conversation paths remain recoverable.

### Flow F-06 — Add a file as context

**Start:** composer is visible.

1. User selects Add Context.
2. AC popup opens upward.
3. User selects File.
4. Operating-system picker opens.
5. User chooses one or more supported files.
6. Loading chips appear immediately inside MC-02.
7. System reads/uploads each file and updates progress per chip.
8. Successful chips become normal; failed chips show Retry/Remove.
9. Context Snapshot updates counts/names.
10. User may click a chip to preview, exclude, or remove it.

**End:** selected successful context is included in the next prepared request without increasing composer height.

### Flow F-07 — Add pasted text, URL, or variables

**Start:** Add Context popup is open.

1. User chooses Paste Text, URL, or Variable.
2. The exact surface from AC-02, AC-03, or AC-04 opens.
3. User enters/selects required information.
4. System validates without closing on error.
5. User confirms Add/Add Selected.
6. Surface closes; chips appear; Context Snapshot updates.
7. User returns to the same caret and composer state.

**End:** new context is attached, visible, removable, and recovery-saved.

### Flow F-08 — Use a Template

**Start:** Talk to AI or Saved Tools is open.

1. User opens Templates from Quick Actions, topbar context slot, or Saved Tools.
2. System shows Recent/Favorites and searchable results.
3. User selects a template.
4. Preview shows structure, variables, and tags.
5. User chooses Use.
6. System returns to Talk to AI and inserts the structure into MC-02 unsent.
7. User fills variables and sends through an ordinary send flow.

**End:** template content is an editable draft; no request was sent without the user.

### Flow F-09 — Insert a Saved Prompt

**Start:** Talk to AI or Saved Tools is open.

1. User opens Saved Prompts.
2. User searches or selects Recent/Favorites.
3. User selects a prompt and sees Preview.
4. User selects Insert.
5. System places prompt text in MC-02 unsent and restores Talk to AI.

**End:** prompt is editable and ready; conversation remains unchanged until send.

### Flow F-10 — Run a Multi-AI action

**Start:** at least one eligible response exists.

1. User opens Multi-AI Actions.
2. User selects Debate, Consensus, or Synthesis.
3. Confirmation shows purpose, models, time estimate, and usage estimate when available.
4. For Synthesis, user selects at least two source responses.
5. User selects Start.
6. Panel closes; CW-02 gains a progress card.
7. User may Cancel; completed material is retained and labeled partial.
8. On success, result becomes a new response branch.

**End:** original responses remain; the new multi-model result is visible and exportable.

### Flow F-11 — Refine a response

**Start:** an AI response is complete.

1. User opens Refine.
2. User chooses Clearer, Shorter, More detailed, More supportive, More direct, or Custom.
3. If Custom, user enters an instruction and confirms.
4. System adds a progress card and creates a new response branch.
5. CW-05 permits comparison with the original.

**End:** refined and original responses both exist.

### Flow F-12 — Export a result

**Start:** a response or session is open.

1. User activates Export from the response or More.
2. RA-04 opens with trigger-derived scope and remembered format/details.
3. User changes Scope, Format, or detail checkboxes as desired.
4. User selects Save Result.
5. System validates and generates the file.
6. Operating-system Save As opens.
7. User chooses a destination and confirms.
8. Success toast offers Open file and Open folder.
9. On failure, RA-06 preserves all choices and offers Retry/Choose another folder.

**End:** file is saved or user returns with every choice preserved.

### Flow F-13 — Start, resume, or finish a session

**Start:** Talk to AI is open.

1. User opens Quick Actions.
2. New Session recovery-saves current work, creates a blank session, and offers Undo.
3. Resume appears only when other unfinished work exists; selecting it saves current work then restores the chosen draft.
4. Finish Session opens the four-choice modal.
5. Keep Active returns unchanged; Save completes and retains; Archive completes and archives; Discard confirms then moves to Trash.

**End:** session status changes only through the explicit chosen action; no work is permanently lost.

### Flow F-14 — Search and return

**Start:** any screen is open.

1. User presses Ctrl/Cmd+K or clicks Search.
2. User types; grouped live results appear.
3. User selects a result.
4. System stores the current workspace, focus, and scroll state in navigation history.
5. Destination opens inside the fixed shell.
6. Back returns to the stored state.

**End:** user returns to the exact prior task without losing draft or context.

### Flow F-15 — Open and switch right-rail cards

**Start:** one card is expanded or all are closed.

1. User selects a closed card header.
2. Previous card body contracts from 156 px to 0 while selected body expands from 0 to 156 px over 160 ms.
3. Header stack repositions inside its fixed rail budget; page height does not change.
4. User selects another header; the same swap occurs.
5. User selects the open header; it collapses and no card remains open.
6. View All opens a dedicated internally scrolling screen when more data exists.

**End:** desired concise rail summary is visible; all other headers remain accessible.

### Flow F-16 — Customize the right rail

**Start:** RR-01 is visible.

1. User selects the gear.
2. RR-02 opens with current visibility, order, and pins.
3. User checks/unchecks, reorders, or pins cards.
4. User selects Apply.
5. System validates that the fixed rail can display all headers and one expansion budget.
6. Rail updates immediately; recommended helpful card is selected among enabled cards.
7. Cancel instead restores the pre-open configuration.

**End:** rail reflects the saved low-clutter configuration.

### Flow F-17 — Recover from a failed request

**Start:** preparation, sending, model call, or streaming fails.

1. System stops the failed operation and re-enables relevant controls.
2. User message, prepared request, context, and selections remain.
3. Inline error names what failed, what was preserved, and the next available action.
4. User chooses Retry, Edit request, Choose another model, or Cancel as available.
5. Retry reuses the same request exactly once per click; it never loops automatically.
6. Success replaces the error card with the response; Cancel returns to the editable composer.

**End:** user either receives a response or remains in a safe, editable state with no data loss.

### Flow F-18 — Change appearance safely

**Start:** Settings > Appearance is open.

1. User changes Theme, Visual intensity, Reduced Motion, or Text size.
2. System previews the change without moving frozen outer geometry.
3. User selects Apply.
4. Preference saves globally and the current screen remains open.
5. User selects Cancel instead; prior appearance is restored.

**End:** appearance changes without changing control meaning, placement, or data.

---

# PART 3 — COMPONENT STATE MATRIX

## 3.0 State notation

The matrix uses the following exact state names:

| Code | State | Meaning |
|---|---|---|
| `I` | Idle | Available and closed/unselected. |
| `H` | Hover | Pointer is over the control; universal hover visual applies. |
| `F` | Focus | Keyboard focus; universal focus ring applies. |
| `P` | Pressed | Activation is in progress for 80 ms. |
| `O` | Open | Popup/drawer/accordion body is visible. |
| `S` | Selected | Value or destination is selected. |
| `D` | Disabled | Unavailable with reason tooltip. |
| `L` | Loading | Operation is in progress; duplicate activation blocked. |
| `✓` | Success | Operation completed; concise confirmation appears. |
| `E` | Error | Operation failed; input/state is preserved and recovery action is visible. |
| `Ø` | Hidden | Component is intentionally absent because it is not applicable. |

Every visual result for `I/H/F/P/O/S/D/L/✓/E` is defined in Section 1.14. Each row below lists every component-specific state in the only permitted progression(s).

## 3.1 A — Frozen screen structure

| Component | Complete allowed state sequence | State-specific description |
|---|---|---|
| Application window | Closed → L → Open → Focused/Unfocused → Closing → Closed; Open → Recovery prompt | Launch loads recovery before content. Closing recovery-saves first. Resize scales the complete canvas; it never reflows. |
| Topbar | I → Focus-within → I | It is always fixed and visible. Individual controls own H/F/P/O/L/E; the bar itself never loads or scrolls. |
| Left navigation | I → Focus-within → I | Fixed shell. One destination row may be S. Destination loading leaves the former workspace intact. |
| Main workspace | Blank-session → Active-session → L-response → Active-session; Active-session → management screen → restored | Fixed rectangle. Conversation screens use no page scroll; management lists scroll internally. |
| Right rail | All-closed → One-open → Different-one-open → All-closed; Drawer-open → restored cards | Card headers stay available. Only one 156-pixel body or one rail drawer is visible. |
| Vertical space priority | Conversation+composer guaranteed → utility overlay → guaranteed restored | Utilities may cover older thread content temporarily but never move or shrink the composer. |
| Compact utility bars | I/H/F/P → O → I; I → D; I → L → ✓/E | Closed height is always 26 px. One overlay at a time; opening another closes the first. |
| Overflow placement | Summary → View All screen → Back to summary | Extra rows never append to the conversation page or create document scrolling. |
| Responsive scaling | Scale 0.75–1.25 → centered letterbox | Entire 1600 × 1024 canvas scales uniformly. Below minimum, resize stops; no alternate layout exists. |

## 3.2 B — Topbar controls

| Component | Complete allowed state sequence | State-specific description |
|---|---|---|
| Divergence.AI logo | I → H/F → P → Talk to AI; never D/L/E | Home action preserves session and draft. |
| Search | I → F/O → typing → L/results/empty/E → result selected or closed | Results popup remains open through loading/empty/error. Escape returns to I and prior focus. |
| Quick Reference | I → H/F → P → O → I; O → nested help → Back → O | Drawer replaces rail content temporarily and restores it exactly. |
| Notifications | I with/read badge → O → item selected → destination; O → empty; O → L/E | Badge updates per item. Popup error does not affect conversation. |
| Page action area | Context action I/H/F/P → result; no action → Ø; operation active → D/L → ✓/E | Slot rectangles never move. Transparent slots are unfocusable. |
| Profile | I → H/F → P → O → item selected/closed; Sign out → confirmation → signed out/cancel | Sign out never deletes local recovery data. |
| Window controls | I/H/F/P → minimized/maximized/restored; Close → recovery-save → closed or blocked by confirmation | Native controls remain outside content geometry. A busy export/Multi-AI operation prompts Keep running, Cancel operation, or Return. |

## 3.3 C — Left navigation

| Component | Complete allowed state sequence | State-specific description |
|---|---|---|
| Talk to AI | I → H/F/P → L → S; S remains selected while active | Restores active or blank session. Loading cannot clear existing workspace. |
| Sessions | I → H/F/P → L → S; S → tab/list state → session selected → Talk to AI S | Active, Saved, Archived, Trash are internal tabs. Empty/error remain inside workspace. |
| Saved Tools | I → H/F/P → L → S; S → Templates/Saved Prompts | Remembers tab globally. |
| Projects | I → H/F/P → L → S; S → project → Tasks/Resources/Integrations | Empty state offers Create Project. Errors preserve list and selection. |
| Insights | I → H/F/P → L → S; S → Overview/Usage/Activity/Patterns | No second Dashboard state exists. |
| Settings | I → H/F/P → L → S; S → section → preview → Apply/Cancel | Last section is remembered; unsaved changes prompt on leave. |
| All Tools | I → H/F/P → O → filtered/empty/E → tool selected or closed | Pin changes LN-08; search query clears on close. |
| Pinned tool | Ø when none; I → H/F/P → destination; I → pin-menu O → moved/unpinned | Unpin returns to Ø without deleting the tool. |
| Trash | I → H/F/P → L → S; S → restore/delete-confirmation → ✓/E | Permanent delete is never default focus. |
| System Status | Normal/Warning/Error → H/F/P → O → Retry/close | Status uses semantic color plus text/icon, never color alone. |

## 3.4 D — Conversation workspace

| Component | Complete allowed state sequence | State-specific description |
|---|---|---|
| Screen heading | Static Talk to AI; management-screen title replaces text in the same rectangle | No interactive, hover, disabled, or loading state. |
| Conversation thread | Empty → active → response L → active; active at older scroll → new-response indicator; E → Retry/edit | Only this pane scrolls. Thread content is never discarded by an error. |
| User message | Sent → H/F actions → Edit copy/Copy/Save prompt; failed-send E → Retry/Edit | Editing creates a branch; original is immutable. |
| AI response | L streaming → complete; L → stopped → Continue/Retry; E → Retry/Edit request; complete → H/F actions | Partial content is retained and labeled. |
| Response branch switcher | Ø for one branch; I → H/F/P → previous/next S; branch L/E | Count remains visible. Switching never deletes branches. |
| New-response indicator | Ø → visible I/H/F/P → scroll-to-newest → Ø | Appears only when content exists below current scroll. |
| Composer dock | Empty/restored → editing → validating → review/sending → empty/restored; E → editable | Outer rectangle is always visible and 350 px high. |

## 3.5 E — Main message composer

| Component | Complete allowed state sequence | State-specific description |
|---|---|---|
| What’s on your mind? | Empty I → F/editing → recovery ✓; editing → validation E → editing; sending accepted → empty | Never D. Internal scroll begins after 122-pixel height budget. |
| Model | Auto S → O → model S; model unavailable D; status L/E → alternative S | One selected value. New-session default is separate from session value. |
| Directness | Balanced S → O → Supportive/Balanced/Blunt S; recommendation pending → unchanged until accepted | One selected value; popup closes on selection. |
| Technique | Recommendation L/ready/E → O → checked 0–4 → Apply S/Cancel restored; fifth attempt blocked | Manual choices survive recommendation failure. |
| Show advanced controls | I/H/F/P → O → I; O → Methodology/Review edits → close preserved | Opening closes every other workspace overlay. |
| Methodology | Standard S → O → Standard/3-State S; suggestion → Accept S/Dismiss; pinned/unpinned | Suggestion cannot silently select. |
| Add Context | I/H/F/P → O → option selected → child surface; file add L → chip ✓/E | Popup closes after option selection; current draft is preserved. |
| Active context chips | Ø → chip I/H/F → preview O; chip → remove → Ø/update; chip L → ✓/E | At most two names plus +N are visible. |
| Translate & Ask | D empty → I valid → P/L checking → recommendation/review/sending → ✓; any stage E → I with Retry | Double activation is blocked; field clears only after accepted send. |

## 3.6 F — Add Context flows

| Component | Complete allowed state sequence | State-specific description |
|---|---|---|
| File | Picker open → canceled or files selected → chip L → ✓/E; E → Retry L/Remove | Multiple selected files progress independently. |
| Paste Text | Modal O empty → editing → validation E or Add L → chip ✓; Cancel → closed | Unsaved typed text requires discard confirmation. |
| URL | Modal O → URL entered → Preview L → preview ✓/E → Add L → chip ✓/E | Add is disabled until preview succeeds or explicit add-without-preview confirmation. |
| Variable | Modal O → searching/checked → Add Selected → chips ✓; Create editor O → Save/Cancel; Delete confirmation | Checked state is provisional until Add Selected. |
| Manage All | Modal O → inclusion edits/removal/retry/add-more → Done ✓ or Cancel restored | List scrolls internally. Remove affects session reference only. |
| Context preview | I trigger → O → included/excluded/removed/open-source → updated/closed | Include/exclude updates every context display immediately. |
| Context Snapshot | Closed → O expanded → preview/manager/View All → returned; empty → Add Context focus | Count and names update live; card obeys one-open rule. |

## 3.7 G — State Detection and sending

| Component | Complete allowed state sequence | State-specific description |
|---|---|---|
| Detection trigger | Dormant → L checking → no-change/recommendation/E | Runs only after a deliberate send, never continuously while typing. |
| No change recommended | Result ready → compact status → details O/Correct → continue | Sending continues automatically according to Review preference. |
| Change recommended | Pending panel O → Accept/Keep/Correct/Dismiss → resolved | Sending is paused; composer and page do not move. |
| Accept & Continue | I/H/F/P → L applying → ✓ continue/E retained | Applies only the stated change; optional remembered scope requires checkbox. |
| Keep Current & Continue | I/H/F/P → ✓ continue | Explicit controls remain unchanged; decline is recorded. |
| Correct | I/H/F/P → edit O → Save & Continue ✓/validation E/Cancel | Corrected values apply only to this request unless Remember is checked. |
| Dismiss | I/H/F/P → panel closed → continue | Same request behavior as Keep Current; no silent learning. |
| After response | compact `State used` I/H/F → details O → I | Request-scoped record remains available with the response. |

## 3.8 H — Review, transparency, and Multi-AI

| Component | Complete allowed state sequence | State-specific description |
|---|---|---|
| Review first preference | Review S ↔ Send automatically S; optional Remember unchecked/checked | Initial install is Review. Global persistence only after explicit Remember. |
| AI-ready translation | Preparing L → review/editing → Show changes on/off → Send L/Back/Cancel; E → editing | Occupies MC-02 rectangle; original draft remains recoverable. |
| Transparency Details | I/H/F/P → O → Copy ✓/close; empty-before-send; request record ready | One utility overlay. Contains summary, never private chain-of-thought. |
| Multi-AI Actions | I/H/F/P → O → option confirmation; unavailable option D; estimate L/E | One utility overlay. Manual selection remains when estimate unavailable. |
| Debate | I → confirmation O → Start L → complete ✓/partial canceled/E | Result becomes a response branch. |
| Consensus | I → confirmation O → Start L → complete ✓/partial canceled/E | Agreements and disagreements are labeled. |
| Synthesis | I → confirmation O → source selection → Start L → complete ✓/partial/E; fewer than two sources D | Source responses are never removed. |

## 3.9 I — Quick Actions and session protection

| Component | Complete allowed state sequence | State-specific description |
|---|---|---|
| Quick Actions bar | I/H/F/P → O → I; Resume dot on/off | Tray opens upward and never includes Clear All. |
| New Session | I/H/F/P → recovery L → new session ✓; failure E → current retained; ✓ → Undo | Prior session remains recoverable. |
| Templates | I/H/F/P → popup O → search/preview → Use ✓/Cancel; L/E | Use inserts unsent content. |
| Saved Prompts | I/H/F/P → popup O → search/preview → Insert ✓/Cancel; L/E | Insert never sends automatically. |
| Resume | Ø when none; I/H/F/P → popup O → selected restore L → ✓/E | Current draft saves before switch. |
| Duplicate | I/H/F/P → L → copy ✓/E; ✓ → Undo | Original is never modified. |
| Import | I/H/F/P → picker → preview O → Import L → new session ✓/E | Never silently merges with current session. |
| Finish Session | I/H/F/P → modal O → Keep/Save/Archive/Discard confirmation → ✓/E | Discard moves to Trash and requires second confirmation. |
| Automatic recovery | Clean → pending-change → saving L → saved ✓; E → Retry/Open location; launch → restore offered | Background state never blocks typing. |

## 3.10 J — Right rail cards

| Component | Complete allowed state sequence | State-specific description |
|---|---|---|
| Helpful card | recommendation L → card selected O; explanation O; Pin/unpin; no recommendation → fallback O | It is a selection rule, not an extra card. |
| Customize rail | I/H/F/P → popup O → provisional edits → Apply ✓/Cancel restored; validation E | Current configuration remains until Apply. |
| Recent Sessions | Disabled Ø by default; enabled closed → O → session selected/View All; empty/E/L | Maximum three summaries. Never required in center. |
| Context Snapshot | Enabled closed → O → preview/manager/View All; empty → Add Context; live updates | Default enabled. |
| Recent Activity | Disabled Ø by default; enabled closed → O → item selected/View All; empty/E/L | Maximum four events. |
| Token Usage | Disabled Ø by default; enabled closed → O → normal/warning/unavailable E/L | No invented quotas. |
| Model Status | Enabled closed → O → normal/warning/error → Retry L → updated | Default enabled. |
| Active Session | Enabled closed → O → edit popup → Save ✓/Cancel/E; no-session empty | Default enabled. |
| Quick Tools | Disabled Ø by default; enabled closed → O → tile selected → drawer/destination | Grid exists only in expanded body. |
| Accordion rule | all closed → one O → different one O → all closed | Exactly one 156-pixel body; rail height is constant. |

## 3.11 K — Quick Tools

| Component | Complete allowed state sequence | State-specific description |
|---|---|---|
| Router | Tile I/H/F/P → drawer O → provisional override → Apply ✓/Back restored; L/E | Session routing change is recorded in Transparency. |
| Techniques | Tile I/H/F/P → drawer O → recommendation L/ready/E → checked → Apply ✓/Back | Uses same values and limit as MC-05. |
| Prompt Library | Tile I/H/F/P → destination L → Saved Prompts S; Back → restored | No duplicate prompt interface. |
| Variables | Tile I/H/F/P → drawer O → search/create/edit/delete/add-context → ✓/E | Delete confirms; broken references are disclosed. |
| Checkpoints | Tile I/H/F/P → drawer O → Create ✓/Restore preview O → confirmation → ✓/E | Restore creates an automatic pre-restore checkpoint. |
| Dashboard | Tile I/H/F/P → destination L → Insights Overview S | No separate Dashboard state. |

## 3.12 L — Search, templates, and saved prompts

| Component | Complete allowed state sequence | State-specific description |
|---|---|---|
| Global search results | Query empty → typing → L/results/empty/E → result S/destination/closed | Groups remain fixed; current work preserved. |
| Templates tab | I/S → L cards/empty/E → card H/F → Preview/Use/Edit/Duplicate/Favorite/Delete | List scrolls internally. |
| Create Template | Editor empty/editing → validation E → Save L → ✓/E; Cancel → discard confirmation/return | Unsaved content remains on error. |
| Saved Prompts tab | I/S → L cards/empty/E → card H/F → Preview/Insert/Edit/Duplicate/Favorite/Delete | Insert returns unsent text to composer. |
| Create Saved Prompt | Editor empty/editing → validation E → Save L → ✓/E; Cancel → discard confirmation/return | Name and prompt text required. |
| Recent/favorites | Recent S ↔ Favorites S; result empty; tab change → remembered last tab | Only one filter active; temporary search not remembered. |

## 3.13 M — Response actions and export

| Component | Complete allowed state sequence | State-specific description |
|---|---|---|
| Copy | I/H/F/P → ✓ Copied/E | Copies only intended scope. No loading state normally. |
| Refine | I/H/F/P → menu O → option/custom → L branch → ✓/E | Original remains. |
| Rating | Unrated → H/F → 1–5 S → optional comment O → Submit ✓/Skip; rating change S | One rating per response, editable. |
| Export | I/H/F/P → popup O → provisional choices → Save L/Cancel; validation E | Smart defaults are visible and editable. |
| Save exported file | Generate L → Save As → saving L → ✓/E | Success offers Open file/Open folder. |
| Export failure | E visible → Retry L → ✓/E; Choose folder → Save As; Cancel → closed | Choices and conversation remain. |

## 3.14 N — Settings and appearance

| Component | Complete allowed state sequence | State-specific description |
|---|---|---|
| Theme | Light/Dark/System S → preview → Apply ✓/Cancel restored; unavailable dark spec D | Geometry never changes. |
| Visual intensity | Low/Standard/High S → immediate preview → Apply ✓/Cancel | Only decorative intensity changes. |
| Reduced motion | Off/On S → immediate effect → Apply/global ✓ | Loading uses static glyph when on. |
| Text size | Standard/Large S → preview → Apply ✓/Cancel | Controls remain in frozen rectangles. |
| AI behavior defaults | current defaults → provisional edits → Apply ✓/E/Cancel; optional Apply current session | Existing sessions unchanged by default. |
| Right rail defaults | current configuration → provisional checklist/order/pins → Apply ✓/E/Cancel | Restore recommended confirms before replacing. |
| AI provider key | Empty/configured masked → editing → Save L → ✓/E; Remove confirmation → removed ✓/E | Secret is never revealed after save. |
| Data location | Current path → Choose picker → migration preview → Confirm L → ✓/E; Open folder | Old location remains until validation succeeds. |
| Restore defaults | I/H/F/P → scope confirmation O → Confirm ✓/E/Cancel | Resets only named settings; never content. |

## 3.15 O — Universal control behavior

| Component/rule | Complete allowed state sequence | State-specific description |
|---|---|---|
| Loading state | I/P → L → ✓ or E | Dimensions and context remain; duplicate activation blocked. |
| Success feedback | Operation ✓ → adjacent mark 1600 ms + toast 2400 ms → I | Toast offers one useful follow-up when applicable. |
| Error feedback | Operation E → Retry/Edit/Cancel → L/I | Message states failure, preserved data, and exact next action. |
| Destructive action | I/H/F/P → confirmation O → Confirm L → ✓/E or Cancel | Red action is never default focus; recoverable actions offer Undo. |
| Popup closing | I → O → Apply/selection ✓ or Escape/outside/click trigger → I | Unsaved typed text requires discard confirmation. Focus returns to trigger. |
| No-page-scroll rule | Fixed document → internal thread/list scroll or overlay → fixed document | Topbar, full composer, and primary action remain visible. |
| Compact control heights | 26-pixel utility; 32-pixel select; 40-pixel secondary; 44-pixel primary | Optional content expands into overlay/tray, not taller controls. |
| Compact expansion behavior | Closed I/H/F/P → O upward → close I; second trigger → first closes, second O | Selections survive close unless Cancel explicitly restores. |
| Accordion behavior | closed headers → one O → another O/none | Open body is 156 px; chevron mirrors state. |
| Dropdown behavior | closed S → O current checked → new S and closed; Escape → prior S | Apply is required only for multi-choice/checklist popups. |
| Checkbox-list behavior | O with committed set → provisional checks → Apply new set/Cancel prior set | Limits are explained before and when reached. |
| Keyboard focus | No focus visible for pointer → F ring for keyboard → activation/next focus | Tab order is Topbar, left, main, right; focus never becomes trapped except modal. |
| Help | I/H/F → tooltip; click/? → Quick Reference O → Back/close | Explanation says what changes and never hides current work. |

---

# PART 4 — APPROVED GREEN DECISION REFERENCE

## 4.1 Decision-to-implementation traceability

| # | Approved GREEN decision | Exact implementation in this specification | Primary sections |
|---:|---|---|---|
| 1 | Adaptive conversation-first workspace | A real internally scrolling conversation thread occupies the upper workspace; a persistent composer occupies the lower workspace; controls support the conversation instead of replacing it. | 1.5, 2.3, 2.4, F-01–F-05 |
| 2 | Supportive / Balanced / Blunt, each with a one-line preview | Directness is a 242 × 32 single-select control with exactly these three plain-language choices and previews. Balanced is the initial default. | MC-04, 3.5 |
| 3 | AI recommends one Technique, explains why, and lets the user change or add others | Technique opens a recommendation-first checkbox popup; Auto recommend starts on; ten techniques are listed; up to four may be selected; Apply/Cancel are explicit. | MC-05, QT-02, 3.5 |
| 4 | Contextual Methodology suggestion with optional pinned control | Standard/3-State lives in Advanced controls. A recommendation appears only when useful, cannot apply silently, and may be pinned without adding a full fourth dropdown. | MC-09, MC-10, 3.5 |
| 5 | On-submit State suggestion card with reason, Accept, Correct, or Dismiss | Detection runs only after Translate & Ask. Any change pauses sending in a fixed overlay with Accept & Continue, Keep Current & Continue, Correct, and Dismiss. Nothing changes silently. | MC-12, SD-01–SD-09, F-03 |
| 6 | One Add Context button with File, Text, URL, and Variable choices | Add Context is one 136 × 44 button. Its menu contains File, Paste Text, URL, Variable, and Manage All; every complete child flow is specified. | MC-06, MC-07, AC-01–AC-07, F-06–F-07 |
| 7 | Translate & Ask with remembered Review first / Send automatically preference | Translate & Ask is the single primary action. Review first is the initial default; the preference can be remembered; auto-send remains available without a repeated decision. | MC-08, MC-11, RV-01, F-02–F-04 |
| 8 | Thin Quick Actions bar with frequent actions and More | Quick Actions is 26 px closed and opens upward. It contains New Session, Templates, Saved Prompts, conditional Resume, and More; More contains Duplicate, Import, and Finish Session. Clear All is excluded. | QA-01–QA-10, F-13 |
| 9 | Real conversation plus editable AI-ready translation and plain-language Why this worked | User and AI messages form a branch-preserving thread. Review first provides an editable prepared request. Why this worked opens a plain-language transparency summary without exposing private chain-of-thought. | CW-02–CW-05, RV-01–RV-03, F-05 |
| 10 | Six outcome-based destinations plus searchable All Tools | Permanent destinations are Talk to AI, Sessions, Saved Tools, Projects, Insights, and Settings. All Tools is searchable; one optional pinned tool may occupy the reserved slot. | 1.4, LN-01–LN-10, 3.3 |
| 11 | Search, Quick Reference, notifications, and profile; contextual page actions only when relevant | These four global controls remain permanent. The frozen header’s remaining rectangles are contextual slots; Talk to AI uses Templates, Help, and Settings. Empty slots retain geometry without creating a dead control. | 1.3, TB-01–TB-08, 3.2 |
| 12 | Compact right-rail headers, one concise card open, relevant suggestions, user-controlled pinning | Closed headers are 26 px; one card receives a fixed 156-pixel body. Helpful card selection is explained; Customize controls visibility, order, and pinning. Recent Sessions and Quick Tools are optional and disabled by default. | 1.6, RR-01–RR-11, F-15–F-16 |
| 13 | One adaptive interface with Show advanced controls | No User/Developer mode split exists. Advanced complexity is disclosed through one 26-pixel bar and contextual recommendations while every essential capability remains available. | MC-09–MC-11, 0.2 |
| 14 | Simple Save Result with smart defaults and expandable details | Export derives scope from its trigger, remembers format/details, exposes exact scope/format/detail choices, and provides one Save Result action with safe failure recovery. | RA-04–RA-06, F-12 |
| 15 | Automatic recovery plus explicit Finish Session menu | Recovery saves after changes and before transitions. Finish offers Keep Active, Save, Archive, and confirmed Discard. New Session offers Undo; Clear All is absent. | QA-02, QA-09, QA-10, F-01, F-13, F-17 |
| 16 | Gold/blue identity with calmer content surfaces and adjustable intensity | Muted marble, pale frosted glass, gold identity, electric-blue active state, black outline icons, fixed light-mode tokens, Low/Standard/High intensity, and Reduced Motion are fully defined. | Part 1, SE-02–SE-05 |

## 4.2 Superseded pictured controls

The following items may appear in a source image but are intentionally replaced by approved GREEN decisions:

| Superseded item | Canonical replacement |
|---|---|
| Focus Area | Directness plus contextual Methodology suggestion |
| AI Model Preference | Model selector with Auto/Haiku/Sonnet/Opus |
| User Mode / Developer Mode | One adaptive interface plus Show advanced controls |
| Separate Attach and Context | One Add Context button and active context chips |
| Static Translate button | Translate & Ask with state check and review preference |
| Static AI Translation showcase | Genuine conversation thread with response cards |
| Permanent large Quick Actions section | 26-pixel expandable Quick Actions bar |
| Clear All | No canonical equivalent; safe session lifecycle actions replace it |
| Permanently expanded right-rail stack | One-open-at-a-time 26-pixel accordion system |
| Permanent Quick Tools grid | Optional Quick Tools card, disabled by default |

## 4.3 Mandatory acceptance tests

An implementation is not conforming until every item below passes.

### Visual and geometry

- [ ] Logical canvas is 1600 × 1024.
- [ ] Outer rectangles exactly match Sections 1.2–1.6.
- [ ] At 1600 × 1024, every component fits and Profile is fully visible.
- [ ] At 1200 × 768, the full canvas scales uniformly to 0.75 with no reflow.
- [ ] The conversation screen never displays a document scrollbar.
- [ ] Conversation thread is independently scrollable.
- [ ] Full composer, Translate & Ask, both utility bars, and Quick Actions remain visible.
- [ ] Compact bars are exactly 26 px high when closed.
- [ ] Popups, overlays, and drawers remain inside the logical canvas.
- [ ] Marble and all glass recipes use the exact tokens in Part 1.
- [ ] Active state uses electric blue; brand/structural accent uses gold.
- [ ] Text never renders directly over unsoftened marble.

### Interaction

- [ ] Every component follows its Part 2 entry and Part 3 state sequence.
- [ ] Double clicking never performs an action twice.
- [ ] Every popup closes by its specified methods and returns focus to its trigger.
- [ ] Escape never causes a destructive action.
- [ ] A second composer utility closes the first before opening.
- [ ] A second right-rail card collapses the first while maintaining fixed rail height.
- [ ] Technique permits zero to four manual choices and blocks a fifth with the specified message.
- [ ] State Detection never changes Model, Directness, Technique, or Methodology silently.
- [ ] Review first is the new-install default.
- [ ] Templates and Saved Prompts insert text but never send automatically.
- [ ] Edit and Refine create branches and preserve originals.
- [ ] Clear All is absent.
- [ ] Recent Sessions is optional and not in the center workspace.

### Recovery and errors

- [ ] Drafts recovery-save after 500 ms of inactivity.
- [ ] Navigation, New Session, Finish Session, import, export, and close trigger an immediate recovery write.
- [ ] A failed request preserves draft, prepared request, context, and selections.
- [ ] Retry occurs only after one explicit click; it never loops automatically.
- [ ] Destructive actions name the target and consequence.
- [ ] Discard/delete actions require confirmation and are not default focus.
- [ ] Recoverable destructive actions provide Undo.
- [ ] Removing a provider key or moving data explains the consequence before applying.

### Keyboard and accessibility

- [ ] Tab order is Topbar → Left navigation → Main workspace → Right rail.
- [ ] Enter/Space/Escape follow Section 2.0.
- [ ] Ctrl/Cmd+K opens Search.
- [ ] Ctrl/Cmd+Enter submits the composer.
- [ ] Ctrl/Cmd+Shift+N starts a new recovery-protected session.
- [ ] `?` opens Quick Reference outside text fields.
- [ ] Every keyboard-focused control shows the exact focus ring.
- [ ] Color is never the only indicator of selection, warning, success, or error.
- [ ] Reduced Motion removes spatial transitions and animated rotation.
- [ ] Large text does not rearrange the three columns.

### Decision traceability

- [ ] All 16 GREEN decisions in Section 4.1 are present.
- [ ] None of the superseded controls in Section 4.2 reappears as a canonical control.
- [ ] Any implementation change updates this document before code is accepted.

## 4.4 Final frozen statement

This document is the single implementation authority for the Divergence.AI light-mode conversation screen. The visual shell is the Light Gold Layout; the center interaction hierarchy is the Gold Light Version; and all behavior is the GREEN route from the Colored UI Decision & Behavior Map. The values, options, sizes, states, flows, and consequences above are explicit and complete. An implementation that changes them is a new design version, not a compliant interpretation of this one.
