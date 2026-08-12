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

## Proposed decision

- Add a `curve` Compose profile containing a pinned Temporal development service and a dedicated `curve-worker` built from the Plane API image.
- Use namespace `curve-local`, task queue `curve-control-plane-v1`, and workflow IDs `curve:{workspace_id}:{operation_id}` locally.
- Keep domain state in PostgreSQL. Temporal history contains opaque IDs, versions, digests, and safe correlation only—never protected bodies or credentials.
- In staging/production, use dedicated Temporal persistence/visibility schemas and namespace-level credentials. Exact chart/image digests, replicas, TLS/auth, payload codec/encryption, backup, RPO/RTO, capacity, and upgrade policy require the named decision.
- Do not replace or repurpose Plane Celery.

## Security, privacy, licensing, and operational impact

The local proof uses synthetic data. Non-local use is blocked until Platform Operations and Security approve placement, network paths, secrets, TLS/auth, encryption, telemetry, retention, backup/restore, and on-call ownership.

## Data/API/event/migration compatibility impact

Temporal workflow input uses versioned contract objects with identifiers/digests only. Workflow changes use explicit version markers and replay tests. Database migrations remain owned by the Curve Django app.

## Failure, rollback, and exit strategy

Curve is disabled by default. Removing the Compose profile and `curve-worker` leaves existing Plane API, Celery, and data behavior unchanged. Failed or incompatible histories remain pinned to their worker build until replay compatibility or controlled termination is approved.

## Implementation consequences and affected work packages

Blocks P0-06, M0-06, M0-08 recovery evidence, M4 runners, and M6 previews according to the approved environment scope.

## Validation and review date

Pending proof authorization, exact version selection, reproducible evidence, and named approval.
