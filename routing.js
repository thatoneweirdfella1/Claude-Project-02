/* DIVERGENCE.AI Routing Engine (Fable Run 2)
 *
 * Contract in : { prompt, confidence (0-100), gaps (array), state (optional),
 *                 plan ("free"|"paid"), override (model id or null) }
 * Contract out: { model, apiString, complexity, dimensions, reasoning (user facing),
 *                 thinkingRecommended, thinkingApplied, downgraded, notes, signals }
 *
 * COMPLEXITY, defined explicitly:
 *   Complexity is the estimated reasoning load of the question: how many
 *   dependent inference steps a competent answerer must chain, under how many
 *   simultaneous constraints, before an answer exists. Pure retrieval is 1.
 *   It is NOT length. A long simple question stays low. A short hard one goes high.
 *
 * Deterministic on purpose: same input, same route, every run. The audit
 * trail (signals) shows every point of the score.
 */
export default (function () {
  "use strict";

  var MODELS = {
    haiku:  { tier: "Fast",     label: "Haiku 4.5", api: "claude-haiku-4-5" },
    sonnet: { tier: "Balanced", label: "Sonnet 5", api: "claude-sonnet-5" },
    // Balanced tier updated to claude-sonnet-5 per ROUTING.md "THE ONE CHANGE"
    // and CANON LOCKED DECISION 3 (Step 1.10). Sonnet 5 exists; the earlier
    // FINDINGS.md note that it did not is superseded. Scorer logic unchanged.
    opus:   { tier: "Deep",     label: "Opus 4.8", api: "claude-opus-4-8" }
  };
  var FREE_MODELS = ["haiku", "sonnet"];

  var RETRIEVAL_RE = /^(what year|what is the capital|what is the (chemical )?symbol|who (is|was|wrote|invented)|when (did|was|is)|where (is|was)|how many|how far|how tall|convert|translate|define|spell|list the)/i;
  var ANALYSIS_RE = /\b(design|architect|analyze|analyse|evaluate|prove|derive|optimi[sz]e|diagnose|refactor|synthesi[sz]e|critique|reconcile|model|compare|weigh|assess|restructure|negotiate|recommend|propose|justify|plan out|strategi[sz]e)\b/gi;
  var CONSTRAINT_RE = /\b(under|given|without|while|subject to|toleran(?:t (?:to|of)|ce of)|at most|at least|no more than|within|budget of|limited to|assuming|(?:one|two|three|four|five|six|seven|eight|nine|ten)[ -](?:person|people|node|user|region|team|step)|in the presence of)\b/gi;
  var UNIT_NUM_RE = /\b\d+(\.\d+)?\s?(%|percent|ms|s|seconds|minutes|hours|days|users|nodes|dollars|gb|mb|k|x)\b/gi;
  var MULTIPART_RE = /(;|\band then\b|\band (?:analyze|analyse|prove|explain|propose|recommend|justify|compare|evaluate|document)\b|,\s*(?:then|plus)\b|\b(?:first|second|third)ly?\b|\bincluding\b)/gi;
  var TECH_RE = /\b(distributed|consensus|byzantine|partition|liveness|safety propert|asynchronous|synchroni[sz]|concurren|microservice|monolith|cach(?:e|ing)|throughput|latency|protocol|cryptograph|idempoten|quorum|replicat|shard|fault.toleran|state machine|invariant|theorem|complexity class|regression|schema|migration|failure mode)\b/gi;
  var SYNTHESIS_RE = /\b(summari[sz]e|explain|describe|outline|walk (?:me )?through|break down|difference between|how does \w+ work)\b/gi;
  var DESIGN_NOUN_RE = /\b(strategy|architecture|blueprint|roadmap|framework|migration plan|schema|protocol)\b/gi;
  var OPEN_RE = /\b(should (?:i|we)|recommend|which is (?:better|best)|is it worth|tradeoffs?|trade-offs?|pros and cons|best (?:way|approach|option))\b/i;
  var PROOF_RE = /\b(prove|formally|correctness|soundness|verify the|liveness)\b/i;

  var DOMAIN_RULES = [
    ["health",   /\b(symptom|medication|dosage|diagnos|doctor|therap|blood pressure|heart rate|blood sugar|pain in my|allerg|insomnia|\\bmg\\b|\\bdose)\b/i],
    ["code",     /\b(code|function|bug|stack trace|api|endpoint|python|rust|javascript|typescript|sql|regex|compile|deploy|repo|git)\b/i],
    ["creative", /\b(write (?:a |an |me )?(?:story|poem|song|script|slogan|tagline)|brainstorm names|creative)\b/i],
    ["decision-making", OPEN_RE],
    ["analytical", ANALYSIS_RE]
  ];

  function count(text, re) {
    var m = text.match(re);
    // reset lastIndex for global regexes reused across calls
    re.lastIndex = 0;
    return m ? m.length : 0;
  }

  var COURTESY_RE = /^(?:sorry(?: to bother you)?|hi|hey|hello|please|could you(?: please)?|can you(?: please)?|would you(?: mind)?|tell me|thanks?(?: so much)?|but|,|\.|!|\s)+/i;

  function scoreComplexity(prompt) {
    var t = String(prompt || "").trim();
    // courtesy wrappers do not change what is being asked; strip them before
    // testing the opener (they are common in this app's input by design)
    var anchorText = t.replace(COURTESY_RE, "");
    var words = t.split(/\s+/).filter(Boolean).length;
    var sig = {};
    sig.analysisVerbs = count(t, ANALYSIS_RE);
    sig.synthesis = count(t, SYNTHESIS_RE);
    sig.designNouns = count(t, DESIGN_NOUN_RE);
    sig.constraints = count(t, CONSTRAINT_RE);
    sig.dataPoints = count(t, UNIT_NUM_RE);
    sig.multipart = count(t, MULTIPART_RE);
    sig.techDepth = count(t, TECH_RE);
    sig.proof = PROOF_RE.test(t) ? 1 : 0;
    sig.openEnded = OPEN_RE.test(t) ? 1 : 0;
    sig.retrievalAnchor = RETRIEVAL_RE.test(anchorText) ? 1 : 0;
    sig.words = words;

    var pts = 0;
    pts += Math.min(sig.analysisVerbs * 1.2, 4.8);
    pts += Math.min(sig.synthesis * 0.8, 1.6);
    pts += Math.min(sig.designNouns * 0.8, 1.6);
    pts += Math.min(sig.constraints * 0.6, 1.8);
    // parallel data enumeration is one dataset, not N interacting constraints:
    // it raises reasoning load sub-linearly
    pts += Math.min(sig.dataPoints * 0.4, 1.2);
    pts += Math.min(sig.multipart * 0.8, 2.4);
    pts += Math.min(sig.techDepth * 0.4, 2.0);
    pts += sig.proof * 1.0;
    pts += sig.openEnded * 0.5;
    if (words > 30) pts += 0.5;
    if (words > 60) pts += 0.5;

    var raw = 1 + pts;
    // Retrieval anchor: an opener like "what year did..." with no analysis
    // demanded pins the score low no matter how long the sentence is.
    if (sig.retrievalAnchor && sig.analysisVerbs === 0 && (sig.constraints + sig.dataPoints) <= 1 && sig.proof === 0) {
      raw = Math.min(raw, 2);
    }
    if (sig.proof) raw = Math.max(raw, 6);
    var complexity = Math.max(1, Math.min(10, Math.round(raw)));
    return { complexity: complexity, signals: sig, rawPoints: Math.round(pts * 10) / 10 };
  }

  function classifyDimensions(prompt, cx) {
    var t = String(prompt || "");
    var domain = "other";
    if (cx.signals.retrievalAnchor && cx.signals.analysisVerbs === 0) domain = "factual";
    else {
      for (var i = 0; i < DOMAIN_RULES.length; i++) {
        var re = DOMAIN_RULES[i][1];
        if (re.test(t)) { domain = DOMAIN_RULES[i][0]; if (re.lastIndex) re.lastIndex = 0; break; }
        if (re.lastIndex) re.lastIndex = 0;
      }
    }
    var scope = "medium";
    if (/\b(entire|end.to.end|overall|architecture|strategy|ecosystem|full system|from scratch)\b/i.test(t)
        || cx.signals.techDepth >= 4 || cx.signals.multipart >= 2) scope = "broad";
    else if (cx.signals.words < 12 && cx.signals.constraints === 0 && (cx.signals.dataPoints||0) === 0) scope = "narrow";

    var certainty = "clear";
    if (cx.signals.openEnded || /\b(design|architect|brainstorm|propose)\b/i.test(t)) certainty = "exploratory";

    var depth = (cx.complexity >= 6 || cx.signals.proof) ? "deep" : "surface";
    var tokenEfficiencyMatters = cx.complexity <= 3 && certainty === "clear";
    return { domain: domain, scope: scope, certainty: certainty, depth: depth,
             tokenEfficiencyMatters: tokenEfficiencyMatters };
  }

  function route(input) {
    input = input || {};
    var prompt = input.prompt || "";
    var conf = (typeof input.confidence === "number") ? input.confidence : 100;
    var plan = input.plan === "paid" ? "paid" : "free";
    var override = input.override || null;

    var cx = scoreComplexity(prompt);
    var dims = classifyDimensions(prompt, cx);
    var notes = [];

    // Translation-confidence coupling: uncertainty about WHAT was asked is an
    // argument for a stronger model, never a cheaper one. Escalate, never save.
    var effective = cx.complexity;
    if (conf < 60) {
      notes.push("Translation confidence " + conf + " is below the clarify gate. This question should normally not reach routing. Routed at Balanced minimum as a safety floor.");
      effective = Math.max(effective, 4);
    } else if (conf < 80) {
      effective = Math.min(10, effective + 1);
      notes.push("Translation confidence " + conf + " is moderate, so the route was escalated one step. Uncertainty about the question is a reason to use a stronger model, not a cheaper one.");
    }

    var choice;
    if (dims.domain === "health") {
      notes.push("Health question: never routed to the Fast tier regardless of score. A cheap wrong answer costs more here than the tokens save.");
    }
    if (dims.domain === "health" && effective < 7) choice = "sonnet";
    else if (effective < 3 && dims.domain === "factual" && dims.certainty === "clear") choice = "haiku";
    else if (effective >= 7) choice = "opus";
    else if (dims.scope === "broad" && dims.certainty === "exploratory" && effective >= 5) choice = "opus";
    else choice = "sonnet";

    var thinkingRecommended = (effective >= 8) || (effective >= 7 && cx.signals.proof === 1);

    var downgraded = false;
    if (override && MODELS[override]) {
      if (plan === "free" && FREE_MODELS.indexOf(override) === -1) {
        notes.push("Manual override to " + MODELS[override].label + " requires the paid plan. Kept automatic routing.");
      } else {
        choice = override;
        notes.push("Manual override: you picked " + MODELS[override].label + ", so it wins regardless of the score.");
      }
    }
    if (plan === "free" && FREE_MODELS.indexOf(choice) === -1) {
      downgraded = true;
      notes.push("This question scored Deep tier (Opus 4.8), which is on the paid plan. Answered with Sonnet 5 instead.");
      choice = "sonnet";
    }
    var thinkingApplied = thinkingRecommended && plan === "paid" && input.thinkingOptIn !== false;
    if (thinkingRecommended && plan === "free") {
      notes.push("Extended thinking is recommended for this question and is available on the paid plan.");
      thinkingApplied = false;
    }

    var reasoning = "Complexity " + cx.complexity + "/10"
      + (effective !== cx.complexity ? " (escalated to " + effective + " by translation confidence)" : "")
      + ". Domain: " + dims.domain + ". Scope: " + dims.scope
      + ". " + (dims.certainty === "clear" ? "Has a clear right answer" : "Exploratory, no single right answer")
      + ". Needs " + (dims.depth === "deep" ? "deep analysis" : "surface clarity")
      + ". Routed to " + MODELS[choice].label + " (" + MODELS[choice].tier + " tier)"
      + (thinkingApplied ? " with extended thinking." : ".");

    return {
      model: choice,
      apiString: MODELS[choice].api,
      modelLabel: MODELS[choice].label,
      tier: MODELS[choice].tier,
      complexity: cx.complexity,
      effectiveComplexity: effective,
      dimensions: dims,
      reasoning: reasoning,
      thinkingRecommended: thinkingRecommended,
      thinkingApplied: thinkingApplied,
      downgraded: downgraded,
      notes: notes,
      signals: cx.signals,
      rawPoints: cx.rawPoints
    };
  }

  return { route: route, scoreComplexity: scoreComplexity, MODELS: MODELS, FREE_MODELS: FREE_MODELS };
})();
