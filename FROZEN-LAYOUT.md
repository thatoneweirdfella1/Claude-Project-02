# DIVERGENCE.AI FROZEN LAYOUT AUTHORITY

**Effective:** 2026-08-10  
**Status:** FINAL, FROZEN, SUPERSEDING

## Sole visual authority

These two files are the only authoritative layout references:

1. `docs/frozen-layout/MAIN-Light-LAYOUT-DIVERGENCE-FROZEN.svg`
2. `docs/frozen-layout/MAIN-Dark-LAYOUT-DIVERGENCE-FROZEN.svg`

They are the same frozen product shell in light and dark mode. Every older screenshot, mockup, layout, visual audit, material rule, color rule, spacing rule, implementation note, and inferred design decision is obsolete wherever it disagrees with either reference.

## Authority order

1. The two frozen reference images above
2. `src/styles/frozen-reference.css`
3. This document
4. Product functionality specifications
5. Every older visual/layout source

An older file must never be used to reinterpret, average, soften, replace, or override the frozen references.

## Frozen shell

The following structure is permanent across every screen:

- Full-width branded header with the gold brain mark, `Divergence.AI`, and `ADHD-to-AI Translator`
- Translucent integrated left navigation rail
- Framed translucent center workspace
- Deliberate connector gutter containing the electric-blue network paths and nodes
- Translucent structured right rail containing Quick Tools and independently expandable information panels
- Continuous theme-specific marble visible beneath every translucent region

Changing screens changes only the information inside the center workspace. It does not replace the header, rails, workspace frame, materials, spacing system, typography, or connector architecture.

## Light mode

- Pale gray, silver-gray, and warm-gray translucent glass over cream/gray marble with fine gold veins
- Marble remains visible through the header, both rails, workspace, cards, controls, and modules
- Black or charcoal text
- Thin pale borders and restrained gray shadows
- Electric blue for active state, selected information, connectors, and nodes
- Gold is limited to branding and marble veins
- No opaque dark sidebars
- No flat gray navigation pills
- No bare white-marble document page in the center

## Dark mode

- Smoked translucent black glass over black marble with gold and restrained white veins
- Fine warm-gold borders, icons, labels, and action details
- Electric blue for active state, connected data, connectors, and nodes
- Light gray body text
- Marble is subdued beneath work surfaces so it never competes with text
- No raw text directly on fully exposed marble
- No stack of opaque black navigation pills
- No detached opaque utility drawer

## Permanent prohibitions

The obsolete implementation must not return. Specifically prohibited:

- Broken-image logo or duplicated `Divergence.AI` text
- Opaque dark sidebars in light mode
- Separate pill behind every inactive navigation item
- Unframed scrolling webpage in the center
- Native-looking unstyled form controls
- Bright native scrollbar dividing center and right rail
- Detached Session Cost box
- Header credit counter in the frozen shell
- Native minimize/maximize/close controls inside the product composition
- Random multicolor Quick Tools icons
- Revolving-door accordion restriction; reference panels may remain open together
- Removing the electric-blue connector network
- Treating a theme change as a background-only replacement

## Reference viewport

The canonical reference viewport is `1543 × 1019`. The implementation may contract responsively below that size, but the region order, hierarchy, materials, active-state language, and relative proportions must remain recognizable and unchanged.

## Change gate

No AI, contributor, automation, visual audit, or older repository instruction may alter this shell unless the user explicitly supplies a newer replacement reference and explicitly states that it supersedes this frozen layout.
