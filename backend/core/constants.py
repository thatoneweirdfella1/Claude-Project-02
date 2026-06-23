"""Constants for ADHD-to-AI Translator: routing rules, techniques, thresholds."""

from typing import Dict, List, Tuple
from models.enums import ModelTier, TechniqueID, QuestionType

# ============= ROUTING RULES (20 rules as per spec) =============
# Confidence weights for routing calculation
ROUTING_CONFIDENCE_WEIGHTS = {
    "consequence": 5,
    "evidence": 4,
    "ambiguity": 3,
    "novelty": 3,
    "complexity": 2,
    "scope": 2,
}

# Routing rules decision tree: (condition, model_tier, confidence_weight)
ROUTING_RULES = [
    # Rule 1: User override always wins
    {
        "id": 1,
        "name": "User Override",
        "condition": lambda meta: meta.get("user_override") is not None,
        "model": lambda meta: meta.get("user_override"),
        "confidence": 100,
    },
    # Rule 2: Consequence gate - high consequence forces Opus-Thinking
    {
        "id": 2,
        "name": "Consequence Gate",
        "condition": lambda meta: meta.get("consequence_score", 0) >= 4,
        "model": ModelTier.OPUS_THINKING,
        "confidence": 95,
    },
    # Rule 3: Very simple factual lookup - Haiku sufficient
    {
        "id": 3,
        "name": "Simple Factual",
        "condition": lambda meta: (
            meta.get("complexity", 0) <= 2
            and meta.get("question_type") == QuestionType.FACTUAL
            and meta.get("novelty", 0) <= 2
        ),
        "model": ModelTier.HAIKU,
        "confidence": 85,
    },
    # Rule 4: Straightforward analysis - Opus-Fast
    {
        "id": 4,
        "name": "Straightforward Analysis",
        "condition": lambda meta: (
            meta.get("complexity", 0) <= 5
            and meta.get("question_type") in [QuestionType.ANALYTICAL, QuestionType.TECHNICAL_TROUBLESHOOTING]
            and meta.get("certainty", 0) >= 6
        ),
        "model": ModelTier.OPUS_FAST,
        "confidence": 80,
    },
    # Rule 5: Product research or technical lookup - Opus-Fast
    {
        "id": 5,
        "name": "Product/Tech Lookup",
        "condition": lambda meta: meta.get("question_type") in [
            QuestionType.PRODUCT_RESEARCH,
            QuestionType.TECHNICAL_TROUBLESHOOTING,
        ],
        "model": ModelTier.OPUS_FAST,
        "confidence": 75,
    },
    # Rule 6: Complex analytical - Opus-Thinking
    {
        "id": 6,
        "name": "Complex Analytical",
        "condition": lambda meta: (
            meta.get("complexity", 0) >= 7
            and meta.get("question_type") == QuestionType.ANALYTICAL
        ),
        "model": ModelTier.OPUS_THINKING,
        "confidence": 85,
    },
    # Rule 7: Conceptual precision needed - Opus-Thinking
    {
        "id": 7,
        "name": "Conceptual Precision",
        "condition": lambda meta: meta.get("question_type") in [
            QuestionType.CONCEPTUAL,
            QuestionType.ETHICAL,
        ],
        "model": ModelTier.OPUS_THINKING,
        "confidence": 80,
    },
    # Rule 8: Health/Evidence - Opus-Thinking required
    {
        "id": 8,
        "name": "Health/Evidence",
        "condition": lambda meta: meta.get("question_type") in [
            QuestionType.HEALTH_MEDICAL,
        ],
        "model": ModelTier.OPUS_THINKING,
        "confidence": 90,
    },
    # Rule 9: Novel domain - escalate to Opus-Thinking
    {
        "id": 9,
        "name": "Novel Domain",
        "condition": lambda meta: (
            meta.get("novelty", 0) >= 8
            and meta.get("scope") == "broad"
        ),
        "model": ModelTier.OPUS_THINKING,
        "confidence": 75,
    },
    # Rule 10: Exploratory - Opus-Thinking for depth
    {
        "id": 10,
        "name": "Exploratory Questions",
        "condition": lambda meta: meta.get("question_type") == QuestionType.EXPLORATORY,
        "model": ModelTier.OPUS_THINKING,
        "confidence": 70,
    },
    # Rule 11: Creative - can use Opus-Fast
    {
        "id": 11,
        "name": "Creative (Fast)",
        "condition": lambda meta: (
            meta.get("question_type") == QuestionType.CREATIVE
            and meta.get("complexity", 0) <= 6
        ),
        "model": ModelTier.OPUS_FAST,
        "confidence": 70,
    },
    # Rule 12: Creative complex - Opus-Thinking
    {
        "id": 12,
        "name": "Creative Complex",
        "condition": lambda meta: (
            meta.get("question_type") == QuestionType.CREATIVE
            and meta.get("complexity", 0) > 6
        ),
        "model": ModelTier.OPUS_THINKING,
        "confidence": 75,
    },
    # Rule 13: Code - Opus-Fast for simple, Thinking for complex
    {
        "id": 13,
        "name": "Code Simple",
        "condition": lambda meta: (
            meta.get("question_type") == QuestionType.CODE
            and meta.get("complexity", 0) <= 5
        ),
        "model": ModelTier.OPUS_FAST,
        "confidence": 75,
    },
    # Rule 14: Code Complex
    {
        "id": 14,
        "name": "Code Complex",
        "condition": lambda meta: (
            meta.get("question_type") == QuestionType.CODE
            and meta.get("complexity", 0) > 5
        ),
        "model": ModelTier.OPUS_THINKING,
        "confidence": 80,
    },
    # Rule 15: Decision-making - Opus-Thinking
    {
        "id": 15,
        "name": "Decision Making",
        "condition": lambda meta: meta.get("question_type") == QuestionType.DECISION_MAKING,
        "model": ModelTier.OPUS_THINKING,
        "confidence": 80,
    },
    # Rule 16: Interpersonal - Opus-Thinking
    {
        "id": 16,
        "name": "Interpersonal",
        "condition": lambda meta: meta.get("question_type") == QuestionType.INTERPERSONAL,
        "model": ModelTier.OPUS_THINKING,
        "confidence": 75,
    },
    # Rule 17: Workflow/Meta - Opus-Fast
    {
        "id": 17,
        "name": "Workflow",
        "condition": lambda meta: meta.get("question_type") == QuestionType.WORKFLOW,
        "model": ModelTier.OPUS_FAST,
        "confidence": 70,
    },
    # Rule 18: High certainty low complexity - Haiku
    {
        "id": 18,
        "name": "High Certainty Simple",
        "condition": lambda meta: (
            meta.get("certainty", 0) >= 8
            and meta.get("complexity", 0) <= 3
        ),
        "model": ModelTier.HAIKU,
        "confidence": 75,
    },
    # Rule 19: Moderate everything - Opus-Fast default
    {
        "id": 19,
        "name": "Moderate Default",
        "condition": lambda meta: (
            4 <= meta.get("complexity", 5) <= 6
            and meta.get("certainty", 5) <= 7
        ),
        "model": ModelTier.OPUS_FAST,
        "confidence": 70,
    },
    # Rule 20: Default fallback - Opus-Fast
    {
        "id": 20,
        "name": "Default Fallback",
        "condition": lambda meta: True,
        "model": ModelTier.OPUS_FAST,
        "confidence": 50,
    },
]

