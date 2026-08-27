# D-002 (Onyx Delegation), D-004 (Model Gateway), and D-005 (Model Data Policy) M1 Decision Readiness

## Document control

| Field | Value |
| --- | --- |
| Status | `ANALYZED / OWNER AND DEPLOYMENT EVIDENCE REQUIRED / NOT IMPLEMENTATION AUTHORITY` |
| Version | 1.0 |
| Prepared | 2026-08-27 |
| Product | Curve |
| Scope | D-002 (Onyx delegated-identity decision), D-004 (Curve Model Gateway decision), and D-005 (model/provider data-policy decision) |
| Intended owners | Security and Identity; Onyx Operations; AI Platform; Platform Operations; AI Governance; Privacy and Legal; FinOps; Curve Product and Engineering |
| Prepared by | Codex under Federico Ocampo's review |
| Governing baseline | Exact Curve revision named by the eventual decision PR |
| Activation boundary | No provider credential, model allowlist, data-routing approval, live retrieval, protected persistence, or model call is authorized by this packet |

This document prepares the Onyx delegated-identity, Curve Model Gateway, and
model/provider data-policy decisions for named-owner review. It supplies no
provider credential, model allowlist, data-routing approval, live retrieval,
protected persistence, or model-call authority.

## Decision boundary

| Decision | Required outcome | First consuming scope |
| --- | --- | --- |
| D-002 (Onyx delegated identity) | One supported initiating-human delegation mechanism with exact deployed Onyx and identity evidence | M1-03B (live Onyx retrieval and Gate 1 access proof) |
| D-004 (Curve Model Gateway) | Versioned in-process gateway contract over approved X3M OpenRouter access | First model-enabled M1 (alignment, evidence, PRD, and Gate 1) operation |
| D-005 (model/provider data policy) | Task/classification model and provider policy, evaluation baseline, retention/residency terms, and fallback equivalence | Every model-enabled M1 (alignment and Gate 1), M3 (architecture and planning), and M5 (quality and VCS) operation |

D-009 (retention, deletion, backup, and legal-hold policy) separately controls
protected-body persistence. D-014 (budget policy) separately supplies budget
limits and exception authority.

## Official upstream evidence

### Onyx

