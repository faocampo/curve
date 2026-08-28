# M0-S9A Provider Registry Relational Contract

## Document control

| Field | Value |
| --- | --- |
| Status | `READY / AWAITING_EXPLICIT_DISPATCH` |
| Version | 1.5 |
| Date | 2026-08-26 |
| Work package | M0-S9A (provider-neutral registry and reconciliation foundation) |
| Owner and reviewer | Federico Ocampo (`faocampo`) |
| Applies to | Curve-owned PostgreSQL tables in the public Plane fork |
| Plane base | Exact `preview` commit `ad5772c0565c934e64ea90f892be1374819979be`, containing Plane PR #10 (M0-S6A durable parent/child Temporal orchestration implementation) |
| Published Curve contract | Curve PR #29 approved head `075985a01dd2cac30423d7bc239407ef191da7a2`, squash commit `7ea91188525c63d699e551910834f4602536f082` |
| Remaining gate | Human-approved dispatch binding the exact merged readiness revision, canonical context digest, and still-current Plane base |

## Purpose and boundary

This contract fixes the local PostgreSQL representation and transaction rules
for the first provider-neutral substrate. It adds workspace-scoped connection
metadata, immutable capability history, a typed adapter port, and explicit
reconciliation through Curve's existing Operation, DomainEvent, OutboxEvent,
IdempotencyRecord, PolicyDecision, and AuditEvent kernel.

M0-S9A (provider-neutral registry and reconciliation foundation) uses one
deterministic `FAKE_LOCAL` adapter with synthetic `INTERNAL` metadata. It
performs no network call, credential lookup, callback handling, outgoing
webhook, scheduled job, MCP operation, model call, repository mutation, or
external side effect. M0-S9B (external provider transport and administration)
owns those capabilities after their applicable material decisions.

Provider commands execute synchronously. Their local domain-event delivery uses
the existing durable outbox/inbox records with two explicit application-service
drain points: immediately after transaction commit and at the start of the next
provider command. This package starts no Temporal workflow, Celery task,
scheduler, or background loop.

Plane remains authoritative for workspace identity and membership. Curve stores
`workspace_id` as an opaque UUID and creates no hard foreign key to a Plane
table. For M0-S9A registration, an authenticated human's live, active Plane
workspace role `20` in the exact target workspace is the trusted source of
Curve `PLATFORM_ADMINISTRATOR` for provider registration and administration
actions only. Caller input cannot supply that role. M0-S9A
exposes application-service/repository boundaries only and creates no public
provider-administration API.

The ProviderConnection and ProviderCapability wire projections use schema
version `2.0`. They replace the initial unimplemented v1 drafts before any
database row, endpoint, generated client, or provider adapter exists. No stored
data or deployed consumer requires migration. A future incompatible change
requires a new schema version and compatibility plan.

## Authorization contracts

The [M0-S9A registration authorization decision](../../docs/technical/m0-s9a-registration-authorization-decision.md)
(approved Option B Plane workspace-admin mapping and existing-workspace
registration resource) defines the human-readable decision. The
[core policy v2 manifest](../policy/core-policy-v2.json) (machine-readable
trusted role source and additive registration action) and
[core policy v2 schema](../schemas/core-policy-manifest-v2.schema.json) (closed
validation of the approved extension) are normative.

Core policy v2 supersedes v1 for new evaluations. The
[core policy v1 manifest](../policy/core-policy-v1.json) (immutable original M0
action set and deny precedence) remains byte-for-byte unchanged, and every v1
action is identical in v2. Historical `PolicyDecision` records continue to
resolve the exact version and manifest digest they captured.

## Physical records

### `curve_provider_connection`

`ProviderConnection` is a mutable workspace-scoped aggregate root using the
existing `WorkspaceScopedModel` fields. It adds:

