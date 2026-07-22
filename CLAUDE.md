# CLAUDE.md

Instructions for any Claude Code session (local or cloud) working in this repo.

## Branch

Always work on the `build` branch:
- Check it out at the start of every session (`git checkout build`).
- Push to it at the end of every session.
- **Never commit to `main` during the build.** `main` stays untouched until the deploy step
  (Step 12.3 in the build plan).

## Branch discipline

**Never create a new branch, under any circumstance.** Only ever check out and work on the
existing `build` branch. If `build` does not exist when a session starts, STOP immediately and
ask the user — do not create a new branch as a workaround, and do not create one "just to be
safe."

This rule exists because past sessions repeatedly created a new branch per task instead of
continuing on `build`, producing many disconnected, duplicate, unmerged copies of the same
work (visible history: claude/quirky-rubin-s6rckq, claude/app-no-api-ai-hjxgob,
claude/determined-bell-nw1ylt, and others, now deleted). All of that work is lost/orphaned
progress that looked like forward motion but wasn't. Do not repeat this pattern.

If you ever find yourself about to run `git checkout -b` or any branch-creation command,
stop and treat that as a signal you've misunderstood the task — re-read this file instead.

## Multi-account coordination

When two or more accounts work on `build` simultaneously, preventing silent overwrites and lost work
requires strict discipline:

**Before every push, without exception:**
```
git pull origin build --rebase
```

This pulls any commits the other account has pushed and rebases your commits on top. If both accounts
touched the same file, git forces a visible merge conflict during the rebase — you must manually
resolve it. This visibility is what prevents silent data loss. Skipping the rebase or force-pushing
past a conflict is how work dies.

**Every commit message must name the account:**
```
[Account 1] Fix authentication gate
[Account 2] Build Sessions nav screen
```

This way, the commit history makes clear who did what, and drift between accounts becomes visible.

**Never `git push --force` to `build`. Ever.** A failed rebase is always the safe recovery path.
A force-push is always wrong.

## Every build step

1. Read `BUILD-LOG.md` first — the `WHERE YOU ARE` section at the top has the last completed
   step and what's next.
2. Read the actual step text from `DIVERGENCE-BUILD-PROMPTS.md` (repo root) — not from memory,
   not from BUILD-LOG.md's summary of a prior step. The step text in that file is the authority
   for what to build; BUILD-LOG.md's summaries are historical record, not instructions.
3. Run that step's own interface check / spot check / build / verify, in the order the step
   describes.
4. Update `BUILD-LOG.md` (`WHERE YOU ARE`, `DECISIONS`, `PARKED`, the `STEPS` checkbox) and
   commit before moving on to the next step.

## Design layouts

The app supports multiple complete, selectable visual layouts — not just the Light/Dark
theme toggle (CANON Feature 12). A "layout" is a full re-skin: accent color, marble
textures, logo treatment, card/button styling. Theme (light/dark) and layout are
independent and orthogonal — every layout should work in both themes.

**The standing rule:** whenever the operator uploads a new design mockup/reference image
(screenshots of a redesign, a color palette board, generated texture images, etc.), build
it out as a new layout option and add it to the layout picker (the gear/Settings menu,
alongside the Theme radiogroup) so the operator can select it live — don't just apply it
in place of the existing design. The existing design (marble + cyan accent, matching
CANON.md and Divergence_AI_App_Screenshot_V3.png/Divergence_AI_Light_App_Screenshot_V2.png)
is always the `"original"` layout and stays selectable; new layouts are added alongside it,
never by replacing it in the code.

**Current layouts:**
- `"original"` — the CANON-driven marble/cyan design, default.
- `"gold"` — marble + gold accent, per `Gold_Layout_Light_Reference.png` /
  `Gold_Layout_Dark_Reference.png` (repo root, the operator's own mockups) and the two
  generated marble textures in `public/textures/gold-marble-{light,dark}-slab.png`.

A new layout's structural CONTENT (nav items, panel names, feature set) should match
CANON's existing structure unless the operator explicitly asks for structural changes too
— a layout is a re-skin, not license to redesign the information architecture on sight.

**Structural elements in a reference image are never requirements — visual style only.**
Operator-decided, standing correction: a mockup the operator uploads for a new layout is a
generation (AI-produced, e.g. via ChatGPT), and it is in the nature of generation to
fabricate structural details that were never actually decided — different nav items, extra
links, renamed panels, a different logo mark, and so on. This already happened once (the
Gold mockups showed a spiral/vortex logo mark and a different nav list, neither of which the
operator ever asked for — both were the image generator inventing detail, not intent).
Do NOT read a reference image's nav items, links, buttons, or panel set as instructions, and
do NOT ask the operator to reconcile them against CANON. Treat the image purely as a visual
reference for the things a layout actually is — accent color, texture/background treatment,
card/button chrome, spacing, typography feel — and leave CANON's existing structure (nav
items, panel names, feature set, logo mark) untouched by default. Only change structure if
the operator explicitly asks for it in words, separately from uploading the image.
