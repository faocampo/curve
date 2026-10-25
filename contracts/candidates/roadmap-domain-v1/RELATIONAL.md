# Roadmap domain relational candidate

Status: `CANDIDATE / MIGRATION_AND_RUNTIME_PENDING`.

This design implements the [roadmap contract](README.md) (records, history and
conformance scope) against the [domain model](../../../docs/technical/domain-model.md)
(aggregate ownership and reciprocal relationships), using the
[Product persistence successor](../../database/product-application-enforcement-successor.md)
(application UTC and service-owned format editions). It requires native database
qualification before any implementation claim.

## Common aggregate storage

Each new aggregate has UUID `id`, `workspace_id` and `product_id`; application
edition `schema_version varchar(20)` with default `1.0`; `version bigint` with
default 1 and check `version >= 1`; application-managed `created_at` and
`updated_at timestamptz`; `created_by` and `updated_by jsonb`; and nullable
`tombstoned_at timestamptz`, `tombstoned_by jsonb`, `tombstone_reason text`.
The service validates closed human actor references. A check requires all
tombstone fields null or all present with non-whitespace rationale. Timestamp
order is not constrained, because aggregate versions survive clock rollback.

Every aggregate has a primary key on `id`, a scoped unique key on
`(workspace_id, product_id, id)`, and a composite reference from
`(workspace_id, product_id)` to Product `(workspace_id, id)`. Foreign-key deletion
uses `NO ACTION`; no cascade erases Curve history. Edition equality belongs to
the service/API boundary under the approved persistence convention.

## Tables and constraints

| Table | Additional columns | Required constraints |
| --- | --- | --- |
| `curve_roadmap` | `name varchar(255)`, `owner_user_id uuid`, nullable `horizon_start date`, `horizon_end date` | Non-whitespace name; dates ordered when both present |
| `curve_milestone` | `roadmap_id uuid`, `name varchar(255)`, `type varchar(32)`, `position bigint`, nullable `target_start date`, `target_end date` | Canonical type enum; nonnegative position; unique `(workspace_id, roadmap_id, position)`; optional dates ordered |
| `curve_feature` | `name varchar(255)`, nullable `description jsonb` | Non-whitespace name; closed protected rich-text reference validated before writes |
| `curve_roadmap_item` | `roadmap_id`, `milestone_id`, `feature_id`, `defining_initiative_id`, `owner_user_id` UUIDs; `scope_body jsonb`; status/priority/confidence/health codes; nullable planned dates and `approved_prd_version_id uuid`; `declared_progress integer`; `progress_note text` | Canonical enums; progress 0–100; paired dates ordered; only PROPOSED may be unscheduled; COMMITTED requires an approved-version reference; scoped Feature/Milestone and defining-Initiative uniqueness |

Milestone references Roadmap through `(workspace_id, product_id, roadmap_id)`.
It adds a unique key on `(workspace_id, product_id, roadmap_id, id)` so an Item's
Milestone reference also binds its Roadmap. Item references Feature through
`(workspace_id, product_id, feature_id)` and Milestone through
`(workspace_id, product_id, roadmap_id, milestone_id)`. Unique
`(workspace_id, milestone_id, feature_id)` prevents duplicate placement even
under concurrent transactions. Unique `(workspace_id, defining_initiative_id)`
enforces one Item per Initiative.

The physical `owner_user_id` maps to a human `owner` wire reference. The service
resolves current Plane membership; no duplicated membership table or cached
role authorizes a command. An Item's owner must match its current Roadmap owner.
Ownership transfer must atomically preserve this invariant and append its
required history before that command can be exposed.

## Reciprocal Initiative linkage

The existing Initiative already contains Product, mode and nullable
`roadmap_item_id`. New persistence must enforce both directions at commit:

1. An Item's defining Initiative shares workspace/Product, is in ROADMAP mode,
   and points back to that same Item.
2. Every ROADMAP Initiative points to exactly one existing Item that defines it.
   STANDALONE retains its null association.