| Column | PostgreSQL/Django representation | Constraint |
| --- | --- | --- |
| `provider_type` | bounded text | M0-S9A accepts only `FAKE_LOCAL` at the adapter registry boundary. |
| `adapter_key` | text, maximum 100 | `curve.fake-local` in M0-S9A; lowercase stable code. |
| `adapter_version` | text, maximum 100 | Exact implementation version used for validation. |
| `environment` | bounded text | `LOCAL` in M0-S9A. |
| `display_name` | text, maximum 255 | Human-readable only; never an authorization input. |
| `external_tenant_ref` | nullable text | Always null for `FAKE_LOCAL`. |
| `configuration_ref` | nullable JSON | Always null until protected storage is authorized. |
| `configuration_digest` | digest text | SHA-256 of adapter-validated canonical non-secret configuration. |
| `secret_reference` | nullable text | Database check requires null for `FAKE_LOCAL`. |
| `current_capability_id` | nullable UUID foreign key | Same-workspace immutable `ProviderCapability`; required in `ACTIVE` and `DEGRADED`. The wire projection serializes this field as `capability_document_ref` with resource type, ID, and capability version. |
| `allowed_classifications` | JSON array | Exactly `['INTERNAL']` for `FAKE_LOCAL`; array type, unique known values. |
| `status` | bounded text | `PENDING_VALIDATION`, `ACTIVE`, `DEGRADED`, `DISABLED`, or `REVOKED`. |
| `validated_at` | nullable timestamp | Required for `ACTIVE` and `DEGRADED`. |
| `validation_result_ref` | nullable JSON `ResourceRef` | Required for `ACTIVE` and `DEGRADED`; references the reconciliation Operation. |
| `last_reconciled_at` | nullable timestamp | Required for `ACTIVE` and `DEGRADED`. |
| `next_reconcile_at` | nullable timestamp | Required for `ACTIVE`; null for `DISABLED` and `REVOKED`. It is advisory until M0-S9B adds a scheduler. |
| `last_error` | nullable safe JSON | Required for `DEGRADED`; contains code/retryable only in M0-S9A. |

Database uniqueness is
`(workspace_id, environment, adapter_key)`. A workspace has at most one
connection for an exact adapter/environment pair. Display names and external
tenant labels are never global identity.

### `curve_provider_capability`

`ProviderCapability` is append-only immutable history:

| Column | PostgreSQL/Django representation | Constraint |
| --- | --- | --- |
| `id` | UUID primary key | Application generated. |
| `workspace_id` | UUID, indexed | Mandatory first repository predicate. |
| `connection_id` | UUID foreign key | References a connection in the same workspace. |
| `connection_version` | positive bigint | Exact connection version validated. |
| `capability_version` | positive bigint | Monotonic per workspace/connection. |
| `provider_type` | bounded text | Must equal the connection value. |
| `adapter_key`, `adapter_version` | bounded text | Exact adapter implementation observed. |
| `protocol_versions` | JSON array | Unique stable versions. |
| `capabilities` | JSON array | Closed name/risk/enabled/schema-reference records. |
| `allowed_classifications` | JSON array | Cannot exceed the connection's allowed classifications. |
| `observed_at`, `validated_at` | timestamps | Trusted service time, never provider-supplied authority. |
| `expires_at` | nullable timestamp | Null means no automatic expiry for the local fake; later adapters must decide freshness. |
| `created_at` | timestamp | Database receipt time. |

Database uniqueness is
`(workspace_id, connection_id, capability_version)`. Application code rejects
update/delete through the immutable repository. The connection's
`current_capability_id` changes only in the same transaction that accepts the
corresponding validation/reconciliation result.

## Adapter port

The Python boundary is a protocol implemented outside domain models:

```python
class ProviderAdapter(Protocol):
    adapter_key: str
    provider_type: str
    adapter_version: str

    def describe_capabilities(
        self, context: ProviderCallContext
    ) -> ProviderCapabilityObservation: ...

    def reconcile(
        self, context: ProviderCallContext, previous: ProviderObservationRef | None
    ) -> ProviderReconciliationObservation: ...
```

`ProviderCallContext` carries only workspace/connection IDs, the
`provider-registry` service actor, the initiating human effective principal from
the authorized receipt, `INTERNAL` classification, correlation/causation IDs, digest-only
idempotency reference, 15-second deadline, cancellation token, and pinned
policy/adapter versions. It contains no secret value or protected body.

The registry resolves an exact adapter key from a static code allowlist. Unknown
keys, duplicate registrations, provider-type mismatches, unsupported protocol,
or enabled non-`READ` fake capability fail before state mutation.

The normalized error taxonomy is `AUTHENTICATION`, `AUTHORIZATION`, `POLICY`,
`NOT_SUPPORTED`, `RATE_LIMIT`, `TRANSIENT`, `AMBIGUOUS_MUTATION`, and
`TERMINAL`. The fake adapter deterministically exposes fixtures for success,
transient failure, terminal failure, unsupported capability, and ambiguous
observation. It never opens a socket or reads the process environment.

## State machine

