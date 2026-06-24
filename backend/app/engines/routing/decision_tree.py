from typing import Dict, Any

def analyze_question_dimensions(text: str) -> Dict[str, Any]:
    """
    Analyze question across 6 dimensions:
    1. Complexity (1-10)
    2. Domain (factual, analytical, creative, comparative, exploratory, decision-making)
    3. Scope (narrow, medium, broad)
    4. Certainty (clear right answer vs exploratory)
    5. Time sensitivity (speed matters?)
    6. Depth requirement (surface vs deep)
    """
    dimensions = {
        "complexity": estimate_complexity(text),
        "domain": detect_domain(text),
        "scope": detect_scope(text),
        "certainty": detect_certainty(text),
        "time_sensitivity": detect_time_sensitivity(text),
        "depth_requirement": detect_depth(text),
    }
    return dimensions

def estimate_complexity(text: str) -> int:
    """Estimate complexity 1-10."""
    complexity = 3  # Base

    # Multi-part questions add complexity
    complexity += min(3, text.count("?") - 1)

    # Long questions usually more complex
    if len(text) > 300:
        complexity += 2
    elif len(text) > 150:
        complexity += 1

    # Keywords that indicate higher complexity
    complex_keywords = [
        "architecture", "design", "tradeoffs", "best practice",
        "novel", "research", "ambiguous", "unclear"
    ]
    complexity += sum(1 for kw in complex_keywords if kw in text.lower())

    return min(10, max(1, complexity))

def detect_domain(text: str) -> str:
    """Detect question domain."""
    domains = {
        "factual": ["what is", "define", "explain", "how do", "when", "where"],
        "analytical": ["why", "analyze", "evaluate", "compare", "pros and cons"],
        "creative": ["generate", "create", "design", "brainstorm", "suggest"],
        "comparative": ["difference between", "vs", "versus", "which is better"],
        "exploratory": ["what if", "could", "imagine", "explore"],
        "decision_making": ["should", "recommend", "choose", "best way"]
    }

    text_lower = text.lower()
    scores = {}

    for domain, keywords in domains.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[domain] = score

    if scores:
        return max(scores, key=scores.get)
    return "exploratory"

def detect_scope(text: str) -> str:
    """Detect scope: narrow, medium, broad."""
    broad_words = ["all", "every", "everything", "comprehensive", "full", "complete"]
    narrow_words = ["specific", "particular", "just", "only", "whether", "should i"]

    broad_count = sum(1 for word in broad_words if word in text.lower())
    narrow_count = sum(1 for word in narrow_words if word in text.lower())

    if broad_count > narrow_count:
        return "broad"
    elif narrow_count > broad_count:
        return "narrow"
    return "medium"

def detect_certainty(text: str) -> str:
    """Detect if there's a clear right answer or it's exploratory."""
    uncertain_words = ["what if", "could", "imagine", "explore", "brainstorm", "maybe", "possibly"]
    certain_words = ["what is", "define", "when", "where", "who", "how many"]

    uncertain_count = sum(1 for word in uncertain_words if word in text.lower())
    certain_count = sum(1 for word in certain_words if word in text.lower())

    if uncertain_count > certain_count:
        return "exploratory"
    elif certain_count > uncertain_count:
        return "clear"
    return "medium"

def detect_time_sensitivity(text: str) -> str:
    """Detect if speed matters."""
    urgent_words = ["quick", "fast", "asap", "immediately", "soon", "now"]
    casual_words = ["eventually", "when you have time", "no rush"]

    urgent_count = sum(1 for word in urgent_words if word in text.lower())
    casual_count = sum(1 for word in casual_words if word in text.lower())

    if urgent_count > casual_count:
        return "high"
    elif casual_count > urgent_count:
        return "low"
    return "medium"

