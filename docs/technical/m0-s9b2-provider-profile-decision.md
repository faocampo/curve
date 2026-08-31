# M0-S9B2 Provider Credential and Endpoint Profile Decision

## Document control

| Field | Value |
| --- | --- |
| Package | M0-S9B2 (provider credential-reference and endpoint-profile foundation) |
| Decision | `B-PROFILE-M0-S9B2` (credential, endpoint, persistence, lifecycle, and activation selection) |
| Status | `PROPOSED / OWNER_SELECTION_REQUIRED / NO_DISPATCH` |
| Contract state | `PROPOSED_NOT_NORMATIVE` |
| Version | 0.2 |
| Date | 2026-08-31 |
| Candidate Curve base | `56e4ac12e9017555a0a23cb1025ac762358c3110` |
| Data boundary | Synthetic `INTERNAL` metadata only |
| External effects | None |

## Outcome

M0-S9B2 (provider credential-reference and endpoint-profile foundation)
publishes the smallest machine-checkable definition needed for a named human to
choose how Curve represents provider credential references, endpoint profiles,
rotation, revocation, and environment activation. The package also describes a
process-local, non-serializable credential-broker port and a closed normalized
error vocabulary. It machine-binds exact profile-version coordinates, terminal
revocation, stale-result denial, capability revalidation, and zero-effect
failure semantics without selecting a provider profile or authorizing runtime
work.

The [M0-S9B2 governance record](../../contracts/governance/m0-s9b2-provider-profile-v1.json)
(fail-closed owner-selection worksheet and raw-byte contract bindings) keeps all
choices unselected. It carries no owner assertion, approval, evidence, endpoint,
secret reference, implementation authority, runtime activation, network access,
or dispatch authority.

## Accepted predecessor boundary

| Predecessor | Bound effect |
| --- | --- |
| [M0-S9A provider registry](../../contracts/providers/m0-s9a-provider-registry-v1.json) (accepted local provider registry and reconciliation substrate) | Supplies workspace-scoped provider connections, capabilities, local authorization, idempotency, delivery, and reconciliation primitives. Its exact bytes are bound by SHA-256. |
| [M0-S9B1 governance record](../../contracts/governance/m0-s9b1-provider-administration-v1.json) (provider-administration candidate API and decision boundary) | Supplies safe provider-connection administration projections and requires credential/endpoint resolution to remain disabled. Its exact bytes are bound by SHA-256. |
| [M0-S9B parent packet](m0-s9b-provider-transport-task-packet.md) (six-child external-provider transport plan) | Makes M0-S9B2 (provider credential-reference and endpoint-profile foundation) a required predecessor for callback, webhook, scheduled reconciliation, and named-provider activation work. |
| D-009 (retention, backup, legal-hold, and erasure decision) | Remains unresolved. This candidate retains no protected configuration body and activates no protected storage. |

## Candidate schemas

All four schemas are closed and declare
`x-curve-contract-state: PROPOSED_NOT_NORMATIVE` plus
`x-curve-promotion-decision: B-PROFILE-M0-S9B2`. The governance record binds
their raw UTF-8 bytes by SHA-256.

| Schema | Candidate meaning |
| --- | --- |
| [Provider credential-reference schema](../../contracts/schemas/provider-credential-reference.schema.json) (unconfigured workspace-scoped credential metadata without reference syntax or material) | Describes only the fields safe to validate before the persistence and broker decisions. `reference_kind` and `reference_format_version` remain `null`; credential material is explicitly absent. |
| [Provider endpoint-profile schema](../../contracts/schemas/provider-endpoint-profile.schema.json) (unconfigured workspace-scoped endpoint metadata without endpoint values) | Keeps profile kind, protocol, TLS, source policy, and endpoint values unselected or absent. |
| [Provider profile-binding schema](../../contracts/schemas/provider-profile-binding.schema.json) (inactive connection-to-profile candidate binding) | Requires one workspace and connection, leaves profile versions unbound, requires capability revalidation, and denies dispatch. |
| [Provider profile-decision schema](../../contracts/schemas/provider-profile-decision.schema.json) (closed proposal lifecycle and material-option contract) | Enforces `PROPOSED`, `OWNER_SELECTION_REQUIRED`, `NO_DISPATCH`, empty evidence/approvals, false activation flags, and null selections. |

