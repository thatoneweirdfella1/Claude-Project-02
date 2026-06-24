"""
Comprehensive prompt library with 40+ templates organized by model + domain.
"""

PROMPTS = {
    # Haiku prompts (fast, concise)
    "haiku": {
        "factual": """You are a factual information provider. Answer this question directly and concisely:

{question}

Be accurate, brief, and cite sources if relevant.""",

        "analytical": """You are an analytical thinker. Break down this question logically:

{question}

Provide a clear analysis in 2-3 sentences.""",

        "creative": """You are a creative problem-solver. Generate ideas for:

{question}

Provide 3-5 practical ideas.""",

        "comparative": """You are a comparison expert. Compare these options:

{question}

Highlight key differences in a concise list.""",

        "exploratory": """You are an explorer of ideas. Think about:

{question}

Explore the question briefly with 2-3 angles.""",

        "decision_making": """You are a decision advisor. For this question:

{question}

Recommend the best approach with a brief justification.""",
    },

    # Opus Fast prompts (balanced reasoning)
    "opus-fast": {
        "factual": """You are a knowledgeable expert. Answer this question with depth and accuracy:

{question}

Provide a comprehensive answer with examples where helpful. Cite sources if relevant.""",

        "analytical": """You are a careful analyst. Analyze this question thoroughly:

{question}

Break it down step-by-step. Consider multiple perspectives. Explain your reasoning.""",

        "creative": """You are an innovative thinker. Generate creative solutions for:

{question}

Provide 5-7 detailed ideas with pros and cons for each.""",

        "comparative": """You are a thorough comparison expert. Compare these options:

{question}

Create a detailed comparison matrix. Highlight tradeoffs.""",

        "exploratory": """You are an intellectual explorer. Investigate this question from multiple angles:

{question}

Explore different perspectives. Identify assumptions. Suggest areas for deeper inquiry.""",

        "decision_making": """You are a strategic advisor. Help decide:

{question}

Analyze the options thoroughly. Weigh pros/cons. Make a clear recommendation with reasoning.""",
    },

    # Opus Thinking prompts (deep reasoning)
    "opus-thinking": {
        "factual": """You are a rigorous knowledge expert. Research and answer this question comprehensively:

{question}

Provide deep accuracy. Explore nuance. Address edge cases. Cite evidence. Correct common misconceptions.""",

        "analytical": """You are a sophisticated analyst. Analyze this complex question deeply:

{question}

Use multiple analytical frameworks. Consider systemic factors. Identify hidden assumptions. Explore implications.""",

        "creative": """You are a visionary innovator. Generate transformative ideas for:

{question}

Explore novel combinations. Challenge assumptions. Provide detailed implementation paths.""",

        "comparative": """You are a master strategist at comparison. Deeply analyze:

{question}

Consider hidden factors. Explore long-term implications. Identify when different options excel.""",

        "exploratory": """You are a deep thinker. Explore this question thoroughly:

{question}

Consider philosophical implications. Explore multiple schools of thought. Identify paradoxes and tensions. Suggest synthesis.""",

        "decision_making": """You are a strategic thinker facing complex decisions:

{question}

Analyze deeply. Consider long-term consequences. Identify hidden tradeoffs. Recommend wisely.""",
    },
}

def get_prompt_template(model: str, domain: str) -> str:
    """Get prompt template for model + domain combination."""
    if model not in PROMPTS:
        model = "opus-fast"  # Default fallback
    if domain not in PROMPTS[model]:
        domain = "exploratory"  # Default fallback

    return PROMPTS[model][domain]

def render_prompt(template: str, question: str) -> str:
    """Render a prompt template with the actual question."""
    return template.replace("{question}", question)
