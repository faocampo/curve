# Roadmap domain candidate contract

Status: `CANDIDATE / CONTRACT_VALIDATION_ONLY / RUNTIME_PENDING`.

This candidate starts M2-01 (roadmap planning domain). It consumes the
[Product persistence successor](../../database/product-application-enforcement-successor.md)
(application UTC, format enforcement and immutable historical evidence) and the
[product requirements](../../../docs/curve-ai-native-sdlc-prd.md)
(roadmap cardinality, schedules, progress and movement history). The
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
| Roadmap | One Product; one active human Roadmap owner | Name, owner, common aggregate fields |
| Milestone | One Roadmap in the same workspace/Product | Name, type, integer ordering position |
| Feature | Reusable capability belonging to one Product | Name, common aggregate fields |
| Roadmap Item | One Roadmap, current Milestone, Feature and defining Initiative | Scope, owner, status, priority, confidence, health, dates, progress, approved PRD reference |

All mutable records carry an immutable UUID, workspace/Product identity,
application-owned `schema_version = 1.0`, positive aggregate version and
application-generated UTC timestamps. Creation time is preserved on mutation.
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

The Milestone type labels are `RELEASE`, `CALENDAR_PERIOD`, `PRODUCT_OUTCOME`
and `INTERNAL_PHASE`. Ordering uses non-negative integer positions unique
within each Roadmap; gaps are permitted. Reordering must be atomic and use a
Roadmap version precondition. These wire labels and ordering mechanics are
candidate implementation choices derived from the PRD's four types and ordered
Milestones. They do not change the product requirements.

Name length is bounded at 255 characters; item scope and progress notes are
bounded at 10,000 characters, following existing Product text limits. The
complete runtime contract must define metadata editing, ownership transfer,
archival, state transitions, command payloads and policy receipts before those
commands become available. This candidate does not invent an active permission
grant from the presence of an owner field.

## Persistence and movement requirements

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

## Remaining delivery

1. Complete relational, command and policy contracts, including exact Initiative
   linkage and retained movement/progress records.
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