These candidate schemas describe decision inputs. A later approved decision must
publish normative successor schemas before a Plane migration or runtime adapter
can be dispatched.

## Material decisions

A named human must select every applicable row or select `DEFER`. The candidate
record keeps `selected: null` for every row.

| Decision area | Allowed alternatives | Required evidence before promotion |
| --- | --- | --- |
| Credential persistence placement | `DEDICATED_PROFILE_RECORD`, `PROVIDER_CONNECTION_EXTENSION`, `DEFER` | Entity ownership, workspace isolation, lifecycle, migration, rollback, and query-plan review. |
| Endpoint persistence placement | `DEDICATED_PROFILE_RECORD`, `PROVIDER_CONNECTION_EXTENSION`, `DEFER` | Entity ownership, workspace isolation, lifecycle, migration, rollback, and query-plan review. |
| Credential broker profile | `X3M_SECRETS_MANAGER_BROKER`, `ABSTRACT_CREDENTIAL_BROKER`, `DEFER` | Security owner, platform owner, broker availability, authentication, authorization, audit, outage, rotation, and revocation evidence. |
| Credential-reference protocol | `OPAQUE_VERSIONED_REFERENCE`, `DEFER` | Exact reference grammar, allowed broker namespace, version rules, validation, redaction, and non-enumerability review. |
| Endpoint transport policy | `HTTPS_ALLOWLISTED_ORIGINS`, `LOCAL_PROCESS_ONLY`, `DEFER` | Exact origins, protocol, TLS/certificate, DNS/IP/source, redirect, timeout, and egress rules. |
| Rotation and revocation policy | `BROKER_VERSIONED_ROTATION_AND_TERMINAL_REVOCATION`, `PROVIDER_MANAGED_ROTATION_AND_TERMINAL_REVOCATION`, `DEFER` | Rotation trigger/overlap, terminal revocation, active-attempt behavior, capability revalidation, audit, and recovery evidence. |
| Environment activation | `LOCAL_ONLY`, `LOCAL_AND_STAGING`, `ALL_ENVIRONMENTS`, `DEFER` | D-003 (runtime topology and trust-zone decision), D-009 (retention, backup, legal-hold, and erasure decision) when applicable, named owners, observability, capacity, and rollback. |

The concrete credential-reference grammar and all endpoint values remain `null`
or empty even though their decision categories are machine-enumerated.

## Candidate credential-broker port

The machine record may describe only this process boundary:

```text
application service
  -> process-local credential broker port
    -> non-serializable credential-use capability OR normalized error code
```

The port accepts trusted workspace context, provider-connection context, a
requested capability, and the exact `credential_profile_version`,
`endpoint_profile_version`, and `binding_version` coordinates. Any future
authorized invocation must bind all six inputs before resolution begins. It
returns a process-local non-serializable capability or one normalized error
code. The port is non-networked, persists no credential material, has no
concrete broker adapter, and is not authorized for implementation by this
package.

Normalized errors are closed to:

- `BROKER_UNAVAILABLE`;
- `CAPABILITY_REVALIDATION_REQUIRED`;
- `CREDENTIAL_REFERENCE_MISSING`;
- `CREDENTIAL_REFERENCE_REVOKED`;
- `CREDENTIAL_REFERENCE_VERSION_MISMATCH`;
- `ENDPOINT_PROFILE_DISABLED`;
- `ENDPOINT_PROFILE_INVALID`;
- `ENDPOINT_PROFILE_MISSING`;
- `OPTIMISTIC_CONCURRENCY`;
- `POLICY_DENIED`.

