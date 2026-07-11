# DIVERGENCE.AI
# Quick Reference Guide
**For Developers & Designers**

---

## MATERIAL QUICK REFERENCE

### Dark Theme Color Palette

```
Graphite:       #0D0B0F  (Background)
Slate:          #1A1823  (Cards/Panels)
Mist:           #2D2540  (Hover/Feedback)
Pearl:          #3D3650  (Active States)
Obsidian:       #404040  (Borders - Primary)
Onyx:           #303030  (Borders - Subtle)
Luminescence:   #E0E0E0  (Text)
```

### Light Theme Color Palette

```
Ash:            #F5F5F5  (Background)
Silver:         #FFFFFF  (Cards/Panels)
Pearl:          #F0F0F0  (Hover/Feedback)
```

### CSS Variables Template

```css
:root {
  /* Dark Theme */
  --material-graphite: #0D0B0F;
  --material-slate: #1A1823;
  --material-mist: #2D2540;
  --material-pearl: #3D3650;
  --material-obsidian: #404040;
  --material-onyx: #303030;
  --material-luminescence: #E0E0E0;
  
  /* Light Theme */
  --material-ash: #F5F5F5;
  --material-silver: #FFFFFF;
  --material-pearl-light: #F0F0F0;
  
  /* Accent Colors */
  --color-cyan: #00D9FF;
  --color-blue-marble: #2B4E9C;
  --color-purple: #8B5CF6;
  --color-red-destructive: #EF4444;
}
```

---

## LAYOUT QUICK REFERENCE

```
Top Bar:        60px fixed, full width, Slate material
Left Sidebar:   200px fixed, Slate material
Main Area:      flex-grow, center
  - Input Card: Slate material
  - Answer:     Slate material with Luminescence text
Right Sidebar:  300px fixed, Slate material
```

**Key Constraint:** If anything doesn't fit, hide it via ⚙️ toggle or accordion collapse. Never shrink answer card.

---

## MATERIAL HIERARCHY (Luminance Order)

**Darkest (Recessive) → Lightest (Prominent)**

```
1. Graphite (#0D0B0F)    - Background/Foundation
2. Slate (#1A1823)       - Cards/Panels
3. Onyx (#303030)        - Subtle Borders
4. Mist (#2D2540)        - Hover/Feedback
5. Pearl (#3D3650)       - Active States
6. Obsidian (#404040)    - Primary Borders
7. Luminescence (#E0E0E0) - Text/Content
```

---

## DECISION TREE (Simplified)

```
Conflict? Check this order:
  1. Visual Identity (master image is law)
  2. Conversation Readability (answer card is sacred)
  3. Control Proximity (keep controls near actions)
  4. Navigation Depth (≤2 clicks to any feature)
  5. Consistency (reuse existing patterns)
  6. Existing Components (never invent)
```

**Still Stuck?** Look at master layout image. Copy that approach exactly.

---

## COMPONENT PATTERNS

### Button Pattern

```
Default:  Slate background, white text, 14px, 12px v / 16px h padding
Hover:    20% brighter, subtle shadow increase
Active:   Pearl background or Cyan accent
Disabled: 50-60% opacity, not-allowed cursor
```

### Dropdown Pattern

```
Closed:   Label (white 14px) + Arrow (cyan) on Slate, 40px height
Open:     Menu below, white text on Slate, hover = brightening, selected = Pearl/Cyan
Click:    Open on first click, select on second, close after selection
```

### Accordion Pattern

```
Collapsed: Cyan text 12px all-caps + Chevron (►) right
Expanded:  Content below, Chevron becomes (▼)
Behavior:  Revolving-door (only one expanded), clicking same accordion = collapse all
```

### Modal Pattern

```
Background: Transparent black overlay (rgba(0,0,0,0.45))
Panel:      Centered, Slate material, 12px radius, 24px padding
Title:      14px weight 500 white, cyan underline
Buttons:    Primary = Pearl, Secondary = Slate, Destructive = Red
```

---

## SPACING QUICK REFERENCE

**Standard Padding:**
- Buttons: 12px vertical, 16px horizontal
- Cards: 20px minimum
- Inputs: 12px
- Modals: 24px

