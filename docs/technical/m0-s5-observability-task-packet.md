# M0-S5 Audit and Observability Task Packet

> Sanitized public reference. Fictional identities cannot authorize execution.
> Historical approvals apply only to their original bytes; see
> [public contract edition](public-reference-sanitization.md) (sanitization, integrity and approval boundaries).

## Document control

| Field | Value |
| --- | --- |
| Package | M0-S5 (local audit and observability implementation packet) / M0-08 (audit and observability foundation work package) |
| Status | `M0-S5A_ACCEPTED_AND_MERGED / M0-S5B_ACCEPTED_AND_MERGED` |
| Version | 1.13 |
| Date | 2026-08-22 |
| Product | Curve |
| Contract repository | `git@github.com:faocampo/curve.git` |
| Implementation repository | `git@github.com:faocampo/plane.git` |
| Minimum Plane ancestor | `preview` merge `1b06153f6f49848f208808f4f09385a581a55d26` containing accepted M0-S3 (local Temporal round-trip packet), M0-S4 (API, SSE, and minimal Curve-first UI packet), M0-S5A (telemetry kernel and static assets), and locally verified M0-S5B (local observability integration) |
| Implementation base | M0-S5B starts from Plane `preview` at M0-S5A merge `39920769daf78fce29a10c7f4e4bb8779671b004`; the approved Plane PR #7 head `c258ef12221964dae67286e0f6a6c2dc58b997fe` and merge share Git tree `87db1b646cd473f1c407b8aebbc43c27e62d9f8c` |
| Context readiness | Satisfied for M0-S5A by Curve merge `a23dab9...` and digest `sha256:720a70...`; satisfied for M0-S5B by Curve merge `43480ca...` and digest `sha256:36933053249f2159d2b768e3ff62c3e114a587a5fa650df9b262b4f7d9b28d3b`. |
| Implementation evidence | [M0-S5A implementation evidence](m0-s5a-implementation-evidence.md) (telemetry kernel acceptance) and [M0-S5B implementation evidence](m0-s5b-implementation-evidence.md) (local platform binding, CI, live proof, security, cleanup, and rollback) |
| Owner and human reviewer | Designated reviewer, Designated technical owner |
| Risk | `STANDARD`, with telemetry treated as a data-exfiltration boundary |
| Implementation branches | `curve/m0-s5a-observability-kernel` and, after OBS-BIND-001 approval, `curve/m0-s5b-example-observability-binding` |
| Data and tool policy | Synthetic `INTERNAL` fixtures only; no customer/protected bodies, model/provider calls, dependency upgrade, repository mutation outside the Plane branch, or GitHub/infrastructure write by the coding agent |
| Budget and sandbox | M0-S5A uses repository-local/CI resource limits with outbound telemetry and network disabled; M0-S5B uses only the local `dev_env`, loopback host ports, no OTLP credential, synthetic data, bounded proof lifetime, and cleanup contract in OBS-BIND-001 |
| Product trace | FR-021 and FR-024 (audit and measurable lifecycle requirements); NFR-001 through NFR-014 (performance, reliability, security, privacy, and operations requirements); AC-34, AC-36, and AC-53 (audit, KPI, and protected-data acceptance criteria) |

## Outcome

Implement a deterministic, opt-in observability kernel that correlates one
workspace-scoped Curve operation across HTTP, PostgreSQL, the transactional
outbox, Temporal workflow/activity execution, audit history, and resumable SSE.
It emits only explicitly allowlisted telemetry, preserves immutable Curve audit
records as the authoritative evidence, and integrates through an approved OTLP
binding with Example Organization's existing logging/tracing, Prometheus, and Grafana services
after the local binding is approved.

This packet divides delivery into two independently reviewable changes:

1. M0-S5A (telemetry kernel and static observability assets) implements safe
   instrumentation, deterministic in-memory tests, the Grafana dashboard
   definition, and Prometheus alert-rule definition. It requires M0-S4 (API,
   SSE, and minimal approved UI packet) and the approved Curve contract head.
2. M0-S5B (local observability integration proof) binds the kernel to the
   digest-pinned local Collector, Prometheus datasource, Grafana provisioning,
   application/path-health rules, and disposable cleanup selected by
   [OBS-BIND-001](obs-bind-001-local-observability-binding.md) (exact local
   topology, configuration, commands, acceptance, and promotion boundary).

## Normative sources

