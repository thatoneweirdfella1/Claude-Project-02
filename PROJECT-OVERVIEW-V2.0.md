# DIVERGENCE.AI
# PROJECT OVERVIEW & USAGE GUIDE
Version: 2.0

---

## WHAT IS THIS PROJECT?

Divergence.AI is an ADHD-friendly AI communication bridge. It's a middleware application that translates raw, unstructured user input into optimized prompts and routes them intelligently across appropriate Claude model tiers.

This is a **production interface implementation project**, not a concept or redesign.

---

## HOW TO USE THIS PROJECT

### If You're Claude Design:
1. Read this document (you're reading it now)
2. Read all four specification documents completely (no skipping)
3. Create the interface implementation faithful to the specifications
4. Treat the specifications as engineering documents, not inspiration

### If You're Claude Code:
1. Read this document
2. Read all four specification documents completely
3. Implement the features, behaviors, and logic faithful to the specifications
4. Reference specifications when building components, state management, and workflows

### If You're a New Session/Claude Instance:
1. Read this document first
2. It will tell you how to use the other four documents
3. Follow the decision process outlined below
4. Never invent solutions that contradict the specifications

---

## THE FOUR SPECIFICATION DOCUMENTS

Each document has a specific job. They are not interchangeable.

### Document 1: INFORMATION-ARCHITECTURE-V2.0

**Answers:** What exists? Where does it belong?

**Defines:**
- Overall application architecture
- Navigation structure
- Information hierarchy
- Screen organization
- Layout relationships
- User flows
- Feature placement

**Does NOT define:** Appearance, behavior, or interaction logic

**When to use:** When you need to know what should exist on a screen and where it should be located.

**Authority:** Final comprehensive layout image is the visual reference for spatial relationships.

---

### Document 2: FEATURE-SPECIFICATION-V2.0

**Answers:** How does it work?

**Defines:**
- Functional behavior of every feature
- AI workflows (translation, routing, techniques, etc.)
- User interactions and state changes
- Component behavior and states
- System capabilities and logic
- Functional requirements

**Does NOT define:** Appearance or visual treatment

**When to use:** When you need to understand how a feature functions, what states it has, how users interact with it, or what it outputs.

**Authority:** This is the functional specification. It is the source of truth for what the system does.

---

### Document 3: DESIGN-DECISION-HIERARCHY-V2.0

**Answers:** When specifications conflict or seem ambiguous, which takes priority?

**Defines:**
- A hierarchy of six design principles
- Decision tree for resolving conflicts
- Guidance on common scenarios
- Final authority rules

**Does NOT define:** What to build or how it should look

**When to use:** When two specifications seem to conflict, when you encounter ambiguity, or when you need to make a design choice not explicitly covered in the other documents.

**Authority:** This document has final say when everything else is unclear. Follow its hierarchy before inventing your own solution.

---

### Document 4: VISUAL-SPECIFICATION-V2.0

**Answers:** How does it look exactly?

**Defines:**
- Material system (Black Marble, Smoked Glass, Blue Marble, Light)
- Color palette and color philosophy
- Typography (fonts, sizes, weights, line heights)
- Spacing and layout (padding, margins, breathing room)
- Corners (radius values, soft vs. sharp)
- Shadows (soft, subtle separation)
- Borders (minimal, hairline)
- Interactive states (hover, active, disabled)
- Lighting and mood
- Visual hierarchy
- Iconography rules
- Overall aesthetic and mood

**Does NOT define:** What to build or how it functions

**When to use:** For every visual decision. This is the sole authority for appearance.

**Authority:** The final comprehensive layout image is the canonical visual reference. If this document and the image conflict, the image is always correct.

---

## THE DECISION PROCESS

Use this order. Never reverse it.

```
Step 1: INFORMATION-ARCHITECTURE
   ↓ Determine: What should exist? Where does it belong?
   
Step 2: FEATURE-SPECIFICATION
   ↓ Determine: How does it function? What are its states?
   
Step 3: DESIGN-DECISION-HIERARCHY
   ↓ Resolve: Are there conflicts? Which principle wins?
   
Step 4: VISUAL-SPECIFICATION
   ↓ Determine: How does it look exactly?
   
Result: Complete, consistent design decision
```

---

## KEY PRINCIPLES

### 1. The Specifications Are Engineering Documents

Treat them like you would treat a Figma file from a production design team.

Do not reinterpret them.
Do not redesign them.
Do not "improve" them.
Do not simplify them.
Do not modernize them.

**Implement them exactly.**

### 2. The Final Comprehensive Layout Image Is Canonical

The image that shows the entire interface with all accordion sections, all dropdowns, and all modals expanded simultaneously is the visual authority.

When in doubt about spacing, proportions, materials, or layout, refer to this image.

### 3. Consistency Is More Important Than Creativity

The interface should look like it was designed by one person using one design system.

Every button should work like every other button.
Every dropdown should behave like every other dropdown.
Every card should feel like it belongs to the same family.

Reuse patterns. Don't invent new ones.

### 4. Conversation Space Always Wins (After Visual Identity)

The conversation is the application.

The answer card is the largest element.
The textarea is always visible.
The primary action button is always accessible.

If something needs to be hidden, hide it via accordions, dropdowns, or visibility toggles.
Never shrink or redesign the core conversation area.

### 5. No Ambiguity Remains Unresolved

If you encounter a decision not explicitly covered in the documents, consult the DESIGN-DECISION-HIERARCHY-V2.0.

If that still doesn't resolve it, look at the final comprehensive layout image and ask: "How did the original designer handle this?"

Then copy that approach exactly.

---

## WHAT TO DO IF YOU GET STUCK

### Scenario 1: "The specifications seem to conflict."
→ Open DESIGN-DECISION-HIERARCHY-V2.0
→ Use the decision tree
→ Follow the priority order
→ The hierarchy will tell you which specification wins

### Scenario 2: "The specifications don't cover this edge case."
→ Open DESIGN-DECISION-HIERARCHY-V2.0
→ Look at the "Final Tiebreaker" section
→ Look at the final comprehensive layout image
→ Copy how the original designer handled it
→ Do not invent a new solution

### Scenario 3: "I'm not sure how this component should look."
→ Open VISUAL-SPECIFICATION-V2.0
→ Search for the component name (Button, Card, Dropdown, etc.)
→ Find the exact material, color, spacing, shadow, corner radius
→ Match it exactly
→ Do not interpret or vary

### Scenario 4: "I don't know where this feature belongs on the screen."
→ Open INFORMATION-ARCHITECTURE-V2.0
→ Find the feature in the document
→ It will tell you exactly where it belongs
→ Do not move it or reorganize the layout

### Scenario 5: "How does this feature work?"
→ Open FEATURE-SPECIFICATION-V2.0
→ Find the feature name
→ Read the full description of how it works, what states it has, how users interact with it
→ Implement those behaviors exactly

---

## WHAT NOT TO DO

❌ Do not skip reading the specifications
❌ Do not make assumptions before reading all four documents
❌ Do not reinterpret the specifications
❌ Do not invent components or interactions not in the specifications
❌ Do not change the layout from the final comprehensive layout
❌ Do not modernize or simplify the visual treatment
❌ Do not replace components with "better" alternatives
❌ Do not omit functionality
❌ Do not create new visual styles not in VISUAL-SPECIFICATION-V2.0
❌ Do not reverse the decision process order
❌ Do not use your own judgment to resolve conflicts (use DESIGN-DECISION-HIERARCHY-V2.0 instead)

---

## WHAT TO DO

✅ Read all four specifications completely
✅ Implement everything exactly as specified
✅ Follow the decision process in order
✅ Refer to the final comprehensive layout image
✅ Use the DESIGN-DECISION-HIERARCHY-V2.0 for conflicts
✅ Treat specifications as engineering documents
✅ Maintain consistency across every component
✅ Preserve visual identity exactly
✅ Maximize conversation space
✅ Keep controls close to their purpose

---

## FILE STRUCTURE

```
DIVERGENCE-AI-PROJECT/
├── PROJECT-OVERVIEW-V2.0.md (this file)
├── INFORMATION-ARCHITECTURE-V2.0.md
├── FEATURE-SPECIFICATION-V2.0.md
├── DESIGN-DECISION-HIERARCHY-V2.0.md
├── VISUAL-SPECIFICATION-V2.0.md
├── DIVERGENCE-AI-MASTER-SPECIFICATION-V2.0.md (combined)
└── [Final comprehensive layout image]
```

**Start here:** PROJECT-OVERVIEW-V2.0.md (you are here)
**Then read:** All four specification documents in any order
**Then reference:** As needed during implementation

---

## QUICK REFERENCE

| Question | Document |
|----------|----------|
| What should exist? Where does it belong? | INFORMATION-ARCHITECTURE-V2.0 |
| How does this feature work? | FEATURE-SPECIFICATION-V2.0 |
| These specifications conflict. Which wins? | DESIGN-DECISION-HIERARCHY-V2.0 |
| How should this look exactly? | VISUAL-SPECIFICATION-V2.0 |
| I need everything in one file | DIVERGENCE-AI-MASTER-SPECIFICATION-V2.0.md |

---

## AUTHORITY CHAIN

When making a decision:

1. **INFORMATION-ARCHITECTURE-V2.0** says what and where
2. **FEATURE-SPECIFICATION-V2.0** says how it works
3. **DESIGN-DECISION-HIERARCHY-V2.0** resolves conflicts
4. **VISUAL-SPECIFICATION-V2.0** says exactly how it looks
5. **Final comprehensive layout image** is the visual tiebreaker

If you're still uncertain after consulting these, you've found a gap. Document it and ask for clarification.

---

## IMPLEMENTATION CHECKLIST

Before starting implementation:

- ☐ I have read PROJECT-OVERVIEW-V2.0.md (this document)
- ☐ I have read INFORMATION-ARCHITECTURE-V2.0.md completely
- ☐ I have read FEATURE-SPECIFICATION-V2.0.md completely
- ☐ I have read DESIGN-DECISION-HIERARCHY-V2.0.md completely
- ☐ I have read VISUAL-SPECIFICATION-V2.0.md completely
- ☐ I understand the decision process (Info → Feature → Hierarchy → Visual)
- ☐ I have reviewed the final comprehensive layout image
- ☐ I understand that specifications are engineering documents, not suggestions
- ☐ I understand that the final comprehensive layout image is the visual authority
- ☐ I am ready to implement exactly as specified

---

## CONTACT AUTHORITY

If you have questions about:

- **What to build or where it belongs:** See INFORMATION-ARCHITECTURE-V2.0
- **How it functions:** See FEATURE-SPECIFICATION-V2.0
- **Conflicting specifications:** See DESIGN-DECISION-HIERARCHY-V2.0
- **How it looks:** See VISUAL-SPECIFICATION-V2.0
- **How to use this project:** You're reading it (PROJECT-OVERVIEW-V2.0)

Every question can be answered by one of these five documents.

---

**Version:** 2.0
**Status:** FINAL
**Purpose:** Guide AI instances through the Divergence.AI specification system
**Next Step:** Read all four specification documents, then implement

