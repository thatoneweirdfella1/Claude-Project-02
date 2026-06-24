import uuid
from typing import Dict, List, Any
from .decision_tree import analyze_question_dimensions, decide_model
from .adhd_state import detect_adhd_state

def route(translated_questions: List[str]) -> Dict[str, Any]:
    """
    Route translated questions to appropriate models.
    Returns: {
        "routings": [
            {
                "id": str,
                "question_text": str,
                "routed_model": str,
                "reasoning": str,
                "confidence": int,
                "dimensions": Dict
            }
        ]
    }
    """
    routings = []

    for question_text in translated_questions:
        # Analyze dimensions
        dimensions = analyze_question_dimensions(question_text)

        # Decide model
        model, reasoning, confidence = decide_model(dimensions)

        # Phase 2B: detect the user's ADHD cognitive/emotional state and derive
        # response directives (independent of which model handles the question).
        adhd = detect_adhd_state(question_text)

        routings.append({
            "id": str(uuid.uuid4()),
            "question_text": question_text,
            "routed_model": model,
            "reasoning": reasoning,
            "confidence": confidence,
            "dimensions": {
                "complexity": dimensions["complexity"],
                "domain": dimensions["domain"],
                "scope": dimensions["scope"],
                "certainty": dimensions["certainty"],
                "time_sensitivity": dimensions["time_sensitivity"],
                "depth_requirement": dimensions["depth_requirement"],
            },
            "adhd_state": adhd["state"],
            "directives": adhd["directives"],
        })

    return {
        "routings": routings
    }
