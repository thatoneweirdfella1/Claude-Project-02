"""Stage 1: Translation Engine - converts rambling input to clear questions."""

import re
from typing import List, Dict, Any, Tuple
from models.enums import GapCategory, TranslationOperation
from models.schemas import TranslationInput, TranslationOutput
from utils.scoring import calculate_translation_confidence
from core.logger import get_logger

logger = get_logger(__name__)


class TranslationEngine:
    """Translates ADHD-style rambling input into clear questions."""

    # Gap category detection patterns
    GAP_PATTERNS = {
        GapCategory.TANGENTIAL_PREAMBLE: {
            "keywords": ["so like", "anyway", "btw", "also", "by the way", "first"],
            "signal": "Long context before question",
        },
        GapCategory.EMOTIONAL_INTENSITY: {
            "keywords": ["fucking", "shit", "damn", "love", "hate", "omg", "!!!"],
            "signal": "Heavy emotional language",
        },
        GapCategory.COMPOUND_BURIED: {
            "keywords": ["also", "and", "plus", "additionally", "furthermore"],
            "signal": "Multiple separate questions",
        },
        GapCategory.TYPO_PRONOUN_WRAPPER: {
            "keywords": ["it", "this", "that", "them", "there"],
            "signal": "Unclear pronouns or references",
        },
    }

    @staticmethod
    def detect_gap_category(raw_input: str) -> Tuple[GapCategory, float]:
        """Detect which category of gap is present."""
        input_lower = raw_input.lower()
        scores = {}

        for category, pattern_info in TranslationEngine.GAP_PATTERNS.items():
            keyword_matches = sum(
                1 for keyword in pattern_info["keywords"]
                if keyword in input_lower
            )
            # Normalize by input length
            score = keyword_matches / max(1, len(input_lower.split()) / 10)
            scores[category] = score

        if not scores or max(scores.values()) == 0:
            return GapCategory.NONE, 0.0

        best_category = max(scores, key=scores.get)
        return best_category, min(1.0, scores[best_category] / 3.0)

    @staticmethod
    def extract_core_question(raw_input: str) -> Tuple[str, float]:
        """Operation 1: Extract the core question."""
        # Split by lines to find sentences with question marks or direct questions
        lines = raw_input.split("\n")

        # Find lines that look like questions
        questions = []
        for line in lines:
            line = line.strip()
            if "?" in line or any(
                line.lower().startswith(word)
                for word in ["can you", "help", "how", "what", "why", "when"]
            ):
                questions.append(line)

        if questions:
            # Use the most substantive question (longest)
            core = max(questions, key=len)
            confidence = min(1.0, len(questions) / 3.0)
            return core, confidence

        # Fallback: use last substantial sentence
        sentences = [s.strip() for s in re.split(r'[.!?]+', raw_input) if s.strip()]
        if sentences:
            return sentences[-1], 0.6

        return raw_input, 0.3

    @staticmethod
    def reorder_context(raw_input: str) -> Tuple[str, float]:
        """Operation 2: Reorder context to precede question."""
        # Split into likely context (first part) and question (last substantive part)
        lines = [l.strip() for l in raw_input.split("\n") if l.strip()]

        if len(lines) <= 1:
            return raw_input, 0.8

        # Find the question line
        question_idx = -1
        for i, line in enumerate(lines):
            if "?" in line or any(
                line.lower().startswith(word)
                for word in ["can you", "help", "how", "what", "why"]
            ):
                question_idx = i
                break

        if question_idx <= 0:
            return raw_input, 0.6

        # Reorder: context first, then question
        context = lines[:question_idx]
        question = lines[question_idx:]

        reordered = " ".join(context) + "\n\n" + " ".join(question)
        return reordered, 0.85

    @staticmethod
    def normalize_emotional_language(raw_input: str) -> Tuple[str, float]:
        """Operation 3: Normalize emotional language to technical language."""
        normalized = raw_input

        # Replace emotional intensifiers with neutral language
        replacements = {
            r"\bfucking\b": "really",
            r"\bshit\b": "problem",
            r"\bdam(n|mit)\b": "unfortunately",
            r"\bomg\b": "importantly",
            r"!!!+": ".",
            r"\bsucks?\b": "is problematic",
            r"\blove\b": "prefer",
            r"\bhate\b": "dislike",
            r"\bamazing\b": "notable",
            r"\bawesome\b": "good",
            r"\bstunning\b": "significant",
        }

        for pattern, replacement in replacements.items():
            normalized = re.sub(pattern, replacement, normalized, flags=re.IGNORECASE)

        # Check if significant changes were made
        if normalized == raw_input:
            return raw_input, 0.2

        return normalized, 0.9

    @staticmethod
    def clarify_scope(raw_input: str) -> Tuple[str, float]:
        """Operation 4: Make implicit scope explicit."""
        clarified = raw_input

        # Add scope clarification if missing
        if not any(
            phrase in clarified.lower()
            for phrase in ["specifically", "focus on", "just", "only", "including"]
        ):
            # This would normally be done with Claude API
            return clarified, 0.4

        return clarified, 0.8

    @staticmethod
    def surface_assumptions(raw_input: str) -> Tuple[str, float]:
        """Operation 5: Surface hidden assumptions."""
        assumptions = []

        # Detect common assumptions
        if "should" in raw_input.lower():
            assumptions.append("Assumes there's a 'correct' way")
        if "best" in raw_input.lower():
            assumptions.append("Assumes one 'best' solution exists")
        if any(
            pronoun in raw_input.lower()
            for pronoun in ["it", "this", "that"]
        ):
            assumptions.append("Assumes prior context is known")

        if assumptions:
            surface_text = f"\n\nAssumed context: {'; '.join(assumptions)}"
            return raw_input + surface_text, 0.75
        return raw_input, 0.3

    @staticmethod
    def decompose_compound(raw_input: str) -> Tuple[List[str], float]:
        """Operation 6: Decompose compound questions."""
        # Split by common conjunctions
        separators = r'(?:and|also|additionally|furthermore|plus|moreover|furthermore)[\s]+'

        parts = re.split(separators, raw_input, flags=re.IGNORECASE)
        parts = [p.strip() for p in parts if p.strip()]

        if len(parts) <= 1:
            return [raw_input], 0.3

        return parts, min(1.0, len(parts) / 4.0)

    @classmethod
    def translate(cls, input_data: TranslationInput) -> TranslationOutput:
        """Main translation pipeline."""
        raw_input = input_data.raw_input

        # Detect gap category
        gap_category, gap_score = cls.detect_gap_category(raw_input)
        logger.info(f"Detected gap category: {gap_category} (confidence: {gap_score:.2f})")

        # Apply operations based on gap category
        operations_applied = []
        quality_scores = {}
        output_text = raw_input

        # Always try to extract core question
        core_question, extract_score = cls.extract_core_question(raw_input)
        operations_applied.append(TranslationOperation.EXTRACT_CORE)
        quality_scores[TranslationOperation.EXTRACT_CORE] = extract_score
        output_text = core_question

        # If tangential preamble detected, reorder
        if gap_category == GapCategory.TANGENTIAL_PREAMBLE:
            reordered, reorder_score = cls.reorder_context(raw_input)
            operations_applied.append(TranslationOperation.REORDER_CONTEXT)
            quality_scores[TranslationOperation.REORDER_CONTEXT] = reorder_score
            output_text = reordered

        # If emotional intensity detected, normalize
        if gap_category == GapCategory.EMOTIONAL_INTENSITY:
            normalized, norm_score = cls.normalize_emotional_language(raw_input)
            operations_applied.append(TranslationOperation.NORMALIZE_EMOTIONAL)
            quality_scores[TranslationOperation.NORMALIZE_EMOTIONAL] = norm_score
            output_text = normalized

        # Check for compound questions
        if gap_category == GapCategory.COMPOUND_BURIED:
            decomposed, decomp_score = cls.decompose_compound(raw_input)
            operations_applied.append(TranslationOperation.DECOMPOSE_COMPOUND)
            quality_scores[TranslationOperation.DECOMPOSE_COMPOUND] = decomp_score
            translated_questions = decomposed
        else:
            translated_questions = [output_text]

        # Surface assumptions
        output_text, assume_score = cls.surface_assumptions(output_text)
        operations_applied.append(TranslationOperation.SURFACE_ASSUMPTIONS)
        quality_scores[TranslationOperation.SURFACE_ASSUMPTIONS] = assume_score

        # Calculate overall confidence
        confidence = calculate_translation_confidence(
            [op.value for op in operations_applied],
            quality_scores,
            gap_score,
        )

        # Build metadata
        metadata = {
            "gap_confidence": gap_score,
            "operations_quality": {op.value: score for op, score in quality_scores.items()},
            "num_questions_extracted": len(translated_questions),
        }

        return TranslationOutput(
            translated_questions=translated_questions,
            gap_category=gap_category if gap_category != GapCategory.NONE else GapCategory.TANGENTIAL_PREAMBLE,
            confidence=confidence,
            operations_applied=operations_applied,
            assumptions_surfaced=[],
            metadata=metadata,
        )


# Service wrapper
class TranslationService:
    """Service wrapper for translation stage with Claude integration."""

    def __init__(self):
        self.engine = TranslationEngine()

    def translate(self, input_data: TranslationInput) -> TranslationOutput:
        """Translate raw input."""
        return self.engine.translate(input_data)
