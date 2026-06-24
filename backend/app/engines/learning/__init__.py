from typing import Dict, Any
import uuid
from datetime import datetime
from ...database import (
    save_question, save_translation, save_routing,
    save_composition, save_answer, save_feedback, get_feedback_patterns
)

def log_full_pipeline(
    raw_input: str,
    translation: Dict[str, Any],
    routing: Dict[str, Any],
    composition: Dict[str, Any],
    model_response: str,
    tokens_used: int
) -> Dict[str, str]:
    """
    Log entire pipeline to database for learning and pattern analysis.
    """
    question_id = str(uuid.uuid4())
    translation_id = translation.get("id", str(uuid.uuid4()))
    routing_id = routing.get("id", str(uuid.uuid4()))
    composition_id = composition.get("id", str(uuid.uuid4()))
    answer_id = str(uuid.uuid4())

    # Save each step
    save_question(question_id, raw_input)

    save_translation(
        translation_id,
        question_id,
        translation.get("translated_text", ""),
        translation.get("operations_applied", []),
        translation.get("confidence", 0),
        translation.get("analysis", {})
    )

    save_routing(
        routing_id,
        translation_id,
        routing.get("routed_model", "haiku"),
        routing.get("dimensions", {}),
        routing.get("confidence", 0)
    )

    save_composition(
        composition_id,
        routing_id,
        composition.get("techniques", []),
        composition.get("final_prompt", ""),
        composition.get("estimated_tokens", 0),
        composition.get("confidence", 0)
    )

    save_answer(
        answer_id,
        composition_id,
        model_response,
        tokens_used
    )

    return {
        "question_id": question_id,
        "answer_id": answer_id,
    }

def record_feedback(answer_id: str, rating: str, notes: str = "") -> None:
    """Record user feedback for learning."""
    feedback_id = str(uuid.uuid4())
    save_feedback(feedback_id, answer_id, rating, notes)

def get_insights() -> Dict[str, Any]:
    """
    Analyze patterns after 50+ questions.
    Returns insights about model performance, technique effectiveness, etc.
    """
    patterns = get_feedback_patterns()

    insights = {
        "model_performance": {},
        "patterns": [],
        "recommendations": []
    }

    # Calculate success rates by model
    for model, ratings in patterns.items():
        total = sum(ratings.values())
        if total > 0:
            good_pct = (ratings.get("good", 0) / total) * 100
            insights["model_performance"][model] = {
                "total_questions": total,
                "success_rate": round(good_pct, 1)
            }

    # Simple patterns
    if insights["model_performance"]:
        best_model = max(
            insights["model_performance"].items(),
            key=lambda x: x[1]["success_rate"]
        )
        insights["patterns"].append(
            f"Best performing model: {best_model[0]} with {best_model[1]['success_rate']}% success rate"
        )

        worst_model = min(
            insights["model_performance"].items(),
            key=lambda x: x[1]["success_rate"]
        )
        insights["recommendations"].append(
            f"Consider using {best_model[0]} more often for better results"
        )

    return insights