def detect_depth(text: str) -> str:
    """Detect depth requirement: surface, medium, deep."""
    deep_words = ["deeply", "thoroughly", "comprehensive", "detailed", "in depth", "explore thoroughly"]
    surface_words = ["quick", "summary", "briefly", "simple", "straightforward"]

    deep_count = sum(1 for word in deep_words if word in text.lower())
    surface_count = sum(1 for word in surface_words if word in text.lower())

    if deep_count > surface_count:
        return "deep"
    elif surface_count > deep_count:
        return "surface"
    return "medium"

def decide_model(dimensions: Dict[str, Any]) -> tuple[str, str, int]:
    """
    Route to Haiku, Opus fast, or Opus thinking based on dimensions.
    Uses weighted scoring across all dimensions, not just rigid rules.
    Returns (model, reasoning, confidence)
    """
    complexity = dimensions.get("complexity", 5)
    domain = dimensions.get("domain", "exploratory")
    scope = dimensions.get("scope", "medium")
    certainty = dimensions.get("certainty", "medium")
    time_sensitivity = dimensions.get("time_sensitivity", "medium")
    depth = dimensions.get("depth_requirement", "medium")

    # Calculate routing scores for each model
    haiku_score = score_for_haiku(complexity, domain, scope, certainty, time_sensitivity, depth)
    opus_fast_score = score_for_opus_fast(complexity, domain, scope, certainty, time_sensitivity, depth)
    opus_thinking_score = score_for_opus_thinking(complexity, domain, scope, certainty, time_sensitivity, depth)

    scores = {
        "haiku": haiku_score,
        "opus-fast": opus_fast_score,
        "opus-thinking": opus_thinking_score
    }

    # Find best model
    best_model = max(scores, key=scores.get)
    confidence = int(scores[best_model])
    confidence = max(50, min(95, confidence))  # Clamp to realistic range

    # Generate reasoning based on which model won and why
    reasoning = generate_routing_reasoning(best_model, dimensions, scores)

    return (best_model, reasoning, confidence)


def score_for_haiku(complexity: int, domain: str, scope: str, certainty: str,
                    time_sensitivity: str, depth: str) -> float:
    """Score how well Haiku fits this question."""
    score = 0.0

    # Haiku scores high for: simple, fast, factual, narrow scope
    if complexity <= 2:
        score += 30
    elif complexity <= 3:
        score += 20
    elif complexity <= 4:
        score += 10
    elif complexity >= 8:
        score -= 20

    # Domain fit
    if domain == "factual":
        score += 25
    elif domain == "comparative" and complexity <= 4:
        score += 15
    elif domain in ["exploratory", "creative"]:
        score -= 15
    elif domain == "analytical" and complexity <= 3:
        score += 10

    # Scope fit
    if scope == "narrow":
        score += 20
    elif scope == "broad":
        score -= 15

    # Time sensitivity (Haiku is fastest)
    if time_sensitivity == "high":
        score += 20
    elif time_sensitivity == "low":
        score += 5

    # Depth (Haiku not suited for deep work)
    if depth == "surface":
        score += 15
    elif depth == "deep":
        score -= 20
    elif depth == "medium":
        score += 5

    # Certainty (clear right answers favor Haiku)
    if certainty == "clear":
        score += 15
    elif certainty == "exploratory":
        score -= 20

    return score


