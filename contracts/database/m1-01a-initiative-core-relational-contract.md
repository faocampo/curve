# M1-01A Initiative Core Relational Contract

## Contract status

| Field | Value |
| --- | --- |
| Status | `IMPLEMENTATION_BASELINE` |
| Version | 1.0 |
| Date | 2026-08-29 |
| Scope | Local-only Initiative aggregate, assignments, commands, audit, and outbox |
| Data boundary | Synthetic `INTERNAL` data; protected bodies disabled |

## Tables

### `curve_initiative`

| Column | Type | Null | Rule |
| --- | --- | --- | --- |
| `id` | UUID | No | Primary key. |
| `workspace_id` | UUID | No | Plane workspace foreign key and first scope key. |
| `product_id` | UUID | No | Same-workspace Curve Product; Product state must be `ACTIVE` at creation and refinement acceptance. |
| `mode` | varchar(16) | No | Schema supports `ROADMAP` and `STANDALONE`; M1-01A accepts only `STANDALONE`. |
| `roadmap_item_id` | UUID | Yes | Null in M1-01A. |
| `keyword` | varchar(50) | No | Case-preserving display value; database uniqueness uses a lowercased expression within workspace. |
| `title` | varchar(255) | No | Non-blank. |
| `description` | JSON | No | Closed `{schema_version, format, body}` document; M1-01A permits bounded synthetic `INTERNAL` Markdown only. |
| `risk_tier` | varchar(16) | No | `LOW`, `STANDARD`, or `HIGH`. |
| `state` | varchar(40) | No | M1-01A reachable states are `DRAFT`, `ALIGNING`, `PAUSED`, and `CANCELLED`. |
| `paused_from_state` | varchar(40) | Yes | Required exactly while paused; only `DRAFT` or `ALIGNING`. |
| `workflow_version_id` | UUID | Yes | Null in `DRAFT`; pinned built-in version required in `ALIGNING`. |
| `creator_id` | UUID | No | Same-workspace active human member at creation. |
| `first_external_resource_at` | timestamptz | Yes | Must remain null in M1-01A. |
| `version` | bigint | No | Starts at 1 and increments once per successful command. |
| `created_at`, `updated_at` | timestamptz | No | UTC instants. |
| `updated_by_id` | UUID | No | Attributable active human. |

Constraints include `version >= 1`, closed state/risk/mode values, standalone
roadmap nullity, paused-field consistency, and workflow-field consistency.
`UNIQUE(workspace_id, lower(keyword))` provides case-insensitive workspace
uniqueness. Every lookup and mutation begins with `workspace_id`.

### `curve_gate_assignment`

| Column | Type | Null | Rule |
| --- | --- | --- | --- |
| `id` | UUID | No | Primary key. |
| `workspace_id`, `initiative_id` | UUID | No | Both are explicit; initiative lookup is workspace-scoped. |
| `gate_type` | varchar(32) | No | One of the three mandatory gate types. |
| `approver_id` | UUID | No | Same-workspace active human. |
| `valid_from`, `valid_until` | timestamptz | No/Yes | M1-01A creates non-expiring initial assignments. |
| `delegation_reason` | text | Yes | Null for initial assignments; delegation remains later Gate scope. |

`UNIQUE(workspace_id, initiative_id, gate_type)` enforces one active initial
assignment of each type. M1-01A does not expose reassignment or delegation.
STANDARD and HIGH creation requires three distinct `approver_id` values; LOW
may overlap. The command service validates active membership under row locks.

## Atomic command boundary

Create and every mutation run in one database transaction that locks the
Initiative and any policy inputs, applies optimistic concurrency, and writes:

1. the Initiative and assignment mutation;
2. one durable DomainEvent with the Initiative event v1 payload;
3. one local outbox event addressed to `CURVE_DOMAIN_LOCAL_V1`;
4. one redacted immutable AuditEvent and PolicyDecision; and
5. one completed digest-only IdempotencyRecord with `ResourceRef` replay.

A denial or failed precondition writes no Initiative, assignment, DomainEvent,
outbox, or idempotency-completion row. Safe denial audit follows the accepted M0
policy boundary.

## Migration and rollback

The Plane implementation uses additive migration
`0007_initiative_gateassignment.py`, after accepted Product migration `0006`.
The migration creates no seed Initiative, modifies no Plane table, and performs
no data migration. Reverse migration is permitted only in the disposable local
proof. After data exists, rollback disables Curve and preserves rows pending a
compensating additive migration.
