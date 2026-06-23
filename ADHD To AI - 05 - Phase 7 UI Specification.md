# Phase 7: UI Design Specification

**Design Direction: Locked — Fluent/Microsoft Design System**

Chosen over 3 alternatives (dark minimal, Norton security dashboard, detective case-file) after visual mockup review. Selected for: professional appearance, long-term scalability, low novelty-fatigue risk, familiar interaction patterns.

---

## 27.0 — Design Tokens

### Color
| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#faf9f8` | App background |
| `--surface` | `#ffffff` | Cards, panels |
| `--surface-alt` | `#f3f2f1` | Secondary surfaces, hover states, footer bars |
| `--border` | `#e1dfdd` | All dividers and card borders |
| `--text` | `#201f1e` | Primary text |
| `--text-secondary` | `#605e5c` | Labels, metadata, captions |
| `--accent` | `#0078d4` | Primary actions, links, active states |
| `--accent-hover` | `#106ebe` | Hover state for accent elements |
| `--accent-light` | `#deecf9` | Active tab backgrounds, info highlights |
| `--success` | `#107c10` | Confidence indicators, completed states |
| `--success-light` | `#dff6dd` | Technique pills, positive backgrounds |
| `--warning` | `#797673` | Neutral/muted warning text |

### Typography
- **Primary font:** Segoe UI (fallback: -apple-system, BlinkMacSystemFont, sans-serif)
- **Title bar text:** 13px, weight 600
- **Card titles:** 13px, weight 600
- **Body/answer text:** 14px, line-height 1.6
- **Labels/metadata:** 11-12px, text-secondary color
- **Buttons:** 13px, weight 600

### Spacing & Shape
- Border radius: 2-4px (sharp, not rounded — Fluent signature)
- Card shadow: `0 0.6px 1.8px rgba(0,0,0,0.108), 0 3.2px 7.2px rgba(0,0,0,0.132)`
- Card padding: 18px standard, 14px for compact list items
- Max content width: 760px, centered

---

## 28.0 — Screen Inventory

### 28.1 Main Screen (Compose) — ✅ Designed
Components, top to bottom:
1. **Title bar** — app icon, name, connection status, current model badge
2. **Ribbon** — Compose (active) / History / Settings / Techniques tabs
3. **Input card** — textarea + Edit/Translate buttons
4. **Translation results card** — confidence %, progress bar, numbered question list with per-question model badges
5. **Techniques card** — pill row of applied techniques
6. **Answer card** — response text + feedback bar (thumbs up/down + comment icon)

### 28.2 History Screen — Not yet designed
**Purpose:** Browse past translated questions, see which model/techniques were used, see your feedback/ratings over time.

