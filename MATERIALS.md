# DIVERGENCE.AI — MATERIALS AND VISUAL SYSTEM
**The single source of visual truth in text form. The V3 screenshot (Divergence_AI_App_Screenshot_V3.png) outranks this file where they disagree. This file replaces the visual sections of the retired spec files and the dead seven-material system.**

---

## THE THREE SURFACES (this is the whole material system)

There are three surfaces. Not seven. The old seven-name system (Graphite, Slate, Mist, Pearl, Obsidian, Onyx, Luminescence) is dead. Do not build it. "Light" is not a material, it is the lighting and reflection rules below.

**REVISED, operator-directed override, this session:** the two non-background surfaces (formerly Smoked Glass and Blue Marble) are replaced with a three-tone grey marble system — Black stays background-only; the two grey tiers this file always provisioned ("two greys, for the layered mid and light surfaces where the design calls for them," below) are now activated for that exact purpose. Real hex values, sampled by real per-pixel analysis of the locked texture files, not eyeballed:

**1. Black Marble (background only).** The entire viewport. Deep charcoal stone, #020202 to #060702 (Step 11.5, corrected against a real per-pixel sample of the locked black-marble-slab.jpg). Polished, subtle veining, barely noticeable, matte lustre not mirror.

**2. Medium Gray Marble (interactive elements — buttons, nav, borders).** Warm neutral grey, #2A2925 to #302F2B — sampled from public/textures/medium-gray-marble-slab.jpg (renamed from grey-marble-slab-1.jpg to match its measured darkness; the lighter of the two provisioned grey textures, used here, not for content, so interactive elements read as the most prominent tier: background < content < interactive). **REVISED again, operator-directed, this session:** now actually RENDERS medium-gray-marble-slab.jpg as its background texture (soft-light blended over the gradient base), not the black slab tinted grey as before — its own real grey stone, not a color trick. Marble texture visible at close inspection, fixed-world-scale tiling so it never stretches per button (same non-stretching technique the slab itself uses). Glossy but stone, not plastic. Soft internal glow at the top suggesting light on a curve, not neon. Minimum 44px clickable. White text.

**3. Dark Grey Marble (content areas — messages, dialogs, cards, panels).** Dark neutral grey, #161513 to #1E1D1A — sampled from public/textures/dark-grey-marble-slab.jpg (renamed from grey-marble-slab-2.jpg to match its measured darkness; the darker of the two provisioned grey textures, recedes closer to the black background so content doesn't compete with interactive elements). Translucent glass, 88 to 92 percent opaque, heavy background blur (glassmorphism) — that mechanic is unchanged. **REVISED, operator-directed, this session: NOW CARRIES ITS OWN MARBLE TEXTURE** (dark-grey-marble-slab.jpg, soft-light blended over the translucent base color, fixed-world-scale tiling, never stretched to the element). This reverses the prior "never carries its own marble" rule for this tier specifically — see THE SLAB RULE below, which now names two exceptions instead of one. Hairline darker-charcoal edge. Corners 12 to 16px on cards, 8 to 12px on buttons. Never fully opaque.

---

## THE SLAB RULE (this is the one fourteen branches broke)

The background marble is ONE continuous slab behind the entire viewport, at z-index 0, sampled at 100 percent scale, with a constant background-size and shared origin, tiling seamlessly. It is never regenerated per component. It is never rescaled to fit a button or card. Veins do not scale with window size, only the amount of visible slab changes when the window resizes.

**REVISED, operator-directed, this session — two exceptions now, not one:** Medium Gray Marble buttons and Dark Grey Marble content surfaces both now render their own marble texture (medium-gray-marble-slab.jpg and dark-grey-marble-slab.jpg respectively), using the exact same fixed-world-scale, never-stretched tiling technique as the background slab itself. This is a deliberate departure from the original "one sole exception, same slab coordinates as the background" framing — these two tiers no longer read as literally the same continuous piece of stone as the black background (they're different texture files), but the specific failure mode this rule existed to prevent — texture stretching, scaling, or distorting per component, creating visible seams or mismatched patches — still cannot happen, because every textured surface uses the identical non-stretching mechanism (`background-size: var(--slab-tile-size)`, native pixel scale, `background-repeat: repeat`). What changed is WHICH surfaces show texture and WHICH file they sample, not HOW texture is safely rendered when it appears. Verified with a real rendered capture at two viewport widths (1525px, 900px): no seam, no stretching, vein scale identical across both.

Enforceable checks, still true for the background slab and now checked the same way for the two textured tiers: on window resize across a 300px range, vein width and spacing stay identical. No visible seam anywhere. No stretching. No component shows a lighter or darker rectangle where texture was cleared. The bottom margin shows a full-width band of slab crossing all three columns.

Three texture files are provided and all three now have active consumers: one black marble (background only), two greys (Medium Gray for the interactive tier, Dark Grey for the content tier — see above).

---

## COLOR

**Monochrome base (85 percent of the interface).** White and gray. Body text white or very light gray. Secondary text muted gray. Tertiary text further reduced opacity.

**Earned color, used sparingly and with meaning.** Cyan #00D9FF for secondary interactive elements, section headers, links, the gear icon, checkboxes, dropdown arrows. Medium Gray Marble for primary buttons and active selection only (operator-directed override, this session — was Blue Marble; see THE THREE SURFACES). Purple #8B5CF6 for the logo "AI" text and for state pills (Emotion pill is purple, this is intended). Red for destructive actions only (Close Session, Replace Answer).

**State pill colors (from the screenshot).** Emotion purple, RSD red, Interest green, Cognitive Mode blue. These are earned-color exceptions for UX clarity and override any "no rogue colors" rule in the old files.

---

## TYPOGRAPHY

Font family: Anthropic Sans or an equivalent clean sans-serif.

Section headers 12px, all caps, cyan, light weight. Card titles 14px, weight 500, white. Body and answers 14px, weight 400, white, line-height 1.6. Labels 14px, weight 500, white. Secondary labels 12px, weight 400, muted gray. Metadata 12px, weight 400, opacity 0.6. Never use weight 600 or heavier.

---

## SPACING, CORNERS, SHADOWS

Padding: buttons 12px vertical and 16px horizontal minimum, cards and panels 20px minimum, inputs 12px, dropdowns and modals 12px. Margins: 24px or more between major sections, 16px or more between rows, 12px or more between list items.

Corners: cards and panels 12 to 16px, buttons 8px. No sharp elements. Borders minimal, prefer depth over visible borders; if needed use a 0.5px hairline in subtle darker charcoal or cyan.

Shadows, for separation only, never decorative, single shadow with no layers. Card: 0 2px 8px rgba(0,0,0,0.15). Dropdown and modal: 0 4px 16px rgba(0,0,0,0.2).

---

## OVERALL MOOD

Luxury, quiet, confident. Premium desktop software, not a colorful website. Polished stone you could touch, not a flat digital screen. Intentional and minimal. The golden rule: every screen should look designed by the same person who made the V3 screenshot. Do not modernize, simplify, or reinterpret. Continue that look.
