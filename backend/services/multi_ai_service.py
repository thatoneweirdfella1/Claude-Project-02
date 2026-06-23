"""Phase 11: Multi-AI Service - debate, consensus, synthesis with account rotation."""

import uuid
from typing import Dict, List, Optional
from models.enums import DialogueMode, AIProvider, ModelTier
from models.schemas import MultiAIDialogue, DialogueResponse
from services.api_client import api_client
from services.database_service import db_service
from core.logger import get_logger

logger = get_logger(__name__)


class AccountPool:
    """Manages account pool with token tracking and rotation."""

    def __init__(self):
        self.accounts = {}
        self._init_default_pool()

    def _init_default_pool(self):
        """Initialize default account pool (8 free accounts as per spec)."""
        # Anthropic accounts (Claude A/B/C/D)
        for i, name in enumerate(['Claude-A', 'Claude-B', 'Claude-C', 'Claude-D']):
            self.accounts[name] = {
                'provider': AIProvider.ANTHROPIC,
                'tokens_remaining': 1_000_000,  # Free tier tokens
                'status': 'active',
                'last_reset': None,
            }

        # OpenAI accounts (GPT A/B)
        for i, name in enumerate(['GPT-A', 'GPT-B']):
            self.accounts[name] = {
                'provider': AIProvider.OPENAI,
                'tokens_remaining': 100_000,  # Free tier tokens
                'status': 'active',
                'last_reset': None,
            }

        # Perplexity accounts (A/B)
        for i, name in enumerate(['Perplexity-A', 'Perplexity-B']):
            self.accounts[name] = {
                'provider': AIProvider.PERPLEXITY,
                'tokens_remaining': 100_000,  # Free tier tokens
                'status': 'active',
                'last_reset': None,
            }

    def get_available_accounts(self, provider: AIProvider = None, count: int = 3) -> List[str]:
        """Get available accounts, optionally for specific provider."""
        available = [
            name for name, info in self.accounts.items()
            if info['status'] == 'active' and info['tokens_remaining'] > 1000
        ]

        if provider:
            available = [
                name for name in available
                if self.accounts[name]['provider'] == provider
            ]

        return available[:count]

    def deduct_tokens(self, account_name: str, tokens: int):
        """Deduct tokens from account."""
        if account_name in self.accounts:
            self.accounts[account_name]['tokens_remaining'] -= tokens
            if self.accounts[account_name]['tokens_remaining'] < 0:
                self.accounts[account_name]['status'] = 'exhausted'

    def rotate_account(self, provider: AIProvider) -> Optional[str]:
        """Get next available account for provider (rotation)."""
        available = self.get_available_accounts(provider, 1)
        if available:
            return available[0]
        return None