Use additive scoped unique keys and `DEFERRABLE INITIALLY DEFERRED` composite
foreign keys binding `(workspace_id, product_id, initiative_id, item_id)` in both
directions. The existing mode/association shape constraint remains intact. The
transaction may insert either half first, but cannot commit a half-link,
cross-Product link or mismatched reciprocal pair. Native tests must exercise
both insert orders, updates, concurrent duplicates and rollback at commit.

Inspect existing records before adding these constraints. A preexisting invalid
ROADMAP association stops migration qualification and is reported without
publishing protected IDs. It must not be repaired by inventing imported history
or deleting records. Any required repair has its own reviewed preservation plan.

## Append-only Item history

`curve_roadmap_item_history` stores UUID identity, workspace/Product, item UUID,
positive per-item `sequence`, change type, before/after aggregate versions,
closed before/after JSON payloads, application UTC `recorded_at`, human
`recorded_by`, and change-specific rationale/schedule impact. Use a composite
item foreign key and unique `(workspace_id, roadmap_item_id, sequence)`.

History insertion requires the same accepted command transaction as the Item
update. It must use the existing policy receipt and event/outbox/audit paths.
Block UPDATE, DELETE and TRUNCATE of historical records using the established
append-only database enforcement pattern. A history sequence is independent of
wall-clock ordering. One accepted Item mutation appends one corresponding
history record; replay appends none. Reads return sequence order.

The [history schema](graph.schema.json) (closed progress/movement payloads)
currently specifies PROGRESS_CHANGED and MILESTONE_MOVED. Other mutation types
must receive exact payload schemas and conformance cases before their commands
are available. General unvalidated JSON cannot substitute for that contract.

## Transaction and replay protocol

1. Resolve the authenticated human, current workspace membership, enabled
   workspace and current scoped resource authority. Authorization precedes
   protected record serialization or object-body resolution.
2. Reuse the existing canonical command digest and idempotency kernel. The key
   binds operation/resource/payload; a key reused for another payload conflicts.
   Raw keys and protected body text stay out of ordinary logs and events.
3. Preserve the installed mutation boundary's workspace-row lock first. Existing
   Initiative mutations then load/lock Initiative before their Product guard;
   Product mutations load Product after the same workspace lock. New joint
   creation and roadmap commands must acquire that workspace lock before any
   aggregate lock, then use the established Initiative/Product order followed
   by Roadmap and affected Milestones/Items in UUID order. Re-resolve owner
   authority after locking and compare expected versions. Native concurrency
   tests must verify this interaction; changing to Product-first locks while
   bypassing the workspace boundary is not part of this candidate.
4. Validate active scope, supported editions, reciprocal Initiative binding,
   exact approved PRD version when required, protected references, dates and
   destination Feature uniqueness. Current approval access is checked against
   the immutable approved subject, not merely UUID equality.
5. Apply one accepted mutation and increment its version once; preserve creation
   time and actor. Append history, domain event, outbox, command evidence and
   audit atomically. Roll back all authoritative changes on any failure.
6. Return only after commit. Successful replay reauthorizes using current
   membership and returns the retained original outcome without incrementing
   versions or appending movement/progress history. Unavailable or inaccessible
   current resources fail safely under the reviewed replay contract.

The pure delta validator covers proposed state/evidence consistency. Native
transaction, membership, replay and constraint tests remain mandatory.

## Migration and rollout qualification

Choose the next migration number from the live integration head; preserve all
released migration bytes. Introduce exact catalog/source qualification successors
for the new tables, scoped constraints, immutable-history enforcement and writer
inventory. Current Product, two-stage review and earlier proof pins retain their
original bytes and scope. Unknown writers or unqualified catalog deltas fail.

Test fresh installation and upgrade with populated synthetic Product/Initiative
records, then compare preserved row and historical-proof contents. Disable the
new routes on failure and retain data for diagnosis. Reverse only an unused
additive migration under the existing reviewed policy; retained roadmap or
history records prevent destructive reversal. Production rollout and protected
storage activation require their own evidence.
