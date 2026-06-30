# DIVERGENCE.AI
# DESIGN DECISION HIERARCHY
Version: 2.0

---

## PURPOSE

When two design goals conflict, use this hierarchy to decide which principle wins.

This document prevents invention of new solutions. Instead, it points to the established authority: the final comprehensive layout image.

---

## THE HIERARCHY (in priority order)

### Priority 1: Preserve Visual Identity

Never sacrifice the established aesthetic.

The final comprehensive layout image is the canonical visual authority. Every component must appear carved from the same materials (Black Marble, Smoked Glass, Blue Marble, Light).

Every surface, color, texture, spacing, corner radius, shadow, and proportion must match the reference image exactly.

If a feature requires visual treatment not shown in the layout, design it as though the original designer would have—using the same materials, proportions, and sensibility.

**When it conflicts with anything else:** Visual identity always wins.

**Example:** If adding a feature makes the interface feel cluttered, don't simplify the visual language. Instead, find another solution (hide it, move it, reorganize it via accordion, toggle via gear menu).

**Reference:** Master image defines: color palette, material system, spacing, typography scale, corner radii, shadows, gloss levels, texture treatment.

---

### Priority 2: Maximize Conversation Readability

Never reduce conversation space unless absolutely necessary.

The conversation is the application. Everything else exists to support it.

The answer card must always receive maximum visual priority.

The textarea must always be accessible.

The TRANSLATE & ASK button must never be hidden or obscured.

If the interface feels cramped, don't reduce answer text size, padding, or spacing. Instead:
- Use accordion collapses to hide non-essential sidebar sections (via ⚙️ gear toggle)
- Move secondary features to modals
- Reuse dropdowns instead of showing all options at once
- Hide sections behind "View All" links that expand to main area

**When it conflicts with anything else:** Conversation space wins. (Except Priority 1, which is higher.)

**Example:** If the right sidebar and answer card can't both fit comfortably:
- Don't shrink the answer card
- Instead, hide sidebar sections via visibility toggle (⚙️)
- Or collapse accordion sections to thin title bars
- Conversation always gets priority

---

### Priority 3: Keep Controls Close to Where They Are Used

Place controls near the action they trigger.

Model/Directness/Technique dropdowns belong in the input area (not settings panel).

Attach/Context buttons belong in input area (not sidebar or top bar).

Feedback buttons belong below answer (not somewhere else).

Download belongs on answer card (not separate menu).

State detection pills appear below textarea (not in sidebar).

**When it conflicts with anything else:** Proximity wins. (Except Priorities 1 and 2.)

**Example:** If adding a control to the input area makes it feel crowded:
- Don't move the control to sidebar
- Instead, nest it in a dropdown
- Or expand it via modal when clicked
- Keep controls near their purpose

---

### Priority 4: Reduce Navigation Depth

Get users to content in fewest clicks.

But don't do this by inventing new visual patterns or breaking Priority 1.

Prefer dropdowns over hidden menus.
Prefer inline expansion over modals (when possible).
Prefer visible options over buried options.
Prefer "View All" links that expand in main area over small preview panes.

**When it conflicts with anything else:** Navigation depth wins. (Except Priorities 1, 2, and 3.)

**Example:** If showing all options makes the interface feel too full:
- Don't hide them completely
- Instead, use dropdowns (like Model/Directness/Technique)
- Or use accordion collapses (like right sidebar sections)
- Or use "View All" links (like Recent Sessions)
- Keep options findable in ≤2 clicks

---

### Priority 5: Consistency Beats Novelty

Reuse established patterns instead of inventing new ones.

Every dropdown should work the same way.
Every button should behave the same way.
Every card should feel like it belongs to the same family.
Every accordion should follow revolving-door behavior.
Every modal should overlay with semi-transparent background.

If a feature needs a new interaction pattern, make sure it's because no existing pattern fits—not because you want something "better."

**When it conflicts with anything else:** Consistency wins. (Except Priorities 1-4.)

**Example:** If a dropdown could be more elegant as a custom select box:
- Don't do it
- Use the same dropdown pattern already established (Model, Directness, Technique)
- Consistency matters more than elegance

---

### Priority 6: Never Invent Visual Patterns When Existing Ones Can Be Reused

The component library exists so you don't invent.

If a button exists, use that button.
If a dropdown exists, use that dropdown.
If an accordion exists, use that accordion.
If a modal pattern exists, use that pattern.

Copy. Don't redesign.

**When it conflicts with anything else:** Reuse wins. (Except Priorities 1-5.)

**Example:** If you need to show a list of options and a dropdown already exists:
- Use the dropdown
- Don't invent a custom list widget
- Don't create a new interaction pattern

---

## DECISION TREE

Use this when you encounter a design problem:

