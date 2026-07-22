# DIVERGENCE.AI — STEP BY STEP BUILD PROMPTS
**60 steps. Each step is one prompt for Claude Code, run with this repo folder open as the project. Copy the prompt block and paste it in — Claude Code reads the files it needs directly from the repo, nothing to attach. If a file the prompt needs isn't in the repo, the model stops and asks before doing anything.**

> **Revision 5.** Changes are listed in CHANGELOG at the bottom, and the one question still open is listed in OPEN QUESTIONS above it. Nothing in this file is blocked on it. (Question 1, left nav items and Quick Tools tiles, was resolved after this revision was written — see OPEN QUESTIONS and CANON.md's LEFT NAVIGATION section.)

---

## THE CLEAN FILE SET (upload these, they replace the old contradicting four)

Retire these old files, they contradict each other: CANONICAL-AUTHORITY.md, DIVERGENCE-APP-REQUIREMENTS.md, MASTER-REFERENCE.md, RESOLUTION-AND-CONDITIONS.md.

Use these clean files instead. Every prompt names which one(s) it needs:
1. **CANON.md** — what the app is, the 12 features, the layout, the stores, the ADHD hard rules, the locked decisions.
2. **MATERIALS.md** — the three marble surfaces, the slab rule, colors, typography, spacing.
3. **PIPELINE.md** — the five stages, translation, state detection, techniques, composition, learning.
4. **ROUTING.md** — the already-built routing engine and the one Sonnet 5 fix.

Keep these too, they were already correct: COMPLEXITY.md, CONFIDENCE_COUPLING.md, FINDINGS.md, README.md, routing.js, tests.js, the three marble texture files, Divergence_AI_App_Screenshot_V3.png, and 31_0_translation_test_cases.md if you have it.

---

## THE FILES THE BUILD MAKES FOR ITSELF

These are not files you upload. Each is produced by one step and needed by a later one. If a step's output never gets attached to the step that needs it, that later step invents its own answer — which is drift, and it is what this table exists to stop. When a step finishes, keep its output with the others; the next step that needs it will name it.

| File | Made by | Needed by |
|---|---|---|
| **BUILD-LOG.md** | 0 (moved into the repo by 1.1) | **every step** — read before building, updated after |
| FILE-MANIFEST.md | 0 | 1.3, and any step where you're unsure which file it means |
| STACK.md | 1.1 | nothing (it's for you, and for any future session asking "why this stack") |
| CONVENTIONS.md | 1.1 | **every step from 1.2 on** — standing file |
| tokens.css | 1.2 | **every step from 1.3 on** — standing file |
| MARBLE-CONTRACT.md | 1.3 | 1.4, 11.4 |
| STORE-CONTRACT.md | 1.7 | 1.8 |
| TRANSLATION-SPEC.md | 2.1 | 2.2, 5.2 |
| TECHNIQUE-MATRIX.md | 4.1 | 4.2, 4.5, 5.2 |
| request object spec | 5.0 | 5.2 |
| PIPELINE-CONTRACT.md | 5.2 | 12.1 |
| ADHD-AUDIT.md | 11.1 | 11.5 |

---

## HOW EACH PROMPT WORKS

Every prompt opens with five blocks:
0. **INTERFACE CHECK** — a one-line confirmation that you're running this in Claude Code with the
   repo folder open as the project, not in the plain chat window. Everything below assumes direct
   file access; in plain chat none of it works, so the step stops and asks rather than guessing.
1. **ALWAYS READ** names the standing files that go with *every* step: CONVENTIONS.md (produced by step 1.1) and tokens.css (produced by step 1.2), read straight off disk. These are how step 40 still writes code that looks like step 4's. Without them each fresh session invents its own naming and hardcodes its own colors, which is drift.
2. **BUILD LOG** points the step at BUILD-LOG.md in the repo root, also read off disk. It reads it before building so it doesn't re-decide something already settled, and updates it when it finishes. This is what makes "which step am I on" a file you open instead of something you have to hold in your head.
3. **REQUIRED FILES** names what this step needs on top of the standing files, all read from the repo. If one's missing, the model stops and asks before building.
4. **SPOT CHECK FIRST** tells the model to confirm the files it read agree with the locked decisions, and to stop and warn you if anything contradicts, before it builds.

**You never have to remember to check BUILD-LOG.md.** It lives in the repo, so every session finds it on its own and every step is told to read it before building and update it after. Open it yourself only when *you* want to know where you are — the WHERE YOU ARE line at the top is the whole answer, and it's the first thing in the file.

Then it says what to build and what to output. Run steps in order. A step marked ALREADY BUILT only wires existing code in.

**Run step 0 before anything else.** It checks you actually have every file the other 59 steps will ask for, and writes down their real filenames so no later step has to guess.

---

## MODEL LEGEND

`[FABLE]` architecture bets and audits. `[OPUS]` claude-opus-4-8. `[SONNET]` claude-sonnet-5. `[HAIKU]` claude-haiku-4-5.

`⚡` marks a step **bound by the sub-300ms visual response rule** — either it builds something the user clicks, or it audits that rule. It does NOT mean the step's own background work must finish in 300ms. Step 7.2's OCR is allowed to take as long as it takes; what must stay under 300ms is the UI staying responsive while it runs. Step 6.1 carried this mark in revision 1 and it was wrong — PIPELINE.md explicitly gives state detection no 300ms budget — so the mark is removed there.

---

# PHASE 0 — PREFLIGHT

## STEP 0 — File inventory and manifest  ·  [HAIKU]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

BUILD LOG: this build runs across sixty sessions and none of them can see the others. BUILD-LOG.md
is the only thing they will share, and it does not exist yet — you are the step that creates it.
Every step after this one reads it before building and updates it after. See DELIVERABLES below
for its exact shape. There is nothing to read yet; do not go looking for it.


REQUIRED FILES (read from the repo): every reference file you intend to build with should already
be sitting in this project folder — read them directly, nothing to attach. This step exists to
find out what you are missing BEFORE a step fails halfway through, so do not skip it and do not
let me talk you past a missing file.

CONTEXT & REASON
I am about to run a 59-step build where each step runs in a fresh session and attaches specific
files by name. If a file is missing, misnamed, or is a different file than the step expects, that
step either stops or quietly builds against the wrong thing. This step is the one-time check that
prevents both.

GOAL
FILE-MANIFEST.md: a table of every build file, its exact filename as attached, what it is, and
which steps need it. Plus a plain list of anything expected and not present.

WHAT SHOULD BE PRESENT
Source-of-truth docs: CANON.md, MATERIALS.md, PIPELINE.md, ROUTING.md.
Reference docs kept from before: COMPLEXITY.md, CONFIDENCE_COUPLING.md, FINDINGS.md, README.md.
Code already built: routing.js, tests.js.
Assets: Divergence_AI_App_Screenshot_V3.png, three marble texture files (one black, two greys).
Optional/uncertain: 31_0_translation_test_cases.md (the 50-case translation corpus, needed only
by step 2.4).

WHAT TO CHECK
For each file present, record its EXACT filename as attached — not the name this doc uses, the
real one. Later steps will ask me for "the three marble texture files"; the manifest is what tells
me which three. For the texture files specifically, identify which is the black marble and which
two are the greys, and record that, because MATERIALS.md names them only by colour.

Confirm the four source-of-truth docs do not contradict each other on the locked decisions: three
marble surfaces not seven, claude-sonnet-5 not claude-sonnet-4-6, state detection on the
TRANSLATE & ASK button not while typing, routing engine already built not rebuilt. If any two
files disagree, name the exact conflicting lines. Do not resolve the conflict yourself — report it.

Note that the following files do NOT exist yet and are correctly absent: STACK.md, CONVENTIONS.md,
tokens.css, MARBLE-CONTRACT.md, STORE-CONTRACT.md, TRANSLATION-SPEC.md, TECHNIQUE-MATRIX.md,
PIPELINE-CONTRACT.md, ADHD-AUDIT.md. Each is produced by an earlier step and consumed by a later
one. Their absence now is expected, not a gap.

DELIVERABLES
FILE-MANIFEST.md, with a MISSING section at the top if anything is missing. If the MISSING section
is not empty, say plainly which steps are blocked by it and stop — do not suggest workarounds.

BUILD-LOG.md — create it here, next to the reference files. Step 1.1 moves it into the repo root
and every step after that reads and updates it. This is the file that answers "which step am I on"
without me having to remember. Structure it exactly like this and no more elaborately:

    # DIVERGENCE.AI BUILD LOG

    ## WHERE YOU ARE
    Last completed: STEP 0 — File inventory and manifest
    Next step: STEP 1.1 — Repo scaffold and stack lock
    Blocked: nothing

    ## DECISIONS
    (one line each: what was decided — why — what was rejected. Appended by each step.)

    ## PARKED
    (one line each: what's unfinished — what it's waiting on. Appended by each step.)

    ## STEPS
    (60 lines, "STEP 0 — File inventory and manifest" through "STEP 12.3 — Deploy", each marked
    [ ] to do, [x] done, or [!] blocked. Copy the step list off this build prompts doc. Mark step 0
    done.)

VERIFY BEFORE YOU FINISH
Every filename in the manifest is one you actually saw attached, not one you copied out of this
prompt. If you cannot open a file (wrong format, unreadable), say so rather than listing it as
present.
```

---

# PHASE 1 — FOUNDATION

## STEP 1.1 — Repo scaffold and stack lock  ·  [FABLE]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

CONTEXT & REASON
I'm scaffolding DIVERGENCE.AI, an ADHD-friendly AI communication bridge — full product spec is
in CANON.md, attached. This is the first build step of many; later steps add features, styling,
and the routing engine. What you build now needs to still be standing and correct three steps
from now, so get the foundation right rather than fast.

BUILD LOG: this build runs across sixty sessions and none of them can see the others. BUILD-LOG.md
is the only thing they share. Step 0 created it and it currently sits next to the reference files,
NOT in a repo — there is no repo yet; you are the step that makes one. Moving it into the repo root
is your first deliverable, and from step 1.2 onward every step reads it off disk from there.

Read it directly from the repo, before you build. It should record step 0 as complete. If it does
not exist at all, step 0 never ran — say so and stop rather than creating a fresh one, because a
log that starts at 1.1 has already lost the file manifest that step 1.3 depends on.

When you finish, before you report back to me, update BUILD-LOG.md (now in the repo root):
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Your stack choice goes here, with what
  you rejected and why; step 1.2 onward will build on it without ever seeing STACK.md.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md. If it is missing from the repo, stop and tell me.

SELF-CHECK BEFORE BUILDING
Read CANON.md. Confirm for yourself that it agrees with these three locks, and that it doesn't
contradict itself anywhere else: three marble surfaces (not seven), model string claude-sonnet-5
(not claude-sonnet-4-6), state detection fires on the TRANSLATE & ASK button (not while typing).
If anything is missing, ambiguous, or self-contradictory, stop and tell me what's wrong before
you write any code — don't guess or fill the gap yourself.

GOAL
A running, empty three-column app skeleton with the tech stack locked in. Done means: a dev
server boots, a blank three-column frame renders in the browser matching CANON.md's layout
section, and two documents exist that let a future session pick this back up without
re-deriving decisions.

CONSTRAINTS ON THE STACK (hard requirements, not preferences)
Runs in a browser. Ships later as desktop and mobile by wrapping this same codebase, not
rebuilding it. Streams tokens from an AI API. Survives a browser refresh without losing state.
Fully keyboard-operable. Within those constraints, choose and justify the stack yourself — don't
default to React + TypeScript + Vite with IndexedDB persistence and CSS modules just because
that's a common answer; pick it if you'd defend it as genuinely best here. Write your reasoning
and choice in STACK.md.

SCOPE BOUNDARY
This step is the skeleton only. No features, no styling beyond a blank frame, no marble/glass
surfaces, no routing engine wiring. If you find yourself building UI polish, form logic, or
anything from the 12 features, you've gone past this step — stop and note it instead of
continuing.

DELIVERABLES
- BUILD-LOG.md moved into the repo root as your first act, before anything else — step 0 created it
  alongside the reference files and it needs to live in the repo from here on, because every one of
  the next 58 steps reads it off disk from there. If it doesn't exist, step 0 never ran; stop and
  tell me.
- STACK.md: the stack, with your reasoning
- CONVENTIONS.md: file layout, naming, where components/stores/services/styles live. Write this
  for a reader who has never seen the repo and will be attached this file with no other memory of
  it — that is literally what happens at every one of the next 58 steps.
- A booting dev server rendering an empty three-column shell matching CANON.md's layout spec
  (left 200px, center flex, right 300px, top bar 60px) — no content inside the columns yet

VERIFY BEFORE YOU FINISH
Actually run the dev server and confirm the three columns render at the right proportions before
reporting this done. Before you report progress on anything, audit the claim against a tool result from this session.
Report only work you can point to evidence for; if something isn't verified yet, say so. Report
outcomes faithfully — if something failed, say so and show the output; if you skipped something,
say that; if it's done and verified, say so plainly without hedging. I'd rather hear "the right column is 280px,
not 300px" than a clean summary that turns out to be wrong.

HOW TO REPORT
Lead with the outcome — your first sentence should answer "what happened". Detail after. Keep it
short by leaving things out, not by compressing it into fragments or arrow chains.
```

## STEP 1.2 — Design token system  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1). If it's missing, stop and tell me
— it's what keeps this step's output shaped like the rest of the repo.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): MATERIALS.md and Divergence_AI_App_Screenshot_V3.png. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm MATERIALS.md describes three surfaces (Black Marble, Smoked Glass, Blue Marble) and not the seven-name system. If it lists seven materials, stop and tell me.

Read MATERIALS.md. The screenshot is the color source of truth; if the file and image disagree, match the image.

Build tokens.css, one file of CSS custom properties for the whole visual system:
1. Colors matching the screenshot: black marble range (#0B0C0E to #151618), Smoked Glass surface values, Blue Marble button range (#2B4E9C to #4478E5), cyan #00D9FF, state-pill colors (purple Emotion, red RSD, green Interest, blue Cognitive Mode), red for destructive only, white and muted-gray text steps.
2. Typography tokens per MATERIALS.md (section headers 12px caps cyan, card titles 14px/500, body 14px/400 line-height 1.6, never 600+). MATERIALS.md names Anthropic Sans, which is not publicly licensed — if you cannot legally obtain it, pick the closest clean sans you can actually ship, say which and why, and put the font stack in a token so it can be swapped later without touching a component.
3. Spacing, radius (cards 12-16px, buttons 8px), the two shadow tokens.

No seven-material tokens. Every colour, size, radius and shadow in this app comes from this file: it is attached to every later step and no component is allowed a hardcoded hex. Name the tokens for what they are for, not what they look like — a future session reads only this file and CONVENTIONS.md.

OUTPUT: tokens.css plus a swatch page rendering every token to eyeball against the screenshot.
```

## STEP 1.3 — Marble slab architecture  ·  ⚡  ·  [FABLE]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

CONTEXT & REASON
DIVERGENCE.AI's entire visual identity depends on one continuous marble slab behind the app —
fourteen previous attempts at this specific step failed, always the same way: the marble ended
up regenerated or rescaled per component instead of staying one continuous layer. This step
exists to break that pattern, not repeat it. Read MATERIALS.md's THE SLAB RULE section closely
before writing any code.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me — they are how this step's output still matches
step 40's.

BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): MATERIALS.md, the three marble texture files (one black, two greys), and
FILE-MANIFEST.md (from step 0, which records which texture file is which). If any of these is not
attached to this message, stop and ask me to upload them before doing anything else — do not
substitute a placeholder texture, do not generate a texture, and do not proceed without the real
files. A generated stand-in texture is the exact failure this step exists to prevent.

SELF-CHECK BEFORE BUILDING
Confirm MATERIALS.md describes exactly three surfaces (Black Marble, Smoked Glass, Blue Marble)
and states one continuous slab at 100% scale, never regenerated per component. If it describes
seven materials, per-component marble, or contradicts itself anywhere in the slab rule, stop and
tell me before building.

GOAL
A single fixed marble slab layer that reads as one continuous piece of stone behind the entire
viewport — cards and buttons sit on top of it and let it show through, none of them own their
own copy of it. Done means the slab survives a resize test without stretching, seaming, or vein
misalignment.

THE RULE THIS STEP EXISTS TO ENFORCE
Marble is ONE continuous slab behind the entire viewport, z-index 0, 100% scale, constant
background-size, shared origin, seamless tiling — never regenerated or rescaled per component.
Cards are Smoked Glass that let the one slab blur through behind them; they do not get their own
marble. Blue Marble buttons sample marble from the same slab coordinates as the background, so
the stone reads as continuous, not as separate patches.

SCOPE BOUNDARY
The slab, the contract, the demo shell. Nothing else. Do not build a texture pipeline, a theming
system, an abstraction for future materials, or fallbacks for conditions that cannot happen. Do
the simplest thing that holds the rule. Fourteen attempts failed at this step; none of them failed
by being too simple.

HOW TO CHECK YOUR OWN WORK
Verify with a fresh-context subagent against MATERIALS.md's slab rule rather than re-reading your
own work — you will not see the seam you just built. Give the subagent the rule and the running
demo, not your reasoning about it. Do this before you report, not after I ask.

DELIVERABLES
- The slab layer itself, built per the rule above
- MARBLE-CONTRACT.md, stating the rule enforceably: one slab, z-index 0, 100% scale, no
  per-component marble, glass surfaces blur the slab behind them, Blue Marble buttons sample the
  same slab coordinates. Name the actual texture filenames from FILE-MANIFEST.md in it, so step
  11.4 verifies against the same assets this step built with.
- A demo shell: the three-column frame with a few glass cards, marble visibly continuous across
  every gutter and behind every card, a full-width slab band along the bottom crossing all three
  columns

VERIFY BEFORE YOU FINISH
Resize the window across a 300px range and confirm vein width and spacing stay identical — only
the visible slab area should change. Any stretching, seaming, or per-component texture is a
failure, not a partial success; if you find one, fix it before reporting done.

Before you report progress on anything, audit the claim against a tool result from this session.
Report only work you can point to evidence for; if something isn't verified yet, say so. Report
outcomes faithfully — if something failed, say so and show the output; if you skipped something,
say that; if it's done and verified, say so plainly without hedging.

Before you end your turn, read your last paragraph. If it's a plan, a question, or a promise about
work you haven't done — do that work now instead of ending. Announcing a fix is not the same as
applying one.

HOW TO REPORT
Lead with the outcome — your first sentence should answer "what happened". Detail after. Keep it
short by leaving things out, not by compressing it into fragments or arrow chains.
```

## STEP 1.4 — Glass and marble primitives  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): MATERIALS.md, Divergence_AI_App_Screenshot_V3.png, and MARBLE-CONTRACT.md (from step 1.3). If any is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm MATERIALS.md and MARBLE-CONTRACT.md both say glass cards are never opaque and never carry their own marble. If either contradicts that, stop and tell me.

Read MATERIALS.md and MARBLE-CONTRACT.md. Match the screenshot.

Build the reusable component library everything is made of:
1. GlassCard: Smoked Glass, 88-92% opaque so marble blurs through, 12-16px corners, hairline edge, single card shadow. Never opaque, never its own marble.
2. GlassPanel: same material, panel-sized, for sidebars and modals.
3. BlueMarbleButton: Blue Marble sampling the shared slab, soft top glow (not neon), white text, min 44px, 8px corners.
4. GlassButton (secondary), Dropdown, Pill primitives, all matching the screenshot.

Each primitive keyboard-focusable with a visible focus ring. OUTPUT: the library plus a page rendering every primitive over the slab, checked against the screenshot.
```

## STEP 1.5 — Layout shell and top bar  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md and Divergence_AI_App_Screenshot_V3.png. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm CANON.md's layout section matches a three-column shell with a 60px top bar. If it describes a different layout, stop and tell me.

Read the LAYOUT section of CANON.md. Match the screenshot exactly.

Build the real three-column shell over the marble slab:
1. Top bar 60px: logo slot far left, then Search, Templates, Quick Reference, gear, bell, help circle, user chip at right.
2. Left column 200px: nav (Home, Dashboard, Messages, Archive, Resources, Projects, Integrations, Tasks, Customize, Translate), and at the bottom Trash, a green System Status dot, and a logout control.
3. Center column flex: empty conversation placeholder.
4. Right column 300px: placeholders for Quick Tools and the accordion stack.

Structure and spacing only. OUTPUT: the shell matching the screenshot.
```

## STEP 1.6 — Logo  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md. If it's missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm CANON.md's logo section describes an aurora-mix brain with white DIVERGENCE and aurora AI text. If it differs, stop and tell me.

Read THE LOGO section of CANON.md.

Build an animated SVG logo for the top-left: a clean brain outline with synapses in an aurora-borealis mix (neon green, purple, pink blended). "DIVERGENCE" in white, "AI" in the aurora mix. Nothing else inside the brain. Subtle synapse-firing animation, tasteful, respecting the ADHD no-excessive-animation rule. OUTPUT: the logo component placed in the top bar.
```

## STEP 1.7 — Dual-store state architecture  ·  [OPUS]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md. If it's missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm CANON.md's STORES AND PERSISTENCE section defines a session store and an account store. If it does not, stop and tell me.

Read STORES AND PERSISTENCE in CANON.md.

Design and build the two stores the whole app runs on:
1. Session store (cleared on session close): model, directness, technique, loaded context, conversation history, current state pills.
2. Account store (persists across browser closes): archived Q/A pairs, ratings, saved prompts, explicitly-saved variables, visibility settings, learned preferences, and the plan flag ("free" or "paid").

On the plan flag: routing.js already takes plan as an input and gates Opus and extended thinking on it, but nothing currently supplies it. It lives in the account store. It is a flag, not billing — there is no payment processing and no account system yet (ROUTING.md is explicit about this). Default it to "free" so the gated path is the one that gets exercised by default. Do not build billing, auth, or an upgrade flow.

Deliver typed schemas for both, the store implementations, and STORE-CONTRACT.md naming every field and its owning store. OUTPUT: schemas, stores, STORE-CONTRACT.md.
```

## STEP 1.8 — Autosave and restore  ·  ⚡  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md and STORE-CONTRACT.md (from step 1.7). If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm CANON.md says autosave runs every 5 seconds. If it says a different interval, stop and tell me.

Read STORE-CONTRACT.md. Decision already made: autosave runs every 5 seconds, quietly, in the background. Its job is that a crash, dead battery, or closed tab never costs the user their session. This is not about typing.

1. Every 5 seconds, write both stores to IndexedDB without blocking the UI.
2. On startup, rehydrate both stores so the user returns exactly where they were.
3. Writing is safe against a refresh mid-write (no corruption, last complete write wins).

OUTPUT: the persistence service wired to both stores, plus a test that kills and reloads the app and confirms state returns.
```

## STEP 1.9 — Keyboard framework  ·  ⚡  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md. If it's missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm CANON.md's ADHD hard rules require 100% keyboard operability. If not, stop and tell me.

Read the ADHD HARD RULES (Accessibility) in CANON.md. The app must be 100% usable by Tab, Enter, Escape.

Build the focus and escape infrastructure:
1. Focus management: logical tab order, visible focus rings, focus trapping in modals, focus returning to the trigger on close.
2. Escape closes the topmost modal or dropdown.
3. Critical: when the cursor is in a text input, keystrokes go to that input; global shortcuts do not fire while typing in a field.
4. Destructive actions cannot fire from a single stray keypress; they confirm or are undoable.

OUTPUT: the keyboard framework as shared infrastructure every component plugs into.
```

## STEP 1.10 — API proxy and model registry  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): ROUTING.md, README.md, routing.js. If any is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the model strings are claude-haiku-4-5, claude-sonnet-5, claude-opus-4-8. If any file still says claude-sonnet-4-6, note it and use claude-sonnet-5 anyway per ROUTING.md.

Read ROUTING.md for the model list and why a proxy is needed. The app is browser-only, the API key must never live in the browser.

1. A minimal serverless proxy endpoint that accepts a model call and forwards it to the Anthropic API with the key server-side, supporting streamed responses back.
2. A model registry with the exact strings above. Extended thinking is a flag on a call, not a model.
3. Deploy the proxy, confirm the app can make a live streamed call through it.

OUTPUT: the deployed proxy and the model registry. This is the only backend component.
```

---

# PHASE 2 — TRANSLATION ENGINE

## STEP 2.1 — Gap taxonomy and prompt spec  ·  [OPUS]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): PIPELINE.md and CANON.md. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm PIPELINE.md lists the six gap types and defines confidence as "did I identify the right request." If it differs, stop and tell me.

Read the TRANSLATION ENGINE section of PIPELINE.md.

Design the translation prompt and its output schema:
1. The gap taxonomy: tangential preamble, emotional intensity distortion, compound buried request, typo/pronoun/wrapper corruption, scope ambiguity, unstated assumptions.
2. The translation system prompt: find the buried real request and reframe it without losing meaning.
3. The output schema: translated prompt, confidence 0-100, detected gap types.

OUTPUT: TRANSLATION-SPEC.md plus the schema in code.
```

## STEP 2.2 — Translation engine  ·  [OPUS]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): PIPELINE.md and TRANSLATION-SPEC.md (from step 2.1). If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the runtime translation model is claude-sonnet-5. If TRANSLATION-SPEC.md says otherwise, stop and tell me.

Read TRANSLATION-SPEC.md. Runtime model is claude-sonnet-5 through the proxy (step 1.10).

Build the translation service: raw text in, translated prompt plus confidence plus gap types out, matching the schema, calling Sonnet 5 through the proxy with the step 2.1 prompt. Handle empty input, huge input, and API failure without crashing. OUTPUT: the translation service with a small manual test harness.
```

## STEP 2.3 — Confidence gates and clarify flow  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): PIPELINE.md and CONFIDENCE_COUPLING.md. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the gates are 80+ proceed, 60-79 flag, below 60 clarify. If different, stop and tell me.

Read the CONFIDENCE GATES in PIPELINE.md and CONFIDENCE_COUPLING.md.

Build the gate logic and clarify UI. 80+ proceeds showing the score. 60-79 proceeds with a visible moderate-confidence note. Below 60 does not proceed; it asks a clarifying question instead, neutral and curious, never corrective, never making the user feel stupid. OUTPUT: the gate logic wired to the translation service, plus the clarifying-question UI in the conversation area.
```

## STEP 2.4 — Test corpus harness  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): PIPELINE.md and 31_0_translation_test_cases.md. If the corpus file is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm PIPELINE.md's verification target is 90% overall, no category below 80, reported per category.

Read the VERIFICATION note in PIPELINE.md.

Build the harness running all 50 cases through the translation engine, reporting pass rate per category, not averaged. Target 90% overall, no category below 80. OUTPUT: the runner and a sample report.
```

---

# PHASE 3 — ROUTING ENGINE  (ALREADY BUILT)

## STEP 3.1 — Six-dimension scorer  ·  ALREADY BUILT  ·  [SONNET to integrate]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): ROUTING.md, routing.js, tests.js, README.md, COMPLEXITY.md, FINDINGS.md. If any is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm ROUTING.md says the engine is already built and the only change is the Balanced string to claude-sonnet-5. If it says to rebuild the scorer, stop and tell me, that would be wrong.

The routing engine is already built and tested. routing.js is the engine, tests.js passes. Do NOT rebuild the scorer.

This step: integrate routing.js into the app as the routing service, unchanged except one fix. FINDINGS.md item 1 shipped claude-sonnet-4-6 as a placeholder because it believed sonnet-5 did not exist. It exists now. Change the one line in the MODELS table so the Balanced api string is claude-sonnet-5. Change nothing else. OUTPUT: routing.js wired in as a service, the one-line fix applied, tests.js still passing.
```

## STEP 3.2 — Decision logic and override  ·  ALREADY BUILT  ·  [SONNET to wire UI]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): ROUTING.md, routing.js, Divergence_AI_App_Screenshot_V3.png. If any is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the override rule (override always wins, free plan gates Opus to Sonnet with a note) is already in routing.js. Do not reimplement it.

The decision logic and override already exist in routing.js. Do not rebuild. This step only wires the Model dropdown to the engine's override input, matching the screenshot (Model dropdown showing "Opus 4.8 — smartest" etc). OUTPUT: the dropdown wired to routing.js override.
```

## STEP 3.3 — Low-confidence escalation  ·  ALREADY BUILT  ·  [SONNET to verify]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): ROUTING.md, routing.js, tests.js, CONFIDENCE_COUPLING.md. If any is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the coupling (80+ trust, 60-79 escalate with note, under 60 floor at Balanced) is already in routing.js and tests.js.

The coupling already exists in routing.js and is tested. Do not rebuild. This step only confirms the translation engine's confidence output feeds routing.js correctly end to end. OUTPUT: a passing integration check.
```

---

# PHASE 4 — TECHNIQUE SELECTION AND COMPOSITION

## STEP 4.1 — Technique registry and matrix  ·  [OPUS]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): PIPELINE.md and CANON.md. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm CANON.md says include every technique, prune later. If it demands a fixed count, stop and tell me.

Read TECHNIQUE SELECTION in PIPELINE.md and Feature 4 in CANON.md. Include every technique listed, do not agonize over the count.

Build the technique registry: all techniques (Socratic default, Quote-First, Chain-of-Thought, Role-Prime, Verify, Examples, Simplify, Detailed, Step-by-step, Comparative, Metaphor, Auto-detect), each with its effect, conflicts, and dependencies. OUTPUT: the registry plus TECHNIQUE-MATRIX.md of conflicts and dependencies.
```

## STEP 4.2 — Scoring and stacking  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): PIPELINE.md and TECHNIQUE-MATRIX.md (from step 4.1). If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the stack limit is at most 4 techniques. If different, stop and tell me.

Read TECHNIQUE-MATRIX.md. Build the auto-detect selection service: score each technique for the current question, respect conflicts and dependencies, stack at most 4. OUTPUT: the selection service.
```

## STEP 4.3 — Composition engine  ·  [OPUS]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): PIPELINE.md. If it's missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm PIPELINE.md's composition order is template, role prime, question, directness, techniques, output format, confidence requirement.

Read TECHNIQUE SELECTION AND COMPOSITION in PIPELINE.md.

Build the composition engine assembling the final prompt in that fixed order. OUTPUT: the composition engine plus its prompt templates.
```

## STEP 4.4 — Directness control  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): PIPELINE.md and Divergence_AI_App_Screenshot_V3.png. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm three directness levels with Level 2 as default.

Read DIRECTNESS in PIPELINE.md. Build the three-level selector (1 supportive, 2 balanced default, 3 blunt) matching the Directness dropdown in the screenshot, persisting in the session store and feeding the composition engine. State detection can auto-recommend a level. OUTPUT: the selector wired to the store and composition engine.
```

## STEP 4.5 — Technique selector UI  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md, PIPELINE.md, TECHNIQUE-MATRIX.md (from step 4.1), and
Divergence_AI_App_Screenshot_V3.png. This step must match a control that exists in the reference
image. If the screenshot specifically is missing from the repo, do not build the control from the text
description, from memory, or by copying the Directness dropdown's shape. Stop and ask me for the
image, even if every other file is present.

SPOT CHECK FIRST: confirm CANON.md Feature 4 lists every technique (Socratic default, Quote-First,
Chain-of-Thought, Role-Prime, Verify, Examples, Simplify, Detailed, Step-by-step, Comparative,
Metaphor, Auto-detect) and that Auto-detect stacks at most 4. If it demands a fixed smaller count,
stop and tell me.

CONTEXT & REASON
Steps 4.1-4.3 built the technique registry, the auto-detect scorer, and the composition engine —
all engine, no control. The Model dropdown got wired at 3.2 and Directness got its selector at 4.4.
Technique is the third dropdown in the same row of the screenshot and is currently the only one of
the three with no way for a user to touch it. This step is that control.

GOAL
The Technique dropdown from the screenshot, wired to the session store and the composition engine.
Done means: a user can pick techniques manually or leave it on Auto-detect, the choice survives the
next question in the same session, and the composition engine receives the same technique list
either way.

WHAT IT MUST DO
Auto-detect is the default selection and hands off to the step 4.2 scorer. Manual selection lets
the user choose techniques directly, respects the conflicts and dependencies in TECHNIQUE-MATRIX.md
(a conflicting pair cannot both be selected), and enforces the 4-technique stack limit. When
Auto-detect picks, the user can see what it picked — this app is never a black box.

ADHD HARD RULES THAT BITE HERE
CANON.md says never more than 5-7 simultaneous choices in a view. There are 12 techniques. Solve
that — do not just render 12 checkboxes and move on. Auto-detect being the default is most of the
answer; the manual list is the part that needs a shape that doesn't dump all 12 at once. Every
control needs a sensible default, and the whole thing is operable by Tab, Enter, Escape.

SCOPE BOUNDARY
The control and its wiring only. Do not touch the scorer (4.2), the matrix (4.1), or the
composition engine (4.3) — if one of them looks wrong, stop and tell me rather than fixing it here.

DELIVERABLE
The Technique dropdown, matching the screenshot, reading and writing the session store, feeding the
composition engine.

VERIFY BEFORE YOU FINISH
Confirm against the actual screenshot, not against how the Directness dropdown turned out. Confirm
a conflicting pair genuinely cannot both be selected, and that selecting a 5th technique is
refused rather than silently dropping one.
```

---

# PHASE 5 — EXECUTION AND STREAMING

## STEP 5.0 — Input composer and control row  ·  ⚡  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md and Divergence_AI_App_Screenshot_V3.png. This step builds the single
most visible surface in the product against a reference image. If the screenshot specifically is
missing from the repo, do not build it from CANON.md's text description, from memory, or from what a chat
input "usually" looks like. Stop and ask me for the image, even if CANON.md is present.

SPOT CHECK FIRST: confirm CANON.md's LAYOUT section places the input box, state detection panel,
the Model/Directness/Technique dropdowns, Attach and Context controls, and the TRANSLATE & ASK
button in the center column. Confirm locked decision 4: state detection fires on the TRANSLATE &
ASK button, not while typing. If CANON.md describes live-as-you-type anything, stop and tell me.

CONTEXT & REASON
This control does not exist yet and every other step assumes it does. Step 1.5 left the center
column as an empty placeholder. Step 5.1 renders answers. Step 6.1 fires state detection "when the
user hits TRANSLATE & ASK". Step 12.2 tests "type a question, hit TRANSLATE & ASK". Nothing has
ever built the thing being typed into or the button being hit. This is that step.

GOAL
The center-column composer from the screenshot: the input box ("What's on your mind?"), the control
row beneath it, and the TRANSLATE & ASK button. Done means a user can type a question, see and
change the three settings, and press one button that emits a complete, typed request object —
ready for the orchestrator to pick up at step 5.2.

WHAT IT MUST DO
The input box accepts long, rambling, multi-paragraph input without fighting the user — this app's
entire premise is that people type scattered thoughts into it. It grows, it does not clip, it does
not force a length. Input is visible immediately on load with no setup first (CANON.md's
persistence rule). Its content is session-store state so the 5-second autosave from 1.8 already
covers it — a crash mid-thought must not cost the user the thought.

The control row hosts the three dropdowns already built — Model (wired at 3.2), Directness (4.4),
Technique (4.5). This step arranges and connects them; it does not rebuild them. If one of them
isn't built yet, stop and tell me rather than stubbing it.

Attach and Context controls appear here as real, focusable controls that emit their events. Phase 7
gives them their behaviour (7.1 upload, 7.3 URL, 7.4 variables). Build the controls and their
events, not the file handling.

TRANSLATE & ASK emits one typed object: the raw input text, the three settings, and the session's
loaded context. It does not call an API, does not translate, does not route. Step 5.2 subscribes to
it. Keeping that boundary is the point — the orchestrator is where prior attempts drifted, and it
cannot be the same code as the button.

ADHD HARD RULES THAT BITE HERE
Every visual response under 300ms — the button's pressed state is immediate, never waiting on a
network call to acknowledge the click. No forced setup before typing. Every control has a sensible
default so the button is pressable the second the app loads, with nothing configured. Fully
operable by Tab, Enter, Escape. Typing in the box never fires a global shortcut (step 1.9 built
that framework — use it, don't reimplement it).

SCOPE BOUNDARY
The composer, the control row, the button, and the emitted object. Not the pipeline, not the
answer display (5.1), not the state pills panel (6.3), not file handling (Phase 7). If you find
yourself calling the proxy, you have gone past this step.

DELIVERABLE
The composer matching the screenshot, its state in the session store, and a documented typed
request object with the exact shape step 5.2 will consume.

VERIFY BEFORE YOU FINISH
Type several paragraphs into it and confirm nothing clips, truncates, or lags. Reload mid-sentence
and confirm the text comes back. Confirm the button is pressable on a cold load with nothing
configured. Compare against the actual screenshot and say plainly where it differs rather than
rounding "close" up to "matches".
```

## STEP 5.1 — Streaming display  ·  ⚡  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md and Divergence_AI_App_Screenshot_V3.png. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm CANON.md's conversation area matches the screenshot (confidence line, 5-star row, download icon).

Read Feature 8 and the pipeline in CANON.md. Match the conversation area in the screenshot.

Build the streaming answer display: render tokens as they arrive from the proxy, show a stage indicator while the pipeline runs (translating, routing, composing, answering), render the finished answer with the confidence line ("92% confident this is what you meant"), the 5-star row, and the download icon, exactly as the screenshot shows. Clicks and stage changes respond under 300ms.

Also render the router's honesty output. routing.js returns downgraded and notes. ROUTING.md's guarantee is that "the free tier never silently gives a worse answer, it always says when a stronger route existed" — which is only true if those fields reach the screen. When the router downgraded a Deep-tier question to Sonnet on the free plan, or escalated for low translation confidence, that note appears with the answer, in the same quiet monochrome as the confidence line. It is information, not a warning and not an upsell.

OUTPUT: the streaming display.
```

## STEP 5.2 — Pipeline orchestrator  ·  [FABLE]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

CONTEXT & REASON
Every service in this app has been built alone, in its own session, by a model that could not see
the others. This step is where they first have to behave as one product — and it is the exact
place previous attempts drifted, because each service quietly assumed a slightly different shape
for what the one before it hands over. You are not writing new features here. You are making a
contract and forcing five existing pieces to honour it.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): PIPELINE.md, ROUTING.md, TRANSLATION-SPEC.md (from 2.1), TECHNIQUE-MATRIX.md
(from 4.1), routing.js, and the request object spec from step 5.0. If any is missing from the repo, stop
and ask me — do not reconstruct a stage's interface from what it "probably" returns. Inferring one
of these contracts instead of reading it is precisely how this step failed before.

SELF-CHECK BEFORE BUILDING
Read PIPELINE.md's five stages and ROUTING.md's contract. Confirm for yourself that what each
earlier step actually built matches what the next one expects — in particular that translation's
confidence output is shaped the way routing.js's confidence input expects, and that below-60
confidence asks a clarifying question instead of routing. If two stages disagree, or a stage's
real output differs from its spec, stop and tell me exactly where before wiring anything. Do not
adapt one side to fit the other on your own judgement; that decision is mine.

GOAL
One request flows: composer → translation → routing → technique selection → composition →
execution → streamed answer, with each handoff typed and each stage's output logged. Done means a
real question typed into the real composer produces a real streamed answer through the real proxy,
and PIPELINE-CONTRACT.md describes every handoff precisely enough that a future session could
rebuild any single stage without reading the other four.

THE GATES THIS MUST RESPECT
Confidence 80+ proceeds. 60-79 proceeds carrying a visible moderate-confidence note. Below 60 does
not route at all — it asks a clarifying question and the request ends there. Routing's confidence
coupling escalates but never downgrades, and never overrides the user. Routing's downgraded/notes
outputs are carried forward, not dropped — they are the free tier's honesty guarantee and step 5.1
displays them.

WHERE THE RISK IS
Do not rebuild any stage. Do not "improve" routing.js. Do not add abstraction, adapters, or error
paths for conditions that cannot happen. If a stage is broken, report it; fixing it here is how one
step becomes five steps of untracked changes. The value of this step is entirely in the contract,
not in new code.

HOW TO CHECK YOUR OWN WORK
Once PIPELINE-CONTRACT.md exists, verify each stage against it with a fresh-context subagent — one
per stage, given the contract and the code, not your reasoning about either. A stage that satisfies
the contract you wrote while reading its code is not a check; it's a mirror. You have ample context remaining. Don't stop, summarize, or suggest a new session on account of
context limits.

DELIVERABLES
- The orchestrator, running all five stages in order with explicit typed handoffs
- PIPELINE-CONTRACT.md: exactly what each stage receives and returns, including the gate and
  coupling behaviour, and including which fields are allowed to be absent

VERIFY BEFORE YOU FINISH
Run a real question end to end and report what actually happened at each stage — the real
confidence number, the real model chosen, the real techniques applied — not what the code should
produce. Run one deliberately vague question and confirm it stops at the clarifying question rather
than routing. If a stage fails, say which one and why rather than reporting the pipeline as
working. When you have run these two cases you have enough; do not enumerate hypothetical failure
paths you have not observed.

Before you report progress on anything, audit the claim against a tool result from this session.
Report only work you can point to evidence for; if something isn't verified yet, say so. Report
outcomes faithfully — if something failed, say so and show the output; if you skipped something,
say that; if it's done and verified, say so plainly without hedging.

Before you end your turn, read your last paragraph. If it's a plan or a promise about work you
haven't done, do that work now instead of ending.

HOW TO REPORT
Lead with the outcome — your first sentence should answer "what happened". Detail after. Keep it
short by leaving things out, not by compressing it into fragments or arrow chains.
```

## STEP 5.3 — Error, retry, timeout  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md. If it's missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm CANON.md's time rules (sub-300ms, indicator over 1 second, no blame) are present.

Read the ADHD hard rules on time and silent waiting in CANON.md.

Add error boundaries around every pipeline stage and API call: retry transient failures, time out gracefully, show neutral non-blaming copy on failure. Show an indicator for any wait over 1 second. OUTPUT: the error handling wired through the orchestrator.
```

## STEP 5.4 — Telemetry  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): PIPELINE.md. If it's missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the transparency card and learning loop consume telemetry (per PIPELINE.md).

Build a lightweight logging service recording per request: complexity score, model chosen, techniques applied, confidence values, timings, token counts in and out per call, any downgrade or escalation notes. Token counts are here because the Token Usage sidebar panel and the learning loop both need them and nothing else measures them. Local only, no third-party analytics. Feeds the transparency card and learning loop. OUTPUT: the telemetry service wired to the orchestrator.
```

---

# PHASE 6 — STATE DETECTION

## STEP 6.1 — Detection architecture  ·  [OPUS]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): PIPELINE.md. If it's missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm PIPELINE.md says detection fires ON THE BUTTON, not live while typing, with no local heuristic tier. If it describes live typing detection or a two-tier design, stop and tell me, that is the retired approach.

Read STATE DETECTION in PIPELINE.md, including the RESOLVED note.

RESOLVED, overrides any older spec: state detection runs on demand when the user hits TRANSLATE & ASK, alongside the translation call. It does NOT run live while typing. No local heuristic tier, no sub-300ms detection budget. It is a single on-demand classification.

Build the detection service: on the button press, classify the input across the four dimensions and return the result for pills, calling claude-haiku-4-5 through the proxy. OUTPUT: the on-demand detection service.
```

## STEP 6.2 — Four-dimension classifier prompt  ·  [OPUS]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): PIPELINE.md. If it's missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the four dimensions and their system impacts match PIPELINE.md.

Read STATE DETECTION in PIPELINE.md for the four dimensions and signals.

Write the classifier prompt scoring input across Emotion, RSD Level, Interest, and Cognitive Mode, including each state's system impact (Overwhelmed recommends directness Level 1, etc). Tune for claude-haiku-4-5. OUTPUT: the classifier prompt and its output schema.
```

## STEP 6.3 — State pills UI  ·  ⚡  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): MATERIALS.md and Divergence_AI_App_Screenshot_V3.png. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm MATERIALS.md allows purple on the Emotion pill. If it says purple is logo-only, stop and tell me, that conflict is resolved in favor of purple pills.

Match the STATE DETECTION panel in the screenshot exactly: the pills row (purple Emotion, red RSD, green Interest, blue Cognitive Mode), the explanatory line ("You sound overwhelmed. I told the AI to be extra supportive..."), the Adjust control, the dismiss X.

Build the pills UI. Each pill dismissible with the X and correctable (clicking opens a small correction control). Purple on Emotion is intended. OUTPUT: the pills UI fed by the detection service.
```

## STEP 6.4 — Correction learning  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): PIPELINE.md and CANON.md. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the correction threshold is 15+ and corrections write to the account store.

Read the correction note in PIPELINE.md and STORES in CANON.md. Build the correction store: record pill corrections, and after 15+ for a given state, adjust future detection for that user. OUTPUT: the correction store and threshold logic writing to the account store.
```

## STEP 6.5 — State feeds  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): PIPELINE.md. If it's missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the four consumers are directness, technique selection, answer tone, transparency card.

Build the state bus delivering detected state to its four consumers: directness auto-recommendation, technique selection, answer tone, transparency card. One source, four subscribers. OUTPUT: the state bus wired to those consumers.
```

---

# PHASE 7 — CONTEXT MANAGEMENT

## STEP 7.1 — File upload and limits  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md. If it's missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the limits are 10MB per file, 50MB per session.

Read Feature 6 in CANON.md. Build file upload with validation: accept PDF, TXT, JSON, CSV, images. Enforce 10MB per file, 50MB per session. Loaded context persists across questions in the session store. Match the Attach control in the screenshot. OUTPUT: upload plus validation.
```

## STEP 7.2 — OCR pipeline  ·  ⚡  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md, plus the step 7.1 upload code. If any is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm OCR should run without blocking the UI.

Extend step 7.1: when an image is uploaded, run OCR in a web worker so the UI never blocks, adding extracted text to session context. OUTPUT: worker-based OCR wired to upload.
```

## STEP 7.3 — URL fetch  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md. If it's missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm URLs are fetched through the proxy, never directly from the browser.

Build URL context: the user pastes a URL, the app fetches it through the proxy, extracts readable text, adds it to session context. OUTPUT: proxy fetch and extraction wired to the context system.
```

## STEP 7.4 — Variables  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md. If it's missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm variables live in the session store and can be explicitly saved to the account store.

Read the variable part of Feature 6 in CANON.md. Build variables: the user creates named values like $project_name, the app substitutes them into prompts. Session store by default, explicitly savable to the account store. OUTPUT: the variable creator and substitution.
```

## STEP 7.5 — Context Snapshot panel  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md and Divergence_AI_App_Screenshot_V3.png. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the panel lists loaded items with a remove X each.

Build the Context Snapshot sidebar panel (right column) listing every loaded context item with a remove X, matching the screenshot. OUTPUT: the panel reading from session context.
```

---

# PHASE 8 — ANSWER EXPERIENCE

## STEP 8.1 — Feedback rating  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md and Divergence_AI_App_Screenshot_V3.png. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm feedback is optional and neutral in tone.

Read Feature 7 in CANON.md. Build the 5-star rating under each answer with an optional "What could be better?" field, matching the screenshot. Saves immediately to the account store. Optional and neutral, never required, never judgmental. OUTPUT: the rating component.
```

## STEP 8.2 — Transparency card  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md and Divergence_AI_App_Screenshot_V3.png. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the three sub-cards are Routing, Techniques, Confidence.

Read Feature 8 in CANON.md. Match the TRANSPARENCY DETAILS control in the screenshot. Build the expandable card with three sub-cards: Routing (model, complexity, domain, scope, whether extended thinking was applied, and any downgrade or escalation note), Techniques (which and why), Confidence (translation, routing, technique, overall), reading from telemetry. The Routing sub-card is where the full audit trail lives — the answer itself carries only the short note from step 5.1. OUTPUT: the transparency card.
```

## STEP 8.3 — Debate mode  ·  [OPUS]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): PIPELINE.md and Divergence_AI_App_Screenshot_V3.png. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm Debate is a two-column two-stream view.

Read MULTI-AI ACTIONS in PIPELINE.md. Match the MULTI-AI ACTIONS control in the screenshot. Build Debate mode: two AI streams argue opposite sides in a two-column view. OUTPUT: the dual-stream debate view.
```

## STEP 8.4 — Consensus and Synthesis  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): PIPELINE.md. If it's missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm Consensus and Synthesis run on claude-opus-4-8 at runtime.

Read MULTI-AI ACTIONS in PIPELINE.md. Runtime model is claude-opus-4-8. Build Consensus (common ground after a debate: disagreement, common ground, unified view) and Synthesis (combine perspectives into one refined answer the user can use to replace the original or merge below). OUTPUT: both modes.
```

## STEP 8.5 — Download and export  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md and Divergence_AI_App_Screenshot_V3.png. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm formats are Markdown default, HTML, JSON, PDF.

Read Feature 10 in CANON.md. Build the download modal: pick content (answer text, confidence, rating, transparency, state pills) and format (Markdown default, HTML, JSON, PDF), then download or copy to clipboard. Match the download icon in the screenshot. OUTPUT: the export system.
```

---

# PHASE 9 — SESSION MANAGEMENT AND SIDEBAR

## STEP 9.1 — Session lifecycle  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md and Divergence_AI_App_Screenshot_V3.png. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm New Session keeps settings but clears history and context.

Read Feature 11 in CANON.md. Match the QUICK ACTIONS row in the screenshot. Build New Session (fresh conversation, keeps settings, clears history and context), Duplicate Session (copy conversation, context, settings), Close Session (save and archive, discard, or archive tagged). OUTPUT: the lifecycle flows wired to the stores.
```

## STEP 9.2 — Templates and saved prompts  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md and Divergence_AI_App_Screenshot_V3.png. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm templates pre-populate settings plus an optional starter question.

Read Feature 11 in CANON.md. Build Load Template (pre-populate model, directness, technique, optional context and starter question) and Saved Prompts (reuse previous questions), matching the screenshot controls, reading and writing the account store. OUTPUT: both.
```

## STEP 9.3 — Import system  ·  [OPUS]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md. If it's missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the seven import paths (file, URL, previous conversation, variables, context snapshot, saved prompts, template settings).

Read the Import part of Feature 11 in CANON.md. Build Import with its seven paths. OUTPUT: the import system.
```

## STEP 9.4 — Visibility toggle  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md. If it's missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm Quick Tools defaults OFF and the seven checkboxes and their defaults match.

Read Feature 12 in CANON.md. Build the gear dropdown (top right) with 7 checkboxes: Recent Sessions ON, Context Snapshot ON, Recent Activity ON, Token Usage ON, Model Status ON, Quick Tools OFF, Active Session OFF, plus Reset to defaults. Settings persist. OUTPUT: the toggle controlling sidebar visibility.
```

## STEP 9.5 — Revolving-door accordions  ·  ⚡  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md and Divergence_AI_App_Screenshot_V3.png. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm only one accordion panel is expanded at a time.

Read the accordion behavior in Feature 12 of CANON.md. Match the right-column accordion stack in the screenshot (Recent Sessions, Context Snapshot, Recent Activity, Token Usage, Model Status, Active Session). Build the revolving-door controller: only one panel expanded at a time, clicking a header expands it and collapses the others. OUTPUT: the accordion stack.
```

## STEP 9.6 — Quick Tools grid  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md and Divergence_AI_App_Screenshot_V3.png. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the grid is 2x3 (Router, Techniques, Prompt Library, Variables, Checkpoints, Dashboard) and hidden by default.

Match the QUICK TOOLS grid in the screenshot: a 2x3 grid of Router, Techniques, Prompt Library, Variables, Checkpoints, Dashboard, each an icon tile, hidden by default per the visibility toggle. OUTPUT: the grid.
```

## STEP 9.7 — Left nav content  ·  [HAIKU]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md and Divergence_AI_App_Screenshot_V3.png. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the nav items match the screenshot list.

Populate the left nav with its static items matching the screenshot: Home, Dashboard, Messages, Archive, Resources, Projects, Integrations, Tasks, Customize, Translate, with icons, plus Trash, the green System Status dot, and the logout control at the bottom. Static items and routing only. OUTPUT: the finished left nav.
```

---

# PHASE 10 — LEARNING LOOP

## STEP 10.1 — Pattern analysis engine  ·  [OPUS]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): PIPELINE.md. If it's missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the trigger is 15+ questions and dampening is required.

Read LEARNING LOOP in PIPELINE.md. Build the async learning job: after 15+ questions, analyze feedback and correction patterns and propose rule refinements (low ratings plus "too verbose" reduce Detailed), with dampening so one rating does not swing behavior. Runs in the background, never blocking. OUTPUT: the analysis engine.
```

## STEP 10.2 — Rule refinement application  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): PIPELINE.md and CANON.md. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm refinements write to the account store with an audit log.

Build the applier taking the learning engine's proposed refinements and applying them to the user's routing and technique preferences in the account store, with an audit log of what changed and why. OUTPUT: the applier and audit log.
```

---

# PHASE 11 — HARDENING AND AUDIT

## STEP 11.1 — ADHD hard rules audit  ·  [FABLE]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

CONTEXT & REASON
DIVERGENCE.AI's entire value proposition depends on the ADHD hard rules in CANON.md actually
holding across the built app, not just existing on paper. This audit is the check that catches
drift before it ships. Step 11.5 fixes what you find, so your job is to find it precisely, not to
fix it.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md. If it is missing from the repo, stop and tell me.

SELF-CHECK BEFORE BUILDING
Confirm CANON.md contains the full ADHD Hard Rules list (cognitive load, time, sensory,
decisions, persistence, feedback, accessibility). If any category is missing or the rules
contradict each other, stop and tell me before auditing.

GOAL
A rule-by-view audit of the built app against every ADHD hard rule in CANON.md, precise enough
that each violation can be fixed without further investigation.

HOW TO WORK THROUGH IT
The views are independent — audit them with parallel subagents rather than serially, each given
the rule list and one view. Intervene if one drifts into fixing rather than finding. You have ample context remaining. Don't stop, summarize, or suggest a new session on account of
context limits.

WHAT TO CHECK, PER VIEW
No dense info walls (max 3 paragraphs, broken into sections). No hidden info. Never more than
5-7 simultaneous choices. Every visual interaction under 300ms; any wait over 1 second shows an
indicator. No countdowns or forced timeouts. No excessive auto-animation or competing visual
stimuli. Every control has a sensible default; only destructive actions require confirmation.
Transparency always available, never a black box. No lost work on refresh. Input visible
immediately, no forced setup. Feedback always optional and neutral, never judgmental. 100%
operable by Tab, Enter, Escape.

DELIVERABLE
ADHD-AUDIT.md: for every violation found, name the exact view, the exact rule broken, and the
fix — specific enough that someone could apply the fix without re-reading this audit. Lead each
finding with the violation and the fix. Name a rule's text once per category, not before every
entry.

VERIFY BEFORE YOU FINISH
Before you report progress on anything, audit the claim against a tool result from this session.
Report only work you can point to evidence for; if something isn't verified yet, say so. Report
outcomes faithfully — if something failed, say so and show the output; if you skipped something,
say that; if it's done and verified, say so plainly without hedging. Ground every violation in something you observed in the
running app, not in an assumption from reading the code. If a rule can't be verified without a
capability you don't have (e.g. real latency measurement), say that explicitly rather than guessing
a result — step 11.2 measures latency for real, so leaving it unverified here costs nothing. When you have enough
evidence to report a finding, report it: don't re-check something you've already confirmed, and
don't survey hypothetical violations you haven't actually observed.
```

## STEP 11.2 — Performance pass  ·  ⚡  ·  [OPUS]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md. If it's missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the sub-300ms and 1-second rules.

Measure real interaction latency against the sub-300ms rule for every visual response and the 1-second rule for wait indicators. Produce a latency compliance table naming any interaction that misses, with the fix, then apply the fixes. OUTPUT: the table and the fixes.
```

## STEP 11.3 — Keyboard audit  ·  ⚡  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md. If it's missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the 100% keyboard rule and the typing-safe-from-shortcuts rule.

Verify 100% of the app is operable by Tab, Enter, Escape, including every modal, dropdown, accordion, pill. Confirm typing in a field never triggers a global shortcut and no stray key can fire a destructive action. Produce a keyboard compliance checklist and fix any gap. OUTPUT: the checklist and fixes.
```

## STEP 11.4 — Visual verification  ·  [FABLE]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

CONTEXT & REASON
DIVERGENCE.AI's visual identity has one ground truth: the V3 screenshot. This step exists to
catch drift between what got built and what the screenshot actually shows — not to re-judge
taste, but to compare against the real reference image.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): MATERIALS.md, MARBLE-CONTRACT.md (from step 1.3), and
Divergence_AI_App_Screenshot_V3.png.
This step is a visual comparison against a reference image — it cannot be done without that
image. If Divergence_AI_App_Screenshot_V3.png specifically is missing from the repo, do not attempt this
step by inference, memory, or by re-reading MATERIALS.md's text description as a substitute.
Stop immediately and ask me to attach the screenshot before doing anything else, even if
MATERIALS.md and MARBLE-CONTRACT.md are both present. A text description of a color is not the
same evidence as the pixel value in the image, and this step's entire purpose is checking
against the image.

SELF-CHECK BEFORE BUILDING
Confirm MATERIALS.md and MARBLE-CONTRACT.md both state one continuous slab, three surfaces only.
If either says seven materials or allows per-component marble, stop and tell me before
proceeding.

GOAL
A visual compliance report comparing the running app against the screenshot and against
MARBLE-CONTRACT.md, precise enough that every deviation found can be fixed without further
investigation — and each deviation actually fixed, not just logged.

HOW TO WORK THROUGH IT
The surfaces are independent — compare them with parallel subagents where that helps, each given
the screenshot and one surface. Fix only what the comparison found; don't refactor around it and
don't improve what already matches. You have ample context remaining. Don't stop, summarize, or suggest a new session on account of
context limits.

WHAT TO CHECK
Marble is one continuous slab, visibly textured not solid black, continuous across every gutter
and behind every card, no per-component marble, no seams, no stretching on resize. Cards show
marble blurred behind them, never opaque, never carrying their own texture. Blue Marble buttons
are deep sapphire with a soft top glow, not neon. The three-column layout, top bar, state pill
colors, and overall palette match the screenshot. Colors come from tokens.css — any hardcoded
hex in a component is a finding even if it happens to be the right colour.

DELIVERABLE
A visual compliance report: screenshot the running app, compare side-by-side against
Divergence_AI_App_Screenshot_V3.png, name every deviation found, and apply the fix for each one.
Lead each finding with the deviation and the fix.

VERIFY BEFORE YOU FINISH
Before you report progress on anything, audit the claim against a tool result from this session.
Report only work you can point to evidence for; if something isn't verified yet, say so. Report
outcomes faithfully — if something failed, say so and show the output; if you skipped something,
say that; if it's done and verified, say so plainly without hedging. Every claim of compliance points to an actual screenshot
comparison you made, not an assumption from reading MATERIALS.md. If something looks close but not
exact, say so rather than rounding it up to "matches". When you have compared a surface and found
it correct, move on — don't re-verify it or list deviations you haven't seen.
```

## STEP 11.5 — Apply the audit fixes  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): ADHD-AUDIT.md (from step 11.1) and CANON.md. If ADHD-AUDIT.md is missing from the repo, stop and tell me. This step applies a specific list; without the list there is nothing to apply.

SPOT CHECK FIRST: confirm every entry in ADHD-AUDIT.md names a view, a rule, and a fix. If an
entry is missing its fix or names a rule not in CANON.md, list those entries and stop — they need
a decision from me, not a guess from you.

CONTEXT & REASON
Step 11.1 produces a list of ADHD rule violations and stops there. 11.2, 11.3 and 11.4 each fix
what they find; 11.1 is the only audit whose findings had nowhere to go. This is where they go.
These rules are the product's reason to exist, so an unfixed audit is worse than no audit — it
means the failure is known and shipped.

GOAL
Every violation in ADHD-AUDIT.md fixed, or explicitly escalated to me with a reason. Done means a
re-check of each entry against the running app passes, and ADHD-AUDIT.md is updated in place with
each entry marked fixed, escalated, or no-longer-reproducible.

BOUNDARY
Fix what the audit names. Do not refactor around it, do not fix things the audit didn't find, and
do not relax a rule to make a fix easier — if a rule cannot be satisfied without a product change,
that is an escalation to me, not a judgement call for you.

DELIVERABLE
The fixes, and ADHD-AUDIT.md updated in place with the status of every entry.

VERIFY BEFORE YOU FINISH
Re-check each fix against the running app, not against the diff. Report anything you escalated
rather than burying it in a summary.
```

---

# PHASE 12 — TESTING AND DEPLOY

## STEP 12.1 — Unit tests  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): PIPELINE.md and PIPELINE-CONTRACT.md (from step 5.2). If either is missing from the repo, stop and tell me.md is what says what each stage actually returns, and tests written against the spec instead of the contract will pass while the app is broken.
SPOT CHECK FIRST: confirm routing already has tests.js and does not need new scorer tests.

Write unit tests for each pipeline stage (translation, technique selection, composition, execution; routing already has tests.js) and the stores, wired into CI to run on every change. OUTPUT: the test suite and CI config.
```

## STEP 12.2 — End to end flows  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md. If it's missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the core flow (type, TRANSLATE & ASK, pills, streamed answer, rate, autosave restore) matches CANON.md.

Write Playwright end-to-end tests for the core flows: type a question, hit TRANSLATE & ASK, see pills, get a streamed answer, rate it, confirm autosave restores after reload, run a multi-AI action. OUTPUT: the E2E suite.
```

## STEP 12.3 — Deploy  ·  [SONNET]

```
INTERFACE CHECK: before doing anything, confirm you're running as Claude Code with this project
folder open as the working directory. If not, stop and tell me.

ALWAYS READ (from the repo): CONVENTIONS.md (from step 1.1) and tokens.css (from step 1.2). If
either is missing from the repo, stop and tell me.
BUILD LOG: this build runs across sixty sessions and none of them can see the others.
BUILD-LOG.md, in the repo root, is the only thing they share. Read it directly from the repo. If
it isn't there, say so and stop: it means an earlier step didn't finish, and building on top of
that is how this goes wrong.

Before you build, read it. If a decision in there already settles something this step is about to
choose, follow it — do not re-decide it. If you think a logged decision is wrong, say so and stop;
do not quietly override it. This read is the point. Re-deciding a settled question is the exact
failure the log exists to prevent, and it costs nothing to check.

When you finish, before you report back to me, update BUILD-LOG.md in place:
- The WHERE YOU ARE line at the top: this step done or blocked, and what the next step is.
- DECISIONS: append one line per real choice you made that a later step could otherwise
  contradict — what you decided, why, what you rejected. Real decisions only, not a diary.
- PARKED: append one line per thing you had to leave unfinished and what it's waiting on. If this
  step unblocked something already parked, strike that line rather than leaving it to rot.

Append; don't rewrite the file. The only line you edit is WHERE YOU ARE.

REQUIRED FILES (read from the repo): CANON.md, ROUTING.md. If either is missing from the repo, stop and tell me.
SPOT CHECK FIRST: confirm the proxy from step 1.10 holds the API key server-side.

Deploy the web app and its proxy to a live URL with a working deploy pipeline, so a push ships an update. Confirm the live URL runs the full pipeline end to end. OUTPUT: the live URL and the pipeline config.
```

---

# WHAT IS ALREADY DONE BEFORE YOU START

The routing engine (Phase 3) is built and tested: routing.js and tests.js. Phase 3 only wires it in and changes one model string to claude-sonnet-5. Everything else is a fresh build, in order.

---

# WHAT CAN STOP A STEP

Three kinds of thing. Only the first is by design.

**1. A missing file.** Any step stops and asks you if you paste it without its named files, including the two standing files. That is deliberate, so nothing ever builds half-blind. Step 0 exists to catch all of these at once, before you've started.

**2. A contradiction the spot-check catches.** Each prompt checks its files against the locked decisions before building. If it finds a conflict it stops and reports rather than picking a side. That is also deliberate — a step that resolves a contradiction on its own has just made a product decision without you.

**3. One of the two open questions below.** These are real, and they are not file problems. Revision 1 of this file claimed only missing files could stop a step; that was wrong, and believing it is how you'd arrive at step 9.7 with no idea what those ten nav items do.

Every design conflict from the old four files is resolved in CANON.md, MATERIALS.md, PIPELINE.md, and ROUTING.md.

---

# OPEN QUESTIONS

One decision this file cannot make for you. Question 3 (should the build track its own progress) is answered and built — see the changelog. Question 1 (left nav items and Quick Tools tiles) is also answered — CANON.md gained a new LEFT NAVIGATION section (after LAYOUT) defining all ten left-nav destinations, plus confirming the left-nav Dashboard item and the Quick Tools Dashboard tile are the same screen; Integrations is explicitly logged as not-yet-defined rather than invented. Full resolution record in BUILD-LOG.md DECISIONS.

**Runnable right now:** every step through 12.3 — Question 1 no longer blocks 9.6, 9.7, or Phase 11. (Question 2 below is unaffected by this update and untouched.)

**2. Do you have 31_0_translation_test_cases.md?**
Blocks: 2.4.
PIPELINE.md's verification target (90% overall, no category below 80, reported per category) depends on a 50-case corpus drawn from your real conversation archive. Step 2.4 hard-stops without it, correctly — invented test cases would verify nothing. If the file doesn't exist, that's not a missing attachment, it's unbuilt work, and it needs a step of its own before 2.4.

---

# CHANGELOG — REVISION 5

**Rewritten for Claude Code, not the chat window.** Every prompt in this file used to say "attach
this file" and "if it's not attached, ask me first" — language left over from when these were
meant to be pasted into plain chat with files uploaded by hand. That's no longer how this build
runs: every step operates inside the repo folder with direct file access. The old wording didn't
just look wrong, it could actively stall a step — an agent sitting in a folder that can already
see CANON.md has no reason to wait for something to be "attached."

Every step now:
- Opens with an **INTERFACE CHECK** — one line asking the model to confirm it's running as
  Claude Code with this repo folder open as the project, and to stop and say so if it isn't. This
  was added because a step run in the wrong interface (plain chat, no file access) would silently
  fail in a much more confusing way than a step that catches it up front.
- Reads its required files directly off disk (**REQUIRED FILES (read from the repo)**) instead of
  waiting for an attachment. If a file is genuinely missing from the folder, it still stops and
  tells you — that behavior didn't change, only how the check happens.
- Reads BUILD-LOG.md the same way — no more "it is not attached to this message" framing.

**Nothing about what each step builds changed.** Model assignments (Fable/Opus/Sonnet/Haiku),
goals, scope boundaries, verification clauses, the FABLE-specific additions from revision 4 — all
untouched. This revision is entirely about how a step gets its inputs, not what it does with them.

---

# CHANGELOG — REVISION 4.1

**Fixed: step 0 was unrunnable and step 1.1 was pointing at nothing.** The BUILD LOG block added in revision 3 was applied uniformly to all sixty prompts, including the two it can't be true of. Step 0 was told to read BUILD-LOG.md and stop if it wasn't there — while its own deliverable is to create it. It would have stopped on its first instruction. Step 1.1 was told to read it "in the repo root" when there is no repo until step 1.1 makes one. Both now say what's actually true at that point in the build. Found by checking before running rather than after.

---

# CHANGELOG — REVISION 4

**The five [FABLE] prompts (1.1, 1.3, 5.2, 11.1, 11.4) audited against the Fable 5 prompting guide.** They already passed on the big things — goal not steps, reason up front, self-check, falsifiable verification, no reasoning-narration. Four things the guide calls for were missing from all five and are now added where they earn their place:

- **The evidence-audit clause** — the guide's highest-leverage anti-fabrication instruction, and Fable's one documented consistent failure mode is confident fabrication in report-style output. Four of these five steps produce exactly that. All five now carry it.
- **Fresh-context subagent verification** on 1.3, 5.2, 11.1, 11.4. The guide is explicit that verifier subagents beat self-critique. Step 1.3 has failed fourteen times and a model cannot see the seam it just built; 5.2 checking its own contract against its own code is a mirror, not a check. Omitted from 1.1 — too small to be worth it.
- **Brevity clause** on 1.1, 1.3, 5.2. 11.1 and 11.4 already had one.
- **Context reassurance** on 5.2, 11.1, 11.4 — the long ones. Omitted from 1.1 and 1.3, which are short.

Also: **1.3 had no scope boundary at all** — the one step most able to over-engineer, with the worst track record. It has one now. And 1.3 and 5.2 now carry the anti-early-stopping check ("if your last paragraph is a promise, do the work instead of ending"), which addresses Fable's documented habit of announcing an action without executing it.

**Deliberately NOT applied from the guide:** the "you are operating autonomously, don't ask permission" clause. It contradicts the entire design of this file — every prompt stops and asks when a file is missing or a spec contradicts, and that gate is the point. These prompts assume you're watching. Don't add that clause without changing that assumption.

**Worth knowing:** Fable is $10/$50 per million tokens, double Opus, and the guide notes no built-in turn limit on open-ended work. 11.1 and 11.4 audit a whole app. The rule lists are their brake, but keep an eye on them.

---

# CHANGELOG — REVISION 3

**Open question 3 answered: the build logs itself, in a file.** Step 0 creates BUILD-LOG.md, step 1.1 moves it into the repo root, and all sixty prompts carry a BUILD LOG block. Each step reads it before building — so it follows a settled decision instead of re-making it — and updates it when it finishes: the WHERE YOU ARE line at the top, a DECISIONS line for anything a later step could contradict, a PARKED line for anything left unfinished.

The read is the half that matters. Logging what happened only tells you where you were; reading before deciding is what stops sixty stateless sessions from re-litigating the same question.

It's a file in the repo rather than an external database on purpose: nothing to remember to check, nothing to keep in sync, no token, and it can't drift out of step with the code it describes because it sits next to it. You open it only when you want to know where you are.

This needed deciding before step 0 rather than "whenever", because it's a line in all sixty prompts: decide it at step 40 and steps 1-39 logged nothing. Revision 2 called it non-blocking, which was true of dependencies and misleading in practice.

---

# CHANGELOG — REVISION 2

**Prompts replaced with their Fable-style rewrites:** 1.1, 1.3, 11.1, 11.4. These existed in a chat export and had never been folded back into this file, so this file was still shipping the superseded versions of all four — including 11.4 without its screenshot gate. 11.1 and 11.4 also picked up the anti-overplanning and brevity clauses that were suggested and never applied; back them out if you don't want them.

**Steps added:**
- **0 — File inventory and manifest.** Catches every missing file at once, before step 1.1, and records the real filenames so no later step has to guess which texture file is which.
- **4.5 — Technique selector UI.** Model got wired at 3.2 and Directness got its control at 4.4. Technique is the third dropdown in the same row and had no step at all.
- **5.0 — Input composer and control row.** Nothing built the input box, the TRANSLATE & ASK button, or the control row — while 6.1, 5.2 and 12.2 all assumed they existed.
- **11.5 — Apply the audit fixes.** 11.1 wrote ADHD-AUDIT.md and no step ever read it. Every other audit in Phase 11 fixes what it finds; that one just filed it.

**Step 5.2 rewritten** in the same goal-and-boundaries style as the other Fable steps. It was tagged [FABLE] and never revised, despite being the step this file itself calls the place prior branches drifted.

**Standing files.** CONVENTIONS.md and tokens.css are now attached to every step that writes code. They were produced at 1.1 and 1.2 and then never named again, so 55 fresh sessions were writing code with no naming conventions and no colour tokens — which is how hardcoded hexes and drift get in.

**Chain repairs.** PIPELINE-CONTRACT.md now required by 12.1. FILE-MANIFEST.md now required by 1.3.

**Gaps closed in existing prompts.**
- 1.7: the plan flag ("free"/"paid") now has a home in the account store. routing.js has always taken it as input and nothing supplied it.
- 5.1: the router's downgraded/notes now reach the screen. ROUTING.md's promise that the free tier "always says when a stronger route existed" was true of the engine and false of the app.
- 8.2: the Routing sub-card now shows extended thinking and the downgrade note.
- 5.4: telemetry now logs token counts — the Token Usage panel and the learning loop both need them and nothing measured them.
- 1.2: Anthropic Sans isn't publicly licensed; the step now handles that instead of stalling on it.

**Corrections.** Step count 57 → 60 (there were only ever 56). The ⚡ mark is now defined, and removed from 6.1 where it directly contradicted the prompt's own text ("no sub-300ms detection budget"). The footer no longer claims only missing files can stop a step.

**Not changed, on purpose.** Nothing in CANON.md, MATERIALS.md, PIPELINE.md or ROUTING.md. Every gap above was closed inside the build prompts, not by editing the source of truth. If one of these fixes implies a spec change, that's a decision for you, not an edit made quietly in a build doc.
