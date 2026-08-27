/* Session Management UI (Step 9.1: New/Duplicate/Close Session; Step 9.2:
   Saved Prompts). LoadTemplateMenu.tsx was removed (R07 2nd repair attempt,
   docs/checkpoints/CLAUDE-REPAIR-PROGRESS.md Session 6) — confirmed dead
   code, never rendered anywhere in the app; the live Templates UI is
   TemplatesScreen in src/components/layout/ScreenRouter.tsx. */
export { QuickActionsRow } from "./QuickActionsRow";
export { SavedPromptsMenu } from "./SavedPromptsMenu";