```
Does this conflict with visual identity?
  YES → Use Priority 1 (Preserve Visual Identity)
        Ref: Master image material system, colors, spacing, typography
  NO → Continue

Does this conflict with conversation readability?
  YES → Use Priority 2 (Maximize Conversation Readability)
        Use: Accordions, visibility toggle, modals, dropdowns
  NO → Continue

Does this conflict with control proximity?
  YES → Use Priority 3 (Keep Controls Close)
        Keep: Model/Directness/Technique near input
        Keep: Attach/Context near input
        Keep: Feedback/Download near answer
  NO → Continue

Does this conflict with navigation depth?
  YES → Use Priority 4 (Reduce Navigation Depth)
        Use: Dropdowns (≤2 clicks)
        Use: Accordions (expand in place)
        Use: "View All" links (expand to main area)
  NO → Continue

Does this conflict with consistency?
  YES → Use Priority 5 (Consistency Beats Novelty)
        Match: Existing button/dropdown/accordion patterns
  NO → Continue

Is there an existing component I can reuse?
  YES → Use Priority 6 (Never Invent)
        Reuse: Exact component, exact behavior
  NO → Make the decision based on the final layout image
```

---

## WHAT THIS MEANS IN PRACTICE

**When you encounter a problem:**

Instead of thinking: "How should I redesign this?"

Think: "Which priority rule applies?"

Then: "How did the original designer handle this in the layout image?"

Then: Copy that approach.

**Example 1: "The answer card and right sidebar don't fit."**
- Priority 2 wins: Maximize conversation readability
- Solution: Hide sidebar via ⚙️ visibility toggle or collapse accordions
- Don't: Shrink answer card, reduce padding, or change layout

**Example 2: "I need to show more context options but input area is full."**
- Priority 3 says controls should be near their use
- Solution: Nest context options in a modal (keeps them reachable but doesn't clutter input)
- Don't: Move context to sidebar or top bar

**Example 3: "The dropdown menu looks slightly different from the reference."**
- Priority 1 wins: Preserve visual identity
- Solution: Match the reference image exactly (same spacing, same material, same gloss)
- Don't: "Adjust slightly" to fit aesthetic preference

**Example 4: "Recent Sessions takes up too much space."**
- Priority 2 wins: Maximize conversation readability
- Solution: Collapse Recent Sessions to thin title bar (accordion behavior)
- Don't: Shrink the list or reduce item count

**Example 5: "I need a new interaction pattern for this feature."**
- Check Priority 5 and 6 first
- Does an existing pattern work? Use it.
- Only invent a new pattern if truly no existing pattern fits
- When you do invent, make sure it matches Priority 1 (visual identity)

---

## DECISION TABLE (Common Scenarios)

| Problem | Solution | Why | Priority |
|---------|----------|-----|----------|
| Interface feels cluttered | Hide non-essential sidebar sections via ⚙️ toggle | Preserves visual identity + conversation space | 1 + 2 |
| Two dropdowns look slightly different | Match reference image exactly (same radius, spacing, material) | Visual identity is law | 1 |
| User can't find a feature | Use dropdown or accordion (max 2 clicks) instead of burying in modals | Navigation depth | 4 |
| Control is far from where it's used | Move control closer or make behavior obvious (e.g., Context modal is obviously modifying context) | Control proximity | 3 |
| New feature needs new button style | Use existing button pattern (smoked glass or blue marble) | Consistency + reuse | 5 + 6 |
| Right sidebar too full | Collapse accordion sections or hide via visibility toggle | Conversation space + visual identity | 2 + 1 |
| Dropdown doesn't fit in space | Redesign layout to fit dropdown, not the dropdown itself | Consistency + identity | 5 + 1 |
| Too many options visible | Nest in dropdown or accordion, don't invent new interaction | Navigation depth + consistency | 4 + 5 |

---

## THE FINAL TIEBREAKER

If the decision tree doesn't clearly resolve something, look at the final comprehensive layout image.

Ask: "How did the original designer handle this exact situation?"

Copy that approach.

Never invent.

---

## DESIGN REVIEW CHECKLIST

Before approving any new screen or feature, ask:

**Visual Identity:**
- ☐ Does it match the reference image materials (Black Marble, Smoked Glass, Blue Marble, Light)?
- ☐ Are colors correct (Cyan, Blue, Purple, White/Gray)?
- ☐ Does spacing feel right (breathing room, not cramped)?
- ☐ Do corner radii match (large, soft, consistent)?

**Conversation Priority:**
- ☐ Is the answer card still the largest visual element?
- ☐ Is the textarea still visible and accessible?
- ☐ Is TRANSLATE & ASK button visible and accessible?
- ☐ Did I hide something to make space, or did I redesign something?

**Control Proximity:**
- ☐ Are controls placed near the actions they trigger?
- ☐ Would a user naturally look for this control in this location?

**Navigation Depth:**
- ☐ Can user reach this feature in ≤2 clicks?
- ☐ Are options findable without drilling through menus?

**Consistency:**
- ☐ Does this pattern already exist elsewhere?
- ☐ If yes, am I using the exact same pattern?
- ☐ If no, is there truly no existing pattern that works?

**Component Reuse:**
- ☐ Did I reuse an existing component or invent a new one?
- ☐ If new, is it absolutely necessary?

---

**Version:** 2.0 (Updated from final comprehensive layout)
**Authority:** Final comprehensive layout image + this hierarchy
**Purpose:** Resolve design conflicts without inventing
**Status:** Final decision framework
