# M0-S9B1 (Provider Administration Decision and Readiness Gate)

> Sanitized public reference. Fictional identities cannot authorize execution.
> Historical approvals apply only to their original bytes; see
> [public contract edition](public-reference-sanitization.md) (sanitization, integrity and approval boundaries).

## Document control

| Field | Value |
| --- | --- |
| Package | M0-S9B1 (provider administration API) |
| Decision IDs | `B-ADMIN-M0-S9B1` (human administration authority), `B-ADMIN-ACTION-M0-S9B1` (policy action profile), `B-ADMIN-READ-M0-S9B1` (safe-projection visibility), `B-ADMIN-MEMBERSHIP-M0-S9B1` (authority preconditions), `B-ADMIN-SEPARATION-M0-S9B1` (separation of duties), `B-ADMIN-DENY-M0-S9B1` (authenticated denial projection), `B-ADMIN-EXPOSURE-M0-S9B1` (product exposure), `B-ADMIN-SCOPE-M0-S9B1` (environment and classification), `B-ADMIN-REVIEW-M0-S9B1` (owner/reviewer relationship), `B-ADMIN-APPROVAL-M0-S9B1` (governance-approval separation), `B-ADMIN-BUDGET-M0-S9B1` (bounded implementation attempt), `B-ADMIN-IDENTITY-M0-S9B1` (canonical governance identity authority), and `B-ADMIN-ASYNC-M0-S9B1` (asynchronous operation type profile) |
| Status | `PROPOSED / OWNER_SELECTION_REQUIRED / NO_DISPATCH` |
| Version | 0.3 |
| Date | 2026-08-31 |
| Product | Curve |
| Decision owner | Designated reviewer, Designated technical owner |
| Candidate delivery owner | Designated reviewer |
| Candidate human reviewer | Designated reviewer; owner/reviewer separation remains an explicit unresolved choice |
| Contract baseline | Curve `main` at `e7aa7e6ff23491cfae02379d74508822a8ded238` |
| Observed implementation baseline | Plane `preview` at `99a73b4eab5ee21fd012d7358bc9259252d47f71`; `0007_initiative_gateassignment.py` (Initiative and gate-assignment migration) is current and migration slot `0008` is observational only, not reserved |
| Data boundary | Synthetic `INTERNAL` provider metadata only |
| External effects | None; provider network, credentials, callbacks, webhooks, schedules, and external mutation remain disabled |

## Outcome

Make M0-S9B1 (provider administration API) decision-ready without selecting a material authority or product
exposure model. The package fixes the candidate provider-administration API
boundary, security invariants, safe projections, tests, and dependency edges.
Its machine record remains fail closed until a named human selects every
material alternative and binds the exact decision digest.

This gate prepares a later implementation packet. It grants no Plane mutation,
migration allocation, generated-client publication, provider access, runtime
activation, or implementation authority.

## Accepted predecessor evidence

| Evidence | Effect on this gate |
| --- | --- |
| M0-S2 (operation, idempotency, event, outbox/inbox, and audit persistence contract) | Supplies the accepted `ResourceRef`-based idempotency response record, optimistic versions, immutable events, and workspace-owned delivery primitives consumed by this candidate. |
| M0-S9A (provider-neutral registry and reconciliation foundation) | Supplies workspace-scoped `ProviderConnection`, `ProviderCapability`, policy, idempotency, delivery, reconciliation, and fake-local adapter primitives. |
| M0-S9B-D1 (external provider transport definition gate) | Defines M0-S9B1 (provider administration API) through M0-S9B6 (one named provider activation) as independently reviewable children and keeps all external transport decision-gated. |
| D-003 (runtime topology and trust-zone decision) | Permits local-only proof. It does not activate staging or production. |
| D-009 (retention, legal-hold, backup, and erasure decision) | Remains open; M0-S9B1 (provider administration API) therefore exposes metadata only and persists no provider body. |

## Fixed candidate contract

The following invariants are part of every non-deferred alternative. Selecting
an alternative cannot weaken them.

### API resource and commands

The candidate contract extends the Curve workspace API prefix with:

