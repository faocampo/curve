# D-006 (Orca Ownership) and D-007 (MCP Trust) Decision Readiness

> Sanitized public reference. Fictional identities cannot authorize execution.
> Historical approvals apply only to their original bytes; see
> [public contract edition](public-reference-sanitization.md) (sanitization, integrity and approval boundaries).

## Document control

| Field | Value |
| --- | --- |
| Status | `ANALYZED / MATERIAL OWNER INPUTS REQUIRED / NOT IMPLEMENTATION AUTHORITY` |
| Version | 1.0 |
| Prepared | 2026-08-27 |
| Product | Curve |
| Scope | D-006 (Orca ownership, compatibility, and support decision) and D-007 (MCP trust, delegated authorization, and write-back decision) |
| Intended owners | Agent Platform; Security; Platform Administration; Identity; Licensing; Curve Engineering |
| Prepared by | Codex under Designated reviewer's review |
| Governing baseline | Exact Curve revision named by the eventual decision PR |
| Activation boundary | No MCP implementation, identity configuration, network access, provider activation, repository mutation, or environment activation is authorized by this packet |

This document prepares D-006 (Orca human-assistance integration boundary) and
D-007 (MCP trust registry and developer-operated Orca profile) for named-owner
review. It grants no MCP implementation, identity configuration, network
access, provider activation, repository mutation, or environment activation.

## Fixed product boundary

Orca is a developer-operated MCP client. OpenHands remains Curve's automated
execution provider. Orca may read approved work projections and submit only
these developer-attributed workflow updates:

- `claim_slice`
- `release_slice`
- `heartbeat_attempt`
- `report_progress`
- `ask_question`
- `complete_manual_attempt`
- `link_vcs_reference`

The read tools are:

- `list_assigned_slices`
- `get_task_packet`
- `get_acceptance_criteria`
- `get_context_manifest`
- `list_questions`
- `get_workflow_state`

Gate approval, waiver, plan/budget change, executable artifact upload, VCS
mutation, PR/MR approval or merge, provider/flag administration, deployment,
and production access remain outside the Orca profile.

## Evidence inspected

### Local Orca client candidate

- Installed application version: `1.4.188`
- Bundle identifier: `com.stablyai.orca`
- CLI path: `/usr/local/bin/orca`
- CLI status during inspection: application/runtime stopped
- Packaged-resource marker scan: no inspectable `2026-07-28`, `Mcp-Method`, or
  `server/discover` marker

This identifies a candidate client version. It provides no protocol-conformance
claim.

### Official protocol baseline

