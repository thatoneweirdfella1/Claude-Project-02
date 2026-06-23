"""Stage 2: Routing Engine - routes to Haiku, Opus-Fast, or Opus-Thinking."""

from typing import Dict, List, Any
from models.enums import ModelTier, QuestionType
from models.schemas import RoutingInput, RoutingOutput, RoutingDimensions
from core.constants import ROUTING_RULES
from utils.scoring import calculate_routing_confidence
from core.logger import get_logger

logger = get_logger(__name__)


class RoutingEngine:
    """Routes questions to the appropriate model tier."""

    @staticmethod
    def analyze_dimensions(
        question_text: str,
        metadata: Dict[str, Any],
    ) -> RoutingDimensions:
        """Analyze question on 6 dimensions."""
        # These are heuristic scores - in production would use Claude to score

        # Complexity: 1-10 scale
        complexity = min(10, max(1, len(question_text.split()) // 3))

        # Domain: classify by keywords
        question_lower = question_text.lower()
        if "code" in question_lower or "program" in question_lower:
            domain = QuestionType.CODE
        elif "product" in question_lower or "review" in question_lower:
            domain = QuestionType.PRODUCT_RESEARCH
        elif "health" in question_lower or "medical" in question_lower:
            domain = QuestionType.HEALTH_MEDICAL
        elif "decision" in question_lower or "choose" in question_lower:
            domain = QuestionType.DECISION_MAKING
        elif "creative" in question_lower or "write" in question_lower:
            domain = QuestionType.CREATIVE
        elif "analyze" in question_lower or "why" in question_lower:
            domain = QuestionType.ANALYTICAL
        else:
            domain = QuestionType.FACTUAL

        # Scope: narrow (specific), medium (general), broad (open-ended)
        if "specifically" in question_lower or "just" in question_lower:
            scope = "narrow"
        elif "overall" in question_lower or "big picture" in question_lower:
            scope = "broad"
        else:
            scope = "medium"

        # Novelty: 0-10, how novel/unfamiliar is this domain?
        novelty = min(10, complexity // 2)

        # Certainty: 0-10, is there a clear right answer?
        has_certainty = any(
            phrase in question_lower
            for phrase in ["is", "are", "true", "false", "best", "correct"]
        )
        certainty = 8 if has_certainty else 3

        # Depth: 0-10, how deep of analysis is needed?
        depth = min(10, max(1, len(question_text.split()) // 2))

        return RoutingDimensions(
            complexity=complexity,
            domain=domain,
            scope=scope,
            novelty=novelty,
            certainty=certainty,
            depth=depth,
        )

    @staticmethod
    def calculate_consequence_score(metadata: Dict[str, Any]) -> int:
        """Calculate consequence of error (0-5 scale)."""
        consequence = 0
        question_lower = str(metadata.get("question", "")).lower()

        # Health/medical = high consequence
        if "health" in question_lower or "medical" in question_lower:
            consequence = 5
        # Legal/financial = high consequence
        elif "legal" in question_lower or "financial" in question_lower or "money" in question_lower:
            consequence = 4
        # Code = moderate consequence
        elif "code" in question_lower or "program" in question_lower:
            consequence = 3
        # Creative = low consequence
        else:
            consequence = 1

        return consequence

    @classmethod
    def route(cls, input_data: RoutingInput) -> RoutingOutput:
        """Main routing logic."""
        question_text = input_data.translated_questions[0] if input_data.translated_questions else ""

        # Check for user override
        if input_data.user_override:
            logger.info(f"User override: routing to {input_data.user_override}")
            return RoutingOutput(
                routed_model=input_data.user_override,
                confidence=100.0,
                reasoning="User override",
                dimensions=cls.analyze_dimensions(question_text, input_data.question_metadata),
                consequence_score=cls.calculate_consequence_score(input_data.question_metadata),
            )

        # Analyze dimensions
        dimensions = cls.analyze_dimensions(question_text, input_data.question_metadata)
        consequence_score = cls.calculate_consequence_score(input_data.question_metadata)

        # Build metadata dict for rule matching
        rule_metadata = {
            "complexity": dimensions.complexity,
            "question_type": dimensions.domain,
            "scope": dimensions.scope,
            "novelty": dimensions.novelty,
            "certainty": dimensions.certainty,
            "depth": dimensions.depth,
            "consequence_score": consequence_score,
            "user_override": None,
        }

        # Evaluate routing rules in order
        matched_rules = []
        routed_model = ModelTier.OPUS_FAST  # Default fallback
        best_confidence = 0.0

        for rule in ROUTING_RULES:
            try:
                if rule["condition"](rule_metadata):
                    matched_rules.append(rule["id"])

                    # Get model from rule
                    model = rule.get("model")
                    if callable(model):
                        model = model(rule_metadata)

                    rule_confidence = rule.get("confidence", 50.0)

                    if rule_confidence > best_confidence:
                        routed_model = model
                        best_confidence = rule_confidence
                        logger.info(f"Rule {rule['id']} ({rule['name']}) matched with confidence {rule_confidence}")

                        # Stop at first high-confidence match
                        if rule_confidence >= 80:
                            break
            except Exception as e:
                logger.warning(f"Error evaluating rule {rule['id']}: {e}")
                continue

        # Calculate final routing confidence
        routing_confidence = calculate_routing_confidence(
            {
                "complexity": dimensions.complexity,
                "certainty": dimensions.certainty,
                "novelty": dimensions.novelty,
            },
            matched_rules,
        )

        # Build reasoning
        reasoning = f"Routed based on: complexity={dimensions.complexity}, domain={dimensions.domain.value}, scope={dimensions.scope}, consequence={consequence_score}"

        fallback_options = None
        if routing_confidence < 75:
            # Provide alternatives if confidence is low
            if routed_model != ModelTier.OPUS_THINKING:
                fallback_options = [ModelTier.OPUS_THINKING]
            elif routed_model != ModelTier.OPUS_FAST:
                fallback_options = [ModelTier.OPUS_FAST]

        return RoutingOutput(
            routed_model=routed_model,
            confidence=routing_confidence,
            reasoning=reasoning,
            dimensions=dimensions,
            consequence_score=consequence_score,
            fallback_options=fallback_options,
        )


# Service wrapper
class RoutingService:
    """Service wrapper for routing stage."""

    def __init__(self):
        self.engine = RoutingEngine()

    def route(self, input_data: RoutingInput) -> RoutingOutput:
        """Route to appropriate model."""
        return self.engine.route(input_data)
