"""Stage 4: Composition Engine - builds final prompt for model."""

from typing import List
from models.enums import ModelTier
from models.schemas import CompositionInput, CompositionOutput, Technique
from libraries.prompts import get_template
from utils.validators import CompositionValidator
from core.logger import get_logger

logger = get_logger(__name__)


class CompositionEngine:
    """Composes final prompt from translated question, techniques, and template."""

    TECHNIQUE_INJECTIONS = {
        "T01": " You have permission to say 'I don't know' if you're uncertain.",
        "T02": " Think through this step by step before answering.",
        "T03": " Please quote relevant sources before providing your answer.",
        "T04": " After answering, check your work for consistency.",
        "T05": " Answer as an expert prioritizing accuracy over helpfulness.",
        "T06": " Ground your answer in external knowledge and cite sources.",
        "T07": " Follow the format and style of the examples provided.",
        "T08": " Prioritize the following instructions in order of importance: [core question > constraints > details].",
        "T09": " Important constraints: avoid speculation, maintain scope, don't assume prior knowledge.",
        "T10": " Please structure your response as: [reasoning] → [conclusion] → [key points].",
        "T11": " Break your reasoning into separate checkable parts.",
        "T12": " Consider alternative framings or perspectives on this question.",
        "T13": " First, surface the assumptions in this question, then answer it.",
        "T14": " Keep your scope focused on: [core question].",
        "T15": " Explain your approach and reasoning strategy for answering this.",
        "T16": " Number each step of your reasoning.",
        "T17": " Rate your confidence in each statement from 0-100%.",
        "T18": " Flag any point where you violate the stated constraints.",
    }

    @staticmethod
    def build_role_prime(question_type: str) -> str:
        """Build role-priming based on question type."""
        role_primes = {
            "factual": "You are a fact-checker focused on accuracy and citations.",
            "analytical": "You are an analytical thinker breaking problems into components.",
            "creative": "You are a creative ideator generating novel perspectives.",
            "code": "You are an expert programmer writing production-quality code.",
            "health": "You are a medical professional prioritizing accuracy and evidence.",
            "decision": "You are a decision analyst weighing options systematically.",
        }
        return role_primes.get(question_type, "You are a helpful, accurate assistant.")

    @classmethod
    def compose(cls, input_data: CompositionInput) -> CompositionOutput:
        """Main composition pipeline."""
        # Select template
        template = get_template("task_utility", "workflow", input_data.routed_model)

        # Build base prompt with role if appropriate
        should_have_role = len(input_data.selected_techniques) > 0
        if should_have_role:
            role = cls.build_role_prime(input_data.routed_model.value)
            base_prompt = f"{role}\n\n{template}"
        else:
            base_prompt = template

        # Insert question
        prompt = base_prompt.replace("{question}", input_data.translated_question)

        # Inject techniques in order
        techniques_section = []
        for technique in input_data.selected_techniques:
            tech_id = technique.id.value if hasattr(technique.id, "value") else str(technique.id)
            injection = cls.TECHNIQUE_INJECTIONS.get(tech_id, "")
            if injection:
                techniques_section.append(injection)

        if techniques_section:
            prompt += "\n\nTechniques to apply:\n" + "".join(techniques_section)

        # Add output format spec
        prompt += "\n\nProvide a clear, well-structured response."

        # Count tokens (rough estimate: 1 token ≈ 4 characters)
        prompt_tokens = len(prompt) // 4

        # Validate prompt (8 checks)
        is_valid, validation_errors = CompositionValidator.validate_prompt(
            prompt,
            input_data.routed_model,
            [t.id.value if hasattr(t.id, "value") else str(t.id) for t in input_data.selected_techniques],
            scope="medium",
            should_have_role=should_have_role,
        )

        logger.info(
            f"Composed prompt: {prompt_tokens} tokens, valid={is_valid}, errors={len(validation_errors)}"
        )

        return CompositionOutput(
            final_prompt=prompt,
            prompt_tokens=prompt_tokens,
            validation_passed=is_valid,
            validation_errors=validation_errors,
            metadata={
                "template_used": "task_utility/workflow",
                "model_tier": input_data.routed_model.value,
                "techniques_injected": len(input_data.selected_techniques),
                "role_primed": should_have_role,
            },
        )


# Service wrapper
class CompositionService:
    """Service wrapper for composition stage."""

    def __init__(self):
        self.engine = CompositionEngine()

    def compose(self, input_data: CompositionInput) -> CompositionOutput:
        """Compose final prompt."""
        return self.engine.compose(input_data)
