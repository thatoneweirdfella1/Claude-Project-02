# Visible Site Implementation Log

## Authority and scope

- Repository: `thatoneweirdfella1/Claude-Project-02`
- Working branch: `cowork-complete-preview-20260823`
- Authority: `DIVERGENCE-AI-CANONICAL-DECISION-AUTHORITY-v2.md` and `DIVERGENCE-AI-CONTROL-BEHAVIOR-MAP-v2.md`
- This batch is deliberately limited to truthful visible behavior: visible navigation, menus, buttons, and tool destinations.
- Frozen branches and the `build` branch were not changed.

## Implemented in this batch

| Visible control | Implemented destination or action |
|---|---|
| Logo | Talk to AI composer |
| Main navigation | Talk to AI, Sessions, Saved Tools, Projects, Insights, Settings |
| All Tools | Searchable list for Templates, Saved Prompts, Techniques, Variables, Checkpoints, and AI Connections |
| System Status | Opens Settings, where connection and storage controls live |
| Top-bar Search | Searches sessions, templates, saved prompts, Projects, Settings, Insights, and Variables, then opens the selected destination |
| Top-bar Templates | Opens Saved Tools on the Templates view |
| Profile and Account and plan | Open Settings |
| Keyboard shortcuts menu item | Opens the existing shortcuts dialog |
| Quick Tools Router | Opens Talk to AI with Advanced Controls visible |
| Quick Tools Techniques | Opens a working technique chooser and applies the selection to the composer |
| Quick Tools Prompt Library | Opens Saved Prompts |
| Quick Tools Variables | Opens a working variable manager with Add to context |
| Quick Tools Checkpoints | Opens checkpoint creation and restore |
| Quick Tools Dashboard | Opens Insights |
| Saved Tools | Templates and Saved Prompts visibly cross-link as two Saved Tools views |

Implementation files:

- `src/components/layout/AppShell.tsx`
- `src/components/layout/LeftNav.tsx`
- `src/components/layout/TopBar.tsx`
- `src/components/layout/ScreenRouter.tsx`
- `src/components/quicktools/QuickToolsGrid.tsx`
- `src/components/composer/AdvancedControls.tsx`
- `src/stores/types.ts`
- `scripts/apply-cowork-preview.cjs`

## Verification

- The current branch source plus the deployment overlay produces a successful Vite production bundle.
- The visible-navigation code introduces no additional TypeScript errors. Three pre-existing model-registry typing errors remain outside this batch; they do not block the Vite bundle and are not claimed fixed here.
- The commit containing this log is the source checkpoint for this visible-site batch. Confirm its matching branch deployment before calling the batch deployed.

## Deferred and not claimed complete

- Quick Reference and Help open working popovers; full contextual right-rail behavior is deferred.
- Notifications show a truthful empty state; notification storage and read-state are deferred.
- Settings opens correctly; section-specific deep links and return-position memory are deferred.
- Sessions works, but its final four-tab information architecture and compact row design remain deferred.
- Projects currently derives groups from session tags; a full project data model remains deferred.
- Saved Tools has working Templates and Saved Prompts views; unified deletion-to-trash semantics remain deferred.
- Insights opens and shows the overview; separate Usage, Activity, and Communication Patterns panels remain deferred.
- System Status opens Settings; live provider health detail remains deferred.
- All Tools search works; pin, move, and unpin behavior remains deferred.
- Search opens the correct content category; per-record focus inside Templates and Saved Prompts remains deferred.
- Checkpoints create and restore recoverable snapshots; preview, pre-restore snapshot, and one-click undo remain deferred.
- Router opens existing Advanced Controls; a dedicated route-reason drawer and recorded Apply action remain deferred.
- The paid Review-first patch remains unpublished until its CenterColumn wiring is complete. Its four local files are intentionally excluded from this batch.
- Backend-heavy repair-queue items remain separate work. They were not pulled into this visible-site pass.
