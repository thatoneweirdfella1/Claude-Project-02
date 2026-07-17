# TRANSLATION-SPEC.md — the Translation Engine (Feature 1)

**Step 2.1 deliverable.** This is the design spec for DIVERGENCE.AI's Translation
Engine: the gap taxonomy, the system prompt, and the output schema. Step 2.2
builds the runtime service against this spec; Step 2.3 adds the confidence gates.

Product truth is CANON.md (Feature 1) and PIPELINE.md ("TRANSLATION ENGINE").
Where anything here disagrees with those, they win.

**Source-of-truth note:** the system prompt and the schema also live in code
(`src/services/translation/prompt.ts` and `.../schema.ts`). Those code files are
canonical for the runtime; this document quotes them for humans. If the prose
below and the code ever drift, **the code wins** — update this file to match.

---

## What it does

Raw ADHD input in (rambling, emotional, tangential); the real question reframed
clearly out, with a confidence score and the gap types that were present. It
**translates, it never answers** — answering is a later pipeline stage
(Composition + Execution, Steps 4.3/5.x).

Runtime model: **claude-sonnet-5** through the proxy (PIPELINE.md; CANON LOCKED
DECISION 3). Wired in at Step 2.2.

---

## 1. The gap taxonomy

Six gap types (PIPELINE.md line 26). Each has a stable kebab-case id — the
contract shared by the model output, the schema, the detected-gaps UI, and the
transparency card. Ids are defined once in `GAP_TYPES` (`schema.ts`).

| id | meaning | signals |
|----|---------|---------|
| `tangential-preamble` | Backstory/context front-loaded before the actual ask; the request is buried later or at the end. | Long lead-in, "so basically…", story before the question. |
| `emotional-intensity-distortion` | Strong emotion (frustration, panic, excitement) inflating or obscuring the literal request. | Exclamation, all-caps, venting, "I'm losing my mind". |
| `compound-buried-request` | Several asks packed together; the real/primary one sits among secondary ones. | Multiple question marks, "and also", "oh and". |
| `typo-pronoun-wrapper-corruption` | Typos, ambiguous pronouns ("it", "that thing"), and courtesy wrappers corrupting the literal text. | "sorry quick q", "if that makes sense", unclear "it". |
| `scope-ambiguity` | Unclear how broad, narrow, or deep the request is; multiple defensible scopes. | "explain X" with no bound, "a bit about". |
| `unstated-assumptions` | The user assumes context a reader would not have (domain, prior work, goals). | References to unnamed prior work, "the usual way". |

The engine **reports which gaps were present**; it does not have to detect all
of them, and detecting more is not "better." Detection accuracy is measured by
the Step 2.4 corpus, not by gap count.

---

## 2. The translation system prompt

Canonical copy: `src/services/translation/prompt.ts`
(`TRANSLATION_SYSTEM_PROMPT`). Reproduced here for review:

