# Standalone Assignment Contract

A task may become active only when one portable packet contains all fields below or embeds their complete definitions. A new AI must not need chat history or the master blueprint to execute it.

1. Stable task ID and title
2. Purpose and required outcome
3. In-scope work
4. Explicit exclusions
5. Starting repository, branch, and full checkpoint
6. Authority sources and precedence
7. Accepted meaning/requirement boundary
8. Owned problems and complete definitions
9. Owned outcomes and complete definitions
10. Deliverables and exact paths
11. Allowed paths/actions
12. Prohibited paths/actions
13. Dependency edges with one of the four dependency types
14. Required prerequisite statuses
15. Interfaces and ownership boundaries
16. Unresolved decisions and blocking effect
17. Acceptance tests and expected results
18. Evidence requirements and permitted claims
19. Gate IDs and transition criteria
20. Checkpoint/resumption procedure
21. Failure, contamination, and recovery behavior
22. Exact completion and next-task rule

Referenced IDs without embedded definitions or exact stable paths make the packet incomplete. A packet cannot grant authority absent from a higher source. Starting a task with an incomplete packet fails closed and reports the missing field plus the exact correction task.
