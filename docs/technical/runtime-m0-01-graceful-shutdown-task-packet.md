# RUNTIME-M0-01 (Graceful Curve Worker Shutdown Classification) Task Packet

## Document control

| Field | Value |
| --- | --- |
| Status | `DEFINITION_PREPARED / MACHINE_READY_TOOL_BLOCKED / DISPATCH_AUTHORITY_REQUIRED / NOT_IMPLEMENTATION_AUTHORITY` |
| Version | 1.0 |
| Prepared | 2026-08-30 |
| Product | Curve |
| Work package | RUNTIME-M0-01 (graceful Curve worker shutdown classification) |
| Owner and human reviewer | Federico Ocampo (`faocampo`) |
| Implementer | Codex |
| Target repository | `git@github.com:faocampo/plane.git` |
| Target branch | `preview` |
| Verified target base | `99a73b4eab5ee21fd012d7358bc9259252d47f71` |
| Intended feature branch | `curve/runtime-m0-01-graceful-worker-shutdown` |
| Tracking evidence | [Curve issue #46](https://github.com/faocampo/curve/issues/46) (intentional `SIGINT`/`SIGTERM` lifecycle classification defect and acceptance criteria) |
| Data boundary | Synthetic `INTERNAL` local-development data only; no protected bodies or credentials |
| External spend | US$0 |
| Authority boundary | This definition authorizes no Plane mutation, command execution, branch push, PR creation, merge, deployment, provider call, credential use, or infrastructure change. |

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
- Protected data, credentials, provider/model calls, external spend, staging,
  production, deployment, merge, or release.
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
| RT-10 | Local Curve profile is running | `SIGTERM` and `SIGINT` are exercised separately | Each exits `0` within ten seconds, produces no false traceback, and returns healthy after restart. |
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
behavior), FR-022 (versioned X3M workflow templates), NFR-004 (durability and
recovery), and the local enabling portion of AC-58 (dependency-disruption
recovery). NFR-005 (idempotent replay) is a regression constraint: shutdown
must create no duplicate branch, signal, event, or effect. R1-03 (full disaster-
recovery exercise) retains ownership of the complete AC-58 scenario. This
packet claims only the bounded process-lifecycle correction and evidence.

## Candidate verification commands

The repository-native command forms below are the required evidence. Their
machine-dispatch representation remains blocked by
[the local coding-tool execution decision](coding-agent-local-execution-decision.md)
(trusted-local versus gVisor execution profiles, exact Python/Docker grammar,
security evidence, and authority boundary).

### Planned command-phase map

Every row remains `PLANNED / UNAVAILABLE` until B-CODING-TOOLS-01 (local
coding-tool execution profile) selects and implements the exact Python or
trusted Compose-helper grammar. The eventual machine packet must encode argv
arrays and helper inputs rather than a shell string.

| Required phase | Repository-native evidence | Planned execution binding |
| --- | --- | --- |
| `CMD-LINT` | `python -m ruff check --no-cache apps/api/plane/curve/temporal/worker.py apps/api/plane/curve/temporal/worker_lifecycle.py apps/api/plane/curve/tests/test_curve_worker_lifecycle.py` | Pinned Python/Ruff module grammar; no dynamic module, `-c`, stdin, download, environment override, cache write, or shell. |
| `CMD-BUILD` | `python -m compileall --invalidation-mode checked-hash -q apps/api/plane/curve/temporal/worker.py apps/api/plane/curve/temporal/worker_lifecycle.py apps/api/plane/curve/tests/test_curve_worker_lifecycle.py` | Pinned Python `compileall` grammar over only the declared files in a task-local writable copy. The source checkout remains read-only to this phase; the controller removes and inventories every generated `__pycache__`/`.pyc` before accepting cleanup. |
| `CMD-TEST` focused | `docker compose -f docker-compose-test.yml run --rm api-tests pytest plane/curve/tests/test_curve_worker_lifecycle.py plane/curve/tests/test_curve_worker_bootstrap.py -q` | Fixed trusted Compose helper validates project root, file, service, subcommand, paths, timeout, environment, image digest, task-specific project/network, and cleanup. Build/pull/package download and public egress are prohibited. |
| `CMD-TEST` regression | `docker compose -f docker-compose-test.yml run --rm api-tests pytest plane/curve/tests -q` followed by `docker compose -f docker-compose-test.yml run --rm api-tests python manage.py makemigrations --check --dry-run` | Two independently recorded helper calls against prebuilt digest-pinned images; no shell wrapper, command separator, or composition. |
| `CMD-TEST` complete backend | `docker compose -f docker-compose-test.yml run --rm api-tests pytest -q` | Complete Plane API pytest collection through the fixed trusted helper, against a dependency-complete, digest-pinned image and the fixed ephemeral database/cache/queue/object-store network. |
| `CMD-SECURITY` local | `python -m ruff check --no-cache --select S apps/api/plane/curve/temporal/worker.py apps/api/plane/curve/temporal/worker_lifecycle.py` | Pinned Ruff security-rule pass over production code only; test assertions do not create an `S101` exception. Commit-bound Plane CodeQL remains the PR security gate. |
| `CMD-LOCAL-RUN` | Separate trusted-helper `SIGTERM` and `SIGINT` proofs against the existing Curve Compose worker, each with a ten-second deadline, fresh log cursor, exit-state capture, restart, and health check | Fixed local-runtime controller effect; raw Docker socket/argv is unavailable to the coding agent. The helper first proves the synthetic workspace has no non-terminal Operation, pending outbox item, or active attempt. |
| Supplemental diff hygiene | `git diff --check` | Existing closed `GIT_READ_ONLY` grammar; never a VCS mutation grant. |

