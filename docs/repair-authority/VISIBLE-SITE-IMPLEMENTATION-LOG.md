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

- App code checkpoint: `76cd104cd43e109d868e7f9928827cc317d15a78`.
- Matching Vercel deployment: `dpl_2L7TA5Nr9TfrvE6VzBDM1iJfYrXU` — READY.
- Vercel ran 67 test files / 635 tests successfully, then passed the full TypeScript and Vite production build.
- The deployed root returned HTTP 200.
- The deployed JavaScript contains the expected Saved Tools, Variables, Checkpoints, All Tools search, and shortcuts-bridge markers.
- An unauthenticated cloud-browser click-through stops at the app's intentional password gate; this is not a source or deployment failure.

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
- The paid Review-first flow is now published as the separately verified follow-on checkpoint below; complete RQ-004 and RQ-007 acceptance remain separate work.
- Backend-heavy repair-queue items remain separate work. They were not pulled into this visible-site pass.

## Follow-on checkpoint — paid Review first

- App code commit: `e03110da135a1aea74c9a52a8f7c0b59408ac03b`.
- Deployment-preservation fix: `8e1055b87cad233d9af6a0b9bf6812cf0098b9b0`.
- Matching Vercel deployment: `dpl_EdnsSFikvL57nmwPcfCys5R9pguP` — READY.
- Deployment URL: `https://claude-project-02-5w37exb2j-thatoneweirdfella1s-projects.vercel.app`.
- Vercel ran 67 test files / 637 tests successfully, then passed the full TypeScript and Vite production build.
- The deployed root returned HTTP 200.

Implemented and verified in this checkpoint:

- Paid connected routes with Review first prepare the translation once, display an editable review, and do not execute the answer request until the user selects Send to AI.
- Show changes exposes original and prepared wording.
- Back and Cancel preserve the original draft and current settings.
- `Send automatically next time` updates the remembered session choice only when the reviewed request is actually sent.
- The exact edited prepared request is passed into the pipeline without a duplicate translation call.
- Preparation usage is retained in telemetry and cost tracking.
- Provider destination models remain separate from the Claude complexity-scorer override, preventing an unsupported provider selection from silently entering that scorer.

Not claimed complete by this checkpoint:

- V2-RQ-004 as a whole remains open pending the remaining SPEC-MC acceptance audit and dependent managed-free work.
- V2-RQ-007 remains open for the complete persisted transparency record and `Why this worked` behavior.
- Server-backed provider connections, managed allowance, authoritative credit reservation/reconciliation, and provider-specific execution remain in their later queue items.
