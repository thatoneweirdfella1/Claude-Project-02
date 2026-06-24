import re
from typing import List, Tuple

def extract_core_question(text: str) -> str:
    """Extract the core question by removing preamble and context."""
    # Strategy 1: Explicit questions
    questions = re.findall(r"[^?.!]*\?", text)
    if questions:
        # If multiple questions, prefer the one that looks most substantive
        questions = [q.strip() for q in questions]
        # Longest question likely the main one
        main_question = max(questions, key=len) if len(questions) > 1 else questions[0]
        return main_question

    # Strategy 2: Look for decision keywords (implies a question even without ?)
    decision_words = ["should i", "should we", "can i", "will it", "is it better", "how do i", "what should"]
    for pattern in decision_words:
        match = re.search(f"({pattern}[^.!?]*)", text, re.IGNORECASE)
        if match:
            return match.group(1).strip()

    # Strategy 3: Get last 1-2 substantive sentences
    sentences = re.split(r"[.!]", text)
    sentences = [s.strip() for s in sentences if s.strip() and len(s.strip()) > 10]
    if len(sentences) > 2:
        return ". ".join(sentences[-2:]) + "."
    elif sentences:
        return sentences[-1] + ("?" if "?" not in text else ".")

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
    """Convert emotional language to logical description intelligently."""
    result = text

    # Map emotional phrases to more precise statements
    replacements = {
        r"\bi'm\s+overthinking\b": "I may be over-scoping",
        r"\bi'm\s+confused\b": "I need clarification on",
        r"\bi feel like\b": "It appears that",
        r"\bi feel\s+": "I believe ",
        r"\bso\s+confused\b": "unclear about",
        r"\bso\s+frustrated\b": "stuck on",
        r"\bso\s+overwhelmed\b": "I need to simplify",
        r"\bi'm\s+struggling\b": "I need help understanding",
        r"\bi'm\s+worried\b": "I'm concerned about",
        r"\bkinda\b": "somewhat",
        r"\bsorta\b": "arguably",
        r"\blike\s+(I|we)\s": "such as ",
        r"\bmaybe\b": "possibly",
        r"\bi think\b": "my understanding is",
        r"\bi guess\b": "my best guess is",
    }

    for pattern, replacement in replacements.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)

    # Remove filler words but preserve meaning
    fillers = [r"\blike\b(?!\s+I)", r"\bso\b(?!\s+\w{2,})", r"\bya\s+know\b", r"\byou\s+know\b"]
    for filler in fillers:
        result = re.sub(filler, "", result, flags=re.IGNORECASE)

    # Clean up multiple spaces
    result = re.sub(r"\s+", " ", result)
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
    """Split multi-question rambles into separate clear questions intelligently."""
    # First try: split on explicit question marks
    if "?" in text:
        questions = re.findall(r"[^?.!]*\?", text)
        if len(questions) > 1:
            # Clean up questions
            questions = [q.strip() for q in questions if q.strip()]
            if all(len(q) > 5 for q in questions):
                return questions

    # Second try: split on strong conjunctions that suggest separate thoughts
    strong_conjunctions = r"\bbut\b|\bhowever\b|\byet\b"
    parts = re.split(strong_conjunctions, text, flags=re.IGNORECASE)
    parts = [p.strip() for p in parts if p.strip()]

    if len(parts) > 1 and all(len(p) > 15 for p in parts):
        return parts

    # Third try: split on weak conjunctions if text is long
    if len(text) > 300:
        weak_conjunctions = r"\band\b|\balso\b"
        parts = re.split(weak_conjunctions, text, flags=re.IGNORECASE)
        parts = [p.strip() for p in parts if p.strip() and len(p) > 20]

        if len(parts) > 1:
            return parts

    # If no good splits found, return as single question
    return [text.strip()]
