"""Stage 3: Technique Selection - selects and orders 18 techniques."""

from typing import Dict, List
from models.enums import ModelTier, TechniqueID, QuestionType
from models.schemas import TechniqueInput, TechniqueOutput, Technique
from core.constants import (
    TECHNIQUES_METADATA,
    TECHNIQUE_THRESHOLD,
    TECHNIQUE_CANONICAL_ORDER,
    MAX_TECHNIQUES,
    TOKEN_BUDGET,
)
from utils.scoring import calculate_technique_score, score_all_techniques, estimate_token_overhead
from utils.conflict_checker import ConflictChecker
from core.logger import get_logger

logger = get_logger(__name__)


class TechniqueSelectionEngine:
    """Selects and orders techniques based on question characteristics."""

    @classmethod
    def score_techniques(
        cls,
        question_text: str,
        routed_model: ModelTier,
        question_type: QuestionType,
    ) -> Dict[str, float]:
        """Score all 18 techniques for this question."""
        metadata = {
            "question_type": question_type,
            "model": routed_model,
            "length": len(question_text.split()),
        }

        scores = score_all_techniques(metadata)
        logger.info(f"Scored {len(scores)} techniques")

        return scores

    @classmethod
    def select_techniques(
        cls,
        technique_scores: Dict[str, float],
        routed_model: ModelTier,
        threshold: float = TECHNIQUE_THRESHOLD,
    ) -> List[str]:
        """Select techniques meeting threshold."""
        # Filter by threshold
        selected = [
            tech_id
            for tech_id, score in technique_scores.items()
            if score >= threshold
        ]

        # Respect max techniques per model
        max_count = MAX_TECHNIQUES.get(routed_model, 6)
        if len(selected) > max_count:
            # Sort by score and take top N
            selected = sorted(
                selected,
                key=lambda t: technique_scores.get(t, 0),
                reverse=True,
            )[:max_count]

        logger.info(f"Selected {len(selected)} techniques for {routed_model.value}")
        return selected

    @classmethod
    def check_and_resolve_conflicts(
        cls,
        techniques: List[str],
    ) -> tuple:
        """Check for conflicts and resolve dependencies."""
        # Check conflicts
        conflicts = []
        for tech1, tech2 in zip(techniques, techniques[1:]):
            if (tech1, tech2) in [("T14", "T15"), ("T15", "T14")]:
                conflicts.append(f"Conflict: {tech1} and {tech2}")
                # Remove the lower-priority one
                if techniques.count(tech1) < techniques.count(tech2):
                    techniques.remove(tech1)
                else:
                    techniques.remove(tech2)

        # Resolve dependencies
        resolved = ConflictChecker.resolve_dependencies(techniques)
        return resolved, conflicts

    @classmethod
    def order_techniques(
        cls,
        techniques: List[str],
    ) -> List[Technique]:
        """Order techniques by canonical order and dependencies."""
        # Create order map
        order_map = {tech: idx for idx, tech in enumerate(TECHNIQUE_CANONICAL_ORDER)}

        # Sort by canonical order
        ordered = sorted(
            techniques,
            key=lambda t: order_map.get(t, 999),
        )

        # Build Technique objects with injection points
        result = []
        for idx, tech_id in enumerate(ordered):
            if tech_id in TECHNIQUES_METADATA:
                tech_meta = TECHNIQUES_METADATA[tech_id]
                result.append(
                    Technique(
                        id=TechniqueID(tech_id),
                        name=tech_meta["name"],
                        score=10.0,  # Will be updated with actual score
                        injection_point=order_map.get(tech_id, 999),
                    )
                )

        return result

    @classmethod
    def select(cls, input_data: TechniqueInput) -> TechniqueOutput:
        """Main technique selection pipeline."""
        # Score all techniques
        technique_scores = cls.score_techniques(
            input_data.translated_question,
            input_data.routed_model,
            input_data.question_type,
        )

        # Select by threshold
        selected_techniques = cls.select_techniques(
            technique_scores,
            input_data.routed_model,
        )

        # Check and resolve conflicts
        selected_techniques, conflicts = cls.check_and_resolve_conflicts(selected_techniques)

        # Get synergies
        from utils.conflict_checker import ConflictChecker
        synergies = ConflictChecker.get_synergies(selected_techniques)

        # Order by canonical order
        ordered_techniques = cls.order_techniques(selected_techniques)

        # Update scores in Technique objects
        for tech in ordered_techniques:
            score_key = tech.id.value if isinstance(tech.id, TechniqueID) else str(tech.id)
            tech.score = technique_scores.get(score_key, 0.0)

        # Estimate token overhead
        token_overhead = estimate_token_overhead(
            [t.id.value for t in ordered_techniques],
            input_data.routed_model,
        )

        # Check token budget
        budget = TOKEN_BUDGET.get(input_data.routed_model, 800)
        if token_overhead > budget:
            logger.warning(f"Token overhead {token_overhead} exceeds budget {budget}")
            # Remove lowest-scoring techniques until within budget
            while token_overhead > budget and ordered_techniques:
                ordered_techniques.pop()
                token_overhead = estimate_token_overhead(
                    [t.id.value for t in ordered_techniques],
                    input_data.routed_model,
                )

        return TechniqueOutput(
            selected_techniques=ordered_techniques,
            technique_scores=technique_scores,
            total_token_overhead=token_overhead,
            conflicts_detected=conflicts,
            synergies_used=synergies,
            metadata={
                "num_techniques": len(ordered_techniques),
                "token_budget": budget,
                "token_remaining": budget - token_overhead,
            },
        )


# Service wrapper
class TechniqueSelectionService:
    """Service wrapper for technique selection stage."""

    def __init__(self):
        self.engine = TechniqueSelectionEngine()

    def select(self, input_data: TechniqueInput) -> TechniqueOutput:
        """Select techniques for this question."""
        return self.engine.select(input_data)