**Required components:**
- List view, reverse chronological
- Each row: original input (truncated), model used, date, star rating if given
- Filter by: model used, date range, rating
- Click row → expand to full transparency stack (reuse Compose screen's card components)

### 28.3 Settings Screen — Not yet designed
**Required components:**
- Default model preference (or "let it decide")
- Confidence threshold overrides (advanced — hidden by default per 6.14 thresholds)
- Feedback style preference (star + optional comment vs. behavioral-only, per 24.1-24.3 decision)
- Clear history / data controls
- Technique stack limits override (advanced — defaults from 15.9: Haiku 6, Opus-Fast 9, Opus-Thinking 6)

### 28.4 Techniques Reference Screen — Not yet designed
**Purpose:** Browse the 18-technique registry (T01-T18) for transparency/curiosity, not required for daily use.

**Required components:**
- Card per technique: name, category, what it does, token cost
- Searchable/filterable by category
- This is a "look under the hood" screen — low priority, can be deferred past MVP

---

## 29.0 — Component Library

Reusable components extracted from the Compose screen mockup, to be used consistently across all screens.

### 29.1 Card
Standard container. White surface, 1px border, subtle shadow, 4px radius. Header row (title + status indicator) optionally separated by border from body.

### 29.2 Status Dot
8px circle, success-green by default. Indicates "ready"/"active" state in card headers.

### 29.3 Progress Bar
4px height, surface-alt track, success-green fill. Used for confidence visualization.

### 29.4 Question List Item
Numbered circle badge (accent-light bg, accent text) + question text + right-aligned model badge (pill, surface-alt bg).

### 29.5 Technique Pill
Pill-shaped, success-light bg, success-color text, 12px font weight 600. Used wherever a technique name needs to display compactly.

### 29.6 Icon Button
28x28px, 2px radius, border, surface bg. Hover state: accent-light bg + accent border/text. Used for thumbs up/down/comment actions.

### 29.7 Button (Primary/Secondary)
Primary: accent bg, white text, no border. Secondary: surface bg, border, text color. Both 2px radius — sharper than typical button radius, matches Fluent's flatter aesthetic.

---

## 30.0 — Interaction Patterns

### 30.1 Translation Flow
1. User types in input card, clicks Translate
2. Translation results card appears below with confidence bar + numbered questions
3. Techniques card appears showing applied techniques
4. Answer card appears last with the response
5. All cards animate in sequentially (per existing mockup's stagger pattern) — NOT all at once, to respect ADHD processing pace and avoid overwhelming the user with a wall of content appearing instantly

### 30.2 Feedback Flow (per Phase 6 decision: 24.1-24.3)
Implemented as: 5-star widget (unselected by default, low visual weight) + comment field that activates (full opacity) only when a star is clicked. If ignored, falls back to behavioral inference with an explicit confirm step ("Was this helpful?" yes/no) — never silently presumed.

**Fluent-styled version of this pattern:** Replace raw star icons with icon-button thumbs up/down (more Fluent-native) as the primary action, with an optional comment icon (💬) that reveals a text field on click. This achieves the same "visible but not demanding" principle from the original design while feeling native to the Fluent system rather than borrowed from a different visual language.

### 30.3 Override Flow
Every transparency card includes a low-emphasis text link (not a button) for overriding that stage's decision — "Edit" on input, future "override model" on routing, future "add/remove techniques" on composition. These stay visually quiet (text-secondary color, no border) so they don't compete with the primary flow but remain discoverable.

### 30.4 Confidence-Based Behavior (per 6.14 / 21.2)
- Confidence ≥ 80%: proceed automatically, show results normally
- Confidence 60-79%: proceed automatically, but show a visible (not alarming) note — small text-secondary annotation near the confidence bar, e.g. "interpreted with moderate confidence"
- Confidence < 60%: do not auto-proceed. Show clarifying question card (using templates from 20.2) in place of the translation results card.
- Routing confidence < 60% (per 21.2 decision): automatically defaults to higher-cost model tier — no user-facing interruption, may show a small annotation noting the upgrade ("routed up for reliability")

---

## 31.0 — Responsive Behavior

- Desktop/tablet: max-width 760px centered layout (as designed)
- Mobile: cards go full-width with reduced padding (14px instead of 18px), ribbon tabs collapse to icon-only or a dropdown, title bar stays fixed
- Given primary use context is the Claude mobile app environment, mobile layout is NOT an afterthought — it should be treated as the default target, with desktop as the expanded view

---

## 32.0 — Accessibility & ADHD-Specific Design Notes

- Sequential card animation (not simultaneous reveal) reduces cognitive load — one decision surface at a time
- All interactive elements need visible keyboard focus states (Fluent convention: 2px accent outline)
- Color is never the only signal — status always paired with text label (e.g., green dot AND the word "Ready", not just the dot)
- No auto-playing animation beyond the initial card-reveal stagger — reduced motion should disable even that
- Override links use plain language ("Edit", "override model") not system jargon, per the writing principles in frontend-design skill

---

## NEXT STEPS FOR PHASE 7

Remaining undesigned: 28.2 (History), 28.3 (Settings), 28.4 (Techniques Reference). These are lower priority than the Compose screen since they're not part of the core per-question flow. Recommend deferring detailed visual design until Phase 8 (Testing) reveals whether users actually need to browse history/settings frequently, or building minimal versions now using the component library already established in 29.0 so nothing blocks Phase 8 testing.
