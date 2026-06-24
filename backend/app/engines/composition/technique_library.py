from typing import Dict, List

TECHNIQUES = {
    "chain_of_thought": {
        "id": "chain_of_thought",
        "name": "Chain-of-Thought",
        "description": "Instruct model to reason step-by-step before answering",
        "tokens_overhead": 150,
        "template": "Think through this step-by-step:\n{question}",
        "compatible_with": ["self_verification", "quote_first"],
        "conflicts_with": ["short_answer"],
    },
    "quote_first": {
        "id": "quote_first",
        "name": "Quote-First",
        "description": "Ground answer in specific quotes or examples before generalizing",
        "tokens_overhead": 50,
        "template": "Quote specific examples first, then generalize:\n{question}",
        "compatible_with": ["chain_of_thought"],
        "conflicts_with": [],
    },
    "permission_to_say_no": {
        "id": "permission_to_say_no",
        "name": "Permission to Say 'I Don't Know'",
        "description": "Explicitly permit the model to decline if uncertain",
        "tokens_overhead": 20,
        "template": "If you're unsure about any part, explicitly say so. {question}",
        "compatible_with": [],
        "conflicts_with": [],
    },
    "self_verification": {
        "id": "self_verification",
        "name": "Self-Verification",
        "description": "Model checks its own reasoning before final answer",
        "tokens_overhead": 100,
        "template": "{question}\n\nVerify your reasoning: does this answer make sense?",
        "compatible_with": ["chain_of_thought"],
        "conflicts_with": [],
    },
    "role_priming": {
        "id": "role_priming",
        "name": "Role-Priming",
        "description": "Adopt a specific role or perspective for accuracy",
        "tokens_overhead": 80,
        "template": "As an expert in this domain: {question}",
        "compatible_with": ["chain_of_thought"],
        "conflicts_with": [],
    },
    "structured_output": {
        "id": "structured_output",
        "name": "Structured Output",
        "description": "Request response in specific format (bullets, JSON, outline)",
        "tokens_overhead": 30,
        "template": "{question}\n\nFormat answer as bullet points.",
        "compatible_with": [],
        "conflicts_with": [],
    },
    "scope_constraint": {
        "id": "scope_constraint",
        "name": "Explicit Scope",
        "description": "Define boundaries - what to include and exclude",
        "tokens_overhead": 40,
        "template": "{question}\n\nInclude: [specific aspects]. Exclude: [out of scope]",
        "compatible_with": [],
        "conflicts_with": [],
    },
    "few_shot": {
        "id": "few_shot",
        "name": "Few-Shot Examples",
        "description": "Provide examples of desired output format/quality",
        "tokens_overhead": 200,
        "template": "Examples: [EXAMPLE 1] [EXAMPLE 2]\n{question}",
        "compatible_with": [],
        "conflicts_with": [],
    },
    "contrarian": {
        "id": "contrarian",
        "name": "Contrarian View",
        "description": "Request opposing viewpoint to challenge assumptions",
        "tokens_overhead": 60,
        "template": "{question}\n\nAlso explain the opposing view.",
        "compatible_with": [],
        "conflicts_with": ["role_priming"],
    },
    "instruction_hierarchy": {
        "id": "instruction_hierarchy",
        "name": "Instruction Hierarchy",
        "description": "Prioritize: primary goal > constraints > format",
        "tokens_overhead": 25,
        "template": "PRIMARY: {question}\nConstraints: [list]\nFormat: [format]",
        "compatible_with": [],
        "conflicts_with": [],
    },
    "direct_answer": {
        "id": "direct_answer",
        "name": "Direct Answer First",
        "description": "Lead with answer, then explanation",
        "tokens_overhead": 20,
        "template": "{question}\n\nStart with a clear, direct answer, then explain.",
        "compatible_with": [],
        "conflicts_with": [],
    },
    "context_setting": {
        "id": "context_setting",
        "name": "Context Setting",
        "description": "Provide relevant background context",
        "tokens_overhead": 100,
        "template": "Context: [background]\n{question}",
        "compatible_with": [],
        "conflicts_with": [],
    },
    "clarification": {
        "id": "clarification",
        "name": "Ask for Clarification",
        "description": "Identify ambiguities and ask clarifying questions",
        "tokens_overhead": 50,
        "template": "{question}\n\nBefore answering, clarify: [ambiguities]",
        "compatible_with": [],
        "conflicts_with": [],
    },
    "trade_offs": {
        "id": "trade_offs",
        "name": "Explore Trade-offs",
        "description": "Discuss costs vs. benefits for different approaches",
        "tokens_overhead": 80,
        "template": "{question}\n\nFor each approach, discuss pros and cons.",
        "compatible_with": [],
        "conflicts_with": [],
    },
    "analogies": {
        "id": "analogies",
        "name": "Use Analogies",
        "description": "Explain using analogies to familiar concepts",
        "tokens_overhead": 60,
        "template": "{question}\n\nUse analogies where helpful.",
        "compatible_with": [],
        "conflicts_with": [],
    },
}

def get_technique(technique_id: str) -> Dict:
    """Get technique by ID."""
    return TECHNIQUES.get(technique_id)

def get_all_techniques() -> Dict:
    """Get all techniques."""
    return TECHNIQUES

def are_compatible(tech1_id: str, tech2_id: str) -> bool:
    """Check if two techniques are compatible."""
    tech1 = TECHNIQUES.get(tech1_id)
    tech2 = TECHNIQUES.get(tech2_id)

    if not tech1 or not tech2:
        return False

    # Check conflicts
    if tech2_id in tech1.get("conflicts_with", []):
        return False
    if tech1_id in tech2.get("conflicts_with", []):
        return False

    return True

def check_conflicts(technique_ids: List[str]) -> List[tuple]:
    """Check for conflicts in a list of techniques."""
    conflicts = []
    for i, tech1_id in enumerate(technique_ids):
        for tech2_id in technique_ids[i+1:]:
            if not are_compatible(tech1_id, tech2_id):
                conflicts.append((tech1_id, tech2_id))
    return conflicts
