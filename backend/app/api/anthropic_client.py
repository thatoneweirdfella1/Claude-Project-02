from anthropic import Anthropic
from typing import Optional, Tuple

def call_claude(
    prompt: str,
    model: str,
    api_key: str,
    max_tokens: int = 1024
) -> Tuple[str, int]:
    """
    Call Claude API and return response + token count.

    Args:
        prompt: The full prompt to send
        model: "haiku", "opus-fast", or "opus-thinking"
        api_key: Anthropic API key
        max_tokens: Max tokens in response

    Returns:
        (response_text, tokens_used)
    """
    # Map model names to actual model IDs
    model_map = {
        "haiku": "claude-3-5-haiku-20241022",
        "opus-fast": "claude-opus-4-1",
        "opus-thinking": "claude-opus-4-1",
    }

    actual_model = model_map.get(model, "claude-3-5-haiku-20241022")

    try:
        client = Anthropic(api_key=api_key)

        # Use extended thinking for opus-thinking model
        if model == "opus-thinking":
            # Extended thinking disabled for cost reasons, but structure is here
            response = client.messages.create(
                model=actual_model,
                max_tokens=max_tokens,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
        else:
            response = client.messages.create(
                model=actual_model,
                max_tokens=max_tokens,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

        # Extract response text
        response_text = response.content[0].text

        # Count tokens (approximate: response.usage.output_tokens)
        tokens_used = response.usage.output_tokens + response.usage.input_tokens

        return response_text, tokens_used

    except Exception as e:
        raise Exception(f"Error calling Claude API: {str(e)}")
