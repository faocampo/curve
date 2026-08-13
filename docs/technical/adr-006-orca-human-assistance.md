# ADR-006: Orca Human-Assistance Integration Boundary

- Status: PROPOSED
- PRD decision: D-006
- Owner: Agent Platform owner
- Reviewers: Security, Platform Administration, Curve engineering, licensing
- Decision date: Pending named-owner approval
- Required by: Orca-enabled M4 and R1 qualification
- Supersedes: Proposed Orca `AgentExecutionProvider` integration in PRD v0.5

## Context and constraints

Developers operate Orca manually. Curve does not have or require an authoritative Orca execution API. Curve must make approved tasks available to those developers and receive bounded progress without treating Orca as an autonomous provider or giving it Curve-managed repository credentials.

## Decision drivers and weighted criteria

1. Match the actual developer-operated usage model.
2. Preserve developer identity and accountability.
3. Avoid inventing or depending on an unsupported Orca API.
4. Keep VCS, quality, gate, waiver, and deployment authority in their existing trusted boundaries.
5. Permit later replacement or expansion without changing Curve core state.

## Options considered

1. **Proposed:** Orca as an MCP client using the D-007 human-assistance profile.
2. Orca as `AgentExecutionProvider`: rejected until an official supported API exists and the PRD is deliberately superseded.
3. Read-only export with no workflow return: rejected because Curve could not reconcile manual work reliably.
4. Remove Orca integration: safe fallback that leaves OpenHands automation intact.

## Proposed decision

Orca reads approved task/context projections and sends only the workflow updates defined by D-007. The signed-in developer delegates a short-lived identity; Curve derives and records the actor rather than accepting caller-provided attribution. The developer uses normal Git credentials outside Curve and links a branch/head or MR/PR. Curve's trusted VCS controller validates the external reference and may create the approved automatic draft when only a valid branch exists.

Orca never receives a Curve-managed VCS, sandbox, gate, waiver, provider-administration, deployment, production, or protected-object upload credential. `complete_manual_attempt` means only that the developer declares their manual work ready for VCS-reference validation; it is not a quality or readiness result.

## Evidence and proof results

The product boundary is approved in PRD v0.7. Remaining evidence is the supported Orca client/version, ownership and support process, license classification, MCP compatibility, delegated-auth proof, revocation behavior, and the D-007 conformance suite.

## Security, privacy, licensing, and operational impact

The integration is disabled by default per workspace. Tool output is bounded and redacted. Rate limits and heartbeat/lease expiry prevent indefinite claims. Unsupported or additional client tools are denied. Orca license and distribution terms must be recorded before it is advertised as an R1-supported integration.

## Data/API/event/migration compatibility impact

No Orca-specific state enters core aggregates. Manual attempts use normalized Curve entities and provider type `ORCA_HUMAN_ASSISTANCE`. MCP schema v1 is the wire contract.

## Failure, rollback, and exit strategy

Disable the Orca provider connection and revoke delegated tokens. Active manual claims expire or are explicitly released without affecting OpenHands. A future official execution API requires a new ADR and provider conformance rather than changing this history in place.

## Implementation consequences and affected work packages

M4-02 implements this profile and depends on D-006 plus D-007. M4-01/M4-03 OpenHands work is independent.

## Validation and review date

Pending supported-client evidence and named owner/security/licensing approval.
