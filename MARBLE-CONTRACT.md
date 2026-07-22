# DIVERGENCE.AI — MARBLE CONTRACT

**Written at Step 1.3. Binding for every step and every agent that touches the marble system.
Where this file and MATERIALS.md disagree, MATERIALS.md wins (it is CANON-authoritative); this
file exists to state MATERIALS.md's slab rule enforceably, not to add to it.**

---

## THE RULE

Marble is ONE continuous slab behind the entire viewport: `position: fixed`, `inset: 0`,
`z-index: 0`, 100% scale, constant `background-size`, shared origin `background-position: 0 0`,
seamless tiling via `background-repeat: repeat`. Never regenerated, never rescaled per component.

Everything else — every column, panel, card, pill, bar, modal, and piece of text — renders in one
sibling layer at `z-index: 1`. That layer occludes the slab; it does not repaint it.

**Two deliberate exceptions, as of an operator-directed override this session (previously one — see
BUILD-LOG.md DECISIONS for the full account of both changes):**

- **Medium Gray Marble buttons** (renamed from Blue Marble) sample `medium-gray-marble-slab.jpg`
  directly, using the same fixed-world-scale, `background-attachment: fixed` construction as
  before — but as of this session's second override, it is its OWN grey texture file, not
  `black-marble-slab.jpg` tinted. It no longer reads as "the same continuous piece of stone as the
  background" (a different file now) — it reads as its own grey stone surface. What's preserved
  from the original exception is the non-stretching, viewport-fixed sampling mechanism, not the
  literal same-texture-as-background claim.
- **Dark Grey Marble content surfaces** (cards, panels, dialogs, messages — renamed from Smoked
  Glass) NOW ALSO carry their own marble texture, `dark-grey-marble-slab.jpg`, using the identical
  non-stretching tiling technique (`background-size: var(--slab-tile-size)`, native scale,
  `background-repeat: repeat`, no `background-attachment: fixed` since these aren't claiming
  continuity with a global viewport-fixed background). This reverses "no component carries its own
  marble, one sole exception" for this tier specifically. See DEVIATION section below.

Both are CANON/MATERIALS.md requirements as of this session, not violations of "no per-component
marble" — the rule now names two exceptions instead of one.

## THE ASSETS

