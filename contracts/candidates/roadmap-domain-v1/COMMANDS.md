# Roadmap command candidate

Status: `CANDIDATE / NORMALIZED_INPUT_VALIDATION / RUNTIME_PENDING`.

The [command schema](command.schema.json) (closed action-specific inputs) and
[semantic validator](../../../scripts/lib/roadmap-domain.mjs)
(scope, target, version and business preconditions) describe normalized command
input. An adapter derives workspace, Product and target from the authorized
route and expected version from the concurrency header. These fields are
compared with the loaded scope. Payloads contain no actor, role, policy receipt,
idempotency key, creation timestamp, format edition or approval authority.

The wire edition of this candidate envelope is
`curve.roadmap-command/v1-candidate`. It is a testable internal contract; no
HTTP routes are activated by this schema. The runtime uses the existing digest
and idempotency kernel, authorization receipts and stable Problem Details.

## Actions and target versions

| Action | Target and expected version | Payload |
| --- | --- | --- |
| CREATE_ROADMAP | Scoped Product; null expected version; lock and validate Product | Name and optional horizon dates |
| UPDATE_ROADMAP | Roadmap and its exact version | Name and optional horizon dates |
| CREATE_MILESTONE | Parent Roadmap and its exact ordering version | Name, canonical type, unoccupied position and optional target dates |
| UPDATE_MILESTONE | Milestone and its exact version | Name, canonical type and optional target dates |
| REORDER_MILESTONES | Roadmap and its exact ordering version | Every active Milestone ID exactly once, in the requested order |
| CREATE_FEATURE | Scoped Product; null expected version; lock and validate Product | Name and optional protected description reference |
| CREATE_ROADMAP_ITEM_INITIATIVE | Roadmap and its exact version | Initiative draft fields, exactly two reviewer assignments, Feature/Milestone, protected scope reference, priority/confidence/health and optional paired dates |
| UPDATE_FEATURE | Feature and its exact version | Name and optional protected description reference |
| RECORD_PROGRESS | Item and its exact version | Percentage and note |
| MOVE_ITEM | Item and its exact version | Destination Milestone, rationale and expected schedule impact |
| UPDATE_ITEM_SCHEDULE | Item and its exact version | Both inclusive dates or the permitted unscheduled pair, plus rationale |
| UPDATE_ITEM_SCOPE | Item and its exact version | Protected scope-body reference and rationale |
| UPDATE_ITEM_PRIORITY | Item and its exact version | Canonical priority and rationale |
| UPDATE_ITEM_HEALTH | Item and its exact version | Canonical health and rationale |
| UPDATE_ITEM_CONFIDENCE | Item and its exact version | Canonical confidence and rationale |
| SET_ITEM_STATUS | Item and its exact version | Canonical status, exact approved PRD version when required, and rationale |

Payloads are complete action-specific values, not arbitrary JSON merge patches.
Unknown fields/actions and missing expected versions reject before mutation.
An unavailable target includes absent and tombstoned records; resource errors
must not reveal whether an unauthorized cross-workspace target exists.

Roadmap ordering is a parent invariant. Creating or reordering Milestones
increments the Roadmap ordering version once and records its history; new
Milestones start at version 1. Existing Milestones whose positions change also
advance their own versions with attribution in the same transaction. An exact
parent version and lock protect the complete ordering set from concurrent
creation/reorder. A position-only reorder is distinct from metadata updates.

## Required semantic checks

The complete before-graph must pass the [record contract](README.md)
(relationships and scheduling) before a proposed command is evaluated.
Creation targets the scoped Product. Every other target must be live and have
the expected aggregate version. Product availability, active membership and
protected access require independent runtime evaluation.

Reordering rejects missing, duplicate or foreign Milestones. A move rejects a
missing, retired, same or other-Roadmap destination and a destination already
containing the Feature. Progress changes enforce the note threshold. Item
schedules reject half-filled dates, reversed windows and unscheduling outside
PROPOSED. Optional Roadmap horizons and Milestone targets permit a single date,
but enforce order when both exist. Names and required rationale/impact text
cannot consist solely of whitespace.

