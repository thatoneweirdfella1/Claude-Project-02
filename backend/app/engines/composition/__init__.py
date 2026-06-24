import uuid
from typing import Dict, List, Any
from .composer import select_techniques, build_prompt, estimate_tokens, score_composition
from .technique_library import TECHNIQUES

def compose(translated_text: str, routed_model: str, domain: str) -> Dict[str, Any]:
    """
    Compose final prompt with selected techniques.
    Returns: {
        "id": str,
        "techniques": [
            {
                "id": str,
                "name": str,
                "description": str,
                "confidence": int,
                "tokens_overhead": int
            }
        ],
        "final_prompt": str,
        "estimated_tokens": int,
        "confidence": int
    }
    """
    # Select techniques
    selected_technique_ids = select_techniques(translated_text, routed_model, domain)

    # Build technique details
    techniques = []
    total_overhead = 0
    for tech_id in selected_technique_ids:
        tech = TECHNIQUES.get(tech_id)
        if tech:
            techniques.append({
                "id": tech_id,
                "name": tech["name"],
                "description": tech["description"],
                "confidence": 85,  # Technique confidence
                "tokens_overhead": tech["tokens_overhead"],
            })
            total_overhead += tech["tokens_overhead"]

    # Build final prompt
    final_prompt = build_prompt(translated_text, selected_technique_ids, domain, routed_model)

    # Estimate tokens
    estimated_tokens = estimate_tokens(final_prompt)

    # Score composition
    confidence = score_composition(selected_technique_ids, translated_text, domain)

    return {
        "id": str(uuid.uuid4()),
        "techniques": techniques,
        "final_prompt": final_prompt,
        "estimated_tokens": estimated_tokens,
        "confidence": confidence,
        "selected_technique_ids": selected_technique_ids,  # For later use
    }
