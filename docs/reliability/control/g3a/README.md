# G3-A Trusted Controller Reference Package

**Status:** Candidate-side reference implementation; never an authoritative judge while stored on the candidate branch.

This package defines the untrusted input contracts consumed by the future external controller. Authoritative execution must use protected controller bytes outside the candidate change being judged.

Files:

- `state.schema.json` — current task graph and escalation state.
- `history-event.schema.json` — immutable transition/evidence event.
- `lease.schema.json` — exclusive bounded worker lease.
- `audit-attestation.schema.json` — authenticated exact-SHA audit result.
- `correction.schema.json` — retained-failure correction attempt.
- `status-check.schema.json` — exact-SHA aggregate controller verdict.
- `transition-table.json` — permitted automatic transitions.