Problem responses must later follow IETF RFC 9457
([RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html) — Problem Details for
HTTP APIs) and expose only the normalized code, retryability when applicable,
and a correlation identifier.

## Security and authorization invariants

1. Workspace preauthorization occurs before any provider-connection, profile,
   credential-reference, or endpoint-profile lookup.
2. The exact provider-connection resource authorization succeeds before a
   broker call, endpoint lookup, capability revalidation, outbox/inbox claim,
   provider call, or network action.
3. Every persisted successor record, cache key, event, audit record, broker
   request, and authorization input carries `workspace_id`.
4. Secret values, secret locators, endpoint values, authorization headers,
   certificates, signing keys, provider exceptions, and protected bodies never
   enter responses, SSE, Problem Details, logs, traces, metrics, or this
   candidate contract.
5. Credential rotation changes the credential-reference version and requires
   capability revalidation before the binding may become dispatchable.
6. Credential or profile revocation is terminal for that version. Retry,
   callback, scheduler, prompt text, or stale provider success cannot restore
   it.
7. Denial or stale optimistic concurrency performs no broker, endpoint,
   provider, inbox/outbox, or network effect.
8. The schemas follow JSON Schema draft 2020-12
   ([JSON Schema 2020-12](https://json-schema.org/draft/2020-12) — validation
   and applicator vocabulary). Future endpoint validation must follow OWASP's
   SSRF controls
   ([OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
   — destination allowlisting, IP/domain validation, and redirect controls).

The [provider-profile decision schema](../../contracts/schemas/provider-profile-decision.schema.json)
(closed owner-selection, invariant, and failure-semantics contract) fixes the
following invariants as `true`; the candidate proposal cannot weaken them:

| Fixed invariant | Machine-bound meaning |
| --- | --- |
| `exact_version_binding_required` | A future broker invocation carries exact credential-profile, endpoint-profile, and binding versions. |
| `terminal_revocation_per_version` | Revocation permanently denies the revoked version, including stale success and replay. |
| `stale_or_replayed_results_denied` | A stale or replayed result is rejected as `OPTIMISTIC_CONCURRENCY`. |
| `capability_revalidation_before_dispatch` | A stale capability cannot dispatch until it is revalidated against the exact binding versions. |
| `broker_failure_has_zero_downstream_effect` | Broker failure issues no capability and causes no endpoint, provider, network, or delivery mutation. |

## Failure and lifecycle rules

| Condition | Candidate result |
| --- | --- |
| Missing owner selection, evidence, approval, or predecessor | `NO_DISPATCH`; all activation remains false. |
| Changed bound schema or predecessor bytes | Contract validation fails until a reviewed successor updates the binding. |
| Missing, revoked, wrong-version, or unavailable credential reference | Closed normalized error; no endpoint or provider call. |
| Missing or disabled endpoint profile | Closed normalized error; no network action. |
| Credential or endpoint profile version change | Existing binding remains non-dispatchable until capability revalidation succeeds under the approved successor. |
| Cross-workspace identifier | Safe not-found/denial behavior; no cross-workspace lookup or evidence. |
| Broker or endpoint data appears in a candidate fixture | Schema or semantic validation fails. |

The failure map is also closed and ordered. Each condition binds one normalized
error and an exact zero-downstream-effect set:

| Condition | Normalized error | Required zero downstream effects |
| --- | --- | --- |
| Missing credential reference | `CREDENTIAL_REFERENCE_MISSING` | Broker call, endpoint lookup, capability issuance, provider call, network action, inbox/outbox mutation. |
| Revoked credential reference | `CREDENTIAL_REFERENCE_REVOKED` | Broker call, endpoint lookup, capability issuance, provider call, network action, inbox/outbox mutation. |
| Wrong credential-profile version | `CREDENTIAL_REFERENCE_VERSION_MISMATCH` | Broker call, endpoint lookup, capability issuance, provider call, network action, inbox/outbox mutation. |
| Stale or replayed result | `OPTIMISTIC_CONCURRENCY` | Broker call, endpoint lookup, capability issuance, provider call, network action, inbox/outbox mutation. |
| Broker unavailable | `BROKER_UNAVAILABLE` | Endpoint lookup, capability issuance, provider call, network action, inbox/outbox mutation. |
| Invalid endpoint profile | `ENDPOINT_PROFILE_INVALID` | Capability issuance, provider call, network action, inbox/outbox mutation. |
| Stale capability | `CAPABILITY_REVALIDATION_REQUIRED` | Broker call, endpoint lookup, capability issuance, provider call, network action, inbox/outbox mutation. |

## Acceptance cases

| ID | Given / When / Then |
| --- | --- |
| S9B2-01 | Given the canonical proposal, when schemas and semantics are validated, then it remains `PROPOSED / OWNER_SELECTION_REQUIRED / NO_DISPATCH` with seven unresolved requirements. |
| S9B2-02 | Given any selected persistence, broker, protocol, endpoint, lifecycle, or environment alternative, when the proposal validator runs, then validation fails until a reviewed decided-record schema exists. |
| S9B2-03 | Given changed schema or predecessor bytes, when the raw-byte verifier runs, then it rejects the stale digest. |
| S9B2-04 | Given a concrete credential reference, secret value, endpoint, protocol, TLS choice, or source-policy value in candidate metadata, when validation runs, then it fails. |
| S9B2-05 | Given a networked, serializable, persistent, or implementation-authorized broker port, when semantic validation runs, then it fails. |
| S9B2-06 | Given owner, evidence, approval, activation, or dispatch claims in the proposal, when semantic validation runs, then it fails. |
| S9B2-07 | Given candidate records for different workspaces or connections, when semantic validation runs, then it fails. |
| S9B2-08 | Given valid unconfigured synthetic metadata, when schemas validate it, then the projections contain no secret/reference/endpoint values and authorize no runtime effect. |
| S9B2-09 | Given any missing exact version coordinate or weakened fixed invariant, when semantic validation runs, then it rejects the candidate. |
| S9B2-10 | Given missing, revoked, wrong-version, stale/replayed, broker-unavailable, endpoint-invalid, or capability-stale conditions, when the failure contract is validated, then each condition has its fixed normalized error and zero-effect set. |

The [provider-profile semantic test](../../scripts/tests/provider-profile-decision.test.mjs)
(schema classification, fail-closed semantics, raw-byte bindings, and
adversarial mutations) executes these cases. The
[Curve contract validator](../../scripts/validate-contracts.mjs) (repository-wide
schema and semantic gate) also validates the canonical record and every fixture.

## Promotion and implementation prerequisites

M0-S9B2 (provider credential-reference and endpoint-profile foundation) may
advance only after all of the following are complete:

1. A named decision owner, security owner, platform owner, and data owner are
   recorded through an approved successor lifecycle.
2. All material options are selected or the package is explicitly deferred.
3. Exact broker reference syntax, broker trust boundary, endpoint values, TLS,
   DNS/IP/source, rotation, revocation, and environment policy are reviewed.
4. D-009 (retention, backup, legal-hold, and erasure decision) is decided before
   protected configuration is stored or staging/production is activated.
5. Normative successor schemas, OpenAPI changes when applicable, persistence
   contracts, migration allocation, policy actions, safe projections, events,
   observability, and acceptance commands are published.
6. An implementation packet pins one Curve revision, one Plane base, one
   repository branch, one reviewer, exact commands, data boundary, budget, and
   rollback.

Until then, M0-S9B3 (verified callback ingress), M0-S9B4 (outgoing Curve
webhooks), M0-S9B5 (scheduled reconciliation), and M0-S9B6 (one named provider
activation) may refine definitions but cannot consume a credential or endpoint
profile at runtime.

## Rollback

Before promotion, rollback is removal or reversion of this candidate package.
After any future implementation, the implementation packet must define branch
reversion and a Curve feature-disable path that prevents credential resolution,
endpoint use, provider network access, callbacks, webhooks, schedules, and
provider dispatch.
