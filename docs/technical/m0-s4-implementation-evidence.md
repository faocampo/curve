# M0-S4 API, SSE, and Curve-First UI Implementation Evidence

> Sanitized public reference. Fictional identities cannot authorize execution.
> Historical approvals apply only to their original bytes; see
> [public contract edition](public-reference-sanitization.md) (sanitization, integrity and approval boundaries).

## Document control

| Field | Value |
| --- | --- |
| Status | `ACCEPTED_AND_MERGED` |
| Evidence date | 2026-08-21 |
| Task | M0-S4 (API, SSE, and minimal Curve-first UI implementation packet) |
| Parent work package | M0-07 (public API and resumable SSE foundation work package) |
| Human owner and reviewer | Designated reviewer (`example-reviewer`), Designated technical owner |
| Curve implementation-contract revision | `79c7cd6cced82f8f3dede6cbad2706ae3d7befb8` |
| Curve planning merge | `ccd3c3aa6de46e0f2ee197905226cb40db0515b3` on `main` |
| Plane base | `d99342f589db4eb488695487d3ae3f2c16bf0874` on `preview` |
| Plane approved head | `a1748c790a060434928b8ed521692b13b3f9739e` |
| Plane merge | `e762fbbd2c1726a2833745add8245a1679c60d88` on `preview` |
| Curve PR | [Curve PR #18](https://github.com/faocampo/curve/pull/18) (M0-S4 lifecycle and implementation-readiness reconciliation) |
| Plane PR | [Plane PR #6](https://github.com/faocampo/plane/pull/6) (Operation API, resumable SSE, and Curve-first Foundation experience) |
| Data classification | Synthetic `INTERNAL` proof data only |

## Accepted outcome

M0-S4 (API, SSE, and minimal Curve-first UI implementation packet) and its
M0-07 (public API and resumable SSE foundation work package) scope are complete.
The accepted Plane implementation adds:

1. Workspace-authorized Operation creation, list, detail, and cancellation APIs
   under `/api/v1/workspaces/{workspace_slug}/curve/`.
2. RFC 9457 Problem Details, digest-only idempotency, `ETag`/`If-Match`, stable
   replay responses, bounded cursor pagination, and server-side Operation-type
   filtering before pagination.
3. Ordered, resumable SSE with `Last-Event-ID`, safe redacted event projections,
   bounded replay, and a recoverable `410` response for stale cursors.
4. A Curve-owned product shell and Foundation experience in which Plane appears
   as the embedded work-management capability.
5. Accessible desktop and mobile navigation, safe terminal-state rendering,
   cancellation confirmation, reconnect/recovery states, and a source link
   bound to the exact deployed revision.
6. Generated/checked TypeScript types and services plus focused API, state,
   navigation, source-link, and hook tests.
7. No database migration and no change to unrelated Plane behavior.

The implementation is bound to the
[M0-S4 context manifest](https://github.com/faocampo/plane/blob/e762fbbd2c1726a2833745add8245a1679c60d88/apps/api/plane/curve/contracts/m0-s4-context.json)
(38-file deterministic API, policy, runtime, UX, and implementation input
record) with aggregate digest
`sha256:79cf9f3c0267c4a42f7142aa457ac1e086c8a990a41e20703729d0aa9cca1bf3`.

## Approval and merge binding

Designated reviewer approved exact Curve head
`79c7cd6cced82f8f3dede6cbad2706ae3d7befb8` and authorized its squash merge
into `main`. GitHub merged it on 2026-08-21 as
`ccd3c3aa6de46e0f2ee197905226cb40db0515b3` with parent
`42ea32981a3d5ce814a74c18e458ac8152a7e2fa`. The Curve validation check was
green at the approved head.

Designated reviewer separately approved exact Plane head
`a1748c790a060434928b8ed521692b13b3f9739e` and authorized its squash merge
into `preview`. GitHub merged it on 2026-08-21 as
`e762fbbd2c1726a2833745add8245a1679c60d88` with parent
`d99342f589db4eb488695487d3ae3f2c16bf0874`.

Both squash merges preserve the exact approved content:

| Repository and revision | Git tree |
| --- | --- |
| Curve approved head `79c7cd6...` | `d3f6324ee5ef57a719351c262ac6c9487fffd735` |
| Curve merge `ccd3c3a...` | `d3f6324ee5ef57a719351c262ac6c9487fffd735` |
| Plane approved head `a1748c7...` | `3f63bac0db7290bb614829ad9305c1f68a2d4159` |
| Plane merge `e762fbb...` | `3f63bac0db7290bb614829ad9305c1f68a2d4159` |

The [Curve validation run](https://github.com/faocampo/curve/actions/runs/32503323623)
(documentation and contract checks),
[Plane CodeQL run](https://github.com/faocampo/plane/actions/runs/32527413261)
(Python and JavaScript analysis), and
[Plane copyright run](https://github.com/faocampo/plane/actions/runs/32527415252)
(Python and TypeScript license-header checks) were green at their exact approved
heads.

## Contract and implementation binding

| Control | Accepted evidence |
| --- | --- |
| Curve context | Revision `79c7cd6...`; 38 sorted, unique paths; aggregate and per-file SHA-256 values verified |
| Approved product definition | Curve PR #17 head `a463876...`, merged as `42ea329...`; UX-004-M0-S4 (clickable prototype and task-based review) and UX-005-M0-S4 (work-package-linked screen contract) approved |
| Planning reconciliation | Curve PR #18 head `79c7cd6...`, merged as `ccd3c3a...`; M0-S4 lifecycle kept open through engineering acceptance |
| Plane base | Exact `preview` base `d99342f...`; approved head and squash merge share one tree |
| API contract | Versioned Curve OpenAPI plus Operation, Operation Summary, Problem Details, and SSE schemas |
| Authorization | Workspace membership, feature enablement, owner projection, policy decision, CSRF, and cross-workspace non-disclosure tests |
| Concurrency and replay | Digest-only idempotency; database `ResourceRef` replay; ETag/If-Match; SSE cursor replay and expiry |
| User experience | Curve-owned shell; Plane-backed work management; evidence-derived progress; accessible modal navigation; exact-revision source link |
| Migration | `python manage.py makemigrations curve --check --dry-run` returned `No changes detected in app 'curve'` |

## Verification results

All commands in this table ran against the exact Plane merge tree
`3f63bac0db7290bb614829ad9305c1f68a2d4159` after GitHub merged Plane PR #6.

| Verification | Result |
| --- | --- |
| Complete Curve backend suite | `148 passed` in 22.55 seconds, exit `0` |
| Complete Plane backend suite | `664 passed`, 92 existing deprecation warnings, exit `0` |
| Complete Curve frontend harness | 5 files and `27 passed`, exit `0` |
| Monorepo checks | `pnpm check`: 60 of 60 tasks successful |
| Monorepo build | `pnpm build`: 16 of 16 tasks successful |
| Migration drift | `No changes detected in app 'curve'` |
| Repository-native security | Exact-head CodeQL passed for Python and JavaScript |
| Repository-native licensing | Exact-head copyright check passed for Python and TypeScript |
| Diff hygiene | Plane worktree remained clean; `git diff --check` passed |

The backend verification used disposable PostgreSQL, Valkey, RabbitMQ, and
MinIO services with an ignored synthetic local `.env`. Curve was enabled at
process startup for only the `alpha`, `beta`, and `curve-local-proof` synthetic
workspaces. The first diagnostic run with Curve disabled produced the expected
route-level `404` responses; after correcting the test-only startup setting,
the authoritative Curve and full Plane suites passed. The disposable
containers, network, volumes, and temporary configuration were then removed.

## Product and security acceptance

1. Curve owns the product logo, shell, global navigation, breadcrumbs, and
   Foundation experience; Plane remains visible as the embedded work-management
   foundation.
2. The Foundation page selects only `FOUNDATION_PROBE` operations on the server
   before pagination, so unrelated operations cannot be displayed or cancelled.
3. Queued, failed, and cancelled views derive completed progress only from
   durable Operation events rather than optimistic status inference.
4. Mobile navigation uses an accessible modal drawer with focus isolation,
   backdrop dismissal, and Escape handling.
5. Source-code attribution resolves to an exact revision rather than a mutable
   branch.
6. API and SSE projections omit raw idempotency keys, protected bodies,
   credentials, internal event data, and cross-workspace object existence.
7. Feature-disabled, unauthorized, stale-version, stale-cursor, and failed
   states fail closed with safe user-facing responses and no unauthorized
   mutation.

## Rollback proof and procedure

The accepted change is additive and Curve remains opt-in. Operational rollback
is:

1. Disable the Curve feature and workspace allowlist.
2. Remove Curve navigation/API exposure and stop Curve SSE clients.
3. Preserve Operation, DomainEvent, outbox, inbox, idempotency, policy, and
   audit records for reconciliation.
4. Keep Plane projects, work items, views, analytics, and existing Celery
   behavior unchanged.
5. Revert merge `e762fbb...` through a separately reviewed Plane PR if source
   rollback is required.

No destructive database rollback is required because M0-S4 introduced no
migration.

## Acceptance mapping and remaining scope

| Requirement | Evidence disposition |
| --- | --- |
| FR-023 | Workspace Operation create/read/cancel API, stable errors, pagination, and resumable SSE accepted |
| NFR-002-NFR-005 | Bounded replay, idempotency, optimistic concurrency, recovery, and deterministic test evidence accepted for the M0 local slice |
| NFR-013 | Workspace authorization, safe projections, CSRF, and cross-workspace non-disclosure accepted |
| AC-01 | Authorized Curve workspace entry and first user-facing Foundation flow accepted |
| AC-20 | Cancellation, terminal state, recovery, and no-duplicate-effect behavior accepted |
| AC-35 | Stale version, missing precondition, wrong workspace, disabled feature, and safe Problem Details behavior accepted |

M0-S4 (API, SSE, and minimal Curve-first UI implementation packet) completes
M0-07 (public API and resumable SSE foundation work package) for the local M0
vertical skeleton. General Initiative APIs, protected evidence, provider
connections, and later product screens remain owned by their consuming
milestones.

M0-S5A (telemetry kernel and static observability assets) may use Plane
`preview` at `e762fbb...` as its implementation base after Designated reviewer approves
the exact M0-S5 (local audit and observability implementation packet) contract
head and its deterministic M0-08 (audit and observability foundation work
package) context digest. M0-S5B (Example Organization local observability integration proof)
also requires OBS-BIND-001 (local Example Organization OTLP, Prometheus, Grafana, and independent
path-health binding).
