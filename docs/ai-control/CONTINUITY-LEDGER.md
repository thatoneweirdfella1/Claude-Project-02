# Continuity Ledger — Append Only

## Record rule

Never delete, reorder, or silently rewrite an entry. Correct an error with a new entry that cites the earlier entry. Record meaningful actions and reasoning, not hidden chain-of-thought. The required rationale is the decision basis another worker needs to reproduce or challenge the action.

Each new entry must contain:

- entry ID and UTC timestamp;
- AI/service/account or human actor if known;
- task ID, phase, repository, branch, and starting commit;
- authority/source relied upon;
- action performed and affected files;
- concise reason and alternatives rejected;
- command/test/check and actual result, when applicable;
- evidence or artifact location and hash/version;
- failure, correction, uncertainty, or limitation;
- resulting gate/status change; and
- one exact next action.

## Entries

### CL-0001 — 2026-09-06 UTC — Reliability planning artifact finalized

- **Actor:** GPT/Codex session
- **Task/phase:** Reliability meta-blueprint finalization / design planning
- **Repository/branch/commit:** No repository accessed; not applicable
- **Authority:** User's surgical finalization instructions
- **Action:** Produced the corrected 176-page `DIVERGENCE-Reliability-Meta-Blueprint.docx` and the standalone F0 handoff.
- **Reason:** Preserve the corrected architecture while making the exact next task independently usable.
- **Evidence:** Artifact-level structural and rendered-document checks were recorded with the deliverables. The artifact was not independently verified or user-approved.
- **Limitation:** F0 itself was not executed. No implementation, product test, GitHub change, or independent audit occurred.
- **Status:** F0 remained Open.
- **Next:** Determine the exact bounded task after explaining the difference between the blueprint and F0 handoff.

### CL-0002 — 2026-09-06 UTC — Exact next task fixed as F0

- **Actor:** User and GPT/Codex session
- **Task/phase:** Execution sequencing / design
- **Repository/branch/commit:** No repository accessed; not applicable
- **Authority:** User question and accepted sequence from the finalized handoff
- **Action:** Fixed the next task as execution of F0 only, followed by a separate independent audit before any S02/S03/S18/S20 work.
- **Reason:** Prevent the 176-page plan from becoming one unbounded assignment and preserve the prerequisite sequence.
- **Limitation:** Gates remained procedural; no automatic controller had been implemented.
- **Status:** F0 Open; all follow-on work Blocked.
- **Next:** Add durable cross-AI continuity and scope controls before executing F0.

### CL-0003 — 2026-09-06 UTC — Cross-AI continuity requirement added

- **Actor:** User and GPT/Codex session
- **Task/phase:** Execution governance / pre-F0 preparation
- **Repository/branch/commit:** No repository accessed; approved branch intentionally unset
- **Authority:** User explicitly required complete continuity, existing Divergence layout, scope-drift prevention, and no AI-created branches without exact permission.
- **Action:** Surgically amended the F0 standalone handoff and created this repository-ready control packet with standard Claude/Codex/GitHub entrypoints, one active-task file, append-only continuity and decision records, evidence index, parking lot, handoff, machine-readable manifest, and visual-baseline references.
- **Reason:** Let a future AI know what occurred and why while preventing it from inventing a different task, layout, architecture, repository, or branch.
- **Alternatives rejected:** A separate repository would split product authority and layout; a new branch would add to existing branch sprawl without user authorization; one giant log would make active scope and decisions harder to find.
- **Checks:** Content and cross-reference validation pending at the time of this entry.
- **Limitation:** This is procedural control. No GitHub installation, branch authorization, CI enforcement, F0 execution, implementation, or independent verification occurred.
- **Status:** RCG-01–RCG-04 Open; F0 Open.
- **Next:** Validate the packet, record final hashes, and hand it off without touching GitHub.

### CL-0004 — 2026-09-06 UTC — Continuity packet structurally validated

