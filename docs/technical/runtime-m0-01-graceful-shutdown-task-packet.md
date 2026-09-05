# RUNTIME-M0-01 (Graceful Curve Worker Shutdown Classification) Task Packet

> Sanitized public reference. Fictional identities cannot authorize execution.
> Historical approvals apply only to their original bytes; see
> [public contract edition](public-reference-sanitization.md) (sanitization, integrity and approval boundaries).

## Document control

| Field | Value |
| --- | --- |
| Status | `ACCEPTED_AND_MERGED / LOCAL_ONLY` |
| Version | 1.3 |
| Prepared | 2026-08-30 |
| Product | Curve |
| Work package | RUNTIME-M0-01 (graceful Curve worker shutdown classification) |
| Owner and human reviewer | Designated reviewer (`example-reviewer`) |
| Implementer | Codex |
| Target repository | `git@github.com:faocampo/plane.git` |
| Target branch | `preview` |
| Verified target base | `9f9bb14f46b80e1d05b4c900d25c1af7a229b55c` |
| Intended feature branch | `curve/runtime-m0-01-graceful-worker-shutdown` |
| Tracking evidence | [Curve issue #46](https://github.com/faocampo/curve/issues/46) (intentional `SIGINT`/`SIGTERM` lifecycle classification defect and acceptance criteria) |
| Implementation evidence | [RUNTIME-M0-01 implementation evidence](runtime-m0-01-implementation-evidence.md) (accepted Plane head and merge, deterministic tests, live signals, CI, security, cleanup, and rollback) |
| Data boundary | Synthetic `INTERNAL` local-development data only; literal public local PostgreSQL/Temporal connection settings are permitted; external, protected, staging, and production credentials, secrets, and data are prohibited |
| External spend | US$0 |
| Authority boundary | This definition authorizes no Plane mutation, command execution, branch push, PR creation, merge, deployment, provider call, credential use, or infrastructure change. |

This packet is retained as the immutable implementation definition. Its local
scope was implemented and accepted through Plane PR #15 at head
`88921d95e8b5b997d2578a170fe79e260b61c8c2`, squash-merged as
`c516a612a29751b0d24bcbd32bfcba1bd73fe3af`. See the
[RUNTIME-M0-01 implementation evidence](runtime-m0-01-implementation-evidence.md)
(accepted implementation, tests, live signal proof, CI, security, cleanup, and
rollback). The historical authority boundary above remains the boundary of the
definition itself.

## Demonstrable outcome

An intentional `SIGINT` or `SIGTERM` of the local Curve Temporal worker exits
without the false `RuntimeError` traceback, while an independently failed or
unexpectedly completed worker or relay task still fails closed with its
original error. All task cleanup is observable and the existing Docker Compose
process deadline remains the outer bound.

## Verified defect

At the pinned Plane base, `apps/api/plane/curve/temporal/worker.py` waits for the
worker task, relay task, or stop-event waiter with `asyncio.FIRST_COMPLETED`.
The current classifier subtracts only the stop waiter from the complete set and
treats every other completed task as unexpected. One signal can wake the stop
waiter and allow the worker and relay to finish in the same event-loop turn, so
the complete set may validly contain all three tasks.

The same boundary can miss an exception that appears while shutdown cleanup is
already in progress. The correction therefore classifies the complete task set
after recording whether a stop was requested and always inspects final worker
and relay results.

## Fixed interpretation of bounded cleanup

This packet preserves Temporal SDK 1.31.0 and the current local Compose
topology. Temporal documents that `Worker.shutdown()` waits until shutdown is
complete, and its worker configuration exposes a graceful activity-cancellation
period. Docker Compose supplies the outer process deadline before forced
termination. The official sources are:

- Temporal Python SDK, [`Worker.run()` and `Worker.shutdown()`](https://python.temporal.io/temporalio.worker.Worker.html#shutdown) (worker shutdown lifecycle and completion semantics).
- Temporal Python SDK 1.31.0, [worker implementation](https://github.com/temporalio/sdk-python/blob/1.31.0/temporalio/worker/_worker.py#L784-L927) (pinned worker shutdown behavior).
- Docker, [`stop_grace_period`](https://docs.docker.com/reference/compose-file/services/#stop_grace_period) (Compose graceful-stop deadline).

For this correction, “bounded cleanup” means both signal proofs must terminate
normally within the explicit ten-second Compose command deadline. A timeout,
forced kill, surviving task, or non-zero graceful exit fails acceptance. An
application-enforced hard deadline independent of the container runtime is a
separate runtime/infrastructure decision and is outside this packet.

## Scope

### In scope

1. Add a side-effect-free async supervisor helper under
   `apps/api/plane/curve/temporal/worker_lifecycle.py`.
2. Replace the inline `FIRST_COMPLETED` classification in
   `apps/api/plane/curve/temporal/worker.py` with one call to the helper.
3. Add deterministic lifecycle tests under
   `apps/api/plane/curve/tests/test_curve_worker_lifecycle.py`.
4. Preserve the existing worker registration, Temporal workflows, activities,
   relay behavior, settings, telemetry, and Compose topology.
5. Run the focused, regression, static, contract, and live signal evidence
   defined below.

### Out of scope

- Database migrations or model changes.
- API, SSE, UI, workflow, activity, event, provider, policy, or schema changes.
- Dependency or SDK upgrades.
- Changes to Compose files, `stop_grace_period`, Kubernetes, AWS, Temporal
  topology, or infrastructure.
- Protected data, external/protected/staging/production credentials or secrets,
  provider/model calls, external spend, deployment, merge, or release.
- General worker refactoring unrelated to shutdown classification.

## Required implementation behavior

The supervisor helper must:

1. Wait for the worker, relay, or stop waiter with `FIRST_COMPLETED`.
2. Snapshot `stop_event.is_set()` immediately after that wait.
3. Set the stop event and stop relay work on every exit path.
4. Avoid waiting on `worker.shutdown()` when the worker task already completed,
   including an SDK failure before its shutdown-complete event exists.
5. Invoke worker shutdown exactly once when the worker remains active.
6. Gather final worker and relay results on every path.
7. Re-raise original non-cancellation failures with deterministic precedence:
   worker, then relay, then `worker.shutdown()`, then unexpected normal exit.
   The same precedence applies when failures are concurrent with a signal or
   supervisor cancellation.
8. Accept extra normal worker or relay completion when shutdown was already
   requested.
9. Raise `RuntimeError("Curve Temporal worker task exited unexpectedly")` when
   a worker or relay task completes normally before any stop request.
10. If `worker.shutdown()` fails while the worker task remains active, capture
    the shutdown exception, cancel and gather the worker task, then apply the
    failure precedence above.
11. On supervisor cancellation, set the stop event, perform the same bounded
    cleanup, and re-raise `CancelledError` when no higher-precedence original
    failure exists.
12. Cancel and gather the stop waiter in `finally`, leaving no task orphaned.

The helper must import neither Django nor Temporal so the lifecycle suite can
exercise it without triggering worker environment validation or
`django.setup()`.

## Acceptance matrix

| ID | Given | When | Then |
| --- | --- | --- | --- |
| RT-01 | Worker and relay are active | Stop alone is requested | Both settle normally; shutdown is called once; no traceback is emitted. |
| RT-02 | Stop, worker, and relay can complete in one loop turn | Stop and normal worker completion are simultaneous | The outcome is graceful and deterministic. |
| RT-03 | Stop and relay completion are simultaneous | Relay exits because the shared stop event is set | The outcome is graceful and deterministic. |
| RT-04 | Worker fails independently | The supervisor observes the failure | The same exception object/type and message are propagated. |
| RT-05 | Relay fails independently | The supervisor observes the failure | The same exception object/type and message are propagated. |
| RT-06 | Stop and worker failure are simultaneous | Final results are gathered | The original worker exception is propagated; shutdown does not mask it. |
| RT-07 | No stop was requested | Worker completes normally | The existing fail-closed worker `RuntimeError` is raised. |
| RT-08 | No stop was requested | Relay completes normally | The existing fail-closed relay `RuntimeError` is raised. |
| RT-09 | Any tested exit path | Cleanup completes | Worker shutdown is called exactly once when active and zero times when already terminal; worker, relay, stop-waiter, and shutdown-supervision tasks are all terminal. |
| RT-10 | The pinned worker image mounts the exact feature worktree in isolated disposable containers | `SIGTERM` and `SIGINT` are exercised separately | Each exits `0` within ten seconds and produces no false traceback; an ordered recovery container becomes healthy; the long-lived worker and dependencies keep the same healthy identities. |
| RT-11 | The implementation head is complete | Curve Temporal replay/cancellation/duplicate-effect and contract suites run | Existing behavior remains green with no migration drift. |
| RT-12 | The implementation head is pushed | Repository-native CI and CodeQL run | CI has no regression and no Critical/High security finding. |
| RT-13 | Stop and relay failure are simultaneous | Final results are gathered | The original relay exception is propagated after cleanup. |
| RT-14 | Worker and relay fail in the same loop turn | Final results are gathered | The original worker exception wins deterministically; the relay exception is still observed and produces no unhandled-task warning. |
| RT-15 | The active worker's shutdown call fails | Cleanup continues | The shutdown exception is propagated only after the worker, relay, stop waiter, and shutdown-supervision task are terminal. |
| RT-16 | The supervisor task is cancelled | Cleanup runs | `CancelledError` is re-raised after the worker, relay, stop-waiter, and shutdown-supervision tasks are terminal unless an original worker, relay, or shutdown failure has higher precedence. |

The human-readable `RT-*` labels are definition-local aliases. Before machine
materialization they map one-to-one to schema-valid acceptance identifiers:
`RT-01` through `RT-16` become `AC-58-RUNTIME-01` through
`AC-58-RUNTIME-16`. No machine packet may publish an `RT-*` identifier.

This is a supplemental local M0-06 (Temporal workflow-skeleton work package)
checkpoint. It inherits M0-06 ownership of FR-015 (durable workflow wait/resume
behavior), FR-022 (versioned Example Organization workflow templates), NFR-004 (durability and
recovery), and the local enabling portion of AC-58 (dependency-disruption
recovery). NFR-005 (idempotent replay) is a regression constraint: shutdown
must create no duplicate branch, signal, event, or effect. R1-03 (full disaster-
recovery exercise) retains ownership of the complete AC-58 scenario. This
packet claims only the bounded process-lifecycle correction and evidence.

## Candidate verification commands

The repository-native command forms below are the required evidence. Their
machine-dispatch representation remains unavailable. The approved
[local execution and authority decision](coding-agent-local-execution-decision.md)
(human-operated bootstrap, deferred machine profile, and production
fail-closed boundary) permits a human operator to run these exact commands
outside Curve dispatch after Designated reviewer grants the exact Plane execution scope.
Curve records commit-bound evidence afterward and makes no machine-execution
claim. Selecting Authority Option 1 or 2 instead would still require the full
reviewed machine grammar before any command runs.

### Planned command-phase map

Every row is `HUMAN_EXECUTION_APPROVED_PATH / MACHINE_UNAVAILABLE`; execution
still requires the separate exact human grant. Under the approved manual path,
the human operator records exact argv, image,
repository, output, timing, exit, and cleanup evidence. A future machine packet
must encode argv arrays and helper inputs rather than a shell string.

The manual grant must bind one exact feature-worktree path. Every Compose
command runs from that path under the dedicated project
`curve-runtime-m0-01-validation`. The source image
`plane-m1-01a-initiative-core-20260829-api-tests:latest` must resolve to image ID
`sha256:5dcd00dec45aebe57fd0965e0b04e1765cad6dcce32af474fbc29073bbe834d7`.
The required dependency tags and IDs are `postgres:15.7-alpine` at
`sha256:468d34fefd6338031787c7b8e94078975b3aaf4d66c7ead25c39cd3ba46a15c6`,
`valkey/valkey:7.2.11-alpine` at
`sha256:10328d00120dc14fbc87b2ed61b7677ddbb0d011e705361b4788329a0ec69a93`,
`rabbitmq:3.13.6-management-alpine` at
`sha256:611107e29cce05c2acd968325d5dcbde7e2fee404970f1ead75fdb22be2821b3`,
and `minio/minio:latest` at
`sha256:14cea493d9a34af32f524e538b8346cf79f3321eff8e708c1e2960462bd8936e`.
Because `docker-compose-test.yml` (Plane API test Compose definition) has a
`build` definition but no explicit
`image` for `api-tests`, the authorized operator creates the disposable local
alias `curve-runtime-m0-01-validation-api-tests:latest` from that exact image ID
before Compose starts. The operator must first prove that the alias and every
container, network, and volume carrying Compose project label
`curve-runtime-m0-01-validation` are absent; any pre-existing resource stops
the attempt and is not removed. After alias creation, both image references
must resolve to the approved ID, the isolated Python/Ruff/pytest probes must
return 3.12.5/0.9.7/9.0.3 with network disabled, and `/code` must resolve to the
feature worktree's `apps/api` directory. A missing or mismatched image, mount,
project, resource-absence proof, or tool stops execution. The operator performs
no build or pull.

The feature worktree must begin without `apps/api/.env` (ignored local API
environment file). The operator creates that ignored file only by installing
the tracked `apps/api/.env.example` (public synthetic API environment template)
bytes with mode `0600`. At the pinned Plane base, the tracked template digest is
`sha256:2eb008a8042a6b4c10e51e4323eb180fc1548e3caaa7fde55d12f0a835a35173`.
The operator requires that exact source digest, verifies the destination digest
is identical, and appends no secret. The template contains only public
synthetic local values; Django generates a process-local test secret when
`SECRET_KEY` is absent. An existing `.env`, changed template digest, extra line,
real credential, or non-`0600` mode stops the attempt without reading or
overwriting the file. Cleanup responsibility begins immediately after the
successful `install`: every later exit uses `finally` to remove only the
attempt-created `.env` and proves it is absent before the clean-tree result.

| Required phase | Repository-native evidence | Planned execution binding |
| --- | --- | --- |
| Local isolation preflight | `docker image inspect curve-runtime-m0-01-validation-api-tests:latest` must return image-not-found; separate `docker ps -a`, `docker network ls`, and `docker volume ls` commands filtered by `label=com.docker.compose.project=curve-runtime-m0-01-validation` must return no IDs | Four separately recorded, read-only Docker checks. Any existing alias or project resource stops the attempt without cleanup. |
| Local environment setup | `/usr/bin/install -m 600 apps/api/.env.example apps/api/.env`, followed by separate `shasum -a 256` and file-mode checks | Allowed only after proving `apps/api/.env` is absent. The source must match the pinned template digest, the destination digest must match the source, and no secret or other line is appended. Cleanup responsibility begins immediately after successful creation, including when any later source/tool or alias preflight fails. |
| Local source/tool preflight | Separate exact-ID inspections for the API-test image and all four dependency tags; separate `docker run --rm --network none sha256:5dcd00dec45aebe57fd0965e0b04e1765cad6dcce32af474fbc29073bbe834d7 python --version`, `python -m ruff --version`, and `python -m pytest --version` invocations against that image | Every image inspection must return the pinned ID. The isolated probes must return Python 3.12.5, Ruff 0.9.7, and pytest 9.0.3. |
| Local image alias setup | `docker image tag sha256:5dcd00dec45aebe57fd0965e0b04e1765cad6dcce32af474fbc29073bbe834d7 curve-runtime-m0-01-validation-api-tests:latest`, followed by a separate exact-ID inspection | Human-operated local Docker effect after the isolation and source/tool preflights; the exact grant must authorize it. The already-active `finally` path additionally removes only this attempt's project resources and alias after either is created. |
| `CMD-LINT` | `docker compose --project-name curve-runtime-m0-01-validation --project-directory . -f docker-compose-test.yml run --rm --pull never --no-deps --entrypoint python api-tests -m ruff check --no-cache plane/curve/temporal/worker.py plane/curve/temporal/worker_lifecycle.py plane/curve/tests/test_curve_worker_lifecycle.py` | Human-operated exact command using the disposable alias of the dependency-complete local image. The Compose service mounts host `apps/api` at container `/code`, so every command path is relative to `/code`; machine execution remains unavailable. |
| `CMD-BUILD` | `docker compose --project-name curve-runtime-m0-01-validation --project-directory . -f docker-compose-test.yml run --rm --pull never --no-deps --entrypoint python api-tests -m compileall --invalidation-mode checked-hash -q plane/curve/temporal/worker.py plane/curve/temporal/worker_lifecycle.py plane/curve/tests/test_curve_worker_lifecycle.py` | Human-operated exact command; paths are relative to container `/code`, and generated `__pycache__`/`.pyc` is inventoried and removed before the clean-tree check. |
| `CMD-TEST` focused | `docker compose --project-name curve-runtime-m0-01-validation --project-directory . -f docker-compose-test.yml run --rm --pull never --entrypoint python api-tests -m pytest plane/curve/tests/test_curve_worker_lifecycle.py plane/curve/tests/test_curve_worker_bootstrap.py -q` | Human-operated exact focused suite with isolated ephemeral test dependencies. |
| `CMD-TEST` regression | `docker compose --project-name curve-runtime-m0-01-validation --project-directory . -f docker-compose-test.yml run --rm --pull never --entrypoint python api-tests -m pytest plane/curve/tests -q` followed by a separate `docker compose --project-name curve-runtime-m0-01-validation --project-directory . -f docker-compose-test.yml run --rm --pull never --entrypoint python api-tests manage.py makemigrations --check --dry-run` invocation | Two separately recorded human-operated commands; no compound execution receipt. |
| `CMD-TEST` complete backend | `docker compose --project-name curve-runtime-m0-01-validation --project-directory . -f docker-compose-test.yml run --rm --pull never --entrypoint python api-tests -m pytest -q` | Complete Plane API pytest collection using isolated ephemeral test dependencies. |
| `CMD-SECURITY` local | `docker compose --project-name curve-runtime-m0-01-validation --project-directory . -f docker-compose-test.yml run --rm --pull never --no-deps --entrypoint python api-tests -m ruff check --no-cache --select S plane/curve/temporal/worker.py plane/curve/temporal/worker_lifecycle.py` | Human-operated production-file security pass using paths relative to container `/code`; commit-bound Plane CodeQL remains the PR security gate. |
| `CMD-LOCAL-RUN` | Separate human-operated `SIGTERM` and `SIGINT` proofs against disposable containers created from the pinned Curve worker image, mounted to the exact feature worktree, connected only to the existing local `plane_dev_env` network, and assigned task queue `curve-runtime-m0-01-validation-v1` | The operator proves the synthetic workspace and worker-owned delivery state are quiescent, verifies the exact source mount and image, requires health before each signal, captures exit/log evidence within ten seconds, recreates a healthy worker after each signal, and removes only the three named disposable containers. |
| Supplemental diff hygiene | `git --no-pager diff --no-ext-diff --no-textconv --ignore-submodules=all --check` | Human-operated read-only Git check; the future machine profile must use the retained closed `GIT_READ_ONLY` grammar. |
| Local cleanup | `docker compose --project-name curve-runtime-m0-01-validation --project-directory . -f docker-compose-test.yml down --volumes --remove-orphans --timeout 10`, followed by separate `/bin/rm apps/api/.env` and `docker image rm curve-runtime-m0-01-validation-api-tests:latest` commands | Three separately recorded authorized commands in `finally`. Cleanup removes only the `.env`, resources, and alias whose preflight proved absent before this attempt; source image layers remain. |

The current `api-tests` Compose service normally installs
`requirements/test.txt` from its entrypoint, and repository examples use
`--build`. The exact human-operated commands above override that entrypoint and
reuse the already built dependency-complete image; they record its image ID and
must stop if the image is absent or its required tool probes fail. They perform
no build, pull, or package installation. Overriding the entrypoint also skips
its static-directory setup, so the operator must prove
`apps/api/plane/static-assets/collected-static` exists before tests, create it
inside the task worktree if absent, and remove it during cleanup when the path
was created by this attempt. A future B-CODING-TOOLS-01 machine
profile must separately bind image provenance, a non-installing Compose model,
network policy, helper grammar, receipts, and adversarial tests. Any bytecode
cache or task-local resource is removed, the disposable image alias is removed,
and the clean tree plus project-resource absence is verified. The absence of a
Curve contract change makes the Plane
JavaScript contract-integrity script non-applicable to this bounded Python
worker correction.

### Live local signal proof

Use the existing local Plane data services without replacing or signaling the
long-lived `plane-curve-worker-1` container. The separately approved human grant
binds network `plane_dev_env`, exact observed network ID
`2fad83313a6d22a09ee6ce52633559d5199a8d034f6f80774cc5a726e6daac29`,
healthy local services `plane-plane-db-1` and `plane-temporal-1`, Docker DNS aliases
`plane-db` and `temporal`, worker image
`sha256:afaf09281c96e984df0f5510657e5609e9bb88200b12f040bc0cb672d9706617`,
the feature-worktree `/code` mount, and the disposable names
`curve-runtime-m0-01-sigterm`, `curve-runtime-m0-01-sigint`, and
`curve-runtime-m0-01-recovery`. Any identity drift stops the proof.

Before a container starts, prove the purpose-created synthetic workspace has no
Operation outside `SUCCEEDED`, `FAILED`, and `CANCELLED`; no OutboxEvent outside
`DELIVERED` whose destination is `CURVE_TEMPORAL_OPERATION_V1`; and no open
Curve workflow in namespace `curve-local` on task queue
`curve-runtime-m0-01-validation-v1`. Inventory pending application destinations
such as `CURVE_LOCAL` separately. Prove all three disposable names are absent,
the network and two dependency containers match the grant, and the existing
long-lived Curve worker remains healthy and untouched.

For each disposable worker, invoke `docker run` with exact literal arguments:

```text
docker run --detach --name <approved-name> --network plane_dev_env --read-only --tmpfs /tmp:rw,noexec,nosuid,nodev,size=64m --volume /private/tmp/plane-runtime-m0-01-graceful-worker-shutdown-20260901/apps/api:/code:ro --env DJANGO_SETTINGS_MODULE=plane.settings.curve_worker --env DATABASE_URL=postgresql://plane:plane@plane-db:5432/plane --env CURVE_ENABLED=1 --env CURVE_ENABLED_WORKSPACE_SLUGS=curve-local-proof --env CURVE_ENVIRONMENT=LOCAL --env CURVE_TELEMETRY_MODE=DISABLED --env TEMPORAL_ADDRESS=temporal:7233 --env TEMPORAL_NAMESPACE=curve-local --env TEMPORAL_TASK_QUEUE=curve-runtime-m0-01-validation-v1 --env TEMPORAL_WORKER_IDENTITY=<approved-identity> --env LOG_LEVEL=INFO --security-opt no-new-privileges:true --cap-drop ALL --pids-limit 256 --cpus 2.0 --memory 8g sha256:afaf09281c96e984df0f5510657e5609e9bb88200b12f040bc0cb672d9706617 python -m plane.curve.temporal.worker
```

The literal PostgreSQL and Temporal values are public synthetic local-service
configuration. External, protected, staging, and production credentials or
secrets are prohibited. The only substitutions are the ordered pair
`curve-runtime-m0-01-sigterm`/`curve-runtime-m0-01-sigterm-v1`, then
`curve-runtime-m0-01-sigint`/`curve-runtime-m0-01-sigint-v1`, then
`curve-runtime-m0-01-recovery`/`curve-runtime-m0-01-recovery-v1`.

For every container, verify `/code` resolves to the exact feature worktree
mount and `python -m plane.curve.temporal.health` succeeds. Then run both
read-only poller observations below from `plane-temporal-1`, with each JSON
result required to contain the container's approved identity and a poll time no
older than 30 seconds:

```text
temporal task-queue describe --namespace curve-local --task-queue curve-runtime-m0-01-validation-v1 --task-queue-type workflow --output json
temporal task-queue describe --namespace curve-local --task-queue curve-runtime-m0-01-validation-v1 --task-queue-type activity --output json
```

Retry each observation at most once every two seconds for no more than 30
seconds; a missing or stale workflow/activity poller stops the case before any
signal. Record the immutable container and image IDs. For the first two
containers, invoke respectively
`docker stop --signal SIGTERM --timeout 10 <approved-name>` and
`docker stop --signal SIGINT --timeout 10 <approved-name>`. Require exit code
`0`; hash the complete dedicated-container log bytes; reject the lifecycle
`RuntimeError`, any traceback, forced-kill marker, timeout, or surviving process;
then remove that stopped named container.

After each signal, start the next ordered container and require health. The
third recovery container proves post-`SIGINT` recovery through both poller
observations; stop it with `SIGTERM` under the same ten-second/exit-zero/log
requirements and remove it. In `finally`,
remove only these three names if they were created, verify their absence, and
prove `plane-curve-worker-1`, `plane-plane-db-1`, and `plane-temporal-1` remain
healthy with unchanged container IDs. Any failure stops the attempt and
preserves only redacted evidence digests for review.

### Commit-bound checks

The implementation PR must attach Plane API/Curve CI, CodeQL, and copyright
checks at the exact head. A green CodeQL workflow is necessary but not
sufficient: the trusted read-only GitHub controller also queries the
[repository code-scanning alerts API](https://docs.github.com/en/rest/code-scanning/code-scanning)
(exact-ref alert instances and security severity), records the response digest,
and proves zero open `critical` or `high` alerts whose most recent instance is
the implementation head. Missing access, incomplete analysis, a different
commit SHA, or an ambiguous alert state fails the gate. The coding task does not
merge itself.

## Deferred machine-publication blueprint

The canonical JSON remains absent from the registry under the approved
human-operated path. This table preserves the future machine-publication
blueprint for M4; it is neither a packet nor implementation authority.

| Field | Required RUNTIME-M0-01 value or blocker |
| --- | --- |
| Identity | `packet_id: CURVE-RUNTIME-M0-01`; `work_package_id: RUNTIME-M0-01`; version `1`; size `S`; non-user-facing `STANDARD` risk. |
| Workspace | Resolved local synthetic workspace: `c6d757e7-7c0d-4721-990b-4cfbf4063e8e`. Before every live proof, revalidate the UUID/slug binding plus worker-owned quiescence; fixture UUIDs cannot be reused. |
| Project tracking | Project `faocampo/2`; existing WORK_PACKAGE item `PVTI_lAHOBNjuQc4BgZzOzg4kt70`; issue [#46](https://github.com/faocampo/curve/issues/46) (graceful worker shutdown defect and acceptance). No duplicate item. |
| Repository | `git@github.com:faocampo/plane.git`; `preview`; exact base `9f9bb14f46b80e1d05b4c900d25c1af7a229b55c`; feature branch `curve/runtime-m0-01-graceful-worker-shutdown`; exact-remote-tip stale-base policy. |
| Governance state | Four digest-bound state records for PRD, Architecture, ADR-001, and Development Plan. |
| Dependency and decisions | One M0-06 (accepted local Temporal skeleton) dependency record plus D-001 (Plane foundation) and D-003 (local runtime topology) decision records. |
| Contract applicability | API, schema, event, workflow, policy, persistence, and migration are all `NOT_APPLICABLE`, each with an exact rationale: this process supervisor changes no corresponding public/domain contract. |
| Policies | Seven digest-bound state records: data, model, tool, sandbox, budget, external effects, and rollback. Together with governance, dependency, and decision records, the minimum is fourteen state records. |
| Commands | Human evidence phases are `HUMAN_EXECUTION_APPROVED_PATH / MACHINE_UNAVAILABLE` and still require the separate exact grant. Under Authority Option 3, B-CODING-TOOLS-01 is `DEFERRED_TO_M4` and no machine packet is published for this correction. |
| Data/model/budget | Synthetic `INTERNAL`; no protected data; model mode `NONE` with zero calls; US$0 external spend; one attempt; at most 120 compute minutes. |
| Sandbox | The approved human-operated path uses one dedicated local worktree, synthetic data, no Curve-managed credential, pinned test images, and three disposable signal-proof containers connected to the existing local development network. Writes remain limited to the declared worker/helper/test files. The M4 machine sandbox remains separately unresolved. |
| External effects | Candidate-tree creation has none. The exact human grant must authorize the local worker stop/restart proof and VCS branch/push/draft-PR effects. Curve machine dispatch performs none of them. A future machine packet requires separately reviewed controller contracts. |

### Future machine artifact paths

| Publication role | Planned path |
| --- | --- |
| Authority source | `contracts/authority/runtime-m0-01-v1.json` |
| State evidence | `contracts/state/runtime-m0-01/*.json` |
| Context Manifest | `contracts/context/runtime-m0-01-v1.json` |
| Source catalog | `contracts/task-packet-sources/runtime-m0-01-v1.json` |
| Sealed registry packet | `contracts/task-packets/runtime-m0-01-v1.json` |
| Later implementation authorization | `contracts/task-packet-authorizations/runtime-m0-01-attempt-1-v1.json` |

If M4 materializes this correction as a machine exercise, publication uses
`S -> E1..En -> C -> P`. Authority-source evidence precedes the state records
that cite it; the Context Manifest binds exact `S` bytes; the source catalog
descends from every evidence revision; and the sealed packet is the only file
added at `P`. The separate implementation authorization follows `P` and still
requires trusted verification plus one durable attempt lease. The approved
human-operated RUNTIME-M0-01 implementation does not create these artifacts or
claim this publication path.

## Tool, publication, and authority gates

The approved human-operated path becomes executable only when all of the
following are true:

1. Designated reviewer approved B-CODING-AUTHORITY-01 Option 3 and recorded
   B-CODING-TOOLS-01 as `DEFERRED_TO_M4` at merged Curve revision
   `866032fa42e2cb57ad1a4e662d9561f742983f79`.
2. Designated reviewer approves the prepared
   [RUNTIME-M0-01 human execution grant](runtime-m0-01-human-execution-grant.md)
   (exact Plane base, branch, scope, commands, effects, tests, validity, and
   rollback), binding the live base,
   feature branch, files, commands, synthetic-data boundary, local Docker
   effects, VCS effects, tests, review, rollback, and validity window.
3. The operator revalidates Plane `preview`, the local image/tool probes, the
   synthetic workspace binding, and worker-owned quiescence before mutation.

This path creates no canonical machine task packet, implementation-
authorization record, or attempt lease. It records the result as
`HUMAN_OPERATED_OUTSIDE_CURVE_DISPATCH` and keeps the generic production
preflight and dispatcher fail closed.

A future machine path still requires B-CODING-TOOLS-01, the ordered
`S -> E1..En -> C -> P` publication chain, trusted human-state verification,
and one durable current-attempt lease before repository execution.

Project status remains visual metadata and cannot satisfy these gates.

## Risks and stop conditions

| Risk | Required control or stop condition |
| --- | --- |
| Genuine failure is swallowed by a simultaneous signal | Gather final worker/relay results and re-raise the original non-cancellation exception. |
| Pre-start SDK failure hangs on shutdown | Do not call `worker.shutdown()` after the worker task is already terminal. |
| Relay or stop waiter survives | Assert terminal state after every test path. |
| Forced Docker kill is mistaken for success | Require exit code `0` within the ten-second deadline and verify post-cursor logs. |
| Scope expands into runtime policy or infrastructure | Stop and create a new architecture/runtime decision before editing. |
| Plane base moves | Stop, re-audit the diff and task packet, and repin the base before mutation. |
| Exact human commands or required local image probes fail | Stop the attempt; update the definition or environment through review rather than substituting commands or weakening evidence. |

## Rollback

- Before merge: abandon or revert the feature branch.
- After squash merge: revert the single Plane squash commit on `preview`.
- Operational disablement: set `CURVE_ENABLED=0` or omit the Curve Compose
  profile.
- Persistent data: none; no migration or schema rollback exists.
- Verification: rerun the existing Curve worker bootstrap and Temporal
  regression suites and confirm the disabled Plane baseline remains healthy.

## Definition-ready exit

This human-readable packet is definition-complete when Curve validation passes
and its Project evidence is linked. Under the approved simplified path, it
becomes human-executable only after the separate exact Plane execution grant is
verified. It remains machine-unavailable and produces no
Curve dispatch claim. A future machine version becomes `READY` only after its
tool profile, exact state evidence and authority sources, Context Manifest,
source catalog, registry publication chain, exact-digest implementation
authorization, and durable attempt lease pass canonical preflight.
