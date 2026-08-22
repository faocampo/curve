# M0-S5B Local Observability Integration Implementation Evidence

## Document control

| Field | Value |
| --- | --- |
| Status | `ACCEPTED_AND_MERGED` |
| Evidence date | 2026-08-22 |
| Task | M0-S5B (local observability integration) |
| Parent work package | M0-08 (audit and observability foundation) |
| Human owner and reviewer | Federico Ocampo (`faocampo`), CTO at X3M |
| Binding decision | [OBS-BIND-001](obs-bind-001-local-observability-binding.md) (local Docker OTLP, Prometheus, Grafana, health, cleanup, and promotion contract) |
| Curve contract revision | `43480ca8463d0b40d436145aeb19fbbc8c2be472` on `main` |
| Approved Curve contract head | `5a3ab82d7b960c862ea83c6ebf89e086be19b758` |
| Context digest | `sha256:36933053249f2159d2b768e3ff62c3e114a587a5fa650df9b262b4f7d9b28d3b` |
| Plane base | `39920769daf78fce29a10c7f4e4bb8779671b004` on `preview` |
| Plane approved head | `320c4b92b6c9e417410e32a83409a33a64518df0` |
| Plane merge | `1b06153f6f49848f208808f4f09385a581a55d26` on `preview` |
| Curve PR | [Curve PR #24](https://github.com/faocampo/curve/pull/24) (OBS-BIND-001 local binding decision and machine contract) |
| Plane PR | [Plane PR #8](https://github.com/faocampo/plane/pull/8) (M0-S5B local observability integration) |
| Curve acceptance PR | [Curve PR #25](https://github.com/faocampo/curve/pull/25) (post-merge M0-S5B evidence and M0-08 reconciliation) |
| Approved Curve evidence head | `b261de697c18c903e3fcbdaf5ca356436f8206f1` |
| Curve evidence merge | `590a52ef006fd1d83bef5c76dfdab9ce9080a168` on `main` |
| Curve validation | [Documentation contracts run 32593279087](https://github.com/faocampo/curve/actions/runs/32593279087) (Markdown, Mermaid, OpenAPI, schemas, fixtures, and Project-policy checks) |
| Scope and data | `LOCAL_ONLY`; synthetic `INTERNAL` data |

## Verified outcome

M0-S5B (local observability integration) is implemented, merged into Plane
`preview`, and verified in the existing local Plane Docker stack. The merged
implementation adds:

1. Digest-pinned OpenTelemetry Collector `0.159.0`, Prometheus `3.10.0`, and
   Grafana `13.1.0` services behind the `curve-observability` Compose profile.
2. OTLP/gRPC export from Curve API and Temporal worker to
   `otel-collector:4317` on the existing local `dev_env` network.
3. Two Prometheus scrape paths: translated Curve metrics on Collector port
   `8889` and independent Collector self-metrics on port `8888`.
4. File-provisioned Grafana datasource UID `prometheus-local`, folder `Curve`,
   and dashboard UID `curve-m0-operations` with ten contracted panels.
5. Four application alerts plus `CURVE_OTEL_COLLECTOR_DOWN` and
   `CURVE_OTEL_EXPORT_PATH_DOWN` path-health alerts.
6. A deterministic local proof runner for health, Foundation workflow,
   telemetry, alerts, path failure and recovery, disablement, and targeted
   cleanup.
7. Loopback-only host exposure, local Grafana display, no external telemetry
   destination, no external alert receiver, no credentials for local OTLP, and
   no database migration.

The implementation is bound to the merged
[M0-S5B context manifest](https://github.com/faocampo/plane/blob/1b06153f6f49848f208808f4f09385a581a55d26/apps/api/plane/curve/contracts/m0-s5b-context.json)
(36 sorted product, architecture, security, API, schema, task-packet, and
decision inputs) with aggregate digest
`sha256:36933053249f2159d2b768e3ff62c3e114a587a5fa650df9b262b4f7d9b28d3b`.

## Approval, CI, and merge binding

Federico Ocampo approved exact Plane head
`320c4b92b6c9e417410e32a83409a33a64518df0`, authorized marking
[Plane PR #8](https://github.com/faocampo/plane/pull/8) (M0-S5B local
observability integration) ready, and authorized squash merge into `preview`
while CI remained green.

GitHub did not attach pull-request event checks in the fork, including after a
bounded close/reopen retrigger at the unchanged head. The applicable active
workflows were therefore dispatched directly against that exact branch and
commit:

| Workflow | Exact-head result |
| --- | --- |
| [CodeQL run 32592365475](https://github.com/faocampo/plane/actions/runs/32592365475) (JavaScript and Python security analysis) | Passed for both languages |
| [Copy Right Check run 32592367086](https://github.com/faocampo/plane/actions/runs/32592367086) (Python and TypeScript license-header validation) | Passed |
| [Build and lint API run 32592368428](https://github.com/faocampo/plane/actions/runs/32592368428) (API lint workflow) | Skipped because its job requires a pull-request event payload; repository-local Ruff and complete backend evidence below passed |

Immediately before merge, GitHub reported the PR open, ready, `MERGEABLE`, and
`CLEAN`, with the approved head and `preview` base unchanged. GitHub
squash-merged it on 2026-08-22 at `2026-08-22T19:02:30Z` as
`1b06153f6f49848f208808f4f09385a581a55d26`.

The squash merge preserves the exact approved implementation:

| Revision | Git tree |
| --- | --- |
| Approved Plane head `320c4b9...` | `cffc6ed3be2d0faad8c6fcddcd14a5fd023db7fb` |
| Plane merge `1b06153...` | `cffc6ed3be2d0faad8c6fcddcd14a5fd023db7fb` |

The merge commit is the current `origin/preview` revision at evidence creation.

Federico Ocampo approved exact Curve evidence head
`b261de697c18c903e3fcbdaf5ca356436f8206f1`. The Curve validation job passed,
and GitHub subsequently squash-merged
[Curve PR #25](https://github.com/faocampo/curve/pull/25) (post-merge M0-S5B
acceptance evidence) on 2026-08-22 at `2026-08-22T19:51:54Z` as
`590a52ef006fd1d83bef5c76dfdab9ce9080a168`. The approved evidence head and
merge share Git tree `c58b15d490fd65ed75c04b838f64af665e10d026`.

## Live local proof

The proof used the existing local Plane Compose project and synthetic data.
Grafana used loopback port `3003` because local Plane Admin/frontend processes
already occupied `3001` and `3002`. The governed default remains `3001`; the
proof runner's explicit loopback override changes no contract or image.

| Checkpoint | Verified result |
| --- | --- |
| Health | Collector, Prometheus, Grafana, API, and Curve worker were healthy; Prometheus reported both scrape jobs `up`. |
| Foundation success | The harmless Foundation operation reached `SUCCEEDED` at optimistic version 4 through API, outbox, Temporal, audit, and SSE. |
| Cancellation and durability | Cancellation and durable cancellation reached `CANCELLED` at version 5; duplicate start was rejected; history replay passed. |
| Real telemetry | All ten contracted Curve metrics reached Prometheus through the Collector; all ten dashboard queries resolved through datasource UID `prometheus-local`. |
| Dashboard | Grafana provisioned folder `Curve` and dashboard UID `curve-m0-operations` with ten panels. |
| Application alerts | Four rules loaded and evaluated; `promtool test rules` succeeded. |
| Path-health alerts | `CURVE_OTEL_COLLECTOR_DOWN` and `CURVE_OTEL_EXPORT_PATH_DOWN` fired during bounded independent failures; Collector and both scrape paths recovered. |
| Data minimization | Protected synthetic UUID and sentinel values were absent from Collector logs and queried telemetry. |
| Disablement | With `CURVE_TELEMETRY_MODE=DISABLED`, the Foundation workflow still completed, the operation metric did not increase, and no exporter-failure signal appeared. |
| Cleanup | Targeted cleanup removed only three observability containers, two disposable observability volumes, and proof state; Plane PostgreSQL, Redis, RabbitMQ, MinIO, Temporal, API, workers, and Beat remained running. |

## Repository verification

All results below ran against approved Plane tree
`cffc6ed3be2d0faad8c6fcddcd14a5fd023db7fb`, which is identical to the merged
`preview` tree.

| Verification | Result |
| --- | --- |
| Monorepo checks | `pnpm check`: 60 of 60 tasks passed |
| Monorepo build | `pnpm build`: 16 of 16 tasks passed |
| Complete Plane backend suite | 707 of 707 tests passed |
| Curve backend suite | 191 of 191 tests passed before the final semantic contract test was added |
| Observability binding conformance | 8 of 8 tests passed, including valid local binding and external-delivery rejection |
| Proof-runner tests | 8 of 8 Node tests passed |
| Contract/config integrity | M0-S2, M0-03, M0-S3, M0-S4, M0-S5, M0-S5B, Temporal supply chain, ten dashboard panels, six alerts, and two scrape paths passed |
| Python lint and format | Ruff check and format passed |
| TypeScript format and lint | Pre-commit `oxfmt` and `oxlint --deny-warnings` passed |
| Diff hygiene | `git diff --check` passed |

## Security and operational acceptance

1. Telemetry remains disabled by default; local OTLP activation requires the
   explicit Curve telemetry mode and endpoint configuration.
2. Host ports bind to loopback; service-to-service traffic uses only the
   existing local Docker network.
3. OTLP has no local credential, TLS is disabled only for the local proof, and
   no telemetry or alert destination leaves the local machine.
4. Images are pinned by multi-architecture digest and their configuration is
   repository-owned and validated.
5. Exported attributes remain bounded by the M0-S5 telemetry manifest; raw
   workspace IDs, protected bodies, credentials, and unrestricted values are
   excluded.
6. Independent self-metric and translated-metric scrapes detect Collector and
   export-path failures without relying on the failed application exporter.
7. Telemetry failure and disablement do not change authoritative Operation,
   audit, outbox, Temporal, or SSE outcomes.
8. External alert delivery is disabled; the developer running the local stack
   owns local alert observation.
9. Named volumes are disposable development assets with 24-hour Prometheus
   retention; targeted cleanup preserves the existing Plane data plane.
10. Staging activation, non-loopback exposure, credentials, TLS policy,
    external delivery, retention, backup, and operational ownership require a
    separate material decision.

## Rollback proof and procedure

The change is additive and creates no database migration. Operational rollback
is:

1. Set `CURVE_TELEMETRY_MODE=DISABLED` for the Curve API and worker.
2. Omit the `curve-observability` Compose profile.
3. Run `node scripts/curve-observability-proof.mjs cleanup` when disposable
   observability resources should be removed.
4. Verify the existing Plane PostgreSQL, Redis, RabbitMQ, MinIO, Temporal, API,
   workers, and Beat remain healthy.
5. Revert Plane merge `1b06153...` through a separately reviewed PR if source
   rollback is required.

No destructive database rollback, Plane data-volume deletion, external alert
mutation, or production operation is part of M0-S5B rollback.

## Acceptance mapping and remaining action

| Requirement | Evidence disposition |
| --- | --- |
| FR-021 | Immutable audit and authoritative domain outcomes remained intact during enabled, failed-path, and disabled telemetry modes. |
| FR-024 | Real local metrics, traces, dashboard queries, application alerts, independent path health, and operator evidence were verified. |
| NFR-001-NFR-008 | Local export, bounded resource behavior, failure isolation, recovery, deterministic proof execution, and repository regression passed. |
| NFR-009-NFR-014 | Closed attributes, redaction, loopback exposure, synthetic data, fail-closed enablement, and targeted cleanup passed. |
| AC-34 | API, outbox, Temporal, audit, and SSE correlation remained attributable through the Foundation workflow. |
| AC-36 | Dashboard, alert, path-health, failure, recovery, and operator inspection evidence passed. |
| AC-53 | Disabled telemetry, exporter-path failure, complete workflow behavior, and no protected-value leakage passed. |

The implementation and local acceptance criteria are accepted and merged.
M0-08 (audit and observability foundation) is `DONE` for the approved
`LOCAL_ONLY` scope. Staging or production observability activation remains
separately gated.
