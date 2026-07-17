# DIVERGENCE.AI BUILD LOG

## WHERE YOU ARE
Last completed: STEP 1.2 — Design tokens and CSS variables (done; tokens.css built, swatch page at public/token-swatch.html verified serving over HTTP with correct values; no in-browser pixel check possible in build env, cross-checked visually against the V3 screenshot image directly instead)
Next step: STEP 1.3 — TypeScript and build configuration
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
- [x] STEP 1.2 — Design tokens and CSS variables
- [ ] STEP 1.3 — TypeScript and build configuration
- [ ] STEP 1.4 — Runtime environment and dependencies
- [ ] STEP 1.5 — Routing engine wire-in (one string change: claude-sonnet-5)
- [ ] STEP 2.1 — Translation Engine specification
- [ ] STEP 2.2 — Routing engine integration and configuration
- [ ] STEP 2.3 — Routing engine tests (verification, not build)
- [ ] STEP 2.4 — Translation Engine verification (optional: needs 31_0_translation_test_cases.md)
- [ ] STEP 2.5 — Confidence coupling and gating logic
- [ ] STEP 3.1 — Marble slab system (background, cards, buttons)
- [ ] STEP 3.2 — Smoked Glass and layering (glassmorphism implementation)
- [ ] STEP 3.3 — Blue Marble buttons and earned color
- [ ] STEP 3.4 — Typography and spacing (MATERIALS.md)
- [ ] STEP 3.5 — Component styling and polish
- [ ] STEP 4.1 — Technique Selection engine specification
- [ ] STEP 4.2 — Technique matrix and conflict/dependency resolution
- [ ] STEP 4.3 — Auto-detect scoring and stacking (max 4 techniques)
- [ ] STEP 4.4 — Composition and prompt assembly
- [ ] STEP 5.1 — State Detection (Feature 5) on-demand classification
- [ ] STEP 5.2 — Pipeline orchestrator and stage flow
- [ ] STEP 5.3 — Execution and telemetry logging
- [ ] STEP 6.1 — Context management (upload, paste, URL fetch, variables)
- [ ] STEP 6.2 — Context Snapshot panel and persistence
- [ ] STEP 6.3 — Store contracts (Session store, Account store)
- [ ] STEP 7.1 — Feedback and 5-star rating UI
- [ ] STEP 7.2 — Rating storage and learning loop (after 15+ questions)
- [ ] STEP 8.1 — Transparency details card (Routing, Techniques, Confidence sub-cards)
- [ ] STEP 8.2 — Expandable transparency panel
- [ ] STEP 9.1 — Multi-AI Actions: Debate (two-column view)
- [ ] STEP 9.2 — Consensus and Synthesis (Opus-backed, after debate)
- [ ] STEP 9.3 — Replace/merge UI for synthesis results
- [ ] STEP 10.1 — Download and Export modal
- [ ] STEP 10.2 — Format support (Markdown, HTML, JSON, PDF)
- [ ] STEP 10.3 — Copy to clipboard
- [ ] STEP 11.1 — Session Management (New, Duplicate, Load Template, Close)
- [ ] STEP 11.2 — Saved Prompts and Import (file, URL, previous conversation, variables, context, template)
- [ ] STEP 11.3 — ADHD hard rules audit (cognitive load, time, sensory, decisions, persistence, feedback, accessibility)
- [ ] STEP 12.1 — Visibility Toggle and sidebar management (seven checkboxes, Quick Tools grid OFF by default)
- [ ] STEP 12.2 — Logged-in-by-default and autosave (5-second quiet background save)
- [ ] STEP 12.3 — Deploy and launch

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
