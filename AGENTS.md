# Universal Governance for Codex

These instructions are binding for every task in this repository. The system is
development governance only; never expose it in the website or production bundle.

## Always read first

1. Read `DECISION_LOG.txt` completely.
2. Read `CURRENT_STATE.txt` completely.
3. Treat those as the only operative governance documents. Files under `.claude`
   and `.codex` are enforcement infrastructure.
4. Re-check the user's active thread before acting.

## Ordinary no-change questions

Answer read-only questions normally. Verify factual claims before stating them.
Do not create management work when no project change is requested.

## Consequential or file-changing work

Before any edit or mutating command:

1. Create exactly one stable task ID, such as `task-fix-layout`.
2. Freeze one task contract by running:

   `node .codex/hooks/universal-governance-codex.cjs contract-check --task-id TASK_ID --subject "SHORT SUBJECT" --outcome "REQUESTED RESULT" --scope "ALLOWED FILES OR SYSTEM AREA" --preserve "WHAT MUST NOT CHANGE" --proof "HOW COMPLETION WILL BE VERIFIED"`

3. Spawn one fresh read-only subagent. Tell it to read
   `.codex/universal-gate-verifier.md`, perform **Contract review**, and return only
   the required `UNIVERSAL_GATE_VERDICT` line. Do not edit before its pass receipt.
4. If the contract is rejected, correct the existing contract or ask the user one
   focused question only when a material decision is genuinely missing.
5. Work only inside the accepted scope. Necessary implementation detail is allowed
   only when it preserves the objective, prior decisions, and success condition.
6. Keep user-facing updates short and decision-focused. Never make the user audit
   intermediate work or relay verifier findings.

## Completion

Before telling the user work is complete:

1. Update `CURRENT_STATE.txt` accurately. Append a DL1-DL4 entry to
   `DECISION_LOG.txt` only for a material architecture, scope, dependency, or
   stop/continue decision. Never edit existing decision history.
2. Run `node .codex/hooks/universal-governance-codex.cjs verify TASK_ID`.
3. Spawn one fresh read-only subagent. Tell it to read
   `.codex/universal-gate-verifier.md`, perform **Completion review** for the exact
   task ID, inspect the real changed files and evidence, and return only the
   required verdict line.
4. Repair failures yourself and repeat verification. Do not release a claimed
   success until the mechanical and independent semantic receipts both exist.
5. If a material user choice blocks completion, run
   `node .codex/hooks/universal-governance-codex.cjs pause-for-user "ONE QUESTION?"`
   and ask exactly that question.

## Gate protection

Do not alter or bypass `AGENTS.md`, `DECISION_LOG.txt`, `CURRENT_STATE.txt`,
`.claude/`, or `.codex/` unless the user's exact request explicitly authorizes a
governance change. Never self-issue a contract or completion pass.
