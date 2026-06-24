"""
Tests for Phase 2B: anti-sycophancy, response pipeline, ADHD-state routing,
and the cognitive-load simplifier fix.
"""

from app.engines.anti_sycophancy import (
    AntiSycophancyEngine, make_response_direct, ANTI_SYCOPHANCY_INSTRUCTION,
)
from app.engines.response_pipeline import process_response, get_combined_prompt_instructions
from app.engines.routing.adhd_state import detect_adhd_state
from app.engines.routing import route
from app.engines.cognitive_load import CognitiveLoadMeter


# ============================================================================
# ANTI-SYCOPHANCY
# ============================================================================

def test_strip_sycophantic_opener():
    e = AntiSycophancyEngine()
    t = "Great question! The answer is 42."
    out = e.strip_sycophantic_openers(t)
    assert "great question" not in out.lower(), f"opener not stripped: {out}"
    assert "42" in out
    print("✓ Strips sycophantic openers")


def test_strip_empty_validation():
    e = AntiSycophancyEngine()
    t = "You're absolutely right! The sky appears blue due to scattering."
    out = e.strip_empty_validation(t)
    assert "absolutely right" not in out.lower()
    assert "scattering" in out
    print("✓ Strips empty validation")


def test_strip_pleasantries():
    e = AntiSycophancyEngine()
    t = "Here's the fix. I'd be happy to help further. Hope this helps!"
    out = e.strip_pleasantries(t)
    assert "happy to help" not in out.lower()
    assert "hope this helps" not in out.lower()
    print("✓ Strips pleasantries")


def test_hallucination_risk():
    e = AntiSycophancyEngine()
    # reflexive agreement, no reasoning -> higher risk
    risky = "Absolutely! You make a great point. I completely agree."
    grounded = "That works because the data shows a 30% drop, specifically in Q3."
    r1 = e.detect_hallucination_risk(risky)
    r2 = e.detect_hallucination_risk(grounded)
    assert r1["risk_score"] > r2["risk_score"], f"{r1['risk_score']} vs {r2['risk_score']}"
    print(f"✓ Hallucination risk: risky={r1['risk_score']:.2f}, grounded={r2['risk_score']:.2f}")


def test_make_direct_full():
    t = "Great question! You're absolutely right. The capital of France is Paris. Hope this helps!"
    result = make_response_direct(t)
    out = result["response"]
    assert "great question" not in out.lower()
    assert "absolutely right" not in out.lower()
    assert "hope this helps" not in out.lower()
    assert "Paris" in out
    assert result["applied"]
    print(f"✓ Full directness pass: '{out}'")


def test_already_direct():
    t = "The capital of France is Paris."
    result = make_response_direct(t)
    assert result["was_already_direct"]
    assert not result["applied"]
    print("✓ Direct response passes unchanged")


# ============================================================================
# RESPONSE PIPELINE
# ============================================================================

def test_pipeline_runs_all_stages():
    t = "Great question! You're absolutely right. The answer is X because Y."
    result = process_response(t)
    stage_names = [s["stage"] for s in result["stages"]]
    assert "anti_sycophancy" in stage_names
    assert "flow_preservation" in stage_names
    assert "rsd_detection" in stage_names
    assert "cognitive_load" in stage_names
    assert "formatter" in stage_names
    print(f"✓ Pipeline runs all 5 stages: {stage_names}")


def test_pipeline_strips_sycophancy():
    t = "Great question! The fix is to restart the service."
    result = process_response(t)
    assert "great question" not in result["response"].lower()
    print("✓ Pipeline strips sycophancy end-to-end")


def test_pipeline_toggle():
    t = "Great question! The answer is X."
    result = process_response(t, options={"anti_sycophancy": False})
    # With anti-sycophancy off, opener should survive that stage
    stage_names = [s["stage"] for s in result["stages"]]
    assert "anti_sycophancy" not in stage_names
    print("✓ Pipeline stage toggle works")


def test_pipeline_defensive():
    # Empty input shouldn't crash the pipeline
    result = process_response("")
    assert "response" in result
    print("✓ Pipeline is defensive on empty input")


def test_combined_instructions():
    instr = get_combined_prompt_instructions()
    assert "flow" in instr.lower() or "hyperfocus" in instr.lower()
    assert "direct" in instr.lower() or "flattery" in instr.lower()
    print("✓ Combined prompt instructions include both behaviors")


# ============================================================================
# ADHD-STATE ROUTING
# ============================================================================

def test_detect_overwhelm():
    t = "this is TOO MUCH i can't keep up everything at once!!!"
    r = detect_adhd_state(t)
    assert r["state"]["emotional_state"] == "overwhelmed"
    assert r["directives"]["rescue_mode"]
    print("✓ Detects overwhelm + triggers rescue mode")


def test_detect_calm_interest():
    t = "what if we explored this idea, it's fascinating, I'm curious where it leads"
    r = detect_adhd_state(t)
    assert r["state"]["interest_level"] == "high"
    assert r["state"]["mode"] == "gathering"
    print("✓ Detects high interest + gathering mode")


def test_detect_evaluating_mode():
    t = "okay is this actually real? can you verify this and fact check it"
    r = detect_adhd_state(t)
    assert r["state"]["mode"] == "evaluating"
    assert not r["directives"]["preserve_flow_strict"]
    print("✓ Detects evaluating mode + relaxes flow lock")


def test_detect_rsd_high():
    t = "i'm so stupid, i always mess this up, i feel dumb asking"
    r = detect_adhd_state(t)
    assert r["state"]["rsd_sensitivity"] == "high"
    assert r["directives"]["validate_before_analyzing"]
    print("✓ Detects high RSD sensitivity")


def test_routing_includes_adhd_state():
    result = route(["this is TOO MUCH everything at once i can't"])
    routing = result["routings"][0]
    assert "adhd_state" in routing
    assert "directives" in routing
    print("✓ Routing output includes adhd_state + directives")


# ============================================================================
# COGNITIVE LOAD SIMPLIFIER FIX
# ============================================================================

def test_simplifier_reduces_load():
    m = CognitiveLoadMeter()
    t = ("There are (however, debatable) multiple approaches: on one hand X works, "
         "on the other hand Y works, but if you consider Z then A is better unless B. "
         "What do you think about C? And D?")
    before = m.calculate_load_score(t)["total_score"]
    s = m.simplify_incrementally(t)
    after = m.calculate_load_score(s)["total_score"]
    assert after < before, f"load not reduced: {before} -> {after}"
    # no run-together word artifacts
    assert "wellbut" not in s and "worksbut" not in s
    print(f"✓ Simplifier reduces load: {before} -> {after}")


if __name__ == "__main__":
    print("\n=== ANTI-SYCOPHANCY ===")
    test_strip_sycophantic_opener()
    test_strip_empty_validation()
    test_strip_pleasantries()
    test_hallucination_risk()
    test_make_direct_full()
    test_already_direct()

    print("\n=== RESPONSE PIPELINE ===")
    test_pipeline_runs_all_stages()
    test_pipeline_strips_sycophancy()
    test_pipeline_toggle()
    test_pipeline_defensive()
    test_combined_instructions()

    print("\n=== ADHD-STATE ROUTING ===")
    test_detect_overwhelm()
    test_detect_calm_interest()
    test_detect_evaluating_mode()
    test_detect_rsd_high()
    test_routing_includes_adhd_state()

    print("\n=== COGNITIVE LOAD SIMPLIFIER ===")
    test_simplifier_reduces_load()

    print("\n✅ All Phase 2B tests passed!")
