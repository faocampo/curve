# Curve Contract Pack

This directory is the normative machine-readable interface source for Curve. Implementations and generated clients record the exact Curve repository commit used.

| Contract | Location | Stability |
| --- | --- | --- |
| HTTP API | [`openapi/curve-v1.openapi.yaml`](openapi/curve-v1.openapi.yaml) | Versioned under `/api/v1`; breaking changes require a new API version. |
| Common identifiers and references | [`schemas/common.schema.json`](schemas/common.schema.json) | Stable v1 primitives. |
| Workspace-scoped mutable base | [`schemas/workspace-record.schema.json`](schemas/workspace-record.schema.json) | Required tenancy, version, attribution, and complete tombstone fields. |
| Immutable-history base | [`schemas/immutable-history-record.schema.json`](schemas/immutable-history-record.schema.json) | Append-only identity/sequence and policy-authorized body-erasure receipt. |
| Operation resource | [`schemas/operation.schema.json`](schemas/operation.schema.json) | Stable M0 resource. |
| Operation event payload | [`schemas/operation-event-v1.schema.json`](schemas/operation-event-v1.schema.json) | Stable M0 lifecycle-event payload. |
| Domain event envelope | [`schemas/event-envelope.schema.json`](schemas/event-envelope.schema.json) | Stable envelope; payload schemas are versioned separately. |
| Transactional outbox | [`schemas/outbox-event.schema.json`](schemas/outbox-event.schema.json) | Relay claim, retry, delivery, and visible dead-letter state. |
| Deduplicating inbox | [`schemas/inbox-message.schema.json`](schemas/inbox-message.schema.json) | Consumer/event uniqueness and terminal processing evidence. |
| Idempotency record | [`schemas/idempotency-record.schema.json`](schemas/idempotency-record.schema.json) | Workspace/principal/command request identity and replay result. |
| Immutable audit event | [`schemas/audit-event.schema.json`](schemas/audit-event.schema.json) | Attributed, minimized action/outcome/digest record. |
| M0-S2 relational contract | [`database/m0-s2-relational-contract.md`](database/m0-s2-relational-contract.md) | Normative tables, constraints, state checks, transactions, relay recovery, migrations, and database-level verification for the operation and delivery kernel. |
| Core policy manifest | [`policy/core-policy-v1.json`](policy/core-policy-v1.json) (immutable v1 action/owner-ACL/allow-reason ceiling and deny precedence) | Default-deny roles, classifications, environments, ACL/assignment requirements, trusted Operation transition, target policy, and safe projections. |
| Core policy manifest schema | [`schemas/core-policy-manifest.schema.json`](schemas/core-policy-manifest.schema.json) (machine validation for the immutable action registry) | V1 is immutable; added or changed permission requires a reviewed new policy version. |
| Policy evaluation input | [`schemas/policy-evaluation.schema.json`](schemas/policy-evaluation.schema.json) (safe subject, workspace, role, ACL, assignment, classification, trusted time, versioned target, and service context) | Protected bodies, tokens, credentials, and caller-supplied authority fields are excluded. |
| Immutable policy decision | [`schemas/policy-decision.schema.json`](schemas/policy-decision.schema.json) (effect, exact allow/ordered deny reasons, manifest/input digests, classification, and safe projection) | `ALLOW` carries only `POLICY_ALLOWED`; `DENY` and human-confirmation results expose no projection. |
| M0-03 policy relational contract | [`database/m0-03-policy-contract.md`](database/m0-03-policy-contract.md) (decision persistence, transactions, lookup order, migration, and rollback) | Material security contract; implementation requires exact-head approval. |
| Access Envelope | [`schemas/access-envelope.schema.json`](schemas/access-envelope.schema.json) | Immutable classification, source authorization, destination, retention, hold, and redaction policy. |
| Provider connection | [`schemas/provider-connection.schema.json`](schemas/provider-connection.schema.json) | Workspace-scoped configuration/secret references, capability binding, status, and validation. |
| Provider capabilities | [`schemas/provider-capability.schema.json`](schemas/provider-capability.schema.json) | Additive capability evolution only within v1. |
| SSE event | [`schemas/sse-event.schema.json`](schemas/sse-event.schema.json) | Stable resumable stream envelope. |
| Historical P0-06A attempt manifest | [`schemas/p0-06a-attempt-manifest.schema.json`](schemas/p0-06a-attempt-manifest.schema.json) | Superseded `curve.p0-06a-attempt/v1` authorization design retained for audit; it grants no current execution authority. |
| P0-06 terminal proof-stage projection | [`schemas/p0-06-stage-projection-v3.schema.json`](schemas/p0-06-stage-projection-v3.schema.json) | Strict terminal `SUPERSEDED` projection binding D-003 `LOCAL_ONLY`, the approved/merged decision revision, the historical v2 record, and replacement M0-S3 proof. |
| Orca MCP tool invocations | [`mcp/orca-tools-v1.schema.json`](mcp/orca-tools-v1.schema.json) | Exact v1.1 read/write allowlist and per-tool arguments; unspecified tools and fields are denied. |
| Orca MCP tool results | [`mcp/orca-tool-result-v1.schema.json`](mcp/orca-tool-result-v1.schema.json) | Typed v1.1 safe projections and mutation receipts; protected bodies and caller-supplied attribution are absent. |

JSON Schema uses draft 2020-12. OpenAPI is 3.1 so schemas share the same dialect. Every example uses synthetic identifiers and contains no X3M data.

Executable positive and negative fixtures live under [`mcp/examples/`](mcp/examples/) (Orca MCP invocation/result fixtures), [`schemas/examples/`](schemas/examples/) (schema-level contract fixtures), and [`schemas/semantic-fixtures/`](schemas/semantic-fixtures/) (state-dependent database contract fixtures). The semantic fixtures exercise non-null lifecycle fields, digest-only idempotency keys, database-backed response replay, policy input minimization, and deny projection behavior. The live [`P0-06 stage record`](../docs/technical/proofs/p0-06-stage-record.json) (terminal machine-readable supersession record) is validated directly against the v3 projection schema; the v2 schema remains historical. The contract gate must fail if a valid fixture is rejected or if an invalid lifecycle, missing evidence, protected inline field, raw idempotency key, secret, prohibited tool, forged actor, agent-granting/duplicate policy action, unapproved proof operation, or invalid supersession fixture is accepted.