# ============= CONFIDENCE THRESHOLDS =============

# Translation confidence thresholds
TRANSLATION_AUTO_OUTPUT_THRESHOLD = 80  # >= 80: auto-output
TRANSLATION_WARNING_THRESHOLD = 60  # 60-79: output with warning
TRANSLATION_CLARIFY_THRESHOLD = 60  # < 60: ask clarification

# Routing confidence thresholds
ROUTING_PROCEED_THRESHOLD = 75  # >= 75: proceed automatically
ROUTING_SHOW_OPTIONS_THRESHOLD = 60  # 60-74: show user options
ROUTING_ASK_THRESHOLD = 60  # < 60: ask user

# Technique selection
TECHNIQUE_THRESHOLD = 7  # >= 7/15: include technique
TECHNIQUE_SCORE_MAX = 15

# Max technique stacks per model
MAX_TECHNIQUES = {
    ModelTier.HAIKU: 6,
    ModelTier.OPUS_FAST: 6,
    ModelTier.OPUS_THINKING: 6,
}

# Token budgets per model (approximate)
TOKEN_BUDGET = {
    ModelTier.HAIKU: 300,
    ModelTier.OPUS_FAST: 500,
    ModelTier.OPUS_THINKING: 800,
}

# ============= TECHNIQUE METADATA (T01-T18) =============

