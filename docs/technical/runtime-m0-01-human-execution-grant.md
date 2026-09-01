# RUNTIME-M0-01 Human Execution Grant

## Document control

| Field | Value |
| --- | --- |
| Status | `PREPARED / EXACT HUMAN APPROVAL REQUIRED / NO PLANE MUTATION` |
| Version | 1.1 |
| Prepared | 2026-09-01 |
| Product | Curve |
| Work package | RUNTIME-M0-01 (graceful Curve worker-shutdown correction) |
| Governing decision | [Coding-agent local execution and authority decision](coding-agent-local-execution-decision.md) (approved human-operated coding outside Curve dispatch and deferred machine execution profile) |
| Implementation definition | [RUNTIME-M0-01 task packet](runtime-m0-01-graceful-shutdown-task-packet.md) (worker-shutdown behavior, exact Plane scope, verification, live signals, stop conditions, and rollback) |
| Decision evidence | Curve PR #50 approved at head `f8e2f4b3d497f747f9e8a3b7db7508510400bae9` and squash-merged as `866032fa42e2cb57ad1a4e662d9561f742983f79` |

## Prepared exact grant tuple

| Field | Bound value |
| --- | --- |
| Execution classification | `HUMAN_OPERATED_OUTSIDE_CURVE_DISPATCH` |
| Repository | `git@github.com:faocampo/plane.git` |
| Target branch | `preview` |
| Exact base SHA | `9f9bb14f46b80e1d05b4c900d25c1af7a229b55c` |
| Feature branch | `curve/runtime-m0-01-graceful-worker-shutdown` |
| Dedicated worktree | `/private/tmp/plane-runtime-m0-01-graceful-worker-shutdown-20260901` |
| Owner and human reviewer | Federico Ocampo (`faocampo`) |
| Implementer | Codex, operated by Federico Ocampo outside Curve dispatch |
| Data boundary | Synthetic `INTERNAL` local-development data only; literal public local PostgreSQL/Temporal connection settings are permitted; external, protected, staging, and production credentials, secrets, and data are prohibited |
| Model and provider boundary | No model/provider runtime call and no Curve provider access |
| Budget | US$0 external spend; one attempt; at most 120 local compute minutes |
| Approval validity | From Federico's exact approval timestamp through `2026-09-03T23:59:59Z`; any bound-value change invalidates the grant immediately |

## Authorized Plane file scope

The grant permits changes only to:

1. `apps/api/plane/curve/temporal/worker.py` (Curve Temporal worker entrypoint)
2. `apps/api/plane/curve/temporal/worker_lifecycle.py` (side-effect-free
   worker/relay lifecycle supervisor)
3. `apps/api/plane/curve/tests/test_curve_worker_lifecycle.py` (deterministic
   shutdown, failure-precedence, cancellation, and cleanup tests)

Generated Python bytecode and a missing
`apps/api/plane/static-assets/collected-static` directory (generated static-test
assets) may be created only
for local validation and must be removed when created by this attempt.

## Authorized behavior

The implementer may create the dedicated Plane worktree and feature branch,
implement the exact supervisor behavior in the
[RUNTIME-M0-01 task packet](runtime-m0-01-graceful-shutdown-task-packet.md)
(worker/relay/stop classification, failure precedence, cancellation, cleanup,
and sixteen acceptance cases), run its exact verification phases, commit and
push the bounded change, open one draft Plane pull request into `preview`, and
update GitHub Project visual status.

## Authorized local Docker effects

The grant permits only the dedicated Compose project
`curve-runtime-m0-01-validation`, the disposable image alias
`curve-runtime-m0-01-validation-api-tests:latest`, an ignored mode-`0600`
`apps/api/.env` (attempt-local API environment file) copied byte-for-byte from
the exact base's tracked `apps/api/.env.example` (public synthetic API
environment template), and the separately recorded `SIGTERM` and `SIGINT`
proofs against three named disposable worker containers. The long-lived local
Curve worker remains running and untouched.

The source template digest is
`sha256:2eb008a8042a6b4c10e51e4323eb180fc1548e3caaa7fde55d12f0a835a35173`.
The approved image IDs are:

| Image | Exact local ID |
| --- | --- |
| Plane API tests | `sha256:5dcd00dec45aebe57fd0965e0b04e1765cad6dcce32af474fbc29073bbe834d7` |
| PostgreSQL | `sha256:468d34fefd6338031787c7b8e94078975b3aaf4d66c7ead25c39cd3ba46a15c6` |
| Valkey | `sha256:10328d00120dc14fbc87b2ed61b7677ddbb0d011e705361b4788329a0ec69a93` |
| RabbitMQ | `sha256:611107e29cce05c2acd968325d5dcbde7e2fee404970f1ead75fdb22be2821b3` |
| MinIO | `sha256:14cea493d9a34af32f524e538b8346cf79f3321eff8e708c1e2960462bd8936e` |
| Curve worker | `sha256:afaf09281c96e984df0f5510657e5609e9bb88200b12f040bc0cb672d9706617` |

