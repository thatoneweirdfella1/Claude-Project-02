"""
RSD Trigger Detector (Phase 2A - P0)

Identifies potential Rejection Sensitive Dysphoria triggers before responding.
RSD affects 99% of ADHD adults and causes disproportionate emotional pain from
perceived criticism or dismissal.

Detects and reframes:
1. Implicit criticism ("you should have")
2. Disappointment tone ("I wish you had...")
3. Minimizing language ("just", "simply", "merely")
4. Conditional doubt ("if you can", "if you're able")
5. Correction without context
6. Implied inadequacy

See SYSTEM_OPTIMIZATION_ROADMAP.md Phase 2A for specification.
"""

import re
from typing import Dict, List, Tuple

class RSDTriggerDetector:
    """
    Detects RSD triggers in responses and suggests reframings.
    """

    # RSD trigger patterns (what to watch for)
    IMPLICIT_CRITICISM_PATTERNS = [
        r"you\s+should\s+have\s+",     # "you should have tried"
        r"you\s+(?:didn't|couldn't|won't)\s+",  # "you didn't consider"
        r"you\s+(?:missed|overlooked|failed)",  # "you failed to see"
        r"mistake(?:n)?(?:\s+in\s+)?(?:your|what)",  # "mistake in what you did"
        r"didn't\s+think\s+(?:to\s+)?(?:consider|check)",  # "didn't think to"
        r"(?:obviously|clearly|obviously)\s+(?:you|.*should)",  # implied "this is obvious"
    ]

    DISAPPOINTMENT_TONE_PATTERNS = [
        r"i\s+(?:wish|wish you had|was hoping you'd)",  # "I wish you had"
        r"i'm\s+(?:disappointed|sad|sorry|frustrated)",  # Disappointment statements
        r"unfortunate(?:ly)?\s+(?:you|that)",  # "Unfortunately, you didn't..."
        r"(?:i\s+)?expected\s+(?:better|more)",  # "I expected better"
    ]

    MINIMIZING_PATTERNS = [
        r"\bjust\b(?!\s+(?:to|in|for))",  # "just do X" (not "just in case")
        r"\bmerely\b",                   # "merely"
        r"\bsimply\b",                   # "simply"
        r"\bonly\s+(?:need|have|is)",    # "only need to"
        r"it's\s+(?:easy|simple|straightforward)",  # "it's easy to"
        r"all\s+you\s+(?:need|have)\s+to",  # "all you need to"
    ]

    CONDITIONAL_DOUBT_PATTERNS = [
        r"if\s+you\s+(?:can|are able|manage|have)",  # "if you can"
        r"hopefully\s+you\s+(?:can|will)",  # "hopefully you can"
        r"(?:in\s+case\s+you\s+)?can't\b",  # "in case you can't"
        r"might\s+have\s+(?:trouble|difficulty)",  # "might have trouble"
    ]

    CORRECTION_WITHOUT_CONTEXT = [
        r"(?:that's|that is)\s+(?:actually|really|technically)",  # "that's actually..."
        r"not\s+(?:quite|exactly)\s+right",  # "not quite right"
        r"well,?\s+(?:actually|not\s+quite)",  # "well, actually..."
        r"you\s+(?:might|may)\s+have\s+meant",  # "you might have meant"
    ]

    IMPLIED_INADEQUACY_PATTERNS = [
        r"(?:not|lack(?:ing)?)\s+(?:experience|skill|knowledge)",  # "lacking knowledge"
        r"haven't\s+(?:thought|considered|realized)",  # "haven't considered"
        r"(?:most|many)\s+people\s+(?:don't|wouldn't)",  # implied "you're abnormal"
        r"it's\s+(?:common|normal|typical)\s+(?:to|for)",  # implied "you're behind"
    ]

    # Reframing suggestions
    REFRAME_MAPPING = {
        "implicit_criticism": {
            "pattern": r"you\s+should\s+have\s+(\w+)",
            "reframe": r"One approach that often works is \1",
        },
        "disappointment": {
            "pattern": r"i\s+(?:wish|was hoping)\s+you\s+had\s+(\w+)",
            "reframe": r"If you're interested, you might consider \1",
        },
        "minimizing": {
            "pattern": r"\bjust\s+(\w+)",
            "reframe": r"\1 (when you're ready)",
        },
        "conditional_doubt": {
            "pattern": r"if\s+you\s+(?:can|are able to)\s+",
            "reframe": r"When you're ready to ",
        },
        "correction": {
            "pattern": r"(?:that's|that is)\s+(?:actually|really)\s+",
            "reframe": r"Another way to look at it: ",
        },
    }

    def detect_potential_triggers(self, response: str) -> Dict[str, List[str]]:
        """
        Scan response for RSD trigger patterns.
        Returns dict of detected triggers by type.
        """
        detected = {
            "implicit_criticism": [],
            "disappointment_tone": [],
            "minimizing": [],
            "conditional_doubt": [],
            "correction_without_context": [],
            "implied_inadequacy": [],
        }

        # Scan for each trigger type
        for pattern in self.IMPLICIT_CRITICISM_PATTERNS:
            matches = re.findall(pattern, response, re.IGNORECASE)
            detected["implicit_criticism"].extend(matches)

        for pattern in self.DISAPPOINTMENT_TONE_PATTERNS:
            matches = re.findall(pattern, response, re.IGNORECASE)
            detected["disappointment_tone"].extend(matches)

        for pattern in self.MINIMIZING_PATTERNS:
            matches = re.findall(pattern, response, re.IGNORECASE)
            detected["minimizing"].extend(matches)

        for pattern in self.CONDITIONAL_DOUBT_PATTERNS:
            matches = re.findall(pattern, response, re.IGNORECASE)
            detected["conditional_doubt"].extend(matches)

        for pattern in self.CORRECTION_WITHOUT_CONTEXT:
            matches = re.findall(pattern, response, re.IGNORECASE)
            detected["correction_without_context"].extend(matches)

        for pattern in self.IMPLIED_INADEQUACY_PATTERNS:
            matches = re.findall(pattern, response, re.IGNORECASE)
            detected["implied_inadequacy"].extend(matches)

        return detected

    def classify_trigger_type(self, trigger: str) -> str:
        """Classify what type of RSD trigger was detected."""
        if any(re.search(p, trigger, re.IGNORECASE) for p in self.IMPLICIT_CRITICISM_PATTERNS):
            return "implicit_criticism"
        elif any(re.search(p, trigger, re.IGNORECASE) for p in self.DISAPPOINTMENT_TONE_PATTERNS):
            return "disappointment_tone"
        elif any(re.search(p, trigger, re.IGNORECASE) for p in self.MINIMIZING_PATTERNS):
            return "minimizing"
        elif any(re.search(p, trigger, re.IGNORECASE) for p in self.CONDITIONAL_DOUBT_PATTERNS):
            return "conditional_doubt"
        elif any(re.search(p, trigger, re.IGNORECASE) for p in self.CORRECTION_WITHOUT_CONTEXT):
            return "correction_without_context"
        elif any(re.search(p, trigger, re.IGNORECASE) for p in self.IMPLIED_INADEQUACY_PATTERNS):
            return "implied_inadequacy"
        else:
            return "unknown"

    def suggest_reframing(self, trigger: str, trigger_type: str = None) -> str:
        """
        Suggest a reframing of an RSD trigger.
        Returns the reframed version of the text.
        """
        if not trigger_type:
            trigger_type = self.classify_trigger_type(trigger)

        # Find applicable reframe pattern
        if trigger_type == "implicit_criticism":
            # "you should have tried X" → "One approach that often works is X"
            return re.sub(
                self.REFRAME_MAPPING["implicit_criticism"]["pattern"],
                self.REFRAME_MAPPING["implicit_criticism"]["reframe"],
                trigger,
                flags=re.IGNORECASE,
            )
        elif trigger_type == "disappointment":
            return re.sub(
                self.REFRAME_MAPPING["disappointment"]["pattern"],
                self.REFRAME_MAPPING["disappointment"]["reframe"],
                trigger,
                flags=re.IGNORECASE,
            )
        elif trigger_type == "minimizing":
            return re.sub(
                self.REFRAME_MAPPING["minimizing"]["pattern"],
                self.REFRAME_MAPPING["minimizing"]["reframe"],
                trigger,
                flags=re.IGNORECASE,
            )
        elif trigger_type == "conditional_doubt":
            return re.sub(
                self.REFRAME_MAPPING["conditional_doubt"]["pattern"],
                self.REFRAME_MAPPING["conditional_doubt"]["reframe"],
                trigger,
                flags=re.IGNORECASE,
            )
        elif trigger_type == "correction":
            return re.sub(
                self.REFRAME_MAPPING["correction"]["pattern"],
                self.REFRAME_MAPPING["correction"]["reframe"],
                trigger,
                flags=re.IGNORECASE,
            )

        # Default: soften without specific rule
        return trigger.replace("you should", "you might consider").replace(
            "clearly", "it seems like"
        )

    def validate_response_for_rsd_safety(self, response: str) -> Tuple[bool, List[str]]:
        """
        Check if response is RSD-safe (no detected triggers).
        Returns (is_safe, list_of_issues).
        """
        detected = self.detect_potential_triggers(response)
        issues = []

        for trigger_type, triggers in detected.items():
            if triggers:
                count = len(set(triggers))  # Unique triggers
                issues.append(f"{trigger_type}: {count} instance(s)")

        is_safe = len(issues) == 0
        return is_safe, issues

    def reframe_response(self, response: str) -> str:
        """
        Reframe a response to remove RSD triggers.
        Applies all relevant reframings by pattern matching and replacement.
        """
        reframed = response

        # Apply reframing patterns directly on the response
        for trigger_type, mapping in self.REFRAME_MAPPING.items():
            pattern = mapping["pattern"]
            replacement = mapping["reframe"]
            reframed = re.sub(pattern, replacement, reframed, flags=re.IGNORECASE)

        # Additional pattern-based fixes for detected trigger types
        reframed = re.sub(
            r'\b(?:you|we)\s+(?:didn\'t|didn\'t|couldn\'t|won\'t)\s+',
            'One approach that works is ',
            reframed,
            flags=re.IGNORECASE
        )

        return reframed

    def confidence_score(self, response: str) -> float:
        """
        Score how confident we are that this response is RSD-safe.
        Returns 0-1 score.
        """
        is_safe, issues = self.validate_response_for_rsd_safety(response)

        if is_safe:
            return 1.0

        # Score based on number and severity of issues
        total_issues = len(issues)
        severity = {
            "implicit_criticism": 0.8,  # High severity
            "disappointment_tone": 0.7,  # High severity
            "minimizing": 0.6,           # Medium severity
            "conditional_doubt": 0.5,    # Medium severity
            "correction_without_context": 0.6,  # Medium severity
            "implied_inadequacy": 0.7,   # High severity
        }

        total_severity = sum(
            severity.get(issue.split(":")[0], 0.5)
            for issue in issues
        )

        # Score: 1.0 - (severity / total_issues)
        # E.g., 1 high-severity issue: 1.0 - 0.8 = 0.2
        # E.g., 2 medium issues: 1.0 - (0.6 + 0.6) = -0.2 (clamped to 0)
        confidence = 1.0 - (total_severity / max(total_issues, 1))
        return max(0, confidence)


def detect_rsd_triggers(response: str) -> Dict[str, any]:
    """
    Convenience function: check a response for RSD triggers.
    Returns detected triggers and confidence score.
    """
    detector = RSDTriggerDetector()

    is_safe, issues = detector.validate_response_for_rsd_safety(response)
    confidence = detector.confidence_score(response)

    return {
        "is_rsd_safe": is_safe,
        "detected_triggers": detector.detect_potential_triggers(response),
        "issues": issues,
        "confidence_score": confidence,
    }


def reframe_for_rsd_safety(response: str) -> Dict[str, any]:
    """
    Convenience function: reframe a response to be RSD-safe.
    Returns reframed response and metadata.
    """
    detector = RSDTriggerDetector()

    original_safe, original_issues = detector.validate_response_for_rsd_safety(response)
    reframed = detector.reframe_response(response)
    new_safe, new_issues = detector.validate_response_for_rsd_safety(reframed)

    return {
        "original_response": response,
        "reframed_response": reframed,
        "was_safe": original_safe,
        "is_now_safe": new_safe,
        "original_issues": original_issues,
        "remaining_issues": new_issues,
        "reframing_applied": not original_safe,
        "confidence_score": detector.confidence_score(reframed),
    }