TECHNIQUES_METADATA: Dict[str, Dict] = {
    "T01": {
        "id": TechniqueID.T01_PERMISSION_UNKNOWN,
        "name": "Permission to Say 'I Don't Know'",
        "description": "Explicitly tell the model it's better to say 'I don't know' than to guess",
        "injection_point": 2,
        "token_cost": 15,
        "model_compatibility": {ModelTier.HAIKU: 0.9, ModelTier.OPUS_FAST: 0.8, ModelTier.OPUS_THINKING: 0.7},
        "question_type_effectiveness": {
            QuestionType.FACTUAL: 0.95,
            QuestionType.HEALTH_MEDICAL: 0.95,
            QuestionType.LEGAL_CONSUMER: 0.9,
        },
    },
    "T02": {
        "id": TechniqueID.T02_CHAIN_OF_THOUGHT,
        "name": "Chain-of-Thought",
        "description": "Ask the model to show its reasoning step-by-step",
        "injection_point": 4,
        "token_cost": 30,
        "model_compatibility": {ModelTier.HAIKU: 0.75, ModelTier.OPUS_FAST: 0.9, ModelTier.OPUS_THINKING: 0.8},
        "question_type_effectiveness": {
            QuestionType.ANALYTICAL: 0.9,
            QuestionType.DECISION_MAKING: 0.85,
            QuestionType.CODE: 0.85,
        },
    },
    "T03": {
        "id": TechniqueID.T03_QUOTE_FIRST,
        "name": "Quote-First",
        "description": "Ask the model to cite sources before answering",
        "injection_point": 1,
        "token_cost": 20,
        "model_compatibility": {ModelTier.HAIKU: 0.85, ModelTier.OPUS_FAST: 0.9, ModelTier.OPUS_THINKING: 0.85},
        "question_type_effectiveness": {
            QuestionType.FACTUAL: 0.95,
            QuestionType.HEALTH_MEDICAL: 0.95,
            QuestionType.LEGAL_CONSUMER: 0.9,
        },
    },
    "T04": {
        "id": TechniqueID.T04_SELF_VERIFICATION,
        "name": "Self-Verification",
        "description": "Ask the model to check its own work for consistency",
        "injection_point": 5,
        "token_cost": 40,
        "model_compatibility": {ModelTier.HAIKU: 0.65, ModelTier.OPUS_FAST: 0.85, ModelTier.OPUS_THINKING: 0.9},
        "question_type_effectiveness": {
            QuestionType.ANALYTICAL: 0.85,
            QuestionType.CODE: 0.9,
            QuestionType.CONCEPTUAL: 0.8,
        },
    },
    "T05": {
        "id": TechniqueID.T05_ACCURACY_ROLE,
        "name": "Accuracy Role-Priming",
        "description": "Prime the model to adopt a role that prioritizes accuracy",
        "injection_point": 1,
        "token_cost": 10,
        "model_compatibility": {ModelTier.HAIKU: 0.8, ModelTier.OPUS_FAST: 0.85, ModelTier.OPUS_THINKING: 0.8},
        "question_type_effectiveness": {
            QuestionType.FACTUAL: 0.9,
            QuestionType.HEALTH_MEDICAL: 0.95,
            QuestionType.ANALYTICAL: 0.85,
        },
    },
    "T06": {
        "id": TechniqueID.T06_RAG,
        "name": "Retrieval-Augmented Generation",
        "description": "Ask the model to ground its answer in retrieved documents",
        "injection_point": 7,
        "token_cost": 50,
        "model_compatibility": {ModelTier.HAIKU: 0.7, ModelTier.OPUS_FAST: 0.85, ModelTier.OPUS_THINKING: 0.9},
        "question_type_effectiveness": {
            QuestionType.FACTUAL: 0.95,
            QuestionType.ANALYTICAL: 0.9,
            QuestionType.HEALTH_MEDICAL: 0.9,
        },
    },
    "T07": {
        "id": TechniqueID.T07_FEW_SHOT,
        "name": "Few-Shot Examples",
        "description": "Provide examples of the format/style you want",
        "injection_point": 8,
        "token_cost": 35,
        "model_compatibility": {ModelTier.HAIKU: 0.8, ModelTier.OPUS_FAST: 0.9, ModelTier.OPUS_THINKING: 0.85},
        "question_type_effectiveness": {
            QuestionType.CREATIVE: 0.9,
            QuestionType.CODE: 0.95,
            QuestionType.ANALYTICAL: 0.85,
        },
    },
    "T08": {
        "id": TechniqueID.T08_INSTRUCTION_HIERARCHY,
        "name": "Instruction Hierarchy",
        "description": "Clearly prioritize which instructions matter most",
        "injection_point": 3,
        "token_cost": 15,
        "model_compatibility": {ModelTier.HAIKU: 0.8, ModelTier.OPUS_FAST: 0.9, ModelTier.OPUS_THINKING: 0.85},
        "question_type_effectiveness": {
            QuestionType.ANALYTICAL: 0.85,
            QuestionType.CREATIVE: 0.8,
            QuestionType.CODE: 0.9,
        },
    },
    "T09": {
        "id": TechniqueID.T09_EXPLICIT_CONSTRAINTS,
        "name": "Explicit Constraints",
        "description": "Clearly state what the model should NOT do",
        "injection_point": 6,
        "token_cost": 20,
        "model_compatibility": {ModelTier.HAIKU: 0.85, ModelTier.OPUS_FAST: 0.9, ModelTier.OPUS_THINKING: 0.85},
        "question_type_effectiveness": {
            QuestionType.CREATIVE: 0.85,
            QuestionType.CODE: 0.95,
            QuestionType.ANALYTICAL: 0.8,
        },
    },
    "T10": {
        "id": TechniqueID.T10_OUTPUT_FORMAT,
        "name": "Output Format Specification",
        "description": "Explicitly define the format of the response",
        "injection_point": 9,
        "token_cost": 15,
        "model_compatibility": {ModelTier.HAIKU: 0.9, ModelTier.OPUS_FAST: 0.95, ModelTier.OPUS_THINKING: 0.9},
        "question_type_effectiveness": {
            QuestionType.ANALYTICAL: 0.95,
            QuestionType.CODE: 0.95,
            QuestionType.FACTUAL: 0.9,
        },
    },
    "T11": {
        "id": TechniqueID.T11_REASONING_DECOMPOSITION,
        "name": "Reasoning Decomposition",
        "description": "Break complex reasoning into smaller, checkable pieces",
        "injection_point": 5,
        "token_cost": 35,
        "model_compatibility": {ModelTier.HAIKU: 0.7, ModelTier.OPUS_FAST: 0.85, ModelTier.OPUS_THINKING: 0.95},
        "question_type_effectiveness": {
            QuestionType.ANALYTICAL: 0.9,
            QuestionType.DECISION_MAKING: 0.9,
            QuestionType.CODE: 0.85,
        },
    },
    "T12": {
        "id": TechniqueID.T12_QUESTION_REFRAMING,
        "name": "Question Reframing",
        "description": "Suggest alternative framings of the question",
        "injection_point": 10,
        "token_cost": 25,
        "model_compatibility": {ModelTier.HAIKU: 0.7, ModelTier.OPUS_FAST: 0.8, ModelTier.OPUS_THINKING: 0.9},
        "question_type_effectiveness": {
            QuestionType.EXPLORATORY: 0.9,
            QuestionType.DECISION_MAKING: 0.85,
            QuestionType.CONCEPTUAL: 0.9,
        },
    },
    "T13": {
        "id": TechniqueID.T13_ASSUMPTION_SURFACING,
        "name": "Assumption Surfacing",
        "description": "Explicitly surface hidden assumptions in the question",
        "injection_point": 11,
        "token_cost": 25,
        "model_compatibility": {ModelTier.HAIKU: 0.75, ModelTier.OPUS_FAST: 0.85, ModelTier.OPUS_THINKING: 0.95},
        "question_type_effectiveness": {
            QuestionType.CONCEPTUAL: 0.95,
            QuestionType.ANALYTICAL: 0.85,
            QuestionType.DECISION_MAKING: 0.9,
        },
    },
    "T14": {
        "id": TechniqueID.T14_SCOPE_LIMITATION,
        "name": "Scope Limitation",
        "description": "Clearly limit the scope of what should be answered",
        "injection_point": 12,
        "token_cost": 10,
        "model_compatibility": {ModelTier.HAIKU: 0.85, ModelTier.OPUS_FAST: 0.9, ModelTier.OPUS_THINKING: 0.85},
        "question_type_effectiveness": {
            QuestionType.ANALYTICAL: 0.85,
            QuestionType.EXPLORATORY: 0.9,
            QuestionType.DECISION_MAKING: 0.85,
        },
    },
    "T15": {
        "id": TechniqueID.T15_META_PROMPTING,
        "name": "Meta-Prompting",
        "description": "Ask the model to explain its prompting strategy",
        "injection_point": 13,
        "token_cost": 30,
        "model_compatibility": {ModelTier.HAIKU: 0.6, ModelTier.OPUS_FAST: 0.75, ModelTier.OPUS_THINKING: 0.9},
        "question_type_effectiveness": {
            QuestionType.WORKFLOW: 0.95,
            QuestionType.CONCEPTUAL: 0.85,
        },
    },
    "T16": {
        "id": TechniqueID.T16_STEP_COUNTING,
        "name": "Explicit Step Counting",
        "description": "Ask the model to number its reasoning steps",
        "injection_point": 14,
        "token_cost": 5,
        "model_compatibility": {ModelTier.HAIKU: 0.8, ModelTier.OPUS_FAST: 0.85, ModelTier.OPUS_THINKING: 0.8},
        "question_type_effectiveness": {
            QuestionType.ANALYTICAL: 0.8,
            QuestionType.CODE: 0.85,
            QuestionType.DECISION_MAKING: 0.75,
        },
    },
    "T17": {
        "id": TechniqueID.T17_CONFIDENCE_SCORING,
        "name": "Confidence Scoring",
        "description": "Ask the model to rate its confidence in each statement",
        "injection_point": 15,
        "token_cost": 20,
        "model_compatibility": {ModelTier.HAIKU: 0.75, ModelTier.OPUS_FAST: 0.85, ModelTier.OPUS_THINKING: 0.9},
        "question_type_effectiveness": {
            QuestionType.FACTUAL: 0.95,
            QuestionType.HEALTH_MEDICAL: 0.95,
            QuestionType.ANALYTICAL: 0.85,
        },
    },
    "T18": {
        "id": TechniqueID.T18_CONSTRAINT_VIOLATION,
        "name": "Constraint Violation Detection",
        "description": "Ask the model to flag if it violates stated constraints",
        "injection_point": 16,
        "token_cost": 10,
        "model_compatibility": {ModelTier.HAIKU: 0.85, ModelTier.OPUS_FAST: 0.9, ModelTier.OPUS_THINKING: 0.85},
        "question_type_effectiveness": {
            QuestionType.CODE: 0.95,
            QuestionType.CREATIVE: 0.8,
            QuestionType.ANALYTICAL: 0.8,
        },
    },
}

