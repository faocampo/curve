# Roadmap Item metadata history candidate

Status: `CANDIDATE / STORAGE_INTEGRATED / COMMANDS_PENDING`.

The [metadata schema](item-metadata-history.schema.json) (closed priority, health,
confidence and schedule records) extends the [command candidate](COMMANDS.md)
(action inputs and runtime prerequisites) without changing the existing
[graph schema](graph.schema.json) (record shapes and progress/movement history).
Each metadata record uses the common history attribution, item identity, scope,
sequence and before/after version fields. It adds a nonblank rationale and exact
before/after projections of the affected fields.

| Command | History type | Before and after fields |
| --- | --- | --- |
| UPDATE_ITEM_PRIORITY | PRIORITY_CHANGED | priority |
| UPDATE_ITEM_HEALTH | HEALTH_CHANGED | health |
| UPDATE_ITEM_CONFIDENCE | CONFIDENCE_CHANGED | confidence |
| UPDATE_ITEM_SCHEDULE | SCHEDULE_CHANGED | planned_start and planned_end |

`validateRoadmapItemMetadataChange` in the [semantic validator](../../../scripts/lib/roadmap-domain.mjs)
(pure candidate delta checks) requires valid complete before/after graphs, the
current supplied Roadmap owner as recorder/updater, one aggregate-version and
history-sequence increment, and exact before/after values. It preserves all
unrelated Item fields, approval references, creation attribution and other
aggregates. Rationale has the existing 10,000-character limit and must contain
non-whitespace text. Clock rollback remains valid; sequence/version order binds
the change independently of wall-clock order.

A schedule always carries both dates or both null values. Only a PROPOSED item
may remove its schedule. Date order and calendar validity follow the existing
record contract. Metadata history carries no inline document content, permission
receipt or approval result. A value repeated in a new accepted command follows
the same exact-delta rules; replay/no-effect policy still belongs to the command
service and cannot be inferred from a matching value.

The [tests](../../../scripts/tests/roadmap-item-metadata-history.test.mjs)
(valid deltas, tampering, wrong actor/scope, versions, calendar boundaries and
preservation) also prove the existing progress/movement entry point rejects these
new types. The new schema references existing enum/field definitions, preserving
their constraints without copying a second set of values.

## Native implementation prerequisite

The merged [storage implementation](../../../docs/technical/roadmap-storage-integration.md)
(exact tested persistence subjects and retained limitations) now accepts all four
metadata types through [Plane PR #50](https://github.com/faocampo/plane/pull/50)
(additive history constraint and qualified catalog/runtime successor). The original
storage migration, schema and coverage bytes remain unchanged. The successor
preserves existing history and refuses reversal when metadata rows would become
unsupported. Storage acceptance alone does not enforce the closed semantic payload
or authorize a command; those remain runtime service obligations.

A runtime service must still check current membership, ownership, Product and
parent availability, protected object access, exact expected version, replay,
transactional history/event/outbox/audit and rollback under races. No service,
route, ownership policy or permission is enabled by this conformance validator.
Scope, status and owner changes retain separate approval and policy dependencies.
