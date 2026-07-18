# CLAUDE.md

Instructions for any Claude Code session (local or cloud) working in this repo.

## Branch

Always work on the `build` branch:
- Check it out at the start of every session (`git checkout build`).
- Push to it at the end of every session.
- **Never commit to `main`/`master` during the build.** `main`/`master` stays untouched until
  the deploy step (Step 12.3 in the build plan).

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
