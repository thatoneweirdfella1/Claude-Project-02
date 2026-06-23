"""FastAPI application - main entry point for ADHD-to-AI Translator."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from models.schemas import APIRequest, APIResponse, FeedbackInput
from stages.stage1_translation import TranslationService, TranslationInput
from stages.stage2_routing import RoutingService, RoutingInput
from stages.stage3_technique_selection import TechniqueSelectionService, TechniqueInput
from stages.stage4_composition import CompositionService, CompositionInput
from stages.stage5_execution import ExecutionService, ExecutionInput
from services.database_service import db_service
from services.multi_ai_service import multi_ai_service
from analysis.pattern_analyzer import PatternAnalyzer
from models.enums import DialogueMode, ModelTier
from core.config import settings
from core.logger import get_logger

logger = get_logger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="ADHD-to-AI Translator",
    description="Translates ADHD-style rambling input into optimal AI responses",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
translation_service = TranslationService()
routing_service = RoutingService()
technique_service = TechniqueSelectionService()
composition_service = CompositionService()
execution_service = ExecutionService()


@app.on_event("startup")
async def startup_event():
    """Initialize on startup."""
    logger.info("Starting ADHD-to-AI Translator")
    logger.info(f"Database: {settings.DATABASE_PATH}")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "ADHD-to-AI Translator"}


@app.post("/translate")
async def translate(request: APIRequest):
    """Stage 1: Translate raw input."""
    try:
        input_data = TranslationInput(
            raw_input=request.raw_input,
            conversation_history=request.conversation_history,
        )
        result = translation_service.translate(input_data)
        return result
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/process")
async def process_full_pipeline(request: APIRequest) -> APIResponse:
    """Full 5-stage pipeline: translate → route → select → compose → execute."""
    user_id = request.conversation_history[0][:8] if request.conversation_history else "default"

    try:
        # Stage 1: Translation
        logger.info("Stage 1: Translating input")
        translation_input = TranslationInput(
            raw_input=request.raw_input,
            conversation_history=request.conversation_history,
        )
        translation_output = translation_service.translate(translation_input)

        # Stage 2: Routing
        logger.info("Stage 2: Routing question")
        routing_input = RoutingInput(
            translated_questions=translation_output.translated_questions,
            question_metadata=translation_output.metadata,
        )
        routing_output = routing_service.route(routing_input)

        # Stage 3: Technique Selection
        logger.info("Stage 3: Selecting techniques")
        technique_input = TechniqueInput(
            translated_question=translation_output.translated_questions[0],
            routed_model=routing_output.routed_model,
            question_metadata=translation_output.metadata,
            question_type=routing_output.dimensions.domain,
        )
        technique_output = technique_service.select(technique_input)

        # Stage 4: Composition
        logger.info("Stage 4: Composing prompt")
        composition_input = CompositionInput(
            translated_question=translation_output.translated_questions[0],
            routed_model=routing_output.routed_model,
            selected_techniques=technique_output.selected_techniques,
        )
        composition_output = composition_service.compose(composition_input)

        # Check if composition validation passed
        if not composition_output.validation_passed:
            logger.warning(f"Composition validation failed: {composition_output.validation_errors}")

        # Stage 5: Execution
        logger.info("Stage 5: Executing on model")
        execution_input = ExecutionInput(
            final_prompt=composition_output.final_prompt,
            routed_model=routing_output.routed_model,
        )
        execution_output = execution_service.execute(execution_input)

        # Log to database
        log_data = {
            "raw_input": request.raw_input,
            "translated_questions": translation_output.translated_questions,
            "translation_confidence": translation_output.confidence,
            "gap_category": translation_output.gap_category.value,
            "translation_operations": [op.value for op in translation_output.operations_applied],
            "routed_model": routing_output.routed_model.value,
            "routing_confidence": routing_output.confidence,
            "routing_dimensions": {
                "complexity": routing_output.dimensions.complexity,
                "domain": routing_output.dimensions.domain.value,
                "scope": routing_output.dimensions.scope,
                "novelty": routing_output.dimensions.novelty,
                "certainty": routing_output.dimensions.certainty,
                "depth": routing_output.dimensions.depth,
            },
            "consequence_score": routing_output.consequence_score,
            "selected_techniques": [t.id.value for t in technique_output.selected_techniques],
            "technique_scores": technique_output.technique_scores,
            "final_prompt": composition_output.final_prompt,
            "prompt_tokens": composition_output.prompt_tokens,
            "model_response": execution_output.model_response,
            "model_stop_reason": execution_output.model_metadata.stop_reason.value,
            "total_input_tokens": execution_output.model_metadata.tokens_input,
            "total_output_tokens": execution_output.model_metadata.tokens_output,
            "total_tokens": (
                execution_output.model_metadata.tokens_input
                + execution_output.model_metadata.tokens_output
            ),
        }

        interaction_id = execution_service.log_interaction(log_data, user_id)

        logger.info(f"Interaction complete: {interaction_id}")

        return APIResponse(
            interaction_id=interaction_id,
            raw_input=request.raw_input,
            translation=translation_output,
            routing=routing_output,
            techniques=technique_output,
            final_prompt=composition_output.final_prompt,
            model_response=execution_output.model_response,
            model_metadata=execution_output.model_metadata,
        )

    except Exception as e:
        logger.error(f"Pipeline error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/feedback/{interaction_id}")
async def submit_feedback(interaction_id: str, feedback: FeedbackInput):
    """Submit feedback for an interaction."""
    try:
        execution_service.log_feedback(
            interaction_id,
            {
                "user_rating": feedback.user_rating,
                "user_comment": feedback.user_comment,
                "behavioral_signal": feedback.behavioral_signal.value if feedback.behavioral_signal else None,
            },
        )
        return {"status": "feedback logged", "interaction_id": interaction_id}
    except Exception as e:
        logger.error(f"Feedback error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/patterns/{user_id}")
async def get_patterns(user_id: str):
    """Get discovered patterns for a user."""
    try:
        patterns = PatternAnalyzer.analyze_all(user_id)
        return {"user_id": user_id, "patterns": patterns}
    except Exception as e:
        logger.error(f"Pattern analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/interactions/{user_id}")
async def get_interactions(user_id: str, limit: int = 50):
    """Get recent interactions for a user."""
    try:
        interactions = db_service.get_recent_interactions(user_id, limit)
        return {"user_id": user_id, "count": len(interactions), "interactions": interactions}
    except Exception as e:
        logger.error(f"Query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============= PHASE 11: MULTI-AI DIALOGUE ENDPOINTS =============

@app.post("/multi-ai/debate")
async def multi_ai_debate(request: APIRequest):
    """Phase 11: Debate mode - get 3 opposing perspectives."""
    try:
        question = request.raw_input
        logger.info(f"Starting debate mode for: {question[:50]}...")

        dialogue = multi_ai_service.debate(question, ModelTier.OPUS_FAST)

        return {
            "dialogue_id": dialogue.id,
            "mode": "debate",
            "question": dialogue.question,
            "responses": [
                {"model": r.model, "response": r.response, "tokens": r.tokens_used}
                for r in dialogue.responses
            ],
            "synthesis": dialogue.synthesis,
        }
    except Exception as e:
        logger.error(f"Debate error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/multi-ai/consensus")
async def multi_ai_consensus(request: APIRequest):
    """Phase 11: Consensus mode - find agreement."""
    try:
        question = request.raw_input
        logger.info(f"Starting consensus mode for: {question[:50]}...")

        dialogue = multi_ai_service.consensus(question, ModelTier.OPUS_FAST)

        return {
            "dialogue_id": dialogue.id,
            "mode": "consensus",
            "question": dialogue.question,
            "responses": [
                {"model": r.model, "response": r.response, "tokens": r.tokens_used}
                for r in dialogue.responses
            ],
            "synthesis": dialogue.synthesis,
        }
    except Exception as e:
        logger.error(f"Consensus error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/multi-ai/synthesis")
async def multi_ai_synthesis(request: APIRequest):
    """Phase 11: Synthesis mode - discover deeper principles."""
    try:
        question = request.raw_input
        logger.info(f"Starting synthesis mode for: {question[:50]}...")

        dialogue = multi_ai_service.synthesis(question, ModelTier.OPUS_THINKING)

        return {
            "dialogue_id": dialogue.id,
            "mode": "synthesis",
            "question": dialogue.question,
            "responses": [
                {"model": r.model, "response": r.response, "tokens": r.tokens_used}
                for r in dialogue.responses
            ],
            "synthesis": dialogue.synthesis,
        }
    except Exception as e:
        logger.error(f"Synthesis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/multi-ai/accounts")
async def get_account_status():
    """Get account pool status."""
    accounts = multi_ai_service.engine.account_pool.accounts
    return {
        "total_accounts": len(accounts),
        "accounts": [
            {
                "name": name,
                "provider": info["provider"].value,
                "tokens_remaining": info["tokens_remaining"],
                "status": info["status"],
            }
            for name, info in accounts.items()
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