| Method and path | Purpose | Coarse candidate policy action | Concurrency and idempotency |
| --- | --- | --- | --- |
| `GET /api/v1/workspaces/{workspace_slug}/curve/providers/connections` | List authorized safe projections | `CURVE.PROVIDER_CONNECTION.LIST` | Opaque cursor up to 4,096 characters; page size 1–100, default 25; no idempotency key |
| `POST /api/v1/workspaces/{workspace_slug}/curve/providers/connections` | Register one allowlisted provider connection | `CURVE.PROVIDER_CONNECTION.REGISTER` | `Idempotency-Key`; no caller-selected workspace |
| `GET /api/v1/workspaces/{workspace_slug}/curve/providers/connections/{connection_id}` | Read one safe projection | `CURVE.PROVIDER_CONNECTION.READ` | Returns `ETag`; no idempotency key |
| `POST /api/v1/workspaces/{workspace_slug}/curve/providers/connections/{connection_id}:validate` | Run approved local validation | `CURVE.PROVIDER_CONNECTION.ADMINISTER` | `Idempotency-Key` and `If-Match` |
| `POST /api/v1/workspaces/{workspace_slug}/curve/providers/connections/{connection_id}:reconcile` | Run approved local reconciliation | `CURVE.PROVIDER_CONNECTION.ADMINISTER` | `Idempotency-Key` and `If-Match` |
| `POST /api/v1/workspaces/{workspace_slug}/curve/providers/connections/{connection_id}:disable` | Stop new provider work | `CURVE.PROVIDER_CONNECTION.ADMINISTER` | `Idempotency-Key` and `If-Match` |
| `POST /api/v1/workspaces/{workspace_slug}/curve/providers/connections/{connection_id}:enable` | Return a disabled connection to pending validation | `CURVE.PROVIDER_CONNECTION.ADMINISTER` | `Idempotency-Key` and `If-Match` |
| `POST /api/v1/workspaces/{workspace_slug}/curve/providers/connections/{connection_id}:revoke` | Irreversibly revoke the connection version | `CURVE.PROVIDER_CONNECTION.ADMINISTER` | `Idempotency-Key` and `If-Match` |

The exact OpenAPI operations are promoted into the normative
`contracts/openapi/curve-v1.openapi.yaml` (Curve v1 workspace API contract)
only after the decisions below are approved. The generated TypeScript client
is produced from that accepted contract during the separately authorized Plane
implementation.

The registration body is a closed
`curve.provider-connection-register-request/v1` projection containing only
`schema_version`, `provider_type`, `adapter_key`, `adapter_version`,
`environment`, `display_name`, and `allowed_classifications`. The server derives
the workspace from the authenticated route, validates provider coordinates
against the server-side registry, and applies the selected environment and
classification ceiling. IDs, versions, lifecycle status, actor facts, external
tenant data, configuration references/digests/bodies, and secret references are
rejected as caller input. This child activates no real adapter; later
M0-S9B2 (credential and endpoint profiles) and M0-S9B6 (one named provider
activation) contracts remain required.

The machine operation catalog names this body contract
`PROVIDER_CONNECTION_REGISTER_REQUEST_V1`. `REGISTER` is the only operation
that accepts a request body; `LIST`, `READ`, `VALIDATE`, `RECONCILE`, `DISABLE`,
`ENABLE`, and `REVOKE` have request-body contract `NONE`. Query parameters,
headers, route parameters, and server-derived identity are outside the request
body and do not weaken the closed-body rule.

The candidate request and response surfaces are published as closed schemas:

- [registration request schema](../../contracts/schemas/provider-connection-register-request.schema.json)
  (seven-field caller request with no workspace, lifecycle, configuration, or secret input);
- [connection administration response schema](../../contracts/schemas/provider-connection-administration.schema.json)
  (safe workspace-scoped connection projection with explicit nullable lifecycle fields);
- [connection administration page schema](../../contracts/schemas/provider-connection-administration-page.schema.json)
  (bounded result page with a nullable opaque continuation cursor).

Each schema declares `x-curve-contract-state: PROPOSED_NOT_NORMATIVE` and
`x-curve-promotion-decision: B-ADMIN-M0-S9B1`. The worksheet binds the raw
UTF-8 bytes of each schema by SHA-256; reformatting or changing any byte
requires a reviewed successor decision binding. The accepted
M0-S9A (provider-neutral registry and reconciliation foundation) registry is
also raw-byte bound at
`sha256:393c33fa5343beb1fe05a445a015333334a27bf491d7850c64dcf0a7f265071a`.
Its accepted coordinate is exactly `FAKE_LOCAL`, `curve.fake-local`, `1.0.0`,
`LOCAL`, with an `INTERNAL` classification ceiling. Registration must match
that provider type, adapter key, adapter version, and environment, and its
requested classifications must be a non-empty subset of the coordinate
ceiling.

