import uuid
from typing import List, Dict, Any
from .analyzer import analyze_input
from .operations import (
    extract_core_question,
    reorder_context,
    normalize_emotional_language,
    clarify_scope,
    surface_assumptions,
    decompose_compound,
)
from .scorer import score_confidence, generate_explanation

def translate(raw_input: str) -> Dict[str, Any]:
    """
    Main translation pipeline.
    Returns: {
        "original_input": str,
        "translations": [
            {
                "id": str,
                "translated_text": str,
                "operations_applied": [str],
                "confidence": int,
                "explanation": str
            }
        ],
        "analysis": Dict
    }
    """
    # Analyze the input
    analysis = analyze_input(raw_input)

    # Decompose into separate questions first
    decomposed = decompose_compound(raw_input)

    translations = []
    for question_text in decomposed:
        # Apply operations in sequence
        text = question_text
        operations_applied = []

        # Extract core
        text = extract_core_question(text)
        operations_applied.append("extract_core_question")

        # Reorder context
        text = reorder_context(text)
        operations_applied.append("reorder_context")

        # Normalize emotional language
        normalized = normalize_emotional_language(text)
        if normalized != text:
            operations_applied.append("normalize_emotional_language")
        text = normalized

        # Clarify scope
        scoped = clarify_scope(text)
        if scoped != text:
            operations_applied.append("clarify_scope")
        text = scoped

        # Surface assumptions
        with_assumptions = surface_assumptions(text)
        if with_assumptions != text:
            operations_applied.append("surface_assumptions")
        text = with_assumptions

        # Score confidence
        confidence = score_confidence(question_text, text, analysis)

        # Generate explanation
        explanation = generate_explanation(question_text, text, analysis, operations_applied)

        translations.append({
            "id": str(uuid.uuid4()),
            "translated_text": text,
            "operations_applied": operations_applied,
            "confidence": confidence,
            "explanation": explanation
        })

    return {
        "original_input": raw_input,
        "translations": translations,
        "analysis": {
            "emotional_content": analysis.get("emotional_intensity"),
            "scope": analysis.get("scope"),
            "num_questions": analysis.get("num_questions"),
            "assumptions": analysis.get("assumptions"),
            "clarity": analysis.get("clarity")
        }
    }
