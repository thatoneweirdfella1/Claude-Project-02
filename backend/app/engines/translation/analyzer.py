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
    """Detect emotional vs logical language."""
    emotional_words = [
        "feel", "think", "worry", "overthink", "confused", "frustrated",
        "like", "kinda", "sorta", "maybe", "probably", "unsure"
    ]
    logical_words = [
        "because", "therefore", "following", "specifically", "exactly",
        "precisely", "clearly", "obviously", "definitely"
    ]

    emotional_count = sum(1 for word in emotional_words if word in text.lower())
    logical_count = sum(1 for word in logical_words if word in text.lower())

    if emotional_count > logical_count * 2:
        return "high"
    elif emotional_count > logical_count:
        return "medium"
    else:
        return "low"

def detect_scope(text: str) -> str:
    """Detect scope: narrow, medium, or broad."""
    scope_words = {
        "broad": ["everything", "all", "always", "completely", "entire", "overall", "general"],
        "narrow": ["specific", "exact", "particular", "only", "just", "whether"]
    }

    broad_count = sum(1 for word in scope_words["broad"] if word in text.lower())
    narrow_count = sum(1 for word in scope_words["narrow"] if word in text.lower())

    if broad_count > narrow_count:
        return "broad"
    elif narrow_count > broad_count:
        return "narrow"
    else:
        return "medium"

def count_questions(text: str) -> int:
    """Count number of questions in text."""
    question_marks = text.count("?")
    conjunctions = len(re.findall(r"\b(and|or|also|but|however)\b", text, re.IGNORECASE))

    # Heuristic: estimate number of questions based on punctuation and conjunctions
    return max(1, question_marks) if question_marks > 0 else max(1, conjunctions // 2 + 1)

def extract_assumptions(text: str) -> List[str]:
    """Extract unstated assumptions."""
    assumptions = []

    # Pattern: "assuming...", "given that...", etc.
    if re.search(r"assum", text.lower()):
        assumptions.append("Makes unstated assumptions about problem scope")

    # Pattern: uses technical terms without defining them
    tech_terms = ["architecture", "routing", "models", "tokens", "inference"]
    used_terms = [t for t in tech_terms if t in text.lower()]
    if used_terms:
        assumptions.append(f"Assumes familiarity with: {', '.join(used_terms)}")

    # Pattern: "like" or similar hedging
    if re.search(r"\blike\b|\bsorta\b|\bkinda\b", text.lower()):
        assumptions.append("Uses vague language; exact requirements unclear")

    return assumptions

def detect_clarity(text: str) -> str:
    """Detect how clear the actual question is."""
    lines = text.strip().split("\n")

    # If text is short and direct
    if len(text) < 100 and "?" in text:
        return "high"

    # If text has clear structure (bullet points, etc)
    if re.search(r"^[\s]*[-*•]\s", text, re.MULTILINE):
        return "high"

    # If text is rambling
    if len(text) > 300 or len(lines) > 5:
        return "low"

    return "medium"
