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

**The one deliberate exception:** Medium Gray Marble buttons (renamed from Blue Marble — operator-
directed three-tone grey override, see BUILD-LOG.md DECISIONS) sample marble texture directly, from
the same slab coordinates as the background, so the stone reads as one continuous piece showing
through a cutout rather than a separate patch. This is a CANON/MATERIALS.md requirement, not a
violation of "no per-component marble" — it is the sole named exception to that rule. The override
changed the button's base gradient COLOR only; it still samples `black-marble-slab.jpg`, not a grey
texture — see THE ASSETS below for why.

## THE ASSETS

Two tiers. See FILE-MANIFEST-STEP1.3-ADDENDUM.md for full provenance and the seam-tiling finding
that necessitated the split (the root FILE-MANIFEST.md is the real Step 0 deliverable and predates
the texture files being supplied; the addendum covers what Step 0 couldn't have known).

**Rendered (what the CSS actually loads):**
- `public/textures/black-marble-slab.jpg` — the slab background AND the Medium Gray Marble
  buttons' marble layer. Seamless 2508×2508 mirrored supertile. Only asset with an active `url()`
  consumer — this did not change with the grey override; introducing a second texture image into
  the button would break the one-continuous-slab illusion (the background stays Black Marble).
- `public/textures/medium-gray-marble-slab.jpg`, `dark-grey-marble-slab.jpg` (renamed, this
  session, from `grey-marble-slab-1.jpg`/`grey-marble-slab-2.jpg` to match their measured
  darkness — see BUILD-LOG.md DECISIONS). Seamless supertiles. No active `url()` consumer — CANON's
  three-surface system still has no defined use for a fourth, separately-rendered "grey marble"
  surface — but as of the grey override they DO have an active use as a COLOR-SAMPLING source: real
  per-pixel analysis of these two files produced the hex values now in tokens.css for Medium Gray
  Marble (`--surface-blue-marble-start/-end`) and Dark Grey Marble (`--surface-smoked-glass`).

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
3. `.surface-smoked-glass`: cards/panels. No texture, ever. Stone shows through by transparency +
   `backdrop-filter: blur()` only.
4. `.surface-blue-marble`: the one exception. Uses `background-attachment: fixed` on its marble
   layer only (never on the slab itself — see DEVIATION below) so its `background-position: 0 0`
   resolves against the viewport exactly as the slab's does. Same image, same size, same origin —
   construction, not per-button position tuning.

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

1. Resize the window across a 300px range: vein width and spacing stay identical; only the
   visible slab area changes.
2. No visible seam anywhere in `black-marble-slab.jpg` on repeat (this is what the supertile fixes
   — do not swap back to the raw 1254px files with `background-repeat`).
3. Zero vein content inside any Smoked Glass card, pill, bar, panel, or modal interior.
4. The bottom margin (`calc(100vh - var(--space-section-margin))` on `.app-shell`) shows a
   full-width band of slab crossing all three columns.
5. No ancestor of `.marble-slab` carries `transform`, `filter`, `backdrop-filter`, `perspective`,
   `will-change: transform`, `contain: paint/layout`, or `content-visibility` — any of these
   detaches `position: fixed` silently.
6. Exactly one `.marble-slab` element in the document at any time.
