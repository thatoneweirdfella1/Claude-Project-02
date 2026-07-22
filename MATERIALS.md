# DIVERGENCE.AI — MATERIALS AND VISUAL SYSTEM
**The single source of visual truth in text form. The V3 screenshot (Divergence_AI_App_Screenshot_V3.png) outranks this file where they disagree. This file replaces the visual sections of the retired spec files and the dead seven-material system.**

---

## THE THREE SURFACES (this is the whole material system)

There are three surfaces. Not seven. The old seven-name system (Graphite, Slate, Mist, Pearl, Obsidian, Onyx, Luminescence) is dead. Do not build it. "Light" is not a material, it is the lighting and reflection rules below.

**1. Black Marble (background).** The entire viewport. Deep charcoal stone, #0B0C0E to #151618. Polished, subtle veining, barely noticeable, matte lustre not mirror. Sampled from the provided black marble texture file.

**2. Smoked Glass (cards and panels).** Dark translucent glass, 88 to 92 percent opaque so the marble slab blurs through it. Heavy background blur (glassmorphism). Hairline darker-charcoal edge. Corners 12 to 16px on cards, 8 to 12px on buttons. Never opaque. Never carries its own marble.

**3. Blue Marble (primary buttons only).** Deep sapphire, #2B4E9C to #4478E5. Marble texture visible at close inspection, sampled from the same slab coordinates as the background. Glossy but stone, not plastic. Soft internal glow at the top suggesting light on a curve, not neon. Minimum 44px clickable. White text.

---

## THE SLAB RULE (this is the one fourteen branches broke)

The marble is ONE continuous slab behind the entire viewport, at z-index 0, sampled at 100 percent scale, with a constant background-size and shared origin, tiling seamlessly. It is never regenerated per component. It is never rescaled to fit a button or card. Veins do not scale with window size, only the amount of visible slab changes when the window resizes.

Cards and panels are Smoked Glass layered on top of that one slab, letting it blur through. Blue Marble buttons are the only surfaces that sample marble directly, and they sample from the same slab coordinates so the stone reads continuous.

Enforceable checks: on window resize across a 300px range, vein width and spacing stay identical. No visible seam anywhere. No stretching. No component shows a lighter or darker rectangle where texture was cleared. The bottom margin shows a full-width band of slab crossing all three columns.

Three texture files are provided: one black marble (background), two greys (for the layered mid and light surfaces where the design calls for them).

---

## COLOR

**Monochrome base (85 percent of the interface).** White and gray. Body text white or very light gray. Secondary text muted gray. Tertiary text further reduced opacity.

**Earned color, used sparingly and with meaning.** Cyan #00D9FF for secondary interactive elements, section headers, links, the gear icon, checkboxes, dropdown arrows. Blue Marble for primary buttons and active selection only. Purple #8B5CF6 for the logo "AI" text and for state pills (Emotion pill is purple, this is intended). Red for destructive actions only (Close Session, Replace Answer).

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
