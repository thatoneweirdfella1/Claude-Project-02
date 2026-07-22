# STATE-DETECTION-SPEC.md — the State Detection Engine (Feature 5)

**Steps 6.1 (architecture/service) + 6.2 (classifier prompt + output schema).**
This is the design spec for DIVERGENCE.AI's State Detection Engine: the four
dimensions, their signals, each state's system impact, the classifier prompt,
and the output schema.

Product truth is CANON.md (Feature 5) and PIPELINE.md ("STATE DETECTION").
Where anything here disagrees with those, they win.

**Source-of-truth note:** the classifier prompt, the output schema, and the
system-impact table also live in code (`src/services/detection/prompt.ts`,
`.../schema.ts`, `.../impacts.ts`). Those code files are canonical for the
runtime; this document quotes them for humans. If the prose here and the code
ever drift, **the code wins** — update this file to match. Consistency tests
(`impacts.test.ts`) enforce that the prompt names every state the impact table
maps.

---

## How it runs (RESOLVED — overrides any older spec)

Detection runs **on demand when the user hits TRANSLATE & ASK**, alongside the
translation call, on the same input. It does **not** run live while the user
types. There is **no local heuristic tier** and **no sub-300ms detection
budget**. It is a **single on-demand classification calling claude-haiku-4-5
through the proxy** (PIPELINE.md STATE DETECTION RESOLVED note; CANON Feature 5).

The service is `detectState()` (`detect.ts`) — raw text in, a typed
`DetectionOutcome` out (`ok | empty | too-large | error`), never throwing, so a
failed or absent detection simply shows no pills and never blocks or crashes
the answer pipeline running beside it. It mirrors the Translation Engine's
service shape field-for-field because the two fire together on the same button
press (Step 6.1 decision).

---

## The four dimensions, signals, and system impact

Each dimension is classified independently to one value (or null = no signal),
with a 0-100 confidence. The **system impact** is what the app does in response
— derived deterministically from the value (`impacts.ts`), never emitted by the
model.

### Emotion (PIPELINE.md line 44)

| value | system impact | signals |
|-------|---------------|---------|
| `overwhelmed` | **directness Level 1** (extra supportive) | "too much", scattered/rambling, "I can't", all-caps venting |
| `frustrated` | **Simplify** | irritation, "ugh", sarcasm |
| `calm` | **Socratic** | measured, organized, unhurried |
| `excited` | **Detailed** | exclamation, enthusiasm |
| `anxious` | **Verify** | worry, "what if it's wrong", nervous hedging |

Emotion is the only dimension that can set a **directness level** (Overwhelmed
→ 1); the others map to techniques. This matches `directness.ts`'s
`recommendDirectnessFromEmotion` (a test asserts they agree).

### RSD Level — rejection sensitivity (PIPELINE.md line 46)

| value | system impact (tone) | signals |
|-------|----------------------|---------|
| `high` | extra warm, explicit positive framing | apologies, self-criticism, hedging, "if that's okay", parenthetical disclaimers |
| `medium` | balanced | some hedging, mostly direct |
| `low` | direct, factual | unhedged, confident |

RSD is a **tone** lever — it carries no technique.

### Interest (PIPELINE.md line 48)

| value | system impact | signals |
|-------|---------------|---------|
| `low` | **Simplify** | "have to", generic phrasing |
| `medium` | standard detail | ordinary curiosity |
| `high` | **Detailed or Comparative** | specific, passionate, deep questions |

### Cognitive Mode (PIPELINE.md line 50)

| value | system impact | signals |
|-------|---------------|---------|
| `analytical` | **Chain-of-Thought or Step-by-step** | logical, structured, "how exactly" |
| `creative` | **Metaphor or Comparative** | brainstorming, "what if", imaginative |
| `processing` | **Socratic** | working an idea out, thinking aloud |
| `racing` | **Simplify** | rapid-fire, jumping between ideas |
| `stuck` | **Examples** | "I don't get it", repetition, circling |

**"X or Y" impacts** (High interest, Analytical, Creative) are recorded in
`STATE_IMPACTS` as **both candidate techniques**. This table only records what
each state points at; **Step 6.5** (state feeds) reconciles candidates through
auto-detect's existing conflict/dependency/≤4-cap machinery — it does not
blindly stack every candidate.

