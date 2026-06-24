"""
Anti-Sycophancy Engine (Phase 2B - User-Requested Priority)

Core insight (from the user): AI hallucination and agreeability are linked. An AI
doesn't need to appease the user — its honesty is understood as mechanical, not
personal. For neurodivergent users especially, kiss-ass behavior and empty
pleasantries are patronizing and insufferable. The robotic, straight-forward,
no-pleasantries personality is PREFERRED.

This engine:
1. Strips sycophantic openers ("Great question!", "What a fascinating...")
2. Removes empty validation ("You're absolutely right!", "Excellent point!")
3. Cuts hedging-to-please ("I'd be happy to", "I'd love to help")
4. Removes unnecessary apologies ("I'm so sorry", "I apologize")
5. Detects agreement-without-substance (a hallucination risk signal)
6. Preserves directness: lead with the answer, not the flattery

The principle: mechanical honesty > social lubrication. Directness reduces both
patronizing tone AND the agreeability that drives hallucination.
"""

import re
from typing import Dict, List, Tuple

# Sycophantic opener patterns (flattery before substance)
SYCOPHANTIC_OPENERS = [
    r"^(?:wow,?\s+)?(?:that's|what)\s+(?:a\s+)?(?:great|excellent|fantastic|wonderful|brilliant|fascinating|interesting|insightful|thoughtful|good)\s+(?:question|point|idea|observation|insight)[!.]*\s*",
    r"^great\s+question[!.]*\s*",
    r"^(?:i\s+)?(?:love|really like|appreciate)\s+(?:this|that|your)\s+(?:question|idea|thinking|approach)[!.]*\s*",
    r"^what\s+(?:a\s+)?(?:great|excellent|fascinating|interesting)[!.]*\s*",
    r"^(?:that's|this is)\s+(?:such\s+)?(?:a\s+)?(?:really\s+)?(?:great|good|excellent|smart|clever)[!.]*\s*",
]

# Empty validation patterns (agreement without substance — hallucination risk)
EMPTY_VALIDATION = [
    r"you're\s+(?:absolutely|totally|completely|so|100%|definitely)\s+right[!.]*",
    r"(?:that's|that is)\s+(?:absolutely|exactly|precisely|totally)\s+(?:right|correct|true)[!.]*",
    r"excellent\s+point[!.]*",
    r"great\s+(?:point|thinking|insight)[!.]*",
    r"(?:you've|you have)\s+(?:hit the nail|nailed it|got it exactly)[!.]*",
    r"spot\s+on[!.]*",
    r"couldn't\s+(?:have\s+)?(?:said|put)\s+it\s+better[!.]*",
]

# Pleasantry / eagerness patterns (social lubrication that adds nothing)
PLEASANTRIES = [
    r"i'd\s+be\s+(?:happy|glad|delighted|more than happy)\s+to[!.]*",
    r"i'd\s+love\s+to\s+(?:help|assist|explore)[!.]*",
    r"(?:i\s+)?hope\s+(?:this|that)\s+helps[!.]*",
    r"happy\s+to\s+help[!.]*",
    r"let\s+me\s+know\s+if\s+(?:you\s+have\s+any|there's\s+anything|you\s+need)[^.!?]*[.!?]",
    r"feel\s+free\s+to\s+(?:ask|reach out)[^.!?]*[.!?]",
    r"please\s+don't\s+hesitate\s+to[^.!?]*[.!?]",
]

# Unnecessary apology patterns (over-apologizing is patronizing)
UNNECESSARY_APOLOGIES = [
    r"i'm\s+(?:so\s+|really\s+|very\s+|terribly\s+)?sorry(?:\s+(?:to hear|about|for))?[,.]?\s*",
    r"i\s+apologize(?:\s+for)?[,.]?\s*",
    r"my\s+apologies[,.]?\s*",
    r"i\s+sincerely\s+apologize[,.]?\s*",
]

# Agreement-without-substance signals (hallucination risk markers)
# When AI agrees enthusiastically without adding verifiable content
HALLUCINATION_RISK_MARKERS = [
    r"(?:yes,?\s+)?(?:absolutely|definitely|certainly|of course)[!.]",  # Reflexive agreement
    r"you\s+(?:make|raise)\s+(?:a\s+)?(?:great|excellent|very good)\s+point",  # Validation filler
    r"i\s+completely\s+agree",  # Agreement without reasoning
]


