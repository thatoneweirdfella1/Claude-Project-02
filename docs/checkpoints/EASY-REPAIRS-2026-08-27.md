# Easy Repair Checkpoint — 2026-08-27

Branch: `codex-verified/user-outcome-repair-v1`

## Six contained repairs

1. Visible Send control — VERIFIED PRESENT before this pass.
   - `src/components/composer/TranslateAskButton.tsx`
   - Visible label and aria-label are both `Send`.

2. Translate-screen wording — FIXED in commit `9782d58438036080beeb4038b3391836cd12a0bb`.
   - Active Saved Tools empty state now names `Talk to AI`.

3. Saved Tools / Templates naming — VERIFIED PRESENT before this pass.
   - Primary destination is `Saved Tools`; Templates and Saved Prompts are its explicit subsections.

4. Template starter question and context — FIXED in commit `9782d58438036080beeb4038b3391836cd12a0bb`.
   - Full Saved Tools template action now applies model, directness, techniques, context, and starter question.

5. Top-bar panel closing — FIXED in commit `656c1a16adb22b656837be5e7433adbdcd464d67`.
   - Search, Quick Reference, Notifications, Help, and Profile close whenever screen or subsection navigation changes.

6. All Tools routing — VERIFIED PRESENT before this pass.
   - Entries use the canonical `TOOL_NAVIGATION` map, navigation closes the dialog, and AI Connections routes to Settings > Connections.

## Verification status

- Exact committed diffs and post-write source contents verified through GitHub.
- The branch has no pull-request-triggered workflow run for these direct commits, so no CI result is claimed here.
- Production was not deployed or changed.
