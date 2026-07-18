# PIPELINE-CONTRACT.md — the five-stage handoffs (Steps 5.2/5.3/5.4/6.5)

What every pipeline stage **receives** and **returns**, including the confidence
gates, the routing coupling, and which fields are allowed to be absent. Written
so a future session can rebuild any single stage against this contract without
reading the other four.

**Authority:** the code is canonical — orchestrator: `src/services/pipeline/orchestrator.ts`;
each stage's own file is named below. If this document and the code drift, the
code wins; update this file. Product truth above both: PIPELINE.md, ROUTING.md,
CONFIDENCE_COUPLING.md, CANON.md.

**Shape of the whole flow.** `runPipeline(request, deps)` is an
`AsyncGenerator<PipelineEvent>`. Each stage's full output is yielded as a typed
event the moment it exists — the event sequence is the stage log. Stages run
strictly in order; a terminal event ends the generator early (see gates).

```
composer → [translating] translation → gate ─┬─ clarify/empty/too-large/error → END
                                             └─ proceed | moderate
        → [routing]   routing.js
        → [composing] technique selection → composition
        → [answering] execution (streamed) → done | error
```

The four bracketed names are the DISPLAY stages (`PIPELINE_STAGES`, Step 5.1);
PIPELINE.md's five build stages map onto them with technique selection and
composition sharing "composing".

---

## Stage 0 — the composer request

Producer: `src/services/composer.ts` (`buildTranslateAskRequest`, Step 5.0).
Consumer: `runPipeline` only.

```ts
interface TranslateAskRequest {
  rawInput: string;            // verbatim textarea content; may be "", may be huge — never pre-trimmed/clipped
  model: ModelSelection;       // "auto" | ModelId — the Model dropdown value
  directness: DirectnessLevel; // 1 | 2 | 3
  techniques: TechniqueId[];   // ["auto-detect"] = auto mode; anything else = the user's literal manual stack
  context: ContextItem[];      // loaded context; ALWAYS present, often [] (consumed from Step 7.x on — no stage reads it yet)
}
```

Plus injected dependencies (never global state):

```ts
interface PipelineDeps {
  client: PipelineModelClient; // { complete(req): Promise<string>; stream(req): AsyncIterable<string> }
                               // createProxyClient() (Step 1.10) satisfies it as-is — pass it RAW,
                               // do NOT pre-wrap with retry/timeout (see Resilience, below)
  plan: PlanFlag;              // accountStore.plan — "free" | "paid"
  signal?: AbortSignal;        // optional; cancels in-flight model calls on resubmit
  resilience?: ResilienceOptions; // optional (Step 5.3); omit for production defaults
  stateTechniques?: TechniqueId[]; // optional (Step 6.5) — state bus hints into Stage 3, auto-mode only
  stateTone?: string | null;       // optional (Step 6.5) — state bus hint into Stage 4's directness section
}
```

---

## Resilience — retry, timeout, and error boundaries (Step 5.3)

Code: `src/services/pipeline/resilience.ts`.

**`runPipeline` never throws.** Every stage's call is wrapped in its own
try/catch inside the generator; any exception becomes a terminal
`{ kind: "error", message }` event followed by `return`, never an exception
escaping the generator. This extends `translate()`'s Step 2.2 never-throws
guarantee to the whole pipeline, so any consumer (UI, tests, a future harness)
can iterate `runPipeline(...)` with a plain `for await` and never needs its own
try/catch to stay safe — CANON ADHD "Time": no crash, always a neutral
non-blaming message, never a blank screen.

**`deps.client` is wrapped internally** with `makeResilientClient` — callers
pass the raw client (e.g. `createProxyClient()`); resilience is applied once,
inside `runPipeline`, so every caller gets it by construction rather than
depending on each caller remembering to wrap it.

**What gets retried, and why not everything:**

