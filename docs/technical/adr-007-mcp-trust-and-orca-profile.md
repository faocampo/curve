# ADR-007: MCP Trust Registry and Developer-Operated Orca Profile

- Status: PROPOSED
- PRD decision: D-007
- Owner: Security and Platform Administration
- Reviewers: Identity, Agent Platform, Curve engineering
- Decision date: Pending named-owner approval
- Last updated: 2026-08-30
- Required by: MCP/Orca-enabled M0-S9B/M1/M4
- Supersedes: Read-only-only MCP proposal in PRD v0.5

## Context and constraints

Onyx remains a permission-aware read source. Orca is operated manually by developers and must obtain approved Curve tasks without becoming an automated execution provider. The requested workflow write-back must preserve the effective developer identity and cannot create a second VCS, gate, waiver, planning, or deployment authority.

## Decision drivers and weighted criteria

1. Least privilege and human attribution.
2. Idempotent, version-checked state changes.
3. Prompt-injection resistance and explicit tool authorization.
4. Revocable short-lived access without reusable user PATs.
5. Compatibility with authenticated MCP Streamable HTTP.

## Options considered

1. **Proposed:** general read-only registry plus one named Orca workflow-write profile using developer delegation.
2. Shared Orca service account: rejected because it weakens attribution and separation of duties.
3. Artifact/code upload through MCP: rejected for R1 because it bypasses the sandbox/candidate boundary.
4. Read-only Orca: safe fallback if the write profile cannot be proven.

## Proposed decision

Reads: assigned slices, approved task packets, acceptance criteria, sanitized Context Manifests, open questions, and current workflow state.

Writes: `claim_slice`, `release_slice`, `heartbeat_attempt`, `report_progress`, `ask_question`, `complete_manual_attempt`, and `link_vcs_reference` only.

Every write requires a short-lived token delegated by the signed-in developer, `workspace_id`, target ID, expected aggregate version, idempotency key, allowed state transition, and immutable audit attribution. Authorization is re-evaluated before object retrieval and mutation. Token expiry or revocation denies the operation without fallback.

Prohibited operations include gate decisions, waivers, finding reclassification, plan or budget changes, executable artifact upload, repository mutation, MR/PR approval or merge, provider/flag administration, deployment, and production access.

### Protocol and transport profile

