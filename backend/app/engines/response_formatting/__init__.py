"""
Response Formatter Engine (Phase 2A - P0)

Reformats all responses according to ADHD-optimal standards:
1. Chunking: Break into semantic units (max 150 words per chunk)
2. Answer-First: Lead with the bottom line, not the explanation
3. Example-First: Concrete examples before abstraction
4. Visual Structure: Bullet points, white space, hierarchy
5. Cognitive Load Estimation: Track cumulative load and simplify when needed

See SYSTEM_OPTIMIZATION_ROADMAP.md Phase 2A for specification.
"""

import re
from typing import Dict, List, Tuple

class ResponseFormatter:
    """
    ADHD-optimized response formatting engine.
    Transforms responses to match how ADHD brains actually process information.
    """

    # Cognitive load scoring: various elements that require mental effort
    COGNITIVE_LOAD_COSTS = {
        "new_concept": 1,              # Each new term/idea
        "abstract_without_example": 2,  # Abstract without concrete example
        "long_paragraph": 1,           # Paragraph >150 words
        "open_question": 2,            # Open-ended question for user
        "missing_context": 1,          # Reference without enough setup
        "technical_jargon": 1,         # Unexplained technical term
        "multiple_clauses": 0.5,       # Per additional sub-clause
    }

    COGNITIVE_LOAD_THRESHOLD = 8  # Score > 8 triggers simplification

    def __init__(self):
        self.chunks: List[str] = []
        self.cognitive_load: int = 0

    def format_for_adhd_processing(self, response: str) -> Dict[str, any]:
        """
        Format response according to ADHD-optimal standards.
        Returns formatted response + metadata about changes.
        """
        # Step 1: Chunk response at semantic boundaries
        chunks = self._chunk_response(response)

        # Step 2: Calculate cognitive load for each chunk
        chunk_loads = [self._estimate_chunk_load(chunk) for chunk in chunks]

        # Step 3: Reorder if needed (answer first pattern)
        chunks, answer_first_applied = self._apply_answer_first_pattern(chunks)

        # Step 4: Add visual structure
        formatted_chunks = [self._add_visual_structure(chunk) for chunk in chunks]

        # Step 5: Check cumulative load and simplify if needed
        total_load = sum(chunk_loads)
        simplification_applied = False

        if total_load > self.COGNITIVE_LOAD_THRESHOLD:
            formatted_chunks = self._simplify_overloaded_response(formatted_chunks)
            simplification_applied = True

        # Rejoin chunks with proper spacing
        final_response = self._rejoin_chunks(formatted_chunks)

        return {
            "response": final_response,
            "chunk_count": len(formatted_chunks),
            "cognitive_load_score": total_load,
            "is_overloaded": total_load > self.COGNITIVE_LOAD_THRESHOLD,
            "simplification_applied": simplification_applied,
            "answer_first_applied": answer_first_applied,
        }

    def _chunk_response(self, response: str) -> List[str]:
        """
        Break response into semantic chunks (max ~150 words).
        Respects paragraph boundaries and sentence structure.
        """
        # Split on double newlines first (paragraph breaks)
        paragraphs = response.split('\n\n')

        chunks = []
        for para in paragraphs:
            if not para.strip():
                continue

            # If paragraph is already short, keep as-is
            word_count = len(para.split())
            if word_count <= 150:
                chunks.append(para.strip())
            else:
                # Split long paragraphs at sentence boundaries
                sentences = re.split(r'(?<=[.!?])\s+', para)
                current_chunk = []
                current_word_count = 0

                for sentence in sentences:
                    sentence_words = len(sentence.split())

                    # If adding this sentence exceeds limit, start new chunk
                    if current_word_count + sentence_words > 150 and current_chunk:
                        chunks.append(' '.join(current_chunk))
                        current_chunk = [sentence]
                        current_word_count = sentence_words
                    else:
                        current_chunk.append(sentence)
                        current_word_count += sentence_words

                if current_chunk:
                    chunks.append(' '.join(current_chunk))

        return chunks

    def _estimate_chunk_load(self, chunk: str) -> int:
        """
        Estimate cognitive load for a chunk.
        Higher score = more mental effort required.
        """
        load = 0

        # New concepts (capitalized terms not in common words)
        concept_words = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', chunk)
        load += len(concept_words) * self.COGNITIVE_LOAD_COSTS["new_concept"]

        # Technical jargon (heuristic: words with underscores, camelCase)
        jargon = len(re.findall(r'[a-z_]+_[a-z_]+|\b[a-z]+[A-Z][a-zA-Z]+\b', chunk))
        load += jargon * self.COGNITIVE_LOAD_COSTS["technical_jargon"]

        # Abstract content without examples
        # (contains abstract words but no "for example", "e.g.", "like", "such as")
        has_example = any(
            keyword in chunk.lower()
            for keyword in ['for example', 'e.g.', 'such as', 'like', 'for instance', 'example:']
        )
        abstract_words = len(re.findall(
            r'\b(concept|idea|principle|theory|pattern|approach|method|system)\b',
            chunk,
            re.IGNORECASE
        ))
        if abstract_words > 0 and not has_example:
            load += abstract_words * self.COGNITIVE_LOAD_COSTS["abstract_without_example"]

        # Long paragraphs
        word_count = len(chunk.split())
        if word_count > 150:
            load += self.COGNITIVE_LOAD_COSTS["long_paragraph"]

        # Open-ended questions
        open_questions = len(re.findall(r'\?(?:\s|$)', chunk))
        load += open_questions * self.COGNITIVE_LOAD_COSTS["open_question"]

        # Missing context (vague pronouns without antecedent)
        vague_pronouns = len(re.findall(r'\b(?:it|this|that|these|those)\b', chunk))
        if vague_pronouns > 3:  # Threshold: more than 3 suggests context missing
            load += self.COGNITIVE_LOAD_COSTS["missing_context"]

        # Multiple clauses per sentence (parsing overhead)
        clauses = len(re.findall(r'[,;]|(?:but|and|or|because|which|that)\s', chunk))
        load += max(0, clauses - 2) * self.COGNITIVE_LOAD_COSTS["multiple_clauses"]

        return load

    def _apply_answer_first_pattern(self, chunks: List[str]) -> Tuple[List[str], bool]:
        """
        If response is explanation-first, reorder to answer-first.
        ADHD brains need the bottom line immediately.
        """
        # Heuristic: if first chunk is setup/explanation and later chunks have conclusions,
        # move conclusion-like chunks earlier
        answer_indicators = [
            r'(?:the answer is|so|therefore|thus|in conclusion|ultimately)',
            r'^\s*(?:yes|no|it depends)',
            r'(?:key|main|most important)',
        ]

        # Find chunks that look like answers/conclusions
        answer_chunks = []
        explanation_chunks = []

        for chunk in chunks:
            is_answer = any(
                re.search(pattern, chunk, re.IGNORECASE)
                for pattern in answer_indicators
            )
            if is_answer and len(explanation_chunks) > 0:
                # Found answer after explanation - we should reorder
                answer_chunks.append(chunk)
            else:
                explanation_chunks.append(chunk)

        # If we found answers, put them first
        if answer_chunks:
            reordered = answer_chunks + explanation_chunks
            return reordered, True
        else:
            return chunks, False

    def _add_visual_structure(self, chunk: str) -> str:
        """
        Add visual structure to a chunk: bullets, spacing, hierarchy.
        Makes content scannable and reduces cognitive load.
        """
        # If chunk contains list-like items (numbered, bulleted, or separated by commas/ors),
        # convert to visual bullet list
        lines = chunk.split('\n')
        structured_lines = []

        for line in lines:
            # Detect comma-separated items (more than 2 items)
            items = [item.strip() for item in line.split(',')]
            if len(items) > 2 and all(len(item) > 5 for item in items):
                # Convert to bullet list
                structured_lines.append("• " + items[0])
                for item in items[1:]:
                    structured_lines.append("• " + item)
            else:
                structured_lines.append(line)

        return '\n'.join(structured_lines)

    def _simplify_overloaded_response(self, chunks: List[str]) -> List[str]:
        """
        Simplify response when cognitive load is too high.
        Strategy: reduce abstractions, remove jargon, trim examples.
        """
        simplified = []

        for chunk in chunks:
            # Remove excessive parenthetical asides
            simplified_chunk = re.sub(r'\s*\([^)]*(?:however|although|e\.g\.|for example)[^)]*\)', '', chunk)

            # Reduce consecutive commas/clauses (split complex sentences)
            # If sentence has 3+ commas, break it up
            sentences = re.split(r'(?<=[.!?])\s+', simplified_chunk)
            new_sentences = []

            for sentence in sentences:
                if sentence.count(',') >= 3:
                    # Break at conjunctions
                    parts = re.split(r',\s+(?:and|but|or|because)\s+', sentence)
                    new_sentences.extend([p.strip() for p in parts if p.strip()])
                else:
                    new_sentences.append(sentence)

            simplified.append(' '.join(new_sentences))

        return simplified

    def _rejoin_chunks(self, chunks: List[str]) -> str:
        """
        Rejoin formatted chunks with appropriate spacing.
        Use double newlines between chunks (visual breathing room).
        """
        # Add spacing between chunks
        return '\n\n'.join(chunk.strip() for chunk in chunks if chunk.strip())

    def validate_against_adhd_standards(self, response: str) -> Dict[str, any]:
        """
        Validate response against ADHD optimization checklist.
        Returns validation results.
        """
        checks = {
            "has_clear_answer": bool(
                re.search(r'(?:yes|no|the answer is|so|therefore)', response[:200], re.IGNORECASE)
            ),
            "has_short_sentences": len(response.split()) / len(re.split(r'[.!?]', response)) < 25,
            "has_examples": bool(re.search(r'(?:for example|e\.g\.|for instance|such as|like)', response, re.IGNORECASE)),
            "has_visual_structure": bool(re.search(r'(?:^•|^\s*-|^\s*\d+\.|^#{1,6}\s)', response, re.MULTILINE)),
            "has_white_space": response.count('\n') >= len(response.split()) / 50,  # Ratio of newlines
            "is_concise": len(response.split()) < 500,  # Arbitrary but reasonable
        }

        score = sum(1 for v in checks.values() if v)
        return {
            "validation_checks": checks,
            "adherence_score": score / len(checks),  # 0-1
            "recommendations": self._generate_recommendations(checks),
        }

    def _generate_recommendations(self, checks: Dict[str, bool]) -> List[str]:
        """Generate specific recommendations based on validation."""
        recommendations = []

        if not checks["has_clear_answer"]:
            recommendations.append("Add clear answer/recommendation at the start")

        if not checks["has_short_sentences"]:
            recommendations.append("Break into shorter sentences (avg >25 words is too long)")

        if not checks["has_examples"]:
            recommendations.append("Add concrete examples before abstractions")

        if not checks["has_visual_structure"]:
            recommendations.append("Use bullets/numbering to structure content")

        if not checks["has_white_space"]:
            recommendations.append("Add more line breaks for visual breathing room")

        if not checks["is_concise"]:
            recommendations.append("Trim response (too many words overwhelms)")

        return recommendations


def format_response_for_adhd(response: str) -> Dict[str, any]:
    """
    Convenience function: format a response for ADHD-optimal processing.
    Returns the formatted response plus metadata.
    """
    formatter = ResponseFormatter()
    result = formatter.format_for_adhd_processing(response)

    # Also validate
    validation = formatter.validate_against_adhd_standards(result["response"])
    result["validation"] = validation

    return result
