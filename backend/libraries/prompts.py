"""Prompt library: 46+ templates across 10 categories for Haiku and Opus variants."""

from typing import Dict, List
from models.enums import ModelTier

# 10 categories of prompts addressing ADHD-specific needs
PROMPT_CATEGORIES = [
    "initiation",  # Help with starting tasks
    "breaking_down",  # Break overwhelm into steps
    "managing_overwhelm",  # Manage cognitive load
    "focus",  # Maintain focus
    "decision_fatigue",  # Reduce decision paralysis
    "hyperfocus_control",  # Manage hyperfocus
    "comprehension",  # Understand complex concepts
    "accountability",  # Build accountability
    "self_awareness",  # Self-reflection and metacognition
    "task_utility",  # Task-specific utility
]

# Prompt templates indexed by (category, use_case, model_tier)
PROMPT_TEMPLATES: Dict[str, Dict[str, Dict[str, str]]] = {
    # ============= INITIATION =============
    "initiation": {
        "simple_start": {
            ModelTier.HAIKU: """You are a helpful assistant. The user is about to ask you something and may present it in a rambling or unclear way. Your job is to understand what they actually need and provide a clear, direct answer.

Question: {question}

Answer directly and concisely.""",
            ModelTier.OPUS_FAST: """You are a helpful assistant skilled at understanding unclear or rambling questions. The user has provided a question that may be scattered or include tangential context. Your job is to:
1. Identify the core question
2. Note any important context they've provided
3. Answer the actual question they're asking

Question: {question}

Be direct and helpful.""",
            ModelTier.OPUS_THINKING: """You are an expert assistant. The user has provided a question that may be unclear, rambling, or include tangential context. Your task is to:
1. Understand the actual underlying need
2. Clarify any ambiguities in your own reasoning
3. Provide a thorough, well-reasoned answer

Take time to think through this carefully before responding.

Question: {question}""",
        },
        "motivated_start": {
            ModelTier.HAIKU: """Help me get started on this. I know what I want to do, but I'm stuck on how to begin.

{question}

Give me the first concrete step I should take.""",
            ModelTier.OPUS_FAST: """I'm stuck on initiation paralysis. I know what I want to do but can't seem to start. Help me break through this by:
1. Acknowledging why starting feels hard
2. Suggesting the absolute smallest first step
3. Explaining why starting with that step makes sense

My task: {question}""",
            ModelTier.OPUS_THINKING: """I'm experiencing initiation paralysis. Help me understand and overcome it. Consider:
- Why I might be stuck (perfectionism, overwhelm, unclear scope, etc.)
- What the actual barrier is
- The smallest possible first step
- How to make that step feel manageable

Task: {question}""",
        },
    },
    # ============= BREAKING DOWN =============
    "breaking_down": {
        "decompose": {
            ModelTier.HAIKU: """Break this down into simple steps:

{question}

List each step clearly, one per line.""",
            ModelTier.OPUS_FAST: """I'm overwhelmed by this task. Break it down into small, manageable steps that I can do one at a time:

{question}

For each step, explain why it matters and what it enables.""",
            ModelTier.OPUS_THINKING: """I need help breaking down this complex task. Provide:
1. A clear decomposition into 3-7 major phases
2. For each phase: 2-3 concrete sub-steps
3. Dependencies between phases
4. Why this particular breakdown makes sense

Task: {question}""",
        },
    },
    # ============= MANAGING OVERWHELM =============
    "managing_overwhelm": {
        "prioritize": {
            ModelTier.HAIKU: """I'm overwhelmed by all of this. What matters most?

{question}

Tell me the 1-3 most important things to focus on first.""",
            ModelTier.OPUS_FAST: """I'm overwhelmed by too many options/requirements. Help me prioritize:

{question}

For each high-priority item, explain why it matters relative to others.""",
            ModelTier.OPUS_THINKING: """I'm cognitively overwhelmed. Help me reduce this to what actually matters:
1. What's the core problem vs. noise?
2. What can be deferred or ignored?
3. What's the minimal viable solution?
4. What creates the most value per effort?

Situation: {question}""",
        },
    },
    # ============= FOCUS =============
    "focus": {
        "clarity": {
            ModelTier.HAIKU: """Help me focus on what I'm actually trying to do here:

{question}

What's the single goal I should be working toward?""",
            ModelTier.OPUS_FAST: """I keep getting distracted from the actual goal. Help me identify:
1. What I'm really trying to accomplish
2. What details are important vs. distracting
3. How to know if I'm making progress

Context: {question}""",
            ModelTier.OPUS_THINKING: """I'm struggling to maintain focus. Help me by:
1. Clarifying the actual goal (strip away noise)
2. Identifying distractions (internal and external)
3. Suggesting a focus strategy specific to this task
4. Defining clear progress markers

Task: {question}""",
        },
    },
    # ============= DECISION FATIGUE =============
    "decision_fatigue": {
        "choose": {
            ModelTier.HAIKU: """I'm stuck deciding between these options:

{question}

What should I choose and why?""",
            ModelTier.OPUS_FAST: """I'm paralyzed by too many options and decision paralysis. Help me by:
1. Identifying the actual decision criterion
2. Eliminating options that don't meet core criteria
3. Comparing the remaining options
4. Recommending the best choice

Situation: {question}""",
            ModelTier.OPUS_THINKING: """I'm experiencing decision fatigue. Help me make a better decision by:
1. Clarifying what actually matters (core vs. preferences)
2. What I'm optimizing for (speed, quality, cost, learning, etc.)
3. What reversible vs. irreversible choices are at stake
4. A clear recommendation with reasoning

Decision: {question}""",
        },
    },
    # ============= HYPERFOCUS CONTROL =============
    "hyperfocus_control": {
        "bound": {
            ModelTier.HAIKU: """I'm hyperfocusing on this and losing track of time/other needs. Help me:

{question}

How do I stay engaged but maintain boundaries?""",
            ModelTier.OPUS_FAST: """I'm in hyperfocus and I know I should stop soon, but I don't want to lose momentum. Help me:
1. Understand what's pulling my focus
2. Set boundaries that won't break my flow
3. Create a way to resume later without friction

Activity: {question}""",
            ModelTier.OPUS_THINKING: """I'm hyperfocused on something, which is good, but I'm neglecting other responsibilities. Help me design:
1. A focus boundary that preserves flow
2. Transition strategies that don't break momentum
3. Context preservation so I can resume easily
4. How to honor both the hyperfocus AND other needs

Activity: {question}""",
        },
    },
    # ============= COMPREHENSION =============
    "comprehension": {
        "explain": {
            ModelTier.HAIKU: """Explain this to me simply:

{question}

Use examples I can understand.""",
            ModelTier.OPUS_FAST: """I'm struggling to understand this concept. Explain it by:
1. Starting with a concrete example
2. Building up to the abstract principle
3. Showing how it connects to things I know
4. Checking your explanation with an example

Concept: {question}""",
            ModelTier.OPUS_THINKING: """I'm struggling to really understand this. Help by:
1. Identifying which part is confusing specifically
2. Explaining the foundational concepts I might be missing
3. Using multiple analogies or examples
4. Showing the principle from different angles
5. Testing my understanding with a question

Topic: {question}""",
        },
    },
    # ============= ACCOUNTABILITY =============
    "accountability": {
        "accountability": {
            ModelTier.HAIKU: """I need accountability for this:

{question}

What should I track and report on?""",
            ModelTier.OPUS_FAST: """I work better with external accountability. Help me design:
1. Clear, measurable progress markers
2. What to report on and how often
3. How to structure check-ins
4. What success looks like

Goal: {question}""",
            ModelTier.OPUS_THINKING: """I need to build an accountability system for myself. Help me design:
1. Specific, measurable milestones
2. A realistic check-in frequency
3. What metrics matter vs. what's noise
4. How to handle setbacks without shame
5. How to adjust without losing commitment

Goal: {question}""",
        },
    },
    # ============= SELF-AWARENESS =============
    "self_awareness": {
        "reflect": {
            ModelTier.HAIKU: """What's really going on here?

{question}

Help me understand what I'm actually feeling/thinking.""",
            ModelTier.OPUS_FAST: """I want to understand myself better in this situation. Help by:
1. Identifying the emotional component
2. What beliefs or assumptions I'm making
3. What I might be missing or misinterpreting
4. A question to deepen my self-understanding

Situation: {question}""",
            ModelTier.OPUS_THINKING: """I'm trying to understand myself better in this context. Help me:
1. Identify the underlying emotion or need
2. Understand what I'm really asking or struggling with
3. Recognize patterns in how I respond
4. Suggest a perspective I might not be seeing
5. Ask me a question that deepens my insight

Reflection: {question}""",
        },
    },
    # ============= TASK-SPECIFIC UTILITY =============
    "task_utility": {
        "workflow": {
            ModelTier.HAIKU: """Help me with this workflow/task:

{question}

Give me practical steps.""",
            ModelTier.OPUS_FAST: """I need practical help with this:

{question}

Provide step-by-step guidance with concrete examples.""",
            ModelTier.OPUS_THINKING: """I need help with this complex task:

{question}

Provide:
1. A clear approach/strategy
2. Step-by-step guidance
3. Key decision points
4. Common pitfalls to avoid
5. How to know if you're on track""",
        },
    },
}

# Get template by category and model tier
def get_template(
    category: str, use_case: str, model_tier: ModelTier
) -> str:
    """Get a prompt template."""
    try:
        return PROMPT_TEMPLATES[category][use_case][model_tier]
    except KeyError:
        # Fallback to default template
        return PROMPT_TEMPLATES["task_utility"]["workflow"][model_tier]


def list_templates() -> Dict[str, List[str]]:
    """List all available templates."""
    result = {}
    for category, templates in PROMPT_TEMPLATES.items():
        result[category] = list(templates.keys())
    return result
