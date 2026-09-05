# Records closure and retention eligibility

## Status and boundary

Version 0.1 candidate. This additive conformance seam defines explicit records
closure and current erasure-eligibility checks for retained PRD/evidence sets.
It carries no retention duration, deployment configuration or private approval.
The existing D-009 v1 policy schema, signatures, start-event catalog and storage
activation flags remain unchanged.

The [security specification](security-and-operations.md) (protected persistence,
current authorization, hold/erasure and public disclosure) and [ADR-009](adr-009-retention-and-erasure.md)
(asset/classification policy, backup and restore obligations) govern consuming
implementations. This candidate must be integrated through an approved versioned
policy amendment; its existence cannot satisfy those activation gates.

## Executable contract

The [candidate schema](../../contracts/schemas/records-retention-v1.schema.json)
(closed trusted-context shapes with bounded inventories) and [evaluator](../../scripts/lib/records-retention.mjs)
(pure closure transition and current eligibility checks) are server-side
conformance artifacts. The actor, action-specific authorization, approved policy,
use inventory, hold observation and computed schedule are trusted inputs that a
controller must obtain from authoritative services. They are never browser
request fields or a substitute for authentication or policy validation.

The test schema uses `APPROVED` to exercise the consuming policy seam. No actual
policy is approved by fixture data, a schema value or a successful evaluation.
An `ALLOW` result means these local checks passed; it is not an executable
deletion grant, erasure receipt or proof that a database transaction succeeded.

| Input or event | Required behavior |
| --- | --- |
| Active Product or Feature use | Block records closure and erasure eligibility |
| Incomplete, stale, cross-workspace or duplicate use inventory | Block the affected check |
| Current human owner with action-specific authorization | May close an eligible record set against its exact aggregate version |
| Active or unknown hold | Preserve it during closure; block erasure eligibility |
| Authorized retention worker | May evaluate erasure eligibility; it cannot supply human-owner closure attribution |
| New or changed use history after closure | Require a new explicit closure after active uses end, even when the current inventory is empty |
| Repeated closure with unchanged inventory | Preserve the original closure and deadline; reject a new closure that would silently extend retention |
| Changed, revoked or expired policy | Block eligibility pending a version-bound approved policy migration |
| Schedule for a different closure, scope, digest or policy | Block eligibility |
| Erased record set | Block both commands; never restore erased content through new use or closure |

`closeRecordsForRetention` returns a new immutable record version, closure
identity, policy and inventory pins, owner attribution and a content-free event.
It leaves its inputs unchanged. Denial returns the unchanged record and no event.
The existing closure must be retained as immutable history by the consumer.

`evaluateRecordsRetention` checks the exact closure and schedule. A schedule is
recomputed through the approved policy service, including its calendar/unit,
timezone, legal and operational rules. This module performs no duration
calculation and supplies no default period. It verifies that eligibility is not
before closure and that the deadline has been reached.

All instants in this candidate use normalized UTC with millisecond precision.
The controller supplies one trusted evaluation instant and observations from
the current consistent read boundary. Matching timestamps alone cannot prove
freshness; a client or cache cannot choose the observation timestamp.

## Consuming transaction and storage requirements

The future consuming child packet must provide the exact physical migration,
API, authorization policy, controller lease, outbox event and runtime tests.

1. Scope all reads by workspace and record set, authenticate the actor and
   obtain current action/resource/actor-specific policy authorization.
2. Maintain a complete, versioned use inventory with immutable change history.
   Every link, unlink and use-state change increments its version atomically
   with the corresponding record-set version. Paginated or stale projections
   must never be marked complete by the consumer.
3. Closure locks the record set and inventory, checks the expected version and
   current owner/access/policy, then commits closure history, new pointers,
   attribution, audit and outbox together. The caller supplies only allowed
   command data; closure IDs and context are allocated/derived server-side.
4. New use invalidates the prior closure's deletion eligibility. A later
   explicit closure receives a new identity and starts a newly computed schedule.
   Exact closure identity uniqueness is database-enforced across the full
   record-set history, not only against the current pointer.
5. Before irreversible erasure, recheck current policy, active use and holds
   under the controller's fenced commit boundary. Acquire an erasure fence that
   prevents new use/hold races from crossing the irreversible point silently.
   If a hold or use change wins the race, stop erasure and re-evaluate.
6. Policy changes require an explicit migration/recalculation procedure. An
   old schedule or cached `ALLOW` cannot authorize work after such a change.
7. Execute approved storage erasure and verify every controlled copy. Preserve
   active-copy versus backup-residue completion states, restore quarantine,
   deletion-ledger replay and scoped receipts under the activated storage policy.

No provider call, physical delete, key destruction, tombstone, backup expiry or
protected-body persistence is implemented by this seam. Those operations remain
behind the approved storage lifecycle and controller contract.

## Verification and rollback

The [automated tests](../../scripts/tests/records-retention.test.mjs) (tenant,
owner/worker, version, active use, holds, policy, deadline and injection checks)
use fabricated IDs and boundary instants rather than an organizational retention
schedule. Run `node --test scripts/tests/records-retention.test.mjs`.

The consuming runtime must additionally prove real database races, idempotent
replay, controller fencing, inventory completeness, schedule computation from
approved policy, legal-hold timing and actual controlled-copy erasure/restore.
The pure tests do not establish those runtime properties.

Rollback removes this additive candidate seam. It creates no retained object or
runtime record and changes no existing policy start event or published pin.
