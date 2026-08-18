# M0-S5 Audit and Observability Task Packet

## Document control

| Field | Value |
| --- | --- |
| Package | M0-S5 (local audit and observability implementation packet) / M0-08 (audit and observability foundation work package) |
| Status | `READY_FOR_PLATFORM_BINDING_REVIEW`; implementation dependencies remain gated |
| Version | 1.0 |
| Date | 2026-08-18 |
| Product | Curve |
| Contract repository | `git@github.com:faocampo/curve.git` |
| Implementation repository | `git@github.com:faocampo/plane.git` |
| Minimum Plane ancestor | `preview` merge `eff8686a69aa112ea8fda79be0e1316dc1fd97d6` |
| Implementation base | Exact descendant of the minimum ancestor, pinned after M0-S4 (API, SSE, and minimal approved UI packet) merges |
| Owner and human reviewer | Federico Ocampo, CTO at X3M |
| Risk | `STANDARD`, with telemetry treated as a data-exfiltration boundary |
| Product trace | FR-021 and FR-024 (audit and measurable lifecycle requirements); NFR-001 through NFR-014 (performance, reliability, security, privacy, and operations requirements); AC-34, AC-36, and AC-53 (audit, KPI, and protected-data acceptance criteria) |

## Outcome

Implement a deterministic, opt-in observability kernel that correlates one
workspace-scoped Curve operation across HTTP, PostgreSQL, the transactional
outbox, Temporal workflow/activity execution, audit history, and resumable SSE.
It emits only explicitly allowlisted telemetry, preserves immutable Curve audit
records as the authoritative evidence, and integrates with X3M's existing
OpenTelemetry, Prometheus, and Grafana services after the local binding is
approved.

This packet divides delivery into two independently reviewable changes:

1. M0-S5A (telemetry kernel and static observability assets) implements safe
   instrumentation, deterministic in-memory tests, the Grafana dashboard
   definition, and Prometheus alert-rule definition. It requires M0-S4 (API,
   SSE, and minimal approved UI packet) and the approved Curve contract head.
2. M0-S5B (X3M local observability integration proof) binds the kernel to the
   approved local X3M collector, Prometheus datasource, Grafana provisioning,
   and alert route. It additionally requires OBS-BIND-001 (local X3M
   OTLP/Prometheus/Grafana binding) to be complete.

## Normative sources

| Source | Authority in this packet |
| --- | --- |
| [Curve PRD v0.8](../curve-ai-native-sdlc-prd.md) (product scope, functional/non-functional requirements, and acceptance criteria) | Product invariants and acceptance boundaries |
| [Architecture](architecture.md) (logical components, trust boundaries, truth ownership, and deployment profiles) | PostgreSQL remains business truth; telemetry is a derived operational projection |
| [Domain model](domain-model.md) (workspace-scoped aggregates, events, audit records, and lifecycle invariants) | Correlation and audit entity semantics |
| [Authorization and state matrices](m0-authorization-and-state-matrices.md) (M0 roles, policy inputs, and operation transitions) | Actor/effective-principal attribution and protected-transition rules |
| [Security and operations](security-and-operations.md) (identity, redaction, data handling, observability, and incident controls) | Telemetry allowlist, secret/protected-data exclusion, and operational response |
| [Telemetry manifest v1](../../contracts/observability/m0-s5-telemetry-v1.json) (metric, span, log, dashboard, alert, redaction, and exporter contract) | Normative instrumentation surface |
| [Telemetry manifest schema](../../contracts/schemas/telemetry-manifest.schema.json) (machine validation of fail-closed telemetry configuration) | Contract shape and fail-closed constants |
| [Audit event schema](../../contracts/schemas/audit-event.schema.json) (immutable attributed audit evidence) | Authoritative application evidence |
| [Access Envelope schema](../../contracts/schemas/access-envelope.schema.json) (classification, authorization, retention, and redaction policy) | Protected-data handling boundary |
| [M0 traceability](m0-traceability.md) (requirement-to-contract-to-test ownership) | Verification ownership |