class AntiSycophancyEngine:
    """
    Strips sycophancy and empty pleasantries; preserves mechanical directness.
    """

    def strip_sycophantic_openers(self, text: str) -> str:
        """Remove flattery openers so the response leads with substance."""
        result = text.lstrip()
        for pattern in SYCOPHANTIC_OPENERS:
            result = re.sub(pattern, "", result, flags=re.IGNORECASE)
        return result.lstrip()

    def strip_empty_validation(self, text: str) -> str:
        """Remove agreement-without-substance phrases."""
        result = text
        for pattern in EMPTY_VALIDATION:
            result = re.sub(pattern, "", result, flags=re.IGNORECASE)
        return result

    def strip_pleasantries(self, text: str) -> str:
        """Remove social-lubrication phrases that add no information."""
        result = text
        for pattern in PLEASANTRIES:
            result = re.sub(pattern, "", result, flags=re.IGNORECASE)
        return result

    def strip_unnecessary_apologies(self, text: str) -> str:
        """Remove over-apologizing. Keep substantive corrections, drop the grovel."""
        result = text
        for pattern in UNNECESSARY_APOLOGIES:
            result = re.sub(pattern, "", result, flags=re.IGNORECASE)
        return result

    def detect_hallucination_risk(self, text: str) -> Dict[str, any]:
        """
        Detect agreement-without-substance — a signal the AI may be appeasing
        rather than reasoning, which correlates with hallucination.
        Returns a risk score and the markers found.
        """
        markers_found = []
        for pattern in HALLUCINATION_RISK_MARKERS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            markers_found.extend(matches)

        # Risk heuristic: reflexive agreement near the start, without
        # supporting "because/evidence/specifically" reasoning nearby.
        has_reasoning = bool(re.search(
            r"\b(?:because|since|specifically|evidence|data|for example|the reason)\b",
            text,
            re.IGNORECASE
        ))

        risk_score = len(markers_found) * 0.3
        if markers_found and not has_reasoning:
            risk_score += 0.4  # Agreement with no reasoning = higher risk

        return {
            "risk_score": min(1.0, risk_score),
            "markers": markers_found,
            "has_supporting_reasoning": has_reasoning,
            "is_high_risk": risk_score >= 0.5,
        }

    def make_direct(self, text: str) -> str:
        """
        Full anti-sycophancy pass: strip all flattery/pleasantry layers and
        return clean, direct text. Mechanical honesty over social lubrication.
        """
        result = text
        result = self.strip_sycophantic_openers(result)
        result = self.strip_empty_validation(result)
        result = self.strip_pleasantries(result)
        result = self.strip_unnecessary_apologies(result)

        # Clean up artifacts left by removals
        result = re.sub(r'\s{2,}', ' ', result)          # collapse double spaces
        result = re.sub(r'\n{3,}', '\n\n', result)       # collapse blank lines
        result = re.sub(r'^[\s,.!]+', '', result)        # strip leading punctuation
        result = re.sub(r'\s+([,.!?])', r'\1', result)   # fix floating punctuation

        return result.strip()

    def validate_directness(self, text: str) -> Tuple[bool, List[str]]:
        """
        Check whether a response is already direct (no sycophancy detected).
        Returns (is_direct, list_of_issues).
        """
        issues = []

        for pattern in SYCOPHANTIC_OPENERS:
            if re.search(pattern, text.lstrip(), re.IGNORECASE):
                issues.append("sycophantic opener")
                break

        for pattern in EMPTY_VALIDATION:
            if re.search(pattern, text, re.IGNORECASE):
                issues.append("empty validation")
                break

        for pattern in PLEASANTRIES:
            if re.search(pattern, text, re.IGNORECASE):
                issues.append("filler pleasantry")
                break

        for pattern in UNNECESSARY_APOLOGIES:
            if re.search(pattern, text, re.IGNORECASE):
                issues.append("unnecessary apology")
                break

        return len(issues) == 0, issues


# Convenience functions

def make_response_direct(text: str) -> Dict[str, any]:
    """
    Strip sycophancy from a response and report what changed.
    """
    engine = AntiSycophancyEngine()
    was_direct, issues = engine.validate_directness(text)
    direct = engine.make_direct(text)
    hallucination = engine.detect_hallucination_risk(text)

    return {
        "response": direct,
        "was_already_direct": was_direct,
        "removed_patterns": issues,
        "applied": not was_direct,
        "hallucination_risk": hallucination,
    }


# Prompt-level instruction so the model avoids sycophancy at generation time
ANTI_SYCOPHANCY_INSTRUCTION = """COMMUNICATION STYLE: Be direct and mechanical. No flattery, no "great question," no "you're absolutely right." Skip pleasantries ("happy to help," "hope this helps"). Don't over-apologize. Lead with the answer, not validation. Agreeability is not the goal — accuracy is. If something is wrong or uncertain, say so plainly; do not appease. Treat blunt honesty as respect, not rudeness."""
