# M0 Local Skeleton Task Packets

## Shared dispatch context

| Field | Value |
| --- | --- |
| Repository | `git@github.com:faocampo/plane.git` |
| Target branch | `preview` after reviewed upstream-sync merge |
| Candidate base | `d380678912e9b46805ef852d2e05411f1fea6d8b`; replace with the reviewed merge SHA before any packet becomes `READY` |
| Feature branch prefix | `curve/m0-` |
| Normative docs | Curve PRD v0.7 and the exact committed Curve documentation revision |
| Data | Synthetic local data only; no protected object bodies |
| Feature posture | Curve disabled by default; foundation probe local-only |
| Human review | Named Curve engineering reviewer required for every packet |
| Global commands | `pnpm check`, `pnpm build`, complete Docker backend suite, local Compose smoke |

Every packet begins `BLOCKED`. It becomes `READY` only after its named decision/dependency fields are satisfied and its pinned Curve/Plane commits and human owner/reviewer are recorded.

## Packet M0-S1: Module shell

| Field | Decision-complete content |
| --- | --- |
| Outcome | Add a dedicated `plane.curve` Django app, additive Curve UI route/navigation, and disabled-by-default configuration without changing unrelated Plane behavior. |
| Dependencies | P0A documentation baseline; D-001 `DECIDED`; reviewed Plane base SHA. |
| Scope | Django app/config/URL seam, workspace-scoped abstract model conventions, initial empty migration, TypeScript Curve namespace/client seam, workspace route and disabled state. |
| Non-scope | Operation behavior, Temporal, providers, object storage, models/LLMs, production flags. |
| Acceptance | Disabled mode exposes no Curve navigation/API; enabled local mode renders an authorized empty shell; cross-workspace URL attempts fail safely; migrations apply/reverse in disposable DB. |
| Rollback | Disable Curve configuration and revert additive migration/code; existing Plane paths remain unchanged. |

## Packet M0-S2: Operation and delivery kernel

| Field | Decision-complete content |
| --- | --- |
| Outcome | Persist workspace-scoped `Operation`, outbox/inbox, idempotency, and append-only audit records atomically. |
| Dependencies | M0-S1 merged; schema/state contracts validated. |
| Scope | Models, constraints, services, transaction boundaries, relay claim/ack/dead-letter primitives, optimistic versions, safe audit metadata. |
| Non-scope | Temporal SDK, provider callbacks, protected body/object storage. |
| Acceptance | Duplicate identical request returns original result; changed request under reused key returns `409`; concurrent relay claims have one effect; stale version returns `412`; cross-workspace access fails. |
| Rollback | Disable relay and Curve APIs; reverse additive migrations only in disposable/local environments according to migration test. |

## Packet M0-S3: Temporal round trip

| Field | Decision-complete content |
| --- | --- |
| Outcome | Deliver one harmless operation through outbox, dedicated Temporal worker, idempotent application activities, cancellation, and terminal audit state. |
| Dependencies | M0-S2 merged; D-003 local profile `DECIDED`; Temporal server/SDK/image pinned; proof authorization. |
| Scope | Python SDK, worker entrypoint, local Compose `curve` profile, namespace/task queue, workflow/activity contracts, relay-to-Temporal dispatch, replay corpus. |
| Non-scope | Staging/production Temporal, OpenHands, gVisor, protected payloads, Celery replacement. |
| Acceptance | Exactly one workflow per operation under duplicate delivery; restart/retry produces no duplicate mutation; cancellation terminates; history replay passes; payload inspection contains no protected data. |
| Rollback | Disable Curve worker/profile and relay dispatch; operations remain inspectable and can be failed/cancelled by an authorized local recovery command. |

## Packet M0-S4: API, SSE, and minimal UI

| Field | Decision-complete content |
| --- | --- |
| Outcome | Expose authorized operation reads/cancellation, resumable workspace events, and a minimal local foundation-probe experience. |
| Dependencies | M0-S1-M0-S3 merged; OpenAPI/SSE contracts validated. |
| Scope | DRF endpoints, Problem Details, ETag/If-Match, cursor pagination, local-only probe command, SSE resume, TypeScript types/services, workspace page. |
| Non-scope | General initiative UI, evidence, provider configuration UI, production probe endpoint. |
| Acceptance | OpenAPI contract tests; 202/Location/ETag behavior; SSE reconnect resumes without duplication; expired cursor returns `410`; unauthorized workspace access fails before object disclosure; accessible loading/error/terminal states. |
| Rollback | Disable Curve route/API; no change to existing Plane routes or state. |

## Packet M0-S5: Audit and observability

| Field | Decision-complete content |
| --- | --- |
| Outcome | Correlate the local operation across HTTP, database, relay, workflow, and UI without leaking protected data. |
| Dependencies | M0-S2-M0-S4 merged; X3M telemetry conventions documented. |
| Scope | Structured safe logs, OpenTelemetry spans, Prometheus metrics, audit completeness checks, redaction tests, local Grafana dashboard definition and alerts for stuck/failed operations. |
| Non-scope | Raw prompt/code/evidence telemetry, Langfuse model traces, production SLO approval. |
| Acceptance | One correlation chain is queryable; actor/effective principal recorded; secrets and fixture sentinel strings absent from logs/traces/metrics; dashboard shows throughput, latency, failures, retries, backlog, and worker health. |
| Rollback | Disable Curve exporters/dashboard while retaining minimum application audit records. |

## Local vertical checkpoint

The checkpoint passes when an authorized user enables Curve locally, starts one synthetic probe, observes `PENDING` through a terminal state over SSE, and can trace exactly one outbox delivery, workflow, activity result, operation history, and audit chain. The same idempotency key and a worker restart produce no duplicate effect. Disabling Curve restores the original Plane experience.
