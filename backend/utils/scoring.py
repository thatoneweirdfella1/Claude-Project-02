"""Scoring utilities for confidence and technique scoring."""

from typing import Dict, List
from models.enums import ModelTier, TechniqueID
from core.constants import (
    TECHNIQUE_THRESHOLD,
    ROUTING_CONFIDENCE_WEIGHTS,
    TECHNIQUES_METADATA,
)


def calculate_translation_confidence(
    operations_applied: List[str],
    quality_scores: Dict[str, float],
    gap_clarity: float,
) -> float:
    """Calculate translation confidence score (0-100)."""
    if not operations_applied:
        return 50.0

    # Average quality of applied operations
    operation_quality = sum(quality_scores.values()) / len(quality_scores)

    # Weight by number of operations and gap clarity
    operation_penalty = max(0, (len(operations_applied) - 1) * 5)
    confidence = (operation_quality * 0.5 + gap_clarity * 0.5) * 100
    confidence = max(0, min(100, confidence - operation_penalty))

    return confidence


def calculate_routing_confidence(
    dimensions: Dict[str, float],
    rules_matched: List[int],
) -> float:
    """Calculate routing confidence (0-100) based on dimensions and rules."""
    if not rules_matched:
        return 50.0

    # Base confidence from first matched rule
    base_confidence = 70.0

    # Adjust based on dimension clarity
    complexity = dimensions.get("complexity", 5) / 10.0
    certainty = dimensions.get("certainty", 5) / 10.0
    novelty = dimensions.get("novelty", 5) / 10.0

    # Clear questions (high certainty) increase confidence
    clarity_score = certainty * 20  # Up to +20
    # High novelty decreases confidence
    novelty_penalty = novelty * 15  # Up to -15

    confidence = base_confidence + clarity_score - novelty_penalty
    confidence = max(0, min(100, confidence))

    return confidence


def calculate_technique_score(
    question_metadata: Dict[str, float],
    technique_id: TechniqueID,
) -> float:
    """Calculate technique score (0-15) for whether to apply it."""
    if technique_id.value not in TECHNIQUES_METADATA:
        return 0.0

    tech = TECHNIQUES_METADATA[technique_id.value]

    # Get question type effectiveness
    question_type = question_metadata.get("question_type")
    effectiveness = tech.get("question_type_effectiveness", {}).get(question_type, 0.5)

    # Get model compatibility
    model = question_metadata.get("model")
    compatibility = tech.get("model_compatibility", {}).get(model, 0.5)

    # Base relevance: does this technique apply to this question type?
    relevance = effectiveness * 10

    # Impact: how much would this help?
    impact = compatibility * 4

    # Synergy bonus: are other selected techniques compatible?
    synergy = 1.0  # Default (handled by composition stage)

    score = (relevance + impact) * synergy
    score = max(0, min(15, score))

    return score


def score_all_techniques(
    question_metadata: Dict[str, float],
) -> Dict[str, float]:
    """Score all 18 techniques for a given question."""
    scores = {}
    for tech_id in TECHNIQUES_METADATA.keys():
        try:
            tech_enum = TechniqueID(tech_id)
            scores[tech_id] = calculate_technique_score(question_metadata, tech_enum)
        except ValueError:
            scores[tech_id] = 0.0

    return scores


def filter_techniques_by_threshold(
    technique_scores: Dict[str, float],
    threshold: float = TECHNIQUE_THRESHOLD,
) -> List[str]:
    """Filter techniques that meet the threshold."""
    return [
        tech_id
        for tech_id, score in technique_scores.items()
        if score >= threshold
    ]


def estimate_token_overhead(
    selected_techniques: List[str],
    model_tier: ModelTier = ModelTier.OPUS_FAST,
) -> int:
    """Estimate token overhead from selected techniques."""
    total_tokens = 0

    for tech_id in selected_techniques:
        if tech_id in TECHNIQUES_METADATA:
            tech = TECHNIQUES_METADATA[tech_id]
            total_tokens += tech.get("token_cost", 0)

    # Apply model multiplier (Thinking uses more tokens)
    if model_tier == ModelTier.OPUS_THINKING:
        total_tokens = int(total_tokens * 1.2)

    return total_tokens