The current `api-tests` Compose service installs `requirements/test.txt` from
its entrypoint, and the repository examples use `--build`. Neither behavior is
an available packet command. B-CODING-TOOLS-01 must bind either a prebuilt,
dependency-complete image plus a fixed non-installing helper entrypoint, or an
explicitly approved image-resolution and named-egress profile. It must never
silently inherit package installation, build, pull, or public egress. Python/
Ruff work occurs in a disposable boundary; any bytecode cache, task container,
network, or volume is removed and the clean tree plus resource absence is
verified. The absence of a Curve contract change makes the Plane JavaScript
contract-integrity script non-applicable to this bounded Python worker
correction.

### Live local signal proof

Use the existing local Plane Docker stack and Curve profile only through the
separately approved trusted-controller `OTHER` effect. The controller must
perform this exact algorithm for each signal:

1. Resolve one `curve-worker` container from the pinned Compose project and
   files; fail on zero or multiple matches. Record its immutable container ID,
   image digest, source-mount revision, original `unless-stopped` restart
   policy, start time, health state, and a fresh pre-signal log cursor.
2. Prove the purpose-created synthetic workspace has no non-terminal
   Operation, pending/claimed outbox item, or active attempt. Abort before a
   signal if the proof is incomplete or any unrelated work exists.
3. Temporarily set the resolved container's restart policy to `no` through the
   trusted controller so exit state cannot race automatic restart. For the
   `SIGTERM` case invoke container stop with signal `SIGTERM` and timeout ten
   seconds. In a separately recreated healthy case, invoke the same operation
   with signal `SIGINT` and timeout ten seconds. Raw Docker access remains
   unavailable to the coding agent.
4. Before any restart, inspect the same container ID and require terminal exit
   code `0` within ten seconds. Capture only the post-cursor log window, hash
   its exact bytes, and fail on the lifecycle `RuntimeError`, any traceback,
   forced-kill marker, timeout, or surviving worker process.
5. Restore `unless-stopped`, start the same Compose service, resolve its current
   container identity, and require Docker `running` plus the declared
   `plane.curve.temporal.health` check to become healthy within its configured
   health window. Record the restart identity and health observation.
6. In `finally`, restore the original restart policy and desired running state,
   remove task-local logs/resources, and record cleanup. If signal, inspection,
   restart, or cleanup fails, mark the proof failed and preserve the redacted
   evidence digest for review; never continue to the second signal from an
   unhealthy first case.

Each signal case therefore records the exact Compose files/project, original
and restarted container IDs, signal mechanism, command times, ten-second
deadline result, pre-signal cursor, post-cursor log digest, exit state, restored
restart policy, final health observation, and cleanup outcome.

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

## Blocked machine-publication blueprint

The canonical JSON is intentionally absent from the registry until the fields
below are resolved. This table is the publication blueprint, not a packet and
not implementation authority.