- [MCP 2026-07-28 base protocol](https://modelcontextprotocol.io/specification/2026-07-28/basic)
  (stateless request metadata, JSON-RPC, versioning, errors, and message
  patterns)
- [MCP 2026-07-28 authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)
  (OAuth 2.1, Protected Resource Metadata, client registration, resource
  indicators, issuer validation, scopes, and token handling)
- [MCP 2026-07-28 tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
  (`tools/list`, `tools/call`, per-tool schemas, result types, structured
  content, caching, headers, and tool errors)
- [MCP 2026-07-28 release notes](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
  (stateless core, required routing headers, authorization changes, and SDK
  availability)

## Required ADR correction

ADR-007 currently contains session-era language about initialization and
capability negotiation. The `2026-07-28` binding must state:

1. Every request carries `MCP-Protocol-Version: 2026-07-28`, `Mcp-Method`, the
   applicable `Mcp-Name`, and required `_meta` protocol/client/capability data.
2. Curve derives no authorization or workflow continuity from a connection or
   session. Each request carries explicit workspace, slice, attempt, version,
   idempotency, and identity-bound inputs as applicable.
3. `server/discover` is the optional capability-discovery operation. There is
   no `initialize`/`initialized` dependency or `Mcp-Session-Id`.
4. Unsupported/missing protocol metadata and header/body disagreement fail at
   the protocol boundary.
5. Stateful Curve aggregates are addressed by opaque explicit identifiers and
   reauthorized on every call.

## Required MCP-to-Curve schema binding

The existing `orca-tools-v1.schema.json` (Curve internal discriminated command
envelope) and `orca-tool-result-v1.schema.json` (Curve internal typed result
envelope) remain useful internal contracts. Before implementation, publish a
versioned MCP catalog binding that proves:

1. The server exposes thirteen first-class tool definitions in deterministic
   order, each with its own closed `inputSchema` and `outputSchema`.
2. `tools/list` returns only tools permitted by the request's validated scopes
   and effective developer permissions.
3. The selected `ttlMs` and `cacheScope` cannot share a user/workspace-specific
   tool list across principals.
4. `tools/call.params.name` selects the tool; its `arguments` validate against
   that tool's schema. The internal adapter constructs the Curve command
   envelope from the validated outer name, arguments, workspace, identity,
   expected version, and idempotency inputs.
5. Write tools require `idempotency_key`, `expected_version`, and
   `client_event_time`; Curve trusted time controls authorization, leases, and
   event ordering.
6. Successful responses use `resultType: "complete"`, safe text content when
   required for compatibility, and `structuredContent` validated against the
   tool's output schema.
7. Application validation, stale version, denied transition, and business
   policy outcomes use safe tool execution errors with `isError: true`.
   Unknown tool and malformed MCP requests use protocol errors.
8. Application-level questions remain durable Curve records. The profile does
   not advertise elicitation/MRTR, sampling, roots, Tasks, arbitrary resources,
   executable uploads, or server-to-client tool execution.
9. Tool-list, call, result, and error fixtures include exact MCP request headers
   and `_meta`, not only the nested Curve application envelope.

## Required authorization decisions

Named Security and Platform Administration owners must provide:

| Decision | Required exact value/evidence |
| --- | --- |
| Authorization server | Issuer, discovery URL, ownership, support contact, and environment mapping |
| Protected resource | Canonical Curve MCP URI and RFC 9728 metadata URL |
| Client registration | Orca Client ID Metadata Document or exact preregistered client ID; Dynamic Client Registration remains disabled unless separately approved |
| Redirect profile | Exact loopback/custom URI redirects, platform behavior, and PKCE proof |
| Client identity | Allowed Orca bundle/client identity and supported version range |
| Scopes | Exact read/write scopes and per-tool scope map |
| Resource indicator | Exact authorization/token request `resource` value and audience validation |
| Token lifetime | Access-token maximum and clock-skew policy |
| Refresh behavior | Disabled, memory-only, or approved secure-storage profile with rotation and revocation proof |
| Revocation | Introspection or signed-token denylist behavior and maximum enforcement latency |
| Issuer validation | RFC 9207 response issuer behavior and mismatch rejection evidence |
| Origins/clients | Exact allowed origin/client list and invalid-origin response behavior |
| Limits | Per-user/workspace request rate, body size, concurrency, pagination, summary/question size, and lease/heartbeat limits |
| Audit/redaction | Allowed fields, correlation, token/identity redaction, and retention dependency on D-009 (retention, backup, legal-hold, and erasure decision) |
| Kill switch | Workspace and platform disablement owners, propagation time, and recovery procedure |

## Required D-006 (Orca ownership, compatibility, and support decision) inputs

The Agent Platform, Security, licensing, and Curve Engineering owners must
record:

- Supported Orca application and CLI version range, beginning with evaluation
  of installed candidate `1.4.188`.
- Distribution source, update policy, compatibility test owner, and support
  escalation path.
- Orca license classification and any redistribution or support obligations.
- Evidence that the selected version exposes only the approved tools and
  supports MCP `2026-07-28` request metadata, headers, discovery, tool schemas,
  structured results, and OAuth profile.
- Fail-closed behavior when Orca adds, removes, renames, or changes a tool or
  supported protocol feature.
- Review cadence and compatibility policy for future Orca/MCP versions.

## Conformance suite required before `DECIDED`

### Protocol and catalog

- Exact protocol version accepted; missing/unsupported version rejected.
- Required `Mcp-Method`/`Mcp-Name` headers accepted; disagreement rejected.
- Required `_meta` client/version/capability fields accepted; forged or missing
  fields rejected.
- Deterministic authorized `tools/list`; user/workspace cache isolation.
- Every one of 13 tools has the exact closed input/output schema.
- Unknown tool, unknown field, schema-depth/size abuse, and external `$ref`
  behavior fail safely.

### Identity and authorization

- Protected Resource Metadata and authorization-server discovery.
- PKCE, state, issuer, client, redirect, resource indicator, audience, scope,
  expiry/not-before, and revocation validation.
- Wrong issuer/audience/client/workspace, expired/revoked token, inactive user,
  missing scope, and invalid origin fail before object disclosure.
- Read and write scopes remain distinct and cannot create administrative
  authority.
- Caller-supplied actor/effective-principal fields are rejected.

### Application behavior

- Every allowed read returns only its authorized projection.
- Every write validates state, expected aggregate version, idempotency, current
  developer authorization, and workspace/object membership.
- Byte-equivalent replay returns the original receipt; changed digest conflicts.
- Stale version, repeated progress sequence, invalid transition, expired lease,
  and ambiguous response produce one safe, attributable outcome.
- `complete_manual_attempt` produces `COMPLETION_DECLARED` only.
- `link_vcs_reference` reaches `CANDIDATE_AVAILABLE` only after trusted-controller
  validation of binding and head SHA.
- Gate, waiver, plan, budget, artifact upload, VCS mutation, approval, merge,
  deployment, provider administration, and production tools remain unavailable.

### Operations and recovery

- Rate, body, concurrency, pagination, and heartbeat/lease limits.
- Token/profile/workspace kill switch and revocation propagation.
- Restart and duplicate-request reconciliation.
- Redacted logs, metrics, traces, and immutable developer attribution.
- D-009 (retention, backup, legal-hold, and erasure decision)-aligned
  idempotency/audit retention and expired-record behavior.

## Dependency order

1. Name D-006 (Orca ownership, compatibility, and support decision) Agent
   Platform, Security, licensing, and support owners.
2. Confirm the supported Orca version and protocol-capability evidence.
3. Name D-007 (MCP trust, delegated authorization, and write-back decision)
   Security, Platform Administration, and Identity owners.
4. Decide the authorization, registration, limit, and operational values.
5. Publish the MCP catalog/transport binding and complete fixtures.
6. Run the conformance suite against the exact Orca client and Curve server
   implementation candidate.
7. Approve D-006 (Orca ownership, compatibility, and support decision) and
   D-007 (MCP trust, delegated authorization, and write-back decision) at exact
   reviewed revisions.
8. Dispatch M4-02 (developer-operated Orca MCP workflow) separately.

## Current blockers

- Orca `1.4.188` protocol conformance evidence
- Named Agent Platform, Security, Platform Administration, Identity, licensing,
  and support owners
- Exact Example Organization authorization-server and client-registration values
- Exact rate/body/concurrency/token/revocation values
- MCP transport/catalog binding contracts and full fixtures
- D-009 (retention, backup, legal-hold, and erasure decision) for idempotency
  and audit obligations
- Decision dates and next-review dates
