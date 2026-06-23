"""Enumerations for the ADHD-to-AI Translator system."""

from enum import Enum


class GapCategory(str, Enum):
    """Categories of gaps between what the user says and what they mean."""
    TANGENTIAL_PREAMBLE = "tangential_preamble"
    EMOTIONAL_INTENSITY = "emotional_intensity_distortion"
    COMPOUND_BURIED = "compound_buried_request"
    TYPO_PRONOUN_WRAPPER = "typo_pronoun_wrapper_corruption"
    NONE = "none"


class ModelTier(str, Enum):
    """Available model tiers for routing."""
    HAIKU = "haiku"
    OPUS_FAST = "opus_fast"
    OPUS_THINKING = "opus_thinking"


class QuestionType(str, Enum):
    """Types of questions for technique and routing effectiveness scoring."""
    FACTUAL = "factual"
    ANALYTICAL = "analytical"
    CREATIVE = "creative"
    COMPARATIVE = "comparative"
    EXPLORATORY = "exploratory"
    DECISION_MAKING = "decision_making"
    CODE = "code"
    INTERPERSONAL = "interpersonal"
    ETHICAL = "ethical"
    CONCEPTUAL = "conceptual"
    TECHNICAL_TROUBLESHOOTING = "technical_troubleshooting"
    PRODUCT_RESEARCH = "product_research"
    RELIGIOUS_BIBLICAL = "religious_biblical"
    LEGAL_CONSUMER = "legal_consumer"
    HEALTH_MEDICAL = "health_medical"
    PSYCHOLOGICAL = "psychological"
    WORKFLOW = "workflow"


class TranslationOperation(str, Enum):
    """Core translation operations."""
    EXTRACT_CORE = "extract_core_question"
    REORDER_CONTEXT = "reorder_context"
    NORMALIZE_EMOTIONAL = "normalize_emotional_language"
    CLARIFY_SCOPE = "clarify_scope"
    SURFACE_ASSUMPTIONS = "surface_assumptions"
    DECOMPOSE_COMPOUND = "decompose_compound_questions"


class FeedbackMode(str, Enum):
    """How feedback is collected."""
    EXPLICIT_RATING = "explicit_rating"
    BEHAVIORAL_INFERENCE = "behavioral_inference"
    ONE_LINE_CONFIRM = "one_line_confirm"


class DialogueMode(str, Enum):
    """Phase 11: Multi-AI dialogue modes."""
    DEBATE = "debate"
    CONSENSUS = "consensus"
    SYNTHESIS = "synthesis"


class AIProvider(str, Enum):
    """AI providers for multi-AI mode."""
    ANTHROPIC = "anthropic"
    OPENAI = "openai"
    PERPLEXITY = "perplexity"


class TechniqueID(str, Enum):
    """All 18 techniques (T01-T18)."""
    T01_PERMISSION_UNKNOWN = "T01"
    T02_CHAIN_OF_THOUGHT = "T02"
    T03_QUOTE_FIRST = "T03"
    T04_SELF_VERIFICATION = "T04"
    T05_ACCURACY_ROLE = "T05"
    T06_RAG = "T06"
    T07_FEW_SHOT = "T07"
    T08_INSTRUCTION_HIERARCHY = "T08"
    T09_EXPLICIT_CONSTRAINTS = "T09"
    T10_OUTPUT_FORMAT = "T10"
    T11_REASONING_DECOMPOSITION = "T11"
    T12_QUESTION_REFRAMING = "T12"
    T13_ASSUMPTION_SURFACING = "T13"
    T14_SCOPE_LIMITATION = "T14"
    T15_META_PROMPTING = "T15"
    T16_STEP_COUNTING = "T16"
    T17_CONFIDENCE_SCORING = "T17"
    T18_CONSTRAINT_VIOLATION = "T18"


class StopReason(str, Enum):
    """Model stop reasons."""
    END_TURN = "end_turn"
    MAX_TOKENS = "max_tokens"
    STOP_SEQUENCE = "stop_sequence"


class BehavioralSignal(str, Enum):
    """Inferred behavioral signals for feedback."""
    FOLLOW_UP = "follow_up"
    CLARIFICATION_REQUESTED = "clarification_requested"
    ABANDONED = "abandoned"
    ACCEPTED_IMMEDIATELY = "accepted_immediately"