| Stage | Retried? | Reasoning |
|---|---|---|
| 1 Translation (`client.complete`) | Yes | Network call — a transient blip on the same request usually succeeds a moment later. |
| 2 Routing (`routing.js`) | No — caught only | Pure, synchronous, deterministic. Retrying a function that just threw on the same input throws again; the boundary exists only to convert an unexpected bug into a neutral event instead of a crash. |
| 3+4 Techniques + Composition | No — caught only | Same reasoning as Stage 2; one shared boundary since they run in the same "composing" display stage. |
| 5 Execution (`client.stream`) | Yes, but **only before the first token arrives** | Once real output has streamed to the user, retrying would replay from the start and duplicate what they already saw — a failure after that point ends the run instead. |

**Retry policy** (`ResilienceOptions`, all overridable — production uses the
defaults; tests pass tiny values so retry/timeout paths don't take real
seconds):

```ts
interface ResilienceOptions {
  maxAttempts?: number;    // default 3 (1 try + 2 retries)
  retryDelayMs?: number;   // default 300ms, doubles each retry (exponential backoff)
  timeoutMs?: number;      // default 30_000ms per attempt — for stream(), this
                           //   guards time-to-first-token ONLY; once generation
                           //   starts, no per-token timeout is imposed
  isRetryable?: (error: unknown) => boolean; // default isTransientError
}
```