# ============= TECHNIQUE COMBINATION RULES =============

# Technique dependencies: if using A, you should use B
TECHNIQUE_DEPENDENCIES = [
    ("T08", "T01"),  # Instruction Hierarchy should follow Permission to Say Unknown
    ("T03", "T01"),  # Quote-First should follow Permission to Say Unknown
]

# Technique conflicts: never use together
TECHNIQUE_CONFLICTS = [
    ("T14", "T15"),  # Scope Limitation conflicts with Meta-Prompting
]

# Technique synergies: using together amplifies effect
TECHNIQUE_SYNERGIES = [
    ("T02", "T04"),  # CoT + Self-Verification
    ("T02", "T11"),  # CoT + Reasoning Decomposition
    ("T03", "T05"),  # Quote-First + Accuracy Role
    ("T05", "T02"),  # Accuracy Role + CoT
    ("T07", "T10"),  # Few-Shot + Output Format
    ("T08", "T09"),  # Instruction Hierarchy + Explicit Constraints
    ("T10", "T16"),  # Output Format + Step Counting
    ("T12", "T13"),  # Question Reframing + Assumption Surfacing
]

# Canonical technique injection order
TECHNIQUE_CANONICAL_ORDER = [
    "T03",  # Quote-First (foundation)
    "T01",  # Permission to Say Unknown
    "T04",  # Self-Verification
    "T02",  # Chain-of-Thought
    "T08",  # Instruction Hierarchy
    "T05",  # Accuracy Role
    "T06",  # RAG
    "T09",  # Explicit Constraints
    "T10",  # Output Format
    "T07",  # Few-Shot Examples
    "T11",  # Reasoning Decomposition
    "T12",  # Question Reframing
    "T13",  # Assumption Surfacing
    "T14",  # Scope Limitation
    "T15",  # Meta-Prompting
    "T16",  # Step Counting
    "T17",  # Confidence Scoring
    "T18",  # Constraint Violation Detection
]

