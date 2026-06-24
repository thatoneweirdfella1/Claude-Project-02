from typing import Dict, List, Any
from .technique_library import TECHNIQUES, are_compatible, check_conflicts
from ...libraries.effectiveness import get_technique_effectiveness
from ..flow_preservation import preserve_exploration_mode, validate_response_for_flow_preservation

def select_techniques(translated_text: str, routed_model: str, domain: str) -> List[str]:
    """
    Select appropriate techniques based on effectiveness matrices and domain.
    Uses effectiveness scores to pick best techniques for the question type and model.
    Considers model-specific capabilities and technique interactions.
    """
    selected = []

    # All questions benefit from permission to say no (safety)
    selected.append("permission_to_say_no")

    # Score all techniques by multiple factors
    technique_scores = []
    for technique_id in TECHNIQUES.keys():
        if technique_id == "permission_to_say_no":
            continue  # Already added

        effectiveness = get_technique_effectiveness(technique_id, domain)
        model_fit = score_technique_model_fit(technique_id, routed_model)
        domain_fit = effectiveness

        # Combined score: weighted average
        combined_score = (effectiveness * 0.5) + (model_fit * 0.5)
        technique_scores.append((technique_id, combined_score, effectiveness))

    # Sort by combined score (highest first)
    technique_scores.sort(key=lambda x: x[1], reverse=True)

    # Model-specific limits
    max_techniques = {
        "haiku": 2,      # Keep it simple: base + 1 extra
        "opus-fast": 4,  # Balanced: base + 3 extra
        "opus-thinking": 6,  # Can handle more: base + 5 extra
    }
    max_tech = max_techniques.get(routed_model, 4)

    # Add top-scoring techniques up to the limit
    for tech_id, combined_score, effectiveness in technique_scores:
        # Check compatibility with already-selected techniques
        compatible = all(are_compatible(tech_id, selected_tech) for selected_tech in selected)

        if compatible:
            # Model-specific technique recommendations
            if should_include_technique(tech_id, routed_model, domain):
                selected.append(tech_id)

        if len(selected) >= max_tech + 1:  # +1 because permission_to_say_no already added
            break

    # Check for conflicts and resolve intelligently
    conflicts = check_conflicts(selected)
    if conflicts:
        # Remove lower-priority conflicting techniques
        to_remove = set()
        for tech1, tech2 in conflicts:
            # Prefer the one with higher effectiveness score
            tech1_effectiveness = get_technique_effectiveness(tech1, domain)
            tech2_effectiveness = get_technique_effectiveness(tech2, domain)

            if tech1_effectiveness >= tech2_effectiveness:
                to_remove.add(tech2)
            else:
                to_remove.add(tech1)

        selected = [t for t in selected if t not in to_remove]

    return selected


def score_technique_model_fit(technique_id: str, model: str) -> float:
    """Score how well a technique fits a specific model."""
    scores = {
        "haiku": {
            "permission_to_say_no": 95,
            "direct_answer": 90,
            "structured_output": 85,
            "role_priming": 70,
            "chain_of_thought": 60,  # Haiku can do it but limited
            "self_verification": 50,  # Too heavy for Haiku
            "few_shot": 40,  # Too token-expensive for Haiku
        },
        "opus-fast": {
            "permission_to_say_no": 95,
            "chain_of_thought": 90,
            "structured_output": 85,
            "role_priming": 85,
            "direct_answer": 80,
            "trade_offs": 85,
            "self_verification": 75,
            "few_shot": 70,
        },
        "opus-thinking": {
            "permission_to_say_no": 95,
            "chain_of_thought": 95,  # Thinking excels at step-by-step
            "self_verification": 90,  # Thinking is great at checking itself
            "contrarian": 90,  # Can handle multiple viewpoints
            "few_shot": 85,
            "role_priming": 85,
            "trade_offs": 90,
            "structured_output": 80,
        }
    }

    # Get technique-specific score for this model
    if model in scores:
        return scores[model].get(technique_id, 60)

    # Default score for unknown techniques
    return 60


def should_include_technique(technique_id: str, model: str, domain: str) -> bool:
    """Determine if a technique should be included for this model/domain combo."""
    # Never include techniques with very low model fit
    fit = score_technique_model_fit(technique_id, model)
    if fit < 40:
        return False

    # Model-specific exclusions
    if model == "haiku":
        # Haiku should avoid complex techniques
        if technique_id in ["few_shot", "contrarian", "self_verification"]:
            return False

    if model == "haiku" and domain in ["exploratory", "analytical"]:
        # Haiku not great for complex reasoning domains
        if technique_id in ["chain_of_thought"]:
            return fit >= 70  # Only if good fit

    return True

