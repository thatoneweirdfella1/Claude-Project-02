# DIVERGENCE.AI FROZEN LAYOUT AUTHORITY

**Effective:** 2026-08-11  
**Status:** FINAL, FROZEN, SUPERSEDING  
**Canonical viewport:** `1543 × 1019`

## Light-mode truth sources

These three files are the complete and absolute authority for light mode:

1. `docs/frozen-layout/light/LIGHT GOLD LAYOUT - IMAGE_2_ONLY_LIGHT_SPECS.md`
2. `docs/frozen-layout/light/LIGHT GOLD LAYOUT - MAIN LAYOUT DIVERGENCE FROZEN.png`
3. `docs/frozen-layout/light/LIGHT GOLD LAYOUT - LIGHT_MODE_IMAGE_AUDIT.md`

The PNG is the visual reference implementation. The specification defines what must be built. The 11-section audit is the required verification gate. All eleven sections must pass.

These files supersede every older light screenshot, layout, audit, material rule, color rule, spacing rule, implementation note, and inferred design decision wherever a conflict exists. Earlier light references and the obsolete `original` layout must never be restored, averaged with, or used to reinterpret them.

## Dark-mode truth source

Dark mode continues to use `docs/frozen-layout/MAIN-Dark-LAYOUT-DIVERGENCE-FROZEN.svg`. Dark mode is the same frozen shell; only its permitted theme colors and material values differ.

## Authority order

1. The three light-mode truth sources above for light mode
2. The dark reference above for dark mode
3. `src/styles/frozen-reference.css`
4. This document
5. Product functionality specifications
6. Every older visual/layout source

## Frozen geometry

The header height, grid, column positions, rail widths, workspace width, connector gutter, panel locations, section heights, padding, margins, borders, radii, typography hierarchy, and icon sizing are locked to the reference image.

Changing screens changes only the information inside the center workspace. It does not replace or reposition the header, navigation rail, workspace frame, right rail, material system, typography, or connector architecture.

## Light material system

- Muted gray-beige marble with fine gold veining
- One continuous softened slab beneath every region
- Pale translucent gray frosted glass throughout
- Thin white, silver, or pale-gray borders
- Subtle inset highlights and restrained exterior shadows
- Black/deep-charcoal text and outline icons
- Gold only for branding and structural accents
- Electric blue for active selections, connected information, paths, nodes, and data values
- Transparent navigation rows; only Translate receives the pale-blue active surface
- Context Snapshot, Token Usage, and Active Session open together with the audited values when no live data exists

## Permanent prohibitions

- Any `original`/alternate layout switch
- Opaque dark sidebars in light mode
- Separate solid pills behind inactive navigation items
- Unframed raw content over exposed marble
- Unstyled native controls or native scrollbar dividing regions
- Broken or duplicated branding
- Header credit counter, detached Session Cost box, or in-composition window controls
- Random multicolor Quick Tools icons
- Revolving-door accordion behavior
- Missing connector network
- Background-only theme swapping that leaves the wrong materials in place
- “Similar,” “inspired by,” approximate, or creatively interpreted replacements

## Change gate

No AI, contributor, automation, older repository instruction, or visual audit may alter this shell unless the user explicitly supplies a newer replacement truth source and explicitly states that it supersedes this frozen layout.
