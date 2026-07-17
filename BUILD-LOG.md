# DIVERGENCE.AI BUILD LOG

## WHERE YOU ARE
Last completed: STEP 1.3 — Marble slab architecture (done; production build clean, dev server verified serving the app, tokens.css, marble.css, and all six texture files correctly over HTTP; a fresh-context subagent audited the implementation against MATERIALS.md's slab rule and MARBLE-CONTRACT.md with no findings; no in-browser resize/pixel check possible in build env — see PARKED)
Next step: STEP 1.4 — Glass and marble primitives
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
- FILE-MANIFEST.md BACKFILLED AT STEP 1.3, NOT STEP 0: Step 0's STEPS checkbox claimed this deliverable done, but the file was never written or saved anywhere in the project tree — discovered when Step 1.3's REQUIRED FILES check looked for it. Written now, explicitly logged as a Step 1.3 catch-up, not a retroactive claim that Step 0 produced it. Documents the three marble texture files: source filenames, the .jpg-extension-but-actually-PNG correction on the black marble file, and the near-identical-textures flag (see PARKED).
- TEXTURE FILES DO NOT TILE SEAMLESSLY AS PROVIDED (Step 1.3): the three raw texture files are 1254x1254px. A prior investigation into these same three source files (MAX Effort - Marble Design Output / MARBLE-SLAB-ENFORCEMENT-CONTRACT.md — confirmed same files by matching 1254x1254 dimensions and matching descriptive names) measured that raw textures at this resolution do not tile seamlessly (wrap discontinuity 1.6x-2.9x baseline), which reads as a visible seam on background-repeat. That prior work already built the fix: seamless 2508x2508 mirrored supertiles (measured wrap discontinuity 0.00). Per explicit instruction, those pre-built supertiles were copied into this repo as `public/textures/black-marble-slab.jpg`, `grey-marble-slab-1.jpg`, `grey-marble-slab-2.jpg` and are what marble.css actually references as background-image. The three raw originals (`black-marble.png`, `grey-marble-1.png`, `grey-marble-2.png`, saved at Step 1.3) are kept only as canonical source of record per FILE-MANIFEST.md — no component loads them. Full detail in MARBLE-CONTRACT.md and FILE-MANIFEST.md.
- PRIOR-ART FOLDERS ARE UNVERIFIED UNTIL CONFIRMED (Step 1.3, explicit instruction for all future steps): the "Fable - MAX Effort - Marble Design Output" folder turned out to contain a directly relevant, verified prior investigation (used at Step 1.3, above), but that was confirmed with the person running this build before being used, not assumed. Any future step that finds other pre-existing output in that directory (or elsewhere outside the repo) must not use it on its own judgment — flag it and ask first, the same way Step 1.3 did.
- SLAB ARCHITECTURE (Step 1.3): one `.marble-slab` element (`position: fixed; inset: 0; z-index: 0`), mounted once in main.tsx as a sibling to `<AppShell />` (never nested inside it, so no ancestor can pick up a transform/filter/backdrop-filter that would silently break `position: fixed`). All app content wrapped in `.app-layer` (`position: relative; z-index: 1`) — currently just AppShell's root div. Technique ported directly from MARBLE-SLAB-ENFORCEMENT-CONTRACT.md's proven architecture (that prior work explicitly found `background-attachment: fixed` broken on iOS Safari and repaint-costly, using `position: fixed` on the slab instead — adopted here for the same reason).
- BLUE MARBLE BUTTON DEVIATES FROM PRIOR CONTRACT, DELIBERATELY (Step 1.3): the prior MARBLE-SLAB-ENFORCEMENT-CONTRACT.md banned marble texture on every component, no exceptions, and specifically forbade `background-attachment: fixed` anywhere. Current MATERIALS.md (CANON-authoritative, postdates that prior work) requires Blue Marble buttons to sample marble "from the same slab coordinates as the background" as a deliberate sole exception. `.surface-blue-marble` (marble.css) satisfies this using `background-attachment: fixed` on its marble layer ONLY (not on the slab itself, which still uses `position: fixed` per the prior contract's proven technique) — a narrower, bounded use case the prior contract never had to rule on, since its source design had no textured buttons at all. Chosen over per-button JavaScript position tuning, which the prior contract correctly identifies as fragile (drifts on any layout change). Full reasoning in MARBLE-CONTRACT.md "DEVIATION FROM PRIOR ART."
- GREY SUPERTILES SAVED BUT UNUSED (Step 1.3): `grey-marble-slab-1.jpg` and `grey-marble-slab-2.jpg` copied in alongside the black one for completeness, but no component references them — CANON's three-surface system (Black Marble, Smoked Glass, Blue Marble) has no defined use for a fourth "grey marble" surface. Reserved, not wired to anything, matching the prior contract's own treatment of the same asset ("ships unused so no future agent rebuilds it differently").
- BOTTOM SLAB BAND (Step 1.3): `.app-shell` height changed from `100vh` to `calc(100vh - var(--space-section-margin))` (24px) so a full-width strip of slab is visible below the three-column frame, per MATERIALS.md's slab-rule enforceable check. Grid rows/columns/areas and all locked dimensions (60/200/300) are unchanged — only the container's total height.
- TOKENS.CSS WAS NEVER ACTUALLY IMPORTED INTO THE APP (found and fixed at Step 1.3): Step 1.2 built tokens.css and linked it from the standalone swatch page, but main.tsx never imported it — harmless while AppShell was empty (Step 1.1), but marble.css's var() references would have silently resolved to nothing once real CSS started consuming them. Added `import "./styles/tokens.css"` to main.tsx, before layout.css and marble.css.
- LAYOUT.CSS HARDCODED VALUES CLEANED UP (Step 1.3): body's placeholder `background: #111; color: #eee; font-family: system-ui` and the three region borders' hardcoded `#333` replaced with token references (`--text-primary`, `--font-family-base`, `--surface-smoked-glass-border`) now that tokens.css is actually wired in. body's own background removed entirely — `.marble-slab` is a fixed full-viewport layer that fully covers it.
- SELF-CHECK METHOD (Step 1.3): per the step's own instruction, verification against MATERIALS.md's slab rule was done by a fresh-context Explore subagent given MATERIALS.md, MARBLE-CONTRACT.md, and the actual source files (not my reasoning about them) with instructions to statically audit for rule violations. All checks passed — see PARKED for what this does and does not cover (no real browser, so no literal resize/pixel test).

## PARKED
- ~~Marble texture files: location/source to be clarified before Step 3.1 (Marble system build).~~ RESOLVED at Step 1.3 — three texture files provided, saved, and wired into marble.css; see DECISIONS.
- Translation corpus: available for Step 2.4 (Translation verification) if needed; not required for Steps 1–2.2.
- No headless browser exists in the build environment and browser downloads are blocked by the network allowlist, so Step 1.1 layout was verified by serving the app and asserting the grid CSS values over HTTP plus a clean production build — not by rendered-pixel screenshot. First step run in an environment with a browser should eyeball the frame once.
- Vite template's public/ shipped favicon.svg and icons.svg placeholders; replace when the logo (CANON "THE LOGO") is built.
- Step 1.2's three eyeballed pill colors (RSD, Interest, Cognitive Mode — see DECISIONS) are waiting on a future session with real pixel-sampling tools to confirm against the screenshot; current values are a confident visual match, not a measured one.
- Inter is referenced by --font-family-base but the font file itself is not yet loaded/self-hosted anywhere in the repo; waiting on Step 3.4 (Typography and spacing application).
- The two grey texture files (grey-marble-1.png / grey-marble-2.png, and their rendered supertiles grey-marble-slab-1.jpg / grey-marble-slab-2.jpg) read as visually near-identical to the black marble file — same vein pattern, barely distinguishable tone, not genuinely distinct textures. Flagged by the person supplying the files and deliberately deferred as cosmetic. Should be replaced with visually distinct textures before Step 11.4 (Visual verification). Currently moot for rendering since the grey files have no active consumer (see DECISIONS), but will matter once/if a future step gives grey marble a defined use.
- Step 1.3's slab implementation was verified by production build, HTTP serving checks, and a fresh-context subagent's static audit against the written rule — not by an actual browser resize test or pixel comparison (same build-environment constraint as Steps 1.1/1.2: no headless browser, network allowlist blocks browser downloads). A future step run in an environment with a real browser should do the literal 300px-resize vein-consistency check MARBLE-CONTRACT.md's enforceable checks call for, and confirm the Blue Marble button's background-attachment:fixed technique actually renders as continuous with the slab (the CSS is logically sound per the subagent audit, but its cross-browser rendering behavior — the exact thing the prior contract warned about for iOS Safari — is unverified here).
- AppShell.tsx's current cards/button are Step 1.3 demo content proving marble continuity, not real feature UI. Later steps (1.5+ for structure, and each feature's own step) replace this content; they don't need to preserve its exact markup or inline styles.

## STEPS
- [x] STEP 0 — File inventory and manifest
- [x] STEP 1.1 — Repo scaffold and stack lock
- [x] STEP 1.2 — Design token system
- [x] STEP 1.3 — Marble slab architecture
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
