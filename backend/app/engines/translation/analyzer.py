import re
from typing import Dict, List, Tuple, Any

def analyze_input(text: str) -> Dict[str, Any]:
    """
    Analyze input across 5 dimensions:
    1. Emotional vs logical content
    2. Unstated assumptions
    3. Scope ambiguity
    4. Stated vs actual question
    5. Prerequisite knowledge gaps
    """
    analysis = {
        "emotional_intensity": detect_emotional_content(text),
        "scope": detect_scope(text),
        "num_questions": count_questions(text),
        "assumptions": extract_assumptions(text),
        "clarity": detect_clarity(text)
    }
    return analysis

def detect_emotional_content(text: str) -> str:
    """Detect emotional vs logical language with weighted scoring."""
    text_lower = text.lower()

    strong_emotional = [
        "overwhelm", "panic", "anxious", "stressed", "frustrated", "angry",
        "confused", "lost", "stuck", "help", "desperate", "struggling"
    ]
    mild_emotional = [
        "feel", "think", "worry", "overthink", "concerned", "unsure",
        "kinda", "sorta", "maybe", "probably", "hmm", "ugh", "ugh"
    ]
    hedging = [
        "like", "i guess", "i think", "kind of", "sort of", "apparently",
        "seems like", "not sure", "unclear"
    ]

    strong_logical = [
        "therefore", "hence", "thus", "consequently", "as a result",
        "following from", "given that", "because", "since"
    ]
    medium_logical = [
        "specifically", "exactly", "precisely", "clearly", "obviously",
        "definitely", "certainly", "demonstrates", "shows", "proves"
    ]
    technical = [
        "algorithm", "architecture", "design pattern", "refactor", "optimize",
        "implementation", "specification", "requirement", "constraint"
    ]

    strong_emotional_count = sum(1 for word in strong_emotional if word in text_lower)
    mild_emotional_count = sum(1 for word in mild_emotional if word in text_lower)
    hedging_count = sum(1 for word in hedging if word in text_lower)

    strong_logical_count = sum(1 for word in strong_logical if word in text_lower)
    medium_logical_count = sum(1 for word in medium_logical if word in text_lower)
    technical_count = sum(1 for word in technical if word in text_lower)

    # Weighted score
    emotional_score = (strong_emotional_count * 3 + mild_emotional_count * 2 + hedging_count * 1.5)
    logical_score = (strong_logical_count * 3 + medium_logical_count * 2 + technical_count * 1.5)

    # All-caps words indicate emotional intensity
    all_caps = len(re.findall(r"\b[A-Z]{2,}\b", text))
    emotional_score += all_caps * 2

    # Exclamation marks and multiple punctuation
    emotional_score += text.count("!") * 1.5
    emotional_score += len(re.findall(r"[?!]{2,}", text)) * 2

    # Negation patterns (I don't, can't, won't) suggest frustration
    negations = len(re.findall(r"\b(don't|can't|won't|shouldn't|can't|not)\b", text_lower))
    emotional_score += negations * 1.5

    ratio = emotional_score / max(logical_score, 0.1)

    if ratio > 2.5:
        return "high"
    elif ratio > 1.2:
        return "medium"
    else:
        return "low"

def detect_scope(text: str) -> str:
    """Detect scope with better context awareness."""
    text_lower = text.lower()

    broad_strong = ["everything", "all", "entire", "completely", "comprehensive", "full coverage"]
    broad_moderate = ["generally", "overall", "big picture", "the whole", "all aspects"]

    narrow_strong = ["specific", "particular", "just", "only", "whether", "exactly"]
    narrow_moderate = ["focused", "narrow", "specific case", "this particular"]

    # Check if sentence talks about boundary/limits
    limit_words = ["up to", "at least", "between", "range", "scope"]

    # Context: user asking about one thing vs multiple
    comma_separated_items = len(re.findall(r"[^,]*,[^,]*", text))
    or_alternatives = len(re.findall(r"\bor\b", text_lower))
    vs_comparisons = len(re.findall(r"\bvs\b|\bversus\b", text_lower))

    broad_count = (
        sum(2 for word in broad_strong if word in text_lower) +
        sum(1 for word in broad_moderate if word in text_lower) +
        sum(1 for word in limit_words if word in text_lower)
    )

    narrow_count = (
        sum(2 for word in narrow_strong if word in text_lower) +
        sum(1 for word in narrow_moderate if word in text_lower)
    )

    # Multiple items/comparisons suggest broader scope
    if comma_separated_items > 2 or or_alternatives > 1 or vs_comparisons > 0:
        broad_count += 1

    if broad_count > narrow_count:
        return "broad"
    elif narrow_count > broad_count:
        return "narrow"
    else:
        return "medium"

