# DIVERGENCE.AI Project Authority and Scope Lock

## Fixed project direction

- Continue the existing Divergence.AI project.
- Use the existing repository: `thatoneweirdfella1/Claude-Project-02`.
- Preserve `claude/remaining-second-pass-v1` as the untouched safety/layout branch. The exact site snapshot the user identified was deployed from commit `10894f704a39b6c56a7fadfafb54275b82526c33`.
- Make all new reliability task commits on reusable staging branch `divergence/reliability-staging`. Merge only gate-accepted work into protected integration branch `divergence/reliability-v1`.
- Preserve and build from the existing Divergence interface/layout.
- The three files under `docs/ai-control/visual-baseline/` are the supplied visual baseline for continuity. They do not authorize pixel-level invention where they are silent.
- Do not create a replacement application, parallel shell, alternative navigation system, new visual language, separate repository, or unrequested architecture.

## Authority order

When instructions conflict, use this order:

1. The user's latest explicit instruction for the exact issue.
2. An explicit user-approved decision recorded in `DECISION-LOG.md`.
3. The active standalone task packet and its accepted prerequisites.
4. `CURRENT-TASK.md` execution boundaries.
5. The proposed reliability meta-blueprint for background only where the task packet explicitly requires it.
6. Prior AI suggestions, conventions, or inferred preferences.

A lower authority may identify a conflict but may not silently override a higher authority. Record unresolved conflicts as `Open` and stop only the affected work.

## Repository and branch lock

- Repository policy: existing repository only.
- Safety/layout branch: `claude/remaining-second-pass-v1` at baseline commit `10894f704a39b6c56a7fadfafb54275b82526c33`. It is read-only and must not be modified.
- Protected integration branch: `divergence/reliability-v1`. It was created from and verified identical to the baseline commit before control work began.
- Single reusable task branch: `divergence/reliability-staging`, created from integration commit `7681344918a912f0ac35a2fb15c2b41b85638a3f` by explicit user authorization. Reuse it; do not create per-task branches.
- Do not create another branch or repository.
- The active task may write only to the reusable staging branch and only when `branch_mutation_authorized` is true. Integration occurs only after the course-control check passes.
- Merging, rebasing, force-updating, deleting, or deploying requires separate explicit user authorization.
- If the user later authorizes one of those operations, record the exact operation, branch, task scope, date, and wording in `DECISION-LOG.md` before acting.

## One-task scope lock

- Exactly one task may be active.
- Only its stated deliverables, files, checks, and necessary contained corrections are allowed.
- Do not add systems, features, dependencies, abstractions, refactors, documentation programs, or “helpful” cleanup not required by the active task.
- Record useful extra findings in `PARKING-LOT.md`. Only an explicit user decision may promote one into `CURRENT-TASK.md`.
- Never use an extra finding to redefine the current task.

## Existing-layout lock

- F0 is a design task and has no authority to edit the interface.
- Later implementation must prove it is modifying the mounted existing Divergence interface, not an unused component or replacement page.
- A proposed layout departure remains `Open` until the user explicitly approves it.
- Preserve the current marble-based Divergence visual direction and established navigation/control arrangement shown by the supplied baseline.

## Design, implementation, and validation separation

- A design artifact is not implementation.
- Code or a commit is not proof that the mounted workflow works.
- A test plan is not an executed test.
- A self-check is not independent verification.
- User approval, implementation status, test status, evidence status, and gate status remain separate.

## Required durable records

The manifest, integrity hashes, current task, task index, continuity ledger, decision log, evidence index, handoff, and parking lot are mandatory. If they disagree, do not guess: preserve all versions, identify the conflict, and leave the affected state `Open`.

## Enforcement limitation

These files provide cross-AI procedural control and conventional automatic entrypoints. Mechanical enforcement by a repository validator or CI rule has not been implemented or tested and must not be claimed.
