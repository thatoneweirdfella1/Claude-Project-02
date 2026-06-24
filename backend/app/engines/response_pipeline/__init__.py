"""
Response Pipeline (Phase 2B - The Wiring)

This is the missing link: it chains all the ADHD-optimization engines together
and runs Claude's raw reply through them before it reaches the user.

Order matters. Each stage's output feeds the next:

  1. Anti-Sycophancy   → strip flattery/pleasantries first (cleanest signal)
  2. Flow Preservation → remove unsolicited meta-commentary / drift confessions
  3. RSD Detection     → reframe rejection-sensitive triggers
  4. Cognitive Load    → simplify if the result is overwhelming
  5. Response Formatter → chunk, answer-first, visual structure (last, so it
                          structures the already-cleaned text)

Each stage is defensive: if one engine errors, the pipeline logs it and passes
the text through unchanged rather than failing the whole response.
"""

from typing import Dict, Any, List

from ..anti_sycophancy import make_response_direct
from ..flow_preservation import preserve_exploration_mode, validate_response_for_flow_preservation
from ..rsd_detection import reframe_for_rsd_safety
from ..cognitive_load import simplify_overloaded_response, assess_cognitive_load
from ..response_formatting import format_response_for_adhd


def process_response(
    raw_response: str,
    options: Dict[str, bool] = None,
) -> Dict[str, Any]:
    """
    Run a raw model response through the full ADHD-optimization pipeline.

    Args:
        raw_response: The text returned by Claude.
        options: Optional per-stage toggles, e.g. {"format": False}. All stages
                 default to ON. Keys: anti_sycophancy, flow, rsd, cognitive_load, format.

    Returns:
        {
            "response": <final processed text>,
            "stages": [ ... per-stage metadata ... ],
            "original_length": int,
            "final_length": int,
        }
    """
    opts = {
        "anti_sycophancy": True,
        "flow": True,
        "rsd": True,
        "cognitive_load": True,
        "format": True,
    }
    if options:
        opts.update(options)

    text = raw_response
    stages: List[Dict[str, Any]] = []

    # ---- Stage 1: Anti-Sycophancy ----
    if opts["anti_sycophancy"]:
        try:
            result = make_response_direct(text)
            text = result["response"]
            stages.append({
                "stage": "anti_sycophancy",
                "applied": result["applied"],
                "removed": result["removed_patterns"],
                "hallucination_risk": result["hallucination_risk"]["risk_score"],
            })
        except Exception as e:
            stages.append({"stage": "anti_sycophancy", "error": str(e)})

    # ---- Stage 2: Flow Preservation ----
    if opts["flow"]:
        try:
            is_valid, issues = validate_response_for_flow_preservation(text)
            if not is_valid:
                text = preserve_exploration_mode(text)
            stages.append({
                "stage": "flow_preservation",
                "applied": not is_valid,
                "issues": issues,
            })
        except Exception as e:
            stages.append({"stage": "flow_preservation", "error": str(e)})

    # ---- Stage 3: RSD Detection / Reframing ----
    if opts["rsd"]:
        try:
            result = reframe_for_rsd_safety(text)
            text = result["reframed_response"]
            stages.append({
                "stage": "rsd_detection",
                "applied": result["reframing_applied"],
                "was_safe": result["was_safe"],
                "is_now_safe": result["is_now_safe"],
                "confidence": result["confidence_score"],
            })
        except Exception as e:
            stages.append({"stage": "rsd_detection", "error": str(e)})

    # ---- Stage 4: Cognitive Load ----
    if opts["cognitive_load"]:
        try:
            load = assess_cognitive_load(text)
            if load["is_overloaded"]:
                result = simplify_overloaded_response(text)
                text = result["simplified_response"]
                stages.append({
                    "stage": "cognitive_load",
                    "applied": True,
                    "load_before": result["original_load_score"],
                    "load_after": result["simplified_load_score"],
                })
            else:
                stages.append({
                    "stage": "cognitive_load",
                    "applied": False,
                    "load_score": load["total_score"],
                })
        except Exception as e:
            stages.append({"stage": "cognitive_load", "error": str(e)})

    # ---- Stage 5: Response Formatter (last — structures cleaned text) ----
    if opts["format"]:
        try:
            result = format_response_for_adhd(text)
            text = result["response"]
            stages.append({
                "stage": "formatter",
                "chunk_count": result["chunk_count"],
                "cognitive_load_score": result["cognitive_load_score"],
                "answer_first_applied": result["answer_first_applied"],
                "adherence_score": result["validation"]["adherence_score"],
            })
        except Exception as e:
            stages.append({"stage": "formatter", "error": str(e)})

    return {
        "response": text,
        "stages": stages,
        "original_length": len(raw_response),
        "final_length": len(text),
    }


def get_combined_prompt_instructions() -> str:
    """
    Return the combined generation-time instructions (flow preservation +
    anti-sycophancy) to prepend to prompts so the model behaves well at the
    source, not just in post-processing.
    """
    from ..anti_sycophancy import ANTI_SYCOPHANCY_INSTRUCTION
    from ...libraries.prompts import FLOW_PRESERVATION_INSTRUCTION

    return FLOW_PRESERVATION_INSTRUCTION + "\n\n" + ANTI_SYCOPHANCY_INSTRUCTION