- [Onyx API overview and authentication](https://docs.onyx.app/developers/overview)
  (API keys, user PAT permission inheritance, token expiry/revocation, REST API,
  and deployed OpenAPI explorer)
- [Onyx OIDC deployment authentication](https://docs.onyx.app/deployment/authentication/oidc)
  (OIDC configuration, scopes, refresh-token behavior, and optional PKCE)

The public API documents user-permission-aware PATs and application OIDC. It
does not establish the specific short-lived, audience-bound, per-operation
server delegation required by Curve. The deployed X3M version, OpenAPI, identity
configuration, and proof environment remain authoritative.

### OpenRouter

- [OpenRouter provider selection](https://openrouter.ai/docs/guides/routing/provider-selection)
  (provider routing controls, ordering, allowlists, and per-request ZDR)
- [OpenRouter model fallbacks](https://openrouter.ai/docs/guides/routing/model-fallbacks)
  (ordered cross-model fallback behavior and actual response model)
- [OpenRouter Zero Data Retention](https://openrouter.ai/docs/guides/features/zdr)
  (account, guardrail, model-group, request policy, endpoint inventory, and
  in-memory-cache interpretation)
- [OpenRouter provider logging](https://openrouter.ai/docs/guides/privacy/provider-logging)
  (provider-specific retention/training terms and region controls)
- [OpenRouter Guardrails TypeScript SDK reference](https://openrouter.ai/docs/client-sdks/typescript/sdks/guardrails/README)
  (current guardrail list/create/update operations, model/provider allowlists,
  budget limits, ZDR controls, and key/member assignments)
- [OpenRouter data collection](https://openrouter.ai/docs/guides/privacy/data-collection)
  (prompt/response logging choices and metadata collection)

These are capability descriptions. X3M account configuration, contracts,
entitlements, routes, selected models/endpoints, and measured behavior remain
decision evidence.

## D-002 (Onyx delegated-identity decision) readiness

The pending M1 branch already provides:

- A closed machine decision schema and proposal record.
- Twelve proof cases.
- Initiating-human identity, no reusable PAT/refresh-token persistence, durable
  reauthorization, access recheck, and prompt-injection invariants.
- Explicit fail-closed activation flags.
- Candidate mechanisms: X3M token exchange/on-behalf-of, trusted delegation
  proxy, supported session forwarding, or operation-scoped ephemeral token.

### Required owner inputs

| Input | Required evidence |
| --- | --- |
| Deployed Onyx | Exact version, image digest, base-URL class, sanitized configuration digest |
| OpenAPI | Digest of deployed `/api/docs`; exact search and access-check request/response schemas |
| Delegation | One selected mechanism and protocol version; optional failover only with proven equivalent identity/security semantics |
| Principal binding | Issuer, audience, subject, workspace, operation, and purpose mapping plus mismatch behavior |
| Credential lifecycle | Maximum TTL, refresh/reauthorization behavior, revocation maximum, memory/secret boundary |
| API behavior | Read-only capabilities, timeout, bounded retry, rate limit, pagination, and circuit breaker |
| Permission proof | Two synthetic users with shared and user-A-only sources; positive and negative results |
| Durable proof | Timer/retry/replay after expiry or revocation forces fresh human authorization |
| Operations | Network/TLS, owners, entitlement, rotation, support, cleanup, and rollback |
| Approvals | Named Security/Identity, Onyx Operations, and Curve Product people bound to one decision digest |

### D-002 (Onyx delegated-identity decision) proof interpretation

- A manually issued PAT with a reusable multi-day lifetime cannot satisfy the
  per-operation delegation invariant without a separately approved broker that
  prevents Curve from receiving or persisting it.
- Onyx application OIDC login does not prove a backend on-behalf-of API. Its
  refresh-token and PKCE configuration must be evaluated against the exact X3M
  deployment.
- A service/admin API key cannot prove initiating-human source permissions.

## D-004 (Curve Model Gateway decision) missing contract set

D-004 (Curve Model Gateway decision) currently exists as a proposed
architectural direction. Before decision,
publish:

1. `adr-004-model-gateway.md` containing ownership, scope, options, selected
   in-process boundary, failure behavior, replacement path, and approval.
2. `d004-model-gateway-v1.json` containing the exact OpenRouter API/profile,
   endpoint class, authentication reference type, timeout/retry/cancellation,
   streaming/tool/structured-output capabilities, usage normalization,
   telemetry/redaction, health, kill switch, and version-review triggers.
3. A closed JSON Schema and positive/negative fixtures for that record.
4. A gateway port contract with idempotency, deadline, cancellation, model and
   provider identity, classification, policy/budget version, prompt-package
   digest, safe response/usage projection, and normalized errors.
5. A routing-evidence contract that records requested and actual model/provider
   plus routing reason without storing protected prompt/response bodies.
6. A failure matrix for timeout, rate limit, moderation refusal, context limit,
   provider outage, malformed response, usage disagreement, cancellation,
   ambiguous result, and policy mismatch.
7. An exit/conformance test proving that another gateway implementation can
   replace OpenRouter behind the same Curve port.

### D-004 (Curve Model Gateway decision) owner inputs

- Named AI Platform, Platform Operations, Security, FinOps, and support owners.
- Exact X3M OpenRouter account/workspace, endpoint/base URL, entitlement, API
  version, key ownership/rotation, and environment mapping.
- Account and guardrail configuration digests.
- Allowed request features and maximum request/response sizes.
- Timeout, retry, concurrency, rate-limit, circuit-breaker, and reconciliation
  values.
- Telemetry destination and permitted metadata fields.
- Operational SLOs, incident owner, kill switch, and review cadence.
- License, terms, supply-chain, and replacement-path evidence.

## D-005 (model/provider data-policy decision) missing contract set

Before decision, publish:

1. `adr-005-model-provider-data-policy.md` containing task, classification,
   residency, retention/training, evaluation, fallback, and exception policy.
2. `d005-model-policy-v1.json` plus a closed schema and fixtures.
3. A model catalog snapshot containing exact stable model IDs, provider
   endpoints, capability metadata, context/output limits, price/source date,
   region, retention/training/ZDR terms, and support lifecycle.
4. A task-policy matrix mapping every model-enabled Curve operation to allowed
   model/provider endpoints, classifications, prompt policy, required
   capabilities, evaluation suite/version, threshold, and fallback set.
5. A fallback-equivalence matrix proving allowed alternatives meet task quality,
   capability, data, residency, security, context, latency, and cost bounds.
6. A red-team/evaluation corpus with reproducible inputs, expected judgments,
   score definitions, thresholds, approvers, and regression policy.
7. A restricted-data profile tying ZDR, DLP, residency, retention, telemetry,
   and legal approval to exact endpoints. An empty approved set keeps
   `RESTRICTED` calls denied.
8. Exception, expiry, re-evaluation, catalog-drift, and kill-switch contracts.

### D-005 (model/provider data-policy decision) owner inputs

| Area | Required decision |
| --- | --- |
| Task types | Exact planning, research, PRD, architecture, coding, and review operation identifiers that may invoke models |
| Classification | Allowed model/provider endpoints for `INTERNAL`, `CONFIDENTIAL`, and `RESTRICTED` |
| Residency | Approved processing regions and routing evidence |
| Training/retention | Endpoint-specific prompt/output training and retention terms plus proof date |
| ZDR | Whether OpenRouter's endpoint policy and in-memory caching interpretation satisfy X3M requirements |
| Logging | Account, organization, guardrail, provider, and request logging settings and drift detection |
| DLP | Required pre-call classification/redaction/block evidence and post-call leak scan |
| Capabilities | Required context size, structured output, tool calling, streaming, reasoning, and multimodal behavior per task |
| Evaluations | Dataset/version, metrics, thresholds, sample size, reviewers, and regression cadence |
| Fallback | Exact allowed equivalent sequence and trigger set; empty sequence means pause/fail |
| Actual routing | Required model/provider/region/policy/usage evidence returned and audited |
| Exceptions | Named authority, maximum duration, affected scope, compensating controls, and expiry |

## No-silent-fallback enforcement

OpenRouter can automatically route among providers and can try a model list on
errors. Curve must choose and prove one approved enforcement shape:

1. Send one exact model and one exact provider endpoint per attempt; Curve
   performs a new, separately audited attempt only for a D-005 (model/provider
   data-policy decision)-approved
   equivalent fallback.
2. Send an exact ordered model/provider allowlist whose every member is already
   equivalent and require returned actual-route evidence before accepting the
   result.

In either shape:

- The request binds task policy, classification, model catalog, prompt policy,
  budget, gateway, and evaluation versions.
- A route outside the bound set rejects the result.
- Provider/model/account-policy exhaustion pauses or fails with partial output;
  it never selects a new destination silently.
- Retry never bypasses ZDR, residency, training, retention, DLP, capability, or
  budget constraints.
- Actual model/provider/region and usage are durable, attributed audit evidence.

## Cross-decision acceptance suite

1. Merge and rebase the pending M1 contract branch onto canonical Curve `main`.
2. Obtain the deployed Onyx and X3M identity facts for D-002 (Onyx
   delegated-identity decision).
3. Run D-002 (Onyx delegated-identity decision)'s twelve-case two-user and
   durable-reauthorization proof.
4. Publish D-004 (Curve Model Gateway decision) and D-005 (model/provider
   data-policy decision) ADRs, machine schemas, fixtures, and owner-fillable
   decision instances.
5. Populate the X3M OpenRouter gateway and model catalog from controlled account
   evidence.
6. Run gateway failure, routing, usage, data-policy, evaluation, red-team, and
   fallback-equivalence proofs.
7. Bind D-002 (Onyx delegated-identity decision), D-004 (Curve Model Gateway
   decision), and D-005 (model/provider data-policy decision) named approvals
   to their exact stable decision digests and schedule reviews.
8. Dispatch model-free M1 packages independently where their task packets allow.
9. Dispatch live Onyx and model-enabled M1 packages only from exact decided
   revisions.

## Current blockers

### D-002 (Onyx delegated-identity decision)

- Deployed Onyx version/image/OpenAPI/configuration
- Supported delegation mechanism and identity bindings
- Timeout/retry/rate/revocation values
- Twelve passing proof cases
- Named Security/Identity and Onyx Operations owners/approvals

### D-004 (Curve Model Gateway decision)

- Dedicated ADR, machine record/schema/fixtures, gateway port, routing evidence,
  error/failure matrix, replacement test, and named owners
- Exact X3M OpenRouter account/API/auth/configuration/operations evidence

### D-005 (model/provider data-policy decision)

- Dedicated ADR, machine record/schema/fixtures, catalog, task matrix,
  endpoint-specific data terms, evaluations, red-team corpus, fallback
  equivalence, restricted-data profile, and named AI Governance/Security owners
