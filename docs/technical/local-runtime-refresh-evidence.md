# Curve Exact-Preview Local Runtime Refresh Evidence

## Document control

| Field | Value |
| --- | --- |
| Status | `VERIFIED / LOCAL_ONLY / SYNTHETIC_INTERNAL` |
| Version | 1.0 |
| Date | 2026-08-29 |
| Curve evidence baseline | `a1a34c142bc37bf331cc58056dba858851db9cbf` |
| Plane implementation baseline | `99a73b4eab5ee21fd012d7358bc9259252d47f71` |
| Runtime source | `/Users/federico.ocampo/Development/tools/project_management/plane-runtime-preview` at a clean detached exact Plane commit |
| Owner and human reviewer | Federico Ocampo |
| Executor | OpenAI Codex under Federico Ocampo's standing execution policy |
| Data boundary | Synthetic `INTERNAL` records in the existing local developer database |

## Purpose and acceptance boundary

This record proves that the accepted Plane `preview` implementation can run the
Curve local control path from a durable source checkout using the existing Plane
Docker stack. It refreshes operational evidence after M1-00A (minimal Product
core) and M1-01A (Initiative domain and API foundation) advanced Plane
`preview` beyond the earlier M0 runtime worktrees.

The result qualifies the local API-and-Temporal control path at the exact Plane
revision above. The separately accepted M0-S4 (Operation API, resumable SSE, and
Curve-first UI) and M0-S5 (local observability) evidence retains its own scope.
Broad M0 completion remains open: D-009 (retention, backup, legal-hold,
tombstone, and erasure decision), M0-04 (protected object-storage foundation),
M0-S9B (external provider transport and administration), and M0-S9C (Model
Gateway routing and failover) retain their governed blocking states.

## Pre-refresh finding

The existing `plane-curve-worker-1` container was unhealthy because `/code` was
bound read-only to the historical temporary M0-S6A (durable parent/child
Temporal orchestration) worktree. Its health command failed with
`No module named plane.curve.temporal.health`. The retained local database was
at Curve migration `0004`, while accepted Plane `preview` contains migrations
`0005` through `0007`.

The shared PostgreSQL, Valkey, RabbitMQ, MinIO, and Temporal services remained
healthy. No volume reset was necessary.

## Applied local refresh

1. Fetched and verified Plane `origin/preview` at
   `99a73b4eab5ee21fd012d7358bc9259252d47f71`.
2. Created a clean detached runtime worktree at the durable path recorded in
   document control.
3. Built `plane-api:latest` and `plane-curve-worker:latest` from that exact
   source tree.
4. Applied only Curve migrations `0005` (provider registry), `0006` (Product),
   and `0007` (Initiative and gate assignments) to the retained local database.
5. Recreated only the Plane API and Curve worker application containers so
   their `/code` mounts use the durable exact-preview worktree.
6. Preserved all named volumes, shared data services, Temporal persistence, and
   existing local user/workspace data.

## Verification evidence

| Check | Result | Exact evidence |
| --- | --- | --- |
| Plane source | PASS | Detached clean `HEAD` `99a73b4eab5ee21fd012d7358bc9259252d47f71`. |
| Durable application mounts | PASS | `plane-api-1` and `plane-curve-worker-1` mount `<runtime-source>/apps/api` at `/code`; the worker mount is read-only. |
| API image | PASS | `plane-api:latest` image ID `sha256:ead471ae07206c13df0f4e78ba38f72f344a4f88ca697a5c327bab12eeeea7f3`. |
| Worker image | PASS | `plane-curve-worker:latest` image ID `sha256:afaf09281c96e984df0f5510657e5609e9bb88200b12f040bc0cb672d9706617`. |
| Curve migrations | PASS | `0001` through `0007` are applied; `makemigrations --check --dry-run` reports no changes. |
| Django system check | PASS | `python manage.py check --settings=plane.settings.local` reports no issues. |
| Plane HTTP health | PASS | `GET http://127.0.0.1:8000/` returns `200` and `{"status":"OK"}`. |
| Curve-disabled behavior | PASS | With `CURVE_ENABLED=0`, Django system checks pass and `get_curve_urlpatterns()` returns an empty list. |
| Curve-enabled authorization | PASS | The live Curve workspace shell route exists and an unauthenticated request returns `401`. |
| API and worker runtime | PASS | API is running; Curve worker and Temporal report healthy. |
| M0-S3 (local Temporal round-trip) success | PASS | Operation `7129cc4e-a914-4331-acba-8cf2754c15bf` reached `SUCCEEDED` at aggregate version 4 with exact evidence counts: 1 Operation, 4 domain events, 4 outbox records, 2 inbox records, and 4 audit records. |
| M0-S3 (local Temporal round-trip) cancellation | PASS | Operations `d4e7ddc0-f940-4cf3-b751-be120f440d76` and `287c9094-92d6-41ed-ba73-a4d0eea0e365` reached `CANCELLED` through direct and durable-reconciliation paths. |
| Duplicate/replay/data-history controls | PASS | Duplicate workflow start was rejected, all histories replayed, and the protected sentinel was absent from every history. |
| Worker restart recovery | PASS | Operation `7897ba9c-90cc-40f5-b970-c099234f7d19` resumed after worker restart and reached `SUCCEEDED`; exact evidence counts were restored without duplicates. |
| M0-S6A (durable parent/child Temporal orchestration) restart | PASS | Proof `bf4b5743-2ef4-4a03-9f6e-c8044e18f100` resumed from `WAITING_FOR_HUMAN` and reached `SUCCEEDED` at state version 5 without duplicate commands. |
| M0-S6A (durable parent/child Temporal orchestration) cancellation | PASS | Proof `d8082c6c-4954-4c45-adb8-7aff29e7768b` settled two active child slices to parent `CANCELLED`; history replay passed. |
| M0-S6A (durable parent/child Temporal orchestration) Continue-As-New | PASS | Proof `29e27d7b-9e89-4b6b-a2be-472c13110a8d` completed eleven dependency-ordered slices with exactly one Continue-As-New and no duplicate child. |

