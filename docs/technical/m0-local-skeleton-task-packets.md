# M0 Local Skeleton Task Packets

## Document control

| Field | Value |
| --- | --- |
| Status | M0-S1, M0-S2, M0-03, and M0-S3 completed; M0-S4 implementation is in human review; M0-S5 contracts are proposed for material approval |
| Version | 2.3 |
| Date | 2026-08-21 |
| Product baseline | [Curve PRD v0.12](../curve-ai-native-sdlc-prd.md) (current product requirements, Curve-first shell invariant, effective D-003 local profile, and accepted M0-S3 evidence) |
| Contract baseline floor | Accepted Curve `main` commit `42ea32981a3d5ce814a74c18e458ac8152a7e2fa` containing the approved M0-S4 Definition/UX artifacts; each coding attempt refreshes and pins the current merged Curve context before mutation |
| Plane implementation base | M0-S3 merge commit `d99342f589db4eb488695487d3ae3f2c16bf0874` on fork `preview` |

## Purpose

This document defines five repository-local implementation packets for the first
Curve vertical proof. It is not an approval record. The dispatcher materializes
one immutable packet at a time and records the exact Curve revision containing
this specification. A packet is `READY` only after every placeholder and
dependency below is resolved; otherwise the coding agent stops before mutation.

## Shared dispatch context