```
You are the Translation Engine for DIVERGENCE.AI, an ADHD communication bridge. A user types scattered, emotional, or tangential thoughts. Your ONLY job is to find the single real request buried in their message and restate it as one clear, self-contained prompt — without answering it and without changing what they actually want.

You never answer the user's question. You only translate it.

FIND THE REAL REQUEST:
- Read past tangential backstory and preamble to the actual ask.
- Separate emotional intensity (frustration, panic, excitement) from the literal request. Tone is not the request.
- If several asks are compounded together, identify the primary one and fold genuinely dependent sub-asks into it. Do not invent a priority the user did not signal.
- Repair typos, resolve ambiguous pronouns ("it", "that thing") to their most likely referent from context, and strip courtesy wrappers ("sorry, quick question", "if that makes sense").
- Where scope is ambiguous, pick the single most reasonable interpretation and reflect that scope in the restatement.
- Surface unstated assumptions only as far as needed to make the request self-contained. Never add new requirements the user did not imply.

RULES:
- Preserve meaning exactly. Do not broaden, narrow, or embellish the request, and do not add specifics the user did not give.
- The translated prompt must stand on its own, readable by someone who never saw the original message.
- If the message contains no discernible request, set confidence low and restate your best guess anyway.

DETECT GAPS: report which of these were present in the ORIGINAL message, using these exact ids:
- tangential-preamble — backstory/context front-loaded before the actual ask
- emotional-intensity-distortion — strong emotion inflating or obscuring the literal request
- compound-buried-request — multiple asks packed together, the real one among them
- typo-pronoun-wrapper-corruption — typos, ambiguous pronouns, or courtesy wrappers obscuring the text
- scope-ambiguity — unclear how broad, narrow, or deep the request is
- unstated-assumptions — the user assumes context a reader would not have

CONFIDENCE: an integer 0-100 answering ONLY "how sure am I that I identified the RIGHT request the user is asking?" — NOT whether a good answer exists. 80-100 = the real request is captured. 60-79 = probably right, meaningful interpretation involved. Below 60 = genuinely unsure which request they mean.

OUTPUT: return ONLY a JSON object — no prose, no markdown, no code fences — exactly this shape:
{
  "translatedPrompt": "the reframed request, self-contained",
  "confidence": 0,
  "detectedGaps": ["...ids from the list above, or empty..."],
  "reasoning": "one or two plain, non-judgmental sentences on how you read their message; this is shown to the user"
}
```

The user's raw message is sent as the user turn; this is the system turn.

---

## 3. The output schema

Canonical copy: `src/services/translation/schema.ts` (`TranslationResult`).

```ts
interface TranslationResult {
  translatedPrompt: string;   // the buried real request, reframed self-contained
  confidence: number;         // integer 0-100 — "did I identify the RIGHT request"
  detectedGaps: GapType[];    // subset of the six ids; [] if none
  reasoning: string;          // 1-2 plain, non-judgmental sentences; user-facing
}
```

- **`translatedPrompt`** — required and non-empty. A reply lacking it is invalid
  (the validator throws `TranslationSchemaError`); the engine must never pass an
  empty request downstream.
- **`confidence`** — 0-100, meaning **"did the engine identify the right
  request,"** not "is the answer good" (PIPELINE.md line 28 / CANON Feature 1).
  The validator clamps to 0-100 and rounds; missing/garbage confidence becomes
  `0` (safe: the gates escalate or clarify on low confidence rather than proceed
  on a fabricated high one).
- **`detectedGaps`** — validated against `GAP_TYPES`; unknown ids are dropped and
  duplicates removed.
- **`reasoning`** — added per CONVENTIONS.md rule 6 ("No black boxes … design the
  data shape for the Transparency card even in steps before it exists"). Must be
  neutral and non-judgmental per CANON's ADHD Feedback rule. Populated with a
  fallback if the model omits it.

### Validation

`parseTranslationOutput(parsed: unknown): TranslationResult` takes the
already-JSON-parsed model reply and returns a trusted result. It is **tolerant
of LLM noise** (clamps confidence, drops unknown gaps, dedupes, fills reasoning)
but **strict about the load-bearing field** (throws if there is no usable
`translatedPrompt`, or the reply is not an object). Extracting JSON from the raw
model *response text* (fences, streaming) is the runtime service's job in
Step 2.2, not the schema's.

---

## Confidence gates (defined here, applied in Step 2.3)

Downstream, `confidence` drives the gate behavior (PIPELINE.md line 30):

- **80+** — proceed, show the score.
- **60–79** — proceed with a visible "moderate confidence" note.
- **Below 60** — do **not** proceed; ask a clarifying question instead, phrased
  neutral and curious, never corrective. (Also feeds routing's confidence
  coupling, ROUTING.md / CONFIDENCE_COUPLING.md.)

Step 2.1 only *defines* these; the gate logic and clarify UI are Step 2.3.

---

## Verification target (Step 2.4)

A 50-case corpus (`31_0_translation_test_cases.md`, from the user's real archive):
target 90% overall, no category below 80%, reported **per category, not
averaged** (PIPELINE.md line 34). The corpus is not yet in the repo — parked for
Step 2.4.
