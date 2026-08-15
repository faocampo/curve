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
| Access Envelope | [`schemas/access-envelope.schema.json`](schemas/access-envelope.schema.json) | Immutable classification, source authorization, destination, retention, hold, and redaction policy. |
| Provider connection | [`schemas/provider-connection.schema.json`](schemas/provider-connection.schema.json) | Workspace-scoped configuration/secret references, capability binding, status, and validation. |
| Provider capabilities | [`schemas/provider-capability.schema.json`](schemas/provider-capability.schema.json) | Additive capability evolution only within v1. |
| SSE event | [`schemas/sse-event.schema.json`](schemas/sse-event.schema.json) | Stable resumable stream envelope. |
| P0-06A attempt manifest | [`schemas/p0-06a-attempt-manifest.schema.json`](schemas/p0-06a-attempt-manifest.schema.json) | Exact `curve.p0-06a-attempt/v1` authorization inputs, broker-only credential boundary, and eight-operation execution/VCS allowlist; administrative GitHub Project statuses are excluded. |
| P0-06 proof-stage projection | [`schemas/p0-06-stage-projection-v2.schema.json`](schemas/p0-06-stage-projection-v2.schema.json) | Strict v2 state/readiness projection; the live stage record is a required valid fixture and P0-06B remains unavailable. |
| Orca MCP tool invocations | [`mcp/orca-tools-v1.schema.json`](mcp/orca-tools-v1.schema.json) | Exact v1.1 read/write allowlist and per-tool arguments; unspecified tools and fields are denied. |
| Orca MCP tool results | [`mcp/orca-tool-result-v1.schema.json`](mcp/orca-tool-result-v1.schema.json) | Typed v1.1 safe projections and mutation receipts; protected bodies and caller-supplied attribution are absent. |

JSON Schema uses draft 2020-12. OpenAPI is 3.1 so schemas share the same dialect. Every example uses synthetic identifiers and contains no X3M data.

Executable positive and negative fixtures live under [`mcp/examples/`](mcp/examples/) and [`schemas/examples/`](schemas/examples/). The live [`P0-06 stage record`](../docs/technical/proofs/p0-06-stage-record.json) is also validated directly against the v2 projection schema. The contract gate must fail if a valid fixture is rejected or if an invalid lifecycle, missing evidence, protected inline field, secret, prohibited tool, forged actor, unapproved proof operation, or unavailable-stage mutation fixture is accepted.
