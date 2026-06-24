from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import uuid

from ..models import (
    TranslateRequest, TranslateResponse,
    RouteRequest, RouteResponse,
    ComposeRequest, ComposeResponse,
    AskRequest, AskResponse,
    FeedbackRequest, FeedbackResponse,
)
from ..engines.translation import translate
from ..engines.routing import route
from ..engines.composition import compose
from ..engines.learning import log_full_pipeline, record_feedback, get_insights
from ..engines.response_pipeline import process_response
from .anthropic_client import call_claude

router = APIRouter(prefix="/api", tags=["translator"])

# Store session state (in-memory for Phase 1)
sessions = {}

@router.post("/translate", response_model=TranslateResponse)
async def translate_endpoint(request: TranslateRequest) -> Dict[str, Any]:
    """Translate raw ADHD-style input into clear questions."""
    try:
        result = translate(request.raw_input)

        # Create session ID for this question
        session_id = str(uuid.uuid4())
        sessions[session_id] = {
            "raw_input": request.raw_input,
            "translation": result,
        }

        return {
            "success": True,
            "data": {
                "session_id": session_id,
                "original_input": result["original_input"],
                "translations": result["translations"],
                "analysis": result["analysis"],
            },
            "error": None
        }
    except Exception as e:
        return {
            "success": False,
            "data": {},
            "error": str(e)
        }

@router.post("/route", response_model=RouteResponse)
async def route_endpoint(request: Dict[str, Any]) -> Dict[str, Any]:
    """Route translated questions to appropriate models."""
    try:
        session_id = request.get("session_id")
        translated_text = request.get("translated_text")

        if not session_id or not translated_text:
            raise HTTPException(status_code=400, detail="Missing session_id or translated_text")

        # Route the question
        routing_result = route([translated_text])
        routing = routing_result["routings"][0] if routing_result["routings"] else {}

        # Store in session
        if session_id in sessions:
            sessions[session_id]["routing"] = routing

        return {
            "success": True,
            "data": {
                "session_id": session_id,
                "routing": routing,
            },
            "error": None
        }
    except Exception as e:
        return {
            "success": False,
            "data": {},
            "error": str(e)
        }

@router.post("/compose", response_model=ComposeResponse)
async def compose_endpoint(request: Dict[str, Any]) -> Dict[str, Any]:
    """Compose final prompt with selected techniques."""
    try:
        session_id = request.get("session_id")
        translated_text = request.get("translated_text")
        routed_model = request.get("routed_model", "haiku")
        domain = request.get("domain", "exploratory")

        if not session_id:
            raise HTTPException(status_code=400, detail="Missing session_id")

        # Compose
        composition_result = compose(translated_text, routed_model, domain)

        # Store in session
        if session_id in sessions:
            sessions[session_id]["composition"] = composition_result

        return {
            "success": True,
            "data": {
                "session_id": session_id,
                "composition": composition_result,
            },
            "error": None
        }
    except Exception as e:
        return {
            "success": False,
            "data": {},
            "error": str(e)
        }

@router.post("/ask", response_model=AskResponse)
async def ask_endpoint(request: Dict[str, Any]) -> Dict[str, Any]:
    """Submit final prompt to Claude and get answer."""
    try:
        session_id = request.get("session_id")
        final_prompt = request.get("final_prompt")
        routed_model = request.get("routed_model", "haiku")
        api_key = request.get("api_key")

        if not session_id or not final_prompt or not api_key:
            raise HTTPException(status_code=400, detail="Missing required fields")

        # Allow caller to toggle individual pipeline stages (all on by default)
        pipeline_options = request.get("pipeline_options")

        # Call Claude
        raw_response, tokens_used = call_claude(final_prompt, routed_model, api_key)

        # Run the raw reply through the ADHD-optimization pipeline:
        # anti-sycophancy -> flow preservation -> RSD -> cognitive load -> formatter
        pipeline_result = process_response(raw_response, pipeline_options)
        response_text = pipeline_result["response"]

        # Log to database (store the processed response the user actually sees)
        if session_id in sessions:
            session = sessions[session_id]
            log_full_pipeline(
                session.get("raw_input", ""),
                session.get("translation", {}),
                session.get("routing", {}),
                session.get("composition", {}),
                response_text,
                tokens_used
            )

            sessions[session_id]["answer"] = {
                "response": response_text,
                "raw_response": raw_response,
                "tokens_used": tokens_used,
                "pipeline": pipeline_result["stages"],
            }

        return {
            "success": True,
            "data": {
                "session_id": session_id,
                "answer": response_text,
                "raw_answer": raw_response,
                "tokens_used": tokens_used,
                "pipeline_stages": pipeline_result["stages"],
            },
            "error": None
        }
    except Exception as e:
        return {
            "success": False,
            "data": {},
            "error": str(e)
        }

@router.post("/feedback", response_model=FeedbackResponse)
async def feedback_endpoint(request: FeedbackRequest) -> Dict[str, Any]:
    """Record user feedback for learning."""
    try:
        record_feedback(request.answer_id, request.rating, request.notes or "")

        return {
            "success": True,
            "data": {
                "recorded": True,
            },
            "error": None
        }
    except Exception as e:
        return {
            "success": False,
            "data": {},
            "error": str(e)
        }

@router.get("/insights")
async def insights_endpoint() -> Dict[str, Any]:
    """Get insights from learning system."""
    try:
        insights = get_insights()
        return {
            "success": True,
            "data": insights,
            "error": None
        }
    except Exception as e:
        return {
            "success": False,
            "data": {},
            "error": str(e)
        }

@router.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}
