"""Pydantic schemas for ADHD-to-AI Translator system."""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime
from .enums import (
    GapCategory, ModelTier, QuestionType, TranslationOperation,
    FeedbackMode, DialogueMode, AIProvider, TechniqueID, StopReason, BehavioralSignal
)


# ============= STAGE 1: TRANSLATION =============

class TranslationInput(BaseModel):
    """Input contract for Stage 1: Translation."""
    raw_input: str = Field(..., description="Raw ADHD-style input from user")
    conversation_history: Optional[List[str]] = Field(None, description="Previous messages in session")
    user_preferences: Optional[Dict[str, Any]] = Field(None, description="Known translation preferences")


class TranslationOutput(BaseModel):
    """Output contract for Stage 1: Translation."""
    translated_questions: List[str] = Field(..., description="1-N clarified questions")
    gap_category: GapCategory = Field(..., description="Type of gap detected")
    confidence: float = Field(..., ge=0, le=100, description="Confidence 0-100")
    operations_applied: List[TranslationOperation] = Field(...)
    assumptions_surfaced: List[str] = Field(...)
    metadata: Dict[str, Any] = Field(...)


# ============= STAGE 2: ROUTING =============

class RoutingDimensions(BaseModel):
    """6-dimensional scoring for routing."""
    complexity: int = Field(..., ge=1, le=10, description="1-10 scale")
    domain: QuestionType
    scope: str = Field(..., description="narrow, medium, broad")
    novelty: int = Field(..., ge=0, le=10, description="0-10 scale")
    certainty: int = Field(..., ge=0, le=10, description="0-10 scale, high=clear answer")
    depth: int = Field(..., ge=0, le=10, description="0-10 scale, high=deep analysis needed")


class RoutingInput(BaseModel):
    """Input contract for Stage 2: Routing."""
    translated_questions: List[str]
    question_metadata: Dict[str, Any] = Field(..., description="From Stage 1")
    user_override: Optional[ModelTier] = Field(None, description="User can force model choice")


class RoutingOutput(BaseModel):
    """Output contract for Stage 2: Routing."""
    routed_model: ModelTier
    confidence: float = Field(..., ge=0, le=100)
    reasoning: str
    dimensions: RoutingDimensions
    consequence_score: int = Field(..., ge=0, le=5, description="0-5 scale")
    fallback_options: Optional[List[ModelTier]] = Field(None)


# ============= STAGE 3: TECHNIQUE SELECTION =============

class Technique(BaseModel):
    """A single selected technique."""
    id: TechniqueID
    name: str
    score: float = Field(..., ge=0, le=15, description="0-15 scoring system")
    injection_point: int = Field(..., description="Position in canonical order")


class TechniqueInput(BaseModel):
    """Input contract for Stage 3: Technique Selection."""
    translated_question: str
    routed_model: ModelTier
    question_metadata: Dict[str, Any]
    question_type: QuestionType


class TechniqueOutput(BaseModel):
    """Output contract for Stage 3: Technique Selection."""
    selected_techniques: List[Technique]
    technique_scores: Dict[str, float]
    total_token_overhead: int
    conflicts_detected: List[str]
    synergies_used: List[tuple]
    metadata: Dict[str, Any]


# ============= STAGE 4: COMPOSITION =============

class CompositionInput(BaseModel):
    """Input contract for Stage 4: Composition."""
    translated_question: str
    routed_model: ModelTier
    selected_techniques: List[Technique]
    prompt_template: Optional[str] = None


class CompositionOutput(BaseModel):
    """Output contract for Stage 4: Composition."""
    final_prompt: str
    prompt_tokens: int
    validation_passed: bool
    validation_errors: List[str]
    metadata: Dict[str, Any]


# ============= STAGE 5: EXECUTION & FEEDBACK =============

class ExecutionInput(BaseModel):
    """Input contract for Stage 5: Execution."""
    final_prompt: str
    routed_model: ModelTier
    feedback_mode: FeedbackMode = Field(default=FeedbackMode.EXPLICIT_RATING)


class ModelMetadata(BaseModel):
    """Metadata from model response."""
    tokens_input: int
    tokens_output: int
    stop_reason: StopReason
    latency_ms: int


class ExecutionOutput(BaseModel):
    """Output contract for Stage 5: Execution."""
    model_response: str
    model_metadata: ModelMetadata
    interaction_id: str = Field(..., description="UUID for this interaction")


class FeedbackInput(BaseModel):
    """User feedback collection."""
    interaction_id: str
    user_rating: Optional[int] = Field(None, ge=1, le=5, description="1-5 stars")
    user_comment: Optional[str] = None
    behavioral_signal: Optional[BehavioralSignal] = None


# ============= FULL PIPELINE =============

class InteractionRecord(BaseModel):
    """Complete record of one interaction through all 5 stages."""
    id: str
    created_at: datetime
    user_id: str

    # Stage 1
    raw_input: str
    translation_output: TranslationOutput

    # Stage 2
    routing_output: RoutingOutput

    # Stage 3
    technique_output: TechniqueOutput

    # Stage 4
    composition_output: CompositionOutput

    # Stage 5
    execution_output: ExecutionOutput

    # Feedback
    feedback: Optional[FeedbackInput] = None
    helpful: Optional[bool] = None


# ============= LEARNING SYSTEM =============

class Pattern(BaseModel):
    """Discovered pattern from interaction analysis."""
    pattern_type: str  # routing, technique, gap_category
    dimension: str
    finding: str
    confidence: float
    interaction_count: int


class RefinedRule(BaseModel):
    """Rule refined by learning system."""
    rule_type: str
    original_rule: str
    refined_rule: str
    applied: bool
    improvement_estimate: float


# ============= PHASE 11: MULTI-AI MODE =============

class Account(BaseModel):
    """Account configuration for multi-AI mode."""
    id: str
    user_id: str
    account_name: str
    provider: AIProvider
    model_available: str
    tokens_remaining: int
    status: str


class DialogueResponse(BaseModel):
    """Single model response in multi-AI dialogue."""
    model: str
    response: str
    tokens_used: int


class MultiAIDialogue(BaseModel):
    """Multi-AI conversation result."""
    id: str
    dialogue_mode: DialogueMode
    question: str
    responses: List[DialogueResponse]
    synthesis: Optional[str] = None
    user_rating: Optional[int] = None


# ============= API ENDPOINTS =============

class APIRequest(BaseModel):
    """User API request."""
    raw_input: str
    conversation_history: Optional[List[str]] = None


class APIResponse(BaseModel):
    """Full API response with all intermediate steps."""
    interaction_id: str
    raw_input: str
    translation: TranslationOutput
    routing: RoutingOutput
    techniques: TechniqueOutput
    final_prompt: str
    model_response: str
    model_metadata: ModelMetadata
