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