| Field | Required RUNTIME-M0-01 value or blocker |
| --- | --- |
| Identity | `packet_id: CURVE-RUNTIME-M0-01`; `work_package_id: RUNTIME-M0-01`; version `1`; size `S`; non-user-facing `STANDARD` risk. |
| Workspace | A real UUID for a persisted, purpose-created local Curve workspace containing synthetic `INTERNAL` data. `UNRESOLVED_WORKSPACE_ID` blocks even `BLOCKED` registry publication; fixture UUIDs cannot be reused. |
| Project tracking | Project `faocampo/2`; existing WORK_PACKAGE item `PVTI_lAHOBNjuQc4BgZzOzg4kt70`; issue [#46](https://github.com/faocampo/curve/issues/46) (graceful worker shutdown defect and acceptance). No duplicate item. |
| Repository | `git@github.com:faocampo/plane.git`; `preview`; exact base `99a73b4eab5ee21fd012d7358bc9259252d47f71` or a revalidated live descendant; feature branch `curve/runtime-m0-01-graceful-worker-shutdown`; exact-remote-tip stale-base policy. |
| Governance state | Four digest-bound state records for PRD, Architecture, ADR-001, and Development Plan. |
| Dependency and decisions | One M0-06 (accepted local Temporal skeleton) dependency record plus D-001 (Plane foundation) and D-003 (local runtime topology) decision records. |
| Contract applicability | API, schema, event, workflow, policy, persistence, and migration are all `NOT_APPLICABLE`, each with an exact rationale: this process supervisor changes no corresponding public/domain contract. |
| Policies | Seven digest-bound state records: data, model, tool, sandbox, budget, external effects, and rollback. Together with governance, dependency, and decision records, the minimum is fourteen state records. |
| Commands | Mandatory lint/build/test/security/local-run phases remain `PLANNED / UNAVAILABLE` until B-CODING-TOOLS-01 implements a representable reviewed grammar. |
| Data/model/budget | Synthetic `INTERNAL`; no protected data; model mode `NONE` with zero calls; US$0 external spend; one attempt; at most 120 compute minutes. |
| Sandbox | No credential; one active attempt; 2 vCPU; 8192 MiB; 7200 seconds; read-only `.git` and `AGENTS.md`; writes limited to the declared worker/helper/test files; exact selected runtime/image/network/cleanup profile remains unresolved. |
| External effects | Candidate-tree creation has none. Live worker stop/restart is one approved trusted-controller `OTHER` effect bound to the exact local Compose project/container, signal, deadline, preflight-idle proof, restart, health check, and cleanup. VCS push/draft PR effects require a separate trusted-controller contract or remain outside the packet. |

### Planned production artifact paths

| Publication role | Planned path |
| --- | --- |
| Authority source | `contracts/authority/runtime-m0-01-v1.json` |
| State evidence | `contracts/state/runtime-m0-01/*.json` |
| Context Manifest | `contracts/context/runtime-m0-01-v1.json` |
| Source catalog | `contracts/task-packet-sources/runtime-m0-01-v1.json` |
| Sealed registry packet | `contracts/task-packets/runtime-m0-01-v1.json` |
| Later implementation authorization | `contracts/task-packet-authorizations/runtime-m0-01-attempt-1-v1.json` |

Publication uses `S -> E1..En -> C -> P`. Authority-source evidence precedes
the state records that cite it; the Context Manifest binds exact `S` bytes; the
source catalog descends from every evidence revision; the sealed packet is the
only file added at `P`. The separate implementation authorization follows `P`
and still requires trusted verification plus one durable attempt lease.

## Tool, publication, and authority gates

This packet cannot enter the canonical machine task-packet registry as `READY`
until all of the following are true:

1. B-CODING-TOOLS-01 (local coding-tool execution profile) selects and
   implements a truthful safe command grammar for the Python/Docker/security
   evidence above.
2. The resulting runtime image/tool versions and executable digests are pinned.
3. Packet-specific governance, dependency, decision, policy, context, and
   source-catalog evidence is published in the required
   `S -> E1..En -> C -> P` order: normative source; authority sources followed
   by their state evidence and Context Manifest; source catalog; sealed packet
   registry.

B-CODING-AUTHORITY-01 (trusted human-state verification and durable attempt
lease) does not block these publication revisions or read-only readiness
preflight. It blocks implementation dispatch. After registry publication:

1. Federico Ocampo must approve the exact packet digest and execution tuple in
   a separate implementation-authorization record.
2. The selected authority profile must verify that grant and acquire one
   current-attempt lease before any Plane mutation or command execution.
3. Until then, a successful read-only preflight reports
   `PASSED_WITH_IMPLEMENTATION_AUTHORITY_REQUIRED` and grants no execution
   authority.

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
| Exact commands cannot run under the approved tool profile | Keep the packet blocked; do not substitute commands or weaken evidence. |

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
and its Project evidence is linked. It becomes machine-`READY` only after the
tool profile, exact state evidence and authority sources, Context Manifest,
source catalog, and registry publication chain pass the canonical preflight.
It becomes executable only after a separate exact-digest implementation
authorization satisfies the selected authority profile and one durable attempt
lease is acquired.
