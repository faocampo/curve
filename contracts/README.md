# Curve Contract Pack

This directory is the normative machine-readable interface source for Curve. Implementations and generated clients record the exact Curve repository commit used.

| Contract | Location | Stability |
| --- | --- | --- |
| HTTP API | [`openapi/curve-v1.openapi.yaml`](openapi/curve-v1.openapi.yaml) | Versioned under `/api/v1`; breaking changes require a new API version. |
| Common identifiers and references | [`schemas/common.schema.json`](schemas/common.schema.json) | Stable v1 primitives. |
| Operation resource | [`schemas/operation.schema.json`](schemas/operation.schema.json) | Stable M0 resource. |
| Domain event envelope | [`schemas/event-envelope.schema.json`](schemas/event-envelope.schema.json) | Stable envelope; payload schemas are versioned separately. |
| Provider capabilities | [`schemas/provider-capability.schema.json`](schemas/provider-capability.schema.json) | Additive capability evolution only within v1. |
| SSE event | [`schemas/sse-event.schema.json`](schemas/sse-event.schema.json) | Stable resumable stream envelope. |
| Orca MCP tool invocations | [`mcp/orca-tools-v1.schema.json`](mcp/orca-tools-v1.schema.json) | Exact v1.1 read/write allowlist and per-tool arguments; unspecified tools and fields are denied. |
| Orca MCP tool results | [`mcp/orca-tool-result-v1.schema.json`](mcp/orca-tool-result-v1.schema.json) | Typed v1.1 safe projections and mutation receipts; protected bodies and caller-supplied attribution are absent. |

JSON Schema uses draft 2020-12. OpenAPI is 3.1 so schemas share the same dialect. Every example uses synthetic identifiers and contains no X3M data.

Executable positive and negative MCP fixtures live under [`mcp/examples/`](mcp/examples/). The contract gate must fail if a valid fixture is rejected or if a prohibited tool/field fixture is accepted.
