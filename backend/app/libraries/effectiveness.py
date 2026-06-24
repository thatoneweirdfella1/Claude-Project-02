"""
Effectiveness matrices: technique × question type, model × question type.
Scores 0-100 indicating how effective each combination is.
"""

# Technique effectiveness by question domain
TECHNIQUE_EFFECTIVENESS_BY_DOMAIN = {
    "chain_of_thought": {
        "factual": 60,
        "analytical": 95,
        "creative": 70,
        "comparative": 85,
        "exploratory": 90,
        "decision_making": 88,
    },
    "quote_first": {
        "factual": 90,
        "analytical": 85,
        "creative": 50,
        "comparative": 80,
        "exploratory": 60,
        "decision_making": 70,
    },
    "permission_to_say_no": {
        "factual": 85,
        "analytical": 80,
        "creative": 70,
        "comparative": 75,
        "exploratory": 85,
        "decision_making": 75,
    },
    "self_verification": {
        "factual": 80,
        "analytical": 90,
        "creative": 65,
        "comparative": 85,
        "exploratory": 75,
        "decision_making": 80,
    },
    "role_priming": {
        "factual": 75,
        "analytical": 85,
        "creative": 80,
        "comparative": 70,
        "exploratory": 70,
        "decision_making": 75,
    },
    "structured_output": {
        "factual": 70,
        "analytical": 80,
        "creative": 75,
        "comparative": 95,
        "exploratory": 60,
        "decision_making": 80,
    },
    "scope_constraint": {
        "factual": 85,
        "analytical": 80,
        "creative": 70,
        "comparative": 75,
        "exploratory": 90,
        "decision_making": 85,
    },
    "few_shot": {
        "factual": 75,
        "analytical": 70,
        "creative": 85,
        "comparative": 80,
        "exploratory": 60,
        "decision_making": 75,
    },
    "contrarian": {
        "factual": 50,
        "analytical": 80,
        "creative": 70,
        "comparative": 85,
        "exploratory": 95,
        "decision_making": 70,
    },
    "instruction_hierarchy": {
        "factual": 80,
        "analytical": 85,
        "creative": 75,
        "comparative": 80,
        "exploratory": 70,
        "decision_making": 90,
    },
    "direct_answer": {
        "factual": 85,
        "analytical": 70,
        "creative": 65,
        "comparative": 75,
        "exploratory": 60,
        "decision_making": 85,
    },
    "context_setting": {
        "factual": 75,
        "analytical": 80,
        "creative": 70,
        "comparative": 75,
        "exploratory": 85,
        "decision_making": 70,
    },
    "clarification": {
        "factual": 70,
        "analytical": 85,
        "creative": 60,
        "comparative": 80,
        "exploratory": 90,
        "decision_making": 85,
    },
    "trade_offs": {
        "factual": 60,
        "analytical": 85,
        "creative": 70,
        "comparative": 90,
        "exploratory": 80,
        "decision_making": 95,
    },
    "analogies": {
        "factual": 70,
        "analytical": 75,
        "creative": 80,
        "comparative": 70,
        "exploratory": 85,
        "decision_making": 70,
    },
}

# Model effectiveness by question domain
MODEL_EFFECTIVENESS_BY_DOMAIN = {
    "haiku": {
        "factual": 85,
        "analytical": 60,
        "creative": 50,
        "comparative": 70,
        "exploratory": 40,
        "decision_making": 55,
    },
    "opus-fast": {
        "factual": 90,
        "analytical": 85,
        "creative": 75,
        "comparative": 85,
        "exploratory": 70,
        "decision_making": 80,
    },
    "opus-thinking": {
        "factual": 85,
        "analytical": 95,
        "creative": 85,
        "comparative": 80,
        "exploratory": 95,
        "decision_making": 90,
    },
}

# Model effectiveness by complexity
MODEL_EFFECTIVENESS_BY_COMPLEXITY = {
    "haiku": [90, 85, 80, 70, 60, 50, 40, 30, 20, 10],  # 1-10 complexity
    "opus-fast": [95, 95, 90, 90, 85, 85, 80, 75, 70, 65],
    "opus-thinking": [80, 80, 85, 90, 92, 94, 95, 96, 96, 96],
}

def get_technique_effectiveness(technique_id: str, domain: str) -> int:
    """Get effectiveness score (0-100) for a technique in a domain."""
    if technique_id not in TECHNIQUE_EFFECTIVENESS_BY_DOMAIN:
        return 70  # Default
    domain_scores = TECHNIQUE_EFFECTIVENESS_BY_DOMAIN[technique_id]
    return domain_scores.get(domain, 70)

def get_model_effectiveness(model: str, domain: str) -> int:
    """Get effectiveness score (0-100) for a model in a domain."""
    if model not in MODEL_EFFECTIVENESS_BY_DOMAIN:
        return 75  # Default
    domain_scores = MODEL_EFFECTIVENESS_BY_DOMAIN[model]
    return domain_scores.get(domain, 75)

def get_model_effectiveness_by_complexity(model: str, complexity: int) -> int:
    """Get effectiveness score (0-100) for a model at given complexity level."""
    if model not in MODEL_EFFECTIVENESS_BY_COMPLEXITY:
        return 75  # Default
    scores = MODEL_EFFECTIVENESS_BY_COMPLEXITY[model]
    # Clamp complexity to 1-10
    idx = max(0, min(9, complexity - 1))
    return scores[idx]

def rank_techniques_by_domain(domain: str) -> list:
    """Rank techniques by effectiveness in a domain."""
    scores = []
    for technique_id, effectiveness in TECHNIQUE_EFFECTIVENESS_BY_DOMAIN.items():
        score = effectiveness.get(domain, 70)
        scores.append((technique_id, score))
    return sorted(scores, key=lambda x: x[1], reverse=True)

def rank_models_by_domain(domain: str) -> list:
    """Rank models by effectiveness in a domain."""
    scores = []
    for model, effectiveness in MODEL_EFFECTIVENESS_BY_DOMAIN.items():
        score = effectiveness.get(domain, 75)
        scores.append((model, score))
    return sorted(scores, key=lambda x: x[1], reverse=True)