| Source | Authority in this packet |
| --- | --- |
| [Curve PRD v0.12](../curve-ai-native-sdlc-prd.md) (product scope, Curve-first shell, functional/non-functional requirements, accepted local Temporal proof, and acceptance criteria) | Product invariants and acceptance boundaries |
| [Architecture](architecture.md) (logical components, trust boundaries, truth ownership, and deployment profiles) | PostgreSQL remains business truth; telemetry is a derived operational projection |
| [Domain model](domain-model.md) (workspace-scoped aggregates, events, audit records, and lifecycle invariants) | Correlation and audit entity semantics |
| [Authorization and state matrices](m0-authorization-and-state-matrices.md) (M0 roles, policy inputs, and operation transitions) | Actor/effective-principal attribution and protected-transition rules |
| [Security and operations](security-and-operations.md) (identity, redaction, data handling, observability, and incident controls) | Telemetry allowlist, secret/protected-data exclusion, and operational response |
| [Telemetry manifest v1](../../contracts/observability/m0-s5-telemetry-v1.json) (metric, span, log, dashboard, alert, redaction, and exporter contract) | Normative instrumentation surface |
| [Telemetry manifest schema](../../contracts/schemas/telemetry-manifest.schema.json) (machine validation of fail-closed telemetry configuration) | Contract shape and fail-closed constants |
| [OBS-BIND-001 local observability binding](obs-bind-001-local-observability-binding.md) (decided Compose topology, versions, endpoints, provisioning, health, commands, acceptance, and rollback) | Normative M0-S5B implementation and proof values |
| [OBS-BIND-001 v1](../../contracts/observability/obs-bind-001-local-v1.json) (machine-readable local authority and configuration contract) | Exact local service, network, endpoint, image, health, cleanup, and promotion values |
| [Observability binding schema](../../contracts/schemas/observability-binding.schema.json) (machine validation and local-only authority constants) | Rejects non-local scope, non-loopback exposure, changed topology, or external alert delivery |
| [Operation event v2 schema](../../contracts/schemas/operation-event-v2.schema.json) (v1 lifecycle fields plus optional validated `traceparent`) | Dual-read v1/v2 persistence boundary for durable trace propagation without a database migration |
| [M0 Temporal workflow contract](../../contracts/temporal/m0-workflow-contract.md) (workflow/activity inputs, trace header, signals, retry, and replay) | Backward-compatible header-only Temporal trace propagation rule |
| [Audit event schema](../../contracts/schemas/audit-event.schema.json) (immutable attributed audit evidence) | Authoritative application evidence |
| [Access Envelope schema](../../contracts/schemas/access-envelope.schema.json) (classification, authorization, retention, and redaction policy) | Protected-data handling boundary |
| [M0 traceability](m0-traceability.md) (requirement-to-contract-to-test ownership) | Verification ownership |
| [OpenTelemetry environment-variable specification](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/) (standard SDK/exporter configuration and disabled/exporter behavior) | Upstream configuration semantics; Curve applies stricter explicit-endpoint and disabled defaults |
| [OpenTelemetry Python trace SDK](https://opentelemetry-python.readthedocs.io/en/stable/sdk/trace.html) (TracerProvider, sampling, span limits, and shutdown-on-exit parameters) | Exact private-provider constructor controls and bounded span surface |
| [OpenTelemetry Python trace export API](https://opentelemetry-python.readthedocs.io/en/stable/sdk/trace.export.html) (batch span processor queue, batch, export timeout, flush, and shutdown behavior) | Exact bounded trace-processor parameters implemented with Plane's pinned 1.28.1 package |
| [OpenTelemetry Python metrics export API](https://opentelemetry-python.readthedocs.io/en/stable/sdk/metrics.export.html) (periodic reader interval, timeout, flush, and shutdown behavior) | Exact bounded metric-reader parameters implemented with Plane's pinned 1.28.1 package |
| [OpenTelemetry Python metric views](https://opentelemetry-python.readthedocs.io/en/latest/sdk/metrics.view.html) (attribute filtering, explicit histogram aggregation, and drop aggregation) | Closed metric attributes, pinned histogram buckets, and undeclared-instrument drop behavior |
| [OpenTelemetry Python resources](https://opentelemetry-python.readthedocs.io/en/stable/sdk/resources.html) (resource construction and detector behavior) | Curve constructs its static resource directly and bypasses environment-derived resource detection |
| [Temporal Python SDK 1.31.0 interceptor source](https://github.com/temporalio/sdk-python/blob/1.31.0/temporalio/contrib/opentelemetry/_interceptor.py) (client/worker header propagation and replay-safe workflow interception) | Pinned public interceptor APIs used by Curve's traceparent-only carrier; Curve supplies its private tracer and closed carrier |
| [W3C Trace Context](https://www.w3.org/TR/trace-context/) (traceparent and tracestate propagation standard) | Cross-boundary trace-header format |
| [Prometheus OpenTelemetry guide](https://prometheus.io/docs/guides/opentelemetry/) (OTLP ingestion and metric translation strategies) | Contracted `UnderscoreEscapingWithSuffixes` name translation and binding proof |
| [Prometheus alerting rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/) (rule-file and evaluation behavior) | Static alert-rule implementation reference |
| [Grafana provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/) (version-controlled dashboard and datasource provisioning) | Static dashboard/provisioning implementation reference |

The coding agent pins one exact Curve commit containing all sources above. A
later documentation commit cannot silently change an active implementation.

### Dispatch policy

| Field | Required dispatch value |
| --- | --- |
| Implementer | One AI coding agent, distinct from Designated reviewer as owner and human reviewer |
| Model policy | Dispatcher-approved coding model; no runtime model call, silent model/provider substitution, or Curve Model Gateway dependency |
| Cost limit | US$25 maximum automated attempt; pause before exceeding the limit |
| Repository authority | Read/write only on the named Plane feature branch; the agent does not merge, deploy, change GitHub Project state, or mutate Example Organization infrastructure |
| Network policy | M0-S5A permits repository dependency/build traffic only when the pinned Plane lock and image inputs require it; all telemetry export is disabled. M0-S5B uses the shared local `dev_env`, Docker service discovery, and loopback-only host ports in OBS-BIND-001; no external telemetry or alert destination is configured. |
| Data policy | Synthetic `INTERNAL` values and the sentinel corpus only; no customer, credential, protected, source-body, prompt, response, patch, evidence-body, or tool-output value enters telemetry or PR evidence |
| Stop behavior | Missing owner, reviewer, exact base/context, command, budget, or policy value stops before mutation |

## Entry gates and dispatch packets

### M0-S5A entry gates

All conditions must be true before code mutation:

- M0-03 (core authorization and policy kernel work package), M0-S3 (local
  Temporal round-trip implementation packet), and M0-S4 (API, SSE, and minimal
  approved UI packet) are merged into Plane `preview` with accepted evidence.
- The exact Plane base SHA is recorded and descends from
  `d99342f589db4eb488695487d3ae3f2c16bf0874`.
- The exact Curve contract SHA and its deterministic M0-08 (audit and
  observability foundation work package) context-pack digest are recorded. A
  final Curve revision must include [M0-S4 implementation evidence](m0-s4-implementation-evidence.md)
  (exact M0-S4 context, merge, tests, usability acceptance, and rollback) in
  that manifest before the digest is dispatch-authoritative.
- Designated reviewer approves the exact contract head and is the named human
  reviewer for the implementation PR.
- The implementation packet contains exact build/test commands and synthetic
  sentinel values. It contains no Example Organization secret or protected evidence body.

### M0-S5B entry gates

M0-S5B (local observability integration proof) consumes the decided
[OBS-BIND-001](obs-bind-001-local-observability-binding.md) (local Docker OTLP,
Prometheus, Grafana, path-health, cleanup, and promotion binding). The exact
merged record and context digest are the remaining dispatch inputs:

| Required field | Required value or evidence |
| --- | --- |
| Environment owner | Developer running the disposable local stack; no Platform Operations approval is required for local proof |
| OTLP endpoint | `http://otel-collector:4317` in Docker and `http://localhost:4317` from a host process |
| OTLP protocol and transport | `grpc`; TLS disabled and `insecure=true` for local scope only; no OTLP authentication secret |
| Workspace-scope key | Ephemeral base64url key in an ignored owner-only local environment file; key ID `local-dev-v1`; removed during cleanup |
| Prometheus datasource | Grafana UID `prometheus-local` bound to `http://prometheus:9090`; dashboard variable `DS_PROMETHEUS` |
| Prometheus metric translation | Collector Prometheus exporter with `UnderscoreEscapingWithSuffixes`; Prometheus scrapes `otel-collector:8889` |
| Grafana provisioning | Default organization; folder title/UID `Curve`/`curve`; repository-owned file provisioning under `deployments/curve-observability` |
| Prometheus rule provisioning | Existing four-rule M0-S5A file plus two local path-health rules, loaded from repository mounts |
| Alert route | Prometheus evaluates; Grafana is the local viewing surface; external notification delivery is disabled; local developer owns response |
| Independent telemetry-path health | Collector health on `13133`, self-metrics on `8888`, and Prometheus `up` for `otel-collector-self` and `curve-otel-metrics` |
| Local verification window | Begins when the proof runner starts the profile; ends when it records sanitized results and runs the required `down -v` cleanup |
| Supply chain | Collector `0.159.0`, Prometheus `3.10.0`, and Grafana `13.1.0` use the exact multi-architecture digests in OBS-BIND-001 v1 |
| Remaining dispatch record | Exact merged Curve SHA plus deterministic `M0-S5B` context digest containing the binding, schema, fixtures, packet, and M0-S5A evidence |

Absent or partial values leave OTLP export disabled. They do not block M0-S5A
(telemetry kernel and static observability assets).

## Scope

### M0-S5A in scope

- A dedicated `plane.curve.observability` package using Plane's pinned
  OpenTelemetry Python dependencies.
- Configuration parsing and validation for all environment variables named by
  the telemetry manifest.
- `DISABLED`, `IN_MEMORY_TEST`, and explicit `OTLP` exporter modes.
- Application correlation-ID generation/validation for the persisted
  Operation, DomainEvent, OutboxEvent, workflow/activity, AuditEvent, and SSE
  lineage. Exported telemetry excludes the application correlation ID and uses
  W3C trace/span identifiers for telemetry correlation. M0 propagates only
  `traceparent`; it drops `tracestate` and `baggage` rather than forwarding
  unbounded caller-controlled context.
- Dual-read operation-event v1/v2 support. Pre-M0-S5 events retain v1; new
  instrumented events write v2 with an optional validated `traceparent` inside
  the existing JSON payload, requiring no persistence migration.
- Curve-private, process-local tracer and meter providers. They are never
  registered as the OpenTelemetry global providers and do not activate global
  Django instrumentation.
- Explicit static resources, parent-based sampling, span limits, exception-
  event prohibition, always-off exemplars, cumulative metric temporality,
  manifest-defined views, and manual bounded shutdown. Generic OpenTelemetry
  configuration cannot select Curve exporters, resources, sampling, limits,
  temporality, views, or propagation; the upstream `OTEL_SDK_DISABLED=true`
  kill switch may only disable the private providers.
- An explicit `BatchSpanProcessor` and `PeriodicExportingMetricReader` using
  every queue, interval, batch, export-timeout, flush, and shutdown value in the
  telemetry manifest.
- Allowlisted structured JSON logs written to stdout for Example Organization's existing log
  collection path. M0 does not configure an OpenTelemetry log exporter.
- HMAC-SHA256 workspace scopes for traces and structured logs, with key ID and
  rotation support.
- Exactly the metric instruments, bounded attributes, spans, structured log
  fields/event codes, dashboard panels, and alert rules in the telemetry
  manifest.
- Safe correlation bridges to immutable audit evidence without exporting audit
  bodies.
- In-memory exporters and deterministic assertions for tests.
- Grafana dashboard JSON and Prometheus rule YAML at the implementation paths
  declared in the telemetry manifest.
- Failure, redaction, cardinality, concurrency, and disablement tests.

### M0-S5B in scope

- [OBS-BIND-001 local binding](obs-bind-001-local-observability-binding.md)
  (decided Docker OTLP, Prometheus, Grafana, health, cleanup, and promotion
  contract).
- Existing local Plane Docker-stack configuration needed to opt in to the
  approved local endpoint.
- Standard connectivity through the approved shared local Plane `dev_env`;
  M0-S5 adds no bespoke container network or proxy layer.
- Digest-pinned disposable local Collector, Prometheus, and Grafana services
  within the opt-in `curve-observability` profile.
- File-based Prometheus/Grafana provisioning proof using repository-owned
  configuration and existing M0-S5A assets.
- Synthetic successful, denied, failed, retried, cancelled, resumed, and stuck
  operation observations.
- Alert evaluation/routing proof without sending production notifications.
- Independent collector/platform receiver and exporter health or no-data proof
  for a complete Curve OTLP-path outage.
- Disablement and restart proof.

### Excluded

- Staging/production observability infrastructure, any service outside the
  approved disposable local profile, or a trace/log backend.
- Raw workspace IDs in metric labels; raw protected bodies, prompts, responses,
  patches, source, credentials, evidence, tool output, cookies, tokens, or
  idempotency keys on any telemetry surface.
- Model-provider tracing, Langfuse, customer-data trials, non-local activation,
  production dashboard deployment, and production SLO approval.
- Changes to existing Plane telemetry behavior outside the additive Curve
  module.
- Use of Plane's default `https://telemetry.plane.so` endpoint by Curve.
- Persisted telemetry tables or migrations. A proposed persisted field stops
  implementation for contract review.

## Configuration contract

The [telemetry manifest v1](../../contracts/observability/m0-s5-telemetry-v1.json)
(metric, span, log, dashboard, alert, redaction, and exporter contract) is the
source of truth.

| Rule | Required behavior |
| --- | --- |
| Default | `CURVE_TELEMETRY_MODE=DISABLED`; no SDK provider, exporter, network call, logging handler, or background telemetry thread |
| Test mode | `IN_MEMORY_TEST`; deterministic in-process exporters, no network |
| OTLP mode | Requires explicit `CURVE_OTEL_EXPORTER_OTLP_ENDPOINT`, `CURVE_OTEL_EXPORTER_OTLP_PROTOCOL`, applicable transport configuration, workspace-scope key, and key ID |
| Configuration isolation | Curve's builder reads only the `CURVE_*` names in the manifest. It does not use generic `OTEL_EXPORTER_OTLP_*`, Plane license-telemetry helpers, or Plane's external telemetry default. Every exporter/provider control is explicit. The upstream `OTEL_SDK_DISABLED=true` kill switch may disable providers but no generic variable may enable export or change content. |
| Protocol | Accept only the exact lowercase values `grpc` and `http/protobuf`; any other or mixed-case value disables exporter setup. |
| Endpoint | Parse one absolute `http` or `https` URI. Reject userinfo, query, fragment, missing host, and every other scheme. The endpoint is supplied outside Git by the approved environment binding. |
| Signal paths | `grpc` requires an empty or `/` endpoint path and uses the approved endpoint for both signals. `http/protobuf` treats the configured endpoint as a base and appends the standard `/v1/traces` and `/v1/metrics` paths exactly once; a base already ending in either signal path is invalid. |
| Export headers | Optional `CURVE_OTEL_EXPORTER_OTLP_HEADERS` uses the OpenTelemetry comma-separated URL-encoded `key=value` format. Malformed or duplicate keys disable exporter setup. Header names/values are never logged, traced, audited, or returned in an error. |
| TLS material | Optional `CURVE_OTEL_EXPORTER_OTLP_CERTIFICATE`, `CURVE_OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE`, and `CURVE_OTEL_EXPORTER_OTLP_CLIENT_KEY` contain absolute read-only file paths. Each file is at most `1048576` bytes. The client certificate/key pair is both-or-neither. Insecure mode rejects all TLS paths. Secure mode may use the system trust store when the CA path is absent. Partial, relative, unreadable, non-file, or oversized material disables exporter setup without exposing paths or contents. |
| Compression | Explicitly `NONE` for M0; generic compression environment variables cannot override it. |
| Insecure flag | Accept only lowercase `true` or `false`. `true` is valid only in `LOCAL` and requires an `http` endpoint; `false` requires `https`, for either protocol. |
| Workspace-scope key | `CURVE_TELEMETRY_SCOPE_HMAC_KEY` is unpadded base64url and must decode to 32 through 64 bytes. `CURVE_TELEMETRY_SCOPE_KEY_ID` must match `^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$`. Invalid or partial pairs disable exporter setup. |
| External fallback | Prohibited; Curve never inherits or calls an external default endpoint |
| Insecure transport | Accepted only for an explicitly approved local endpoint |
| Invalid configuration | Curve application functions remain available; exporter setup stays disabled and emits one locally bounded configuration error without secrets |
| Export failure | Domain transaction and immutable audit truth remain unaffected; a bounded local log and `IN_MEMORY_TEST` metric are recorded without recursive export loops. `curve.telemetry.export.failure` is excluded from the OTLP/dashboard/alert surface because a failed exporter cannot deliver its own outage signal. Complete-path outage detection uses the independent OBS-BIND-001 collector/platform signal. |
| Process ownership | API providers initialize lazily once per post-fork process; the Temporal worker initializes explicitly before its client connects. Imports, migration commands, management commands, disabled Curve, and unrelated Plane requests do not initialize them. Provider `shutdown_on_exit` is false; Curve owns one bounded idempotent shutdown path. |
| SDK isolation | Construct the Curve resource directly from only the manifest attributes. Pass `ParentBased(ALWAYS_ON)`, every `SpanLimits` value, always-off metric exemplars, cumulative temporality, and explicit views directly. Use a final match-all drop view so undeclared metrics are absent. No `Resource.create`, resource detector, default sampler/limits, exception recording, links, span events, or generic environment-derived configuration is allowed. |
| Batching | Trace queue `2048`, schedule delay `5000 ms`, maximum batch `512`, and export timeout `10000 ms`; metric interval `60000 ms` and export timeout `10000 ms`. No generic OpenTelemetry environment variable can override them. |
| Gauge collection | Map manifest `GAUGE` instruments to OpenTelemetry observable gauges. Database-backed callbacks have a `1000 ms` statement timeout, aggregate across enabled workspaces without workspace labels, and omit the observation with one bounded safe diagnostic on failure. Worker heartbeat uses the relay's `500 ms` loop clock; the alert treats a missing series as stale. |
| Shutdown | API and worker providers flush and close within `10000 ms`; application shutdown cannot wait indefinitely. Repeated shutdown is idempotent. |

The implementation centralizes provider construction so imports and ordinary
unit tests never instantiate network exporters.

## Correlation, identity, and cardinality contract

1. The API uses Curve's existing request-scoped application correlation ID,
   generated as a safe opaque value and validated by downstream contracts. It
   returns the effective value and passes it through Operation, DomainEvent,
   OutboxEvent, workflow/activity execution, audit metadata, and SSE event
   metadata. M0-S5 adds no caller-supplied application-correlation header. It
   never writes that application correlation ID to a telemetry span, structured
   log, metric, or Temporal `_curve_traceparent_v1` header. That header carries
   only the validated W3C `traceparent` value.
2. A valid W3C `traceparent` is propagated across HTTP, outbox dispatch,
   Temporal client/workflow/activity boundaries, and SSE publication. Each
   component extracts the upstream context, creates its own child span, and
   injects that child context for the next boundary; the trace ID stays stable
   while parent/span IDs advance. Invalid input starts a new trace.
   `tracestate` and `baggage` are dropped at ingress and never serialized to
   outbox payloads, Temporal history, logs, spans, or SSE. Business IDs are
   separate from trace/span IDs.
3. `workspace_id` appears in authoritative database/audit records. Telemetry
   uses `HMAC-SHA256(key, "curve-workspace-scope:v1" || 0x00 || workspace_id)`
   as `curve.workspace.scope`, encoded as unpadded base64url and accompanied by
   a non-secret stable key ID. `workspace_id` is the canonical lowercase
   RFC 4122 UUID string with hyphens and no surrounding whitespace. The key is
   32 through 64 bytes. Rotation changes
   the key and key ID together at a controlled process restart; old and new
   deployments may overlap, and new telemetry always uses the provider's
   configured pair. Raw workspace IDs remain only in database/audit truth.
4. Raw workspace IDs and application correlation IDs are prohibited from every
   exported telemetry signal. Raw operation, event, workflow, correlation, and
   trace identifiers are prohibited as metric attributes. Spans and logs may
   include only telemetry-manifest allowlisted opaque operation/event IDs and
   inherent W3C trace/span IDs; they never include raw Temporal workflow/run IDs.
   The redaction processor removes any field whose destination is not approved.
5. M0-S5A derives expected Prometheus names using the manifest-pinned
   `UnderscoreEscapingWithSuffixes` strategy: dotted attributes become
   underscore labels, while counter and unit suffixes remain part of the
   contracted queries. M0-S5B proves the approved Example Organization path produces those exact
   names before provisioning the dashboard or rules.
6. Every metric attribute has a closed value set in the telemetry manifest.
   Runtime values outside the set map to a documented bounded fallback or are
   dropped and counted as a local configuration/programming error.
7. Trace and log attributes use only declared scalar values; collections are
   capped at `16` items and every string at `128` UTF-8 bytes before export.
   Free-form runtime strings, automatic exception events, span events, and
   links are prohibited. Structured log records use static event-code templates
   and are capped at `2048` serialized bytes.

## Audit and failure boundaries

- PostgreSQL Operation history, DomainEvent, and AuditEvent records are the
  authoritative business and compliance evidence.
- A mutation requiring audit commits its domain change, DomainEvent/outbox, and
  AuditEvent atomically. Audit persistence failure rolls back the mutation.
- Telemetry is derived after that transaction boundary. Exporter failure never
  manufactures or removes audit evidence and never changes operation status.
- Audit records preserve authenticated actor, effective principal, workspace,
  target reference, policy decision reference, action, result, correlation ID,
  and safe digests. Telemetry exports only fields permitted by the manifest.
- Redaction runs before log rendering and before span/metric export. Exception
  messages, stack locals, HTTP bodies, ORM representations, and provider payloads
  cannot bypass it.
- Sentinel leakage tests scan captured logs, in-memory spans/metrics, rendered
  Problem Details, SSE frames, dashboard fixtures, and exporter error paths.

## Implementation boundaries and patterns

| Concern | Required pattern |
| --- | --- |
| Module | Additive `apps/api/plane/curve/observability/`; no edits to unrelated Plane instrumentation beyond one bounded Curve bootstrap hook |
| Dependencies | Reuse Plane-pinned `opentelemetry-api==1.28.1`, `opentelemetry-sdk==1.28.1`, `opentelemetry-exporter-otlp==1.28.1`, and `opentelemetry-exporter-otlp-proto-grpc==1.28.1`; leave existing `opentelemetry-instrumentation-django==0.49b1` untouched and unused by Curve. Dependency changes require explicit justification, compatibility evidence, and lock updates. |
| Provider isolation | Construct private tracer/meter providers and obtain instruments directly from them. Supply the manifest-pinned static resource, sampler, span limits, temporality, views, exemplar filter, and manual shutdown settings as constructor arguments. Do not call global provider setters, `Resource.create`, `DjangoInstrumentor().instrument()`, Plane license-telemetry endpoint helpers, or generic OpenTelemetry auto-instrumentation. |
| API lifecycle | A thread-safe bootstrap service lazily initializes at most one provider bundle in each post-fork API process after Curve feature/workspace checks. Disabled mode returns a no-op bundle without registering handlers or exit hooks. |
| Worker lifecycle | The worker constructs its provider bundle after environment/policy validation and before `Client.connect`; shutdown runs after the Temporal worker and relay stop, with bounded idempotent flush/close. Workflow code never emits or exports telemetry. |
| Signals | OTLP exports traces and non-local-only metrics. Structured Curve logs use one allowlist-backed JSON stdout formatter/adapter and the existing Example Organization log collection route; no OpenTelemetry log exporter is created in M0. The local exporter-failure metric is available only to deterministic in-memory tests. |
| Propagation | Parse and inject only W3C `traceparent`; invalid input starts a new trace; never accept, persist, or forward `tracestate` or `baggage` in M0. |
| Instrument registry | One typed registry maps manifest names to instruments; unknown metric/span/log event names fail tests |
| Redaction | Deny known forbidden name/value classes, then allow only declared fields; recursively scrub exception/context mappings |
| Workspace scope | Injected HMAC service with key ID; tests use synthetic keys; production/local values come from the approved secret broker |
| Event persistence | Continue reading operation-event v1. A command span injects its outgoing context into a new instrumented operation-event v2 payload; the only additive field is optional validated `traceparent`, and the existing JSON payload column is unchanged. Never rewrite historical event bytes or schema references. |
| Temporal | Implement a Curve-owned client/worker interceptor over the pinned public SDK APIs. The relay extracts operation-event v2 context, creates the dispatch child span, and the client interceptor serializes only that span's `traceparent` under `_curve_traceparent_v1`; deterministic workflow interception copies the opaque validated header to activity commands; activity interception extracts it and creates `curve.activity.run`. V1/no-header histories start a safe local trace; their existing application correlation and operation/event/audit lineage remains authoritative outside exported telemetry. Replay fixtures cover pre-header and post-header histories. |
| SSE | Extract the latest authorized operation-event v2 context to create the publish span; v1/no-context events start a local span. SSE payloads expose the application correlation/event metadata defined by M0-S4 but do not expose telemetry `traceparent`, `tracestate`, or `baggage`; the application correlation ID is excluded from the span and structured log. |
| Metrics | Low-cardinality attributes only; no arbitrary tags supplied by request bodies or providers. Counters/up-down counters/histograms use their matching synchronous instruments; manifest `GAUGE` uses observable-gauge callbacks with the contracted query timeout/failure behavior. |
| Dashboard/alerts | Generated or hand-maintained static files validated against manifest panel/rule identifiers and queries |
| Testing | In-memory exporters, frozen time where needed, deterministic sentinel corpus, no external collector dependency in unit/contract suites |
| Telemetry failure | Swallowed at the observability boundary after a bounded process-local diagnostic; protected application/audit failures retain their existing semantics; remote outage detection belongs to the OBS-BIND-001 platform signal |

### M0-S3 instrumentation mapping

The implementation maps exact accepted M0-S3 (local Temporal round-trip
implementation packet) values to the bounded telemetry vocabulary. It never
uses a raw runtime name as a metric attribute.

| Accepted Plane value | Telemetry value |
| --- | --- |
| Operation type `FOUNDATION_PROBE` | `curve.operation.type=FOUNDATION_PROBE` |
| Activity `curve.mark_operation_running.v1` | `curve.activity.type=MARK_OPERATION_RUNNING` |
| Activity `curve.mark_operation_succeeded.v1` | `curve.activity.type=MARK_OPERATION_SUCCEEDED` |
| Activity `curve.mark_operation_cancelled.v1` | `curve.activity.type=MARK_OPERATION_CANCELLED` |
| Outbox destination `CURVE_TEMPORAL_OPERATION_V1` | `curve.outbox.destination_kind=TEMPORAL` |
| Outbox destination `CURVE_LOCAL` | `curve.outbox.destination_kind=CURVE_LOCAL` |

An unknown value is dropped from telemetry and emits one bounded local
`CURVE_TELEMETRY_CONFIGURATION_INVALID` diagnostic. It never creates a new
metric series dynamically.

## M0-S5A implementation checkpoints

Each checkpoint is one independently reviewable Plane change. A dispatcher may
combine adjacent checkpoints in one PR only when the combined diff remains
repository-local, preserves the stated test isolation, and Designated reviewer approves
the exact dispatch packet.

| Checkpoint | Scope | Required evidence |
| --- | --- | --- |
| M0-S5A-1 (configuration and private providers) | Parse the manifest-owned configuration, validate endpoint/TLS/HMAC inputs, build no-op and in-memory bundles, then build private OTLP tracer/meter providers with explicit resources, limits, processors, readers, views, and shutdown | Disabled/import/fork/concurrency tests; generic `OTEL_*` isolation; TLS negative matrix; no network in test mode |
| M0-S5A-2 (typed telemetry and redaction) | Add the typed instrument/span/log registry, closed attributes, workspace-scope HMAC, static log templates, and bounded redaction processor | Manifest-to-code checker; cardinality and sentinel corpus; byte/item/event/link limits |
| M0-S5A-3 (domain and Temporal propagation) | Instrument HTTP command, outbox dispatch, Temporal client/activity, and immutable audit boundaries; dual-read operation-event v1/v2 and replay-safe traceparent carrier | Correlation, audit rollback, duplicate delivery, old/new event, pre/post-header replay, cancellation, and exporter-failure tests |
| M0-S5A-4 (SSE, metrics, and static assets) | Instrument resumable SSE, observable gauges, dashboard JSON, Prometheus rules, and the repository-local asset checker | SSE resume, gauge timeout/omission, absent worker, bounded failure-ratio inputs, exact queries/identifiers, and disabled rollback |
| M0-S5A-5 (integrated local acceptance) | Run the complete Curve and Plane suites with `IN_MEMORY_TEST`, then repeat with telemetry disabled | All M0-S5A acceptance scenarios, migration statement `NONE`, deterministic cleanup, and a reviewable evidence report |

M0-S5B (local observability integration proof) was delivered as separate
[Plane PR #8](https://github.com/faocampo/plane/pull/8) (local Collector,
Prometheus, Grafana, dashboards, alerts, path health, disablement, and cleanup).
It consumed Curve revision `43480ca...` and deterministic context digest
`sha256:36933053249f2159d2b768e3ff62c3e114a587a5fa650df9b262b4f7d9b28d3b`,
then merged into `preview` at `1b06153...`. The exact results are recorded in
[M0-S5B implementation evidence](m0-s5b-implementation-evidence.md) (CI,
merged-tree equivalence, live acceptance, security, cleanup, and rollback).

## Acceptance scenarios

### M0-S5A executable acceptance

1. Given Curve is disabled or `CURVE_TELEMETRY_MODE` is absent, when Plane starts
   and completes existing tests, then no Curve provider/exporter/network call is
   created and existing Plane behavior is unchanged.
2. Given `IN_MEMORY_TEST`, when one synthetic operation completes, then one W3C
   trace links the instrumented HTTP, outbox, activity, and SSE boundaries, and
   one application correlation lineage links database operation/event/outbox,
   workflow/activity, audit, and SSE evidence without exposing that application
   identifier in telemetry or duplicating terminal effects.
3. Given a replayed idempotent command, duplicate outbox delivery, workflow
   replay, and SSE reconnect, when observed, then telemetry records bounded
   replay/resume outcomes while authoritative state remains singular.
4. Given human and trusted-service mutations, when audited, then authenticated
   actor/effective principal, workspace, target, policy decision, action, result,
   and correlation are attributable in immutable audit evidence.
5. Given the sentinel corpus in request bodies, responses, exception messages,
   model-like inputs/outputs, patches, credentials, evidence, and tool output,
   when every success and error path executes, then no sentinel appears in logs,
   spans, metric names/labels, Problem Details, or SSE frames.
6. Given a workspace UUID, operation UUID, event UUID, workflow ID, and arbitrary
   user-controlled string, when metrics are collected, then none is present in
   any label name/value and every label value belongs to the manifest's closed
   set.
7. Given missing endpoint, unsupported protocol, external-default endpoint,
   insecure non-local configuration, or missing workspace-scope key, when OTLP
   initialization runs, then export stays disabled and the application/audit
   path remains available.
8. Given exporter timeout, rejection, malformed response, and shutdown, when a
   domain operation completes, then the operation/audit transaction succeeds,
   no recursive failure loop occurs, and shutdown respects its timeout.
9. Given the static dashboard and alert files, when validated, then all manifest
   panel/rule identifiers exist exactly once, PromQL uses only contracted metric
   names/labels, and no endpoint, secret, or organization identifier is embedded.
10. Given Plane's existing telemetry settings and generic `OTEL_*` variables are
    present, when Curve is disabled or its private endpoint is absent, then Curve
    creates no provider/exporter, contacts no endpoint, and does not change
    Plane's global provider or existing telemetry behavior.
11. Given valid/invalid `traceparent`, caller-supplied `tracestate`, and caller-
    supplied `baggage`, when a Curve command crosses HTTP, outbox, Temporal, and
    SSE boundaries, then only a valid effective `traceparent` propagates; invalid
    input starts a new trace and no `tracestate`/`baggage` value appears anywhere.
12. Given API process initialization, concurrent first requests, a post-fork
    worker, repeated shutdown, and a forced export timeout, when lifecycle hooks
    execute, then each process owns at most one private provider bundle, flush is
    bounded to `10000 ms`, shutdown is idempotent, and no thread survives the
    disabled or terminal state.
13. Given a configuration error without a workspace key and a workspace-bound
    operation event, when safe structured logs are captured, then the former has
    only common required fields, the latter also has HMAC scope/key ID and may
    include its active W3C trace/span IDs, neither includes the application
    correlation ID, and both conform to the closed field/event-code allowlist.
14. Given retained operation-event v1 rows and Temporal histories created before
    M0-S5, plus new operation-event v2 rows containing a valid `traceparent`,
    when the candidate relay/worker replays and dispatches both shapes, then v1
    remains byte-identical/readable, v2 preserves its trace ID through valid
    parent-child injection, neither duplicates a domain effect, and no migration
    or historical rewrite occurs.
15. Given a stopped worker, a blocked database gauge query, low-volume operation
    failures, and simultaneous SSE connections/resumes, when the in-memory
    metrics harness collects the instruments, then the query returns or omits
    within `1000 ms`, failure-ratio inputs use bounded outcomes, and connections
    and resume rate remain separately observable.
16. Given the static dashboard and alert assets, when the repository-local asset
    checker runs without Prometheus or Grafana, then it proves the absent-worker
    clause, five-minute failure-ratio query, exact manifest identifiers, metric
    translation, and closed label vocabulary. Live query/rule evaluation remains
    the separate M0-S5B integration proof.

### M0-S5B executable acceptance

1. Given the approved OBS-BIND-001 (local Example Organization OTLP/Prometheus/Grafana binding),
   when the local Curve profile starts, then telemetry reaches only the approved
   endpoint over the approved transport, the contracted metric translation is
   observed, and no external fallback is contacted.
2. Given successful, denied, failed, retried, cancelled, resumed, and stuck
   synthetic operations, when queried in the local Grafana dashboard, then the
   contracted panels show the corresponding bounded outcomes and latency/backlog
   data.
3. Given the synthetic stuck-outbox, stale-worker, audit-failure, and
   operation-ratio fixtures, when Prometheus evaluates rules, then the four
   contracted application alerts transition as expected and route only to the
   approved local test destination. Given a complete endpoint/path outage, the
   independent OBS-BIND-001 collector/platform health signal detects it without
   relying on Curve's failed exporter; the local exporter-failure diagnostic
   remains visible in process logs and deterministic in-memory tests.
4. Given two synthetic workspaces, when traces and logs are inspected, then their
   stable scopes differ, raw workspace IDs are absent, and a rotated key produces
   the expected new key ID without breaking audit attribution.
5. Given Curve telemetry is disabled and the stack restarts, when the same
   operation runs, then Curve continues through authoritative audit with no
   exporter call; removing the dashboard/rules does not affect application state.

## Required tests

| Test group | Minimum proof |
| --- | --- |
| Contract | JSON Schema valid/invalid fixtures; operation-event v1/v2 dual-read and invalid `traceparent` fixtures; immutable metric set; bounded attribute values; span/log allowlist; unique dashboard/alert IDs |
| Configuration | Disabled default, explicit endpoint, protocol, local insecure policy, no external fallback, synthetic Secrets Manager references |
| Provider isolation | Generic `OTEL_*` variables and Plane telemetry enabled/disabled permutations; constructor-level static resource, sampler, span limits, temporality, views, exemplar, processor/reader, and shutdown assertions; no global provider, resource detector, Django auto-instrumentation, or exit-hook mutation; one private provider per process |
| Correlation | Existing generated application correlation IDs remain in database/audit/SSE lineage and are absent from exported telemetry; no new caller correlation header; valid W3C `traceparent` propagation links HTTP/outbox/Temporal activity/SSE instrumentation |
| Propagation abuse | Invalid `traceparent`; dropped `tracestate` and `baggage`; no untrusted context in events, Temporal history, logs, spans, metrics, or SSE |
| Authorization | Cross-workspace denial produces safe telemetry and no disclosed target/body; actor/effective-principal audit attribution |
| Cardinality | Prohibited identifier labels and arbitrary attribute values rejected or dropped; closed sets enforced |
| Redaction | Sentinel corpus across success/error/retry/cancel/replay/export-failure paths; zero leakage; strings longer than `128` bytes and collections over `16` items rejected or bounded; zero span events/links; logs at most `2048` serialized bytes |
| Reliability | Queue saturation, exporter timeouts/failures, independent complete-path outage detection, absent/stale worker, `1000 ms` gauge-query timeout, bounded/idempotent shutdown, process fork, concurrent initialization, worker restart, v1/v2 event and pre/post-header Temporal replay, duplicate delivery, workflow replay, SSE resume |
| Audit | Atomic audit append; forced audit failure rolls back protected mutation; telemetry failure leaves audit intact |
| Assets | Dashboard JSON parse; four-rule alert YAML parse; exact manifest IDs; no exporter-self-monitoring query; manifest-pinned metric-name translation; PromQL lint/parse where available |
| Regression | Complete existing Plane backend/frontend checks; Curve disabled behavior unchanged |

## Required commands

The implementation packet replaces placeholders with commands confirmed against
the pinned Plane base. At minimum it executes:

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

M0-S5B (local observability integration proof) additionally executes the
`prepare`, `up`, `verify-health`, `run-foundation`, `verify-telemetry`,
`verify-alerts`, `verify-path-failure`, `verify-disablement`, and `cleanup`
commands in [OBS-BIND-001](obs-bind-001-local-observability-binding.md)
(exact local implementation and acceptance contract). It captures sanitized
health/query/rule evidence, disables telemetry, removes the profile/volumes,
and verifies the Plane stack remains healthy.

## Evidence and PR contract

Each implementation PR records:

- Exact post-M0-S4 Curve contract SHA and M0-08 (audit and observability
  foundation work package) context-pack digest containing the accepted M0-S4
  implementation evidence.
- Exact Plane base/head SHA, one feature branch, and human reviewer.
- Changed-file inventory and proof that unrelated Plane instrumentation is
  unchanged.
- Test commands, results, versions, and failure/skip explanations.
- Manifest-to-code and manifest-to-dashboard/alert trace report.
- Operation-event v1/v2 dual-read and pre/post-header Temporal replay evidence.
- Sentinel and metric-cardinality test evidence.
- Disabled-state and exporter-failure evidence.
- Migration statement (`NONE`) and rollback/disablement proof.
- M0-S5B only: approved [OBS-BIND-001](obs-bind-001-local-observability-binding.md)
  (local Docker OTLP/Prometheus/Grafana/path-health binding), sanitized endpoint/datasource/rule/alert
  evidence, metric-translation and independent path-health proof, test window,
  and cleanup receipt.

M0-S5A (telemetry kernel and static observability assets) and M0-S5B (local
observability integration proof) use separate Plane PRs so binding changes
cannot silently alter the telemetry contract.

## Stop conditions

The coding agent stops before mutation or publication when any of these occurs:

- A required dependency, exact SHA, context digest, owner, or reviewer is absent.
- Plane `preview` does not contain merge `e762fbb...` for Plane PR #6 (M0-S4
  API, SSE, and Curve-first UI implementation), or the final M0-08 (audit and
  observability foundation work package) context manifest lacks the accepted
  M0-S4 implementation-evidence record.
- A proposed metric/span/log field or dashboard/alert rule is outside the
  telemetry manifest.
- A new persistence field, migration, package upgrade, external endpoint,
  exporter, service, or production deployment is required.
- A consumer cannot read both operation-event v1/v2 or an old Temporal history
  cannot replay without `_curve_traceparent_v1`.
- A secret, credential, protected body, raw workspace identifier, or customer
  value would enter source, fixtures, logs, traces, metrics, or PR evidence.
- Plane's external default telemetry endpoint would be inherited or contacted.
- M0-S5B lacks any OBS-BIND-001 (local Example Organization OTLP/Prometheus/Grafana binding)
  field, or the live configuration differs from the approved record.
- No independent collector/platform signal can detect a complete OTLP-path
  outage while Curve telemetry is expected to be enabled.
- The observed Prometheus metric or label names differ from the
  manifest-pinned `UnderscoreEscapingWithSuffixes` contract.
- Tests reveal cross-workspace disclosure, unbounded label values, audit loss,
  duplicate business effects, non-deterministic workflow behavior, or a Critical
  or High security finding.

## Rollback and disablement

1. Set `CURVE_TELEMETRY_MODE=DISABLED` and restart the Curve-enabled services.
2. Confirm no Curve exporter/network activity and confirm Operation/audit/SSE
   behavior remains functional.
3. Remove or disable only the Curve Grafana dashboard and Prometheus rule group.
4. Revert the additive Plane implementation PR. No database down-migration or
   business-record deletion is required because this packet adds no persistence.
5. Retain immutable application audit records and the implementation/test
   evidence required by the governing retention policy.