SET_ITEM_STATUS validates the requested status shape and scheduling preconditions.
COMMITTED additionally requires a PRD version reference. The runtime must prove
current approval and access for that exact defining Initiative and subject;
neither a syntactically valid reference nor a caller's status choice approves a
document. The complete status-transition and scope-supersession policy must be
qualified before this action is exposed. Work-item completion and PR state never
automatically call this command.

## Authority and ownership

The product/domain requirements already assign Roadmap and Item changes to the
current Roadmap owner, Feature changes to Product contributors, and protected
reads to members with object/source access. These are runtime-resolved roles;
client role strings and synthetic fixture owners grant no authority. Agents
and services cannot impersonate a human Roadmap owner or document approver.

The exact setup policy for Roadmap creation, initial ownership, reassignment
and mapping Product contributors into the current access system is a separate
candidate decision. Its owner choice is pending; it is not inferred from the
approved D-013 Product ownership decision. Commands requiring those mappings
must remain unavailable until the selected policy and its tests are integrated.
Roadmap ownership supplies no Product/Technical document approval assignment.

## Roadmap-backed Initiative creation

The integrated Plane Initiative command at
`e221b11664440ed455166af9f5ea6d4172a17b6c` explicitly rejects ROADMAP mode in
`initiative_services.py` (manual Initiative command implementation). An additive
successor must introduce a scoped creation command that validates Product,
Roadmap, Milestone, Feature, intended scope and the current two-stage reviewer
assignments, then inserts the Initiative/Item pair in one transaction. IDs are
generated by the service; a client cannot connect arbitrary existing identities
by setting a UUID field. Both directions of the deferred constraints must pass
at commit. Failure preserves the original rows and command history.

The normalized CREATE_ROADMAP_ITEM_INITIATIVE input binds the parent Roadmap
version and exactly one PRD_APPROVAL and PLAN_APPROVAL assignment. STANDARD and
HIGH risk require distinct humans, matching the installed normalization rule;
LOW risk may use the same human for both responsibilities. Runtime validation
must resolve both as current active, non-bot workspace members. Assignment order
is normalized before hashing. No CODE_READINESS assignment is accepted on this
new command, and no legacy three-assignment replay path is introduced.

The service creates an Initiative in DRAFT with mode ROADMAP, schema edition
1.2 and the approved two-stage assignments, plus an Item in PROPOSED with zero
declared progress, an empty progress note and no approved PRD reference. The
caller cannot supply either identity, reciprocal pointer, state, actor or
approval result. The Roadmap owner supplies the Item owner under the selected
ownership policy. Case-insensitive Initiative keyword uniqueness and both
generated IDs participate in the original command receipt and transaction.
Optional dates must be both present or both null; Feature placement must be
available. The existing local Markdown Initiative description format is retained
with its 20,000-character limit, independently of the Item's protected scope
reference. Scope-object authorization remains a separate runtime precondition.

This joint creation runtime remains to implement and qualify alongside the
[relational candidate](RELATIONAL.md) (composite references and transaction
protocol). Existing STANDALONE commands, historical schema editions and reviewer
evidence remain unchanged. M2-02 (delivery identity) separately owns conversion,
classification-removal authority and complete Feature Delivery behavior.

## History, replay and no-effect outcomes

Every accepted command binds its exact policy decision, actor, expected versions,
request digest, result identity/version, domain event, outbox and audit. Item
mutations append exactly one typed history record. Progress and movement delta schemas are closed. The separate
[metadata history contract](ITEM-METADATA-HISTORY.md) (priority, health,
confidence and schedule deltas) defines four more candidate types. Their native
constraint successor is integrated; command-writer qualification remains pending. Scope, status and owner
history must be defined before their commands can execute. Hierarchy creation and metadata changes require
their own exact event schemas.

Reuse the installed idempotency kernel. Conflicting payload reuse rejects;
successful replay rechecks current access and returns the retained outcome
without a second history append or version increment. A stale version on a new
key rejects without mutation. The original key's successful replay must be
resolved using its exact command receipt, rather than rejected merely because
that original command advanced the version. Membership revocation takes
precedence over returning retained protected results.

The conformance validator checks proposed inputs against a supplied current
graph. It does not implement replay or claim transaction acceptance. Native
tests must verify replay ordering, concurrent duplicate keys, revoked access,
commit-time relationship failures, event/outbox rollback and history uniqueness.
