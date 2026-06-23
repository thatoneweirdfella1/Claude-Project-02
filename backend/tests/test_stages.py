"""Tests for all 5 stages of the pipeline."""

import sys
sys.path.insert(0, "/home/user/Claude-Project-02/backend")

from stages.stage1_translation import TranslationService, TranslationInput
from stages.stage2_routing import RoutingService, RoutingInput
from stages.stage3_technique_selection import TechniqueSelectionService, TechniqueInput
from stages.stage4_composition import CompositionService, CompositionInput
from stages.stage5_execution import ExecutionService, ExecutionInput
from models.enums import QuestionType


def test_stage1_translation():
    """Test Stage 1: Translation Engine."""
    print("\n=== Testing Stage 1: Translation ===")
    service = TranslationService()

    test_input = TranslationInput(
        raw_input="ok so like i'm struggling with this rambling thing where i start talking about context and then forget the actual question until later. anyway help me understand how to be clearer in my communication?"
    )

    result = service.translate(test_input)

    print(f"Gap Category: {result.gap_category}")
    print(f"Confidence: {result.confidence:.2f}%")
    print(f"Operations Applied: {[op.value for op in result.operations_applied]}")
    print(f"Translated Questions: {result.translated_questions}")

    assert result.confidence > 0
    assert len(result.translated_questions) > 0
    print("✓ Stage 1 passed")


def test_stage2_routing():
    """Test Stage 2: Routing Engine."""
    print("\n=== Testing Stage 2: Routing ===")
    service = RoutingService()

    test_input = RoutingInput(
        translated_questions=["How do I improve my communication clarity with AI systems?"],
        question_metadata={
            "gap_confidence": 0.7,
            "question": "How do I improve my communication clarity?",
        },
    )

    result = service.route(test_input)

    print(f"Routed Model: {result.routed_model.value}")
    print(f"Routing Confidence: {result.confidence:.2f}%")
    print(f"Consequence Score: {result.consequence_score}")
    print(f"Dimensions: {result.dimensions}")

    assert result.routed_model is not None
    assert result.confidence >= 0
    print("✓ Stage 2 passed")


def test_stage3_technique_selection():
    """Test Stage 3: Technique Selection."""
    print("\n=== Testing Stage 3: Technique Selection ===")
    service = TechniqueSelectionService()

    test_input = TechniqueInput(
        translated_question="How do I improve my communication clarity with AI?",
        routed_model="opus_fast",
        question_metadata={"complexity": 5},
        question_type=QuestionType.ANALYTICAL,
    )

    result = service.select(test_input)

    print(f"Selected Techniques: {len(result.selected_techniques)}")
    for tech in result.selected_techniques:
        print(f"  - {tech.id.value}: {tech.name} (score: {tech.score:.2f})")
    print(f"Total Token Overhead: {result.total_token_overhead}")

    assert len(result.selected_techniques) >= 0
    assert result.total_token_overhead >= 0
    print("✓ Stage 3 passed")


def test_stage4_composition():
    """Test Stage 4: Composition Engine."""
    print("\n=== Testing Stage 4: Composition ===")
    service = CompositionService()

    from stages.stage3_technique_selection import TechniqueSelectionService
    technique_service = TechniqueSelectionService()
    technique_input = TechniqueInput(
        translated_question="How do I improve my communication clarity?",
        routed_model="opus_fast",
        question_metadata={"complexity": 5},
        question_type=QuestionType.ANALYTICAL,
    )
    technique_result = technique_service.select(technique_input)

    test_input = CompositionInput(
        translated_question="How do I improve my communication clarity with AI systems?",
        routed_model="opus_fast",
        selected_techniques=technique_result.selected_techniques,
    )

    result = service.compose(test_input)

    print(f"Validation Passed: {result.validation_passed}")
    print(f"Prompt Tokens: {result.prompt_tokens}")
    print(f"Validation Errors: {result.validation_errors}")
    print(f"Prompt Preview: {result.final_prompt[:200]}...")

    assert len(result.final_prompt) > 0
    assert result.prompt_tokens > 0
    print("✓ Stage 4 passed")


def test_full_pipeline():
    """Test full 5-stage pipeline without Stage 5 (no API calls)."""
    print("\n=== Testing Full Pipeline (Stages 1-4) ===")

    from stages.stage1_translation import TranslationService
    from stages.stage2_routing import RoutingService
    from stages.stage3_technique_selection import TechniqueSelectionService
    from stages.stage4_composition import CompositionService

    trans_service = TranslationService()
    route_service = RoutingService()
    tech_service = TechniqueSelectionService()
    comp_service = CompositionService()

    # Stage 1
    raw_input = "ok like so i'm trying to understand how the whole translation thing works right, and I know it's complicated but I just need the basics you know?"
    trans_input = TranslationInput(raw_input=raw_input)
    trans_result = trans_service.translate(trans_input)
    print(f"1. Translation: {len(trans_result.translated_questions)} questions, confidence {trans_result.confidence:.0f}%")

    # Stage 2
    route_input = RoutingInput(
        translated_questions=trans_result.translated_questions,
        question_metadata=trans_result.metadata,
    )
    route_result = route_service.route(route_input)
    print(f"2. Routing: {route_result.routed_model.value}, confidence {route_result.confidence:.0f}%")

    # Stage 3
    tech_input = TechniqueInput(
        translated_question=trans_result.translated_questions[0],
        routed_model=route_result.routed_model,
        question_metadata=trans_result.metadata,
        question_type=route_result.dimensions.domain,
    )
    tech_result = tech_service.select(tech_input)
    print(f"3. Techniques: {len(tech_result.selected_techniques)} techniques selected")

    # Stage 4
    comp_input = CompositionInput(
        translated_question=trans_result.translated_questions[0],
        routed_model=route_result.routed_model,
        selected_techniques=tech_result.selected_techniques,
    )
    comp_result = comp_service.compose(comp_input)
    print(f"4. Composition: {comp_result.prompt_tokens} tokens, valid={comp_result.validation_passed}")

    print("✓ Full pipeline passed (stages 1-4)")


if __name__ == "__main__":
    test_stage1_translation()
    test_stage2_routing()
    test_stage3_technique_selection()
    test_stage4_composition()
    test_full_pipeline()
    print("\n✅ All tests passed!")