The live proof is bound to Docker network `plane_dev_env` at observed network
ID `2fad83313a6d22a09ee6ce52633559d5199a8d034f6f80774cc5a726e6daac29`,
healthy dependency containers `plane-plane-db-1` and `plane-temporal-1`, DNS
aliases `plane-db` and `temporal`, source mount
`/private/tmp/plane-runtime-m0-01-graceful-worker-shutdown-20260901/apps/api:/code:ro`,
and task queue `curve-runtime-m0-01-validation-v1`. It may create only these
containers, in order:

1. `curve-runtime-m0-01-sigterm`, identity
   `curve-runtime-m0-01-sigterm-v1`.
2. `curve-runtime-m0-01-sigint`, identity
   `curve-runtime-m0-01-sigint-v1`.
3. `curve-runtime-m0-01-recovery`, identity
   `curve-runtime-m0-01-recovery-v1`.

Each container uses the exact `docker run` argument vector in the
[RUNTIME-M0-01 task packet](runtime-m0-01-graceful-shutdown-task-packet.md)
(pinned read-only source mount, synthetic local service settings, resource
limits, bounded Temporal workflow/activity poller readiness, signal order,
evidence, and cleanup). Before every signal, the operator runs the packet's
exact read-only `temporal task-queue describe` commands from
`plane-temporal-1`; both results must show the disposable container's approved
identity with a poll time no older than 30 seconds. Only literal
`DATABASE_URL=postgresql://plane:plane@plane-db:5432/plane` and
`TEMPORAL_ADDRESS=temporal:7233` local development configuration is permitted.
The operator may inspect, health-check, signal, capture logs from, and remove
only the three named disposable containers. It must record the existing
`plane-curve-worker-1`, dependency-container, and network identities before the
proof and verify that they remain unchanged afterward.

No image build, pull, package installation, provider network access, public
egress, long-lived worker mutation, or cleanup of pre-existing resources is
authorized.

## Required command and evidence binding

The exact commands and live-signal algorithm are those in the
[RUNTIME-M0-01 task packet](runtime-m0-01-graceful-shutdown-task-packet.md)
(dedicated Compose validation commands, complete backend suite, local security
pass, quiescence check, two signal proofs, and cleanup) at the exact Curve merge
revision containing this grant. Substitution, weakened flags, compound command
receipts, build/pull behavior, or a different source image stops the attempt.

Before mutation, the operator must revalidate:

1. `origin/preview` still equals the bound base SHA and the feature branch is
   absent remotely.
2. The dedicated worktree path, image alias, Compose containers, network, and
   volumes are absent; all three disposable worker names are also absent.
3. All six local image IDs, the exact Docker network ID, the dependency and
   long-lived worker container IDs, and the isolated Python 3.12.5, Ruff 0.9.7,
   and pytest 9.0.3 probes match.
4. The synthetic workspace UUID/slug binding is current and there are no
   non-terminal Operations, undelivered worker-owned
   `CURVE_TEMPORAL_OPERATION_V1` events, or open Curve workflows on task queue
   `curve-runtime-m0-01-validation-v1` in namespace `curve-local`.
5. `apps/api/.env` (attempt-local API environment file) is absent before the
   attempt-owned copy is created.

After implementation, the exact head must pass focused lifecycle/bootstrap
tests, all Curve backend tests, the complete Plane backend suite, migration
drift, Ruff, local Ruff security rules, diff hygiene, both signal proofs,
repository-native CI, copyright checks, CodeQL, and the exact-ref open-alert
query with zero Critical/High findings.

## Exclusions

The grant excludes Plane merge, deployment, staging or production mutation,
database migration, API/UI/schema/event/workflow/activity/provider/policy
change, dependency upgrade, Compose or infrastructure change, protected data,
external/protected/staging/production credentials or secrets, model/provider
calls, release, long-lived worker mutation, and any file outside the declared
scope.

## Stop conditions and rollback

Any stale base, changed image/tool/template identity, occupied worktree or
validation resource, non-quiescent worker-owned state, unexpected file change,
test/security failure, cleanup failure, scope expansion, or missing evidence
stops the attempt.

- Before merge, rollback is branch abandonment or reversion.
- After a separately approved squash merge, rollback is reverting that one
  Plane commit on `preview`.
- Operational disablement is `CURVE_ENABLED=0` or omission of the Curve Compose
  profile.
- The attempt-owned Compose project, image alias, ignored `.env`, generated
  bytecode, task-local static directory, and only the three named disposable
  signal-proof containers must be removed in `finally`.
- The long-lived worker, dependency-container, and network IDs must equal their
  preflight values after cleanup.
- Existing resources from other Compose projects remain untouched.

## Approval boundary

This prepared document is not an execution grant. Plane mutation begins only
after Federico approves the exact Curve revision containing these bytes and
repeats the repository, base SHA, branch, scope, local/VCS effects, exclusions,
budget, validity, and rollback authorization. The approval permits one attempt
and no merge. Curve machine dispatch remains unavailable until the deferred M4
tool, sandbox, trusted-controller, authority, and attempt-lease profile exists.
