"""
Flow Preservation Engine (Phase 2-Zero Priority)

Prevents the most damaging AI behavior for ADHD brains: interrupting productive flow
with unsolicited epistemic self-correction. This engine:

1. Detects and strips flow-breaking meta-commentary
2. Converts flow-breaking caveats to inline confidence tags
3. Bans phrase patterns that interrupt hyperfocus
4. Preserves user agency over gather→evaluate transitions

See PRIORITY_ANTIPATTERNS.md for full behavioral spec.
"""

import re
from typing import Tuple, Dict, List

# Banned phrase patterns that interrupt flow (case-insensitive)
BANNED_PHRASES = [
    r"i'd like to take a moment",
    r"i have to admit",
    r"i should note",
    r"let me acknowledge",
    r"we've drifted",
    r"we've gotten.*off track",
    r"let me bring us back",
    r"circling back",
    r"to summarize where we are",
    r"to recap",
    r"let me refocus",
    r"getting back on track",
]

# Flow-breaking caveat patterns (meta-commentary about the conversation itself)
CAVEAT_PATTERNS = [
    # "We started with X and drifted to Y" patterns
    (
        r"(?:we\s+)?(?:started|began).*?(?:genuine|real|grounded)\s+(?:research|investigation).*?(?:drift|move|shift).*?(?:inferred|speculative|speculative|specul[a]?tory?)",
        "drift_caveat"
    ),
    # "I notice/realize we've wandered" patterns
    (
        r"i\s+(?:notice|realize|realize|see)\s+(?:that\s+)?we.*?(?:wander|drift|gone.*off|gotten.*off)",
        "drift_caveat"
    ),
    # "This is getting speculative" self-corrections
    (
        r"(?:this is|we're)\s+(?:getting|moving)\s+into?\s+(?:speculation|inferred|inferred territory)",
        "epistemic_self_correction"
    ),
]

# Over-caveating patterns (excessive hedging that drowns signal)
HEDGING_PATTERNS = [
    r"\bi\s+should\s+note\b",
    r"\bit's\s+important\s+to\s+remember\s+that\b",
    r"\bto\s+be\s+clear\b",
    r"\bi\s+should\s+mention\b",
    r"\bit\s+bears\s+noting\b",
    r"\bi\s+want\s+to\s+be\s+careful\b",
]

# Patterns that treat tangents as errors (frame-shifting to negative)
TANGENT_DEPRECATION = [
    r"that's\s+(?:a\s+)?bit\s+of\s+a\s+tangent",
    r"(?:though|but)\s+that's\s+(?:a\s+)?tangent",
    r"(?:though|but)\s+that's\s+(?:off\s+)?topic",
    r"(?:we're\s+)?getting\s+off\s+track",
]


def strip_flow_breaking_meta_commentary(text: str) -> str:
    """
    Remove unsolicited epistemic self-correction and meta-commentary.

    This is the core P0 fix: suppress phrases like:
    "I'd like to take a moment to acknowledge that we started with genuine research
    and I have to admit I've let this drift into inferred territory..."

    These shatter hyperfocus and impose premature convergence.
    Returns the text with flow-breaking sections removed.
    """
    result = text

    # First, detect and remove entire meta-commentary paragraphs
    # Pattern: paragraphs that are primarily about "I notice we've drifted" or similar
    for pattern, pattern_type in CAVEAT_PATTERNS:
        # Find sentences/paragraphs matching caveat patterns
        sentences = re.split(r'(?<=[.!?])\s+', result)
        new_sentences = []

        for sentence in sentences:
            if re.search(pattern, sentence, re.IGNORECASE):
                # Skip this sentence (it's meta-commentary)
                continue
            new_sentences.append(sentence)

        result = ' '.join(new_sentences)

    # Second, ban specific phrase patterns
    for phrase_pattern in BANNED_PHRASES:
        # Remove entire sentences containing banned phrases
        result = re.sub(
            rf'[^.!?]*{phrase_pattern}[^.!?]*[.!?]',
            '',
            result,
            flags=re.IGNORECASE
        )

    # Clean up multiple spaces and leading/trailing whitespace
    result = re.sub(r'\s+', ' ', result).strip()

    return result


