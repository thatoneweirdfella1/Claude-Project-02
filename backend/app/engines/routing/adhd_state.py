"""
ADHD State Detection for Routing (Phase 2B)

The base router decides WHICH model based on question complexity/domain.
This module adds a second axis: the user's current COGNITIVE/EMOTIONAL state,
inferred from how they wrote the input. State changes how we should respond,
independent of the question's difficulty.

Detected states:
- emotional_state:   calm | anxious | overwhelmed | frustrated
- rsd_sensitivity:   low | medium | high  (likelihood input is RSD-charged)
- working_memory:    low | medium | high  (load the input is carrying)
- interest_level:    low | medium | high  (engagement / hyperfocus signal)
- mode:              gathering | evaluating  (divergent-explore vs. converge)

These produce response *directives* the pipeline/composer can act on, e.g.
"lead with answer," "validate before analyzing," "preserve flow / don't converge."
"""

import re
from typing import Dict, Any

# --- signal vocabularies -----------------------------------------------------

OVERWHELM_SIGNALS = [
    "too much", "can't keep up", "drowning", "so much", "overwhelmed",
    "everything at once", "i can't", "lost", "falling apart", "spiraling",
]
ANXIETY_SIGNALS = [
    "worried", "nervous", "scared", "anxious", "afraid", "what if",
    "stress", "panic", "freaking out", "uneasy",
]
FRUSTRATION_SIGNALS = [
    "frustrated", "annoyed", "stuck", "ugh", "hate", "stupid", "won't work",
    "keep failing", "fed up", "sick of",
]
INTEREST_SIGNALS = [
    "what if", "imagine", "cool", "interesting", "love this", "obsessed",
    "fascinating", "tangent", "rabbit hole", "wonder", "curious", "excited",
]
# explicit "let's check this" — user wants to converge / evaluate
EVALUATING_SIGNALS = [
    "is this real", "is that right", "check this", "verify", "fact check",
    "am i wrong", "does this hold", "let's evaluate", "is it actually",
    "prove", "sanity check", "double check",
]
# divergent / gathering language — user is still exploring
GATHERING_SIGNALS = [
    "what if", "brainstorm", "throw ideas", "explore", "riff", "free associate",
    "just thinking", "spitballing", "bear with me", "tangent", "rambl",
]


def _count_hits(text: str, vocab) -> int:
    low = text.lower()
    return sum(1 for term in vocab if term in low)


def detect_emotional_state(text: str) -> str:
    """Return calm | anxious | overwhelmed | frustrated."""
    overwhelmed = _count_hits(text, OVERWHELM_SIGNALS)
    anxious = _count_hits(text, ANXIETY_SIGNALS)
    frustrated = _count_hits(text, FRUSTRATION_SIGNALS)

    # All-caps shouting and exclamation density boost intensity
    caps_words = len(re.findall(r"\b[A-Z]{3,}\b", text))
    exclamations = text.count("!")
    intensity = caps_words + exclamations

    scores = {
        "overwhelmed": overwhelmed * 2 + (1 if intensity >= 3 else 0),
        "anxious": anxious * 2,
        "frustrated": frustrated * 2 + (1 if intensity >= 4 else 0),
    }

    top_state = max(scores, key=scores.get)
    if scores[top_state] == 0:
        return "calm"
    return top_state


def assess_rsd_sensitivity(text: str) -> str:
    """
    Estimate how RSD-charged the input is (self-criticism, fear of judgment).
    Returns low | medium | high.
    """
    rsd_markers = [
        "stupid", "dumb", "idiot", "i'm bad at", "i always mess",
        "i can't do anything", "failure", "i'm the worst", "embarrassed",
        "judge me", "feel dumb", "i should know", "i'm behind",
    ]
    hits = _count_hits(text, rsd_markers)
    # self-directed negation ("i can't", "i never") adds signal
    self_negation = len(re.findall(r"\bi (?:can't|cannot|never|always)\b", text, re.IGNORECASE))
    total = hits + self_negation

    if total >= 3:
        return "high"
    if total >= 1:
        return "medium"
    return "low"


def estimate_working_memory_load(text: str) -> str:
    """
    Estimate the cognitive load the input itself carries (many threads at once).
    Returns low | medium | high.
    """
    word_count = len(text.split())
    # "and ... and ... also ... plus" chaining = many concurrent threads
    conjunctions = len(re.findall(r"\b(?:and|also|plus|then|but|or)\b", text, re.IGNORECASE))
    topic_shifts = len(re.findall(r"\b(?:anyway|oh|wait|actually|btw|side note)\b", text, re.IGNORECASE))
    questions = text.count("?")

    load = conjunctions * 0.5 + topic_shifts * 2 + questions
    if word_count > 120:
        load += 2
    elif word_count > 60:
        load += 1

    if load >= 6:
        return "high"
    if load >= 3:
        return "medium"
    return "low"


def gauge_interest_level(text: str) -> str:
    """Return low | medium | high based on engagement signals."""
    hits = _count_hits(text, INTEREST_SIGNALS)
    if hits >= 2:
        return "high"
    if hits == 1:
        return "medium"
    return "low"


def detect_mode(text: str) -> str:
    """
    Return 'evaluating' if the user is signaling they want to converge/verify,
    else 'gathering' (the divergent-explore default the system protects).
    """
    evaluating = _count_hits(text, EVALUATING_SIGNALS)
    gathering = _count_hits(text, GATHERING_SIGNALS)
    if evaluating > gathering and evaluating > 0:
        return "evaluating"
    return "gathering"


def derive_directives(state: Dict[str, str]) -> Dict[str, Any]:
    """
    Translate a detected state into concrete response directives the
    composer/pipeline can act on.
    """
    directives = {
        "lead_with_answer": False,
        "validate_before_analyzing": False,
        "simplify_aggressively": False,
        "preserve_flow_strict": True,   # default ON (gathering mode)
        "can_go_deep": False,
        "rescue_mode": False,           # overwhelm → smallest next step only
    }

    if state["emotional_state"] == "overwhelmed":
        directives["rescue_mode"] = True
        directives["simplify_aggressively"] = True
        directives["lead_with_answer"] = True
    elif state["emotional_state"] in ("anxious", "frustrated"):
        directives["lead_with_answer"] = True
        directives["simplify_aggressively"] = True

    if state["rsd_sensitivity"] == "high":
        directives["validate_before_analyzing"] = True

    if state["working_memory"] == "high":
        directives["lead_with_answer"] = True
        directives["simplify_aggressively"] = True

    if state["interest_level"] == "high" and state["emotional_state"] == "calm":
        directives["can_go_deep"] = True

    # If the user explicitly wants to evaluate, relax strict flow preservation
    if state["mode"] == "evaluating":
        directives["preserve_flow_strict"] = False

    return directives


def detect_adhd_state(text: str) -> Dict[str, Any]:
    """
    Full ADHD-state read of an input. Returns the state plus response directives.
    """
    state = {
        "emotional_state": detect_emotional_state(text),
        "rsd_sensitivity": assess_rsd_sensitivity(text),
        "working_memory": estimate_working_memory_load(text),
        "interest_level": gauge_interest_level(text),
        "mode": detect_mode(text),
    }
    return {
        "state": state,
        "directives": derive_directives(state),
    }
