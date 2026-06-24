import re
from typing import List, Tuple

def extract_core_question(text: str) -> str:
    """Extract the core question by removing preamble and context."""
    # If text contains question mark(s), focus on those
    questions = re.findall(r"[^?.!]*\?", text)
    if questions:
        return " ".join([q.strip() for q in questions])

    # Otherwise, get last 1-2 sentences (they're usually the actual ask)
    sentences = re.split(r"[.!]", text)
    sentences = [s.strip() for s in sentences if s.strip()]
    if len(sentences) > 2:
        return ". ".join(sentences[-2:]) + "."
    return text.strip()

def reorder_context(text: str) -> str:
    """Move buried core questions to the front."""
    # Extract questions
    questions = re.findall(r"[^?.!]*\?", text)
    # Extract other context
    non_questions = re.sub(r"[^?.!]*\?", "", text).strip()

    if questions:
        core = " ".join([q.strip() for q in questions])
        if non_questions:
            return f"{core} [Context: {non_questions}]"
        return core
    return text

def normalize_emotional_language(text: str) -> str:
    """Convert emotional language to logical description."""
    replacements = {
        r"\bi'm overthinking this\b": "This may be over-scoped",
        r"\bi'm confused\b": "I need clarification on",
        r"\bi feel like\b": "It appears that",
        r"\bkinda\b": "",
        r"\bsorta\b": "",
        r"\blike\s+": "such as ",
        r"\bmaybe\b": "possibly",
    }

    result = text
    for pattern, replacement in replacements.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)

    return result.strip()

def clarify_scope(text: str) -> str:
    """Make scope explicit in the question."""
    scope_indicators = {
        "narrow": "Should I answer this narrowly (yes/no or specific case)?",
        "broad": "Should I explore this broadly (comprehensive overview)?",
        "medium": "Should I answer this at medium depth?",
    }

    # Detect if scope is already mentioned
    if any(word in text.lower() for word in ["specifically", "exactly", "generally", "broadly", "overview"]):
        return text

    # Add scope clarification
    if "?" in text:
        base_question = text.rstrip("?")
        # Detect scope from context
        if any(word in text.lower() for word in ["all", "everything", "complete", "comprehensive"]):
            return f"{base_question}? (comprehensive answer needed)"
        elif any(word in text.lower() for word in ["quick", "simple", "just", "only"]):
            return f"{base_question}? (concise answer sufficient)"

    return text

def surface_assumptions(text: str) -> str:
    """Pull out unstated assumptions and make them explicit."""
    assumptions = []

    # Check for assumed knowledge
    if any(word in text.lower() for word in ["architecture", "routing", "models", "tokens"]):
        assumptions.append("Assumes I understand technical terminology")

    # Check for assumed problem scope
    if "it" in text.lower() and text.count(" it ") > 2:
        assumptions.append("Assumes singular problem context (uses 'it' repeatedly)")

    if assumptions:
        return f"{text}\n[Assumptions: {'; '.join(assumptions)}]"

    return text

def decompose_compound(text: str) -> List[str]:
    """Split multi-question rambles into separate clear questions."""
    # Split on conjunctions
    parts = re.split(r"\band\b|\bor\b|\balso\b|\bhowever\b|\bbut\b", text, flags=re.IGNORECASE)
    parts = [p.strip() for p in parts if p.strip()]

    # If multiple clear parts, return them; otherwise return as single
    if len(parts) > 1 and all(len(p) > 10 for p in parts):
        return parts

    # Try splitting on question marks
    if "?" in text:
        questions = re.findall(r"[^?.!]*\?", text)
        if len(questions) > 1:
            return [q.strip() for q in questions]

    return [text.strip()]