- **Actor:** GPT/Codex session
- **Task/phase:** Execution governance / pre-F0 preparation
- **Repository/branch/commit:** No repository accessed; approved branch remains unset
- **Authority/source:** CURRENT-TASK, PROJECT-AUTHORITY, and the user's continuity/branch/layout instructions
- **Action and affected files:** Checked the complete control-file set, valid JSON manifest, required F0 definitions and identifiers, F0 source/copy equality, cross-file scope rules, and all three visual-baseline hashes.
- **Reason and rejected alternatives:** Validate the packet without pretending it was installed, obeyed, independently audited, or mechanically enforced.
- **Command/test/check and actual result:** Required-file checks passed; JSON policy assertions passed; I01–I20, Q-U01/Q-U02/Q-U06, FCIS-G01–G06, RCG-01–RCG-04, all four dependency types, and all four gate statuses were present; F0 copies matched; three image hashes matched.
- **Evidence/artifact/hash:** The F0 hash recorded at that checkpoint was `edc7d4c775ab3c1f08bf14cd43d256d2520848b6957673a57b989d037201d264`; it was later superseded after adding the verified branch baseline. Current hashes are in `EVIDENCE-INDEX.md` and `SHA256SUMS`.
- **Failure/correction/uncertainty:** No structural defect remained in the checked items. Cross-AI resumption and repository enforcement have not been independently exercised.
- **Resulting status/gate change:** Packet structural self-check passed. RCG-01–RCG-04 remain Open because installation, authorized branch state, live adherence, and independent continuity testing have not occurred.
- **Exact next action:** Execute F0 outside GitHub from the standalone handoff while maintaining these records, then stop for independent audit.

### CL-0005 — 2026-09-06 UTC — Preferred branch and exact deployment commit verified

- **Actor:** GPT/Codex session
- **Task/phase:** Baseline identification / read-only external inspection
- **Repository/branch/commit:** No repository checkout; verified branch `claude/remaining-second-pass-v1`; deployed commit `10894f704a39b6c56a7fadfafb54275b82526c33`
- **Authority/source:** User identified the Vercel site they use and instructed the AI to trace it; authenticated Vercel deployment metadata supplied the exact mapping.
- **Action and affected files:** Read deployment `dpl_D1ngxz1mmJrfSB7LHsEnHfbuA5ej`; recorded repository, full branch, exact commit, deployment state/date, and alias in the manifest, authority, evidence, handoff, and baseline record.
- **Reason and rejected alternatives:** Use the actual deployment metadata instead of guessing from Vercel's shortened `claud-f1d4e8` alias. No new branch or repository was needed.
- **Command/test/check and actual result:** Vercel returned deployment state `READY`, source `git`, repository `thatoneweirdfella1/Claude-Project-02`, full ref `claude/remaining-second-pass-v1`, and commit `10894f704a39b6c56a7fadfafb54275b82526c33`.
- **Evidence/artifact/hash:** `VERCEL-BASELINE.md`; updated hashes to be recorded in `SHA256SUMS` after packet validation.
- **Failure/correction/uncertainty:** No repository checkout or rendered workflow test occurred. The branch alias may later advance; the recorded commit pins the verified snapshot.
- **Resulting status/gate change:** Preferred branch is identified. RCG-02 remains Open because no checked-out-state comparison or authorized repository mutation occurred.
- **Exact next action:** Revalidate and resave the continuity packet, then execute F0 outside GitHub.

### CL-0006 — 2026-09-06 UTC — Isolated reliability working branch created

- **Actor:** User and GPT/Codex session
- **Task/phase:** Repository isolation / pre-F0 preparation
- **Repository/branch/starting commit:** `thatoneweirdfella1/Claude-Project-02`; new branch `divergence/reliability-v1`; commit `10894f704a39b6c56a7fadfafb54275b82526c33`
- **Authority/source:** User explicitly required the site-backed branch to remain untouched and authorized one new branch copied from it.
- **Action and affected files:** Confirmed the requested working-branch name did not already exist; verified the source commit in GitHub; created `divergence/reliability-v1` at the exact commit; compared it with both the commit and `claude/remaining-second-pass-v1`.
- **Reason and rejected alternatives:** Preserve the known-good layout branch as recovery while giving all new reliability work one provider-neutral branch. Rejected a new repository and additional per-task branches.
- **Command/test/check and actual result:** GitHub created the branch. Both comparisons returned `identical`, ahead 0, behind 0, at `10894f704a39b6c56a7fadfafb54275b82526c33`.
- **Evidence/artifact/hash:** GitHub branch `divergence/reliability-v1`; baseline commit and E-008.
- **Failure/correction/uncertainty:** No application changes were made. GitHub branch protection was not configured and must not be claimed.
- **Resulting status/gate change:** RCG-02 Self-check passed for branch initialization. Independent verification remains Open.
- **Exact next action:** Install the continuity packet on the working branch only, verify the resulting commit, and leave the safety branch unchanged.

### CL-0007 — 2026-09-06 21:24:58 UTC — Continuity controls installed and verified

