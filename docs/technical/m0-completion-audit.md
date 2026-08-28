# Curve M0 Completion Audit

## Document control

| Field | Value |
| --- | --- |
| Status | `AUDITED / M0 INCOMPLETE / CANDIDATE RECONCILIATION EVIDENCE / NOT IMPLEMENTATION AUTHORITY` |
| Version | 1.1 |
| Date | 2026-08-28 |
| Product | Curve |
| Owner and human reviewer | Federico Ocampo |
| Audit scope | M0 (foundation and control plane), its P0 (foundation-readiness) decisions/proofs, Plane implementation evidence, and the next executable package |
| Merged Curve baseline | `13cec5e99889c68b885a57a8a98609885b1e27b3` |
| Merged Plane `preview` baseline | `ad5772c0565c934e64ea90f892be1374819979be` |
| Authority boundary | This audit records evidence and gaps. It authorizes no decision transition, code mutation, provider access, credential use, infrastructure change, deployment, or merge. |

## Audit outcome

The local M0 (foundation and control plane) vertical skeleton is implemented and
accepted through Plane `preview` commit
`ad5772c0565c934e64ea90f892be1374819979be`. M0 (foundation and control plane)
as a whole remains incomplete because:

1. M0-04 (protected object storage and erasure) is blocked by D-009 (retention,
   backup, legal-hold, tombstone, and erasure decision).
2. M0-S9A (local provider-registry substrate) has merged initial contracts and
   an explicit Plane dispatch, but implementation is paused while six
   independent-review findings are corrected. It still requires green Curve
   correction CI, exact-head approval and merge, a replacement canonical
   context digest, authorized Plane resumption, implementation review, and
   acceptance evidence.
3. M0-S9B (external provider transport and administration) remains
   decision-bound and unprepared for implementation.
4. The M0-09 (provider integration foundation) Model Gateway child remains
   undefined until D-004 (Curve Model Gateway decision) and D-005
   (model/provider data-policy decision) are decided.

No broad M0 (foundation and control plane) completion claim is valid until the
remaining rows below satisfy their own completion boundaries.

## Baseline integrity