The coding agent pins one exact Curve commit containing all sources above. A
later documentation commit cannot silently change an active implementation.

## Entry gates and dispatch packets

### M0-S5A entry gates

All conditions must be true before code mutation:

- M0-03 (core authorization and policy kernel work package), M0-S3 (local
  Temporal round-trip implementation packet), and M0-S4 (API, SSE, and minimal
  approved UI packet) are merged into Plane `preview` with accepted evidence.
- The exact Plane base SHA is recorded and descends from
  `eff8686a69aa112ea8fda79be0e1316dc1fd97d6`.
- The exact Curve contract SHA and its deterministic M0-08 (audit and
  observability foundation work package) context-pack digest are recorded.
- Federico Ocampo approves the exact contract head and is the named human
  reviewer for the implementation PR.
- The implementation packet contains exact build/test commands and synthetic
  sentinel values. It contains no X3M secret or protected evidence body.

### M0-S5B entry gates

M0-S5B (X3M local observability integration proof) additionally requires an
owner-approved OBS-BIND-001 (local X3M OTLP/Prometheus/Grafana binding) record
with every field below:

| Required field | Required value or evidence |
| --- | --- |
| Platform Operations owner | Named person accountable for local collector, datasource, dashboard, and alert routing |
| OTLP endpoint | Local endpoint or X3M Secrets Manager/configuration reference; no credential value in Git |
| OTLP protocol | Exact `grpc` or `http/protobuf` value supported by the local collector |
| OTLP transport policy | Local TLS/insecure rule and certificate/CA reference where applicable |
| Workspace-scope key | Secrets Manager reference, stable key ID, rotation owner, and overlapping-key rotation procedure |
| Prometheus datasource | Grafana datasource UID and approved dashboard variable binding |
| Grafana provisioning | Folder UID and repository/provisioning path or named API owner |
| Prometheus rule provisioning | Approved repository path or Kubernetes namespace/configuration owner |
| Alert route | Contact-point/routing identifier and named response owner |
| Local verification window | Start/end time, cleanup/disablement rule, and expected evidence destination |

Absent or partial values leave OTLP export disabled. They do not block M0-S5A
(telemetry kernel and static observability assets).

## Scope

### M0-S5A in scope

- A dedicated `plane.curve.observability` package using Plane's pinned
  OpenTelemetry Python dependencies.
- Configuration parsing and validation for all environment variables named by
  the telemetry manifest.
- `DISABLED`, `IN_MEMORY_TEST`, and explicit `OTLP` exporter modes.
- Application correlation-ID generation/validation and W3C `traceparent` /
  `tracestate` propagation.
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

- Local X3M configuration binding from OBS-BIND-001 (local X3M
  OTLP/Prometheus/Grafana binding).
- Existing local Plane Docker-stack configuration needed to opt in to the
  approved local endpoint.
- Prometheus/Grafana import or provisioning proof using X3M's existing services.
- Synthetic successful, denied, failed, retried, cancelled, resumed, and stuck
  operation observations.
- Alert evaluation/routing proof without sending production notifications.
- Disablement and restart proof.

### Excluded

- New observability infrastructure or a second collector, Prometheus, Grafana,
  log store, or trace store.
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
| Default | `CURVE_TELEMETRY_MODE=DISABLED`; no SDK provider, exporter, network call, or background telemetry thread |
| Test mode | `IN_MEMORY_TEST`; deterministic in-process exporters, no network |
| OTLP mode | Requires an explicit approved endpoint, protocol, and applicable transport configuration |
| External fallback | Prohibited; Curve never inherits or calls an external default endpoint |
| Insecure transport | Accepted only for an explicitly approved local endpoint |
| Invalid configuration | Curve application functions remain available; exporter setup stays disabled and emits one locally bounded configuration error without secrets |
| Export failure | Domain transaction and immutable audit truth remain unaffected; a bounded local export-failure metric/log event is emitted without recursive export loops |
| Shutdown | Providers flush within a bounded timeout and then close; application shutdown cannot wait indefinitely |