# ============= TRANSLATION OPERATIONS =============

TRANSLATION_OPERATIONS_CONFIG = {
    "extract_core_question": {
        "name": "Extract Core Question",
        "description": "Identify and extract the actual question buried in the ramble",
        "order": 1,
    },
    "reorder_context": {
        "name": "Reorder Context",
        "description": "Move context before the core question if needed",
        "order": 2,
    },
    "normalize_emotional_language": {
        "name": "Normalize Emotional Language",
        "description": "Convert emotional language to neutral technical language",
        "order": 3,
    },
    "clarify_scope": {
        "name": "Clarify Scope",
        "description": "Make implicit scope explicit",
        "order": 4,
    },
    "surface_assumptions": {
        "name": "Surface Assumptions",
        "description": "Identify and surface hidden assumptions",
        "order": 5,
    },
    "decompose_compound_questions": {
        "name": "Decompose Compound Questions",
        "description": "Break multi-part questions into separate questions",
        "order": 6,
    },
}

# ============= LEARNING SYSTEM =============

LEARNING_TRIGGER_THRESHOLD = 15  # Start analysis after 15 questions
LEARNING_CONFIDENCE_THRESHOLD = 0.7  # 70% confidence before applying refined rules
LEARNING_ANALYSIS_INTERVAL = 10  # Run analysis every 10 questions after trigger

# ============= PHASE 11: MULTI-AI CONFIG =============

MULTI_AI_ACCOUNTS_MAX = 8
MULTI_AI_MODES_ENABLED = True