def count_questions(text: str) -> int:
    """Count number of questions more accurately."""
    question_marks = text.count("?")

    if question_marks > 0:
        return question_marks

    # Find implied questions from structure
    conjunctions = len(re.findall(r"\b(and|or|also|but|however)\b", text, re.IGNORECASE))

    # Implicit questions from decision markers
    decision_words = len(re.findall(r"\b(should|could|would|may|might|can)\b", text, re.IGNORECASE))

    # Estimate: if asking about alternatives or has many conjunctions, multiple questions likely
    estimate = max(1, (decision_words + conjunctions) // 3 + 1)
    return max(1, estimate)

def extract_assumptions(text: str) -> List[str]:
    """Extract assumptions with deeper analysis."""
    assumptions = []
    text_lower = text.lower()

    # Pattern 1: Explicit assumption keywords
    assumption_phrases = [
        (r"assum\w+", "Makes explicit assumptions about requirements"),
        (r"given\s+that", "Assumes given context is understood"),
        (r"as\s+you\s+know", "Assumes shared background knowledge"),
        (r"obviously|clearly|obviously", "Uses words suggesting taken-for-granted context"),
    ]

    for pattern, message in assumption_phrases:
        if re.search(pattern, text_lower):
            assumptions.append(message)

    # Pattern 2: Technical jargon without context
    technical_terms = {
        "architecture": "system design",
        "routing": "network/path decisions",
        "models": "ML models or design patterns",
        "tokens": "LLM tokens",
        "inference": "prediction/execution",
        "endpoint": "API endpoint",
        "latency": "response time",
        "throughput": "request capacity",
        "scalability": "growth handling",
    }

    used_terms = [t for t in technical_terms.keys() if t in text_lower]
    if used_terms:
        terms_str = ", ".join(used_terms)
        assumptions.append(f"Uses technical terms without definition: {terms_str}")

    # Pattern 3: Vague pronouns (suggests implicit context)
    vague_pronouns = len(re.findall(r"\bit\b|\bthis\b|\bthat\b", text_lower))
    if vague_pronouns > 3:
        assumptions.append("Uses vague pronouns; exact scope unclear (refers to 'it', 'this', 'that')")

    # Pattern 4: Hedging language (suggests uncertainty about prerequisites)
    if re.search(r"\b(like|kinda|sorta|i guess|i think|maybe|possibly)\b", text_lower):
        assumptions.append("Hedging language suggests uncertain about own requirements")

    # Pattern 5: Implicit comparisons (assumes you know about multiple things)
    if re.search(r"\bvs\b|\bversus\b|\bor\b", text_lower):
        assumptions.append("Asks for comparison; assumes familiarity with all options")

    # Pattern 6: Assumes shared problem domain
    if re.search(r"\bwe\b|\bour\b|\bteam\b", text_lower):
        assumptions.append("Implies shared team context; specific org knowledge assumed")

    return list(set(assumptions))  # Remove duplicates

def detect_clarity(text: str) -> str:
    """Detect clarity with better heuristics."""
    lines = [l.strip() for l in text.strip().split("\n") if l.strip()]
    text_lower = text.lower()

    # Structured indicators (high clarity)
    has_bullets = bool(re.search(r"^[\s]*[-*•]\s", text, re.MULTILINE))
    has_numbers = bool(re.search(r"^[\s]*\d+[\.\)]\s", text, re.MULTILINE))
    has_clear_sections = len(re.findall(r"^#+\s", text, re.MULTILINE)) > 0

    if has_bullets or has_numbers or has_clear_sections:
        return "high"

    # Direct questions (high clarity)
    question_ratio = text.count("?") / max(len(lines), 1)
    if question_ratio > 0.3 and len(text) < 200:
        return "high"

    # Short and focused (high clarity)
    if len(text) < 100 and text.count("?") > 0:
        return "high"

    # Rambling indicators (low clarity)
    stream_of_consciousness = [
        "anyway", "so like", "also", "btw", "oh", "wait",
        "actually", "never mind", "scratch that"
    ]
    rambling_count = sum(1 for word in stream_of_consciousness if word in text_lower)

    if len(text) > 500 or len(lines) > 8:
        clarity = "low" if rambling_count > 2 else "medium"
        return clarity

    if len(text) > 300 or len(lines) > 5:
        if rambling_count > 1:
            return "low"
        return "medium"

    # Moderate clarity for medium-length, structured text
    if 100 <= len(text) <= 300 and not rambling_count:
        return "medium"

    # More heuristics
    if text.count("?") == 0 and len(text) > 150:
        return "low"

    if "?" in text and text.count(".") < text.count("?"):
        return "high"

    return "medium"
