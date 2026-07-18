# CONVENTIONS.md

You are reading this with no memory of this repo. That is expected — every build step
runs in a fresh session. This file plus BUILD-LOG.md is your orientation. Product truth
lives in CANON.md; where anything disagrees with CANON.md, CANON.md wins.

## Repo layout

```
divergence-ai/
├── BUILD-LOG.md          ← read FIRST, update LAST, every step (append-only except WHERE YOU ARE)
├── CANON.md              ← product truth (copy in from reference files if absent)
├── STACK.md              ← the locked stack and why; do not re-litigate it
├── CONVENTIONS.md        ← this file
├── index.html            ← Vite entry; mounts #root
├── package.json          ← name: divergence-ai; scripts: dev / build / lint / preview
├── vite.config.ts
├── tsconfig*.json
├── public/               ← static assets served as-is (favicon; marble textures land here in Step 3.1)
└── src/
    ├── main.tsx          ← ReactDOM entry; renders <AppShell/>; imports global styles
    ├── components/
    │   └── layout/       ← structural frame components (AppShell.tsx lives here)
    │   └── <feature>/    ← one folder per CANON feature as it's built, e.g.
    │                        translation/, statepills/, transparency/, sessions/
    ├── stores/           ← Zustand stores. Exactly two planned (CANON "STORES AND
    │                        PERSISTENCE"): sessionStore.ts, accountStore.ts (Step 6.3)
    ├── services/         ← non-UI logic: API client, streaming, persistence (idb),
    │                        and the drop-in routing engine (routing.js + routing.d.ts, Step 1.5/2.2)
    └── styles/
        ├── layout.css    ← the structural frame ONLY (grid, dimensions). Locked numbers
        │                    from CANON: topbar 60px, left 200px, center flex, right 300px.
        └── tokens.css    ← design tokens as CSS custom properties (Step 1.2 fills this)
```

## Naming

- **Components:** PascalCase file and export, one component per file (`AppShell.tsx`,
  `StateDetectionPanel.tsx`). Named exports, not default.
- **Stores/services/utilities:** camelCase files (`sessionStore.ts`, `apiClient.ts`).
- **CSS:** plain kebab-case class names (`.col-left`, `.state-pill`). Global stylesheets
  in `src/styles/`, imported once from `main.tsx`. Component-scoped styles, when needed,
  as `ComponentName.css` next to the component — but prefer tokens + global classes.
- **CSS custom properties:** kebab-case with a domain prefix once tokens exist
  (`--surface-black-marble`, not `--color1`).
- **Test IDs:** every structural region carries `data-testid` (`topbar`, `col-left`,
  `col-center`, `col-right`). Add them to new interactive regions as you build.

## Rules that keep 60 blind sessions coherent

1. **Read BUILD-LOG.md before writing anything.** Update it before reporting done:
   edit only WHERE YOU ARE, append to DECISIONS and PARKED, tick your step in STEPS.
2. **Don't restructure the frame.** `AppShell.tsx` + `layout.css` define the locked
   grid. Features mount inside the four regions.
3. **Don't re-decide the stack.** STACK.md is settled. Adding a dependency is a
   DECISIONS line in BUILD-LOG.md with a one-line justification.
4. **CANON's numbers are not suggestions.** 60/200/300px frame, 5s autosave, 10MB/50MB
   context limits, max 4 stacked techniques — quote CANON when you implement one.
5. **Keyboard-first.** Everything reachable by Tab/Enter/Escape (CANON "ADHD HARD
   RULES"). Build it in as you go; Step 11.3 audits, it does not retrofit.
6. **No black boxes.** Anything that makes a decision (routing, techniques, state
   detection) must expose what it decided and why — design the data shape for the
   Transparency card (Feature 8) even in steps before it exists.

## Dev commands

```
npm install       # once per fresh environment
npm run dev       # dev server (vite), default port 5173 — SEE CAVEAT BELOW
npm run build     # tsc -b && vite build → dist/
npm run lint      # oxlint
npm test          # vitest run — unit/service-level suite
npm run test:e2e  # playwright test — E2E suite (Step 12.2), see e2e/
```

**`npm run dev` currently fails to load the app** — src/services/routing.js is a UMD
module (`module.exports = factory()` inside a `typeof module === "object"` guard);
Vite's dev server serves src/ files as native ESM with no CommonJS interop (that
only happens during `vite build`, via Rollup, and only for files Vite treats as a
dependency — routing.js is app source, not a pre-bundled dependency). The browser
console shows `SyntaxError: ... does not provide an export named 'default'`. Found
by Step 12.2's E2E suite — the first work in this build to actually drive `vite dev`
in a real browser; every prior browser-driven session used `vite preview` (a
production build) instead, which does not hit this path. Logged in BUILD-LOG.md
PARKED; not yet fixed — it's a src/ change, outside Step 12.2's "build tests, don't
refactor" boundary. Until fixed, use `npm run build && npm run preview` for any
manual browser check.

**CI** (`.github/workflows/ci.yml`, Step 12.1) runs on every push and every PR, two
jobs: `unit` (`npm run build` + `npm run lint` + `npm test`) and `e2e`
(`npx playwright install --with-deps chromium` + `npm run test:e2e`, HTML report
uploaded as an artifact on failure). `playwright.config.ts`'s `executablePath` only
uses this sandbox's pre-installed Chromium if that exact path exists; otherwise it's
left undefined so a real CI runner's own `playwright install` step resolves normally.