Two tiers. See FILE-MANIFEST-STEP1.3-ADDENDUM.md for full provenance and the seam-tiling finding
that necessitated the split (the root FILE-MANIFEST.md is the real Step 0 deliverable and predates
the texture files being supplied; the addendum covers what Step 0 couldn't have known).

**Rendered (what the CSS actually loads) — all three now have active `url()` consumers, as of the
texture-application override this session:**
- `public/textures/black-marble-slab.jpg` — the slab background only, as of this session (previously
  also the Medium Gray Marble buttons' layer; the button now samples its own grey texture — see
  below). Seamless 2508×2508 mirrored supertile.
- `public/textures/medium-gray-marble-slab.jpg` (renamed, this session, from
  `grey-marble-slab-1.jpg` to match its measured darkness) — the Medium Gray Marble buttons' and
  nav's marble layer (`.surface-blue-marble`, marble.css), `background-attachment: fixed`, same
  non-stretching technique as the slab. Seamless 2508×2508 mirrored supertile.
- `public/textures/dark-grey-marble-slab.jpg` (renamed, this session, from `grey-marble-slab-2.jpg`)
  — the Dark Grey Marble content layer (`.surface-smoked-glass`, marble.css: cards, panels,
  dialogs, messages), `background-repeat: repeat` at native scale, no `background-attachment` (not
  viewport-fixed — see DEVIATION). Seamless 2508×2508 mirrored supertile.

All three were previously used only for real per-pixel color sampling (the hex values now in
tokens.css for `--surface-black-marble-*`, `--surface-blue-marble-*`, `--surface-smoked-glass`) —
this session's texture-application override additionally wired `medium-gray-marble-slab.jpg` and
`dark-grey-marble-slab.jpg` into actual `url()` backgrounds, not just color extraction.

**Canonical source (not loaded by any component, kept as source of record):**
- `public/textures/black-marble.png`, `medium-gray-marble.png`, `dark-grey-marble.png` (renamed,
  this session, from `grey-marble-1.png`/`grey-marble-2.png`) — the raw 1254×1254 originals as
  supplied. Do not point CSS at these; they do not tile seamlessly (see
  FILE-MANIFEST-STEP1.3-ADDENDUM.md).

World scale is fixed at `--slab-tile-size: 2508px` (tokens.css), matching the rendered assets'
native resolution. Forbidden on the slab: `cover`, `contain`, percentages, `vw`, `vh`, `auto` —
anything viewport-relative rescales veins on resize.

## THE MECHANISM

1. `.marble-slab` (src/styles/marble.css): the one marble element, mounted once, as a sibling to
   the app content — never nested inside it, so no ancestor can pick up a transform/filter/
   backdrop-filter that would silently convert `position: fixed` into scrolling behavior.
2. `.app-layer`: `position: relative; z-index: 1`, wraps all app content (`AppShell`'s root).
3. `.surface-smoked-glass` (Dark Grey Marble, cards/panels/dialogs/messages): REVISED, operator-
   directed override this session — now carries `dark-grey-marble-slab.jpg` as its own texture,
   `background-blend-mode: soft-light` over the translucent base color, fixed-world-scale tiling
   (`background-size: var(--slab-tile-size)`), never stretched to the element. Translucency +
   `backdrop-filter: blur()` are unchanged; texture is additive, not a replacement for the glass
   mechanic. No `background-attachment: fixed` — unlike the slab/button, this tier isn't claiming
   viewport-coordinate continuity with anything, just showing its own consistently-scaled patch of
   stone.
4. `.surface-blue-marble` (Medium Gray Marble, buttons/nav): uses `background-attachment: fixed` on
   its marble layer only (never on the slab itself — see DEVIATION below) so its
   `background-position: 0 0` resolves against the viewport the same way the slab's does — same
   construction as before, not per-button position tuning. REVISED, operator-directed override this
   session: the sampled image itself changed from `black-marble-slab.jpg` to
   `medium-gray-marble-slab.jpg` — same mechanism, different source file.

## DEVIATION FROM PRIOR ART, STATED EXPLICITLY

A prior investigation into these same three source textures (MAX Effort - Marble Design Output /
MARBLE-SLAB-ENFORCEMENT-CONTRACT.md) forbade `background-attachment: fixed` outright, everywhere,
reasoning it is broken on iOS Safari and forces full repaints on scroll. That contract is right
about the slab itself — this build's `.marble-slab` uses `position: fixed`, not
`background-attachment: fixed`, exactly as that contract prescribes.

But that prior contract also banned marble texture on every component, with no exceptions —
because in its source design (a different, pre-CANON mockup), no component needed one. Current
MATERIALS.md, which is CANON-authoritative and postdates that prior work, explicitly requires
Blue Marble buttons to carry marble texture. Satisfying that requirement without per-button
JavaScript position tuning (itself forbidden by the same prior contract, for good reason — it
drifts on layout changes) requires `background-attachment: fixed` on the button's texture layer.
That is a narrower, bounded use the prior contract never had to rule on, not a rejection of its
reasoning. See BUILD-LOG.md DECISIONS for the full account.

## ENFORCEABLE CHECKS (for Step 11.4 and any step touching this system)

1. Resize the window across a 300px range: vein width and spacing stay identical on the slab AND
   on any Medium Gray Marble / Dark Grey Marble surface visible in the viewport; only the visible
   area changes, never the vein scale. Checked at 1525px and 900px this session (real rendered
   capture, not assumed) — consistent at both.
2. No visible seam anywhere in `black-marble-slab.jpg`, `medium-gray-marble-slab.jpg`, or
   `dark-grey-marble-slab.jpg` on repeat (this is what the supertile fix applies to all three — do
   not swap any of them back to the raw 1254px files with `background-repeat`).
3. **REVISED, operator-directed override this session — reversed from the original rule:** Dark
   Grey Marble cards, pills, bars, panels, and modal interiors NOW DELIBERATELY SHOW vein content
   (soft-light blended, subtle enough to keep 14px body text legible — checked with a real
   rendered capture of the right-rail accordion rows and the composer textarea, not assumed). The
   original "zero vein content inside Smoked Glass" check no longer applies to this tier; verify
   instead that text stays legible and the texture stays subtle, not that it's absent.
4. The bottom margin (`calc(100vh - var(--space-section-margin))` on `.app-shell`) shows a
   full-width band of slab crossing all three columns.
5. No ancestor of `.marble-slab` carries `transform`, `filter`, `backdrop-filter`, `perspective`,
   `will-change: transform`, `contain: paint/layout`, or `content-visibility` — any of these
   detaches `position: fixed` silently.
6. Exactly one `.marble-slab` element in the document at any time.
