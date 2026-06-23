"""Prompt composition validators - 8 validation checks."""

from typing import List, Tuple
from models.enums import ModelTier
from core.constants import TOKEN_BUDGET, MAX_TECHNIQUES


class CompositionValidator:
    """Validate composed prompts before sending to model."""

    @staticmethod
    def validate_constraint_compliance(prompt: str) -> Tuple[bool, str]:
        """Check 1: Prompt follows stated constraints."""
        # Check for common constraint violations
        if len(prompt) > 10000:
            return False, "Prompt exceeds maximum length"
        if not prompt.strip():
            return False, "Prompt is empty"
        return True, ""

    @staticmethod
    def validate_role_presence(prompt: str, should_have_role: bool) -> Tuple[bool, str]:
        """Check 2: Role is present if required."""
        has_role = any(
            phrase in prompt.lower()
            for phrase in ["you are", "as a", "your role", "act as"]
        )
        if should_have_role and not has_role:
            return False, "Expected role-priming but not found"
        return True, ""

    @staticmethod
    def validate_question_presence(prompt: str) -> Tuple[bool, str]:
        """Check 3: Core question is present."""
        if "?" not in prompt and not any(
            word in prompt.lower() for word in ["help me", "explain", "describe"]
        ):
            return False, "Question not clearly present in prompt"
        return True, ""

    @staticmethod
    def validate_techniques_injected(
        prompt: str, expected_techniques: List[str]
    ) -> Tuple[bool, str]:
        """Check 4: Expected techniques are injected."""
        # Check for common technique indicators
        technique_keywords = {
            "T01": ["don't know", "i don't know"],
            "T02": ["step by step", "chain of thought", "thinking process"],
            "T03": ["quote", "cite", "source"],
            "T04": ["verify", "check", "double-check"],
            "T05": ["accuracy", "expert", "precision"],
            "T06": ["retrieve", "retrieve", "external", "knowledge"],
            "T07": ["example", "sample", "for instance"],
            "T08": ["prioritize", "hierarchy", "important"],
            "T09": ["avoid", "don't", "constraint"],
            "T10": ["format", "structure", "following format"],
            "T11": ["break down", "decompose", "separate"],
            "T12": ["reframe", "alternative", "another way"],
            "T13": ["assumption", "assume", "implies"],
            "T14": ["scope", "limited to", "focus on"],
            "T15": ["meta", "approach", "strategy"],
            "T16": ["step 1", "step 2", "numbered", "list"],
            "T17": ["confidence", "certain", "sure"],
            "T18": ["violate", "constraint", "break"],
        }

        found_techniques = []
        for tech, keywords in technique_keywords.items():
            if any(keyword in prompt.lower() for keyword in keywords):
                found_techniques.append(tech)

        # Check if we found most expected techniques
        expected_set = set(expected_techniques)
        found_set = set(found_techniques)
        if len(expected_set & found_set) < len(expected_set) * 0.6:
            missing = expected_set - found_set
            return False, f"Some techniques not clearly injected: {missing}"
        return True, ""

    @staticmethod
    def validate_output_format_spec(prompt: str) -> Tuple[bool, str]:
        """Check 5: Output format is specified."""
        has_format_spec = any(
            phrase in prompt.lower()
            for phrase in [
                "format",
                "output",
                "response should",
                "return",
                "structure",
            ]
        )
        if not has_format_spec:
            return False, "Output format not specified"
        return True, ""

    @staticmethod
    def validate_no_conflicts(techniques: List[str]) -> Tuple[bool, str]:
        """Check 6: No technique conflicts."""
        from utils.conflict_checker import ConflictChecker

        is_valid, errors = ConflictChecker.validate_combination(techniques)
        if not is_valid:
            return False, "; ".join(errors)
        return True, ""

    @staticmethod
    def validate_token_budget(
        prompt: str, model_tier: ModelTier, token_count: int
    ) -> Tuple[bool, str]:
        """Check 7: Token count within budget."""
        budget = TOKEN_BUDGET.get(model_tier, 800)
        # Rough estimate: 1 token ≈ 4 characters
        estimated_tokens = len(prompt) // 4

        if estimated_tokens > budget:
            return (
                False,
                f"Prompt exceeds token budget: {estimated_tokens} > {budget}",
            )
        return True, ""

    @staticmethod
    def validate_scope_clarity(prompt: str, scope: str) -> Tuple[bool, str]:
        """Check 8: Scope is clear."""
        if not scope:
            return False, "Scope not specified"

        # Check for scope-related keywords
        scope_keywords = {
            "narrow": ["specifically", "only", "limited", "just"],
            "medium": ["including", "covering", "also consider"],
            "broad": ["overall", "big picture", "holistic", "comprehensive"],
        }

        if scope in scope_keywords:
            has_scope_keyword = any(
                kw in prompt.lower() for kw in scope_keywords[scope]
            )
            if not has_scope_keyword:
                return False, f"Scope '{scope}' not clearly communicated"

        return True, ""

    @staticmethod
    def validate_prompt(
        prompt: str,
        model_tier: ModelTier,
        techniques: List[str],
        scope: str = "medium",
        should_have_role: bool = True,
    ) -> Tuple[bool, List[str]]:
        """Run all 8 validation checks."""
        checks = [
            (
                "Constraint Compliance",
                CompositionValidator.validate_constraint_compliance(prompt),
            ),
            (
                "Role Presence",
                CompositionValidator.validate_role_presence(prompt, should_have_role),
            ),
            ("Question Presence", CompositionValidator.validate_question_presence(prompt)),
            (
                "Techniques Injected",
                CompositionValidator.validate_techniques_injected(prompt, techniques),
            ),
            (
                "Output Format Spec",
                CompositionValidator.validate_output_format_spec(prompt),
            ),
            (
                "No Conflicts",
                CompositionValidator.validate_no_conflicts(techniques),
            ),
            (
                "Token Budget",
                CompositionValidator.validate_token_budget(prompt, model_tier, len(prompt)),
            ),
            (
                "Scope Clarity",
                CompositionValidator.validate_scope_clarity(prompt, scope),
            ),
        ]

        all_passed = True
        errors = []

        for check_name, (is_valid, error_msg) in checks:
            if not is_valid:
                all_passed = False
                errors.append(f"{check_name}: {error_msg}")

        return all_passed, errors
