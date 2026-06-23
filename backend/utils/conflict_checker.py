"""Technique combination conflict and dependency checker."""

from typing import List, Tuple, Set
from core.constants import (
    TECHNIQUE_CONFLICTS,
    TECHNIQUE_DEPENDENCIES,
    TECHNIQUE_SYNERGIES,
    TECHNIQUE_CANONICAL_ORDER,
)


class ConflictChecker:
    """Check for conflicts and dependencies in technique combinations."""

    @staticmethod
    def check_conflicts(techniques: List[str]) -> List[str]:
        """Check if selected techniques have conflicts."""
        conflicts = []
        technique_set = set(techniques)

        for tech1, tech2 in TECHNIQUE_CONFLICTS:
            if tech1 in technique_set and tech2 in technique_set:
                conflicts.append(f"Conflict: {tech1} and {tech2} cannot be used together")

        return conflicts

    @staticmethod
    def check_dependencies(techniques: List[str]) -> List[Tuple[str, str]]:
        """Check if dependencies are satisfied."""
        unmet_dependencies = []
        technique_set = set(techniques)

        for dependent, required in TECHNIQUE_DEPENDENCIES:
            if dependent in technique_set and required not in technique_set:
                unmet_dependencies.append((dependent, required))

        return unmet_dependencies

    @staticmethod
    def resolve_dependencies(techniques: List[str]) -> List[str]:
        """Resolve dependencies by adding required techniques."""
        result = set(techniques)

        for dependent, required in TECHNIQUE_DEPENDENCIES:
            if dependent in result and required not in result:
                result.add(required)

        return list(result)

    @staticmethod
    def topological_sort(techniques: List[str]) -> List[str]:
        """Sort techniques by canonical order and dependencies."""
        # Create a mapping of technique to its position in canonical order
        order_map = {tech: idx for idx, tech in enumerate(TECHNIQUE_CANONICAL_ORDER)}

        # Build dependency graph
        dependencies = {}
        for tech in techniques:
            dependencies[tech] = set()
            for dependent, required in TECHNIQUE_DEPENDENCIES:
                if tech == dependent and required in techniques:
                    dependencies[tech].add(required)

        # Topological sort
        result = []
        visited = set()

        def visit(tech: str):
            if tech in visited:
                return
            visited.add(tech)

            for dep in dependencies.get(tech, set()):
                visit(dep)

            result.append(tech)

        # Visit in canonical order
        for tech in sorted(techniques, key=lambda t: order_map.get(t, 999)):
            visit(tech)

        return result

    @staticmethod
    def get_synergies(techniques: List[str]) -> List[Tuple[str, str]]:
        """Get synergies between selected techniques."""
        synergies = []
        technique_set = set(techniques)

        for tech1, tech2 in TECHNIQUE_SYNERGIES:
            if tech1 in technique_set and tech2 in technique_set:
                synergies.append((tech1, tech2))

        return synergies

    @staticmethod
    def validate_combination(techniques: List[str]) -> Tuple[bool, List[str]]:
        """Validate a technique combination."""
        errors = []

        # Check conflicts
        conflicts = ConflictChecker.check_conflicts(techniques)
        errors.extend(conflicts)

        # Check dependencies
        unmet_deps = ConflictChecker.check_dependencies(techniques)
        for dependent, required in unmet_deps:
            errors.append(f"Dependency: {dependent} requires {required}")

        is_valid = len(errors) == 0
        return is_valid, errors
