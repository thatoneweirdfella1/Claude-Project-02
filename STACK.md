# STACK.md — Locked at Step 1.1

## The stack

| Layer | Choice | Version at lock |
|---|---|---|
| Language | TypeScript | ~6.0 |
| UI framework | React | 19.x |
| Build/dev tool | Vite | 8.x |
| State stores | Zustand (added Step 6.3, decided now) | — |
| Persistence | IndexedDB via `idb` wrapper (added Step 6.3/12.2, decided now) | — |
| Styling | Vanilla CSS with custom properties (design tokens). No Tailwind, no CSS-in-JS. | — |
| Desktop wrap (later) | Tauri | — |
| Android wrap (later) | Capacitor | — |
| Lint | oxlint (came with the Vite template) | 1.x |

Node 22 is the dev runtime in this environment.

## Why — argued against the hard constraints

**Runs in a browser; wraps to Windows and Android without a rebuild.** The app must be a
plain SPA with no server-rendering assumptions, because both Tauri and Capacitor embed a
static web bundle. Vite's SPA output is exactly that. This is the reason SvelteKit and
Next.js were rejected outright: their value is in server/hybrid rendering, which is dead
weight (and a wrapping liability) here.

**Streams tokens from an AI API.** Token streaming means many small state updates per
second into the conversation view. React 19 handles this fine at chat-app update rates;
the theoretical fine-grained-reactivity edge of Solid/Svelte is real but irrelevant at
this frequency, and CANON's 300ms interaction budget is generous against it.

**Survives refresh.** CANON mandates IndexedDB by name ("Autosave writes both to
IndexedDB every 5 seconds"), so persistence wasn't a choice — only the wrapper was. `idb`
is a thin promise wrapper, no schema magic, easy to audit. Dexie was rejected as a
heavier abstraction than two stores need. Zustand pairs with this well: its stores are
plain objects that serialize straight into IndexedDB, and the Session store vs Account
store split in CANON maps 1:1 onto two Zustand stores with different persistence targets.
Redux was rejected as ceremony the two-store contract doesn't need.

**Fully keyboard-operable.** Framework-neutral requirement; no framework was
eliminated by it. Noted here so later steps know it influenced nothing at this layer.

**The deciding constraint nothing else outweighs: 60 sessions, no shared memory.**
This build is executed by ~58 more sessions that each see only BUILD-LOG.md and the file
they're handed. Predictability across sessions is worth more than any marginal runtime
advantage. React + Vite + TypeScript is the combination every future session will make
the fewest wrong assumptions about — conventions, error messages, ecosystem answers are
all maximally well-trodden. Svelte 5 (runes) and SolidJS were seriously considered and
rejected on this ground: both are genuinely good fits technically, but their smaller
idiom surface raises the odds that some session 40 steps from now writes React-flavored
Svelte and breaks reactivity silently. That failure mode is worse than React's re-render
overhead.

**Styling: vanilla CSS custom properties.** CANON's marble/glass material system is
bespoke, layered-gradient, backdrop-filter work — the opposite of what utility frameworks
are good at. Step 1.2 is literally "Design tokens and CSS variables," so tokens-as-custom-
properties is already the roadmap. Tailwind rejected (fights bespoke materials, adds a
compile-time vocabulary every session must know); CSS-in-JS rejected (runtime cost against
the 300ms budget, and the material system wants plain, inspectable CSS).

**routing.js compatibility.** The already-built routing engine (ROUTING.md) is plain JS.
It drops into a Vite/TS project as-is or with a `.d.ts` shim — no framework coupling.
This was a soft point in favor of any bundler-based stack and a hard point against
anything that would force a rewrite.

## What would change this

If the desktop wrap ever needs deep OS integration beyond Tauri's API surface, revisit.
Nothing in the 12 features suggests it will.
