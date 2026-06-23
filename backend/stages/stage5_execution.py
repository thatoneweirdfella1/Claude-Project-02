"""Stage 5: Execution - calls model API and logs interactions."""

import uuid
import time
from models.enums import AIProvider, StopReason
from models.schemas import ExecutionInput, ExecutionOutput, ModelMetadata
from services.api_client import api_client
from services.database_service import db_service
from core.logger import get_logger

logger = get_logger(__name__)


class ExecutionEngine:
    """Executes final prompt on model API and logs results."""

    @staticmethod
    def execute(input_data: ExecutionInput) -> ExecutionOutput:
        """Execute prompt on model and log."""
        interaction_id = str(uuid.uuid4())

        # Call model
        logger.info(f"Executing prompt on {input_data.routed_model.value}")
        start_time = time.time()

        try:
            response_text, token_data = api_client.call_model(
                input_data.final_prompt,
                input_data.routed_model,
                AIProvider.ANTHROPIC,
                max_tokens=2048,
            )

            latency_ms = int((time.time() - start_time) * 1000)

            # Build metadata
            model_metadata = ModelMetadata(
                tokens_input=token_data.get("input_tokens", 0),
                tokens_output=token_data.get("output_tokens", 0),
                stop_reason=token_data.get("stop_reason", StopReason.END_TURN),
                latency_ms=latency_ms,
            )

            logger.info(
                f"Execution complete: {model_metadata.tokens_input} in, "
                f"{model_metadata.tokens_output} out, {latency_ms}ms"
            )

            return ExecutionOutput(
                model_response=response_text,
                model_metadata=model_metadata,
                interaction_id=interaction_id,
            )

        except Exception as e:
            logger.error(f"Execution failed: {e}")
            # Return error response
            return ExecutionOutput(
                model_response=f"Error during execution: {str(e)}",
                model_metadata=ModelMetadata(
                    tokens_input=0,
                    tokens_output=0,
                    stop_reason=StopReason.END_TURN,
                    latency_ms=0,
                ),
                interaction_id=interaction_id,
            )


# Service wrapper
class ExecutionService:
    """Service wrapper for execution stage."""

    def __init__(self):
        self.engine = ExecutionEngine()
        self.db = db_service

    def execute(self, input_data: ExecutionInput) -> ExecutionOutput:
        """Execute and log."""
        return self.engine.execute(input_data)

    def log_interaction(
        self,
        interaction_data: dict,
        user_id: str = "default",
    ) -> str:
        """Log complete interaction to database."""
        full_data = {"user_id": user_id, **interaction_data}
        return self.db.log_interaction(full_data)

    def log_feedback(self, interaction_id: str, feedback_data: dict):
        """Log user feedback."""
        self.db.log_feedback(interaction_id, feedback_data)