```mermaid
stateDiagram-v2
    [*] --> PENDING_VALIDATION: register
    PENDING_VALIDATION --> ACTIVE: validation succeeded
    PENDING_VALIDATION --> PENDING_VALIDATION: validation failed
    ACTIVE --> ACTIVE: reconciliation succeeded
    ACTIVE --> DEGRADED: reconciliation failed
    DEGRADED --> ACTIVE: reconciliation succeeded
    DEGRADED --> DEGRADED: reconciliation failed
    PENDING_VALIDATION --> DISABLED: disable
    ACTIVE --> DISABLED: disable
    DEGRADED --> DISABLED: disable
    DISABLED --> PENDING_VALIDATION: enable
    PENDING_VALIDATION --> REVOKED: revoke
    ACTIVE --> REVOKED: revoke
    DEGRADED --> REVOKED: revoke
    DISABLED --> REVOKED: revoke
    REVOKED --> [*]
```

`REVOKED` is terminal. Enabling a disabled connection returns it to
`PENDING_VALIDATION`; previous capability history remains immutable and cannot
make the connection active. Invalid transitions return a stable conflict and
write safe no-effect audit evidence. Successful reconciliation of an already
active connection is an accepted `ACTIVE` to `ACTIVE` transition. An exhausted
retry while already degraded is an accepted `DEGRADED` to `DEGRADED`
transition. Both advance the aggregate version and append exact result evidence.

## Command and transaction boundaries

### Register connection

One atomic application transaction:

1. Runs inside the existing `execute_authorized_mutation` policy-owned
   transaction using core policy v2 action
   `CURVE.PROVIDER_CONNECTION.REGISTER` against the locked existing
   `WORKSPACE` at policy resource version `1`. The authenticated human must have live active Plane workspace
   role `20` in that exact workspace. The trusted static registry supplies
   allowlisted target `curve.fake-local@1.0.0`. Caller-supplied roles and targets
   are rejected. The wrapper alone constructs the active receipt.
2. Requires `workspace_id`, exact fake adapter code/version, `LOCAL`, the
   authenticated human/effective principal, canonical empty configuration, raw
   idempotency key in memory, and correlation ID.
3. Computes and stores only digest material; rejects any secret/configuration
   body outside the adapter's closed empty-object schema.
4. Locks/creates the idempotency scope.
5. Writes `ProviderConnection(PENDING_VALIDATION)`, DomainEvent, OutboxEvent,
   AuditEvent, and completed IdempotencyRecord atomically.
6. Replays the original database `ResourceRef` for the same key/request digest;
   a changed request digest returns conflict with no domain/outbox effect.

Plane roles `15` and `5`, inactive membership, a membership in another
workspace, agent/service principals, non-`LOCAL` environments, non-`INTERNAL`
classification, and any target other than `curve.fake-local@1.0.0` fail before
the connection mutation. After registration, disable/enable/revoke/reconcile
commands use the unchanged
`CURVE.PROVIDER_CONNECTION.ADMINISTER` action against the persisted
workspace-scoped connection.

### Reconcile connection

Reconciliation has no database transaction around the adapter call:

1. The command transaction locks the workspace-scoped connection, rejects
   `DISABLED`/`REVOKED`, creates an `Operation(PROVIDER_RECONCILIATION)`, and
   commits its event/outbox/audit/idempotency records.
2. The application service calls the selected fake adapter outside the
   transaction with the 15-second context.
3. A result transaction locks the connection and Operation, verifies their
   expected versions and the observation's workspace/adapter coordinates,
   appends a new capability when the normalized document changed, transitions
   connection/Operation state, and writes DomainEvent/OutboxEvent/AuditEvent.
4. Byte-equivalent capability observations do not append duplicate capability
   history. The connection still records the successful reconciliation time
   and advances its aggregate version.
5. One reconciliation has a single 15-second monotonic deadline across all
   adapter attempts and permits at most three attempts. Only `RATE_LIMIT` and
   `TRANSIENT` are retryable while time remains. `AUTHENTICATION`,
   `AUTHORIZATION`, `POLICY`, `NOT_SUPPORTED`, `AMBIGUOUS_MUTATION`, `TERMINAL`,
   cancellation, and deadline exhaustion stop immediately. Exhausted retry
   moves an active connection to `DEGRADED` and keeps a degraded connection
   `DEGRADED`, recording only the safe taxonomy.
6. An ambiguous observation records conflict evidence and does not replace the
   current capability. No mutation is retried until explicit reconciliation.

M0-S9A exposes explicit application-service invocation only. On successful
reconciliation, `next_reconcile_at` is the trusted result-acceptance time plus
exactly 900 seconds. It is advisory for future consumers; no Celery, Temporal
schedule, cron, or network callback is activated by this contract.

