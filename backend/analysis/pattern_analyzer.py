"""Pattern analyzer for learning system."""

from typing import List, Dict, Any
from services.database_service import db_service
from core.constants import LEARNING_TRIGGER_THRESHOLD
from core.logger import get_logger

logger = get_logger(__name__)


class PatternAnalyzer:
    """Detects patterns from interaction history."""

    @staticmethod
    def analyze_routing_patterns(user_id: str) -> List[Dict[str, Any]]:
        """Analyze routing decisions and outcomes."""
        interactions = db_service.get_recent_interactions(user_id, limit=100)

        if len(interactions) < LEARNING_TRIGGER_THRESHOLD:
            logger.info(f"Not enough interactions for pattern analysis: {len(interactions)}")
            return []

        patterns = []

        # Analyze by model tier
        model_outcomes = {}
        for interaction in interactions:
            model = interaction.get("routed_model")
            rating = interaction.get("user_rating", 3)

            if model not in model_outcomes:
                model_outcomes[model] = {"sum_rating": 0, "count": 0}

            model_outcomes[model]["sum_rating"] += rating
            model_outcomes[model]["count"] += 1

        # Find best-performing model
        for model, outcomes in model_outcomes.items():
            avg_rating = outcomes["sum_rating"] / outcomes["count"]
            patterns.append(
                {
                    "pattern_type": "routing",
                    "dimension": f"model_{model}",
                    "finding": f"Average rating: {avg_rating:.2f}/5 ({outcomes['count']} samples)",
                    "confidence": min(1.0, outcomes["count"] / 30.0),
                }
            )

        logger.info(f"Found {len(patterns)} routing patterns")
        return patterns

    @staticmethod
    def analyze_technique_patterns(user_id: str) -> List[Dict[str, Any]]:
        """Analyze technique effectiveness."""
        interactions = db_service.get_recent_interactions(user_id, limit=100)

        if len(interactions) < LEARNING_TRIGGER_THRESHOLD:
            return []

        patterns = []
        technique_outcomes = {}

        for interaction in interactions:
            techniques_str = interaction.get("selected_techniques", "[]")
            rating = interaction.get("user_rating", 3)

            # Parse techniques (they're stored as JSON)
            import json
            try:
                techniques = json.loads(techniques_str) if isinstance(techniques_str, str) else []
            except:
                techniques = []

            for tech in techniques:
                tech_id = tech if isinstance(tech, str) else tech.get("id")
                if tech_id not in technique_outcomes:
                    technique_outcomes[tech_id] = {"sum_rating": 0, "count": 0}

                technique_outcomes[tech_id]["sum_rating"] += rating
                technique_outcomes[tech_id]["count"] += 1

        # Find effective techniques
        for tech_id, outcomes in technique_outcomes.items():
            avg_rating = outcomes["sum_rating"] / outcomes["count"]
            patterns.append(
                {
                    "pattern_type": "technique",
                    "dimension": tech_id,
                    "finding": f"Average rating: {avg_rating:.2f}/5 ({outcomes['count']} uses)",
                    "confidence": min(1.0, outcomes["count"] / 20.0),
                }
            )

        logger.info(f"Found {len(patterns)} technique patterns")
        return patterns

    @staticmethod
    def analyze_gap_patterns(user_id: str) -> List[Dict[str, Any]]:
        """Analyze gap category distributions."""
        interactions = db_service.get_recent_interactions(user_id, limit=100)

        if len(interactions) < LEARNING_TRIGGER_THRESHOLD:
            return []

        patterns = []
        gap_outcomes = {}

        for interaction in interactions:
            gap = interaction.get("gap_category", "unknown")
            rating = interaction.get("user_rating", 3)

            if gap not in gap_outcomes:
                gap_outcomes[gap] = {"sum_rating": 0, "count": 0}

            gap_outcomes[gap]["sum_rating"] += rating
            gap_outcomes[gap]["count"] += 1

        # Find most common gaps
        for gap, outcomes in gap_outcomes.items():
            avg_rating = outcomes["sum_rating"] / outcomes["count"]
            patterns.append(
                {
                    "pattern_type": "gap_category",
                    "dimension": gap,
                    "finding": f"Frequency: {outcomes['count']}, avg rating: {avg_rating:.2f}/5",
                    "confidence": min(1.0, outcomes["count"] / 30.0),
                }
            )

        logger.info(f"Found {len(patterns)} gap patterns")
        return patterns

    @staticmethod
    def analyze_all(user_id: str) -> List[Dict[str, Any]]:
        """Run all pattern analyses."""
        patterns = []
        patterns.extend(PatternAnalyzer.analyze_routing_patterns(user_id))
        patterns.extend(PatternAnalyzer.analyze_technique_patterns(user_id))
        patterns.extend(PatternAnalyzer.analyze_gap_patterns(user_id))

        logger.info(f"Total patterns discovered: {len(patterns)}")
        return patterns
