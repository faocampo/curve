# Roadmap domain candidate contract

Status: `CANDIDATE / CONTRACT_VALIDATION_ONLY / RUNTIME_PENDING`.

This candidate starts M2-01 (roadmap planning domain). It consumes the
[Product persistence successor](../../database/product-application-enforcement-successor.md)
(application UTC, format enforcement and immutable historical evidence) and the
[product requirements](../../../docs/curve-ai-native-sdlc-prd.md)
(roadmap cardinality, schedules, progress and movement history). The
[domain model](../../../docs/technical/domain-model.md)
(common attribution, protected bodies, canonical Milestone types and history)
defines the logical record fields. The
[task catalog](../../../docs/technical/m1-m7-task-packets.md)
(M2 delivery boundaries) retains its other dependency and qualification gates.

## Records and validation scope

The [conformance graph schema](graph.schema.json) (closed candidate record shapes)
contains Roadmaps, Milestones, Features and Roadmap Items in one complete
workspace/Product scope. It is a contract-test input, not a new API endpoint,
export or published roadmap snapshot. The
[synthetic fixture](graph.valid.json) (one proposed item and two Milestones)
contains fictional example data only.

The [semantic validator](../../../scripts/lib/roadmap-domain.mjs)
(relationship, schedule and declared-progress rules) validates record shape
before cross-record relationships. The [tests](../../../scripts/tests/roadmap-domain.test.mjs)
(positive, isolation and invalid-state cases) run through the standard project
test command. Validating a graph does not prove current membership, approval
authority, transaction safety or persistence. The runtime must load authoritative
records in one consistent transaction after authorization.

| Entity | Identity and relationships | Candidate representation |
| --- | --- | --- |
| Roadmap | One Product; one active human Roadmap owner | Name, owner, optional horizon dates, common aggregate fields |
| Milestone | One Roadmap in the same workspace/Product | Name, canonical type, optional target dates, integer ordering position |
| Feature | Reusable capability belonging to one Product | Name, optional protected description reference, common aggregate fields |
| Roadmap Item | One Roadmap, current Milestone, Feature and defining Initiative | Scope, owner, status, priority, confidence, health, dates, progress, approved PRD reference |

All mutable records carry an immutable UUID, workspace/Product identity,
application-owned `schema_version = 1.0`, positive aggregate version and
application-generated UTC timestamps, human creator/updater attribution, and
nullable tombstone attribution. The existing wire name `version` represents the
domain model's logical `aggregate_version`. Creation time and actor are preserved
on mutation; a tombstone requires its actor and rationale. Tombstone record
shape supplies no deletion-command authority.
Clock rollback may make update time earlier than creation time; aggregate
version establishes command order. Request schemas must omit caller-owned
identity, edition and timestamp fields rather than reuse record schemas.

## Product invariants

- A Feature may appear in several Milestones, but at most once per Milestone.
- Each Initiative defines at most one Roadmap Item. Runtime creation must also
  establish the reciprocal Initiative mode/item binding atomically.
- All relationships resolve within the same workspace and Product. An item
  cannot use a Milestone from another Roadmap.
- Only PROPOSED items may be unscheduled. A schedule has both inclusive dates,
  with start no later than end, interpreted in the Product's IANA timezone.
- COMMITTED items require an exact approved PRD revision reference. Runtime
  checks must prove that the revision belongs to the defining Initiative and
  has the required current Product approval; UUID shape alone proves neither.
- Status, priority, confidence and health use the PRD's enumerated values.
  They are independent of task-derived Execution Completion.
- Only the Roadmap owner may change declared progress. Every accepted update
  retains percentage, note, actor and timestamp. A decrease or change of at
  least 20 percentage points requires a non-whitespace note.

## Representation choices in this candidate