def convert_caveats_to_inline_tags(text: str) -> str:
    """
    Convert flow-breaking caveats into inline confidence tags.

    BEFORE: "This is speculative, but I should note that it might not be accurate..."
    AFTER: "This [inference] might not be accurate..."

    Tags: [inference], [grounded], [speculation], [uncertain]
    """
    result = text

    # Hedging language → [inference] tag
    hedging_replacements = [
        (r"this\s+(?:might|may|could)\s+be\s+(?:speculative|inferred|inference)",
         "this [inference]"),
        (r"(?:i|we)\s+(?:inferred?|inferred?|speculated?)\s+that",
         "[inference] that"),
        (r"(?:based\s+on\s+)?inference(?:\s+alone)?",
         "[inference]"),
    ]

    for pattern, replacement in hedging_replacements:
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)

    # Over-caveating → remove redundant hedges, keep the core idea
    for hedge_pattern in HEDGING_PATTERNS:
        # Replace with nothing (the hedge adds no signal)
        result = re.sub(
            rf"{hedge_pattern}\s*,?\s*",
            "",
            result,
            flags=re.IGNORECASE
        )

    return result


def deprioritize_tangent_deprecation(text: str) -> str:
    """
    Reframe tangents neutrally instead of treating them as errors.

    BEFORE: "That's a bit of a tangent, but..."
    AFTER: "That connects to..." or just remove the frame-shift
    """
    result = text

    # Replace tangent deprecation with neutral transitions
    replacements = [
        (r"that's\s+(?:a\s+)?bit\s+of\s+a\s+tangent,?\s*(?:but\s+)?",
         ""),
        (r"(?:though|but)\s+that's\s+(?:a\s+)?tangent,?\s*(?:to\s+)?",
         "That connects to: "),
        (r"(?:that's\s+)?off\s+topic,?\s+(?:but\s+)?",
         ""),
    ]

    for pattern, replacement in replacements:
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)

    return result


def add_confidence_markers(text: str, confidence_level: str = "grounded") -> str:
    """
    Add inline confidence markers for grounded vs. speculative content.

    confidence_level: "grounded" (facts), "inference" (derived from facts),
                     "speculation" (beyond current data)

    Used when the user is in exploration/gathering mode to preserve flow
    while maintaining fact-vs-inference distinction for later evaluation.
    """
    # This is intentionally simple - it doesn't insert markers everywhere,
    # only marks explicit hedge language as inline tags
    result = text

    # Already handled by convert_caveats_to_inline_tags
    # This function is here for completeness and future enhancement

    return result


def preserve_exploration_mode(text: str) -> str:
    """
    Prepare a response for a user in exploration/gathering mode.

    Combines all flow-preservation fixes:
    1. Strip unsolicited meta-commentary
    2. Convert caveats to inline tags
    3. Reframe tangents neutrally
    4. Preserve momentum
    """
    # Apply fixes in order
    text = strip_flow_breaking_meta_commentary(text)
    text = convert_caveats_to_inline_tags(text)
    text = deprioritize_tangent_deprecation(text)

    return text


def detect_flow_breaking_patterns(text: str) -> Dict[str, List[str]]:
    """
    Analyze a response for flow-breaking patterns.
    Returns dict of detected patterns and their matches.
    """
    detected = {
        "banned_phrases": [],
        "caveat_patterns": [],
        "hedging": [],
        "tangent_deprecation": [],
    }

    for pattern in BANNED_PHRASES:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            detected["banned_phrases"].extend(matches)

    for pattern, pattern_type in CAVEAT_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            detected["caveat_patterns"].extend(matches)

    for pattern in HEDGING_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            detected["hedging"].extend(matches)

    for pattern in TANGENT_DEPRECATION:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            detected["tangent_deprecation"].extend(matches)

    return detected


def validate_response_for_flow_preservation(text: str) -> Tuple[bool, List[str]]:
    """
    Check if a response preserves flow (no anti-patterns detected).
    Returns (is_valid, list_of_detected_issues).
    """
    issues = []

    detected = detect_flow_breaking_patterns(text)

    if detected["banned_phrases"]:
        issues.append(f"Contains banned phrases: {', '.join(set(detected['banned_phrases']))}")

    if detected["caveat_patterns"]:
        issues.append("Contains unsolicited epistemic self-correction")

    if detected["hedging"]:
        issues.append(f"Over-caveating detected: {len(detected['hedging'])} instances")

    if detected["tangent_deprecation"]:
        issues.append("Treats tangents as errors (frame-shifting to negative)")

    is_valid = len(issues) == 0
    return is_valid, issues
