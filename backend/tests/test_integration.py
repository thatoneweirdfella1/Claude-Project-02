"""
Integration tests for the full ADHD-to-AI Translator pipeline.
Tests all four engines working together end-to-end.
"""

import pytest
from app.engines.translation import translate
from app.engines.routing import route
from app.engines.composition import compose
from app.engines.learning import log_full_pipeline, get_insights
from app.libraries.prompts import get_prompt_template, render_prompt
from app.libraries.effectiveness import get_technique_effectiveness, get_model_effectiveness


class TestTranslationEngine:
    """Test the translation engine."""

    def test_basic_translation(self):
        """Test that rambling input gets translated into questions."""
        raw_input = "okay so like i've been thinking about the architecture but also the logging is weird"
        result = translate(raw_input)

        assert result["original_input"] == raw_input
        assert len(result["translations"]) > 0
        assert all("translated_text" in t for t in result["translations"])
        assert all(0 <= t["confidence"] <= 100 for t in result["translations"])

    def test_emotional_analysis(self):
        """Test that emotional content is detected."""
        raw_input = "i'm so confused and overthinking this but i need to know the architecture"
        result = translate(raw_input)

        analysis = result["analysis"]
        assert analysis["emotional_content"] in ["low", "medium", "high"]

    def test_scope_detection(self):
        """Test that scope is detected."""
        broad_input = "tell me everything about Python"
        narrow_input = "should I use Python or Go for this project?"

        broad_result = translate(broad_input)
        narrow_result = translate(narrow_input)

        assert broad_result["analysis"]["scope"] in ["broad", "medium"]
        assert narrow_result["analysis"]["scope"] in ["narrow", "medium"]


class TestRoutingEngine:
    """Test the routing engine."""

    def test_basic_routing(self):
        """Test that questions are routed to models."""
        question = "What is Python?"
        routing_result = route([question])

        assert len(routing_result["routings"]) > 0
        routing = routing_result["routings"][0]
        assert routing["routed_model"] in ["haiku", "opus-fast", "opus-thinking"]
        assert 0 <= routing["confidence"] <= 100
        assert routing["reasoning"]

    def test_complexity_routing(self):
        """Test that complexity drives routing."""
        simple_q = "What is 2+2?"
        complex_q = "How should we design a distributed system to handle 1M concurrent users with sub-100ms latency, considering CAP theorem?"

        simple_routing = route([simple_q])
        complex_routing = route([complex_q])

        simple_model = simple_routing["routings"][0]["routed_model"]
        complex_model = complex_routing["routings"][0]["routed_model"]

        # Simple should prefer faster model
        simple_rank = {"haiku": 0, "opus-fast": 1, "opus-thinking": 2}
        complex_rank = {"haiku": 0, "opus-fast": 1, "opus-thinking": 2}

        assert simple_rank[simple_model] <= complex_rank[complex_model]

    def test_dimensions_analysis(self):
        """Test that all dimensions are analyzed."""
        question = "Should I use React or Vue?"
        routing_result = route([question])

        dimensions = routing_result["routings"][0]["dimensions"]
        assert "complexity" in dimensions
        assert "domain" in dimensions
        assert "scope" in dimensions
        assert "certainty" in dimensions
        assert "time_sensitivity" in dimensions
        assert "depth_requirement" in dimensions


class TestCompositionEngine:
    """Test the composition engine."""

    def test_basic_composition(self):
        """Test that prompts are composed with techniques."""
        question = "What is machine learning?"
        composition = compose(question, "haiku", "factual")

        assert composition["id"]
        assert len(composition["techniques"]) > 0
        assert composition["final_prompt"]
        assert composition["estimated_tokens"] > 0
        assert 0 <= composition["confidence"] <= 100

    def test_technique_selection_by_domain(self):
        """Test that techniques are selected based on domain."""
        analytical_q = "Why is the sky blue?"
        decision_q = "Should I use Python or Go?"

        analytical_comp = compose(analytical_q, "opus-fast", "analytical")
        decision_comp = compose(decision_q, "opus-fast", "decision_making")

        analytical_techs = [t["id"] for t in analytical_comp["techniques"]]
        decision_techs = [t["id"] for t in decision_comp["techniques"]]

        # Different domains should select different techniques
        assert set(analytical_techs) != set(decision_techs)

    def test_prompt_library_used(self):
        """Test that prompts from library are used."""
        question = "What is Python?"
        composition = compose(question, "haiku", "factual")

        final_prompt = composition["final_prompt"]
        # Should contain the question
        assert "Python" in final_prompt

    def test_model_specific_prompts(self):
        """Test that different models get different prompts."""
        question = "Explain quantum mechanics"

        haiku_comp = compose(question, "haiku", "analytical")
        opus_comp = compose(question, "opus-thinking", "analytical")

        # Different models should select different number of techniques
        haiku_techs = len(haiku_comp["techniques"])
        opus_techs = len(opus_comp["techniques"])

        # Haiku should have fewer (simpler) techniques
        assert haiku_techs <= opus_techs


class TestLibraries:
    """Test the prompt and effectiveness libraries."""

    def test_prompt_templates_exist(self):
        """Test that prompt templates exist for all model/domain combinations."""
        models = ["haiku", "opus-fast", "opus-thinking"]
        domains = ["factual", "analytical", "creative", "comparative", "exploratory", "decision_making"]

        for model in models:
            for domain in domains:
                template = get_prompt_template(model, domain)
                assert template
                assert "{question}" in template

    def test_effectiveness_matrices_exist(self):
        """Test that effectiveness matrices have scores."""
        # Test technique effectiveness
        score = get_technique_effectiveness("chain_of_thought", "analytical")
        assert 0 <= score <= 100

        # Test model effectiveness
        model_score = get_model_effectiveness("opus-thinking", "exploratory")
        assert 0 <= model_score <= 100

    def test_render_prompt(self):
        """Test that prompts can be rendered with questions."""
        template = "Answer this: {question}"
        question = "What is AI?"

        rendered = render_prompt(template, question)
        assert rendered == "Answer this: What is AI?"


class TestEndToEnd:
    """End-to-end tests of the full pipeline."""

    def test_full_pipeline(self):
        """Test the complete pipeline: translate → route → compose."""
        raw_input = "okay so i've been thinking about architecture and also logging is weird, which model should i use"

        # Step 1: Translate
        translation = translate(raw_input)
        assert len(translation["translations"]) > 0

        # Step 2: Route
        routing = route([translation["translations"][0]["translated_text"]])
        assert routing["routings"][0]["routed_model"]

        # Step 3: Compose
        composition = compose(
            translation["translations"][0]["translated_text"],
            routing["routings"][0]["routed_model"],
            routing["routings"][0]["dimensions"]["domain"]
        )
        assert composition["final_prompt"]

    def test_learning_system_logging(self):
        """Test that pipeline decisions are logged."""
        raw_input = "What is the best way to learn Python?"
        translation = translate(raw_input)
        routing = route([translation["translations"][0]["translated_text"]])
        composition = compose(
            translation["translations"][0]["translated_text"],
            routing["routings"][0]["routed_model"],
            routing["routings"][0]["dimensions"]["domain"]
        )

        # Log the pipeline (would write to SQLite in production)
        log_data = log_full_pipeline(
            raw_input,
            translation["translations"][0],
            routing["routings"][0],
            composition,
            "Python is a great language for beginners",
            120
        )

        assert log_data["question_id"]
        assert log_data["answer_id"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