- **Actor:** GPT/Codex session
- **Task/phase:** Repository continuity controls / pre-F0 preparation
- **Repository/branch/starting commit:** `thatoneweirdfella1/Claude-Project-02`; `divergence/reliability-v1`; `10894f704a39b6c56a7fadfafb54275b82526c33`
- **Authority/source:** User authorized one working branch copied from the site-backed layout branch, required the source to remain untouched, and instructed completion of the in-progress setup before branch cleanup.
- **Action and affected files:** Installed the 19-file continuity packet in commit `58c89578c825a2c445df7408db059d7fb3f1586f`. Replaced the branch-specific root `AGENTS.md` and `CLAUDE.md`, added the GitHub entrypoint, standalone F0 assignment, canonical control records, integrity manifest, and three visual baselines. No application file was changed.
- **Reason and rejected alternatives:** Make any later Claude, GPT, Codex, or GitHub worker enter through the same task/scope/branch controls. Rejected touching the safety branch, creating another branch or repository, and mixing reliability implementation into this control-only commit.
- **Command/test/check and actual result:** Before the write, GitHub comparison reported the working branch identical to the baseline. Local `sha256sum -c` passed for every listed packet file; the JSON policy assertions passed; both F0 copies matched. After the write, GitHub reported the working branch ahead by one commit with exactly the 19 expected control/handoff files and no application-code path; the safety branch remained identical to the baseline. `AGENTS.md`, `CONTROL-MANIFEST.json`, and `HANDOFF.md` were read back from the working branch. This entry is the complete installer read receipt for all mandatory control files listed in `00-READ-FIRST.md`, with their hashes in `SHA256SUMS`.
- **Evidence/artifact/hash:** Install commit `58c89578c825a2c445df7408db059d7fb3f1586f`; E-009; final packet hashes in `SHA256SUMS`.
- **Failure/correction/uncertainty:** No application, browser, deployment, mechanical-enforcement, or independent continuity test occurred. GitHub branch protection is not claimed. RCG-03 and RCG-04 remain Open until the bounded F0 work and an actual cross-AI resumption check supply their evidence.
- **Resulting status/gate change:** RCG-01 Self-check passed; RCG-02 remains Self-check passed; RCG-03 and RCG-04 remain Open; F0 remains Open and unexecuted.
- **Exact next action:** Execute only `DIVERGENCE-F0-STANDALONE-HANDOFF.md` on `divergence/reliability-v1`, maintain these records, and stop for independent audit before any S02/S03/S18/S20 or F1 work.

## New-entry template

### CL-XXXX — YYYY-MM-DD HH:MM UTC — Short event title

- **Actor:**
- **Task/phase:**
- **Repository/branch/starting commit:**
- **Authority/source:**
- **Action and affected files:**
- **Reason and rejected alternatives:**
- **Command/test/check and actual result:**
- **Evidence/artifact/hash:**
- **Failure/correction/uncertainty:**
- **Resulting status/gate change:**
- **Exact next action:**


### CL-0008 — 2026-09-06 23:10:25 UTC — G0 course controller built and adversarially tested

- **Actor:** User and GPT/Codex session
- **Task/phase:** G0 AI Course-Control Gate / execution control
- **Repository/branch/starting commit:** `thatoneweirdfella1/Claude-Project-02`; `divergence/reliability-v1`; `5e0a3c9c7892334cf5b74629e4b953d638de474f`
- **Authority/source:** The user explicitly ordered the course-control system built on the already-created new branch and directed that F0 not begin first.
- **Action and affected files:** Promoted G0 as the only active task; added a fail-closed machine policy, Node validator, adversarial tests, GitHub workflow, CODEOWNERS, exact ruleset requirements, and plain-language gate status; updated entry, task, decision, evidence, parking, integrity, and handoff controls. No application or visual-baseline file was changed.
- **Reason and rejected alternatives:** Enforce one task, one branch, explicit allowed files, required evidence/history, and honest statuses without requiring the user to micromanage AI drift. Rejected executing F0, relying only on prose, creating another branch, and claiming GitHub administration controls that the connected tool cannot set.
- **Command/test/check and actual result:** Validator/test syntax passed; policy JSON assertions passed; workflow YAML parsed. The first adversarial run passed 16/17 tests and exposed a test-fixture defect: checksum generation attempted to read an intentionally deleted file before the validator could reject it. The harness was corrected without weakening the validator. The second run passed all 17/17 tests, including one accepted checkpoint and every required rejection class.
- **Evidence/artifact/hash:** E-010; exact final hashes will be recorded in `SHA256SUMS` before the repository checkpoint.
- **Failure/correction/uncertainty:** The committed GitHub workflow has not run yet. GitHub rulesets require repository-owner administration and remain Open. A separate cold-start AI trial has not occurred. These limitations keep F0 blocked.
- **Resulting status/gate change:** G0 validator self-check passed locally. GitHub workflow, non-bypass ruleset, cold-start trial, and user transition approval remain unresolved.
- **Exact next action:** Finalize hashes, commit only G0/control files to `divergence/reliability-v1`, inspect the workflow result and exact diff, confirm the safety branch remains unchanged, and stop without executing F0.

