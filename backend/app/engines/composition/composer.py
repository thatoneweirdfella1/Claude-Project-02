from typing import Dict, List, Any
from .technique_library import TECHNIQUES, are_compatible, check_conflicts

def select_techniques(translated_text: str, routed_model: str, domain: str) -> List[str]:
    """
    Select appropriate techniques based on question characteristics and routing.
    """
    selected = []

    # All questions benefit from permission to say no (safety)
    selected.append("permission_to_say_no")

    # Domain-specific selections
    if domain == "analytical":
        selected.append("chain_of_thought")  # Structured reasoning
        selected.append("quote_first")       # Ground in specifics

    elif domain == "exploratory":
        selected.append("chain_of_thought")
        selected.append("contrarian")       # Challenge assumptions

    elif domain == "creative":
        selected.append("structured_output") # Clear format expectation
        if len(translated_text) < 100:
            selected.append("few_shot")  # Show examples for brevity

    elif domain == "decision_making":
        selected.append("trade_offs")        # Weigh options
        selected.append("direct_answer")     # Clear recommendation first

    elif domain == "factual":
        selected.append("direct_answer")     # Quick, clear answer
        # Don't add unnecessary techniques for simple questions

    elif domain == "comparative":
        selected.append("structured_output")  # Side-by-side comparison
        selected.append("trade_offs")         # Pros/cons

    # Model-specific adjustments
    if routed_model == "haiku":
        # Haiku works best with fewer, simpler techniques
        if len(selected) > 2:
            selected = selected[:2]

    # Check for conflicts and resolve
    conflicts = check_conflicts(selected)
    if conflicts:
        # Remove conflicting techniques (keep first one)
        to_remove = set()
        for tech1, tech2 in conflicts:
            to_remove.add(tech2)
        selected = [t for t in selected if t not in to_remove]

    return selected

def build_prompt(translated_text: str, selected_techniques: List[str], domain: str, routed_model: str) -> str:
    """
    Build final prompt by combining techniques + question.
    """
    prompt_parts = []

    # System context based on model
    if routed_model == "opus-thinking":
        prompt_parts.append("Take your time to think through this carefully.\n")
    elif routed_model == "opus-fast":
        prompt_parts.append("Provide a clear, efficient answer.\n")
    else:  # Haiku
        prompt_parts.append("Be concise but complete.\n")

    # Apply techniques in order
    for tech_id in selected_techniques:
        tech = TECHNIQUES.get(tech_id)
        if tech:
            # Add technique instruction
            template = tech.get("template", "")
            if template and "{question}" not in template:
                prompt_parts.append(template)

    # Add the actual question
    if "{question}" in "".join(prompt_parts):
        # Replace {question} placeholder
        combined = "\n".join(prompt_parts)
        prompt_parts = [combined.replace("{question}", translated_text)]
    else:
        # Add question at end
        prompt_parts.append(f"\nQuestion: {translated_text}")

    final_prompt = "\n".join(prompt_parts)
    return final_prompt

def estimate_tokens(prompt: str, answer_estimate: str = "medium") -> int:
    """
    Estimate token count (rough: ~4 chars = 1 token for English).
    """
    base_tokens = len(prompt) // 4
    # Add estimate for answer (varies by model and complexity)
    answer_tokens = {
        "short": 50,
        "medium": 200,
        "long": 500,
    }
    return base_tokens + answer_tokens.get(answer_estimate, 200)

def score_composition(selected_techniques: List[str], translated_text: str, domain: str) -> int:
    """
    Score confidence in composition (0-100).
    """
    score = 70  # Base score

    # Bonus: techniques are well-matched to domain
    expected_techniques_by_domain = {
        "analytical": ["chain_of_thought", "quote_first"],
        "exploratory": ["chain_of_thought", "contrarian"],
        "creative": ["structured_output"],
        "decision_making": ["trade_offs", "direct_answer"],
        "factual": ["direct_answer"],
        "comparative": ["structured_output", "trade_offs"],
    }

    expected = expected_techniques_by_domain.get(domain, [])
    matched = sum(1 for t in selected_techniques if t in expected)
    if matched > 0:
        score += min(15, matched * 5)

    # Penalty: too many techniques (token overhead)
    if len(selected_techniques) > 5:
        score -= 10

    # Bonus: includes permission to say no
    if "permission_to_say_no" in selected_techniques:
        score += 5

    return min(100, max(50, score))
