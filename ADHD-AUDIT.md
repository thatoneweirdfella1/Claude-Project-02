# ADHD-AUDIT — Step 11.1 (rule-by-view audit against CANON.md's ADHD HARD RULES)

**Method.** Four parallel view-cluster audits (composer cluster; conversation/post-answer cluster;
session/sidebar/nav cluster; cross-cutting persistence/copy/sensory/timeout sweep), each reading
every file in its cluster, counting rendered choices per view state, and reading every user-facing
string — plus this session's real rendered captures of the running app (production build served
locally, driven over CDP: default view, Quick Tools on, Settings menu, More menu, Import modal,
Attach popover, 900px viewport). Every finding below was verified against file content at the
cited line before inclusion. Fixes go to **Step 11.5** — nothing was changed here.

**Categories covered elsewhere, not re-audited:** Time (Step 11.2 — audited all waits, fixed the
one missing indicator; live latency parked for 12.3) and Accessibility/keyboard (Step 11.3 —
ten-point checklist, fixed the one Enter-submit gap). Their conclusions stand; see their
BUILD-LOG entries.

---

## VIOLATIONS (fix each at 11.5; violation first, then fix)

### Category: Sensory — "No conflicting color meanings"

**[FIXED — Step 11.5]** **S1. The over-target character counter borrows the Cognitive Mode state color.**
View: composer input box. `composer.css:63-65` — `.input-box__counter--over { color: var(--state-cognitive) }`.
`--state-cognitive` (#3b9eff) is the Cognitive Mode pill's semantic color (pillOptions.ts), and the
counter sits directly above the panel where that pill renders — one blue, two unrelated meanings in
one surface. **Fix:** use a non-state token for the over-target counter (`--text-secondary` at full
opacity, or a new `--counter-over` token). One-line change.
**Applied: `--text-secondary` at full opacity** (composer.css `.input-box__counter--over`) — the
audit's first-listed option, no new token needed.

**[FIXED — Step 11.5]** **S2. The moderate-confidence badge and clarify-note border borrow the same Cognitive Mode color.**
View: conversation area (translation card / confidence badge). `translation.css:86` (badge) and
`translation.css:43` (note border) both use `var(--state-cognitive)`. A Cognitive Mode pill and a
moderate-confidence badge can render on the same message. **Fix:** add `--confidence-moderate`
(distinct hue or `--accent-cyan`) and point both rules at it.
**Applied: `--confidence-moderate: var(--accent-cyan)`** (tokens.css) — matches the pre-existing
code comment's own stated intent ("cyan at moderate," translation.css), and `--accent-cyan` is
a general secondary-interactive color, not a single-meaning state token, so reusing it doesn't
reintroduce the collision the audit is fixing. Points `.translation-card__note` (border) and
`.confidence-badge--moderate` (color) at it.

**[FIXED — Step 11.5]** **S3. The high-confidence badge borrows the System Status green.**
View: conversation area. `translation.css:82` — `.confidence-badge--proceed { color: var(--status-online) }`.
tokens.css's own comment reserves `--status-online` for the System Status dot as a deliberately
separate concept. **Fix:** point the proceed badge at `--state-interest` (if "positive green" is the
intent) or a new `--confidence-high` token. Low severity (both greens read "positive") but it's the
exact cross-semantic reuse the token comments warn against.
**Applied: new `--confidence-high` token** (tokens.css, same #22c55e green), NOT `--state-interest`
— reusing `--state-interest` (a single-purpose Interest-pill token today) would recreate the exact
cross-semantic-reuse pattern this whole audit category exists to eliminate; a dedicated token
resolves it completely and stays consistent with S2's own resolution. Points
`.confidence-badge--proceed` at it.

**[ESCALATED — Step 11.5, needs a product call]** **S4. Red #ef4444 is double-booked: RSD state pill AND destructive actions.**
View: the main translate screen — both can be visible simultaneously (RSD pill in the detection
panel, destructive rows in Quick Actions' More popover / remove-hovers). `tokens.css:59`
(`--state-rsd: #ef4444`) and `tokens.css:67` (`--action-destructive: #ef4444`). The RSD pill is red
at every level, including "low," so the collision isn't rare. This IS a logged Step 1.2 decision
(hue picked from the screenshot by eye) — flagged here because the rule it collides with is
audited, not because the decision was undocumented. **Fix options for 11.5:** give RSD its own
distinct hue (amber family reads "sensitivity level" without the danger connotation — but check
against the V3 screenshot, whose RSD pill is genuinely red) — OR accept and document the
screenshot-fidelity trade-off explicitly in CANON. Needs a product call; the screenshot itself
uses red for the RSD pill, so pure screenshot-fidelity and this rule are in direct tension.

### Category: Persistence — "Never lose work on refresh" (read broadly: never lose work, period)

**[FIXED — Step 11.5]** **P1. Import → previous conversation replaces the live session with no saved copy and no confirm.**
View: Import modal, "Previous conversation" list. `ImportModal.tsx` handleLoadSession →
`sessionStore.loadSessionRecord(record)` replaces conversation/context/variables outright on a
single row click; the next 5s autosave then overwrites the persisted copy of what was there. Unless
the user separately duplicated/archived first, the in-progress conversation is unrecoverable.
**Fix:** in handleLoadSession, file the current live session first —
`addSessionRecord(buildSessionRecord(current, { archived: false }))` — before calling
loadSessionRecord (auto-save-a-copy; no confirm dialog needed since nothing is lost). One-call fix
using existing, tested machinery.
**Applied exactly as specified** (ImportModal.tsx `handleLoadSession`) — imports `buildSessionRecord`,
archives the live session via `addSessionRecord(buildSessionRecord(useSessionStore.getState(),
{ archived: false }))` before calling `loadSessionRecord(record)`.

**[FIXED — Step 11.5]** **P2. New Session destroys the conversation uncomfirmed while Discard — an identical loss — is confirmed.**
View: Quick Actions row. `QuickActionsRow.tsx` fires `newSession()` directly; the store action
clears conversation/context/variables with no archive. The component's own comment claims
"New/Duplicate/Save-and-Archive/Archive-Tagged all keep or file the conversation somewhere" —
factually wrong for New Session, which files nothing. Meanwhile Discard, which loses exactly the
same data, is two-step confirmed. Internally inconsistent under "only confirm destructive actions."
CANON Feature 11 does define New Session as "clears history and context," so the clearing itself is
spec. **Fix:** archive-a-copy inside the New Session handler before clearing (same one-call pattern
as P1) — preserves CANON's defined behavior, removes the data loss, keeps the no-confirm UX; also
correct the stale comment.
**Applied exactly as specified** (QuickActionsRow.tsx) — new `handleNewSession()` archives via the
same one-call pattern as `handleDuplicateSession`, then calls `newSession()`; the button's `onClick`
now points at the new handler; both stale comment passages (claiming New Session "keeps or files
the conversation somewhere") corrected in place.

### Category: Cognitive load — "Never more than 5 to 7 simultaneous choices per view"

**[ESCALATED — Step 11.5, audit's own instruction]** **C1. State Detection panel: 10-11 interactive elements when four pills are shown.**
View: detection panel open, correctors closed. Panel × + 4 pill bodies + 4 per-pill × + Adjust
(+ conditional Apply). `StateDetectionPanel.tsx` / `StatePill.tsx`. Defensible as informational
readouts, but a strict interactive count runs past 7. **Fix (smallest honest reduction):** drop the
four per-pill × buttons in favor of the panel-level × plus corrector-based changes (per-pill
dismiss remains reachable inside the corrector) — brings the count to 6-7. Note: per-pill dismiss
is named in PIPELINE.md ("Pills are dismissible (X) and correctable"), so 11.5 should reconcile
with that line rather than silently deleting the affordance — flag to the operator.

### Category: Decisions — "Only confirm destructive actions" (borderline, single item)

**[FIXED — Step 11.5]** **D1. Built-in preset templates are deletable, unconfirmed, and unrecoverable.**
View: Load Template menu. `LoadTemplateMenu.tsx` remove-× calls `removeTemplate(id)` — works on the
three shipped DEFAULT_TEMPLATES too; nothing restores them (Reset to defaults covers visibility
only). Deleting a preset the user cannot recreate is more destructive than deleting user data.
**Fix:** either exclude built-in ids from showing the remove control, or make template deletion
recoverable (a "Restore default templates" row in the same menu). No confirm dialog needed if
either fix lands.
**Applied: excluded built-in ids from the remove control** (LoadTemplateMenu.tsx), not the restore-row
option — the restore option would require inventing new UI (placement, wording, its own behavior)
beyond what the audit specified, where hiding the control for exactly `DEFAULT_TEMPLATES`' own ids
(imported from accountStore.ts, not a fragile naming-convention guess) is the mechanical, fully-specified
resolution. Both DEFAULT_TEMPLATES-listed rows now render without a remove button; user-created
templates are unaffected.

---

## FLAGS — rule-vs-spec tensions, reported not "fixed" (11.5 should record a decision, not code)

**[RECORDED — Step 11.5, see BUILD-LOG DECISIONS]** **F1. Left nav = 12 always-visible choices.** CANON's LAYOUT mandates all ten items + Trash +
Logout; CANON's cognitive-load rule caps a view at 5-7. The two cannot both hold under a strict
per-region count. A persistent nav list is scan-not-choose interaction, so the audit reads the 5-7
rule as applying to task-flow decision points, not stable wayfinding — but that interpretation
should be RECORDED at 11.5 so Phase 12's audits don't re-litigate it.

**[RECORDED — Step 11.5, see BUILD-LOG DECISIONS]** **F2. VisibilityMenu = 8 controls (7 CANON-mandated checkboxes + Reset).** Same tension in
miniature; homogeneous toggles under one heading. Same recommendation: record the interpretation.

**[NOT APPLIED — Step 11.5, explicitly optional, no mandate to act on]** **F3. DownloadModal = 12 controls (5 content + 4 format + 3 actions).** Mitigated by two labeled
fieldsets and complete defaults (user can export without touching anything). If 11.5 wants it
under 7: format radios → one dropdown. Optional.

**[NOT APPLIED — Step 11.5, explicitly optional, no mandate to act on]** **F4. MultiAiActions manual mode = 9 controls** (4 partner checkboxes + auto/manual toggle +
Start/Consensus/Synthesis). Auto mode (the default) = 5, inside the rule. Option: hide (not just
disable) Consensus/Synthesis until a transcript exists. Optional.

**[NOT APPLIED — Step 11.5, note-level only, no fix requested]** **F5. Template/prompt load overwrites an unsent draft.** LoadTemplateMenu/SavedPromptsMenu replace
`draftInput` uncomfirmed. A single unsent line, expected "load into input" semantics — note-level.

**[NOT APPLIED — Step 11.5, nothing to fix yet]** **F6. Future wiring note: SynthesisView "Replace answer".** tokens.css names Replace Answer a
destructive action; the button is currently events-only/unwired. Whoever wires it must gate it
with useConfirmable — recording now so it doesn't ship unconfirmed later.

**[NO ACTION REQUIRED, per the audit itself]** **F7. Shared green (`--state-interest` = `--status-online` = #22c55e).** Both read "positive";
separate tokens already exist so they can diverge. Lowest severity; no action required.

---

## CLEAN CATEGORIES (evidence-backed, from this session)

- **Persistence (autosave machinery):** every user-work field in both stores is in its persisted-keys
  list (all 9 session + all 11 account fields cross-checked against types.ts); interval is exactly
  5000ms; pagehide + visibilitychange flush handlers present. The two Persistence violations above
  are action-level (P1/P2), not autosave gaps.
- **Feedback tone:** every user-facing string in components + services read; zero judgmental/blaming
  copy. Error copy explicitly de-blames ("Something went wrong reading that — it wasn't you.").
  Rating: no default stars, comment optional + progressively disclosed, never required.
- **Sensory (animation):** the ONLY animation in the codebase is the logo synapse pulse, still
  correctly guarded by prefers-reduced-motion; zero CSS transitions; zero JS animation timers.
- **Countdowns/timeouts:** none. useConfirmable's 4s auto-DISARM cancels a pending destructive
  action (returns to safe state, loses nothing) — a safety debounce, not a forced timeout.
- **Decisions (defaults):** every control has a working default (model auto, directness 2,
  techniques auto-detect, export format Markdown, debate partner auto-select, visibility per CANON).
- **Transparency/black-box:** TransparencyCard exposes routing (model/complexity/domain/scope/
  thinking/notes), techniques (which + why), confidence (all four values) — one click, always
  available. Detection panel shows its summary; directness suggestions are shown, never auto-applied.
- **Input visible immediately:** InputBox renders unconditionally first, no setup gate; verified in
  the rendered default-view capture.
- **Choice counts within range everywhere else:** composer control row 6; technique popover ~5-6
  visible (scroll-capped); Attach popover ≤5 per sub-view; Import modal ≤5 per level; Quick Actions
  5; More popover 4; Quick Tools 6 tiles; accordion 6 headers, revolving-door.