| Field | Required value |
| --- | --- |
| Repository | `git@github.com:faocampo/plane.git` |
| Base branch | Fork `preview` |
| Base SHA | `922dd6de5d5ed5081f35cd88343154022867ccad`; every materialized M0-S3 packet must verify the live base still matches or use a separately reviewed descendant |
| Curve revision | At least Curve baseline `b55d90fa71438e8ed2a5bf11e04be4b32295e935`; M0-S3 materialization records the exact merged Curve revision containing the 2026-08-20 D-003 connectivity amendment, this packet, and its deterministic context digest |
| GitHub Project item | Exact visual-tracking item in [Curve GitHub Project #2](https://github.com/users/faocampo/projects/2), derived from the owning M0 package and maintained during delivery |
| Branch | One feature branch per packet; M0-S3 uses `curve/m0-s3-temporal-round-trip` from the exact Plane base above |
| Human owner | Federico Ocampo for M0-S1 through M0-S3; every later M0 packet records its own named person at dispatch; role-only values are invalid |
| Human reviewer | Federico Ocampo (`faocampo`) for the current phase, distinct from the coding agent; any replacement must be named at dispatch |
| Data | Synthetic `INTERNAL` local fixtures only; no protected object bodies, repository secrets, customer data, or production data |
| Model policy | Dispatcher-approved coding model; no Curve Model Gateway or runtime model call; no silent model/provider substitution |
| Tool policy | Repository read/write, `git` read-only status/diff, `pnpm`, Docker Compose, and test tools only; no push, PR, deploy, cloud console, or external-system mutation |
| Sandbox | Repository-scoped writes; no production credential; default-deny external egress except approved dependency retrieval; one active attempt; 2 vCPU, 8 GiB, two-hour limit when automated execution is used |
| Cost budget | US$25 maximum automated attempt; dependency and local compute cost only; pause on exhaustion |
| Global checks | `git diff --check`; `pnpm check`; `pnpm build`; complete Plane backend suite against the existing local Plane Docker services; M0-S3 overlay/profile health, dependency-connectivity, loopback-exposure, replay, restart, cancellation, leakage, and rollback proof |
| Cleanup | Stop only the Curve local profile and explicitly named disposable Temporal volume when reset is intended; retain the existing Plane stack, source diff, and sanitized test evidence |

The repository instructions at `AGENTS.md`, `apps/api/tests/RUNNING_TESTS.md`,
and `apps/api/tests/TESTING_GUIDE.md` are binding. `./setup.sh` is a human-run
one-time prerequisite when local `.env` files do not exist; an agent MUST NOT
overwrite an existing environment file.

## Shared readiness blockers

| Blocker | Required resolution |
| --- | --- |
| `B-PUBLISH` | Satisfied through M0-S3: Curve amendment/context revision `aece539...` and Plane implementation merge `d99342f...` are published. Each later packet still requires its exact Curve context publication. |
| `B-REVIEW` | Satisfied through M0-S3: Federico approved Plane PR #5 exact head `7fd231b...`, merged as `d99342f...`. Each later implementation output still requires its own exact-head review. |
| `B-BASE` | Satisfied through M0-S3: reviewed upstream-sync, M0-S1, M0-S2, M0-03, and M0-S3 are preserved in fork history; current accepted `preview` is `d99342f589db4eb488695487d3ae3f2c16bf0874`. |
| `B-D001` | Satisfied on 2026-08-15: D-001 is `DECIDED` by Federico Ocampo against ADR digest `sha256:0c780a0264dcc1a301ee412dfce18c3c50453436679c8d4a55729052bdcdc488`; [approval record](https://github.com/faocampo/curve/pull/1#issuecomment-5302192671). |
| `B-P002` | Satisfied for `LOCAL_ONLY`: Curve PR #9 merged the original decision as `097016f...`; Curve PR #15 merged its shared-network amendment as `aece539...`. |
| `B-D003` | Satisfied for local M0-S3: the effective [D-003 connectivity amendment](d003-private-platform-connectivity-amendment.md) (shared local network, EKS direction, controls, and revised proof) selects Plane `dev_env`, direct loopback Temporal ports, and the private-EKS connectivity/security model. Environment activation still requires its reviewable operations package. |
| `B-PEOPLE` | Satisfied for M0-S1 through M0-S3: Federico Ocampo is the named human owner and reviewer; the AI coding agent remains the separate implementer. Every later M0 packet records a named human owner plus Federico Ocampo (`faocampo`) or a named replacement reviewer. |
| `B-CONTEXT` | Satisfied for M0-S3: the Plane context manifest binds Curve revision `aece539...`, 39 path/file digests, aggregate digest `sha256:0edadab2...`, Plane base `922dd6d...`, owner, reviewer, and task ID. Later packets require new manifests. |
| `B-PROJECT` | Satisfied for M0-S3: item `PVTI_lAHOBNjuQc4BgZzOzg3CeqQ` exists exactly once and is `Done` in GitHub Project #2. Its status is informational and does not gate dispatch. |

No coding agent may resolve these blockers or change an ADR from `PROPOSED` to
`DECIDED`.

## Packet M0-S1: Module shell

| Field | Dispatch specification |
| --- | --- |
| Task ID | `CURVE-M0-S1-MODULE-SHELL` |
| Status | `COMPLETED`: merged through Plane PR #2 at exact implementation head `81712b66e22f1a60883a619c5db63a2101dc365d` and merge commit `7685bbc7cc5e1ab34f11e3912d9e47d31c365a9a`; Project item M0-01 is `Done` |
| Risk | `STANDARD`; new workspace authorization and application route boundary |
| Human owner and reviewer | Federico Ocampo (`faocampo`); the AI coding agent is the separate implementer |
| Outcome | Add a dedicated `plane.curve` Django app and an additive workspace UI shell, both disabled by default, without changing unrelated Plane behavior. |
| Traceability | FR-001, FR-022; NFR-015-NFR-016; AC-01, AC-35 |
| In scope | `apps/api/plane/curve/`; `apps/api/plane/settings/common.py`; `apps/api/plane/urls.py`; Curve-only tests; `apps/web/app/routes/`; Curve UI namespace; `packages/types/`; `packages/services/`; minimal configuration seam; minimal `apps/web` Vitest and React Testing Library harness for Curve tests |
| Out of scope | Persisted Operation behavior, Temporal, providers, protected storage, policy engine, models/LLMs, production flags, and existing Plane route refactors |
| Contracts | Public API prefix in `contracts/openapi/curve-v1.openapi.yaml`; `workspace-record.schema.json`; authorization lookup ordering in `m0-authorization-and-state-matrices.md` |
| Migration | Add the Curve app and its initial additive migration; do not modify Plane migrations or existing tables. |
| Rollback | Disable Curve configuration and routes; reverse the Curve migration only in the disposable test database; revert the packet commit. |
| D-001 proof ownership | This packet must produce the accepted additive migration, feature-disabled behavior, and rollback evidence allocated by ADR-001. It cannot satisfy this field with design text alone. |

### M0-S1 executable acceptance

1. Given Curve is disabled, when an existing workspace is opened, then no Curve
   navigation, UI route, or API route is exposed and existing Plane tests pass.
2. Given Curve is enabled locally for workspace A, when an authorized member
   opens the Curve route, then the empty shell renders without provider calls.
3. Given a member of workspace A requests a Curve URL for workspace B, when the
   request is authorized, then it is denied before any workspace-B object lookup.
4. Given a disposable database, when Curve migrations run forward, backward to
   zero, and forward again, then all three commands succeed without changing an
   existing Plane table.
5. Given the additive Curve migration is applied in the persistent local Plane
   stack, when Curve is disabled and the services restart, then existing Plane
   routes, navigation, APIs, and repository-native tests remain unchanged,
   Curve entry points remain inaccessible, and no destructive down-migration is
   applied to the persistent stack.

### M0-S1 required commands

```text
git diff --check
pnpm --filter=web check:lint
pnpm --filter=web check:types
pnpm --filter=web test
pnpm --filter=web build
pnpm --filter=@plane/types check:types
pnpm --filter=@plane/services check:types
docker compose -f docker-compose-test.yml run --rm --build api-tests pytest plane/curve/tests -m "unit or contract or migration or rollback"
docker compose -f docker-compose-test.yml run --rm api-tests python manage.py makemigrations --check --dry-run
docker compose -f docker-compose-test.yml run --rm api-tests python manage.py migrate curve zero
docker compose -f docker-compose-test.yml run --rm api-tests python manage.py migrate curve
pnpm check
pnpm build
```

## Packet M0-S2: Operation and delivery kernel

| Field | Dispatch specification |
| --- | --- |
| Task ID | `CURVE-M0-S2-DELIVERY-KERNEL` |
| Status | `COMPLETED`: Plane PR #3 merged approved implementation head `f520075493290389aa54532baec36268c34e2885` into `preview` at `eff8686a69aa112ea8fda79be0e1316dc1fd97d6`; M0-02 and M0-05 Project items are `Done` |
| Risk | `STANDARD`; transactional and immutable control-plane state |
| Human owner and reviewer | Federico Ocampo (`faocampo`); the AI coding agent is the separate implementer |
| Outcome | Persist workspace-scoped Operation, durable DomainEvent, outbox, inbox, digest-only idempotency, and append-only audit records atomically. |
| Traceability | FR-007, FR-021, FR-023, FR-044; NFR-004-NFR-005, NFR-018; AC-08, AC-26, AC-33-AC-34, AC-56 |
| In scope | Curve models/migrations, uniqueness/check constraints, command service, transaction boundaries, optimistic concurrency, relay claim/ack/retry/dead-letter primitives, safe audit metadata, unit/contract/concurrency tests |
| Out of scope | Temporal SDK, network relay, provider callbacks, protected bodies/object storage, general authorization policy adapters |
| Contracts | `operation.schema.json`; `operation-event-v1.schema.json`; `event-envelope.schema.json`; `outbox-event.schema.json`; `inbox-message.schema.json`; `idempotency-record.schema.json`; `audit-event.schema.json`; [M0-S2 relational contract](../../contracts/database/m0-s2-relational-contract.md); state matrix |
| Migration | Add only Curve-owned tables and indexes. Prove forward/backward/forward on a disposable database and retain generated SQL for review. |
| Rollback | Stop relay/API writers, preserve inspection access, reverse only unshipped local Curve migrations, and revert the packet commit. |
| Accepted evidence | [M0-S2 implementation evidence](m0-s2-implementation-evidence.md) (exact contract, context, implementation, merge, tests, and rollback binding) |

### M0-S2 executable acceptance

1. Given the same workspace, principal, command, idempotency key, and request
   digest, when submitted twice, then the second call returns the first result
   and creates no second domain effect.
2. Given an existing idempotency key, when its request digest changes, then the
   command fails with `409` and records a safe no-effect audit event.
3. Given two relay claimers, when both contend for one pending outbox row, then
   only one claim can produce an external-delivery attempt.
4. Given an aggregate version is stale, when a mutation is attempted, then it
   fails with `412` and no outbox event is committed.
5. Given a workspace-A identity and workspace-B identifiers, when any kernel
   query or mutation runs, then no workspace-B row or existence detail is exposed.
6. Given any accepted command, when its idempotency key crosses the command
   boundary, then only its SHA-256 digest is persisted or logged and the raw key
   is absent from every database record, event, audit field, and error.
7. Given a terminal, claimed, retry-scheduled, delivered, or processed state,
   when a state-required field is null, then both JSON Schema validation and the
   PostgreSQL check constraint reject the record.
8. Given concurrent event, audit, outbox, inbox, or idempotency writes, when
   their approved workspace-scoped uniqueness key collides, then exactly one
   record commits and no cross-workspace collision occurs.

### M0-S2 required commands

```text
git diff --check
pnpm check:contracts
docker compose -f docker-compose-test.yml run --rm --build api-tests pytest plane/curve/tests -m "unit or contract"
docker compose -f docker-compose-test.yml run --rm api-tests pytest plane/curve/tests -k "idempotency or outbox or inbox or audit or concurrency"
docker compose -f docker-compose-test.yml run --rm api-tests python manage.py makemigrations --check --dry-run
docker compose -f docker-compose-test.yml run --rm api-tests python manage.py migrate curve zero
docker compose -f docker-compose-test.yml run --rm api-tests python manage.py migrate curve
pnpm check
pnpm build
docker compose -f docker-compose-test.yml up --build --abort-on-container-exit --exit-code-from api-tests
```

## Independent packet M0-03: Core authorization and policy kernel

M0-03 (core authorization and policy kernel) is completed. Its
[M0-03 core policy task packet](m0-03-core-policy-task-packet.md)
(security scope, acceptance tests, commands, and rollback),
[M0-03 relational contract](../../contracts/database/m0-03-policy-contract.md)
(append-only decision persistence, evaluation order, transaction binding,
migration, and rollback), and [M0-03 implementation evidence](m0-03-implementation-evidence.md)
(exact context, Plane head/merge, validation, security acceptance, and rollback)
bind approved implementation head `a807dd7...` and merge `922dd6d...`.

## Packet M0-S3: Temporal round trip

| Field | Dispatch specification |
| --- | --- |
| Task ID | `CURVE-M0-S3-TEMPORAL-ROUND-TRIP` |
| Status | `COMPLETED`: Plane PR #5 merged approved head `7fd231b062dc485b37078979a78ec83618be78d8` as `d99342f589db4eb488695487d3ae3f2c16bf0874`; [M0-S3 implementation evidence](m0-s3-implementation-evidence.md) (exact context, merge, tests, runtime proof, security acceptance, and rollback) is the acceptance record |
| Risk | `STANDARD`; durable asynchronous control flow, local synthetic data only |
| Human owner and reviewer | Federico Ocampo (`faocampo`); the AI coding agent is the separate implementer |
| Plane repository/base | `git@github.com:faocampo/plane.git`; `preview` at `922dd6de5d5ed5081f35cd88343154022867ccad` |
| Feature branch | `curve/m0-s3-temporal-round-trip` |
| Curve context | Explicit `M0-S3` path manifest in `scripts/lib/context-pack.mjs`; the Plane implementation stores the post-merge Curve revision, per-file SHA-256 values, aggregate digest, and ownership before mutation |
| Project item | `PVTI_lAHOBNjuQc4BgZzOzg3CeqQ` in [Curve GitHub Project #2](https://github.com/users/faocampo/projects/2) (visual M0-S3 progress tracker) |
| Outcome | Deliver one harmless Operation through the outbox, a dedicated Temporal worker, idempotent application activities, cancellation, and terminal audit state. |
| Traceability | FR-015, FR-022; NFR-004; AC-17-AC-21, AC-58 |
| In scope | `temporalio==1.31.0`; separate Curve worker entrypoint built from the API image; Curve-only `docker-compose-curve.yml` overlay and `curve` profile; shared Plane `dev_env`; direct loopback-only Temporal gRPC/UI ports; worker environment and credential allowlist; namespace/task queue; workflow/activity contracts; relay dispatch; cancellation; replay corpus; local health, dependency-connectivity, exposure, restart, leakage, and rollback checks |
| Out of scope | Staging/production Temporal, OpenHands, gVisor, protected payloads, Celery replacement, business workflows |
| Contracts | [M0 workflow contract](../../contracts/temporal/m0-workflow-contract.md) (workflow identifiers, payloads, retries, cancellation, and replay); Operation/Event/Outbox/Inbox/Audit schemas; [ADR-003](adr-003-runtime-topology.md) (live topology, pins, evidence, and rollback); [D-003 connectivity amendment](d003-private-platform-connectivity-amendment.md) (shared local network, private EKS direction, security boundary, and revised acceptance) |
| Migration | Additive Operation workflow fields/indexes only if the reviewed contract requires them; otherwise no migration. |
| Rollback | Disable relay dispatch and the `curve` profile; stop the Curve worker/Temporal services; retain inspectable terminal/cancelled operations; revert the packet commit. |

### M0-S3 executable acceptance

1. Given duplicate outbox delivery for one Operation, when the relay starts the
   workflow twice, then Temporal and the application record one workflow effect.
2. Given the worker stops after an activity effect but before acknowledgement,
   when it restarts, then retry completes without a duplicate mutation.
3. Given an authorized cancellation, when the workflow is running, then the
   Operation reaches `CANCELLED` without an orphaned activity or resource.
4. Given every committed replay fixture, when replayed with the new worker, then
   no nondeterminism error occurs.
5. Given Temporal payloads and histories are inspected, then they contain only
   identifiers, digests, classifications, and approved references—never protected bodies.
6. Given the existing Plane stack is started without the Curve overlay, then
   its resolved Compose model, services, routes, and repository-native checks
   remain unchanged.
7. Given `curve-worker` is running on `dev_env`, when its dependency health is
   checked, then Temporal and PostgreSQL resolve and accept connections; the
   resolved Compose model contains no Curve-specific network or proxy.
8. Given sentinel protected strings are supplied to negative fixtures, when the
   round trip completes, then none appears in Temporal history, logs, traces,
   metric labels, or safe errors.
9. Given Temporal host access is inspected, then gRPC and UI are reachable at
   `127.0.0.1:7233` and `127.0.0.1:8233`, and neither port publishes on a
   non-loopback host address.

### M0-S3 required commands

```text
git diff --check
docker compose -f docker-compose-local.yml up -d plane-db plane-redis plane-mq plane-minio api worker beat-worker
docker compose -f docker-compose-local.yml -f docker-compose-curve.yml --profile curve config
docker compose -f docker-compose-local.yml -f docker-compose-curve.yml --profile curve build api curve-worker
docker compose -f docker-compose-local.yml -f docker-compose-curve.yml --profile curve up -d
docker compose -f docker-compose-local.yml -f docker-compose-curve.yml --profile curve ps
docker compose -f docker-compose-local.yml -f docker-compose-curve.yml --profile curve exec api pytest plane/curve/tests -k "workflow or temporal or replay or cancellation"
docker compose -f docker-compose-local.yml -f docker-compose-curve.yml --profile curve exec curve-worker python -m plane.curve.temporal.health
docker compose -f docker-compose-local.yml -f docker-compose-curve.yml --profile curve exec curve-worker python -m plane.curve.temporal.proof
docker compose -f docker-compose-local.yml -f docker-compose-curve.yml --profile curve port temporal 7233
docker compose -f docker-compose-local.yml -f docker-compose-curve.yml --profile curve port temporal 8233
docker compose -f docker-compose-local.yml -f docker-compose-curve.yml --profile curve stop curve-worker temporal
docker compose -f docker-compose-local.yml -f docker-compose-curve.yml --profile curve rm -f curve-worker temporal
pnpm check
pnpm build
docker compose -f docker-compose-local.yml ps
```

## Packet M0-S4: API, SSE, and minimal UI

| Field | Dispatch specification |
| --- | --- |
| Task ID | `CURVE-M0-S4-API-SSE-UI` |
| Status | `IMPLEMENTATION_IN_PROGRESS`: M0-S1 through M0-S3 are merged; Federico Ocampo is owner and human reviewer; UX-004-M0-S4 (clickable prototype and task-based review) and UX-005-M0-S4 (work-package-linked screen contract) are approved through Curve PR #17; the Plane implementation branch is `curve/m0-s4-api-sse-ui`; M0-S4 and M0-07 remain open until the implementation and acceptance evidence are reviewed. |
| Risk | `STANDARD`; authenticated user-visible API and workspace boundary |
| Outcome | Expose authorized Operation create/read/cancel behavior, resumable workspace events, and a minimal local foundation-probe UI. |
| Traceability | FR-023; NFR-002-NFR-005, NFR-013; AC-01, AC-20, AC-35 |
| In scope | DRF endpoints; RFC 9457 errors; ETag/If-Match; idempotency; cursor pagination with server-side Operation-type filtering; local-only probe command; SSE resume; generated/checked TypeScript types/services; workspace page; API and state-view tests extending the M0-S1 frontend harness |
| Out of scope | General initiative UI, evidence, provider configuration UI, WebSockets, production probe endpoint, broad frontend test-platform refactor |
| Contracts | `curve-v1.openapi.yaml`; `operation.schema.json`; `sse-event.schema.json`; error/idempotency/pagination conventions; authorization/state matrices |
| Migration | None unless an approved contract defect requires an additive Curve migration; stop for contract review before adding it. |
| Rollback | Disable the Curve UI and API routes, stop SSE publication, retain operation/audit records, and revert the packet commit. |

### M0-S4 executable acceptance

1. Given an authorized request with a new idempotency key, when the probe is
   created, then the API returns `202`, `Location`, ETag, and a contract-valid Operation.
2. Given an incorrect or absent `If-Match`, when cancellation is requested, then
   the API returns safe `412` or `428` Problem Details and commits no mutation.
3. Given an SSE client reconnects with its last acknowledged event ID, when newer
   events exist, then only later events stream in order without duplication.
4. Given a cursor older than the supported replay window, when SSE reconnects,
   then the server returns `410` with a recoverable resync instruction.
5. Given a workspace-A identity probes workspace B, when the endpoint resolves,
   then authorization fails before object disclosure.
6. Given disabled, loading, running, failed, cancelled, and succeeded states, when
   rendered, then the page is keyboard-accessible and exposes no raw server error.
7. Given a newer unrelated Operation exists, when Foundation status loads, then
   the server-side `FOUNDATION_PROBE` filter is applied before pagination and the
   unrelated Operation is neither rendered nor cancellable.

### M0-S4 required commands

```text
git diff --check
pnpm --filter=web test
pnpm --filter=web check:lint
pnpm --filter=web check:types
pnpm --filter=web build
pnpm --filter=@plane/types check:types
pnpm --filter=@plane/services check:types
docker compose -f docker-compose-test.yml run --rm --build api-tests pytest plane/curve/tests -m contract
docker compose -f docker-compose-test.yml run --rm api-tests pytest plane/curve/tests -k "operation or sse or idempotency or workspace"
pnpm check
pnpm build
docker compose -f docker-compose-test.yml up --build --abort-on-container-exit --exit-code-from api-tests
```

## Packet M0-S5: Audit and observability

| Field | Dispatch specification |
| --- | --- |
| Task ID | `CURVE-M0-S5-OBSERVABILITY` |
| Status | `PROPOSED_FOR_MATERIAL_APPROVAL`: [standalone M0-S5 task packet](m0-s5-observability-task-packet.md) (safe telemetry kernel, X3M binding proof, tests, evidence, and rollback) is materialized for exact-head review; code remains blocked by M0-S4 merge/evidence and contract approval |
| Risk | `STANDARD`; telemetry is a potential data-exfiltration boundary |
| Outcome | Correlate the local Operation across HTTP, database, relay, workflow, and UI without leaking protected or credential data. |
| Traceability | FR-021, FR-024; NFR-001-NFR-014; AC-34, AC-36, AC-53 |
| Delivery split | M0-S5A (telemetry kernel and static observability assets) is independently reviewable after M0-S4; M0-S5B (X3M local observability integration proof) additionally requires OBS-BIND-001 (local X3M OTLP/Prometheus/Grafana binding) |
| In scope | Curve-private providers with explicit static resources, sampler, span limits, TLS inputs, temporality, views, and shutdown; structured safe logs with byte limits; bounded Prometheus metrics; audit completeness; redaction tests; local Grafana dashboard definition; four application/worker alerts; repository-local asset checker; process-local exporter diagnostics |
| Out of scope | Raw prompt/code/evidence telemetry, Langfuse model traces, production SLO approval, production dashboard deployment |
| Contracts | [Telemetry manifest v1](../../contracts/observability/m0-s5-telemetry-v1.json) (exporter, metrics, spans, logs, dashboard, four alerts, and redaction); [telemetry manifest schema](../../contracts/schemas/telemetry-manifest.schema.json) (machine validation and fail-closed defaults); [operation event v2 schema](../../contracts/schemas/operation-event-v2.schema.json) (optional validated trace carrier without migration); Audit, Access Envelope, Event, and Operation schemas; [Security and operations](security-and-operations.md) (telemetry, redaction, and incident controls) |
| Migration | No migration expected. Stop for contract review if new persisted telemetry fields are proposed. |
| Rollback | Disable Curve exporters and remove the dashboard definition while retaining minimum application audit records; revert the packet commit. |

### M0-S5 executable acceptance

The executable scenarios, closed telemetry surface, configuration behavior,
cardinality limits, required tests, evidence, stop conditions, and two-stage
rollback are governed by the [standalone M0-S5 task packet](m0-s5-observability-task-packet.md)
(safe telemetry kernel and X3M local-integration proof). Its M0-S5A acceptance
uses deterministic in-memory exporters. Its M0-S5B acceptance uses only the
owner-approved OBS-BIND-001 (local X3M OTLP/Prometheus/Grafana binding).

### M0-S5 required commands

```text
git diff --check
pnpm check:contracts
node apps/api/plane/curve/contracts/check-integrity.mjs
node apps/api/plane/curve/observability/check-assets.mjs
docker compose -f docker-compose-test.yml run --rm --build api-tests pytest plane/curve/tests -k "audit or telemetry or redaction or correlation"
docker compose -f docker-compose-test.yml run --rm api-tests pytest plane/curve/tests
pnpm check
pnpm build
docker compose -f docker-compose-test.yml up --build --abort-on-container-exit --exit-code-from api-tests
docker compose -f docker-compose-test.yml down -v
```

The M0-S5B (X3M local observability integration proof) commands are added from
OBS-BIND-001 (local X3M OTLP/Prometheus/Grafana binding) when that record is
complete; no endpoint or provisioning command is inferred.

## Local vertical checkpoint

The checkpoint passes only when all five packet branches have been reviewed and
merged in dependency order. An authorized user enables Curve locally, starts one
synthetic probe, observes `PENDING` through a terminal state over SSE, and traces
exactly one outbox delivery, workflow, activity result, Operation history, and
audit chain. Reusing the idempotency key and restarting the worker produce no
duplicate effect. Cancellation leaves no orphaned work. Disabling Curve restores
the original Plane experience, and the complete Plane frontend/backend suites pass.

Protected storage, staging/production activation, OpenHands, Orca, GitLab/GitHub
mutation, Onyx, model calls, and customer data are outside this checkpoint.