### CL-0009 — 2026-09-06 23:45:12 UTC — G0 installed; repository workflow passed

- **Actor:** GPT/Codex session
- **Task/phase:** G0 AI Course-Control Gate / execution control
- **Repository/branch/starting commit:** `thatoneweirdfella1/Claude-Project-02`; `divergence/reliability-v1`; `5e0a3c9c7892334cf5b74629e4b953d638de474f`
- **Authority/source:** G0 current task and the user's instruction to begin on the new branch.
- **Action and affected files:** Installed the 20-file G0 checkpoint in commit `d417f10cd3ee543fb0facde7bd620b0a029ebd72`; inspected the exact diff, branch head, workflow, policy readback, safety branch, and existing repository rulesets.
- **Reason and rejected alternatives:** Verify the controller in the real repository before treating the local tests as sufficient. No application file, visual baseline, new branch, merge, rebase, deployment, or safety-branch ref was changed.
- **Command/test/check and actual result:** GitHub Actions run `34066339481` completed successfully. Its checkout, context selection, gate tests, and active-task enforcement steps all passed. GitHub reported exactly the 20 expected G0/control paths. The working branch head equaled the G0 commit; the safety branch remained identical to `10894f704a39b6c56a7fadfafb54275b82526c33`. Ruleset inspection found only active ruleset `20917696`, targeting `refs/heads/build`.
- **Evidence/artifact/hash:** E-010 and E-011; GitHub workflow `https://github.com/thatoneweirdfella1/Claude-Project-02/actions/runs/34066339481`.
- **Failure/correction/uncertainty:** The connected GitHub tool lacks administrative ruleset writes. A secure browser sign-in attempt was stopped after GitHub stated that this account does not support password sign-in. No GitHub setting was changed. A separate AI cold-start trial is also still unperformed.
- **Resulting status/gate change:** Validator implementation and workflow execution are Self-check passed. Non-bypass GitHub enforcement, cold-start continuity, independent verification, and user transition approval remain Open. F0 remains locked.
- **Exact next action:** The repository owner enables the rulesets specified in `GITHUB-RULESET-REQUIRED.md`; then a separate AI performs the repository-only cold-start trial. Do not execute F0.

### CL-0010 — 2026-09-07 UTC — One reusable staging branch authorized and created

- **Actor:** User and GPT/Codex session
- **Task/phase:** G0 AI Course-Control Gate / enforceable branch flow
- **Repository/branch/starting commit:** `thatoneweirdfella1/Claude-Project-02`; integration `divergence/reliability-v1`; `7681344918a912f0ac35a2fb15c2b41b85638a3f`
- **Authority/source:** The user explicitly said “do it” after being shown the proposal for exactly one permanent reusable staging branch, while repeatedly forbidding uncontrolled branch creation and requiring the known-good layout source to remain untouched.
- **Action and affected files:** Created only `divergence/reliability-staging` at the exact integration head. Revised the controller and continuity records so task commits use staging, accepted work merges into integration, the safety/layout branch remains immutable, and no additional branch may be created.
- **Reason and rejected alternatives:** GitHub must evaluate a candidate commit before admitting it to protected integration. Reusing one staging branch provides that path without creating per-task branches. Rejected another repository, per-task branches, direct task writes to integration, and any change to the safety/layout branch.
- **Command/test/check and actual result:** GitHub created the staging ref at `7681344918a912f0ac35a2fb15c2b41b85638a3f`. Final controller tests and repository workflow verification are recorded separately after completion.
- **Evidence/artifact/hash:** D-011; E-012; `COURSE-CONTROL.json`; `GITHUB-RULESET-REQUIRED.md`.
- **Failure/correction/uncertainty:** Repository rulesets are not yet enabled. Staging existence alone does not make the flow non-bypassable.
- **Resulting status/gate change:** Reusable staging topology is Self-check passed. GitHub non-bypass enforcement remains Open.
- **Exact next action:** Commit the staging-flow controller revision, fast-forward the reusable staging ref to it, verify both workflow runs and the unchanged safety branch, then enable the four rulesets. Do not execute F0.

### CL-0011 — 2026-09-07 UTC — Live gate found and retained a scope-allowlist defect

