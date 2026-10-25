# Product application-enforcement relational successor

## Status and authority

Status: `CANDIDATE / ARCHITECTURE_DIRECTION_SELECTED / INTEGRATION_PENDING`.

This successor addresses [R-027](https://github.com/faocampo/curve/issues/44)
(Product timestamp authority and format-version enforcement). It records the
application-enforcement direction and its exact supported boundary. The named
human approval remains in the adopting environment's private authority record;
this public document contains no identity, private approval digest or operational
configuration. Public examples cannot authorize an environment.

The [historical Product relational contract](m1-00a-product-core-relational-contract.md)
(original database target and recorded variance) retains its original bytes and
scope. This candidate does not close R-027 (Product conformance reconciliation)
or establish production qualification. Closure requires reviewed integration
and conformance evidence for this successor and its implementation.

## Chosen convention

| Field | Successor requirement |
| --- | --- |
| `schema_version` | Non-null `varchar(20)`, application default `1.0`; the supported service/API contract owns and enforces the exact string `1.0`. |
| `created_at` | Non-null timestamp populated by trusted Django application UTC on creation; supported mutations preserve it. |
| `updated_at` | Non-null timestamp populated by trusted Django application UTC when an accepted mutation saves the Product. |
| `version` | Aggregate sequence starts at 1 and increments once per accepted mutation; it establishes command ordering independently of clock order. |

All other Product columns, constraints, indexes, workspace boundaries, active
membership checks, command permissions, version preconditions and transaction
invariants retain their existing contract scope. The application owns the
format edition; no database equality constraint or database timestamp generator
is introduced. Released migration `0006_product.py` (original Product table)
remains immutable. This decision requires no data rewrite or new migration.

Later mutable Curve aggregates consume the same application UTC and
service-owned format convention through their own reviewed contracts. In
particular, M2-01 (roadmap planning domain) must specify and test that convention
rather than inheriting the superseded database-clock target implicitly.

## Supported enforcement boundaries

Creation and metadata-update payloads reject caller-supplied format editions
and timestamps. Owner reassignment, archive and restore preserve the edition
and insertion time. Accepted mutations update aggregate version and update time
atomically with the required domain event, outbox and command evidence.

Before delivering a Product list or detail representation, serialization checks
the stored edition. Any unsupported row prevents a successful response for that
request. Existing authentication and authorization precede this check.

The shared mutation boundary checks the stored edition after authorization and
before invoking the Product command callback. Creation replay checks the
current, workspace-scoped Product before returning or appending replay evidence.
Unsupported editions reject metadata, owner and lifecycle mutations and their
replays without changing authoritative Product, event, outbox or idempotency
state. The existing policy path retains exactly one linked no-effect audit.

Initiative creation, refinement acceptance and resume into alignment recheck
the associated Product through the shared association guard. Rejection
preserves Initiative state, version and assignments and retains the required
no-effect audit. Historical lifecycle replay ordering remains scoped to its
existing contract; this successor does not redefine all Initiative replays.

An authorized request encountering an unsupported stored edition receives HTTP
503 with the fixed problem type
`https://curve.example.invalid/problems/curve-product-format-unavailable` and
title `The Product is temporarily unavailable`. The response includes no stored
edition, Product content or diagnostic. Permission denials retain precedence.
Restoring a supported record through a separately authorized repair permits
normal reads again. No API path silently coerces an unsupported stored edition.

## Consequences and limits

Direct SQL and unrestricted ORM writes can bypass application ownership. The
conformance claim covers supported service/API paths; it must not be described
as database enforcement. Existing malformed data is preserved for diagnosis.

Timestamp evaluations for a row and its associated event may differ. Clock
skew or rollback may produce equal or decreasing timestamps across commands.
Aggregate version and event sequence establish ordering. Clients must not use
timestamp comparison as a concurrency or completeness guarantee. Wire
representations remain timezone-aware UTC.

Unchanged, stale, denied and successful replayed commands preserve Product
creation/update times and aggregate version. Failures after event or outbox
creation roll back the entire command's authoritative mutation. Read-policy
audits establish authorization, independently of representation delivery.

## Qualification and preservation

The implementation uses an additive source-qualification successor for the
format guard and its exact integration modules. It preserves historical
qualification payloads, the physical database catalog and writer authority.
Changed, missing or linked proof files, an unexpected predecessor, extra or
missing modules and invalid source digests must reject qualification.

Required evidence includes supported creation; caller override rejection;
all four Product mutation types; creation and mutation replay; list/detail
failure and recovery; authorization precedence; Initiative association paths;
UTC output; stable insertion time; clock rollback; no-effect preservation;
transaction rollback; unchanged released migrations; and source-qualification
tamper rejection. Exact candidate and integration commits must accompany the
results. A green documentation check alone does not prove runtime conformance.

## Rollback and disablement

If the successor fails qualification or regression, keep its integration gate
closed and preserve the candidate and evidence for diagnosis. Disable the
applicable Curve routes or affected workspace feature access through the
existing authorized configuration boundary while remediation is prepared.
Retain Product rows, command receipts, audits, events and historical proofs.

If a merged application rollback is required, restore a reviewed, internally
consistent runtime and qualification set as a new deployment/change. Preserve
this successor's evidence with its original scope. The prior serializer does
not enforce this boundary, so rollback reopens the conformance limitation and
must not be represented as an equivalent safe format guard. Keep affected
access disabled until the supported-boundary tests pass. There is no database
migration to reverse and no reason to delete or rewrite historical Product data.
Operational activation, repair and deployment require their separately scoped
authority; this contract supplies none.

## Candidate implementation evidence

[Plane PR #48](https://github.com/faocampo/plane/pull/48)
(Product guards and conformance tests) contains corrected candidate
`f290f8e82603d07a4ac5a21cb9c59536c72556a5`. Its complete local manual-planning
partition passed 100 cases with zero skips; its qualification follow-up passed
36 cases. All 56 repository check tasks and changed Python lint passed.

The preceding candidate `4f0e96e92084177fb52275cef3aa8ad75641c3aa` passed 106
focused cases and a separate 23-case Temporal workflow follow-up, both with
zero skips. Its hosted native run passed 2,822 cases, skipped 12 Temporal cases
covered by that follow-up, and failed one manual qualification test. The
corrected candidate adds the missing Product successor step to that test's
installed-source comparison. All runtime, historical proof and other test
bytes are identical between these candidates. The original failing run remains
retained with its scope; a passing follow-up does not change its conclusion.
Storage regression passed 13 cases; host doubles passed 156. Nineteen historical
qualification JSON files remain byte-identical. Completed migration checks
reported no drift; the failed job did not reach its migration check.

[Current PR backend validation](https://github.com/faocampo/plane/actions/runs/40145712051)
(full native partitions and host doubles) remains pending. [Corrected-head
frontend validation](https://github.com/faocampo/plane/actions/runs/40145514161)
(all-package build and checks) and [corrected-head CodeQL](https://github.com/faocampo/plane/actions/runs/40145516502)
(exact-candidate security analysis) passed. Integration and issue closure remain
pending; production readiness has separate acceptance requirements.
