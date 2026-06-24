from typing import Dict, Any

def score_confidence(original: str, translated: str, analysis: Dict[str, Any]) -> int:
    """
    Score confidence in translation accuracy (0-100).
    Higher = more confident that we understood the actual question.
    """
    score = 50  # Base score

    # Boost if clarity is high
    if analysis.get("clarity") == "high":
        score += 25
    elif analysis.get("clarity") == "medium":
        score += 10

    # Reduce if many assumptions
    assumptions = analysis.get("assumptions", [])
    score -= min(15, len(assumptions) * 5)

    # Reduce if high emotional content (less clear what they actually want)
    if analysis.get("emotional_intensity") == "high":
        score -= 15
    elif analysis.get("emotional_intensity") == "medium":
        score -= 5

    # Reduce if broad scope (ambiguous)
    if analysis.get("scope") == "broad":
        score -= 10

    # Boost if translation is significantly shorter (we simplified)
    if len(translated) < len(original) * 0.7:
        score += 10

    # Cap between 0-100
    return max(0, min(100, score))

def generate_explanation(original: str, translated: str, analysis: Dict[str, Any],
                        operations_applied: list) -> str:
    """Generate human-readable explanation of what the translation did."""
    explanations = []

    if "extract_core_question" in operations_applied:
        explanations.append("Extracted core question from preamble")

    if "reorder_context" in operations_applied:
        explanations.append("Reordered context to prioritize main question")

    if "normalize_emotional_language" in operations_applied:
        explanations.append("Normalized emotional language to logical terms")

    if "clarify_scope" in operations_applied:
        explanations.append("Clarified scope explicitly")

    if "surface_assumptions" in operations_applied:
        explanations.append("Surfaced unstated assumptions")

    if "decompose_compound" in operations_applied:
        explanations.append("Decomposed multiple questions")

    if not explanations:
        explanations.append("Cleaned up and clarified input")

    return "; ".join(explanations)
