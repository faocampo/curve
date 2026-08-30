# M1-00A Product Core Relational Contract

## Document control

| Field | Value |
| --- | --- |
| Status | `HISTORICAL_V1 / MERGED_LOCAL_IMPLEMENTATION / CONFORMANCE_VARIANCE_OPEN`; R-027 (Product timestamp/schema-version contract reconciliation) remains undecided |
| Version | 1.1 |
| Date | 2026-08-29 |
| Work package | M1-00A (minimal Product core) |
| Owner and reviewer | Federico Ocampo (`faocampo`) |
| Applies to | Curve-owned PostgreSQL tables in the public Plane fork |

## Purpose and scope

This document preserves the v1 PostgreSQL representation and transaction
invariants dispatched for the minimum workspace-scoped Product required before
an Initiative can exist. It consumes the approved
[M1-00A decision](../governance/m1-00a-product-core-v1.json) (exact Product
identity, ownership, lifecycle, authorization, retirement, and M2 boundary),
the [Product schema](../schemas/product.schema.json) (wire representation and
state-dependent fields), and the
[Product policy](../policy/product-policy-v1.json) (human authority and archive
preconditions).

Roadmaps, Milestones, Features, Roadmap Items, schedules, snapshots, and their
tables remain M2 scope.

## Known implementation variance

The merged Plane implementation and this historical v1 contract differ in two
ways recorded by R-027 (Product timestamp/schema-version contract
reconciliation):

- migration `0006_product.py` persists an application-managed `schema_version` column
  with application default `1.0`, while the v1 table list below omitted it; and
- the Django model populates `created_at` and `updated_at` through application
  UTC using `auto_now_add` and `auto_now`, while the v1 contract specified
  trusted PostgreSQL time in UTC.

The [M1-00A physical-schema evidence](m1-00a-product-physical-schema-evidence-v1.json)
(commit-bound Product index attestation) and the
[implemented ERD](../../docs/technical/implemented-entity-relationship-model.md)
(observed Plane tables, fields, relationships, and migration boundary) record
the current physical result. They do not approve either R-027 alternative.
Exact relational conformance, production qualification, and any successor
Product persistence change remain fail closed until R-027 is decided and
closed. The table below intentionally retains the historical v1 target rather
than silently rewriting the dispatched contract.

## Table and column contract

The implementation adds one mutable aggregate table, `curve_product`, and uses
the accepted M0 `curve_domain_event`, `curve_outbox_event`,
`curve_idempotency_record`, and `curve_audit_event` tables for every mutation.

| Column | PostgreSQL representation | Null | Constraint or meaning |
| --- | --- | --- | --- |
| `id` | `uuid` | NO | Application-generated primary key. |
| `workspace_id` | `uuid` | NO | Opaque Plane workspace identity; first predicate in every query. |
| `key` | `varchar(50)` | NO | Immutable lowercase key matching `[a-z0-9][a-z0-9-]{0,49}`. |
| `name` | `varchar(255)` | NO | Required mutable human-visible name; empty string rejected. |
| `description` | `text` | YES | Optional mutable description; maximum 10,000 Unicode code points at the API boundary. |
| `timezone` | `varchar(255)` | NO | Explicit IANA timezone validated by `zoneinfo.ZoneInfo`; offsets and unknown zones rejected. |
| `state` | `varchar(16)` | NO | `ACTIVE` or `ARCHIVED`. |
| `owner_user_id` | `uuid` | NO | Exactly one active human owner. No hard Plane foreign key. |
| `version` | `bigint` | NO | Starts at 1 and increments exactly once per accepted mutation. |
| `created_at`, `updated_at` | `timestamptz` | NO | Trusted database time in UTC. |
| `created_by`, `updated_by` | `jsonb` | NO | Human `ActorRef` validated before persistence. |
| `archived_at` | `timestamptz` | YES | Required only while `ARCHIVED`. |
| `archived_by` | `jsonb` | YES | Human `ActorRef`; required only while `ARCHIVED`. |

Plane remains authoritative for workspace identity, membership activity, and
the numeric `ADMIN` role value `20`. Curve stores no duplicated membership
truth and creates no foreign key to Plane tables.

## Exact database constraints and indexes

| Name | Type | Expression |
| --- | --- | --- |
| `curve_product_workspace_key_uniq` | Unique | `(workspace_id, key)` |
| `curve_product_key_format_ck` | Check | `key ~ '^[a-z0-9][a-z0-9-]{0,49}$'` |
| `curve_product_name_nonempty_ck` | Check | `length(name) >= 1` |
| `curve_product_state_ck` | Check | `state IN ('ACTIVE', 'ARCHIVED')` |
| `curve_product_version_ck` | Check | `version >= 1` |
| `curve_product_archival_fields_ck` | Check | `ACTIVE` requires both archival fields null; `ARCHIVED` requires both non-null |
| `curve_product_workspace_state_key_idx` | Index | `(workspace_id, state, key)` |
| `curve_product_workspace_owner_state_idx` | Index | `(workspace_id, owner_user_id, state)` |