The implementation centralizes provider construction so imports and ordinary
unit tests never instantiate network exporters.

## Correlation, identity, and cardinality contract

1. The API accepts a syntactically valid inbound correlation ID or generates a
   new UUID. It returns the effective value and passes it through Operation,
   DomainEvent, OutboxEvent, workflow/activity input envelopes, audit metadata,
   structured logs, spans, and SSE event metadata.
2. W3C trace context is propagated across HTTP, outbox dispatch, Temporal
   client/workflow/activity boundaries, and SSE publication. Business IDs are
   separate from trace/span IDs.
3. `workspace_id` appears in authoritative database/audit records. Telemetry
   uses `HMAC-SHA256(key, "curve-workspace-scope:v1" || 0x00 || workspace_id)`
   as `curve.workspace.scope`, accompanied by a non-secret stable key ID.
4. Raw workspace, operation, event, workflow, correlation, and trace identifiers
   are prohibited as metric attributes. Span/log identifiers use only the
   telemetry-manifest allowlist and are removed by the redaction processor when
   the destination is not approved.
5. Prometheus labels derive from OpenTelemetry dotted attributes by replacing
   dots with underscores; for example, `curve.outbox.state` becomes
   `curve_outbox_state`. Dashboards and alerts use this exported form.
6. Every metric attribute has a closed value set in the telemetry manifest.
   Runtime values outside the set map to a documented bounded fallback or are
   dropped and counted as a local configuration/programming error.

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
| Dependencies | Reuse Plane-pinned OpenTelemetry API/SDK/exporter/instrumentation packages; dependency changes require explicit justification and lock updates |
| Instrument registry | One typed registry maps manifest names to instruments; unknown metric/span/log event names fail tests |
| Redaction | Deny known forbidden name/value classes, then allow only declared fields; recursively scrub exception/context mappings |
| Workspace scope | Injected HMAC service with key ID; tests use synthetic keys; production/local values come from X3M Secrets Manager |
| Temporal | Propagator/interceptor carries safe trace and correlation context; workflow code remains deterministic and performs no exporter I/O |
| Metrics | Low-cardinality attributes only; no arbitrary tags supplied by request bodies or providers |
| Dashboard/alerts | Generated or hand-maintained static files validated against manifest panel/rule identifiers and queries |
| Testing | In-memory exporters, frozen time where needed, deterministic sentinel corpus, no external collector dependency in unit/contract suites |
| Telemetry failure | Swallowed at observability boundary after bounded local diagnostic; protected application/audit failures retain their existing semantics |

## Acceptance scenarios

### M0-S5A executable acceptance

1. Given Curve is disabled or `CURVE_TELEMETRY_MODE` is absent, when Plane starts
   and completes existing tests, then no Curve provider/exporter/network call is
   created and existing Plane behavior is unchanged.
2. Given `IN_MEMORY_TEST`, when one synthetic operation completes, then one
   correlation chain links HTTP, database operation/event/outbox, workflow,
   activity, audit, and SSE evidence without duplicate terminal effects.
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

### M0-S5B executable acceptance

1. Given the approved OBS-BIND-001 (local X3M OTLP/Prometheus/Grafana binding),
   when the local Curve profile starts, then telemetry reaches only the approved
   endpoint over the approved transport and no external fallback is contacted.
2. Given successful, denied, failed, retried, cancelled, resumed, and stuck
   synthetic operations, when queried in the local Grafana dashboard, then the
   contracted panels show the corresponding bounded outcomes and latency/backlog
   data.
3. Given the synthetic stuck-outbox, stale-worker, audit-failure, operation-ratio,
   and exporter-failure fixtures, when Prometheus evaluates rules, then the five
   contracted alerts transition as expected and route only to the approved local
   test destination.
4. Given two synthetic workspaces, when traces and logs are inspected, then their
   stable scopes differ, raw workspace IDs are absent, and a rotated key produces
   the expected new key ID without breaking audit attribution.