The local proof workspace contained 28 synthetic Operations before the final
durable-path proof. The final proof added three more synthetic Operations. No
production, provider, credential, or protected-data effect occurred. No authored
tracked-source content, local branch, commit, or push was changed.

## Non-blocking defect and disposition

An intentional worker `SIGTERM` emits an error traceback even though worker
health and both restart-recovery proofs pass. The verified symptom, suspected
race, and bounded acceptance criteria are tracked by [Curve issue #46](https://github.com/faocampo/curve/issues/46)
(RUNTIME-M0-01 graceful Curve worker shutdown classification). The Project item
is `Backlog`, priority `P2`, size `S`. A separate exact-base task packet is
required before Plane code changes.

## Runtime operations

Start or reconcile the current local application containers with explicit
source and Compose paths:

```bash
CURVE_SOURCE_ROOT=/Users/federico.ocampo/Development/tools/project_management/plane-runtime-preview \
  docker compose \
  --project-directory /Users/federico.ocampo/Development/tools/project_management/plane \
  -p plane \
  -f /Users/federico.ocampo/Development/tools/project_management/plane-runtime-preview/docker-compose-local.yml \
  -f /Users/federico.ocampo/Development/tools/project_management/plane-runtime-preview/docker-compose-curve.yml \
  --profile curve up -d api curve-worker temporal
```

The explicit project directory supplies the existing local `.env` and Compose
project boundary. Both Compose definition files and both application source
mounts remain bound to the durable exact-preview worktree.

Before advancing the runtime worktree to a later Plane `preview`, require a
clean worktree, fetch the target revision, pin the exact commit, inspect
migrations, rebuild the application images, and rerun this proof. Never bind a
long-lived local container to a disposable `/private/tmp` worktree.

Some retained data-service containers still carry historical Compose creation
labels. Their runtime configuration, named volumes, and health are unchanged.
Operational commands use the explicit durable Compose paths above instead of
inferring configuration files from those labels.

## Rollback and cleanup

- Disable Curve by setting `CURVE_ENABLED=0` and omitting the `curve` profile.
- Recreate only `api` and `curve-worker` from a previously pinned explicit
  source path if runtime rollback is required.
- Preserve the retained developer database and accepted migration history;
  reverse migration is limited to disposable migration proofs.
- Do not use `docker compose down -v` unless the developer explicitly chooses
  to destroy the local environment and its named volumes.

## Remaining gates

- D-009 (retention, backup, legal-hold, tombstone, and erasure decision) remains
  unresolved and fail closed.
- M0-04 (protected object-storage foundation) remains blocked by D-009
  (retention, backup, legal-hold, tombstone, and erasure decision).
- M0-S9B (external provider transport and administration) remains prepared and
  blocked on its child-specific decisions and external-effect authority.
- M0-S9C (Model Gateway routing and failover) remains prepared and blocked on
  D-004 (Model Gateway architecture decision), D-005 (model/provider and data
  policy decision), D-014 (budget-policy decision), and applicable D-009
  (retention, backup, legal-hold, tombstone, and erasure decision) inputs.
- R-027 (Product timestamp/schema-version contract reconciliation) remains
  open for exact Product relational conformance and production qualification.