`isTransientError` (the default classifier): a `TimeoutError`, a network
`TypeError` (fetch's own failure type), HTTP 429, or any 5xx (parsed from
`proxyClient`'s `"Proxy call failed (NNN)"` message) are retried. Anything
else — a 4xx other than 429, a malformed reply, a real bug — is **not**
retried; retrying the same bad request only wastes the wait CANON's Time rule
protects. A real user cancellation (`deps.signal` aborting, e.g. a resubmit)
is **never** retried regardless of classification — it propagates immediately,
same as every other `AbortSignal`-respecting call in this app.

**Timing out is graceful, not a countdown.** CANON ADHD "Time": *"No
countdowns, no forced timeouts."* That rule governs what the user is shown —
never a ticking clock, never an abrupt cutoff with no explanation. It does not
forbid an internal safeguard against a hung request. A timed-out attempt is
retried like any other transient failure; if every attempt times out, the run
ends the same way any other failure does — a terminal `error` event, rendered
as the existing neutral copy (below). No visible countdown exists anywhere in
this app.

**"Show an indicator for any wait over 1 second"** is satisfied without new
UI: the `{ kind: "stage", stage }` event for whichever stage is running is
yielded *before* that stage's work begins, so an indicator is visible from
time zero of any wait — a strict superset of "after 1 second." Retries happen
silently behind the same, still-visible stage indicator; no separate
"retrying…" state was added (CANON "no competing visual stimuli" — a flickering
retry indicator would cost more than it explains, and the eventual outcome —
success or a neutral failure message — is all the user needs to see).

**Neutral, non-blaming copy on failure** was already built at Steps 2.3/5.1
and needed no change: `TranslationCard` (`kind: "error"`) and `StreamingAnswer`
(`kind: "error"`) both render a fixed, neutral message regardless of the
event's actual `message` field — *"Something went wrong reading that — it
wasn't you. Give it another try in a moment."* The real underlying message
(e.g. `"Timed out after 30000ms"`, `"Proxy call failed (503)"`) is kept on the
event for whatever reads it for diagnostics (Step 5.4's telemetry service),
never shown to the user verbatim.

---

## Telemetry (Step 5.4)

Code: `src/services/telemetry/` (`observePipeline`, `log.ts`, `types.ts`).

**`observePipeline(request, deps)` replaces `runPipeline(request, deps)` at
the one production call site** (CenterColumn) — same signature, same
`AsyncGenerator<PipelineEvent>` return, **identical event sequence**. It is a
transparent tee: every event `runPipeline` yields passes through unchanged,
observed (timed, read) but never edited, delayed, or withheld. Tests and any
other consumer that doesn't need telemetry may still call `runPipeline`
directly — both are exported from `services/pipeline`.

**One `TelemetryEntry` per request** (`types.ts`), finalized and recorded via
`recordTelemetryEntry` (`log.ts`) at whichever terminal event ends the run —
`done`, `error`, or a `translation` event whose `gated.kind` is
`clarify`/`empty`/`too-large`/`error` (PIPELINE-CONTRACT's gate table, above).
An entry the generator never reaches a terminal event for (the consumer stops
iterating early — a resubmit, an unmount) is finalized as `outcome:
"cancelled"` by the tee's own `finally` block, which the implicit
`generator.return()` a broken `for await` triggers always runs.

**Fields, and where each comes from:**

| Field | Source event | Absent when |
|---|---|---|
| `confidence` | `translation` (`gated.result.confidence`) — `proceed`/`moderate`/`clarify` all carry a `TranslationResult` | `empty`/`too-large`/`error` (no result exists) |
| `complexity`, `effectiveComplexity`, `domain`, `model`, `modelTier`, `downgraded`, `notes` | `route` | routing never reached (gate stopped at translation) |
| `scope`, `thinkingApplied` | `route` (`result.dimensions.scope` / `result.thinkingApplied`) — Step 8.2's Routing sub-card | routing never reached |
| `techniques` | `techniques` | Stage 3 never reached |
| `techniqueReasoning`, `techniqueMode` | `techniques` (`selection.reasoning` / `selection.mode`) — Step 8.2's Techniques sub-card | Stage 3 never reached |
| `techniqueSignalMatched` | `techniques`, derived from `selection.scores` for the selected ids — true if a real signal beat the Socratic default baseline | `techniqueMode` is `"manual"` (not applicable — an explicit pick is never a "default fallback") or Stage 3 never reached |
| `translationTokens` | `onUsage` on the Stage-1 `complete()` call | the proxy response carried no `usage` field |
| `executionTokens` | `onUsage` on the Stage-5 `stream()` call | Stage 5 never reached, or its response carried no usage events |

**Confidence breakdown (Step 8.2):** `deriveConfidenceBreakdown(entry)`
(`services/telemetry/confidence.ts`) derives the Transparency card's four
Confidence sub-card values — `translation`, `routing`, `technique`,
`overall` — from the fields above; it does not add anything to
`TelemetryEntry` itself. Routing confidence restates CONFIDENCE_COUPLING.md's
own translation-confidence bands (80+ → 95, 60–79 → 75, <60 → 50) as a
number. Technique confidence is 100 for a manual pick, 90 for auto-detect
with a matched signal, 65 for auto-detect's bare default fallback. Overall
is the minimum of whichever of the three are present (never averaged —
CONFIDENCE_COUPLING.md's cost-asymmetry stance: a shaky layer anywhere
should show, not get smoothed away).
| `stageDurationsMs[stage]` | wall-clock between consecutive `stage` events (or a stage event and the terminal event) | a stage the run never reached is simply absent from the map, not zero |
| `outcome`, `errorMessage`, `finishedAt`, `totalDurationMs` | set once, by whichever `finalize()` call ends the entry | never absent on a recorded entry |

**Token counts are captured without touching either protected seam.**
`translate.ts` (Step 2.2) and `orchestrator.ts` (Step 5.2) are both unchanged
— `observePipeline` wraps `deps.client` itself, attaching an `onUsage`
callback (`proxyClient.ts`'s Step 5.4 addition to `ProxyCompletionRequest`,
purely additive — `complete()`/`stream()`'s return shapes are unchanged) to
every `complete()`/`stream()` call before handing the wrapped client to
`runPipeline`. `runPipeline` wraps that same client again internally with
`makeResilientClient` (Resilience, above) — both wrappers compose cleanly
since each only adds behavior around the same `complete`/`stream` contract.

**The log is in-memory, bounded, local-only** (`MAX_TELEMETRY_ENTRIES = 200`,
oldest entries drop first) — no third-party analytics, nothing leaves the
browser. `getTelemetryEntries()`/`subscribeTelemetry()` are the seam a future
reader (Token Usage panel — Step 9.6; Learning Loop pattern analysis — Step
10.1; Transparency card — Step 8.2) subscribes to; none of those readers exist
yet, so nothing currently calls them outside tests.

---

## Stage 1 — Translation

Code: `src/services/translation/` (`translate` Step 2.2, `gateTranslation` Step 2.3).

**Receives:** `request.rawInput` (string, any content/length) and a
`TranslationModelClient` — a function `(req: {model, system, input, signal?}) => Promise<string>`.
The orchestrator passes `(req) => client.complete(req)`, where `client` is
`deps.client` wrapped in `makeResilientClient` (Resilience, above) — retried
on a transient failure, timed out gracefully on a hang. The model is
`TRANSLATION_MODEL` = `claude-sonnet-5` (set inside translate, not by the caller).

**Returns:** `TranslationOutcome` (never throws):

```ts
| { status: "ok"; result: TranslationResult }        // result: { translatedPrompt: string (non-empty);
                                                     //   confidence: int 0-100; detectedGaps: GapType[] (may be []);
                                                     //   reasoning: string (never blank — validator fills a fallback) }
| { status: "empty" }                                // whitespace-only input; nothing was sent to a model
| { status: "too-large"; chars; limit }              // input > 24_000 chars; nothing sent; NOT truncated
| { status: "error"; message }                       // transport failure OR unparseable/schema-failing reply
```

**Gate (the orchestrator applies `gateTranslation` immediately):**

| confidence | GatedTranslation.kind | pipeline behavior |
|---|---|---|
| 80–100 | `proceed` | continues |
| 60–79 | `moderate` (+ `note`: MODERATE_CONFIDENCE_NOTE) | continues — routing escalates (below) |
| 0–59 | `clarify` (+ `question`: wording is code-templated — guaranteed non-judgmental — around the model's quoted best-guess translation) | **generator returns. Routing is never called.** |
| — | `empty` / `too-large` / `error` | generator returns |

Every kind is yielded as `{ kind: "translation", gated }` before any return, so
the terminal outcome is always observable/logged. routing.js's own <60 floor
(effective complexity ≥ 4) is a safety net for a path this orchestrator never
takes — do not "simplify" either side away (Step 3.3 decision).

---

## Stage 2 — Routing

Code: `src/services/routing.js` via `src/services/routingService.ts` (Steps 1.10/3.1/3.2).
**Do not rebuild the scorer** (ROUTING.md).

**Receives** (`RouteInput`) — exact field mapping from Stage 1 + request + deps:

```ts
{
  prompt:     result.translatedPrompt,          // the TRANSLATED question, never rawInput
  confidence: result.confidence,                // int 0-100; routing treats absent as 100 — the orchestrator always passes it
  gaps:       result.detectedGaps,              // accepted per contract; NOT read by the current scorer body
  plan:       deps.plan,                        // "free" | "paid"
  override:   overrideFromSelection(request.model), // ModelKey ("haiku"|"sonnet"|"opus") or null ("auto"/unknown → null, never a throw)
}
```

**Returns** (`RouteResult`, all fields always present — see `routing.d.ts`):
`model` (ModelKey), `apiString`, `modelLabel`, `tier`, `complexity` (1-10),
`effectiveComplexity`, `dimensions` {domain, scope, certainty, depth,
tokenEfficiencyMatters}, `reasoning` (user-facing), `thinkingRecommended`,
`thinkingApplied`, `downgraded`, `notes: string[]` (may be []), `signals`, `rawPoints`.

**Coupling behavior (inside routing.js, verified by tests):** confidence 80+ →
no change; 60–79 → `effectiveComplexity = min(10, complexity + 1)` plus a
visible note; <60 (never sent by this orchestrator) → floor at 4 plus a note.
Escalates only, never downgrades a route, never overrides the user's override.
On the free plan a Deep-tier result is answered by Sonnet with
`downgraded: true` and an explanatory note — the honesty guarantee.

---

## Stage 3 — Technique selection

Code: `src/services/techniques/` (Step 4.2) dispatched by
`resolveTechniqueSelection` (`orchestrator.ts`).

**Receives:** `request.techniques` (the stored mode/stack),
`result.translatedPrompt` (scored text — never rawInput), and from Stage 2:
`routeResult.complexity` + `routeResult.dimensions.domain` as `TechniqueHints`
(auto mode only). Hints use base `complexity`, not `effectiveComplexity` —
confidence escalation is about model choice, not technique fit. `TechniqueHints`
also carries `deps.stateTechniques` (Step 6.5's state bus, `PipelineDeps` above)
— candidate ids the CURRENTLY-detected state points at (`deriveStateFeeds`,
`services/detection/stateBus.ts`), scored the same +1 weight as a single
domain/complexity signal (not a forced pick).

**Mode dispatch:**
- array containing `"auto-detect"` → `autoDetectTechniques(question, hints)` —
  scores all 11 composable techniques (including `stateTechniques` hints),
  greedy-stacks ≤ 4, conflict-free, dependency closures included,
  dep-before-dependent order.
- any other non-empty valid array → used **literally, in the user's order**
  (validated at selection time by Step 4.5's UI; the orchestrator defensively
  filters out non-composable/unknown ids and re-truncates to
  MAX_TECHNIQUE_STACK = 4, so the ≤4 guarantee holds even against a corrupted
  persisted array). **`stateTechniques` is ignored on this path** — a manual
  stack is the user's literal explicit choice (Step 4.2's own rule), state
  hints only ever apply in auto mode.
- empty/corrupted array → falls back to auto (defensive; store default is
  `["auto-detect"]`).

**Returns** (`TechniqueSelection`): `selected: TechniqueId[]` (1–4, never
empty), `scores` (all-technique audit in auto mode; minimal in manual),
`reasoning: string` (user-facing), `mode: "manual" | "auto-detect"` (Step
8.2 — which dispatch path produced this selection, feeds the Transparency
card's Confidence sub-card).

---

## Stage 4 — Composition

Code: `src/services/composition/compose.ts` (Step 4.3).

**Receives** (`CompositionInput`) — exact mapping:

```ts
{
  question:   result.translatedPrompt,   // Stage 1
  techniques: selection.selected,        // Stage 3 (Role-Prime, if present, is hoisted to the role section)
  directness: request.directness,        // Stage 0 (the user's dropdown; encodings live in templates.ts)
  confidence: result.confidence,         // Stage 1 — <80 injects the score + a check-the-question nudge
  stateTone:  deps.stateTone ?? undefined, // Step 6.5 — RSD's tone guidance, appended into the directness section
}
```
`role` and `outputFormat` are NOT passed — the defaults (neutral role prime,
ADHD output format) apply. They exist for later steps, not this flow.

**Returns** (`ComposedPrompt`): `prompt` (assembled string, non-empty sections
only), `sections` (always all 7, fixed order, for the transparency card),
`order` (= COMPOSITION_ORDER, immutable).

---

## Stage 5 — Execution

Code: `src/services/proxyClient.ts` (Step 1.10) + `streamAnswer`
(`src/services/answerDisplay.ts`, Step 5.1).

**Receives** — exact call (`client` = `deps.client` wrapped in
`makeResilientClient`, same as Stage 1):

```ts
client.stream({
  model: routeResult.apiString,          // the ROUTED model, e.g. "claude-sonnet-5"
  input: composed.prompt,                // the composed prompt as the single user message; NO separate system prompt
  signal: deps.signal,
  extendedThinking: routeResult.thinkingApplied || undefined,  // exactly what routing decided; absent when false
})
```

**Returns:** text deltas, folded through `streamAnswer` into
`{ kind: "streaming", text }` events (strictly growing) and finally

```ts
{ kind: "done", done: {
    text: string,                 // the full answer
    confidence: number,           // Stage 1's translation confidence, carried verbatim
    downgraded: boolean,          // Stage 2's, carried verbatim
    notes: string[],              // Stage 2's notes, carried verbatim — never filtered or dropped
} }
```

A stream failure that survives the resilient client's retries (proxy down,
network, timeout, real cancellation) becomes a terminal `{ kind: "error",
message }` (Step 5.3's execution-stage boundary). Every other stage has its
own boundary too (Resilience, above) — `runPipeline` never throws, though
routing/selection/composition are pure and synchronous and translate() itself
never throws, so those boundaries are defensive rather than routes those
stages are expected to take in practice.

---

## The event vocabulary (the stage log)

```ts
type PipelineEvent =
  | { kind: "stage"; stage: "translating" | "routing" | "composing" | "answering" }
  | { kind: "translation"; gated: GatedTranslation }
  | { kind: "route"; result: RouteResult }
  | { kind: "techniques"; selection: TechniqueSelection }
  | { kind: "composed"; composed: ComposedPrompt }
  | { kind: "streaming"; text: string }
  | { kind: "done"; done: PipelineDone }
  | { kind: "error"; message: string };
```

Full-run order: `stage(translating), translation, stage(routing), route,
stage(composing), techniques, composed, stage(answering), streaming×N, done`.
Terminal early exits: after `translation` (non-proceed/moderate) or via `error`
(execution only). `usePipelineRun` logs every event via `console.info` —
PIPELINE.md Stage 5's "log telemetry" in its current honest form.

---

## The UI/store contract (components/pipeline/, Step 5.2)

- CenterColumn calls `observePipeline` (`src/services/telemetry/`, Step 5.4),
  **not** `runPipeline` directly — a transparent tee that yields the identical
  event sequence while recording one `TelemetryEntry` per request (Telemetry,
  above). Every claim in this section holds for the events the UI sees either
  way; telemetry never edits, delays, or withholds one.
- On submit, CenterColumn appends the **raw** input as a user
  `ConversationMessage` (skipped for whitespace-only input) and starts a run;
  a resubmit aborts the previous run's in-flight call via AbortController.
- `TranslationCard` (Step 2.3) renders every `gated` kind — including the
  clarify question with `ClarifyPrompt`. **Refine** appends the user's addition
  as a new user message and re-runs the whole pipeline on
  `original + "\n\n" + addition` with settings re-read from the store.
- On `done`, the answer is appended as an assistant `ConversationMessage`
  carrying `confidence`/`downgraded`/`notes` (persisted by the Step 1.8
  autosave; rendered by MessageBubble/AnswerMeta), and the transient run UI is
  cleared. The in-flight run itself is NOT persisted — a reload mid-run keeps
  the user message but drops the partial answer.

## Fields allowed to be absent — summary

| Field | May be absent? |
|---|---|
| `TranslateAskRequest.*` | never (context may be `[]`) |
| `TranslationResult.detectedGaps` | present, may be `[]` |
| `RouteInput.gaps` / `state` | optional; `state` never sent today |
| `RouteInput.confidence` | optional per routing.js (defaults 100) — this orchestrator always sends it |
| `RouteResult.*` | all always present (`notes` may be `[]`) |
| `CompositionInput.role` / `outputFormat` | absent in this flow (defaults apply) |
| `ProxyCompletionRequest.extendedThinking` | absent unless routing applied it |
| `ConversationMessage.confidence/downgraded/notes` | assistant messages from this flow: always set; user messages: never set |
| `PipelineDeps.resilience` | optional; absent = production defaults (3 attempts, 300ms backoff, 30s per-attempt timeout) |
| `ProxyCompletionRequest.onUsage` | optional; translate.ts's narrower `ModelCompletionRequest` never sets it — only `observePipeline`'s client wrapper does |
| `TelemetryEntry.translationTokens` / `executionTokens` | null if that call never happened, or its response carried no usage field |
| `PipelineDeps.stateTechniques` / `stateTone` | optional (Step 6.5); absent = no state-bus influence on that run (e.g. first message of a session, before any state has been detected) |
