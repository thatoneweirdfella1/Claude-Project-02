"""
Cognitive Load Meter (Phase 2A - P0)

Monitors response for cumulative cognitive load and simplifies when needed.
ADHD brains have reduced working memory capacity (~3 vs. 7 items for neurotypical).
Too much information at once causes overwhelm and shutdown.

Strategy: Score each response component, trigger simplification at threshold.

See SYSTEM_OPTIMIZATION_ROADMAP.md Phase 2A for specification.
"""

import re
from typing import Dict, List, Tuple

class CognitiveLoadMeter:
    """
    Scores and manages cognitive load in responses.
    """

    # Cognitive load scoring system
    LOAD_WEIGHTS = {
        "new_concept": 1,               # Each introduced term/concept
        "abstract_without_example": 2,  # Abstract idea with no concrete example
        "long_paragraph": 1,            # Paragraph >150 words
        "open_question": 2,             # Question posed to user (requires thinking)
        "missing_context": 1,           # Reference without setup
        "multiple_viewpoints": 1,       # Multiple perspectives to hold
        "temporal_reference": 0.5,      # Different time periods to track
        "conditional_statement": 0.5,   # "if X then Y" requires holding state
        "nested_structure": 1,          # Lists within lists, sub-points
        "technical_jargon": 1,          # Unexplained technical terms
    }

    OVERLOAD_THRESHOLD = 8  # Score > 8 triggers simplification

    def calculate_load_score(self, response: str) -> Dict[str, any]:
        """
        Calculate cognitive load score for response.
        Returns detailed breakdown by category.
        """
        scores = {}
        total = 0

        # New concepts
        concept_words = set(re.findall(
            r'\b(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|[a-z]+_[a-z]+)\b',
            response
        ))
        scores["new_concepts"] = min(len(concept_words), 10)  # Cap at 10
        total += scores["new_concepts"] * self.LOAD_WEIGHTS["new_concept"]

        # Abstract without examples
        abstract_keywords = [
            'concept', 'idea', 'principle', 'theory', 'pattern',
            'approach', 'method', 'system', 'framework', 'model'
        ]
        abstract_count = sum(
            len(re.findall(rf'\b{kw}\b', response, re.IGNORECASE))
            for kw in abstract_keywords
        )
        has_examples = bool(re.search(
            r'(?:for example|e\.g\.|for instance|such as|like)',
            response,
            re.IGNORECASE
        ))
        abstract_load = max(0, abstract_count - 1) if not has_examples else 0
        scores["abstract_without_examples"] = abstract_load
        total += abstract_load * self.LOAD_WEIGHTS["abstract_without_example"]

        # Long paragraphs
        paragraphs = response.split('\n\n')
        long_paragraphs = sum(
            1 for p in paragraphs
            if len(p.split()) > 150
        )
        scores["long_paragraphs"] = long_paragraphs
        total += long_paragraphs * self.LOAD_WEIGHTS["long_paragraph"]

        # Open questions
        open_questions = len(re.findall(r'\?', response))
        scores["open_questions"] = open_questions
        total += open_questions * self.LOAD_WEIGHTS["open_question"]

        # Missing context (orphaned pronouns)
        orphaned_pronouns = len(re.findall(r'\b(?:it|this|that|these|those)\b', response))
        scores["missing_context_signals"] = max(0, orphaned_pronouns - 5)
        total += scores["missing_context_signals"] * self.LOAD_WEIGHTS["missing_context"]

        # Multiple viewpoints
        viewpoint_markers = ['on one hand', 'on the other hand', 'alternatively', 'conversely']
        viewpoints = sum(
            len(re.findall(rf'\b{marker}\b', response, re.IGNORECASE))
            for marker in viewpoint_markers
        )
        scores["viewpoints"] = viewpoints
        total += viewpoints * self.LOAD_WEIGHTS["multiple_viewpoints"]

        # Temporal references (different time periods)
        time_refs = len(re.findall(
            r'\b(?:past|future|before|after|then|now|currently|previously|later|eventually)\b',
            response,
            re.IGNORECASE
        ))
        scores["temporal_references"] = max(0, time_refs - 2)
        total += scores["temporal_references"] * self.LOAD_WEIGHTS["temporal_reference"]

        # Conditional statements
        conditionals = len(re.findall(r'\b(?:if|unless|when|unless|provided)\b', response, re.IGNORECASE))
        scores["conditional_statements"] = max(0, conditionals - 1)
        total += scores["conditional_statements"] * self.LOAD_WEIGHTS["conditional_statement"]

        # Nested structure (bullets/lists within lists)
        list_items = len(re.findall(r'^[\s]*[-•*]\s', response, re.MULTILINE))
        nested = len(re.findall(r'^[\s]{2,}[-•*]\s', response, re.MULTILINE))
        scores["nested_structures"] = 1 if nested > 0 else 0
        total += scores["nested_structures"] * self.LOAD_WEIGHTS["nested_structure"]

        # Technical jargon
        jargon = len(re.findall(
            r'\b(?:[a-z]+_[a-z]+|[a-z]+[A-Z][a-zA-Z]+)\b',
            response
        ))
        scores["technical_terms"] = min(jargon, 8)  # Cap at 8
        total += scores["technical_terms"] * self.LOAD_WEIGHTS["technical_jargon"]

        return {
            "component_scores": scores,
            "total_score": total,
            "is_overloaded": total > self.OVERLOAD_THRESHOLD,
            "threshold": self.OVERLOAD_THRESHOLD,
        }

    def identify_overload_areas(self, response: str) -> List[str]:
        """
        Identify which components are contributing most to overload.
        Returns recommendations for reduction.
        """
        result = self.calculate_load_score(response)
        scores = result["component_scores"]

        overload_areas = []

        # Sort by load contribution (weight × count)
        weighted_loads = {
            "abstract_without_examples": scores["abstract_without_examples"] * self.LOAD_WEIGHTS["abstract_without_example"],
            "open_questions": scores["open_questions"] * self.LOAD_WEIGHTS["open_question"],
            "long_paragraphs": scores["long_paragraphs"] * self.LOAD_WEIGHTS["long_paragraph"],
            "viewpoints": scores["viewpoints"] * self.LOAD_WEIGHTS["multiple_viewpoints"],
            "conditional_statements": scores["conditional_statements"] * self.LOAD_WEIGHTS["conditional_statement"],
        }

        # Sort by load contribution
        sorted_loads = sorted(weighted_loads.items(), key=lambda x: x[1], reverse=True)

        for area, load in sorted_loads:
            if load > 0:
                overload_areas.append(area)

        return overload_areas

    def suggest_distribution(self, response: str) -> List[str]:
        """
        Suggest how to distribute complex info across multiple interactions.
        Returns list of suggestions.
        """
        result = self.calculate_load_score(response)

        if result["total_score"] <= self.OVERLOAD_THRESHOLD:
            return []

        suggestions = []
        overload_areas = self.identify_overload_areas(response)

        if "abstract_without_examples" in overload_areas:
            suggestions.append("Split abstract concepts: provide examples in follow-up")

        if "open_questions" in overload_areas:
            suggestions.append("Reduce open questions per response (max 1 per 150 words)")

        if "long_paragraphs" in overload_areas:
            suggestions.append("Break paragraphs at 150 words; add line breaks")

        if "viewpoints" in overload_areas:
            suggestions.append("Pick the strongest perspective; offer alternatives as follow-up")

        if "conditional_statements" in overload_areas:
            suggestions.append("Simplify conditionals; state the most likely case first")

        if len(suggestions) == 0:
            suggestions.append("Consider spacing the response over multiple interactions")

        return suggestions

    def simplify_incrementally(self, response: str) -> str:
        """
        Simplify response while preserving meaning.
        Returns simplified version.
        """
        result = self.calculate_load_score(response)

        if result["total_score"] <= self.OVERLOAD_THRESHOLD:
            return response  # No simplification needed

        simplified = response

        # Remove parenthetical asides that add but aren't critical
        simplified = re.sub(
            r'\s*\([^)]*(?:however|although|for example|e\.g\.)[^)]*\)',
            '',
            simplified
        )

        # Reduce multiple viewpoints: keep the primary, drop the counter-weighing.
        # Handles both period- and comma-separated "on one hand / on the other hand".
        if re.search(r'on one hand.*?on the other hand', simplified, re.IGNORECASE | re.DOTALL):
            # Keep the first viewpoint clause, drop "on the other hand ..." up to
            # the next sentence boundary or strong conjunction.
            simplified = re.sub(
                r'\bon one hand\b\s*',
                '',
                simplified,
                flags=re.IGNORECASE,
            )
            simplified = re.sub(
                r'[,;]?\s*on the other hand\b.*?(?=[.?!]|\bbut\b|\bunless\b|$)',
                '',
                simplified,
                count=1,
                flags=re.IGNORECASE | re.DOTALL,
            )

        # Simplify conditionals: state base case clearly
        simplified = re.sub(
            r'(?:unless|if not)',
            'if',
            simplified,
            flags=re.IGNORECASE
        )

        # Collapse trailing fragment questions ("... C? And D?") into one.
        # Multiple short open questions stacked at the end are pure load.
        trailing_q = re.findall(r'([^.?!]*\?)', simplified)
        if len(trailing_q) >= 2:
            # Keep only the first substantive question; drop short fragments
            # like "And D?" / "What about C?" that trail it.
            fragments = [q.strip() for q in trailing_q]
            short_fragments = [q for q in fragments[1:] if len(q.split()) <= 5]
            for frag in short_fragments:
                simplified = simplified.replace(frag, '', 1)

        # Clean up artifacts from clause removals (missing spaces, double spaces,
        # floating punctuation, words run together at removal seams).
        simplified = re.sub(r'([a-z])([A-Z])', r'\1 \2', simplified)   # wellBut -> well But
        simplified = re.sub(r'([a-z])(but|unless|and|or)\b', r'\1 \2', simplified, flags=re.IGNORECASE)
        simplified = re.sub(r'\s{2,}', ' ', simplified)
        simplified = re.sub(r'\s+([,.?!])', r'\1', simplified)
        simplified = simplified.strip()

        # Break long sentences at major conjunctions
        sentences = re.split(r'(?<=[.!?])\s+', simplified)
        new_sentences = []

        for sentence in sentences:
            if len(sentence.split()) > 40:  # Long sentence
                # Split on "and", "but", "because" if present
                parts = re.split(r'\s+(?:and|but|because|which)\s+', sentence, maxsplit=1)
                new_sentences.extend(parts)
            else:
                new_sentences.append(sentence)

        simplified = ' '.join(new_sentences)

        # Reduce technical jargon with explanations
        # (Note: would need mapping of jargon→simple, implement basic version)
        tech_terms = re.findall(r'\b[a-z]+_[a-z]+\b', simplified, re.IGNORECASE)
        for term in set(tech_terms):
            # Replace with more descriptive phrase
            simple = term.replace('_', ' ')
            simplified = re.sub(rf'\b{re.escape(term)}\b', simple, simplified)

        return simplified


