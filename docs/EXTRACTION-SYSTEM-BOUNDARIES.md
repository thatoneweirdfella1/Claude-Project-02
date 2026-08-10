# Extraction System Boundaries

**Status:** FROZEN  
**Authority:** Product identity and separation contract  
**Applies to:** Every current and future Divergence.AI implementation

## 1. The two systems are separate

| System | Intended user | Purpose | Permitted input | Permitted result |
|---|---|---|---|---|
| **Divergent User Interface Extraction/Optimizer** | Divergence.AI customers | Tailor the customer's Divergence.AI experience | The customer's checked personalization areas and that customer's eligible saved Divergence.AI conversations | Versioned changes to that customer's Divergence.AI profile |
| **Personal General-Purpose Extraction Program** | The operator | Extract arbitrary information from any supplied dataset or corpus | Operator-provided datasets, folders, prompts, questions, modes, models, and output settings | Documents, evidence files, comparisons, audits, and organized extraction folders |

## 2. Frozen customer-system identity

- The customer-facing site is the **Divergent User Interface**.
- Its personalization engine is the **Divergent User Interface Extraction/Optimizer**.
- The optimizer is built into Divergence.AI.
- The customer chooses only which approved areas to personalize and presses one start button.
- The optimizer automatically selects the corresponding internal dataset groups and eligible saved conversations.
- The result is a tailored customer profile, not a general extraction product.

## 3. Prohibited system mixing

The Divergent User Interface Extraction/Optimizer must never inherit a feature merely because it exists in the Personal General-Purpose Extraction Program.

In particular, the customer optimizer must not expose arbitrary extraction prompts, uploaded datasets, folder selection, output-folder selection, extraction modes, model selection, output formats, general research tools, batch queues, A/B extraction tests, or extraction result management.

The personal extraction program must not be treated as the specification, prototype, replacement, or UI model for the customer optimizer.

Shared low-level utilities are permitted only when they do not change either product's user decisions, purpose, data boundaries, outputs, or workflow.

## 4. GitHub source-of-truth rule

- This boundary document and the approved optimizer specification are authoritative.
- Conversations, implementation shortcuts, mockups, and code comments cannot silently override them.
- The existing five-goal keyword-based `PersonalOptimization` prototype predates this contract. It is not an approved implementation of the customer optimizer and must not be shipped, expanded, or treated as product authority.
- Customer optimizer changes must be committed to GitHub under the Divergence.AI repository and identified as customer-optimizer work.
- The personal general-purpose extraction program remains a separately identified program and must not be copied into the customer optimizer.
- A change that affects both systems requires two separately described changes and proof that their product boundaries remain intact.

## 5. Change gate

Before customer optimizer code changes:

1. Name the affected customer checkbox and dataset group.
2. Confirm the change is permitted by the frozen optimizer specification.
3. Confirm no personal-extractor feature is being imported.
4. Add or update tests for the exact frozen behavior.
5. Record the change in GitHub with **Divergent User Interface Extraction/Optimizer** in its description.

If a proposed change alters the customer decisions, dataset mapping, purpose, source data, or result type, the specification must be versioned and explicitly approved before implementation.

## 6. Automatic stop condition

Work must stop before implementation when it is unclear which of the two systems a requested feature belongs to. No AI or developer may resolve that ambiguity by combining the systems.
