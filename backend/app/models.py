from pydantic import BaseModel
from typing import List, Dict, Optional, Any

# Request models
class TranslateRequest(BaseModel):
    raw_input: str

class RouteRequest(BaseModel):
    translated_text: str

class ComposeRequest(BaseModel):
    translated_text: str
    routed_model: str

class AskRequest(BaseModel):
    final_prompt: str
    routed_model: str

class FeedbackRequest(BaseModel):
    answer_id: str
    rating: str  # "good", "bad", "partial"
    notes: Optional[str] = None

# Response models
class TranslationResult(BaseModel):
    id: str
    translated_text: str
    operations_applied: List[str]
    confidence: int
    explanation: str

class TranslateResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    error: Optional[str] = None

class RoutingResult(BaseModel):
    routed_model: str
    reasoning: str
    confidence: int
    dimensions: Dict[str, Any]

class RouteResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    error: Optional[str] = None

class TechniqueDetail(BaseModel):
    id: str
    name: str
    description: str
    confidence: int
    tokens_overhead: int

class CompositionResult(BaseModel):
    techniques: List[TechniqueDetail]
    final_prompt: str
    estimated_tokens: int
    confidence: int

class ComposeResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    error: Optional[str] = None

class AskResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    error: Optional[str] = None

class FeedbackResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    error: Optional[str] = None