The Milestone type labels are the domain model's `RELEASE_VERSION`,
`CALENDAR_PERIOD`, `PRODUCT_OUTCOME` and `INTERNAL_DEVELOPMENT_PHASE`. Ordering uses non-negative integer positions unique
within each Roadmap; gaps are permitted. Reordering must be atomic and use a
Roadmap version precondition. Integer ranking is a candidate implementation choice for the domain model's
ordered scalar. Optional Roadmap horizons and Milestone target windows may have
one date; when both are present, start cannot follow end.

Name length is bounded at 255 characters; progress notes are bounded at 10,000
characters, following existing Product text limits. Item `scope_body` and optional
Feature description use protected `RichTextRef` metadata, never inline prose.
The reference binds object ID, digest, byte size, media type and editor schema
version; the runtime separately checks workspace scope, accessibility and
immutable object identity. `defining_initiative_id` and `approved_prd_version_id`
retain the domain model's exact names. The
complete runtime contract must define metadata editing, ownership transfer,
archival, state transitions, command payloads and policy receipts before those
commands become available. This candidate does not invent an active permission
grant from the presence of an owner field.

## Persistence and movement requirements

The [relational candidate](RELATIONAL.md) (tables, scoped constraints,
reciprocal Initiative linkage, history and transaction protocol) specifies the
database implementation boundary. Its migration and native runtime tests remain
pending.

Additive persistence must preserve the released migration sequence and historical
catalog/source qualification. Use scoped uniqueness for aggregate identity,
Feature/Milestone placement and defining Initiative. Relationship checks must
be enforced under locks and appropriate relational constraints, including
concurrent creation and movement. Validate supported format editions before
reads, mutations and successful replay responses.

An accepted command increments the affected aggregate version once and appends
its event, outbox, command evidence and audit in the same transaction. Denied,
stale, invalid and conflicting commands preserve authoritative state with the
specified no-effect audit. Successful replay returns the original command
outcome without repeating mutation or movement history.

Movement history is append-only and binds the Roadmap Item, previous and new
Milestones, actor, application UTC time, rationale and expected schedule impact.
The move validates the destination scope and Feature uniqueness before changing
the current Milestone. Failure at any event, outbox or history step rolls back
the full command. Current membership and Roadmap authority must be reevaluated
for every command; a valid conformance fixture cannot grant either.

## Progress and movement delta conformance

The schema also defines closed `PROGRESS_CHANGED` and `MILESTONE_MOVED`
append-only history records. Each binds item identity, workspace/Product,
per-item sequence, before/after aggregate versions, actor, UTC recording time
and the exact changed fields. Movement additionally requires rationale and
expected schedule impact. Progress includes previous/current percentage and note.

`validateRoadmapItemChange` (pure state/history delta validation) compares two
complete authorized graphs and one proposed history record. It requires one
version and history-sequence increment, current Roadmap owner attribution,
unchanged creation fields, exact before/after values and preservation of every
unrelated field and aggregate. Both graphs must satisfy the relationship and
schedule rules. Clock rollback is allowed; the sequence establishes order.

These checks detect stale or mismatched proposed evidence. Native tests must
still prove atomic history insertion, uniqueness under races, idempotent replay
without a second append, rollback and fresh membership. Scope, schedule, status,
owner, health and priority history types remain to define before those commands
are exposed. This candidate never treats a valid transition as a persisted one.

## Remaining delivery

1. Validate the relational candidate and complete command and policy contracts,
   including exact Initiative linkage and retained movement/progress records.
2. Implement additive persistence and the narrow catalog/source qualification
   successor, then prove preservation with native database tests.
3. Implement scoped services and routes, testing revoked membership, concurrent
   outcomes, replay, rollback and current approval linkage end to end.
4. Deliver M2-02 (Feature Delivery linkage), M2-03 (Plane completion projection),
   M2-04 (portfolio UX) and M2-05 (immutable snapshots) under their own scopes.
   The [experience blueprint](../../../docs/technical/curve-experience-blueprint.md)
   (prototype and screen acceptance) applies before material roadmap UI changes.

This contract supplies no provider activation, historical import, production
qualification or deployment authority. Adopted organization policy and human
approval identities remain in the private authority source.