- **Actor:** GPT/Codex session
- **Task/phase:** G0 AI Course-Control Gate / staging-flow verification
- **Repository/branch/starting commit:** Integration and staging at `2180cd3c9dea0581c1dc8990390a2da6af1523a1`
- **Authority/source:** G0 requires failure evidence to remain visible and permits correction only within its bounded control files.
- **Action and affected files:** Inspected failed GitHub Actions run `34070172845`; added `DIVERGENCE-F0-STANDALONE-HANDOFF.md` to G0's allowed paths; updated evidence, handoff, ledger, and hashes.
- **Reason and rejected alternatives:** The branch-flow correction necessarily updates the F0 handoff's repository instructions, but G0's allowlist had omitted that file. Rejected removing the handoff correction, bypassing the gate, or concealing the failure.
- **Command/test/check and actual result:** The first integration run passed gate self-tests but failed active-task enforcement. The local corrected suite passes 18/18; follow-up GitHub evidence is pending.
- **Evidence/artifact/hash:** E-013; run `34070172845`.
- **Failure/correction/uncertainty:** A passing local test is not a substitute for the pending GitHub run.
- **Resulting status/gate change:** The failed checkpoint remains recorded. Staging-flow verification remains Open until the corrected run passes.
- **Exact next action:** Commit the narrow correction, fast-forward both existing refs, inspect both course-control runs, and confirm the safety branch remains unchanged. Do not execute F0.

### CL-0012 — 2026-09-07 UTC — Reusable staging flow passed on both refs

- **Actor:** GPT/Codex session
- **Task/phase:** G0 AI Course-Control Gate / staging-flow verification
- **Repository/branch/starting commit:** Integration and staging at `c807a100f70381f7c86ca1790ee6edd325640e1b`
- **Authority/source:** G0 verification requirements and the user's authorization of exactly one reusable staging branch.
- **Action and affected files:** Verified exact ref equality, inspected the corrected course-control runs on staging and integration, retained the earlier failure, and confirmed the safety/layout baseline through its unchanged merge-base commit.
- **Reason and rejected alternatives:** Both sides of the reusable flow must accept the same fail-closed policy before GitHub rules make it mandatory. Rejected treating the earlier failed run or local-only tests as sufficient.
- **Command/test/check and actual result:** Local adversarial suite passed 18/18. Integration run `34070234656` completed `success`; staging run `34070235162` completed `success`. Both refs resolved to `c807a100f70381f7c86ca1790ee6edd325640e1b`. Comparison retained safety/layout commit `10894f704a39b6c56a7fadfafb54275b82526c33` as the merge base and showed only the previously recorded control/handoff additions above it.
- **Evidence/artifact/hash:** E-010; E-012; the two GitHub Actions run IDs above.
- **Failure/correction/uncertainty:** GitHub rulesets remain unconfigured, so direct bypass is still possible. Cold-start independent verification remains unperformed.
- **Resulting status/gate change:** Controller and reusable branch flow are Self-check passed. Non-bypass enforcement remains Open.
- **Exact next action:** Enable the four exact GitHub rulesets in `GITHUB-RULESET-REQUIRED.md`, then perform the independent cold-start continuity trial. Do not execute F0.

### CL-0013 — 2026-09-07 UTC — Rulesets verified, live rejection retained, first cold-start defects corrected

- **Actor:** GPT/Codex finalizer and separate cold-start AI reviewer
- **Task/phase:** G0 AI Course-Control Gate / finalization
- **Repository/branch/starting commit:** `thatoneweirdfella1/Claude-Project-02`; `divergence/reliability-staging`; `0c6444945cd814bb67ee5f437785d106458383c1`
- **Authority/source:** User instructed completion of G0 only; no F0, new branch, application, layout, merge, or deployment work.
- **Action and affected files:** Verified all four rulesets through exact API readback. Created deliberately invalid checkpoint `4d6755ac14753d8dfa0bd0174b4f162f13c1d2cc`; course-control run `34143620380` rejected it for four missing required record updates and the invalid GATE-STATUS checksum. Ran a separate cold-start trial and corrected only its three continuity defects.
- **Reason and rejected alternatives:** Required real enforcement and repository-only continuity evidence. Rejected screenshot-only proof, concealing failures, broad redesign, and starting F0.
- **Evidence/artifact/hash:** E-014 and E-015.
- **Failure/correction/uncertainty:** Cold-start attempt 1 failed; a fresh trial remains required.
- **Resulting status/gate change:** GitHub non-bypass enforcement is Independently verified; cold-start continuity remains Open.
- **Exact next action:** Run a fresh separate repository-only cold-start trial, record it, and stop before F0.