The contract follows the OpenAPI Initiative
[OpenAPI Specification 3.1](https://spec.openapis.org/oas/v3.1.1.html)
(versioned API-description dialect), the HTTP conditional-request semantics in
IETF [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) (HTTP validators,
preconditions, and status semantics), and the IETF
[Problem Details specification, RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html)
(machine-readable HTTP error responses).

### Safe response projection

Responses may contain only:

- authoritative workspace ID, connection ID, and aggregate version;
- provider type, adapter key, and adapter version;
- environment, display name, allowed classifications, and lifecycle status;
- capability version when one exists;
- validation, reconciliation, and next-reconciliation timestamps when present;
- safe last-error code and retryability, without a detail reference;
- creation and update timestamps.

`current_capability` is either `null` or the closed pair
`{ capability_version, capability_digest }`. `last_error` is either `null` or
the closed pair `{ code, retryable }`. Neither nested projection accepts
additional fields, resource references, object references, or free-form provider
text.

`capability_digest` is SHA-256 over compact UTF-8 JSON with recursively sorted
object keys and preserved array order. The source fields are `workspace_id`,
`connection_id`, `provider_type`, `adapter_key`, `adapter_version`,
`protocol_versions`, `capabilities`, and `allowed_classifications`. Each
capability contributes `enabled`, `name`, and `risk`; `schema_uri` is included
only when present. Timestamps, aggregate versions, expiry, and validation
metadata are excluded, so transport or observation time cannot change a
capability identity.

Provider-connection responses, SSE, audit projections, Problem Details, logs,
traces, and metrics
exclude any caller-supplied workspace ID, external tenant references,
configuration references or digests, secret references, tokens, credentials,
endpoint URLs, callback keys, signing material, protected provider bodies,
capability bodies, arbitrary provider exceptions, and
user identifiers. This is a projection contract, not direct model
serialization.

`VALIDATE` and `RECONCILE` return only the existing
[Operation summary schema](../../contracts/schemas/operation-summary.schema.json)
(closed safe asynchronous-operation response) fields:
`schema_version`, operation ID, workspace ID, operation type, status, version,
and optional progress percentage. The current summary accepts
`FOUNDATION_PROBE`, `WORKFLOW_COMMAND`, and `PROVIDER_RECONCILIATION`; any
selected `PROVIDER_ADMINISTRATION` or `PROVIDER_VALIDATION` type must be added
to a reviewed successor Operation schema before implementation dispatch.

### Authorization and lookup order

1. Resolve the workspace and authenticated human using Plane's trusted session.
2. Derive active membership and trusted roles from persistence; reject
   caller-supplied roles.
3. Evaluate workspace preauthorization before any connection lookup. For list
   and register, this is the final `WORKSPACE` resource authorization.
4. For read and existing-aggregate commands, query only safe metadata by
   `(workspace_id, connection_id)`; never fall back to a global identifier
   lookup.
5. Evaluate the exact action against the `PROVIDER_CONNECTION` resource built
   from that scoped safe metadata. A denial reveals no connection existence.
6. For commands, complete the operation-specific authorization sequence before
   looking up or replaying an idempotency record. A prior key never bypasses
   current membership, role, separation, or resource authorization.
7. Resolve no secret, endpoint, body, adapter, provider event, outbox claim,
   network target, or scheduling mutation before both authorization stages
   allow the action.
8. Return the stable workspace-bound response: inactive/nonmember humans are
   denied at the workspace boundary; absent and other-workspace connection IDs
   are indistinguishable.
9. Commit the policy decision, allowed domain mutation, event/outbox, and audit
   atomically. A denial creates no connection, inbox, outbox, provider, or
   external effect.

These rules implement the object-level and function-level controls described
by the OWASP
[Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
(object-level and function-level authorization controls).

### Command semantics

- A repeated command with the same idempotency key and canonical request digest
  reuses the original stored status and `ResourceRef`, resolves that resource
  only after current authorization, and returns its current safe projection and
  current aggregate-version ETag. The idempotency record stores no historical
  response body.
- Reusing the key with a changed digest returns conflict and performs no second
  effect.
- `If-Match` on every existing-aggregate command is a precondition against the
  exact `PROVIDER_CONNECTION` aggregate ETag. A missing required precondition
  returns `428`; a stale precondition returns `412`; neither creates an
  operation, domain event, inbox/outbox record, provider event, or other effect.
- `REGISTER` returns `201`, the created connection representation, `Location`
  for that `PROVIDER_CONNECTION`, and its ETag. `READ`, `DISABLE`, `ENABLE`, and
  `REVOKE` return a `PROVIDER_CONNECTION` representation and its current ETag.
- `VALIDATE` and `RECONCILE` return `202`, an `OPERATION` representation,
  `Location` for that operation, and the operation ETag. Their request
  precondition still targets `PROVIDER_CONNECTION`; the operation ETag never
  substitutes for a connection precondition.
- Idempotent response replay preserves the original response resource, status,
  and `Location`; representation and ETag are resolved from the current
  authorized resource. A missing, deleted, or inaccessible stored resource
  returns an idempotency-reconciliation-required result and performs no effect.
- Validation and reconciliation use only the accepted fake-local adapter in
  this child. Provider runtime network and credentials remain unavailable.
- Disablement is reversible through enable plus validation. Revocation is
  terminal for the connection version.
- Curve-disabled behavior exposes no provider-administration route and starts
  no provider work.

## Material decisions requiring named human selection

The machine worksheet enumerates these exact alternatives. `DEFER` is a valid
decision outcome and keeps the API disabled.

### B-ADMIN-M0-S9B1 (human administration authority)

| Option | Authority source | Consequence |
| --- | --- | --- |
| `PLANE_INSTANCE_ADMIN_AND_WORKSPACE_MEMBER` | Authenticated Plane instance administrator with active membership in the exact workspace | Uses two existing Plane facts; requires an authoritative instance-admin resolver. |
| `PLANE_WORKSPACE_ROLE_20` | Active Plane role `20` membership in the exact workspace | Extends the local M0-S9A (provider-neutral registry and reconciliation foundation) mapping to the accepted M0-S9B1 (provider administration API) actions. |
| `CURVE_PLATFORM_ADMIN_ASSIGNMENT` | Dedicated versioned Curve platform-administrator assignment | Adds an explicit Curve assignment lifecycle and later migration. |
| `DEFER` | No administration authority | Keeps M0-S9B1 (provider administration API) disabled and dispatch blocked. |

### B-ADMIN-ACTION-M0-S9B1 (policy action profile)

| Option | Policy actions |
| --- | --- |
| `COARSE_V3` | `LIST`, `READ`, and `REGISTER` actions plus one `ADMINISTER` action shared by validate, reconcile, disable, enable, and revoke. |
| `GRANULAR_V3` | Separate `LIST`, `READ`, `REGISTER`, `VALIDATE`, `RECONCILE`, `DISABLE`, `ENABLE`, and `REVOKE` actions. |
| `DEFER` | No provider-administration action is published. |

Every non-deferred option uses separate `LIST` and `READ` actions and requires a
successor to the immutable M0-S9A (provider-neutral registry and reconciliation foundation) core policy v2.

### B-ADMIN-ASYNC-M0-S9B1 (asynchronous operation type profile)

| Option | `VALIDATE` operation type | `RECONCILE` operation type |
| --- | --- | --- |
| `SHARED_PROVIDER_ADMINISTRATION_OPERATION_V1` | `PROVIDER_ADMINISTRATION` | `PROVIDER_ADMINISTRATION` |
| `DISTINCT_VALIDATE_RECONCILE_OPERATION_TYPES_V1` | `PROVIDER_VALIDATION` | `PROVIDER_RECONCILIATION` |
| `DEFER` | No asynchronous operation contract | No asynchronous operation contract |

The selection remains unresolved. The selected mapping must be promoted into
the successor Operation contract before implementation dispatch, so an
implementer never invents an operation type. Every synchronous operation has an
empty operation-type mapping.

### B-ADMIN-READ-M0-S9B1 (safe-projection visibility)

| Option | Read behavior |
| --- | --- |
| `PLATFORM_ADMINISTRATOR_ONLY` | Only the selected provider-administration authority may list/read the safe projection. |
| `ACTIVE_WORKSPACE_MEMBERS_SAFE_PROJECTION` | Any active member of the exact workspace may list/read; commands remain limited to the selected administration authority. |
| `DEFER` | No provider-administration read route. |

### B-ADMIN-MEMBERSHIP-M0-S9B1 (authority preconditions)

| Option | Required trusted facts |
| --- | --- |
| `ACTIVE_TARGET_WORKSPACE_REQUIRED` | Active role `20` membership in the exact target workspace. |
| `ACTIVE_TARGET_WORKSPACE_AND_INSTANCE_ADMIN_REQUIRED` | Active exact-workspace membership plus trusted Plane instance-administrator status. |
| `ACTIVE_TARGET_WORKSPACE_AND_CURVE_ASSIGNMENT_REQUIRED` | Active exact-workspace membership plus a current Curve platform-administrator assignment. |
| `DEFER` | No authority precondition is activated. |

The authority-source and membership selections must form the compatible pair
encoded by the machine validator.

### B-ADMIN-IDENTITY-M0-S9B1 (canonical governance identity authority)

| Option | Canonical human subject | Consequence |
| --- | --- | --- |
| `ORGANIZATION_IDP_SUBJECT` | Exact `(ORGANIZATION_IDP_SUBJECT, immutable IdP subject)` pair | Uses the Example Organization identity provider as the equality and separation authority. |
| `PLANE_USER_ID` | Exact `(PLANE_USER_ID, immutable Plane user ID)` pair | Uses Plane's persisted user identifier as the equality and separation authority. |
| `GITHUB_USER_ID` | Exact `(GITHUB_USER_ID, immutable GitHub user ID)` pair | Uses the verified GitHub user identifier as the equality and separation authority. |

The selected authority and subject form one canonical tuple. Identity aliases,
including login, email, display name, `identity_ref`, or an identifier from a
different authority, cannot establish equality or distinctness. A cross-system
mapping is evidence metadata until an approved, digest-bound subject proof
binds it to the selected canonical authority. The selection remains unresolved,
so this record remains `PROPOSED / OWNER_SELECTION_REQUIRED / NO_DISPATCH`.
The machine contract accepts Example Organization subjects only in the closed
`[A-Za-z0-9][A-Za-z0-9._:@/-]{0,254}` alphabet, Plane subjects only as canonical
UUIDs, and GitHub subjects only as non-zero decimal user IDs. Whitespace-only,
leading/trailing-whitespace, login-derived, email-derived, and malformed
subjects fail before equality or
separation is evaluated. Even a deferred provider-administration outcome must
select one concrete identity authority so its three governance approvals can
be attributed and proven distinct.

### B-ADMIN-SEPARATION-M0-S9B1 (administration separation of duties)

| Option | Rule |
| --- | --- |
| `NONE` | One authorized administrator may perform every accepted M0-S9B1 (provider administration API) command. |
| `DISTINCT_REVOKER` | The person revoking a connection differs from the person performing its latest administrative mutation. |
| `DISTINCT_REGISTRAR_AND_REVOKER` | The registrar and revoker are different active humans. |
| `DEDICATED_REVOKE_APPROVER` | Revocation requires a separately assigned human role and an exact digest-bound separation-policy reference. |
| `DEFER` | No administration command is activated. |

### B-ADMIN-DENY-M0-S9B1 (authenticated denial projection)

| Option | HTTP projection |
| --- | --- |
| `ROLE_DENIAL_403_SCOPE_OR_ABSENCE_404` | An authenticated in-workspace role denial returns stable `403`; absent and other-workspace IDs return indistinguishable `404`. |
| `OPAQUE_404_FOR_ALL_AUTHENTICATED_DENIALS` | Every authenticated administration denial uses the same bounded `404` projection. |
| `DEFER` | The route remains disabled. |

### B-ADMIN-EXPOSURE-M0-S9B1 (product exposure)

| Option | R1 result |
| --- | --- |
| `INTERNAL_API_ONLY` | Publish the authenticated internal API and generated client; no Curve administration screen in this child. |
| `API_AND_CURVE_ADMIN_UI` | Publish the API and add a Curve-native provider administration screen under a separately approved UX contract and manual test. |
| `DEFER` | Publish neither API nor UI. |

### B-ADMIN-SCOPE-M0-S9B1 (environment and classification)

| Option | Environment/classification ceiling |
| --- | --- |
| `LOCAL_INTERNAL_ONLY` | Local environment and synthetic `INTERNAL` metadata only. |
| `LOCAL_AND_STAGING_INTERNAL` | Local and staging with `INTERNAL` metadata; requires staging activation evidence under D-003 (runtime topology and trust-zone decision) and an approved D-009 (retention, backup, hold, and erasure decision). |
| `ALL_ENVIRONMENTS_APPROVED_CLASSES` | Local, staging, and production with an explicit non-empty classification list and digest-bound classification approval; requires D-003 (runtime topology and trust-zone decision), D-009 (retention, backup, hold, and erasure decision), and target-environment evidence. |
| `DEFER` | No enabled environment or classification. |

Selecting a wider option supplies a ceiling; every environment still requires
its own activation packet.

The dependency evidence for the selected ceiling is exact:

| Scope | Runtime activation targets | Approved classification set | Classification-approval evidence |
| --- | --- | --- | --- |
| `LOCAL_INTERNAL_ONLY` | Exactly `LOCAL` | Exactly `INTERNAL` | Empty |
| `LOCAL_AND_STAGING_INTERNAL` | Exactly `LOCAL` and `STAGING`, plus accepted D-009 (retention, legal-hold, backup, and erasure decision) evidence | Exactly `INTERNAL` | Empty |
| `ALL_ENVIRONMENTS_APPROVED_CLASSES` | Exactly `LOCAL`, `STAGING`, and `PRODUCTION`, plus accepted D-009 (retention, legal-hold, backup, and erasure decision) evidence | One explicit non-empty subset of `INTERNAL`, `CONFIDENTIAL`, and `RESTRICTED` | The exact union of `approved_classifications` in digest-bound `CLASSIFICATION_APPROVAL` evidence equals the selected classification set; no selected class lacks evidence and no evidence adds another class. |
| `DEFER` | Empty | Empty | Empty |

An evidence envelope for one environment or classification cannot activate
another. Every selected runtime environment requires its own artifact with a
unique content digest and unique `(reference, source_revision)` locator.
Duplicate references do not expand the set and do not satisfy a missing target.

### B-ADMIN-REVIEW-M0-S9B1 (owner/reviewer relationship)

| Option | Rule |
| --- | --- |
| `DISTINCT_HUMANS` | Delivery owner and human reviewer are different active people. |
| `SAME_PERSON_BOOTSTRAP_EXCEPTION` | One named human may own and review this bootstrap child under an exact, digest-bound exception whose validity window contains the decision time and extends strictly beyond the next review. |
| `DEFER` | No implementation packet is prepared. |

This decision reconciles the existing Designated reviewer-as-default-reviewer convention
with the M0-S9B (external provider transport and administration foundation)
parent packet's distinct-reviewer requirement. No coding agent
may infer the choice.

The same-person exception must set `dispatch_revalidation_required: true`.
Every later implementation dispatch must revalidate the exception, its expiry,
the current owner and reviewer, and the exact decision/context revisions; this
readiness record itself never authorizes dispatch.

### B-ADMIN-APPROVAL-M0-S9B1 (governance-approval separation)

| Option | Rule |
| --- | --- |
| `THREE_DISTINCT_HUMANS` | Curve product, security/identity, and platform-administration approvals come from three declared owners with distinct trusted identities. |
| `MULTI_ROLE_TIME_BOUND_EXCEPTION` | One human may hold more than one approval role only under an exact source-revision-bound, SHA-256-bound exception whose validity window contains the decision time. |
| `DEFER` | The decision remains unapproved and no successor contract is materialized. |

Every approval role is bound to its corresponding declared owner. This choice
governs whether those three owner identities must be distinct; it does not allow
an undeclared approver or a coding agent to approve any role.

### B-ADMIN-BUDGET-M0-S9B1 (bounded implementation attempt)

| Option | Ceiling |
| --- | --- |
| `USD_25_ZERO_PROVIDER_SPEND` | Up to USD 25 for one coding attempt; zero provider/runtime external spend; exhaustion pauses. |
| `OWNER_SPECIFIED_LOWER_CEILING` | A named non-negative ceiling below USD 25; zero provider/runtime external spend; exhaustion pauses. |
| `DEFER` | No spend and no implementation attempt. |

## Machine decision lifecycle

The
[M0-S9B1 decision worksheet](../../contracts/governance/m0-s9b1-provider-administration-v1.json)
(owner selections, candidate interface, safe projection, approval, and
fail-closed handoff) is normative for this gate. Its
[closed JSON Schema](../../contracts/schemas/provider-administration-decision.schema.json)
(field types, alternatives, selected values, and no-dispatch ceiling) and
semantic validator enforce:

- exact alternative catalogs and candidate API/security invariants;
- an exact 17-item unresolved-requirement projection while the proposal remains
  unselected;
- typed evidence references bound to a source revision, SHA-256 content digest,
  and exact target environment;
- every evidence envelope is additionally bound to decision
  `B-ADMIN-M0-S9B1`, work package `M0-S9B1`, and repository
  `github.com/faocampo/curve`; evidence from another decision, package, or
  repository is inapplicable even when its artifact digest matches;
- every `PROOF_RESULT` carries `proof_case_id`, which must equal the enclosing
  proof case's `case_id`; one case's evidence cannot satisfy another case, and
  neither one content digest nor one `(reference, source_revision)` locator can
  be reused across cases or across dependency and proof evidence;
- decided human equality and separation use the selected canonical
  `(identity_authority, subject_id)` tuple and a digest-bound
  `IDENTITY_SUBJECT_PROOF`; aliases are not equality keys;
- each approval role bound to its declared decision, security, or platform owner;
- an explicit three-distinct-human or digest-bound, time-limited multi-role
  governance-approval rule;
- decision and next-review timestamps inside the canonical approval-subject
  digest;
- in a decided record, `last_updated` is not earlier than `decided_at` or any
  approval's `approved_at` timestamp;
- `PROPOSED` means every material selection and approval is empty;
- `DEFERRED` requires the twelve defer-capable provider-administration
  selections to be `DEFER`, one concrete canonical governance identity
  authority, exact empty
  dependency evidence, three distinct governance approvers, and disabled
  successor contracts;
- `APPROVED` requires fourteen passing proof cases with typed `PROOF_RESULT`
  evidence and the exact successor-contract activation projection;
- a complete non-deferred decision binds one canonical approval-subject digest;
- the decision may authorize only contract/task-packet preparation;
- `implementation_dispatch_allowed` remains `false` in every state.

The readiness evidence-verification profile is
`DIGEST_BOUND_HUMAN_ATTESTATION`. The closed schema and semantic validator bind
each evidence subject, content digest, source revision, target environment,
proof case, and approved classification as applicable. The three canonical
governance approvals attest that the referenced bytes and revisions were
resolved and reviewed before the decision. This local
`PROPOSED / OWNER_SELECTION_REQUIRED / NO_DISPATCH` package introduces no
runtime network resolver; target-environment implementation packets must define
and approve any stronger resolver before activation.

The published `APPROVED`, `DEFERRED`, and lifecycle-negative records under
`contracts/schemas/semantic-fixtures/` (synthetic completed-state schema and
semantic examples) are non-normative test data. Only the governance worksheet
at an accepted Curve revision can record a real selection or approval.

A later accepted decision updates the worksheet on one reviewed Curve branch.
After its squash merge and green CI, Curve regenerates a canonical M0-S9B1 (provider administration API)
context digest from exact `main`, revalidates Plane `preview` and the migration
head, then requests a separate implementation authorization.

## Explicit child dependency edges

```text
M0-S9A (provider-neutral registry and reconciliation foundation) accepted substrate
  -> M0-S9B-D1 (external provider transport definition gate) accepted parent definition
    -> M0-S9B1-D1 (provider administration decision/readiness gate)
      -> named material selections and accepted Curve merge
        -> canonical M0-S9B1 (provider administration API) context digest
          -> separately authorized M0-S9B1 (provider administration API) Plane implementation

M0-S9B1 (provider administration API) accepted API
  -> M0-S9B2 (credential and endpoint profiles)
  -> M0-S9B3 (verified callback ingress)
  -> M0-S9B4 (outgoing Curve webhooks)
  -> M0-S9B5 (scheduled reconciliation)
  -> M0-S9B6 (one named provider activation)
```

M0-S9B2 (credential and endpoint profiles) through M0-S9B6 (one named provider activation) consume the administration API but retain their own
identity, endpoint, data, infrastructure, cost, and external-effect decisions.

## Acceptance tests for this decision gate

1. Schema and semantic validation accept the exact fail-closed proposal.
2. Unknown alternatives, missing catalog entries, duplicate paths/actions, or
   extra fields fail.
3. A proposal carrying a selection, approval digest, contract-promotion claim,
   or implementation authority fails.
4. The lifecycle schema and semantic validator accept synthetic complete
   `APPROVED` and `DEFERRED` fixtures and reject inconsistent status, outcome,
   approvals, evidence, proof, timestamp, or activation combinations.
5. A decision missing a material selection, exact approval digest, named human,
   review time, or review-model precondition fails.
6. A same-person reviewer choice without an exception reference fails.
7. Governance approval identities are distinct unless the selected multi-role
   rule carries a digest-bound, source-revision-bound exception valid at the
   decision time; deferred decisions require three distinct identities.
8. A wider environment choice without the required D-003 (runtime topology and trust-zone decision) and D-009 (retention, legal-hold, backup, and erasure decision) evidence fails, and evidence for one environment cannot activate another.
   Selected runtime environments cannot share a content digest or artifact
   locator.
9. Classification-approval evidence exactly covers the selected classification
   set, with neither missing nor additional classifications.
10. Safe projections containing a secret, credential, endpoint, body, external
   tenant, configuration, or user-identity field fail.
11. The three candidate schemas are closed, explicitly
    `PROPOSED_NOT_NORMATIVE`, and raw-byte SHA-256-bound; the accepted M0-S9A
    (provider-neutral registry and reconciliation foundation) registry bytes
    and exact adapter coordinate are also bound.
12. Registration rejects an unaccepted provider type, adapter key, adapter
    version, environment, or classification above the accepted coordinate
    ceiling.
13. Pagination rejects page sizes above 100 and cursors above 4,096 characters.
14. Every command path binds the exact authorization resource, lookup sequence,
    policy action, request-body contract, precondition resource, response ETag
    resource, and required concurrency headers; GET routes carry neither
    mutation header.
15. Idempotency authorization precedes record lookup/replay; a matching terminal
    record resolves its stored `ResourceRef` to the current authorized safe
    projection and ETag, and a missing resource causes no new effect.
16. Every proof reference is case-bound, validated in `NOT_RUN`, `FAIL`, and
    `PASS` states, and cannot reuse a content digest or artifact locator across
    proof or dependency evidence.
17. The fourteenth `REGISTRATION_ALLOWLIST_AND_SCOPE_CEILING` proof demonstrates
    accepted-adapter parity and classification-ceiling enforcement.
18. Governance equality and separation use the selected canonical authority and
    subject; aliases cannot satisfy them, and Plane user IDs must be canonical
    lowercase UUIDs. Leading or trailing subject whitespace fails rather than
    creating another identity spelling.
19. Every evidence envelope is bound to this decision, work package, repository,
    source revision, digest, and applicable target environment.
20. `DIGEST_BOUND_HUMAN_ATTESTATION` binds evidence fields and canonical human
    approvals without introducing a runtime network resolver.
21. A same-person owner/reviewer exception extends beyond the next review and
    requires revalidation at any later implementation dispatch.
22. The selected asynchronous operation profile maps both `VALIDATE` and
    `RECONCILE` to exact successor operation types; a deferred profile activates
    neither, and any type absent from the accepted Operation summary remains
    guarded by successor-schema materialization.
23. The decision record can enable contract-packet preparation but never Plane
    implementation dispatch.
24. Full Markdown, schema, contract, semantic, Project dry-run, and external-link
    validation pass.
25. The valid deferred fixture reaches all twelve documented `DEFER` choices
    while binding its three approvals to one concrete canonical identity
    authority.

## Stop conditions and rollback

Stop if completing the gate would choose a material alternative, mutate Plane,
reserve a migration, update the normative OpenAPI or core policy before
approval, add a UI, resolve credentials, call a provider, retain a provider
body, activate staging/production, or incur external provider cost.

Before merge, rollback is branch reversion. After merge, the proposal remains
non-operative; rollback is a successor decision record or reverting the
documentation/contracts before any implementation packet is approved.

## Completion boundary

M0-S9B1-D1 (provider administration decision/readiness gate) is complete only when the machine proposal, schema, validator,
fixtures, tests, and this packet are merged with green commit-bound CI. That
closes decision preparation, not the material decision or implementation.

M0-S9B1 (provider administration API) becomes implementation-ready only after every selection is approved,
the normative OpenAPI and successor policy are merged, the exact Curve context
digest is generated, Plane baseline/migration evidence is refreshed, and a
separate exact-digest implementation authorization is recorded.