def build_prompt(translated_text: str, selected_techniques: List[str], domain: str, routed_model: str) -> str:
    """
    Build final prompt using the prompt library template + techniques intelligently.
    Techniques are layered coherently, not just concatenated.
    """
    from ...libraries.prompts import get_prompt_template, render_prompt as render_prompt_template

    # Get base prompt template from library
    template = get_prompt_template(routed_model, domain)

    # Render base prompt with question
    base_prompt = render_prompt_template(template, translated_text)

    # Organize techniques by type for coherent layering
    system_techniques = []  # Permission to say no, instruction hierarchy
    reasoning_techniques = []  # Chain of thought, self verification
    format_techniques = []  # Structured output, direct answer
    analysis_techniques = []  # Role priming, contrarian, analogies, trade offs
    support_techniques = []  # Context setting, clarification, few shot

    for tech_id in selected_techniques:
        if tech_id == "permission_to_say_no":
            system_techniques.append(tech_id)
        elif tech_id in ["chain_of_thought", "self_verification"]:
            reasoning_techniques.append(tech_id)
        elif tech_id in ["structured_output", "direct_answer", "instruction_hierarchy"]:
            format_techniques.append(tech_id)
        elif tech_id in ["role_priming", "contrarian", "analogies", "trade_offs", "scope_constraint"]:
            analysis_techniques.append(tech_id)
        elif tech_id in ["context_setting", "clarification", "few_shot", "quote_first"]:
            support_techniques.append(tech_id)
        else:
            analysis_techniques.append(tech_id)

    # Build coherent prompt by layering techniques in order
    prompt_parts = []

    # 1. System-level instructions (safety first)
    for tech_id in system_techniques:
        tech = TECHNIQUES.get(tech_id)
        if tech and "{question}" not in tech.get("template", ""):
            prompt_parts.append(tech.get("template", ""))

    # 2. Support/context (set up the problem)
    for tech_id in support_techniques[:2]:  # Limit to avoid bloat
        tech = TECHNIQUES.get(tech_id)
        if tech and "{question}" not in tech.get("template", ""):
            prompt_parts.append(tech.get("template", ""))

    # 3. Analysis instructions (how to think about it)
    for tech_id in analysis_techniques[:2]:  # Limit to avoid bloat
        tech = TECHNIQUES.get(tech_id)
        if tech and "{question}" not in tech.get("template", ""):
            prompt_parts.append(tech.get("template", ""))

    # 4. Reasoning instructions (the thinking process)
    for tech_id in reasoning_techniques:
        tech = TECHNIQUES.get(tech_id)
        if tech and "{question}" not in tech.get("template", ""):
            prompt_parts.append(tech.get("template", ""))

    # 5. Base prompt with question
    prompt_parts.append(base_prompt)

    # 6. Format instructions (how to present answer)
    for tech_id in format_techniques:
        tech = TECHNIQUES.get(tech_id)
        if tech and "{question}" not in tech.get("template", ""):
            prompt_parts.append(tech.get("template", ""))

    # Join with double newlines for clarity
    final_prompt = "\n\n".join([p for p in prompt_parts if p])

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
    Based on domain fit, technique compatibility, and prompt coherence.
    """
    score = 65  # Base score

    # Domain-specific technique expectations
    expected_techniques_by_domain = {
        "analytical": ["chain_of_thought", "quote_first", "self_verification"],
        "exploratory": ["chain_of_thought", "contrarian", "analogies"],
        "creative": ["structured_output", "brainstorm", "role_priming"],
        "decision_making": ["trade_offs", "direct_answer", "self_verification"],
        "factual": ["direct_answer", "quote_first", "context_setting"],
        "comparative": ["structured_output", "trade_offs", "direct_answer"],
    }

    # Bonus: techniques are well-matched to domain
    expected = expected_techniques_by_domain.get(domain, [])
    matched = sum(1 for t in selected_techniques if t in expected)
    if matched >= 2:
        score += min(20, matched * 7)
    elif matched == 1:
        score += 10

    # Bonus: good technique diversity (not all same type)
    technique_types = categorize_techniques(selected_techniques)
    if len(technique_types) >= 3:
        score += 10
    elif len(technique_types) >= 2:
        score += 5

    # Penalty: too many techniques (token overhead and confusion)
    if len(selected_techniques) > 6:
        score -= 15
    elif len(selected_techniques) > 5:
        score -= 8

    # Bonus: includes safety technique
    if "permission_to_say_no" in selected_techniques:
        score += 8

    # Bonus: techniques are compatible (no conflicts)
    conflicts = check_conflicts(selected_techniques)
    if not conflicts:
        score += 5
    else:
        score -= 10

    # Penalty: question text is very unclear/long (hard to compose good prompt for)
    if len(translated_text) > 500:
        score -= 5
    if len(translated_text) > 800:
        score -= 10

    return min(100, max(50, score))


def categorize_techniques(technique_ids: List[str]) -> set:
    """Categorize techniques by type."""
    categories = set()

    reasoning = {"chain_of_thought", "self_verification"}
    format_output = {"structured_output", "direct_answer", "instruction_hierarchy"}
    analysis = {"role_priming", "contrarian", "analogies", "trade_offs", "scope_constraint"}
    support = {"context_setting", "clarification", "few_shot", "quote_first"}
    safety = {"permission_to_say_no"}

    for tech_id in technique_ids:
        if tech_id in reasoning:
            categories.add("reasoning")
        elif tech_id in format_output:
            categories.add("format")
        elif tech_id in analysis:
            categories.add("analysis")
        elif tech_id in support:
            categories.add("support")
        elif tech_id in safety:
            categories.add("safety")

    return categories


def apply_flow_preservation(response: str, user_query: str = "") -> Dict[str, Any]:
    """
    Apply Phase 2-Zero flow preservation to a response.

    Detects and removes flow-breaking patterns that shatter ADHD hyperfocus:
    - Unsolicited epistemic self-correction
    - Over-caveating that drowns signal
    - Frame-shifting that treats tangents as errors
    - Premature convergence attempts

    Returns dict with:
    - 'response': flow-preserved response text
    - 'is_valid': whether response passed flow-preservation check
    - 'issues': list of detected flow-breaking patterns (if any)
    """
    # First, validate and detect issues
    is_valid, issues = validate_response_for_flow_preservation(response)

    # Apply preservation mode if issues detected
    if not is_valid:
        preserved = preserve_exploration_mode(response)
    else:
        preserved = response

    return {
        "response": preserved,
        "is_valid": is_valid,
        "issues": issues,
        "applied_flow_preservation": not is_valid,
    }