## Local outbox/inbox delivery

The provider adapter call and event delivery are separate boundaries. Adapter
commands stay synchronous; the outbox transports only committed, local Curve
provider events. The provider delivery destination is exactly
`CURVE_PROVIDER_LOCAL_V1`, and its only consumer ID is exactly
`curve-provider-local-v1`. The existing Temporal relay never consumes this
destination.

Every accepted command or result transaction appends its DomainEvent,
OutboxEvent, AuditEvent, aggregate version, and idempotency outcome atomically.
After commit, the application service invokes one bounded local drain. Before
the next provider command is evaluated, the application service invokes the
same drain for previously due records. Both invocations are explicit call-stack
work; no process wakes independently.

One drain performs these steps:

1. Claim at most 10 due outbox rows for the current workspace and destination,
   using a 30-second lease and skip-locked selection.
2. For each event, attempt to insert an InboxMessage keyed uniquely by
   `(workspace_id, consumer_id, event_id)`.
3. If that inbox tuple already exists, acknowledge the outbox record without
   repeating the local consumer effect.
4. If local consumption succeeds, mark the inbox processed and the outbox
   delivered in a transaction.
5. If local consumption fails, release it for retry exactly five seconds later.
   After the third delivery attempt, move the outbox record to `DEAD_LETTER` and
   preserve safe failure metadata for inspection.

A process crash after the provider transaction commits and before the
post-commit drain leaves a durable pending outbox row. The next provider command
drains that row. With no later provider command, it remains visibly pending;
this local proof includes no background latency guarantee. A post-commit drain
failure never rolls back or changes the already committed provider-command
outcome.

## Events, audit, and telemetry

The exact event and local-delivery allowlists are defined by the
[M0-S9A provider-registry manifest](../providers/m0-s9a-provider-registry-v1.json)
(local authority, Option B registration authorization, lifecycle, synchronous
adapter, delivery, persistence, and event constants). Every
event payload contains safe identifiers, versions, states, and digests only.
Capability arrays remain in PostgreSQL/resource projections and are not copied
to generic logs or metrics.

M0-S9A reuses M0-08 (audit and observability foundation) correlation and
redaction. It may add bounded state/error-code attributes to existing operation
and audit instruments; it creates no high-cardinality provider, connection,
workspace, or capability label.

## Migration, rollback, and verification

The Plane implementation must provide:

1. One additive Curve feature migration named
   `0005_providerconnection_providercapability.py`, with
   `0004_policydecision_recorded_at_default.py` as its exact predecessor, for
   the two tables, indexes, foreign key, uniqueness, positive-version,
   fake-local, lifecycle, and JSON-array checks. The same migration replaces
   `curve_policy_identity_ck` with the backward-compatible identity constraint
   `policy_key = CURVE_CORE_POLICY AND policy_version IN (1, 2)`. The immutable
   PolicyDecision envelope remains schema version `1.0`, the model default
   remains policy version `1`, and policy version `3` or greater is rejected.
2. Forward to `0005`, backward to `0004`, and forward again to `0005` against disposable
   PostgreSQL. Persistent rollback uses feature disablement and leaves the
   additive tables intact until the rollback window closes.
3. Model/repository/service tests for immutable capability history, optimistic
   concurrency, uniqueness, state-required fields, workspace isolation, and
   `REVOKED` terminality.
4. Command-kernel tests for atomic event/outbox/audit/idempotency writes,
   duplicate replay, changed-digest conflict, result-version race, transaction
   rollback, and safe no-effect audit.
5. Adapter conformance tests for success, unsupported capability, transient,
   terminal, timeout/cancellation, ambiguity, unknown key, version mismatch,
   and proof that socket/environment/credential access is absent.
6. Local-delivery tests for post-commit draining, recovery at the next provider
   command, workspace/consumer/event deduplication, batch limit 10, 30-second
   lease expiry/reclaim, five-second retry eligibility, third-attempt
   `DEAD_LETTER`, destination isolation, and absence of Temporal/Celery/
   scheduler/background dispatch.
7. Full Plane backend, Curve frontend regression, `pnpm check`, `pnpm build`,
   migration drift, CodeQL, and copyright checks.

Rollback sets the Curve module/provider-registry feature off. Existing Plane
behavior, existing Celery workers, Temporal, and current Curve operations remain
unchanged. No down-migration runs against a persistent shared stack during
rollback.
