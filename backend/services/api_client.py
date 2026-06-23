"""API client for Claude, OpenAI, and Perplexity models."""

import anthropic
import openai
from models.enums import ModelTier, AIProvider, StopReason
from core.config import settings
from core.logger import get_logger

logger = get_logger(__name__)


class APIClient:
    """Unified client for multiple AI providers."""

    def __init__(self):
        self._anthropic_client = None
        self._openai_client = None
        self._perplexity_client = None

    @property
    def anthropic_client(self):
        if self._anthropic_client is None:
            self._anthropic_client = anthropic.Anthropic(
                api_key=settings.ANTHROPIC_API_KEY or "dummy"
            )
        return self._anthropic_client

    @property
    def openai_client(self):
        if self._openai_client is None and settings.OPENAI_API_KEY:
            self._openai_client = openai.OpenAI(
                api_key=settings.OPENAI_API_KEY
            )
        return self._openai_client

    @property
    def perplexity_client(self):
        if self._perplexity_client is None and settings.PERPLEXITY_API_KEY:
            self._perplexity_client = openai.OpenAI(
                api_key=settings.PERPLEXITY_API_KEY,
                base_url="https://api.perplexity.ai",
            )
        return self._perplexity_client

    def call_claude(
        self,
        prompt: str,
        model_tier: ModelTier,
        max_tokens: int = 2048,
    ) -> tuple:
        """Call Claude API."""
        # Map model tier to actual model ID
        model_map = {
            ModelTier.HAIKU: "claude-3-5-haiku-20241022",
            ModelTier.OPUS_FAST: "claude-3-5-sonnet-20241022",
            ModelTier.OPUS_THINKING: "claude-3-7-opus-20250219",
        }

        model_id = model_map.get(model_tier, "claude-3-5-sonnet-20241022")

        try:
            message = self.anthropic_client.messages.create(
                model=model_id,
                max_tokens=max_tokens,
                messages=[{"role": "user", "content": prompt}],
            )

            response_text = message.content[0].text if message.content else ""
            stop_reason = StopReason.END_TURN

            return response_text, {
                "input_tokens": message.usage.input_tokens,
                "output_tokens": message.usage.output_tokens,
                "stop_reason": stop_reason,
            }
        except Exception as e:
            logger.error(f"Error calling Claude: {e}")
            raise

    def call_openai(
        self,
        prompt: str,
        max_tokens: int = 2048,
    ) -> tuple:
        """Call OpenAI API."""
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                max_tokens=max_tokens,
                messages=[{"role": "user", "content": prompt}],
            )

            response_text = response.choices[0].message.content
            stop_reason = StopReason(response.choices[0].finish_reason.lower())

            return response_text, {
                "input_tokens": response.usage.prompt_tokens,
                "output_tokens": response.usage.completion_tokens,
                "stop_reason": stop_reason,
            }
        except Exception as e:
            logger.error(f"Error calling OpenAI: {e}")
            raise

    def call_perplexity(
        self,
        prompt: str,
        max_tokens: int = 2048,
    ) -> tuple:
        """Call Perplexity API."""
        try:
            response = self.perplexity_client.chat.completions.create(
                model="sonar",
                max_tokens=max_tokens,
                messages=[{"role": "user", "content": prompt}],
            )

            response_text = response.choices[0].message.content
            stop_reason = StopReason(response.choices[0].finish_reason.lower())

            return response_text, {
                "input_tokens": response.usage.prompt_tokens,
                "output_tokens": response.usage.completion_tokens,
                "stop_reason": stop_reason,
            }
        except Exception as e:
            logger.error(f"Error calling Perplexity: {e}")
            raise

    def call_model(
        self,
        prompt: str,
        model_tier: ModelTier,
        provider: AIProvider = AIProvider.ANTHROPIC,
        max_tokens: int = 2048,
    ) -> tuple:
        """Call model based on provider."""
        if provider == AIProvider.ANTHROPIC:
            return self.call_claude(prompt, model_tier, max_tokens)
        elif provider == AIProvider.OPENAI:
            return self.call_openai(prompt, max_tokens)
        elif provider == AIProvider.PERPLEXITY:
            return self.call_perplexity(prompt, max_tokens)
        else:
            raise ValueError(f"Unknown provider: {provider}")


# Global API client instance
api_client = APIClient()