def assess_cognitive_load(response: str) -> Dict[str, any]:
    """
    Convenience function: assess cognitive load and get recommendations.
    Returns comprehensive load assessment.
    """
    meter = CognitiveLoadMeter()

    load_result = meter.calculate_load_score(response)
    overload_areas = meter.identify_overload_areas(response)
    suggestions = meter.suggest_distribution(response)

    return {
        "total_score": load_result["total_score"],
        "is_overloaded": load_result["is_overloaded"],
        "overload_areas": overload_areas,
        "suggestions": suggestions,
        "component_scores": load_result["component_scores"],
    }


def simplify_overloaded_response(response: str) -> Dict[str, any]:
    """
    Convenience function: simplify if overloaded.
    Returns simplified response and metadata.
    """
    meter = CognitiveLoadMeter()

    original_load = meter.calculate_load_score(response)
    simplified = meter.simplify_incrementally(response)
    new_load = meter.calculate_load_score(simplified)

    return {
        "original_response": response,
        "simplified_response": simplified,
        "original_load_score": original_load["total_score"],
        "simplified_load_score": new_load["total_score"],
        "was_overloaded": original_load["is_overloaded"],
        "is_now_overloaded": new_load["is_overloaded"],
        "simplification_applied": original_load["is_overloaded"],
        "load_reduction": original_load["total_score"] - new_load["total_score"],
    }
