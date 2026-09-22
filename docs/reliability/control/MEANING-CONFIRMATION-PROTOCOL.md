# Meaning Confirmation Protocol

## Purpose

Catch consequential differences between the user's intended result and the literal wording without making the user supervise technical execution.

## Required pre-work record

Before consequential design, implementation, deletion, promotion, deployment, authority change, or architecture change, record:

- **Interpreted outcome:** one plain-language sentence describing what will be true afterward.
- **Boundary:** one sentence describing what will not be changed.
- **Material ambiguity:** `none` or one decision whose alternatives would materially change the result.
- **Authority match:** exact existing decision/requirement, or `unresolved`.

If there is no material ambiguity and authority matches, proceed without asking the user to restate the task. If one material ambiguity exists, ask one short question with mutually exclusive choices and do not perform the affected work. Minor wording, spelling, or implementation-detail uncertainty is resolved from authority and recorded; it is not pushed back onto the user.

An AI may not transform an outcome request into a narrower convenient task, treat an example as the entire scope, or claim confirmation from silence. Later explicit correction supersedes only the scope it actually changes and must be logged.

G1-C must make absence or staleness of this record block consequential task activation where the assignment requires meaning confirmation.
