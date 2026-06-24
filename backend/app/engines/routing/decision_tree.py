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
    Returns (model, reasoning, confidence)
    """
    complexity = dimensions.get("complexity", 5)
    domain = dimensions.get("domain", "exploratory")
    scope = dimensions.get("scope", "medium")
    certainty = dimensions.get("certainty", "medium")
    time_sensitivity = dimensions.get("time_sensitivity", "medium")
    depth = dimensions.get("depth_requirement", "medium")

    confidence = 70  # Base confidence

    # Rule 1: Simple factual questions → Haiku
    if complexity <= 3 and domain == "factual" and scope == "narrow":
        return ("haiku", "Simple factual question - Haiku is fastest and sufficient", 90)

    # Rule 2: Definition/lookup questions → Haiku
    if domain == "factual" and complexity <= 4:
        return ("haiku", "Straightforward informational question", 85)

    # Rule 3: Quick comparison → Haiku
    if domain == "comparative" and complexity <= 4 and time_sensitivity == "high":
        return ("haiku", "Time-sensitive comparison - Haiku is fast enough", 80)

    # Rule 4: Creative/decision with medium complexity → Opus fast
    if (domain in ["creative", "decision_making"] and 4 <= complexity <= 6):
        return ("opus-fast", "Medium complexity creative/decision question", 80)

    # Rule 5: Analytical questions → Opus fast (unless very complex)
    if domain == "analytical" and complexity <= 7:
        return ("opus-fast", "Analytical question requiring structured reasoning", 80)

    # Rule 6: Exploratory questions → Opus thinking
    if domain == "exploratory" or (domain == "analytical" and complexity >= 8):
        return ("opus-thinking", "Exploratory or highly complex analytical question", 85)

    # Rule 7: Broad scope, deep requirement → Opus thinking
    if scope == "broad" and depth in ["deep", "medium"]:
        return ("opus-thinking", "Broad scope requiring comprehensive coverage", 80)

    # Rule 8: Uncertain/ambiguous → Opus thinking
    if certainty == "exploratory":
        return ("opus-thinking", "Exploratory question needing deep reasoning", 75)

    # Rule 9: High complexity → Opus thinking
    if complexity >= 8:
        return ("opus-thinking", "High complexity question needs extended reasoning", 85)

    # Rule 10: Default to Opus fast for medium complexity
    if 4 <= complexity <= 7:
        return ("opus-fast", "Medium complexity - balanced reasoning depth", 75)

    # Fallback
    return ("haiku", "Straightforward question", 60)
