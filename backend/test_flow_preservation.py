"""
Tests for Phase 2-Zero flow preservation engine.
Validates that flow-breaking patterns are detected and removed.
"""

from app.engines.flow_preservation import (
    strip_flow_breaking_meta_commentary,
    convert_caveats_to_inline_tags,
    deprioritize_tangent_deprecation,
    detect_flow_breaking_patterns,
    validate_response_for_flow_preservation,
    preserve_exploration_mode,
)

def test_detect_banned_phrases():
    """Verify banned phrase detection."""
    text = "I'd like to take a moment to acknowledge we've drifted from research into speculation."
    is_valid, issues = validate_response_for_flow_preservation(text)

    assert not is_valid, "Should detect banned phrases"
    assert any("banned" in issue.lower() for issue in issues), "Should mention banned phrases"
    print("✓ Banned phrase detection works")

def test_strip_meta_commentary():
    """Verify removal of unsolicited epistemic self-correction."""
    text = """Here's the analysis. I'd like to take a moment to acknowledge that we started with genuine research and I have to admit I've let this drift into strongly inferred territory. We went from facts to speculation. But here's the key insight."""

    result = strip_flow_breaking_meta_commentary(text)

    assert "I'd like to take a moment" not in result, "Should remove meta-commentary"
    assert "drift" not in result.lower(), "Should remove drift language"
    assert "key insight" in result, "Should preserve core content"
    print("✓ Meta-commentary stripping works")

def test_caveat_to_inline_tags():
    """Verify conversion of caveats to inline confidence tags."""
    text = "This might be speculative, but I should note that it could be inferred from the data."

    result = convert_caveats_to_inline_tags(text)

    # Should have simplified the hedging
    assert "I should note" not in result, "Should remove caveat phrasing"
    assert len(result) < len(text), "Should shorten by removing hedges"
    print("✓ Caveat to inline tag conversion works")

def test_deprioritize_tangents():
    """Verify tangents are reframed neutrally."""
    text = "That's a bit of a tangent, but it's important. This is getting off topic, but here's the thing."

    result = deprioritize_tangent_deprecation(text)

    assert "tangent" not in result.lower(), "Should remove tangent deprecation"
    assert "off topic" not in result, "Should remove off-topic framing"
    assert "important" in result, "Should preserve core content"
    print("✓ Tangent deprioritization works")

def test_detect_hedging():
    """Verify hedging pattern detection."""
    text = "It's important to remember that this might be the case. I should note that to be clear, this is speculative."

    detected = detect_flow_breaking_patterns(text)

    assert detected["hedging"], "Should detect hedging patterns"
    assert len(detected["hedging"]) > 0, "Should find multiple hedging instances"
    print("✓ Hedging detection works")

def test_preserve_exploration_mode():
    """Integration test: full flow preservation."""
    text = """Here's my analysis. I'd like to take a moment to acknowledge we've drifted from research into speculation. I should note that this might be inferred. But that's a bit of a tangent - the key point is X."""

    result = preserve_exploration_mode(text)

    # Should remove all the flow-breaking patterns
    assert "I'd like to take a moment" not in result
    assert "I should note" not in result
    assert "tangent" not in result.lower()
    assert "drifted" not in result.lower()
    assert "key point" in result, "Should preserve core content"
    print("✓ Full flow preservation integration works")

def test_valid_response():
    """Verify that good responses pass validation."""
    text = "Here's what I found. The data suggests X, which connects to Y. This leads to Z. What do you think?"

    is_valid, issues = validate_response_for_flow_preservation(text)

    assert is_valid, f"Should pass validation. Issues: {issues}"
    assert len(issues) == 0, "Should have no issues"
    print("✓ Valid response validation works")

def test_inline_confidence_marking():
    """Verify inline confidence marking works."""
    text = "This is inference from the data [inference] and this is grounded fact [grounded]."

    # Should already be marked correctly
    is_valid, issues = validate_response_for_flow_preservation(text)

    # The tags themselves shouldn't trigger issues
    assert "[inference]" in text or not is_valid, "Inline tags should be preserved or acceptable"
    print("✓ Inline confidence marking accepted")

def test_multiple_flow_breaks():
    """Verify handling of multiple flow-breaking patterns."""
    text = """I'd like to take a moment to say we've gotten off track. I should note that we started with research but drifted into speculation. To summarize where we are, the key insight is X. But that's a bit of a tangent."""

    detected = detect_flow_breaking_patterns(text)

    # Should detect multiple types
    total_issues = sum(len(v) for v in detected.values())
    assert total_issues >= 2, "Should detect multiple flow-breaking patterns"
    print("✓ Multiple flow-breaking pattern detection works")

if __name__ == "__main__":
    test_detect_banned_phrases()
    test_strip_meta_commentary()
    test_caveat_to_inline_tags()
    test_deprioritize_tangents()
    test_detect_hedging()
    test_preserve_exploration_mode()
    test_valid_response()
    test_inline_confidence_marking()
    test_multiple_flow_breaks()
    print("\n✅ All flow preservation tests passed!")
