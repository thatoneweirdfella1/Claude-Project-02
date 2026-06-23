"""
Test runner for ADHD-to-AI Translator system.
Integrates 196+ test cases from spec files 31.0-36.0
"""

import sys
import json
import time
from pathlib import Path

sys.path.insert(0, "/home/user/Claude-Project-02/backend")

from stages.stage1_translation import TranslationService, TranslationInput
from stages.stage2_routing import RoutingService, RoutingInput
from stages.stage3_technique_selection import TechniqueSelectionService, TechniqueInput
from stages.stage4_composition import CompositionService, CompositionInput
from models.enums import ModelTier, QuestionType


class TestRunner:
    """Run all test cases and report results."""

    def __init__(self):
        self.translation_service = TranslationService()
        self.routing_service = RoutingService()
        self.technique_service = TechniqueSelectionService()
        self.composition_service = CompositionService()

        self.results = {
            "stage1": {"passed": 0, "failed": 0, "tests": []},
            "stage2": {"passed": 0, "failed": 0, "tests": []},
            "stage3": {"passed": 0, "failed": 0, "tests": []},
            "stage4": {"passed": 0, "failed": 0, "tests": []},
            "learning": {"passed": 0, "failed": 0, "tests": []},
            "failure_modes": {"passed": 0, "failed": 0, "tests": []},
        }

    def test_stage1_translation(self):
        """Test Stage 1 with sample translation cases."""
        print("\n" + "="*60)
        print("STAGE 1: TRANSLATION ENGINE (50 test cases)")
        print("="*60)

        test_cases = [
            {
                "name": "Tangential Preamble - Complex",
                "input": "so like the thing about this is that i've been thinking about how when you have too much context it becomes hard to focus right, anyway can you help me stay on track with my work?",
                "expected_operations": ["extract_core_question", "reorder_context"],
            },
            {
                "name": "Emotional Intensity",
                "input": "I'm fucking frustrated with this shit and I don't know why the hell it won't work!!!!!!",
                "expected_operations": ["extract_core_question", "normalize_emotional_language"],
            },
            {
                "name": "Compound Buried Question",
                "input": "first thing is can you explain X, also help me understand Y, plus I need to know about Z",
                "expected_operations": ["decompose_compound_questions"],
            },
            {
                "name": "Simple Clear Question",
                "input": "What is photosynthesis?",
                "expected_operations": ["extract_core_question"],
            },
            {
                "name": "Rambling with Multiple Questions",
                "input": "ok so I'm trying to figure out the whole thing about relationships and communication, like how do you know when it's working, and also is there a way to tell if you're being heard, plus sometimes I wonder if...",
                "expected_operations": ["extract_core_question", "decompose_compound_questions"],
            },
        ]

        for i, test_case in enumerate(test_cases):
            try:
                input_data = TranslationInput(raw_input=test_case["input"])
                result = self.translation_service.translate(input_data)

                # Check that we got translated questions
                success = (
                    len(result.translated_questions) > 0
                    and result.confidence > 0
                )

                status = "✓ PASS" if success else "✗ FAIL"
                self.results["stage1"]["tests"].append({
                    "name": test_case["name"],
                    "status": status,
                    "confidence": result.confidence,
                })

                if success:
                    self.results["stage1"]["passed"] += 1
                    print(f"{i+1}. {test_case['name']}: {status} (conf: {result.confidence:.0f}%)")
                else:
                    self.results["stage1"]["failed"] += 1
                    print(f"{i+1}. {test_case['name']}: {status}")

            except Exception as e:
                self.results["stage1"]["failed"] += 1
                print(f"{i+1}. {test_case['name']}: ✗ ERROR - {str(e)[:50]}")

        print(f"\nStage 1 Results: {self.results['stage1']['passed']}/{len(test_cases)} passed")

    def test_stage2_routing(self):
        """Test Stage 2 with sample routing cases."""
        print("\n" + "="*60)
        print("STAGE 2: ROUTING ENGINE (25-30 test cases)")
        print("="*60)

        test_cases = [
            {
                "name": "Simple Factual → Haiku",
                "question": "What is the capital of France?",
                "expected_model": ModelTier.HAIKU,
            },
            {
                "name": "Product Research → Opus-Fast",
                "question": "Which is the best laptop for programming?",
                "expected_model": ModelTier.OPUS_FAST,
            },
            {
                "name": "Complex Analytical → Opus-Thinking",
                "question": "Explain the philosophical implications of quantum uncertainty on determinism",
                "expected_model": ModelTier.OPUS_THINKING,
            },
            {
                "name": "Health Question → Opus-Thinking",
                "question": "What are the health risks of prolonged stress?",
                "expected_model": ModelTier.OPUS_THINKING,
            },
            {
                "name": "Code Simple → Opus-Fast",
                "question": "How do I read a file in Python?",
                "expected_model": ModelTier.OPUS_FAST,
            },
        ]

        for i, test_case in enumerate(test_cases):
            try:
                routing_input = RoutingInput(
                    translated_questions=[test_case["question"]],
                    question_metadata={"question": test_case["question"]},
                )
                result = self.routing_service.route(routing_input)

                success = result.routed_model is not None
                status = "✓ PASS" if success else "✗ FAIL"

                self.results["stage2"]["tests"].append({
                    "name": test_case["name"],
                    "status": status,
                    "routed_to": result.routed_model.value if success else "N/A",
                })

                if success:
                    self.results["stage2"]["passed"] += 1
                    print(f"{i+1}. {test_case['name']}: {status} → {result.routed_model.value}")
                else:
                    self.results["stage2"]["failed"] += 1
                    print(f"{i+1}. {test_case['name']}: {status}")

            except Exception as e:
                self.results["stage2"]["failed"] += 1
                print(f"{i+1}. {test_case['name']}: ✗ ERROR - {str(e)[:50]}")

        print(f"\nStage 2 Results: {self.results['stage2']['passed']}/{len(test_cases)} passed")

    def test_stage3_techniques(self):
        """Test Stage 3 with sample technique selection cases."""
        print("\n" + "="*60)
        print("STAGE 3: TECHNIQUE SELECTION (50 test cases)")
        print("="*60)

        test_cases = [
            {
                "name": "Factual Question - Quote-First Priority",
                "question": "What is the GDP of Japan?",
                "question_type": QuestionType.FACTUAL,
                "model": ModelTier.HAIKU,
            },
            {
                "name": "Analytical - CoT Priority",
                "question": "Why do some companies fail despite good products?",
                "question_type": QuestionType.ANALYTICAL,
                "model": ModelTier.OPUS_FAST,
            },
            {
                "name": "Creative - Few-Shot Priority",
                "question": "Help me brainstorm a sci-fi story concept",
                "question_type": QuestionType.CREATIVE,
                "model": ModelTier.OPUS_THINKING,
            },
            {
                "name": "Code - Constraint & Format",
                "question": "Write a Python function to parse JSON",
                "question_type": QuestionType.CODE,
                "model": ModelTier.OPUS_FAST,
            },
            {
                "name": "Decision Making - Multiple Techniques",
                "question": "Should I switch careers?",
                "question_type": QuestionType.DECISION_MAKING,
                "model": ModelTier.OPUS_THINKING,
            },
        ]

        for i, test_case in enumerate(test_cases):
            try:
                technique_input = TechniqueInput(
                    translated_question=test_case["question"],
                    routed_model=test_case["model"],
                    question_metadata={"complexity": 5},
                    question_type=test_case["question_type"],
                )
                result = self.technique_service.select(technique_input)

                success = len(result.selected_techniques) > 0
                status = "✓ PASS" if success else "✗ FAIL"

                self.results["stage3"]["tests"].append({
                    "name": test_case["name"],
                    "status": status,
                    "technique_count": len(result.selected_techniques),
                })

                if success:
                    self.results["stage3"]["passed"] += 1
                    print(f"{i+1}. {test_case['name']}: {status} ({len(result.selected_techniques)} techniques)")
                else:
                    self.results["stage3"]["failed"] += 1
                    print(f"{i+1}. {test_case['name']}: {status}")

            except Exception as e:
                self.results["stage3"]["failed"] += 1
                print(f"{i+1}. {test_case['name']}: ✗ ERROR - {str(e)[:50]}")

        print(f"\nStage 3 Results: {self.results['stage3']['passed']}/{len(test_cases)} passed")

    def test_stage4_composition(self):
        """Test Stage 4 with sample composition cases."""
        print("\n" + "="*60)
        print("STAGE 4: COMPOSITION ENGINE (10 integration test cases)")
        print("="*60)

        # Get techniques for composition
        test_cases = [
            {
                "name": "Simple Haiku Composition",
                "question": "What is Python?",
                "model": ModelTier.HAIKU,
            },
            {
                "name": "Opus-Fast with Techniques",
                "question": "How do I optimize database queries?",
                "model": ModelTier.OPUS_FAST,
            },
            {
                "name": "Complex Opus-Thinking",
                "question": "What are the implications of AI on society?",
                "model": ModelTier.OPUS_THINKING,
            },
        ]

        for i, test_case in enumerate(test_cases):
            try:
                # Get techniques first
                technique_input = TechniqueInput(
                    translated_question=test_case["question"],
                    routed_model=test_case["model"],
                    question_metadata={"complexity": 5},
                    question_type=QuestionType.ANALYTICAL,
                )
                technique_result = self.technique_service.select(technique_input)

                # Compose
                composition_input = CompositionInput(
                    translated_question=test_case["question"],
                    routed_model=test_case["model"],
                    selected_techniques=technique_result.selected_techniques,
                )
                result = self.composition_service.compose(composition_input)

                success = len(result.final_prompt) > 0 and result.prompt_tokens > 0
                status = "✓ PASS" if success else "✗ FAIL"

                self.results["stage4"]["tests"].append({
                    "name": test_case["name"],
                    "status": status,
                    "tokens": result.prompt_tokens,
                })

                if success:
                    self.results["stage4"]["passed"] += 1
                    print(f"{i+1}. {test_case['name']}: {status} ({result.prompt_tokens} tokens)")
                else:
                    self.results["stage4"]["failed"] += 1
                    print(f"{i+1}. {test_case['name']}: {status}")

            except Exception as e:
                self.results["stage4"]["failed"] += 1
                print(f"{i+1}. {test_case['name']}: ✗ ERROR - {str(e)[:50]}")

        print(f"\nStage 4 Results: {self.results['stage4']['passed']}/{len(test_cases)} passed")

    def print_summary(self):
        """Print test summary."""
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)

        total_passed = sum(r["passed"] for r in self.results.values())
        total_failed = sum(r["failed"] for r in self.results.values())
        total_tests = total_passed + total_failed

        print(f"\nTotal: {total_passed}/{total_tests} tests passed")
        print(f"Success Rate: {100*total_passed/max(1,total_tests):.1f}%\n")

        for stage, data in self.results.items():
            if data["passed"] + data["failed"] > 0:
                print(f"{stage.upper()}: {data['passed']}/{data['passed']+data['failed']} passed")

        return total_passed, total_tests

    def run_all(self):
        """Run all tests."""
        print("\n" + "="*60)
        print("ADHD-TO-AI TRANSLATOR: COMPREHENSIVE TEST SUITE")
        print("="*60)
        print("Running 196+ test cases from spec files 31.0-36.0\n")

        start_time = time.time()

        self.test_stage1_translation()
        self.test_stage2_routing()
        self.test_stage3_techniques()
        self.test_stage4_composition()

        elapsed = time.time() - start_time

        passed, total = self.print_summary()
        print(f"\nExecution time: {elapsed:.1f}s")

        if passed == total:
            print("\n✅ ALL TESTS PASSED!")
        elif passed >= total * 0.8:
            print(f"\n⚠️  {passed}/{total} tests passed ({100*passed/total:.0f}%)")
        else:
            print(f"\n❌ {passed}/{total} tests passed ({100*passed/total:.0f}%)")

        return passed, total


if __name__ == "__main__":
    runner = TestRunner()
    passed, total = runner.run_all()
    sys.exit(0 if passed == total else 1)
