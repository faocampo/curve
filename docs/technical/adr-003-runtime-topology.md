# ADR-003: Curve Runtime Topology and Temporal Profile

- Status: PROPOSED
- PRD decision: D-003
- Owner: Platform Operations
- Reviewers: Security, database operations, observability, Curve engineering
- Decision date: Pending named-owner approval
- Required by: Local M0-06 proof; every staging or production activation
- Supersedes: None

## Context and constraints

X3M already provides local, staging, and production topology on Kubernetes and AWS, PostgreSQL, Secrets Manager, S3/KMS-compatible object storage, identity, networking/egress controls, Prometheus/Grafana, logs, and tracing. Curve adds Temporal, gVisor, and OpenHands. Plane's existing Celery workers continue to own existing bounded Plane work; Temporal exclusively owns durable Curve lifecycle orchestration.

## Decision drivers and weighted criteria

1. Durable replay-safe human and provider waits.
2. Workspace isolation and data residency.
3. Reuse of supported X3M operations and observability.
4. Recoverability, versioned deployment, and safe rollback.
5. No production dependency introduced by the first local skeleton.

## Options considered

1. **Proposed:** local Temporal development service in the existing Plane Compose stack; isolated X3M-managed staging/production Temporal deployments with dedicated namespaces, persistence, credentials, workers, and operational ownership.
2. Temporal Cloud: deferred pending procurement, residency, security, and cost review.
3. Celery-only orchestration: rejected because it does not satisfy the PRD's durable workflow/history/replay contract.
4. Do nothing: blocks M0-06 and all lifecycle milestones.

## Evidence and proof results

The Plane candidate baseline and existing Compose stack have passed application, migration, worker, Beat, and health smoke tests. Temporal itself has not yet been added or proven. The authorized proof must pin server/SDK/image versions and demonstrate start, signal, query, cancellation, retry, restart, and replay using synthetic data.

The existing local stack is `docker-compose-local.yml`. It already provides the `dev_env` bridge network, PostgreSQL 15.7, Valkey 7.2.11, RabbitMQ 3.13.6, MinIO, the Django API/migrator, and the existing Celery worker and Beat processes. The API images use Python 3.12 on both supported development and production Dockerfiles. No Temporal package is present in the candidate Plane dependency set.

The proposed local pins were checked against official upstream metadata on 2026-08-12:

| Component | Proposed local pin | Evidence and constraint |
| --- | --- | --- |
| Temporal CLI/development server image | `docker.io/temporalio/temporal:1.8.1@sha256:59561b9ef060eaeb1f46cb6a1842d6cbdd8a393eb3b6d315ecef5fe2f0b1d7a6` | The [official CLI release](https://github.com/temporalio/cli/releases/tag/v1.8.1) contains the development server. Registry inspection resolved this multi-architecture index; platform manifests are `sha256:d7fe04db99586b7e20c3ee96ced04e5585be380b5a565cabb1fb40281f1a64b5` for `linux/amd64` and `sha256:92ca723892947bbc7bb0cb2b076dd1c16acf4a79de8661780912d5d49fa16416` for `linux/arm64`. |
| Embedded Temporal Server | `1.31.2` | CLI `1.8.1` includes the [Temporal Server 1.31.2 security update](https://github.com/temporalio/temporal/releases/tag/v1.31.2). The development image is not a staging/production server selection. |
| Temporal Python SDK | `temporalio==1.30.0` | The [official Python SDK release](https://github.com/temporalio/sdk-python/releases/tag/1.30.0) and [PyPI package](https://pypi.org/project/temporalio/1.30.0/) support Python 3.10 and later, including Plane's Python 3.12 image. Lockfile hash/provenance is captured by M0-S3 when the dependency is added. |
| Staging/production chart candidate | Temporal Helm chart `1.2.0`, server `1.31.2` | Upstream's [chart release](https://github.com/temporalio/helm-charts/releases/tag/temporal-1.2.0) and values are an evaluation baseline only. Platform Operations must approve image digests, chart values, schema/upgrade compatibility, and X3M placement before non-local use. |

No image was pulled and no service, volume, port, dependency, or repository code was changed while collecting this metadata.

## Proposed decision

- Add a `curve` Compose profile to `docker-compose-local.yml` containing the pinned Temporal CLI development image above and a dedicated `curve-worker` built from Plane's development API image. Do not add another PostgreSQL, queue, cache, object store, or observability service.
- Start the local service with `temporal server start-dev --ip 0.0.0.0 --namespace curve-local`, persist its synthetic-only SQLite state in a Curve-specific named development volume, expose gRPC/UI only on loopback ports `7233`/`8233`, and add a cluster-health check. The implementation packet must confirm these flags against the pinned binary before committing Compose.
- Use namespace `curve-local`, task queue `curve-control-plane-v1`, and workflow IDs `curve:{workspace_id}:{operation_id}` locally.
- Connect `curve-worker` over the internal `dev_env` network at `temporal:7233`. Give it only the Curve worker entrypoint and Plane application environment required for synthetic M0 operations; do not launch it through Celery or share Celery queues.
- Keep domain state in PostgreSQL. Temporal history contains opaque IDs, versions, digests, and safe correlation only—never protected bodies or credentials.
- Local Temporal SQLite is disposable orchestration history, not product truth. It may be retained across ordinary developer restarts to prove replay, but `down -v` is permitted only for the explicitly disposable Curve Temporal volume and never as an implicit cleanup of existing Plane volumes.
- In staging/production, use X3M-managed PostgreSQL infrastructure with separate Temporal persistence and visibility databases/schemas, dedicated credentials, and namespace-level application identities. Do not put Temporal tables in Plane's application schema.
- Candidate HA shape for Platform Operations review is three frontend, three history, three matching, and two worker replicas distributed across failure domains, with independently scalable history/matching and no public frontend. This is a sizing hypothesis, not an approved deployment.
- Exact chart/image digests, region, replicas/capacity, network policies, ingress, mTLS/auth, payload codec/encryption, backup/restore, RPO/RTO, maintenance window, schema-upgrade order, compatibility window, alerts, on-call, and cost owner remain mandatory named decisions before staging/production activation.
- Do not replace or repurpose Plane Celery.

## Local profile contract

| Concern | Proposed requirement | Proof before `DECIDED` |
| --- | --- | --- |
| Activation | Compose profile `curve`; off by default | Resolved Compose config and baseline health with profile absent/present. |
| Data | Synthetic identifiers and safe enums only; no protected body, credential, repository content, or production delegation | Inspect workflow histories and telemetry for sentinel protected strings. |
| Persistence | Curve-specific SQLite volume owned only by the dev server; PostgreSQL remains Curve domain truth | Restart server/worker and replay to completion; delete only a disposable copy during reset test. |
| Network | Internal `dev_env`; host gRPC/UI bound to `127.0.0.1`; no external provider required | Port inspection, network inspection, and provider-denial test. |
| Worker | Dedicated process built from Plane API image with `temporalio==1.30.0`; task queue `curve-control-plane-v1` | Health, graceful shutdown, worker restart, and task-queue isolation tests. |
| Compatibility | Pinned image/SDK, archived synthetic histories, explicit workflow patch markers | Replay old histories against candidate worker before upgrade. |
| Operations | Correlation, safe logs, SDK/server metrics where supported, stuck workflow and outbox backlog visibility | Local trace/metric/log evidence without protected strings. |
| Rollback | Disable profile and relay dispatch; preserve inspectable application state; no Plane table/volume removal | Start existing Plane stack without Curve and rerun its health smoke. |

## Staging and production decision matrix

The following cells must be completed by named Platform Operations, Security, and database owners. Defaults are fail-closed; a coding agent cannot infer them from the local profile.

| Decision field | Staging | Production |
| --- | --- | --- |
| AWS account/region, cluster, namespace, residency | **Required** | **Required** |
| Helm/chart and every image digest | **Required** | **Required** |
| Frontend/history/matching/worker replica and resource sizing | **Required** | **Required** |
| PostgreSQL endpoint, separate databases/schemas, credentials, schema-management owner | **Required** | **Required** |
| Network policy, service discovery, mTLS, authorization, certificate rotation | **Required** | **Required** |
| Namespace retention and allowed payload/search attributes | **Required** | **Required; consistent with D-009** |
| Payload codec/encryption and key ownership | **Required** | **Required** |
| Metrics/logs/traces, dashboards, alerts, on-call and escalation | **Required** | **Required** |
| Backup/restore, RPO/RTO, DR topology and witnessed exercise | **Required before activation** | **Required before activation** |
| Schema/server/SDK/worker upgrade order, rollback and compatibility window | **Required** | **Required** |
| Capacity/load test, cost centre and lifecycle owner | **Required** | **Required** |

## Security, privacy, licensing, and operational impact

The local proof uses synthetic data. Non-local use is blocked until Platform Operations and Security approve placement, network paths, secrets, TLS/auth, encryption, telemetry, retention, backup/restore, and on-call ownership.

## Data/API/event/migration compatibility impact

Temporal workflow input uses versioned contract objects with identifiers/digests only. Workflow changes use explicit version markers and replay tests. Database migrations remain owned by the Curve Django app.

## Failure, rollback, and exit strategy

Curve is disabled by default. Removing the Compose profile and `curve-worker` leaves existing Plane API, Celery, and data behavior unchanged. Failed or incompatible histories remain pinned to their worker build until replay compatibility or controlled termination is approved.

## Implementation consequences and affected work packages

Blocks P0-06, M0-06, M0-08 recovery evidence, M4 runners, and M6 previews according to the approved environment scope.

## Validation and review date

The local version/image proposal and proof contract are ready for named review. This ADR remains `PROPOSED` pending:

- Platform Operations approval of the local pins/profile and authorization to implement P0-06/M0-S3;
- execution of the synthetic local start/signal/query/cancel/retry/restart/replay proof;
- completion and approval of the staging/production decision matrix before either environment is activated; and
- a decision date, review date, and named owner/on-call record.
