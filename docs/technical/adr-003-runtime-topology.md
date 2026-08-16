# ADR-003: Curve Runtime Topology and Temporal Profile

- Status: PROPOSED
- PRD decision: D-003 (runtime topology and trust-zone decision)
- Owner: Federico Ocampo, CTO at X3M, acting as Platform Operations decision owner for `LOCAL_ONLY`
- Reviewers: Security, database operations, observability, Curve engineering
- Proof-scope and two-stage direction approval date: 2026-08-15
- Decision date: Pending accepted P0-06B (least-privilege Plane integration
  proof) evidence and named-owner disposition
- Required by: M0-06 (Temporal workflow-skeleton work package); every staging or production activation
- Supersedes: the historical shared-`dev_env` local candidate documented below; no accepted ADR

## Context and constraints

X3M already provides local, staging, and production topology on Kubernetes and AWS, PostgreSQL, Secrets Manager, S3/KMS-compatible object storage, identity, networking/egress controls, Prometheus/Grafana, logs, and tracing. Curve adds Temporal, gVisor, and OpenHands. Plane's existing Celery workers continue to own existing bounded Plane work; Temporal exclusively owns durable Curve lifecycle orchestration.

## Decision drivers and weighted criteria

1. Durable replay-safe human and provider waits.
2. Workspace isolation and data residency.
3. Reuse of supported X3M operations and observability.
4. Recoverability, versioned deployment, and safe rollback.
5. No production dependency introduced by the first local skeleton.

## Options considered

1. **Approved proof sequence, topology unresolved:** P0-06A (isolated Temporal feasibility proof) first validates primitive behavior; a separately planned and exact-head-approved P0-06B (least-privilege Plane integration proof) selects and validates the local network, worker environment, credentials, and service dependencies.
2. **Historical candidate, superseded:** local Temporal development service and a Curve worker on Plane's shared `dev_env` network. Security review superseded this topology before execution.
3. Temporal Cloud: deferred pending procurement, residency, security, and cost review.
4. Celery-only orchestration: rejected because it does not satisfy the PRD's durable workflow/history/replay contract.
5. Do nothing: blocks M0-06 (Temporal workflow-skeleton work package) and all lifecycle milestones.

## Evidence and proof results

The Plane candidate baseline and existing Compose stack have passed application, migration, worker, Beat, and health smoke tests. Temporal itself has not yet been added or proven. P0-06A (isolated Temporal feasibility proof) must first prove pinned server/SDK primitives in isolation. A later, separately approved P0-06B (least-privilege Plane integration proof) must select and prove the final Plane-integrated local topology with synthetic data.

The existing local stack is `docker-compose-local.yml`. It already provides the `dev_env` bridge network, PostgreSQL 15.7, Valkey 7.2.11, RabbitMQ 3.13.6, MinIO, the Django API/migrator, and the existing Celery worker and Beat processes. The API images use Python 3.12 on both supported development and production Dockerfiles. No Temporal package is present in the candidate Plane dependency set.

The proposed local pins were checked against official upstream metadata on 2026-08-12:

| Component | Proposed local pin | Evidence and constraint |
| --- | --- | --- |
| Temporal CLI/development server image | `docker.io/temporalio/temporal:1.8.1@sha256:59561b9ef060eaeb1f46cb6a1842d6cbdd8a393eb3b6d315ecef5fe2f0b1d7a6` | The [official CLI release](https://github.com/temporalio/cli/releases/tag/v1.8.1) contains the development server. Registry inspection resolved this multi-architecture index; platform manifests are `sha256:d7fe04db99586b7e20c3ee96ced04e5585be380b5a565cabb1fb40281f1a64b5` for `linux/amd64` and `sha256:92ca723892947bbc7bb0cb2b076dd1c16acf4a79de8661780912d5d49fa16416` for `linux/arm64`. |
| Embedded Temporal Server | `1.31.2` | CLI `1.8.1` includes the [Temporal Server 1.31.2 security update](https://github.com/temporalio/temporal/releases/tag/v1.31.2). The development image is not a staging/production server selection. |
| Temporal Python SDK | `temporalio==1.30.0` | The [official Python SDK release](https://github.com/temporalio/sdk-python/releases/tag/1.30.0) and [PyPI package](https://pypi.org/project/temporalio/1.30.0/) support Python 3.10 and later, including Plane's Python 3.12 image. Lockfile hash/provenance is captured by M0-S3 when the dependency is added. |
| Staging/production chart candidate | Temporal Helm chart `1.2.0`, server `1.31.2` | Upstream's [chart release](https://github.com/temporalio/helm-charts/releases/tag/temporal-1.2.0) and values are an evaluation baseline only. Platform Operations must approve image digests, chart values, schema/upgrade compatibility, and X3M placement before non-local use. |

No image was pulled and no service, volume, port, dependency, or repository code was changed while collecting this metadata.

## Historical local candidate and retained constraints

The local bullets below record the original planning candidate for traceability.
They are superseded and provide no P0-06B (least-privilege Plane integration
proof) topology, network, worker-environment, credential, or execution authority.
P0-06B must replace them with a separately reviewed design before any
Plane-integrated proof can run.

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

All shared-`dev_env` and Plane application-environment content above is retained
as superseded candidate evidence, not as the contract for P0-06B (least-privilege
Plane integration proof) or an authorized execution path. Security review
found that an untrusted proof worker on the shared network could reach local
PostgreSQL, RabbitMQ, Valkey, MinIO, and development credentials. Federico
approved a two-stage proof response: P0-06A (isolated Temporal feasibility
proof) runs fully isolated and cannot validate or decide this profile;
P0-06B (least-privilege Plane integration proof) must first define a new
least-privilege integration topology and receive separate exact-head approval.
Its approved design replaces the historical local candidate before D-003
(runtime topology and trust-zone decision) can become `DECIDED` for
`LOCAL_ONLY`.

## P0-06B (least-privilege Plane integration proof) decision contract

| Concern | Proposed requirement | P0-06B proof before `DECIDED` |
| --- | --- | --- |
| Activation | Compose profile `curve`; off by default | Resolved Compose config and baseline health with profile absent/present. |
| Data | Synthetic identifiers and safe enums only; no protected body, credential, repository content, or production delegation | Inspect workflow histories and telemetry for sentinel protected strings. |
| Persistence | Curve-specific SQLite volume owned only by the dev server; PostgreSQL remains Curve domain truth | Restart server/worker and replay to completion; delete only a disposable copy during reset test. |
| Network | **UNRESOLVED:** P0-06B must select the minimum dedicated network, ports, service identities, and permitted destinations; shared `dev_env` is not the selected contract. | Separate exact-head design approval, applied network/port inspection, dependency-denial tests, and proof that unrelated Plane services and credentials are unreachable. |
| Worker | Dedicated process built from the compatible Plane API image with `temporalio==1.30.0`; exact environment keys, identity, credential path, service dependencies, and task queue are **UNRESOLVED** until the P0-06B design. | Separate exact-head design approval, environment allowlist, health, graceful shutdown, worker restart, dependency-denial, and task-queue isolation tests. |
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

## Local proof-scope and two-stage approval record

Federico Ocampo approved the `LOCAL_ONLY` local-profile sections at ADR revision
`sha256:cac4dcac2a03156faf21b0deffdc22bec611da1b070a421b4d5b631bfec8a142`
as the basis for proof planning. The revision also contains staging/production
candidate text; that non-local content was not approved. After the shared-network
risk was identified, Federico approved an isolated P0-06A feasibility proof
followed by a separately designed and approved least-privilege P0-06B
integration proof.

| Field | Approved value or current gate |
| --- | --- |
| Decision owner | Federico Ocampo, CTO at X3M, acting as Platform Operations decision owner for `LOCAL_ONLY` |
| Technical operator | OpenAI Codex, operating under Federico Ocampo's oversight and the Curve execution protocol |
| Conversation approvals | `2026-08-15`; they establish scope and direction but do not satisfy the repository's exact-head execution-approval rule |
| Durable evidence | Publication PR URL, exact approved head, attributable GitHub record timestamp, merge commit, and post-merge CI are pending |
| P0-06A | Isolated, credential-free, synthetic Temporal primitive proof; cannot decide D-003 (runtime topology and trust-zone decision) or unblock M0-S3 (local Temporal round-trip implementation packet) |
| P0-06B | Final least-privilege Plane integration proof; `NOT_AUTHORIZED` until its separate immutable packet and exact-head approval exist |
| Approved pins | Temporal CLI image `1.8.1@sha256:59561b9ef060eaeb1f46cb6a1842d6cbdd8a393eb3b6d315ecef5fe2f0b1d7a6`; embedded server `1.31.2`; Python SDK `1.30.0` |
| Evidence contract | [P0-06 two-stage Temporal proof task packet](p0-06-local-temporal-proof-task-packet.md) |
| Excluded authority | Staging, production, AWS or Kubernetes provisioning, gVisor, OpenHands, external providers, protected or production data, production credentials, and SLA claims |
| Execution guardrails | P0-06A (isolated Temporal feasibility proof) attempt ID, time window, resources, claim, stop, cleanup, immutable evidence-head review, and bounded execution/VCS authority become binding only through the exact-head execution approvals defined by its packet. An independently deployed broker must pass its conformance suite, recheck the live exact-tag ruleset and all authorization inputs at claim time, and issue the signed short-lived start grant that alone activates the wrapper. The broker/GitHub App executes or signs and dispatches exact execution and VCS operations; the controller receives only opaque lease handles and signed receipts, never a reusable GitHub credential, including in process memory. GitHub Project status updates are independent administrative tracking writes and carry no execution authority. P0-06B (least-privilege Plane integration proof) requires a new approval. |

No execution is authorized yet. P0-06A (isolated Temporal feasibility proof)
remains blocked by publication, committed/reviewed harness, immutable image,
immutable authorization bundle, v2 stage record and integrity projection,
trusted controller, conformant independent start-grant broker, Security incident
owner, active exact-tag ruleset and absent
claim, all required artifact/controller/ticket/start-grant/execution/
reconciliation/review-disposition paths, digests, checks and operation evidence,
fixed reconciliation branch and `create-reconciliation-evidence-ref` operation,
publication-intent and signed external-attestation schema, verification key and
store, controller-owned terminal Project-marker policy, workstation
preflight, Project readiness, and expiry checks. P0-06B (least-privilege Plane
integration proof) remains unplanned and unauthorized. Neither approval represents a
successful proof or decides any local, staging, or production field.

## Data/API/event/migration compatibility impact

Temporal workflow input uses versioned contract objects with identifiers/digests only. Workflow changes use explicit version markers and replay tests. Database migrations remain owned by the Curve Django app.

## Failure, rollback, and exit strategy

Curve is disabled by default. Removing the Compose profile and `curve-worker` leaves existing Plane API, Celery, and data behavior unchanged. Failed or incompatible histories remain pinned to their worker build until replay compatibility or controlled termination is approved.

## Implementation consequences and affected work packages

Publication of the owner-approved local topology boundary supplies the evidence
needed to close P0-02 after review and Project reconciliation. P0-06A
materialization additionally requires every gate in its packet. Accepted
P0-06A evidence returns P0-06 to `Backlog` for P0-06B; it does not satisfy
D-003. Accepted P0-06B evidence and the corresponding scoped D-003 decision
still block M0-S3/M0-06. Every non-local use, M0-08 recovery
claim, M4 runner profile, and M6 preview profile remains blocked by its own
approved environment scope.

## Validation and review date

The local version/image proposal and two-stage direction have named,
digest-bound scope approval. Both proof stages remain execution-gated. This ADR
remains `PROPOSED` pending:

- exact-head publication plus accepted P0-06A isolated feasibility evidence;
- separate approval, execution, and Federico Ocampo's acceptance of P0-06B
  least-privilege Plane-integration evidence;
- a scoped `LOCAL_ONLY` decision date and review record after evidence
  acceptance; and
- completion and approval of every staging/production decision-matrix cell,
  including named service, database, security, and on-call owners, before
  either environment is activated.