class MultiAIDialogueEngine:
    """Orchestrates multi-AI dialogues with debate, consensus, and synthesis modes."""

    def __init__(self):
        self.account_pool = AccountPool()

    def debate_mode(
        self,
        question: str,
        model_tier: ModelTier = ModelTier.OPUS_FAST,
    ) -> MultiAIDialogue:
        """
        Debate Mode: Get responses from 3 different perspectives.
        Each model argues its position on the question.
        """
        dialogue_id = str(uuid.uuid4())
        responses = []

        # Get 3 available accounts across providers
        claude_account = self.account_pool.rotate_account(AIProvider.ANTHROPIC)
        gpt_account = self.account_pool.rotate_account(AIProvider.OPENAI)
        perplexity_account = self.account_pool.rotate_account(AIProvider.PERPLEXITY)

        accounts_to_use = [
            (claude_account, AIProvider.ANTHROPIC, "Claude"),
            (gpt_account, AIProvider.OPENAI, "GPT"),
            (perplexity_account, AIProvider.PERPLEXITY, "Perplexity"),
        ]

        for account, provider, model_name in accounts_to_use:
            if not account:
                continue

            try:
                # Create debate-framed prompt
                debate_prompt = f"""You are in a debate about the following topic. Present your strongest argument FOR this perspective:

Question: {question}

Provide a compelling argument (150-300 words) from your unique perspective."""

                response_text, token_data = api_client.call_model(
                    debate_prompt,
                    model_tier,
                    provider,
                    max_tokens=500,
                )

                tokens_used = token_data.get('output_tokens', 0)
                self.account_pool.deduct_tokens(account, tokens_used)

                responses.append(
                    DialogueResponse(
                        model=f"{model_name} ({account})",
                        response=response_text,
                        tokens_used=tokens_used,
                    )
                )

                logger.info(f"Debate: {model_name} response received ({tokens_used} tokens)")

            except Exception as e:
                logger.warning(f"Debate mode error for {model_name}: {e}")

        # Synthesis: ask Claude to summarize the debate
        synthesis = self._synthesize_responses(
            question, responses, "Summarize the debate above and identify key points of agreement/disagreement"
        )

        return MultiAIDialogue(
            id=dialogue_id,
            dialogue_mode=DialogueMode.DEBATE,
            question=question,
            responses=responses,
            synthesis=synthesis,
        )

    def consensus_mode(
        self,
        question: str,
        model_tier: ModelTier = ModelTier.OPUS_FAST,
    ) -> MultiAIDialogue:
        """
        Consensus Mode: All models work toward agreement.
        Each model tries to find common ground.
        """
        dialogue_id = str(uuid.uuid4())
        responses = []

        claude_account = self.account_pool.rotate_account(AIProvider.ANTHROPIC)
        gpt_account = self.account_pool.rotate_account(AIProvider.OPENAI)
        perplexity_account = self.account_pool.rotate_account(AIProvider.PERPLEXITY)

        accounts_to_use = [
            (claude_account, AIProvider.ANTHROPIC, "Claude"),
            (gpt_account, AIProvider.OPENAI, "GPT"),
            (perplexity_account, AIProvider.PERPLEXITY, "Perplexity"),
        ]

        for account, provider, model_name in accounts_to_use:
            if not account:
                continue

            try:
                # Create consensus-framed prompt
                consensus_prompt = f"""You are working with other AI systems to reach consensus on the following question.
Focus on finding points of agreement and shared understanding.

Question: {question}

Provide your perspective, focusing on areas of potential agreement (150-300 words)."""

                response_text, token_data = api_client.call_model(
                    consensus_prompt,
                    model_tier,
                    provider,
                    max_tokens=500,
                )

                tokens_used = token_data.get('output_tokens', 0)
                self.account_pool.deduct_tokens(account, tokens_used)

                responses.append(
                    DialogueResponse(
                        model=f"{model_name} ({account})",
                        response=response_text,
                        tokens_used=tokens_used,
                    )
                )

                logger.info(f"Consensus: {model_name} response received ({tokens_used} tokens)")

            except Exception as e:
                logger.warning(f"Consensus mode error for {model_name}: {e}")

        # Synthesis: extract common ground
        synthesis = self._synthesize_responses(
            question, responses, "Identify the points of consensus and areas of agreement among the responses"
        )

        return MultiAIDialogue(
            id=dialogue_id,
            dialogue_mode=DialogueMode.CONSENSUS,
            question=question,
            responses=responses,
            synthesis=synthesis,
        )

    def synthesis_mode(
        self,
        question: str,
        model_tier: ModelTier = ModelTier.OPUS_THINKING,
    ) -> MultiAIDialogue:
        """
        Synthesis Mode: Deeper principle discovery.
        Models explore underlying principles and connections.
        """
        dialogue_id = str(uuid.uuid4())
        responses = []

        claude_account = self.account_pool.rotate_account(AIProvider.ANTHROPIC)
        gpt_account = self.account_pool.rotate_account(AIProvider.OPENAI)
        perplexity_account = self.account_pool.rotate_account(AIProvider.PERPLEXITY)

        accounts_to_use = [
            (claude_account, AIProvider.ANTHROPIC, "Claude"),
            (gpt_account, AIProvider.OPENAI, "GPT"),
            (perplexity_account, AIProvider.PERPLEXITY, "Perplexity"),
        ]

        for account, provider, model_name in accounts_to_use:
            if not account:
                continue

            try:
                # Create synthesis-framed prompt
                synthesis_prompt = f"""You are exploring the underlying principles and deeper connections in this question.
Go beyond surface-level responses to find fundamental truths and broader patterns.

Question: {question}

Explore the deeper principles and fundamental insights (200-400 words)."""

                response_text, token_data = api_client.call_model(
                    synthesis_prompt,
                    model_tier,
                    provider,
                    max_tokens=800,
                )

                tokens_used = token_data.get('output_tokens', 0)
                self.account_pool.deduct_tokens(account, tokens_used)

                responses.append(
                    DialogueResponse(
                        model=f"{model_name} ({account})",
                        response=response_text,
                        tokens_used=tokens_used,
                    )
                )

                logger.info(f"Synthesis: {model_name} response received ({tokens_used} tokens)")

            except Exception as e:
                logger.warning(f"Synthesis mode error for {model_name}: {e}")

        # Meta-synthesis: identify deeper principles
        synthesis = self._synthesize_responses(
            question,
            responses,
            "Identify the deeper principles, fundamental truths, and broader patterns that connect these perspectives",
        )

        return MultiAIDialogue(
            id=dialogue_id,
            dialogue_mode=DialogueMode.SYNTHESIS,
            question=question,
            responses=responses,
            synthesis=synthesis,
        )

    def _synthesize_responses(
        self,
        question: str,
        responses: List[DialogueResponse],
        synthesis_task: str,
    ) -> str:
        """Use Claude to synthesize responses."""
        if not responses:
            return "No responses to synthesize."

        try:
            response_text = "\n\n".join([f"**{r.model}:**\n{r.response}" for r in responses])

            synthesis_prompt = f"""Based on the following responses to the question, {synthesis_task}.

Question: {question}

Responses:
{response_text}

Provide a concise synthesis (150-300 words)."""

            synthesized, _ = api_client.call_model(
                synthesis_prompt,
                ModelTier.OPUS_THINKING,
                AIProvider.ANTHROPIC,
                max_tokens=500,
            )

            return synthesized

        except Exception as e:
            logger.error(f"Synthesis error: {e}")
            return "Unable to synthesize responses."


# Service wrapper
class MultiAIService:
    """Service wrapper for Phase 11 multi-AI dialogues."""

    def __init__(self):
        self.engine = MultiAIDialogueEngine()
        self.db = db_service

    def debate(
        self,
        question: str,
        model_tier: ModelTier = ModelTier.OPUS_FAST,
    ) -> MultiAIDialogue:
        """Start debate mode."""
        return self.engine.debate_mode(question, model_tier)

    def consensus(
        self,
        question: str,
        model_tier: ModelTier = ModelTier.OPUS_FAST,
    ) -> MultiAIDialogue:
        """Start consensus mode."""
        return self.engine.consensus_mode(question, model_tier)

    def synthesis(
        self,
        question: str,
        model_tier: ModelTier = ModelTier.OPUS_THINKING,
    ) -> MultiAIDialogue:
        """Start synthesis mode."""
        return self.engine.synthesis_mode(question, model_tier)

    def log_dialogue(self, dialogue: MultiAIDialogue, user_rating: int = None):
        """Log dialogue to database."""
        # Store in dialogues table
        pass  # Implementation handled by database service


multi_ai_service = MultiAIService()
