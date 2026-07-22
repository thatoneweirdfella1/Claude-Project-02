# FILE-MANIFEST-STEP1.3-ADDENDUM.md

**Written at Step 1.3, as an addendum — not the Step 0 manifest.** The real Step 0 manifest was
genuinely produced at Step 0; it just wasn't saved into this project folder at the time, so it
couldn't be found when Step 1.3 looked for it. This file was written to unblock Step 1.3 without
it, under the mistaken belief that Step 0's manifest had never existed at all. That belief was
wrong — the real one surfaced later and now lives at `FILE-MANIFEST.md` in the repo root, which is
the authoritative Step 0 deliverable. This file is kept alongside it, renamed, because the texture
file findings below (extension correction, tiling-seam measurement, rendered-asset mapping) were
discovered during Step 1.3 itself and are still accurate and still in use — they simply postdate
the real Step 0 manifest and were never going to be in it. See BUILD-LOG.md DECISIONS for the same
correction.

---

## MARBLE TEXTURE FILES

Three texture files were provided (2026-07-17) for MATERIALS.md's THE SLAB RULE: one black
marble background, two greys. As delivered, their extensions did not all match their actual file
type — checked by magic-byte inspection, not by trusting the filename.

| Role | Source filename | Extension claimed | Actual type (magic bytes) | Saved as |
|---|---|---|---|---|
| Black Marble (background) | `Black Marble 03.jpg` | `.jpg` | PNG (`89 50 4E 47`) | `public/textures/black-marble.png` |
| Grey 1 | `Light Gray Marble 01.png` | `.png` | PNG (`89 50 4E 47`) | `public/textures/grey-marble-1.png` |
| Grey 2 | `Medium Gray Marble 02.png` | `.png` | PNG (`89 50 4E 47`) | `public/textures/grey-marble-2.png` |

`Black Marble 03.jpg` is a PNG despite the `.jpg` extension. Saved with a `.png` extension to
match its real content, per instruction to name files by actual type rather than the source
filename's claim.

## KNOWN ISSUE — NOT A BLOCKER

The two grey files are visually near-identical to the black marble file: same vein pattern,
barely distinguishable tone, not genuinely distinct textures. This was flagged by the person
supplying the files and deliberately deferred — a cosmetic fix for later, not something Step 1.3
or any step before Step 11.4 should stop on. Do not attempt to fix, regenerate, or replace these
textures as part of using them. See BUILD-LOG.md PARKED for the tracked follow-up.

## RENDERED SLAB ASSETS — NOT THE SAME FILES AS ABOVE

The three raw files above are 1254x1254px. Measured in prior work ("MAX Effort - Marble Design
Output" folder, MARBLE-SLAB-ENFORCEMENT-CONTRACT.md), raw textures at that resolution do not tile
seamlessly — wrap discontinuity of 1.6x-2.9x the adjacent-pixel baseline, which reads as a visible
seam on `background-repeat: repeat`. That folder's source files are the same three originals
above (`Black_Marble_03.jpg`, `Light_Gray_Marble_01.png`, `Medium_Gray_Marble_02.png` — underscored
filenames, same content, confirmed by matching 1254x1254 dimensions), and it already built
seamless fix: 2508x2508 mirrored 2x2 supertiles, measured wrap discontinuity 0.00.

Those pre-built supertiles were copied into this repo and are what the slab CSS actually
references as `background-image` — the raw files above are kept only as the canonical source of
record, not loaded by any component.

| Rendered role | Built from (raw file above) | Copied from | Saved as |
|---|---|---|---|
| Black Marble slab (dark, in-use) | `black-marble.png` | `marble-slab-dark-070706.jpg` | `public/textures/black-marble-slab.jpg` |
| Grey slab 1 (light exposure, reserved) | `grey-marble-1.png` | `marble-slab-light-2D2C28.jpg` | `public/textures/grey-marble-slab-1.jpg` |
| Grey slab 2 (mid exposure, reserved) | `grey-marble-2.png` | `marble-slab-mid-1A1917.jpg` | `public/textures/grey-marble-slab-2.jpg` |

Only `black-marble-slab.jpg` has an active consumer (the Black Marble background and Blue Marble
buttons, per MATERIALS.md's THE SLAB RULE — buttons sample from the same slab coordinates as the
background). The two grey slabs are reserved, unused by any component: CANON.md's three-surface
system (Black Marble, Smoked Glass, Blue Marble) has no defined use for a fourth "grey marble"
surface yet. See BUILD-LOG.md DECISIONS for the full reasoning and PARKED for the follow-up.
