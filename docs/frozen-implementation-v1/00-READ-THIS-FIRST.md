# Divergence.AI — Approval Packet v1

Status: **PROPOSED — NOT YET APPROVED OR IMPLEMENTED**  
Research snapshot: **2026-08-14**  
Implementation branch: **not created yet**

## The short version

The visual layout does **not** need to be redesigned. The exact light-gold marble layout, coordinates, spacing, fixed-height conversation workspace, compact accordion bars, and no-document-scroll rule remain frozen.

The system specification **does** need a provider-neutral amendment. The current specification and repository still assume Claude in places where Divergence.AI must instead translate a person's intent for whichever AI they want to use.

The proposed default route is:

> **Any AI — Universal · No Divergence credits**

Divergence.AI creates an AI-ready request locally, then lets the person copy it or open the chosen provider. No paid translator call is required. A provider API, a local model, or a managed paid route is optional—not the hidden default.

## What stays frozen

- The visual authority remains `LIGHT GOLD LAYOUT - MAIN LAYOUT DIVERGENCE FROZEN(2).png`.
- The interaction authority remains `GOLD Light Version(1).jpg`, as corrected by the approved GREEN decisions.
- The logical canvas, three-column shell, component coordinates, sizes, spacing, material system, typography, and responsive scale behavior remain unchanged.
- The conversation and composer remain the primary work area.
- The page itself does not scroll. Conversation content and bounded popups may scroll internally.
- Compact secondary sections remain 26-pixel collapsed bars, with only one competing overlay/accordion open at a time.
- State Detection, Directness, Technique, Add Context, Translate & Ask, Transparency Details, Multi-AI Actions, and Quick Actions retain their approved roles.

## What changes

1. `Model` becomes **Destination AI**, while retaining the exact same rectangle.
2. The default becomes **Any AI — Universal**, not a Claude model.
3. Provider and model lists come from a dated, refreshable registry. They are not hard-coded forever.
4. **Translator Engine** becomes an advanced implementation setting separate from the destination AI.
5. Existing-account use is supported through safe handoff: create → copy → open official provider → user sends. Automation is added only where an official API or reviewed permission allows it.
6. Billing becomes **free-first and fail-closed**. No paid route is selected silently.
7. `Developer Mode` is not required for billing, credits, provider selection, or ordinary controls.
8. Large jobs use checkpointed, evidence-preserving orchestration rather than one enormous prompt.
9. Prompt translation uses one neutral Meaning Packet and provider-specific adapters, with tests and version history.
10. Security, privacy, terms compliance, accessibility, cost limits, and prompt quality become release gates.

## Cost rule now locked into this proposal

The interface must distinguish these four things; it must never call all four simply “free.”

| Badge | Exact meaning | Default eligible? |
|---|---|---:|
| `No Divergence credits` | Local formatting or manual account handoff costs no Divergence credits. A user's external plan may still have its own limits. | Yes |
| `Provider free tier` | The provider currently offers eligible API use at no charge, subject to its limits and data terms. | Yes, after connection and disclosure |
| `Billed by provider` | The user supplied their own API key; the provider bills them directly. | Only after explicit opt-in |
| `Uses Divergence credits` | Divergence.AI's managed API route will deduct a shown maximum amount. | Only after explicit opt-in |

Every new task starts on the best available no-new-charge route. Paid fallback and automatic top-up start **off**. Before a paid action, the app shows the route, estimate, maximum charge, available balance, and free alternative. If the free route is unavailable, the app stops and asks; it does not spend money automatically.

## The approval decision

There is only one approval gate for this packet:

> **Approve Packet v1 as the implementation authority, or request named edits.**

Approval does not merge anything into `main`. After approval only, the implementation procedure is:

1. Verify a clean starting point and the exact base commit with the user.
2. Create `frozen-implementation-v1`.
3. Copy the approved packet into that branch.
4. Implement in staged, testable slices on that branch only.
5. Run the visual, behavioral, cost, security, and provider-adapter gates.
6. Present the branch for review; do not merge it.

## Reading paths

If you want the least overwhelming path, read only:

1. This file.
2. `01-FROZEN-SPEC-v1.1-PROVIDER-NEUTRAL-AMENDMENT.md`, sections 1–5.
3. `05-COST-CREDITS-FREE-FIRST-SPEC.md`, sections 1–4.

Everything else is implementation-grade detail for development and auditing:

| File | Purpose |
|---|---|
| `01-FROZEN-SPEC-v1.1-PROVIDER-NEUTRAL-AMENDMENT.md` | Exact normative changes without moving frozen components |
| `02-PROVIDER-MODEL-CAPABILITY-REGISTRY.md` | Current providers/models plus the refreshable registry design |
| `03-UNIVERSAL-PROMPT-COMPILER-SPEC.md` | Meaning Packet, prompt adapters, Directness, Technique, and State Detection behavior |
| `04-CONNECTOR-ACCOUNT-BRIDGE-SPEC.md` | Safe API, existing-account handoff, browser companion, and local connections |
| `05-COST-CREDITS-FREE-FIRST-SPEC.md` | Free-first routing, estimates, caps, credit ledger, checkout, and failure behavior |
| `06-MODEL-ROUTING-LONG-JOB-ORCHESTRATION.md` | Cheap-model delegation, 900-conversation jobs, checkpoints, audit, and escalation |
| `07-COMPREHENSIVE-UPGRADE-RESEARCH-MAP.md` | Full product capability map and staged priorities |
| `08-EVALUATION-ACCEPTANCE-TEST-SYSTEM.md` | Objective prompt, UX, visual, provider, cost, and security release gates |
| `09-PRIVACY-SECURITY-TERMS-THREAT-MODEL.md` | Threats, data boundaries, permissions, provider terms, and kill switches |
| `10-IMPLEMENTATION-READINESS-CHECKLIST.md` | Repository findings and exact implementation order after approval |
| `SOURCES.md` | Official sources and access date |

## Explicitly not done yet

- No source code was modified.
- No Git branch was created.
- No commit was made.
- No payment was initiated.
- No provider account was accessed.
- No reference image was replaced.

