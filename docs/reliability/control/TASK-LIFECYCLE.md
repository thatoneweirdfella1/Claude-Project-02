# Governed Task Lifecycle

## Dependency types

- **Design prerequisite:** an accepted upstream design must exist before dependent design begins.
- **Co-design dependency:** two designs may iterate together, but their shared seams require a named reconciliation result before either can be accepted.
- **Runtime input:** information or service required when the implemented system operates; it does not control design order unless separately declared.
- **Validation dependency:** evidence, evaluator, environment, or prior verified result required before a claim may pass its gate.

## States and transitions

| State | Meaning | Permitted next transition |
|---|---|---|
| Open | Defined but not authorized/ready | Active only after scope, meaning, and prerequisites pass |
| Active | The sole authorized task is being worked | Interrupted, Self-check passed, Failed, or Open-blocked |
| Interrupted — resumable | Active work has a confirmed coherent remote checkpoint | Active on the same first unfinished phase |
| Interrupted — unsafe | Work is not coherently or remotely recoverable | Recovery only |
| Self-check passed | Author checks passed; no independent claim | Awaiting independent audit |
| Awaiting independent audit | Frozen author result requires a separate reviewer | Independently verified or Failed |
| Independently verified | Separate evidence supports the declared claim | Accepted only through the required acceptance transition |
| Accepted | Approved dependency on protected integration baseline | Downstream activation, subject to all other prerequisites |
| Failed | A named gate or audit failed | Correction/recovery of the same task |
| Potentially contaminated | Relied on later-invalidated or unaccepted upstream work | Revalidation or return to verified baseline |

`Open` may be nonblocking only when the assignment explicitly says the unresolved item cannot affect the active scope. No status transition may be declared solely in prose; G1-C must validate the state record, evidence identity, actor separation, dependencies, and remote lineage.

## Exact package sequence after G1

Independent G1 audit → independent F0 audit → four separately bounded packages (`S02`, `S03`, `S18`, and `S20`, each independently activatable after F0 acceptance) → F1 reconciliation after all four are accepted. A failed or incomplete prerequisite blocks only its dependents and names the correction/audit as the permitted next action.
