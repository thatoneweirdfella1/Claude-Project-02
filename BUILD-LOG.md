# DIVERGENCE.AI BUILD LOG

## WHERE YOU ARE
Last completed: STEP 1.2 — Design tokens and CSS variables (done; tokens.css built, swatch page at public/token-swatch.html verified serving over HTTP with correct values; no in-browser pixel check possible in build env, cross-checked visually against the V3 screenshot image directly instead)
Next step: STEP 1.3 — Marble slab architecture
Blocked: nothing

## DECISIONS
- Locked decisions verified: three-marble system (not seven), claude-sonnet-5 for Balanced tier, state detection on button press (not live-as-you-type), routing engine already built (not rebuilt).
- Routing engine string change identified: routing.js needs claude-sonnet-5 update in MODELS table (Step 2.2 applies this).
- Texture files location clarified as needed before Step 3.1 (three files: one black marble, two greys).
- Translation test corpus (31_0_translation_test_cases.md) marked as optional for Step 2.4; not blocking current progress.
- STACK LOCKED (Step 1.1): React 19 + TypeScript + Vite 8 SPA; Zustand for the two CANON stores; IndexedDB via `idb` (CANON mandates IndexedDB by name); vanilla CSS custom properties for the marble/glass system (Tailwind and CSS-in-JS rejected); Tauri for Windows wrap, Capacitor for Android. Svelte 5 and SolidJS seriously considered, rejected because 58 remaining blind sessions make ecosystem predictability worth more than marginal reactivity gains. Full reasoning in STACK.md.
- Frame implemented as CSS grid (`grid-template-areas`), not nested flex: one declaration encodes all four locked dimensions (60/200/flex/300), harder for a later step to break one region in isolation. Regions carry data-testids: topbar, col-left, col-center, col-right.
- Layout dimensions live as CSS custom properties in src/styles/layout.css (--topbar-height, --left-col-width, --right-col-width); Step 1.2 tokens should extend this pattern in src/styles/tokens.css (created empty as a landing point).
- Vite 8 template ships oxlint (not eslint) — kept as-is rather than swapping.
- FONT (Step 1.2): Anthropic Sans (named in MATERIALS.md) is not publicly licensed and cannot ship. Substituted Inter (SIL OFL, freely shippable) as --font-family-base — closest clean humanist-geometric sans at the same register, and the de facto standard at the 12-14px sizes this whole type scale runs at. Only the stack is fixed here; loading/self-hosting the actual font file is Step 3.4's job, not this one.
- COLOR VALUES NOT GIVEN AS EXACT HEX (Step 1.2): MATERIALS.md/CANON.md give exact hex only for Black Marble, Blue Marble, cyan (#00D9FF), and purple (#8B5CF6). RSD, Interest, and Cognitive Mode pill colors are named only by hue ("red", "green", "blue"). Picked --state-rsd/--action-destructive #EF4444, --state-interest #22C55E from the screenshot by eye. --state-cognitive #3B9EFF deliberately kept distinct from Blue Marble's #2B4E9C-#4478E5 range so a state pill never visually reads as a button. --state-emotion aliases directly to --accent-purple (#8B5CF6) per MATERIALS.md's explicit statement they're the same purple. A later session with real pixel-sampling tools should verify these three against the screenshot and adjust the token values only (no component touches these directly).
- RADIUS (Step 1.2): MATERIALS.md gives cards a 12-16px range, buttons a flat 8px. --radius-button is 8px (unambiguous). --radius-card is fixed at 14px, the range's midpoint, as a single token a later step can retune without touching any component.
- TOKEN FILE ARCHITECTURE (Step 1.2): flat single-tier custom properties in tokens.css, no primitive/alias indirection layer. Simpler than a two-tier system and CONVENTIONS.md only asks for domain-prefixed semantic names, not a primitive layer — revisit only if token reuse patterns actually demand it later.
- SWATCH PAGE (Step 1.2): public/token-swatch.html, a static HTML file referencing /src/styles/tokens.css directly. Dev-only, not linked from AppShell or main.tsx, not part of the shipped bundle — exists purely so a session with a real browser can open it and eyeball every token at once against the screenshot.

## PARKED
- Marble texture files: location/source to be clarified before Step 3.1 (Marble system build). Not blocking Step 0 completion.
- Translation corpus: available for Step 2.4 (Translation verification) if needed; not required for Steps 1–2.2.
- No headless browser exists in the build environment and browser downloads are blocked by the network allowlist, so Step 1.1 layout was verified by serving the app and asserting the grid CSS values over HTTP plus a clean production build — not by rendered-pixel screenshot. First step run in an environment with a browser should eyeball the frame once.
- Vite template's public/ shipped favicon.svg and icons.svg placeholders; replace when the logo (CANON "THE LOGO") is built.
- Step 1.2's three eyeballed pill colors (RSD, Interest, Cognitive Mode — see DECISIONS) are waiting on a future session with real pixel-sampling tools to confirm against the screenshot; current values are a confident visual match, not a measured one.
- Inter is referenced by --font-family-base but the font file itself is not yet loaded/self-hosted anywhere in the repo; waiting on Step 3.4 (Typography and spacing application).

## STEPS
- [x] STEP 0 — File inventory and manifest
- [x] STEP 1.1 — Repo scaffold and stack lock
- [x] STEP 1.2 — Design token system
- [ ] STEP 1.3 — Marble slab architecture
- [ ] STEP 1.4 — Glass and marble primitives
- [ ] STEP 1.5 — Layout shell and top bar
- [ ] STEP 1.6 — Logo
- [ ] STEP 1.7 — Dual-store state architecture
- [ ] STEP 1.8 — Autosave and restore
- [ ] STEP 1.9 — Keyboard framework
- [ ] STEP 1.10 — API proxy and model registry
- [ ] STEP 2.1 — Gap taxonomy and prompt spec
- [ ] STEP 2.2 — Translation engine
- [ ] STEP 2.3 — Confidence gates and clarify flow
- [ ] STEP 2.4 — Test corpus harness
- [ ] STEP 3.1 — Six-dimension scorer
- [ ] STEP 3.2 — Decision logic and override
- [ ] STEP 3.3 — Low-confidence escalation
- [ ] STEP 4.1 — Technique registry and matrix
- [ ] STEP 4.2 — Scoring and stacking
- [ ] STEP 4.3 — Composition engine
- [ ] STEP 4.4 — Directness control
- [ ] STEP 4.5 — Technique selector UI
- [ ] STEP 5.0 — Input composer and control row
- [ ] STEP 5.1 — Streaming display
- [ ] STEP 5.2 — Pipeline orchestrator
- [ ] STEP 5.3 — Error, retry, timeout
- [ ] STEP 5.4 — Telemetry
- [ ] STEP 6.1 — Detection architecture
- [ ] STEP 6.2 — Four-dimension classifier prompt
- [ ] STEP 6.3 — State pills UI
- [ ] STEP 6.4 — Correction learning
- [ ] STEP 6.5 — State feeds
- [ ] STEP 7.1 — File upload and limits
- [ ] STEP 7.2 — OCR pipeline
- [ ] STEP 7.3 — URL fetch
- [ ] STEP 7.4 — Variables
- [ ] STEP 7.5 — Context Snapshot panel
- [ ] STEP 8.1 — Feedback rating
- [ ] STEP 8.2 — Transparency card
- [ ] STEP 8.3 — Debate mode
- [ ] STEP 8.4 — Consensus and Synthesis
- [ ] STEP 8.5 — Download and export
- [ ] STEP 9.1 — Session lifecycle
- [ ] STEP 9.2 — Templates and saved prompts
- [ ] STEP 9.3 — Import system
- [ ] STEP 9.4 — Visibility toggle
- [ ] STEP 9.5 — Revolving-door accordions
- [ ] STEP 9.6 — Quick Tools grid
- [ ] STEP 9.7 — Left nav content
- [ ] STEP 10.1 — Pattern analysis engine
- [ ] STEP 10.2 — Rule refinement application
- [ ] STEP 11.1 — ADHD hard rules audit
- [ ] STEP 11.2 — Performance pass
- [ ] STEP 11.3 — Keyboard audit
- [ ] STEP 11.4 — Visual verification
- [ ] STEP 11.5 — Apply the audit fixes
- [ ] STEP 12.1 — Unit tests
- [ ] STEP 12.2 — End to end flows
- [ ] STEP 12.3 — Deploy

---

## STEP 0 NOTES

**File inventory complete.** All four source-of-truth docs present and consistent.

**What's here:**
- CANON.md, MATERIALS.md, PIPELINE.md, ROUTING.md (source of truth, verified aligned)
- FINDINGS.md, README.md (reference docs, no conflicts)
- Divergence_AI_App_Screenshot_V3.png (visual truth, authoritative)
- routing.js and tests.js (assumed present in repo, not attached; routing.js needs one string update)

**What's missing or clarified:**
- Three texture files (black marble background, two greys): location/source to be confirmed before Step 3.1
- Translation test corpus (31_0_translation_test_cases.md): optional, needed only if Step 2.4 is run

**Locked decisions verified:** All four are consistent across all files. No conflicts to resolve.

**Next:** Step 1.1 (Repo scaffold) can proceed immediately. No blockers.