**Standard Margins:**
- Major sections: 24px+
- Between rows: 16px+
- Between items: 12px+

---

## TYPOGRAPHY QUICK REFERENCE

**Font:** Anthropic Sans (fallback: system sans-serif)

**Sizes & Weights:**
- Section Headers: 12px, all-caps, cyan, light weight
- Card Titles: 14px, weight 500, Luminescence
- Body Text: 14px, weight 400, Luminescence, line-height 1.6
- UI Labels: 14px, weight 500, Luminescence
- Small Text: 12px, weight 400, reduced opacity
- Metadata: 12px, weight 400, opacity 0.6

**Weights:** Only 400 (regular) and 500 (medium). Never 600 or 700.

---

## CORNER RADIUS QUICK REFERENCE

- Cards/Panels: 12-16px
- Buttons: 8px
- Dropdowns/Modals: 12px

---

## SHADOW QUICK REFERENCE

**Card:** offset 0 2px, blur 8px, opacity 0.15
**Dropdown/Modal:** offset 0 4px, blur 16px, opacity 0.2
**Hover Elevation:** offset 0 4px, blur 12px, opacity 0.2

---

## MARBLE RULES (CRITICAL)

1. **Load once, sample many times** — One global continuous slab
2. **Never regenerate** — Load uploaded images only
3. **100% canonical scale** — Never scale marble by component size
4. **Veins flow naturally** — Across component boundaries
5. **Clipping masks, not paint** — Buttons reveal Controls material beneath
6. **Continuous coordinate system** — Button at (100,200) samples different marble than card at (100,400)

---

## COLOR USAGE RULES

**Cyan (#00D9FF):** Secondary interactives, headers, links, dropdown arrows
**Blue Marble (#2B4E9C–#4478E5):** Primary action buttons ONLY
**Purple (#8B5CF6):** Logo "AI" text ONLY
**White/Gray (Luminescence #E0E0E0):** All text, all labels
**Red:** Destructive actions ONLY

---

## ADHD-FRIENDLY FEATURES

- **State Detection Pills:** Show emotional/cognitive state below textarea
- **Visibility Toggle (⚙️):** Hide features to reduce clutter
- **Accordion Collapse:** Organize information, show on demand
- **Clear Hierarchy:** Important actions stand out
- **Generous Spacing:** Don't feel cramped
- **High Readability:** Warm gray text on dark backgrounds

---

## CHECKLIST BEFORE IMPLEMENTATION

- [ ] Reviewed master layout image
- [ ] Understand four-layer marble philosophy
- [ ] Know which material for each component
- [ ] Understand layout (200px | flex | 300px)
- [ ] Understand feature specifications
- [ ] Know design decision hierarchy
- [ ] Marble images loaded (not regenerated)
- [ ] CSS variables set up
- [ ] Understand "never redesign existing" rule
- [ ] Know to reference this document when stuck

---

## QUICK ANSWERS

**Q: What color should this button be?**
A: Slate by default, Pearl on hover/active, Blue Marble if primary action (TRANSLATE & ASK, Download)

**Q: Where should this control go?**
A: Check Information Architecture. If still unsure, check master layout image.

**Q: How much spacing?**
A: Generous. Default to 16px+ between sections, 12px between items.

**Q: Can I invent a new component pattern?**
A: No. Check Priority 6 of Design Decision Hierarchy. Reuse existing patterns.

**Q: The design looks different from my vision.**
A: Check master layout image. That's the canonical authority.

**Q: Should I regenerate the marble?**
A: No. Never. Load uploaded images only.

**Q: What if two specifications conflict?**
A: Follow Design Decision Hierarchy. Visual Identity (Priority 1) always wins.

---

## CRITICAL INVIOLABLE RULES

1. Visual Identity ≥ Everything Else
2. Never shrink answer card
3. TRANSLATE & ASK always visible
4. Textarea always accessible
5. Materials never regenerated
6. Marble never faked
7. Existing UI never redesigned without approval
8. Existing code never duplicated
9. 100% canonical marble scale (never changes)
10. Existing architecture preserved

---

**Reference:** DIVERGENCE-AI-MASTER-SPECIFICATION.md (complete authority)
**Master Image:** Final comprehensive layout (visual tiebreaker)

