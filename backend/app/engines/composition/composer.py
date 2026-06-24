from typing import Dict, List, Any
from .technique_library import TECHNIQUES, are_compatible, check_conflicts
from ...libraries.effectiveness import get_technique_effectiveness

def select_techniques(translated_text: str, routed_model: str, domain: str) -> List[str]:
    """
    Select appropriate techniques based on effectiveness matrices and domain.
    Uses effectiveness scores to pick best techniques for the question type and model.
    """
    selected = []

    # All questions benefit from permission to say no (safety)
    selected.append("permission_to_say_no")

    # Score all techniques by effectiveness in this domain
    technique_scores = []
    for technique_id in TECHNIQUES.keys():
        if technique_id == "permission_to_say_no":
            continue  # Already added
        effectiveness = get_technique_effectiveness(technique_id, domain)
        technique_scores.append((technique_id, effectiveness))

    # Sort by effectiveness (highest first)
    technique_scores.sort(key=lambda x: x[1], reverse=True)

    # Model-specific limit on techniques
    max_techniques = {
        "haiku": 2,      # Keep it simple for fast model
        "opus-fast": 4,  # Balanced
        "opus-thinking": 5,  # Can handle more complexity
    }
    max_tech = max_techniques.get(routed_model, 3)

    # Add top-scoring techniques up to the limit
    for tech_id, _score in technique_scores[:max_tech]:
        # Check compatibility with already-selected techniques
        compatible = all(are_compatible(tech_id, selected_tech) for selected_tech in selected)
        if compatible:
            selected.append(tech_id)
        if len(selected) >= max_tech + 1:  # +1 because permission_to_say_no already added
            break

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
    Build final prompt using the prompt library template + techniques.
    """
    from ...libraries.prompts import get_prompt_template, render_prompt as render_prompt_template

    # Get base prompt template from library
    template = get_prompt_template(routed_model, domain)

    # Inject selected techniques into the prompt
    technique_injections = []
    for tech_id in selected_techniques:
        tech = TECHNIQUES.get(tech_id)
        if tech:
            template = tech.get("template", "")
            if template and "{question}" not in template:
                technique_injections.append(template)

    # Build the final prompt
    if technique_injections:
        injected = "\n\n".join(technique_injections)
        final_prompt = f"{injected}\n\n{render_prompt_template(template, translated_text)}"
    else:
        final_prompt = render_prompt_template(template, translated_text)

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
