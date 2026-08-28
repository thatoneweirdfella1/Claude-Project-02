# Group 5 — Authorization-Gated Proof (R30, R31)

**Branch:** `claude/remaining-first-pass-v1`
**Candidate SHA:** `60ea548111783a3219e1e857af19b0402606c707`
**Rollback target (last known-good, pre-repair-branch state):** `e1a4b0cb97572ed023c281efe909f2bd41b880ca`
(confirmed a direct ancestor of the candidate SHA — `git merge-base --is-ancestor` exit 0)

Both rows in this group are explicitly authorization-gated by the work order
("Do not promote to production" / "Do not run paid/live calls"). This
checkpoint records the exact local evidence actually gathered against the
candidate SHA above, and the exact external approval still required before
either row could move past that.

---

## R30 — Exact Preview and Production Gate

### Candidate identity
- Full SHA: `60ea548111783a3219e1e857af19b0402606c707`
- Branch: `claude/remaining-first-pass-v1`
- Clean build confirmed at this SHA: `npm run build` → `tsc -b && vite build`,
  exit 0, `dist/index.html` + `dist/assets/index-*.{js,css}` emitted, no
  TypeScript errors. (Chunk-size warning only — pre-existing, not a build
  failure; noted in every prior session's build output.)
- Unit/integration suite at this SHA: **874/874 passing**, 95 test files.

### Browser smoke matrix (evidence: `e2e/r30-smoke-matrix.spec.ts`, 10/10 passing)
Run against the real production build via `vite preview` (this project's
established e2e pattern — `npm run dev` cannot load the app at all, a
pre-existing routing.js UMD/ESM interop gap documented in
`playwright.config.ts`), with `/api/verify-access`, `/api/account`, and
`/api/provider-status` mocked (no serverless backend exists in this
sandbox — every mocked response is either a local-preparation ok or an
honest "not connected", never a fabricated "connected").

| Screen / control | Result | Notes |
|---|---|---|
| Translate (default) | PASS | No thrown console error |
| Sessions | PASS | No thrown console error |
| Projects | PASS | No thrown console error |
| Saved Tools | PASS | No thrown console error |
| Settings | PASS | No thrown console error |
| Techniques (via All Tools) | PASS | No thrown console error |
| Settings → AI Connections (R26 panel) | PASS | All 5 providers correctly show "Not connected" against the mocked all-unavailable status — fail-closed confirmed live, not just in unit tests |

### Overlay-preservation check
| Overlay | Result | Notes |
|---|---|---|
| "Add Context" popover (composer) | PASS | Opens, closes on repeat click |
| "Add Context" popover — Escape dismiss | PASS | `keyboard/dismissLayers.ts` stack still closes the topmost layer; trigger remains usable afterward |
| Right-rail visibility gear popover | PASS | `aria-expanded` toggles correctly open/close |

One pre-existing, already-documented sandbox quirk was hit and worked
around, not newly introduced: a pointer-event interception by this app's
frozen-canvas scaled layout on two of the "All Tools" popover's rows,
first noted in `docs/checkpoints/CLAUDE-REPAIR-PROGRESS.md` Session 8
(AttachContextControls' own popover) and worked around there the same way
— `.evaluate(el => el.click())` instead of a coordinate-based click.

### Accessible preview
**BLOCKED — exact external requirement:** no deployment credentials,
preview-hosting authentication, or CI/CD pipeline access exists in this
sandbox session. `npm run build` output (`dist/`) is available locally but
was not, and cannot safely be, published anywhere from here — doing so
would need explicit new user authorization naming the target host, per
CLAUDE.md's Safety section ("deploy" is listed as forbidden without new
explicit authorization) and the work order's own rule 13 ("Preview
deployment is allowed only if already authenticated").

**Exact approval still needed:** the user (or an operator with deploy
access) must either (a) run `npm run build` from this exact candidate SHA
and publish `dist/` to their own already-authenticated preview host, or (b)
grant this session explicit, named deploy-target credentials for one
preview action. No further work on this sub-row is possible without one of
those two.

### Rollback target
`e1a4b0cb97572ed023c281efe909f2bd41b880ca` — the CLAUDE.md-designated clean
starting commit, confirmed a direct ancestor of the candidate SHA. Rolling
back to it discards every R07–R31 change on this branch cleanly (no other
branch or production state is touched by that rollback, since nothing on
this branch has been merged or deployed).

**R30 STATUS:** local rows (candidate SHA, clean build, browser smoke
matrix, overlay-preservation, rollback target) — **PASSED — EVIDENCE
RECORDED**. Accessible-preview sub-row — **BLOCKED — EXACT EXTERNAL
REQUIREMENT RECORDED** (above). No promotion to production occurred or was
attempted.

---

## R31 — Live Provider Proof Gate

### Deterministic simulations — complete
Every paid-route code path exercised in this repair pass (Debate,
Consensus, Synthesis, retry-one-participant, cancellation, provider
readiness/connection lifecycle, cost estimation) is covered by the 874
passing vitest tests, all of which use fully deterministic, offline stub
clients — no network call reaches a real provider anywhere in the suite.
Specifically for R31's five providers:

- `src/services/debate/runDebate.test.ts` — Claude + up to 3 partners,
  parallel success/failure/timeout paths, `retryDebateSide` single-call
  guarantee (R22).
- `src/services/multiAi/{consensus,synthesis}.test.ts` — 2/3/4-participant
  transcripts (R23), transport failure, malformed-JSON failure.
- `src/services/routeReadiness.test.ts`,
  `src/stores/providerConnectionLifecycle.test.ts` — fail-closed readiness
  and disconnect/reconnect lifecycle (R25/R26) for all 5 providers.
- `src/services/costTracking.test.ts` — explicit per-provider pricing,
  never borrowed (R14/R27).

### Route-by-route live-test matrix
None of the below have been run. Each row names exactly what a live test
would need, so a future authorized session can execute it without
re-deriving this analysis.

| Route | Credential required (server env var) | Client entry point | Maximum expected charge (single call, this session's own estimate math) | Expected evidence | Failure handling already built | Exact approval required to run live |
|---|---|---|---|---|---|---|
| Anthropic (Claude, translate/debate/consensus/synthesis) | `ANTHROPIC_API_KEY` | `api/proxy.ts` → `handleProxyRequest` | `claude-opus-4-8`: $30/1M-in + $25/1M-out combined ceiling per `MODEL_PRICES`; a single debate/consensus/synthesis call is bounded by `getEstimatedCostForCall`'s pre-authorization estimate, typically < $0.05 | HTTP 200, non-empty `text`, `usage.inputTokens`/`outputTokens` populated, `onUsage` fires and `addTokenUsage` reflects it in Usage & Cost | `services/pipeline/resilience.ts` retry/backoff; `runDebate`'s per-side try/catch (ROUTING.md: one dead provider fails only its own column) | User must set `ANTHROPIC_API_KEY` in the deploy target's environment and explicitly authorize spending real credits on this exact candidate SHA |
| OpenAI (GPT-5.5, debate partner) | `OPENAI_API_KEY` | `api/proxy-openai.ts` → `handleOpenAiRequest` | `gpt-5.5`: $3/1M-in + $12/1M-out (this session's R27 entry); single-debate-side estimate typically < $0.02 | HTTP 200, `payload.text` non-empty, `usage.inputTokens`/`outputTokens` present in the proxy reply | `createPartnerClient` throws on non-ok/empty text; `runDebate` catches per-side, never crashes the whole turn | Same as above, plus `OPENAI_API_KEY` set |
| Google (Gemini 3.1 Pro, debate partner) | `GOOGLE_API_KEY` | `api/proxy-google.ts` → `handleGoogleRequest` | `gemini-3.1-pro`: $2.50/1M-in + $10/1M-out; single-side estimate typically < $0.02 | Same shape as OpenAI row | Same as OpenAI row | Same pattern, `GOOGLE_API_KEY` set |
| xAI (Grok 4.3, debate partner) | `XAI_API_KEY` | `api/proxy-xai.ts` → `handleXaiRequest` | `grok-4.3`: $3/1M-in + $15/1M-out; single-side estimate typically < $0.02 | Same shape as OpenAI row | Same as OpenAI row | Same pattern, `XAI_API_KEY` set |
| DeepSeek (V4 Pro, debate partner) | `DEEPSEEK_API_KEY` | `api/proxy-deepseek.ts` → `handleDeepseekRequest` | `deepseek-v4-pro`: $0.60/1M-in + $2.20/1M-out; single-side estimate typically < $0.01 | Same shape as OpenAI row | Same as OpenAI row | Same pattern, `DEEPSEEK_API_KEY` set |
| Provider-status health check (all 5, R11/R25/R26's `getProviderStatus`) | Same 5 env vars, whichever are set | `api/provider-status.ts` | $0 — a configuration check, not a model call | HTTP 200 JSON body with `{anthropic, openai, google, xai, deepseek}` booleans matching which env vars are actually set server-side | `getProviderAvailability` catches network failure and returns all-`false` (fail closed), never throws | None beyond normal deploy access — this route spends nothing, but was never run live in this sandbox either (no serverless backend present here) |

### What is explicitly NOT done here, per the safety rules
- No `ANTHROPIC_API_KEY`/`OPENAI_API_KEY`/`GOOGLE_API_KEY`/`XAI_API_KEY`/
  `DEEPSEEK_API_KEY` was set, read, or requested in this session.
- No request was sent to `api.anthropic.com`, `api.openai.com`, Google's or
  xAI's or DeepSeek's real endpoints, or to any deployed instance of this
  app's own `/api/proxy*` routes.
- No credits were spent, real or simulated-as-real.

**R31 STATUS:** deterministic-simulation coverage — **PASSED — EVIDENCE
RECORDED** (874/874 tests, listed above). Live-provider rows — **BLOCKED —
EXACT EXTERNAL REQUIREMENT RECORDED** (the five credential/authorization
cells in the matrix above). No paid or live call was made.

---

## Completion-gate cross-check (work order §"Completion gate")

- Every R07–R31 row has now received an actual implementation attempt this
  session (R20–R31) on top of the prior sessions' R07–R19: PASSED, or
  BLOCKED with the exact missing external authority recorded above. None
  were skipped or left at "plan only."
- Every change is committed only to `claude/remaining-first-pass-v1`.
- No merge, no production action, no live-provider call occurred.
- Final `npm run build`: SUCCESS. Final `npm test`: 874/874 passing.
