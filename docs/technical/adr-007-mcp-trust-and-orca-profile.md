# ADR-007: MCP Trust Registry and Developer-Operated Orca Profile

- Status: PROPOSED
- PRD decision: D-007
- Owner: Security and Platform Administration
- Reviewers: Identity, Agent Platform, Curve engineering
- Decision date: Pending named-owner approval
- Required by: MCP-enabled M0/M1/M4
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

## Security, privacy, licensing, and operational impact

The registry pins server identity, protocol/version, tool schemas, origin, scopes, classifications, network destination, owner, and enabled environments. Retrieved content is untrusted data and cannot grant capabilities. Rate limits, request limits, CSRF/origin protections where applicable, audit redaction, token revocation, and stale-version tests are mandatory.

## Data/API/event/migration compatibility impact

The normative tool schemas live under `contracts/mcp`. Tool names are stable within v1; incompatible input/output changes create a new tool/schema version. MCP writes call the same application services and policy kernel as REST commands.

## Failure, rollback, and exit strategy

The entire Orca write profile has a deny-by-default workspace feature toggle. Disabling it leaves Onyx and approved MCP reads intact. Ambiguous responses are reconciled by idempotency key and operation state; clients do not repeat a write blindly.

## Implementation consequences and affected work packages

D-007 supplies the generic registry contract for M0-09 and the Orca profile for M4-02. D-006 separately approves Orca ownership, supported client/version, and license classification.

## Validation and review date

Pending identity mechanism proof, threat fixtures, exact protocol/version pins, and named Security/Platform approval.