The released additive migration is `0006_product.py`, after provider migration
`0005_providerconnection_providercapability.py`. Its two query indexes are
present as physical `RunSQL` operations. R-027 determines whether a successor
additive migration is required for timestamp or schema-version conformance; it
does not require a successor migration for these two indexes.

## Authorization and membership checks

Every Product command accepts an authenticated human principal and re-resolves
one active Plane workspace membership inside the request boundary.

| Command | Required authority | Required target state | Additional precondition |
| --- | --- | --- | --- |
| Create | Active Plane workspace `ADMIN` (`20`) | None | Key unique; timezone valid; owner is the creating user. |
| Read/list | Active workspace member | `ACTIVE` or `ARCHIVED` | Cross-workspace IDs return the same `404` as absent IDs. |
| Update metadata | Current active Product owner or workspace `ADMIN` | `ACTIVE` or `ARCHIVED` | Expected version matches; request cannot contain key, owner, or state. |
| Archive | Workspace `ADMIN` | `ACTIVE` | Expected version matches; no non-terminal Initiative exists. |
| Restore | Workspace `ADMIN` | `ARCHIVED` | Expected version matches. |
| Reassign owner | Workspace `ADMIN` | `ACTIVE` or `ARCHIVED` | Target user has active membership in the same workspace. |

Agents, services, inactive memberships, caller-supplied role claims, and Product
ownership from another workspace never authorize these commands.

## Initiative guard contract

`READY_FOR_REPOSITORY_REVIEW` and `CANCELLED` are the only terminal R1
Initiative states. `FAILED` remains recoverable and therefore blocks archival.

The Product service consumes two narrow functions:

1. `list_product_initiative_states(workspace_id, product_id)` returns the
   authoritative Initiative states under the same database transaction.
2. `assert_product_accepts_new_initiative(workspace_id, product_id)` locks the
   Product and rejects any state other than `ACTIVE`.

Before the Initiative module is enabled, the registered Product implementation
returns an empty authoritative state set because no Initiative table or write
path exists. Enabling the Initiative module requires registering the database
guard in the same deployment. A missing or unavailable guard fails archive
closed with `PRODUCT_INITIATIVE_GUARD_UNAVAILABLE`.

## Command transactions

Every accepted Product mutation uses one `transaction.atomic()` boundary and
the existing digest-only idempotency kernel:

1. Resolve active Plane membership and normalized Product authority.
2. Compute and persist only the idempotency-key digest and canonical request
   digest.
3. For existing Products, select by `(workspace_id, id)` using
   `SELECT ... FOR UPDATE`; then compare `If-Match` with `version`.
4. Validate the command-specific state and membership preconditions. Archive
   also invokes the Initiative guard while the Product row is locked.
5. Apply one aggregate mutation and increment `version` once.
6. Append one `DomainEvent` with
   [Product event v1](../schemas/product-event-v1.schema.json) (creation,
   metadata, owner, archive, or restore payload).
7. Append the outbox destination, allowed audit event, and completed
   idempotency record whose `response_resource_ref` points to the Product.
8. Commit before returning the Product representation and ETag.

Denied or stale commands append only the policy decision and safe no-effect
audit required by the M0 kernel. They write no Product event, outbox row, or
successful idempotency replay.

## Timezone and historical behavior

Timezone validation uses Python `zoneinfo.ZoneInfo` against the runtime tzdata
available to the Plane API image. The deployment must record its Python/tzdata
versions. An update that changes timezone writes both old and new zone names in
`PRODUCT_METADATA_UPDATED`. It affects Product reads and future M2 local-date
interpretation only. It does not update prior events, activities, schedules,
snapshots, audit records, or timestamps.

## Lifecycle and deletion

R1 retirement is the reversible `ACTIVE -> ARCHIVED -> ACTIVE` lifecycle.
Archived Products remain addressable through the same read API and retain the
same immutable key and owner. Initiative creation calls the Product acceptance
guard and fails with `PRODUCT_ARCHIVED` while archived.

No Product delete route, cascade, tombstone, or destructive migration exists in
M1-00A. Workspace deletion remains governed by the workspace and retention
contracts.

## Verification obligations

The historical v1 dispatch required the Plane implementation to prove:

1. Forward, reverse-to-prior, and forward-again migration behavior on a
   disposable PostgreSQL database before shipment.
2. Workspace/key uniqueness under concurrent create, database key/state/archive
   checks, and optimistic-version races.
3. Exact human authorization for create, metadata update, archive, restore, and
   reassign, including inactive and cross-workspace denials.
4. Valid and invalid IANA timezones, prospective event fields, and no historical
   row rewrite.
5. Archive allow for terminal-only Initiative sets; block for every non-terminal
   state and unavailable guard.
6. Archived historical read and new-Initiative rejection.
7. Atomic Product/event/outbox/audit/idempotency commit, rollback, and replay.
8. OpenAPI and JSON Schema conformance plus full Plane regression commands.

The recorded local verification satisfies the functional cases above for the
merged implementation. It does not establish exact conformance for the two
R-027 variances or grant production qualification.