---

## The classifier prompt

Canonical copy: `src/services/detection/prompt.ts` (`DETECTION_SYSTEM_PROMPT`).
Tuned for **claude-haiku-4-5**: short, one instruction per line, an explicit
output shape, no chain-of-thought ask (a fast classifier emits JSON directly).
Each state names its system impact so the model's `summary` can tell the user
what will change. Reproduced in that file; not duplicated here to avoid drift
(the file wins).

---

## The output schema

Canonical copy: `src/services/detection/schema.ts`
(`StateDetectionResult` / `parseDetectionOutput`).

```ts
interface DimensionReading<T> { value: T; confidence: number /* 0-100 */ }

interface StateDetectionResult {
  emotion:   DimensionReading<EmotionState>  | null;
  rsd:       DimensionReading<RsdLevel>      | null;
  interest:  DimensionReading<InterestLevel> | null;
  cognitive: DimensionReading<CognitiveMode> | null;
  summary:   string; // user-facing panel line, never blank
}
```

The four value unions (`EmotionState`, `RsdLevel`, `InterestLevel`,
`CognitiveMode`) live in `stores/types.ts` (Step 1.7) so the result and the
store's `StatePills` speak one vocabulary; `toStatePills()` projects a result
onto `StatePills` with no remapping.

**Validation is tolerant with no load-bearing field.** Unlike translation
(which throws when its one required `translatedPrompt` is missing),
`parseDetectionOutput` throws only on a **non-object** reply — every dimension
may independently be null. An unknown/garbage value → that dimension `null`
(pill not shown), never a fabricated neutral. A missing/garbage confidence →
`0` (unsure), never fabricated high.

---

## The pills UI (Step 6.3)

`src/components/detection/` — `StateDetectionPanel` (the whole card),
`StatePill` (one "Label: Value" badge, colored per `pillOptions.ts`'s
`PILL_CONFIGS`, purple/red/green/blue matching the screenshot), `PillCorrector`
(the "small correction control" — offers a dimension's other valid values).
Each pill is independently dismissible (×) and correctable (click); a
panel-level × hides the whole card; "Adjust" opens every visible pill's
corrector at once. Wired for real in `CenterColumn.tsx`: `detectState()` fires
alongside the pipeline on every submit/refine (parallel side effect, not a
pipeline stage), and a successful result feeds both the panel's display and
`session.statePills`.

## Correction learning (Step 6.4)

`src/services/detection/correctionLearning.ts`. Every correction (a pill
clicked, a different value picked) is recorded to
`AccountState.stateCorrections: StateCorrection[]` (`{ dimension, from, to,
timestamp }`, `accountStore.ts` — persists across browser closes, since
corrections must accumulate over many sessions to ever reach the threshold).
**Not** stored in `learnedPreferences` — see `STORE-CONTRACT.md`'s note on why
that field's ratings-driven `Record<string, unknown>` bags aren't the right
shape for this.

`CORRECTION_THRESHOLD = 15` (CANON/PIPELINE.md, verbatim). Read as **per
(dimension, corrected-to value) pair**: "this user has corrected `emotion` to
`frustrated` 15+ times" is what "detection adapts for that user" can actually
act on — a bare per-dimension count wouldn't say which value to lean toward.
`adaptedValueFor()` returns the value that's crossed threshold for a
dimension (highest count wins if more than one has, tie-broken by recency);
`buildAdaptationNote()` turns whichever dimensions have adapted into a short
addendum appended to `DETECTION_SYSTEM_PROMPT` via `detectState()`'s new
`adaptationNote` option (additive — the base prompt is never replaced). The
note is a **weighted hint the model still reasons over**, not a silent
override: a clearly different per-message signal can still win.

## What this spec does NOT cover (later steps)

- **State feeds** (applying the impacts to directness/technique/answer-tone,
  and the transparency card) — Step 6.5. `impactsFor` / `recommendedDirectness`
  / `suggestedTechniques` (`impacts.ts`) are the seam it consumes.
- **A real accuracy measurement** against a live Haiku call, and confirming
  the adaptation note actually shifts real classifications — parked on the
  Step 12.3 deploy.