- Proposed protocol revision is the stable [MCP `2026-07-28` specification](https://modelcontextprotocol.io/specification/2026-07-28/basic) over authenticated Streamable HTTP. The binding is stateless: every request carries `MCP-Protocol-Version: 2026-07-28`, `Mcp-Method`, the applicable `Mcp-Name`, required `_meta` protocol/client/capability data, and `Authorization: Bearer <token>`. Curve derives no authorization, workspace, aggregate version, idempotency, lease, or workflow continuity from a connection or session.
- The endpoint is workspace-neutral. `workspace_id`, slice/attempt identifiers, `expected_version`, and `idempotency_key` are validated application inputs as applicable; none is inferred from host, connection state, or a caller-controlled routing header. The authenticated subject and client are derived only from the validated bearer token and authorization profile.
- The selected profile has no `initialize`/`initialized` dependency and no `Mcp-Session-Id`. Optional `server/discover` supplies capability discovery. Every stateful Curve aggregate is addressed by an opaque explicit identifier and reauthorized on every request.
- Request handling rejects missing or unsupported protocol metadata and any `Mcp-Method`/`Mcp-Name`/body disagreement at the protocol boundary. Capability proof must show that the named Orca client implements the exact request headers, discovery behavior, and v1.1 tool schemas. Curve does not silently downgrade or accept a wider schema; a separately tested prior-revision compatibility profile requires an ADR update.
- HTTPS is mandatory outside local synthetic testing. The server validates `Origin` and allowed client identity, returns `403` for an invalid origin, prevents DNS rebinding, limits request/body/concurrency rates, and never accepts credentials in URL query parameters.
- Tool schemas are application payloads inside the negotiated MCP/JSON-RPC envelope. Protocol errors are reserved for malformed MCP/JSON-RPC. Authenticated application validation, stale version, denied transition, and policy outcomes are typed tool execution errors with safe correlation IDs.
- Server-to-client sampling, roots, elicitation, arbitrary URL fetch, executable resource upload, and MCP task extensions are not advertised. The client cannot add a capability by prompt text or initialization metadata.

### Delegated authentication proposal

- Use X3M's authorization server with OAuth 2.1 Authorization Code plus PKCE and [OAuth Protected Resource Metadata](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization). Device flow, client registration, and token exchange remain disabled unless Security explicitly adds and proves them.
- The protected-resource audience is the exact Curve MCP service. Proposed scopes are `curve:mcp:read` and `curve:mcp:orca-workflow-write`; the write scope never implies a read or administrative scope outside the effective developer's object permissions.
- Access tokens are short-lived, proposed maximum ten minutes, and held in client memory only. Curve validates issuer, audience/resource, subject, authorized client, scope, expiry/not-before, token identifier or equivalent revocation handle, and current user/workspace status on every call.
- Online revocation/introspection or a signed-token denylist must make explicit revocation effective before the next write. If X3M identity cannot provide this property, the write profile fails its proof. Expiry or identity-service uncertainty never falls back to a service account or cached creator identity.
- The server derives immutable `actor_id`, effective principal, issuer, client, and delegation reference from validated identity. No tool argument or context content can supply or override attribution.

The identity mechanism, ten-minute ceiling, client registration, issuer/audience, and revocation method are proposals pending the named D-007 proof; they are not production defaults.

### Tool-schema and state contract

The normative application payloads are `orca-tools-v1.schema.json` and `orca-tool-result-v1.schema.json`, both schema version `1.1`. A versioned MCP catalog binds thirteen deterministic first-class `tools/list` definitions and their closed input/output schemas to those internal envelopes. `tools/call.params.name`, `Mcp-Name`, and the selected schema must agree. Reads return only the projection authorized for that request's effective developer, workspace, and object. Writes additionally require `idempotency_key`, `expected_version`, and `client_event_time`; the server uses its own receipt time for authorization, lease, and ordering decisions.

The idempotency scope is `(workspace_id, effective_subject, tool, idempotency_key)`. A byte-equivalent canonical command returns its original mutation receipt; a different command under the same key is rejected. `expected_version` is the target slice/manual-attempt aggregate version. Stale versions and duplicate client progress sequence numbers have no side effect. Idempotency retention follows D-009 and cannot expire while the related attempt or audit obligation remains live.

`complete_manual_attempt` records only `COMPLETION_DECLARED`. It may occur before or after a VCS reference is linked, but the attempt cannot become `CANDIDATE_AVAILABLE` until the trusted controller validates an approved repository binding and exact head SHA. A branch validation may enqueue automatic draft creation under a separately approved plan; this tool does not push or create the draft itself.

### Trust-registry record

Each enabled trust profile pins workspace, owner, environment, endpoint/origin, server certificate/identity, MCP revision, client allowlist, tool-catalog and result-schema digests, read/write scopes, risk per tool, allowed classifications, rate/body/concurrency limits, token issuer/audience/revocation profile, creation/expiry/review dates, and kill switch. This record configures request validation and grants no session continuity. Missing, expired, stale, or digest-mismatched fields deny every request.

## Security, privacy, licensing, and operational impact

The registry pins server identity, protocol/version, tool schemas, origin, scopes, classifications, network destination, owner, and enabled environments. Retrieved content is untrusted data and cannot grant capabilities. Rate limits, request limits, CSRF/origin protections where applicable, audit redaction, token revocation, and stale-version tests are mandatory.

## Data/API/event/migration compatibility impact

The normative tool schemas live under `contracts/mcp`. Tool names are stable within v1; incompatible input/output changes create a new tool/schema version. MCP writes call the same application services and policy kernel as REST commands. The v1.1 contract replaces the initial wildcard-argument v1.0 draft before implementation; no deployed client or stored payload requires migration.

## Failure, rollback, and exit strategy

The entire Orca write profile has a deny-by-default workspace feature toggle. Disabling it leaves Onyx and approved MCP reads intact. Ambiguous responses are reconciled by idempotency key and operation state; clients do not repeat a write blindly.

## Implementation consequences and affected work packages

M0-S9A (provider-neutral registry and reconciliation foundation) owns the
workspace-scoped connection/capability persistence, typed adapter port, common
error taxonomy, and local fake-provider conformance without MCP transport,
identity, credentials, network access, or external effects. It does not depend
on D-007.

D-007 supplies the MCP-specific trust record, transport/authentication profile,
and Orca tool policy consumed by the applicable M0-S9B (external provider
transport and administration) slice and M4-02 (developer-operated Orca MCP
workflow). D-006 separately approves Orca ownership, supported client/version,
and license classification.

## Validation and review date

The stateless transport, tool schema, transition, and proposed identity profile are ready for proof review. This ADR remains `PROPOSED` pending:

- named Security and Platform approval of the MCP revision, OAuth issuer/audience/scopes, client registration, token lifetime, and revocation method;
- D-006 evidence that the named supported Orca client/version can send the exact stateless headers, use `server/discover` when needed, and expose no extra tools;
- conformance fixtures for every allowed read/write, required header, header/body mismatch, absence of session continuity, discovery result, unknown tool/field, forged actor, wrong audience/client/workspace, expired/revoked token, origin failure, injection attempt, idempotent replay/conflict, stale version, invalid transition, sequence replay, and VCS-reference rejection;
- rate/body/concurrency limit values plus audit/redaction evidence; and
- decision/review dates and named connection/support owners.