| Evidence | Result | Authority |
| --- | --- | --- |
| [Curve PR #29](https://github.com/faocampo/curve/pull/29) (M0-S9A provider-registry contract publication) | Approved head `075985a01dd2cac30423d7bc239407ef191da7a2` squash-merged as Curve `main` `7ea91188525c63d699e551910834f4602536f082`; exact-head and post-merge CI passed. | Canonical merged contract baseline |
| [Curve PR #31](https://github.com/faocampo/curve/pull/31) (M0-S9A dispatch-readiness reconciliation) | Approved head `22e7a7ac2335ec1f8fa64cbd25db5424a7a9254a` squash-merged as `b10f98e6f632fbd6efca94c418c151f40176395c`; CI passed. | Canonical dispatch-readiness baseline |
| [Curve PR #32](https://github.com/faocampo/curve/pull/32) (M0-S6A acceptance evidence) | Approved rebased head `f8a67dde19aaf1a9758e2a057012d6a4bda6f8bb` squash-merged as `58e9c95219bd191df96dcff6e3e554d06a28462e`; CI passed. | Canonical M0-S6A implementation evidence |
| [Curve PR #33](https://github.com/faocampo/curve/pull/33) (later-milestone decision-readiness packets) | Approved rebased head `f42d30412cd064a275577cea826fa5f3de250d9d` squash-merged as `72934b9b96420aa0df4ae7c0d5e1f85522003a18`; CI passed. | Canonical decision-preparation evidence; grants no decision or implementation authority |
| [Curve PR #35](https://github.com/faocampo/curve/pull/35) (M0-S9A policy-v2 contract correction) | Approved head `059e6e7b0185238f095c85e6a6b328accbaa5ecf` squash-merged as `13cec5e99889c68b885a57a8a98609885b1e27b3`; CI passed. | Current merged Curve baseline before the six-finding correction |
| [Plane PR #10](https://github.com/faocampo/plane/pull/10) (M0-S6A durable orchestration implementation) | Approved head `af8335c42fa3c57e66f76c6ebd80220640630cf8` squash-merged as `ad5772c0565c934e64ea90f892be1374819979be`. Both commits resolve to Git tree `dde7e50afa1710b729ab86f9ed99e4c462c763d0`. | Canonical merged Plane baseline |
| [Plane API and Curve CI](https://github.com/faocampo/plane/actions/runs/32844162011) (M0-S6A API, Curve, replay, and migration validation) | Passed. | Accepted implementation evidence |
| [Plane CodeQL](https://github.com/faocampo/plane/actions/runs/32844164027) (M0-S6A security analysis) | Passed. | Accepted security evidence |
| [Plane copyright check](https://github.com/faocampo/plane/actions/runs/32844163453) (source-header compliance) | Passed. | Accepted licensing-hygiene evidence |

## Requirement-by-package audit

| Package | Required outcome | Current evidence | Classification | Remaining action |
| --- | --- | --- | --- | --- |
| P0-01 (Plane community baseline) | Approved reuse/build and AGPL boundary | D-001 (Plane foundation, licensing, fork, and upgrade decision) plus accepted Plane inventory | `ACCEPTED` | Maintain upgrade and source-publication obligations per release. |
| P0-02 (runtime topology) | Local topology decided; non-local inputs explicit | D-003 (local runtime topology and trust-zone decision) plus private-platform connectivity amendment | `ACCEPTED_LOCAL` | Resolve staging/production activation inputs immediately before non-local use. |
| P0-03 (material-decision ADR set) | Every D-002 (Onyx delegation) through D-016 (KPI and rollout guardrails) decision approved or explicitly blocking its consumer | D-001 (Plane foundation) and D-003 (local runtime topology) are decided; [Curve PR #33](https://github.com/faocampo/curve/pull/33) (later-milestone decision-readiness packets) published the remaining owner packets | `IN_PROGRESS` | Obtain named-owner evidence and exact-revision decisions just in time; preserve fail-closed consumers. |
| P0-04 (documentation and contract validation) | Markdown, Mermaid, OpenAPI, schema, link, and semantic validation | Merged Curve validation suite and passing PR checks | `ACCEPTED` | Continue enforcing CI on every documentation/contract PR. |
| P0-05 (test strategy and audit closure) | Every PRD criterion mapped to package, suite, command, environment, and evidence | Accepted test matrix and semantic checks | `ACCEPTED` | Update traceability when requirements or owning packages change. |
| P0-06 (historical Temporal feasibility proof) | Retired standalone gates with executable replacement | D-003 (local runtime topology) makes M0-S3 (local Temporal round trip) the executable proof | `DONE_SUPERSEDED` | Preserve historical record; create no replacement standalone proof. |
| M0-01 (Curve module shell) | Additive, disabled-by-default, workspace-scoped Plane module | Accepted Plane implementation and migration evidence | `ACCEPTED` | None for local M0 (foundation and control plane). |
| M0-02 (core persistence) | Workspace-scoped records, immutable history, concurrency, and migration contracts | Accepted Plane implementation and M0-S2 (operation and delivery kernel) evidence | `ACCEPTED` | None for local M0 (foundation and control plane). |
| M0-03 (core authorization and policy) | Deny-by-default core policy, trusted-role derivation, separation, classification, and audit | Accepted Plane implementation through migration `0004_policydecision_recorded_at_default.py` | `ACCEPTED` | Add provider-specific policy only with its consuming decision and packet. |
| M0-04 (protected storage and erasure) | AccessEnvelope, object integrity, classification, retention, hold, tombstone, erasure, and backup behavior | D-009 (retention and erasure) owner workshop packet published in [Curve PR #33](https://github.com/faocampo/curve/pull/33) (later-milestone decision-readiness packets) | `BLOCKED_DECISION` | Named Security, Privacy, Legal, Platform Operations, and Database Operations owners complete D-009 (retention and erasure decision); then materialize a separate implementation packet. |
| M0-05 (delivery kernel) | Transactional outbox/inbox, idempotency, operation, audit, dead letter, and replay-safe relay | Accepted M0-S2 (operation and delivery kernel) implementation | `ACCEPTED` | Extend only through packet-bound destinations/consumers. |
| M0-06 (local Temporal skeleton) | Deterministic parent/child orchestration, signals, pause/resume, cancellation, replay, restart recovery, and Continue-As-New | [Plane PR #10](https://github.com/faocampo/plane/pull/10) (durable orchestration implementation) merged with identical approved/merge tree and green CI; [Curve PR #32](https://github.com/faocampo/curve/pull/32) (durable-orchestration acceptance evidence) is canonical on `main` | `DONE_LOCAL` | Keep provider dispatch, runner lifecycle, budget exhaustion, and full recovery qualification in M4-05 (slice dispatch workflow), M4-04 (trusted runner lifecycle), M6-05 (budget administration and capacity), and R1-03 (disaster-recovery exercise). |
| M0-07 (Operation API, SSE, and minimal UI) | Problem Details, ETag/If-Match, idempotency, pagination, resume, generated client, and Curve-first workspace page | Accepted M0-S4 (Operation API/SSE/minimal UI) implementation evidence | `ACCEPTED` | None for local M0 (foundation and control plane). |
| M0-08 (audit and observability) | Redacted logs/metrics/traces, dashboards, alerts, correlation, and local export-path health | Accepted M0-S5A (observability kernel) and M0-S5B (local observability binding) evidence | `ACCEPTED_LOCAL` | Qualify staging/production bindings before non-local activation. |
| M0-S9A (local provider-registry substrate) | Workspace-scoped connection/capability persistence, typed registry, fake adapter, synchronous reconciliation, bounded local delivery, and Option B authorization | Initial contract merged in [Curve PR #29](https://github.com/faocampo/curve/pull/29) (provider-registry contract); [Curve PR #31](https://github.com/faocampo/curve/pull/31) (dispatch-readiness reconciliation) and [Curve PR #35](https://github.com/faocampo/curve/pull/35) (policy-v2 correction) are merged. Plane work was explicitly dispatched on `curve/m0-s9a-provider-registry-foundation` and is paused before commit/push while six independent-review findings are corrected in Curve. | `CONTRACT_CORRECTION_IN_REVIEW / IMPLEMENTATION_PAUSED` | Pass correction CI, obtain exact-head approval, squash-merge, regenerate the canonical context digest, authorize resumption against the still-current Plane base, finish implementation/tests, review, merge, and publish evidence. |
| M0-S9B (external provider transport and administration) | Human administration, credentials/endpoints, callbacks, webhooks, scheduling, and real adapters | Consumer decision map exists; no implementation packet | `BLOCKED_NOT_PREPARED` | Materialize per-provider children only after applicable identity, security, data, infrastructure, and external-effect decisions. |
| M0-09 (Model Gateway child) | Model/provider catalog, routing, failover equivalence, actual-route evidence, and no silent fallback | D-004 (Curve Model Gateway decision) and D-005 (model/provider data-policy decision) packets published in [Curve PR #33](https://github.com/faocampo/curve/pull/33) (later-milestone decision-readiness packets) | `BLOCKED_IDENTIFIER_PENDING` | Decide D-004 (Curve Model Gateway decision) and D-005 (model/provider data-policy decision), assign a stable child identifier, publish contracts and a task packet, then dispatch separately. |

## Next executable sequence

1. Validate the six-finding M0-S9A (local provider-registry substrate) contract
   correction, obtain exact-head approval, and squash-merge it into Curve
   `main` while CI remains green.
2. Regenerate the canonical M0-S9A context from that merged Curve `main`; a
   digest from an open PR remains non-canonical.
3. Reverify the Plane `preview` base. The current verified base is
   `ad5772c0565c934e64ea90f892be1374819979be`, and provider migration `0005`
   follows migration `0004`.
4. Obtain explicit authorization to resume the existing Plane dispatch, binding
   the replacement canonical Curve revision/digest and still-current Plane base.
5. Complete and verify M0-S9A (local provider-registry substrate) without
   Temporal, Celery, scheduler, background loop, network, credentials,
   callback/webhook, model, or public-administration behavior.
6. Publish exact implementation evidence and keep M0-09 (provider integration
   foundation) open for M0-S9B (external provider transport and administration)
   plus the future Model Gateway child.

## Completion-claim rule

The following narrower statements are currently evidence-backed:

- “Curve has an accepted local M0 (foundation and control plane) vertical
  skeleton through Plane `preview` `ad5772c…`.”
- “M0-06 (local Temporal skeleton) is implemented, accepted, and closed for its
  defined local scope.”
- “Later milestone decisions have owner-ready packets on Curve `main` through
  Curve PR #33 (later-milestone decision-readiness packets); the decisions
  remain open.”

The statement “M0 (foundation and control plane) is complete” remains false
until the blocked and open packages in this audit reach their defined terminal
states or the governing PRD and development plan explicitly move them to a
later milestone through an approved architecture/product decision.
