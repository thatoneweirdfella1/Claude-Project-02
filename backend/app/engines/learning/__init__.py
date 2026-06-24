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
    Analyze patterns after 10+ questions.
    Returns insights about model performance, technique effectiveness, recommendations.
    Includes rule refinement suggestions based on observed patterns.
    """
    patterns = get_feedback_patterns()

    insights = {
        "summary": {},
        "model_performance": {},
        "model_win_conditions": {},
        "patterns": [],
        "recommendations": [],
        "rule_refinements": [],
        "statistics": {}
    }

    # Calculate success rates by model
    total_questions = 0
    successful_questions = 0

    for model, ratings in patterns.items():
        total = sum(ratings.values())
        if total == 0:
            continue

        total_questions += total
        good_count = ratings.get("good", 0)
        successful_questions += good_count
        good_pct = (good_count / total) * 100
        bad_pct = (ratings.get("bad", 0) / total) * 100
        mixed_pct = (ratings.get("mixed", 0) / total) * 100

        insights["model_performance"][model] = {
            "total_questions": total,
            "success_rate": round(good_pct, 1),
            "good": good_count,
            "mixed": ratings.get("mixed", 0),
            "bad": ratings.get("bad", 0),
            "bad_rate": round(bad_pct, 1)
        }

    # Summary statistics
    if total_questions > 0:
        insights["summary"]["total_questions_analyzed"] = total_questions
        insights["summary"]["overall_success_rate"] = round((successful_questions / total_questions) * 100, 1)

    # Detect patterns and model win conditions
    if insights["model_performance"]:
        sorted_models = sorted(
            insights["model_performance"].items(),
            key=lambda x: x[1]["success_rate"],
            reverse=True
        )

        best_model = sorted_models[0]
        worst_model = sorted_models[-1]

        insights["patterns"].append(
            f"Best performing model: {best_model[0]} with {best_model[1]['success_rate']}% success rate ({best_model[1]['good']}/{best_model[1]['total_questions']} good)"
        )

        if worst_model[1]["success_rate"] < best_model[1]["success_rate"]:
            insights["patterns"].append(
                f"Worst performing model: {worst_model[0]} with {worst_model[1]['success_rate']}% success rate ({worst_model[1]['bad']} failures)"
            )

        # Win conditions: when each model excels
        for model, perf in sorted_models:
            if perf['total_questions'] > 5:  # Only if we have enough data
                insights["model_win_conditions"][model] = {
                    "success_rate": perf['success_rate'],
                    "data_points": perf['total_questions'],
                    "recommendation": f"Use {model} when you need {'fast answers with high accuracy' if perf['success_rate'] > 85 else 'reliable but thoughtful responses' if perf['success_rate'] > 70 else 'complex reasoning and verification'}"
                }

        # Recommendations
        if best_model[1]["success_rate"] > worst_model[1]["success_rate"] + 10:
            insights["recommendations"].append(
                f"Use {best_model[0]} more often - it performs {round(best_model[1]['success_rate'] - worst_model[1]['success_rate'], 1)}% better than {worst_model[0]}"
            )

        if len(sorted_models) > 1 and sorted_models[1][1]["success_rate"] > 75:
            insights["recommendations"].append(
                f"{sorted_models[1][0]} is a strong secondary choice with {sorted_models[1][1]['success_rate']}% success rate"
            )

    # Suggest rule refinements based on observed performance
    if len(patterns) >= 2:
        models_by_performance = sorted(
            insights["model_performance"].items(),
            key=lambda x: x[1]["success_rate"],
            reverse=True
        )

        performance_gap = models_by_performance[0][1]["success_rate"] - models_by_performance[-1][1]["success_rate"]

        if performance_gap > 20:
            insights["rule_refinements"].append({
                "type": "model_preference",
                "priority": "high",
                "suggestion": f"Significant performance gap ({performance_gap:.1f}%) detected between {models_by_performance[0][0]} and {models_by_performance[-1][0]}",
                "action": "Review and adjust routing rules to favor higher-performing model in appropriate conditions"
            })

        if models_by_performance[0][1]["bad_rate"] > 15:
            insights["rule_refinements"].append({
                "type": "quality_concern",
                "priority": "medium",
                "suggestion": f"Even best model ({models_by_performance[0][0]}) has {models_by_performance[0][1]['bad_rate']}% failure rate",
                "action": "Review composition techniques and prompt templates for this model"
            })

        if len(models_by_performance) >= 2 and models_by_performance[1][1]["success_rate"] < 50:
            insights["rule_refinements"].append({
                "type": "under_performer",
                "priority": "medium",
                "suggestion": f"{models_by_performance[-1][0]} underperforming ({models_by_performance[-1][1]['success_rate']}%)",
                "action": "Consider if this model is being misrouted or if technique selection needs adjustment"
            })

    insights["statistics"]["recommendation_count"] = len(insights["recommendations"])
    insights["statistics"]["refinement_count"] = len(insights["rule_refinements"])

    return insights