5. Given Curve telemetry is disabled and the stack restarts, when the same
   operation runs, then Curve continues through authoritative audit with no
   exporter call; removing the dashboard/rules does not affect application state.

## Required tests

| Test group | Minimum proof |
| --- | --- |
| Contract | JSON Schema valid/invalid fixtures; immutable metric set; bounded attribute values; span/log allowlist; unique dashboard/alert IDs |
| Configuration | Disabled default, explicit endpoint, protocol, local insecure policy, no external fallback, synthetic Secrets Manager references |
| Correlation | HTTP/outbox/Temporal/audit/SSE propagation, W3C headers, generated and accepted correlation IDs |
| Authorization | Cross-workspace denial produces safe telemetry and no disclosed target/body; actor/effective-principal audit attribution |
| Cardinality | Prohibited identifier labels and arbitrary attribute values rejected or dropped; closed sets enforced |
| Redaction | Sentinel corpus across success/error/retry/cancel/replay/export-failure paths; zero leakage |
| Reliability | Exporter timeouts/failures, shutdown, worker restart, duplicate delivery, workflow replay, SSE resume |
| Audit | Atomic audit append; forced audit failure rolls back protected mutation; telemetry failure leaves audit intact |
| Assets | Dashboard JSON parse; alert YAML parse; exact manifest IDs; PromQL lint/parse where available |
| Regression | Complete existing Plane backend/frontend checks; Curve disabled behavior unchanged |

## Required commands

The implementation packet replaces placeholders with commands confirmed against
the pinned Plane base. At minimum it executes:

```text
git diff --check
node apps/api/plane/curve/contracts/check-integrity.mjs
docker compose -f docker-compose-test.yml run --rm --build api-tests pytest plane/curve/tests -k "audit or telemetry or redaction or correlation"
docker compose -f docker-compose-test.yml run --rm api-tests pytest plane/curve/tests
pnpm check
pnpm build
docker compose -f docker-compose-test.yml up --build --abort-on-container-exit --exit-code-from api-tests
```

M0-S5B (X3M local observability integration proof) additionally executes the
exact local stack commands recorded by OBS-BIND-001 (local X3M
OTLP/Prometheus/Grafana binding), captures target health/query/rule evidence,
then disables the profile and verifies the Plane stack remains healthy.

## Evidence and PR contract

Each implementation PR records:

- Exact Curve contract SHA and M0-08 (audit and observability foundation work
  package) context-pack digest.
- Exact Plane base/head SHA, one feature branch, and human reviewer.
- Changed-file inventory and proof that unrelated Plane instrumentation is
  unchanged.
- Test commands, results, versions, and failure/skip explanations.
- Manifest-to-code and manifest-to-dashboard/alert trace report.
- Sentinel and metric-cardinality test evidence.
- Disabled-state and exporter-failure evidence.
- Migration statement (`NONE`) and rollback/disablement proof.
- M0-S5B only: approved OBS-BIND-001 (local X3M
  OTLP/Prometheus/Grafana binding), sanitized endpoint/datasource/rule/alert
  evidence, test window, and cleanup receipt.

M0-S5A (telemetry kernel and static observability assets) and M0-S5B (X3M local
observability integration proof) use separate Plane PRs so X3M binding changes
cannot silently alter the telemetry contract.

## Stop conditions

The coding agent stops before mutation or publication when any of these occurs:

- A required dependency, exact SHA, context digest, owner, or reviewer is absent.
- A proposed metric/span/log field or dashboard/alert rule is outside the
  telemetry manifest.
- A new persistence field, migration, package upgrade, external endpoint,
  exporter, service, or production deployment is required.
- A secret, credential, protected body, raw workspace identifier, or customer
  value would enter source, fixtures, logs, traces, metrics, or PR evidence.
- Plane's external default telemetry endpoint would be inherited or contacted.
- M0-S5B lacks any OBS-BIND-001 (local X3M OTLP/Prometheus/Grafana binding)
  field, or the live configuration differs from the approved record.
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