def score_for_opus_fast(complexity: int, domain: str, scope: str, certainty: str,
                        time_sensitivity: str, depth: str) -> float:
    """Score how well Opus-fast fits this question."""
    score = 0.0

    # Opus-fast is the generalist: handles 4-7 complexity well
    if 4 <= complexity <= 6:
        score += 30
    elif complexity == 7:
        score += 20
    elif complexity == 3:
        score += 15
    elif complexity >= 9:
        score -= 15

    # Domain fit: balanced across most domains
    if domain in ["analytical", "decision_making", "creative", "comparative"]:
        score += 20
    elif domain == "factual":
        score += 10  # Can do it, but Haiku may be overkill
    elif domain == "exploratory" and complexity <= 5:
        score += 15

    # Scope fit
    if scope == "medium":
        score += 20
    elif scope == "narrow":
        score += 10
    elif scope == "broad" and depth != "deep":
        score += 10

    # Time sensitivity
    if time_sensitivity in ["medium", "high"]:
        score += 15
    elif time_sensitivity == "low":
        score += 5

    # Depth (Opus-fast handles medium well)
    if depth == "medium":
        score += 20
    elif depth == "deep":
        score += 10
    elif depth == "surface":
        score -= 5

    # Certainty
    if certainty == "medium":
        score += 15
    elif certainty in ["clear", "exploratory"]:
        score += 5

    return score


def score_for_opus_thinking(complexity: int, domain: str, scope: str, certainty: str,
                            time_sensitivity: str, depth: str) -> float:
    """Score how well Opus-thinking fits this question."""
    score = 0.0

    # Opus-thinking for high complexity
    if complexity >= 8:
        score += 40
    elif complexity >= 7:
        score += 25
    elif complexity >= 6:
        score += 15
    elif complexity <= 3:
        score -= 10

    # Domain fit: exploratory, analytical, complex creative/decisions
    if domain == "exploratory":
        score += 30
    elif domain == "analytical":
        score += 25
    elif domain in ["creative", "decision_making"] and complexity >= 6:
        score += 25
    elif domain == "factual":
        score -= 10  # Overkill for factual

    # Scope fit: broad scope benefits from thinking
    if scope == "broad":
        score += 25
    elif scope == "medium":
        score += 10

    # Time sensitivity (Opus-thinking is slower, so penalize time-sensitive)
    if time_sensitivity == "high":
        score -= 15
    elif time_sensitivity == "low":
        score += 10

    # Depth fit: deep requirements favor thinking
    if depth == "deep":
        score += 30
    elif depth == "medium":
        score += 15
    elif depth == "surface":
        score -= 10

    # Certainty (exploratory/uncertain favor thinking)
    if certainty == "exploratory":
        score += 25
    elif certainty == "medium":
        score += 10
    elif certainty == "clear":
        score -= 5

    return score


def generate_routing_reasoning(model: str, dimensions: Dict[str, Any], scores: Dict[str, float]) -> str:
    """Generate human-readable routing explanation."""
    complexity = dimensions.get("complexity", 5)
    domain = dimensions.get("domain", "exploratory")
    scope = dimensions.get("scope", "medium")
    depth = dimensions.get("depth_requirement", "medium")
    time_sensitivity = dimensions.get("time_sensitivity", "medium")

    if model == "haiku":
        reasons = []
        if complexity <= 3:
            reasons.append("low complexity")
        if domain == "factual":
            reasons.append("factual question")
        if scope == "narrow":
            reasons.append("narrow scope")
        if time_sensitivity == "high":
            reasons.append("time-sensitive")
        if reasons:
            return f"Haiku is sufficient for: {', '.join(reasons)}"
        return "Haiku can handle this efficiently"

    elif model == "opus-fast":
        reasons = []
        if 4 <= complexity <= 6:
            reasons.append("medium complexity")
        if domain in ["analytical", "creative", "decision_making"]:
            reasons.append(f"{domain} reasoning needed")
        if scope == "medium":
            reasons.append("medium scope")
        if reasons:
            return f"Opus-fast for: {', '.join(reasons)}"
        return "Opus-fast provides balanced depth and speed"

    else:  # opus-thinking
        reasons = []
        if complexity >= 8:
            reasons.append("high complexity")
        if domain == "exploratory":
            reasons.append("exploratory question")
        if scope == "broad":
            reasons.append("broad scope")
        if depth == "deep":
            reasons.append("deep reasoning required")
        if reasons:
            return f"Opus-thinking for: {', '.join(reasons)}"
        return "Extended reasoning needed for this question"
