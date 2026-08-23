# D-002 Onyx Delegated-Identity Decision Packet

## Document control

| Field | Value |
| --- | --- |
| Decision | D-002 (Onyx delegated-identity decision) |
| Status | `PROPOSED`; evidence-ready decision packet; no Onyx activation authority |
| Version | 1.1 |
| Date | 2026-08-22 |
| Product | Curve |
| Required owner | Named X3M Security and Identity owner; a role label alone cannot decide the record |
| Product approver | Federico Ocampo, CTO at X3M |
| Required before | M1-03B (live Onyx initiating-user adapter), protected M1 retrieval, and Gate 1 evidence-access proof |
| Repository | `git@github.com:faocampo/curve.git` for the decision and contracts; `git@github.com:faocampo/plane.git` for implementation after approval |

## Decision to make

Select the supported X3M mechanism by which a Curve operation calls Onyx as the
human who initiated that operation. The mechanism must preserve Onyx source
permissions, expire quickly, support revocation and durable-workflow
reauthorization, and avoid storing a reusable user credential in Curve.

This packet implements the fixed identity rules from the
[Curve PRD v0.12](../curve-ai-native-sdlc-prd.md)
(product requirements, effective-principal boundary, evidence rules, and Gate 1
acceptance criteria) and the [Security and operations specification](security-and-operations.md)
(delegation, credential handling, prompt-injection, and evidence-access controls).

## Verified upstream boundary

The decision owner must verify the exact deployed X3M Onyx version and its
`/api/docs` OpenAPI before approval. Public upstream documentation currently
establishes these capabilities:

| Upstream evidence | What it proves | What D-002 (Onyx delegated-identity decision) still must prove |
| --- | --- | --- |
| [Onyx API overview and authentication](https://docs.onyx.app/developers/overview) (REST API, API keys, user PATs, and built-in OpenAPI explorer) | API keys represent distinct Onyx users; PATs act as their owning user and inherit that user's role and permissions; tokens can be revoked | A supported short-lived external token-exchange, on-behalf-of, session-forwarding, or equivalent X3M mechanism |
| [Onyx OIDC deployment authentication](https://docs.onyx.app/deployment/authentication/oidc) (OIDC login, scopes, refresh tokens, and PKCE configuration) | The self-hosted application can authenticate users with OIDC and can request pass-through scopes for tool calls | Whether the resulting X3M user session/token can be safely exchanged or presented to the Onyx API by Curve |
| [Onyx Google OAuth deployment authentication](https://docs.onyx.app/deployment/authentication/oauth) (OAuth login and pass-through scope configuration) | OAuth is supported for Onyx application login | A server-to-server per-operation delegation contract for Curve |
| [Onyx document search API](https://docs.onyx.app/developers/api_reference/search/document_search) (authenticated document-search surface) | A read-only search capability exists | Exact request/response schema, version, permission behavior, pagination, limits, and source metadata in the deployed instance |

Public upstream documentation does not establish a general short-lived OAuth
token-exchange endpoint for third-party API callers. D-002 (Onyx
delegated-identity decision) therefore remains `PROPOSED` until the X3M
deployment proves one exact supported mechanism.

The normative [D-002 machine decision record](../../contracts/governance/d002-onyx-delegation-v1.json)
(deployed boundary, principal binding, credential lifecycle, API profile,
proofs, owners, approvals, and activation state) and its
[JSON Schema](../../contracts/schemas/onyx-delegation-decision.schema.json)
(closed v1 decision vocabulary) make that boundary executable. The validator
recomputes unresolved requirements from record content. Editing the displayed
gap list cannot make the decision dispatchable.

### Current proposal state

The versioned proposal intentionally records the deployed Onyx version, image,
OpenAPI, configuration, supported delegation mechanism, identity bindings,
endpoints, timeouts, owners, proof results, and approvals as unresolved. Its
adapter and live-retrieval activation flags are `false`. D-009 (retention and
erasure decision) separately controls protected-body persistence, and D-005
(model/provider data-policy decision) separately controls any model destination;
D-002 cannot grant either authority.

## Non-negotiable product and security invariants

1. Every protected Onyx read binds the authenticated Curve actor, effective
   principal, workspace, operation, connection, capability, and purpose.
2. Source authorization is evaluated as the initiating human. A service-wide
   result set cannot substitute for that user's source permissions.
3. Curve stores only an opaque delegation handle or approved encrypted transient
   material. It stores no reusable human PAT, refresh token, or session cookie.
4. Delegation material never enters PostgreSQL business payloads, Temporal
   history, outbox payloads, logs, telemetry, model prompts, evidence bodies,
   object keys, browser responses, or coding-agent context.
5. Every protected reuse rechecks source access according to the approved
   freshness policy. Gate 1 always performs a fresh material-evidence access
   check for the assigned product approver.
6. Expiry, logout, identity-provider revocation, Onyx revocation, workspace
   removal, connection revocation, and cancellation invalidate the local handle.
7. Prompt-injected source content is data. It cannot expand API, model, MCP,
   VCS, network, filesystem, gate, or workflow authority.
8. All callbacks, retries, and reconciliation are idempotent and attributed.

## Candidate mechanisms

| Option | Required proof | Decision posture |
| --- | --- | --- |
| A. X3M identity token exchange or on-behalf-of token | X3M IdP/Onyx audience support; subject preservation; scopes; maximum lifetime; no actor substitution; revocation; deployed Onyx acceptance | Preferred shape when the deployed systems support it because the credential can be short-lived, audience-bound, and independently revoked |
| B. Trusted internal delegation proxy | Authenticated Curve-to-proxy workload identity; signed user/workspace/operation claims; proxy-to-Onyx user mapping; replay defense; bounded cache; revocation; audit; no broad search result | Acceptable only when the proxy enforces Onyx-equivalent user permissions and Security owns the boundary |
| C. Onyx session forwarding | Exact session format; CSRF and origin behavior; backend forwarding support; expiry/refresh; revocation; cookie isolation; no browser-session persistence in Curve | Acceptable only when Onyx explicitly supports this backend use and the proof shows no session replay or cross-user confusion |
| D. Ephemeral user token provisioned for one operation | Supported creation/revocation API; maximum lifetime; one-operation scope; no recoverable storage; cleanup and ambiguity reconciliation | Contingency; a reusable or manually issued PAT does not satisfy the product requirement |
| E. Service API key or admin identity | None | Rejected for protected user retrieval because it does not preserve the initiating user's source authorization |

The decision must select exactly one primary mechanism and may select one
equivalent failover only when both preserve the same actor, source ACL, data
classification, expiry, revocation, and audit semantics. Silent fallback is
prohibited.

## Required decision record

| Field | Required value |
| --- | --- |
| X3M Onyx deployment | Exact version/image digest, base URL class, and sanitized configuration digest |
| OpenAPI | Exported deployed `/api/docs` document digest and the exact read-only search/access endpoints used |
| Identity issuer and audience | Exact values or protected configuration references |
| Subject mapping | Stable mapping from Curve actor identity to Onyx user identity, including mismatch behavior |
| Grant mechanism | Exact exchange, proxy, session, or ephemeral-token protocol and version |
| Scopes/capabilities | Minimum read-only search and access-check capability; every administrative/write capability absent |
| Lifetime | Maximum token/handle lifetime and refresh rule; refresh requires current human authorization |
| Revocation | Identity, Onyx, workspace, connection, cancellation, and logout behavior plus maximum propagation delay |
| Durable wait | Reauthorization behavior after Temporal wait/retry/replay; no token bytes in workflow history |
| Secret handling | X3M Secrets Manager/broker references, encryption boundary, process memory lifetime, and redaction |
| Network | Approved internal endpoint, TLS trust, timeout, retry, rate limit, and circuit-breaker behavior |
| Source permissions | Exact Onyx permission mode and two-user positive/negative proof |
| Audit | Safe request/result metadata, effective principal, source references, policy/delegation digest, and denial codes |
| Support | Named Security/Identity and Onyx operational owners, escalation, rotation, version-review, and rollback |
| License/support boundary | Community/Enterprise features consumed by the selected permission mechanism and entitlement owner |

## Bounded proof plan

The proof uses a disposable local or approved non-production X3M workspace and
two synthetic users with intentionally different access.

1. Export and digest the deployed Onyx OpenAPI and record the exact version.
2. Create two synthetic documents: one shared and one visible to only User A.
3. Run the selected grant flow separately for User A and User B.
4. Prove both users find the shared document and only User A finds the restricted
   synthetic document.
5. Prove a swapped subject, workspace, audience, operation, expired grant,
   revoked grant, replayed request, missing policy, and disabled connection fail
   before any result is returned.
6. Pause across a Temporal timer, expire or revoke the original grant, and prove
   resume requires a fresh human-bound grant.
7. Scan PostgreSQL payloads, outbox/inbox, Temporal history, logs, traces, error
   responses, and test artifacts for grant bytes and synthetic source bodies.
8. Exercise timeout, rate limit, Onyx outage, ambiguous response, cancellation,
   and recovery without duplicate Evidence Items.
9. Remove synthetic documents, identities, grants, and proof configuration; store
   a sanitized cleanup receipt.

## Acceptance criteria

- User A and User B receive exactly their authorized synthetic source sets.
- A broad service/admin identity is never used for a protected query.
- Every grant is audience-, user-, workspace-, operation-, and capability-bound.
- Expiry/revocation reaches Curve within the approved maximum delay.
- Durable-workflow resume performs a fresh authorization and never reuses token
  bytes from history or persistence.
- Gate 1 cannot approve when the product approver cannot currently read material
  evidence or an approved redacted replacement.
- All negative identity and prompt-injection fixtures fail closed.
- Credential/source-body scans return zero findings.
- Named owners approve the exact evidence and residual risk.

The machine record becomes dispatchable only when all of these criteria are
represented by the exact closed proof-case set, every case is `PASS` with an
evidence digest, the supported read-only endpoint profile is pinned, the gap
list is empty, and Security/Identity, Onyx Operations, and Curve Product each
approve the same computed decision-payload digest.

## Stop conditions

The proof and implementation stop when the deployed version/OpenAPI, named
owner, entitlement, exact grant mechanism, two-user ACL fixture, revocation
behavior, or cleanup authority is absent. A coding agent cannot change D-002 (Onyx
delegated-identity decision) from `PROPOSED` to `DECIDED`.

## Decision outcome template

```text
Decision: D-002 (Onyx delegated-identity decision)
Status: DECIDED | REJECTED | MORE_EVIDENCE_REQUIRED
Selected mechanism:
Exact Onyx version/image:
OpenAPI digest:
Identity issuer/audience/subject mapping:
Maximum lifetime and revocation delay:
Allowed read capabilities:
Disallowed capabilities:
Evidence bundle digest:
Security and Identity owner:
Product approver:
Decision timestamp:
Review/expiry trigger:
Residual risks:
```
