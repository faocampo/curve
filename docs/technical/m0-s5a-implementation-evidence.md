# M0-S5A Local Observability Kernel Implementation Evidence

## Document control

| Field | Value |
| --- | --- |
| Status | `ACCEPTED_AND_MERGED` |
| Evidence date | 2026-08-22 |
| Task | M0-S5A (telemetry kernel and static observability assets) |
| Parent work package | M0-08 (audit and observability foundation work package) |
| Human owner and reviewer | Federico Ocampo (`faocampo`), CTO at X3M |
| Curve implementation-contract revision | `fa6fd677fc41d0bc73a8587e78d33d55a6824429` |
| Curve planning merge | `a23dab99e9afcc9dbfad7f5a3dc8b394ef60e529` on `main` |
| Context digest | `sha256:720a70bb9146761e7b4f1852e889127460812d25d84cbafd1304e20caa18ac1a` |
| Plane base | `e762fbbd2c1726a2833745add8245a1679c60d88` on `preview` |
| Plane approved head | `c258ef12221964dae67286e0f6a6c2dc58b997fe` |
| Plane merge | `39920769daf78fce29a10c7f4e4bb8779671b004` on `preview` |
| Curve PR | [Curve PR #19](https://github.com/faocampo/curve/pull/19) (M0-S5 observability contract, telemetry manifest, schemas, and execution packet) |
| Plane PR | [Plane PR #7](https://github.com/faocampo/plane/pull/7) (M0-S5A local audit and observability kernel) |
| Data classification | Synthetic `INTERNAL` local-test data only |

## Accepted outcome

M0-S5A (telemetry kernel and static observability assets) is complete. The
accepted Plane implementation adds:

1. A Curve-private OpenTelemetry runtime with `DISABLED`, `IN_MEMORY_TEST`, and
   explicitly configured `OTLP` modes. It does not install a global Plane
   provider or automatic instrumentation.
2. Disabled-by-default, fail-closed parsing for Curve-owned exporter,
   endpoint, protocol, TLS, header, HMAC workspace-scope, component, and
   environment settings.
3. Closed metric, span, structured-log, resource, attribute, value,
   cardinality, byte, event, and link contracts backed by the immutable
   telemetry manifest.
4. HMAC-derived workspace telemetry scope with a versioned key identifier;
   raw workspace identifiers, correlation identifiers, protected bodies, and
   credentials remain outside exported telemetry.
5. Correlation across authorized API commands, immutable audit appends,
   operation events, transactional outbox delivery, Temporal activities, and
   resumable SSE.
6. Operation-event v2 with an optional validated `traceparent`, while retaining
   operation-event v1 read/write compatibility without a database migration.
7. Process-local exporter-failure diagnostics, bounded gauge queries, worker
   heartbeat, deterministic shutdown, a repository-owned Grafana dashboard,
   four Prometheus alert rules, and static contract/asset checks.
8. No live X3M collector, Prometheus, Grafana, credentials, routing, alert
   receiver, infrastructure, or deployment mutation. Those bindings remain in
   M0-S5B (X3M local observability integration proof).

The implementation is bound to the
[M0-S5 context manifest](https://github.com/faocampo/plane/blob/39920769daf78fce29a10c7f4e4bb8779671b004/apps/api/plane/curve/contracts/m0-s5-context.json)
(31-file deterministic product, architecture, policy, telemetry, schema, and
execution input record) with aggregate digest
`sha256:720a70bb9146761e7b4f1852e889127460812d25d84cbafd1304e20caa18ac1a`.

## Approval and merge binding

Federico Ocampo approved exact Curve head
`fa6fd677fc41d0bc73a8587e78d33d55a6824429` and authorized its squash merge
into `main`. GitHub merged it on 2026-08-21 as
`a23dab99e9afcc9dbfad7f5a3dc8b394ef60e529` with parent
`ccd3c3aa6de46e0f2ee197905226cb40db0515b3`. The
[Curve validation job](https://github.com/faocampo/curve/actions/runs/32537515913/job/96941083714)
(documentation, schema, contract, context, and Project-synchronizer checks) was
green at the approved head.

Federico Ocampo separately approved exact Plane head
`c258ef12221964dae67286e0f6a6c2dc58b997fe` and authorized marking
[Plane PR #7](https://github.com/faocampo/plane/pull/7) (M0-S5A local audit and
observability kernel) ready and squash-merging it into `preview` while CI
remained green. GitHub reported no configured workflow runs or required branch
checks for the PR. The repository-local acceptance commands below were the
applicable green evidence. GitHub merged the PR on 2026-08-22 at
`2026-08-22T16:15:31Z` as
`39920769daf78fce29a10c7f4e4bb8779671b004` with parent
`e762fbbd2c1726a2833745add8245a1679c60d88`.

Both squash merges preserve the exact approved content:

| Repository and revision | Git tree |
| --- | --- |
| Curve approved head `fa6fd67...` | `c3bae447070d5d0fcf1eb9844a9e30082b1129d2` |
| Curve merge `a23dab9...` | `c3bae447070d5d0fcf1eb9844a9e30082b1129d2` |
| Plane approved head `c258ef1...` | `87db1b646cd473f1c407b8aebbc43c27e62d9f8c` |
| Plane merge `3992076...` | `87db1b646cd473f1c407b8aebbc43c27e62d9f8c` |

## Contract and implementation binding

| Control | Accepted evidence |
| --- | --- |
| Curve context | Revision `a23dab9...`; 31 sorted, unique paths; aggregate and per-file SHA-256 values verified |
| Telemetry manifest | Vendored byte-for-byte with digest `sha256:8ba95e5e605188e829df03374114eb2ec0d2cbea0218f1d286198cbbb2d34d9b` |
| Runtime isolation | Curve-private tracer and meter providers; no global provider registration or automatic Plane instrumentation |
| Configuration | Default `DISABLED`; explicit in-memory and OTLP modes; fail-closed endpoint, protocol, TLS, header, scope-key, key-ID, environment, and component validation |
| Data minimization | Closed attributes and values; HMAC workspace scope; no raw workspace ID, correlation ID, request/body, credential, arbitrary exception, or unrestricted URL export |
| Trace propagation | Validated `traceparent` only across operation-event v2, outbox, Temporal client/workflow/activity, and SSE boundaries; v1 compatibility retained |
| Audit semantics | Successful audit metrics emit after authoritative commit; failed audit appends emit failure telemetry without weakening the domain transaction |
| Operational assets | Ten-panel Grafana dashboard, four Prometheus alerts, manifest-derived metric names, and a repository-local asset checker |
| Migration | `python manage.py makemigrations curve --check --dry-run` returned `No changes detected in app 'curve'` |

## Verification results

All verification below ran against the approved Plane Git tree
`87db1b646cd473f1c407b8aebbc43c27e62d9f8c`, which is identical to the merged
Plane `preview` tree.

| Verification | Result |
| --- | --- |
| Complete Curve backend suite, telemetry disabled | `191 passed` |
| Complete Curve backend suite, private in-memory telemetry | `191 passed` |
| Complete Plane backend suite, telemetry disabled | `707 passed`, 92 existing deprecation warnings, in 109.82 seconds |
| Complete Plane backend suite, private in-memory telemetry | `707 passed`, the same 92 warnings, in 104.85 seconds |
| Curve Python lint | `ruff check plane/curve`: passed |
| Monorepo checks | `pnpm check`: 60 of 60 tasks successful |
| Monorepo build | `pnpm build`: 16 of 16 tasks successful |
| Contract integrity | M0-S2, M0-03, M0-S3, M0-S4, M0-S5, and Temporal supply-chain checks passed |
| Dashboard and alerts | 10 dashboard panels and 4 alert rules passed the manifest-derived asset checker |
| Migration drift | `No changes detected in app 'curve'` |
| Secret and diff hygiene | Credential-pattern scan and `git diff --check` passed; worktree contained only declared M0-S5A files before commit |

The backend suites used disposable PostgreSQL, Valkey, RabbitMQ, and MinIO
services with an ignored synthetic local `.env`. The in-memory run used a
synthetic 32-byte base64url HMAC scope key and synthetic key identifier. Both
runs used only local test data. The disposable containers, network, volumes,
and temporary test configuration were removed after verification.

## Security and operational acceptance

1. Telemetry is disabled by default and an incomplete or invalid configuration
   fails closed without opening a connection.
2. Curve does not replace Plane's global tracer or meter providers and does not
   add broad automatic instrumentation.
3. Raw workspace identifiers, correlation identifiers, credentials, request
   bodies, protected evidence, arbitrary exception text, arbitrary headers,
   and unrestricted URLs are excluded by closed contracts.
4. Workspace telemetry scope is deterministic only for the active HMAC key and
   is labelled by a bounded key identifier for controlled rotation.
5. Temporal propagation copies only a syntactically valid W3C `traceparent`;
   no baggage or arbitrary headers cross the workflow boundary.
6. Exporter and gauge failures cannot change domain outcomes, bypass immutable
   audit writes, or create recursive export loops.
7. Observable-gauge SQL uses a bounded statement timeout, cache, static query,
   and safe omission on failure.
8. Static dashboard and alert assets are validated against the manifest rather
   than live X3M data-source identifiers or routing configuration.

## Rollback proof and procedure

The accepted change is additive and introduces no migration. Operational
rollback is:

1. Set `CURVE_TELEMETRY_MODE=DISABLED` for the Curve API and Temporal worker.
2. Restart those processes so each constructs a disabled private runtime.
3. Leave Operation, DomainEvent, outbox, inbox, idempotency, policy, and audit
   truth unchanged.
4. Retain the static dashboard and alert files as inert repository assets, or
   remove their later platform projection through the owning M0-S5B change.
5. Revert Plane merge `3992076...` through a separately reviewed PR if source
   rollback is required.

No destructive database rollback, collector change, dashboard deletion, alert
receiver mutation, or production operation is required for M0-S5A rollback.

## Acceptance mapping and remaining scope

| Requirement | Evidence disposition |
| --- | --- |
| FR-021 | Immutable audit appends and outcomes are instrumented without weakening transaction truth |
| FR-024 | Local operation, workflow, outbox, SSE, audit, failure, retry, duration, backlog, and worker-health telemetry is implemented |
| NFR-001-NFR-008 | Bounded local metrics/traces/logs, failure isolation, deterministic shutdown, and full regression evidence accepted for M0-S5A |
| NFR-009-NFR-014 | Closed redaction/cardinality policy, workspace isolation, safe propagation, and disabled rollback accepted |
| AC-34 | Safe correlation and immutable audit observability accepted for the local control-plane slice |
| AC-53 | Telemetry-disabled behavior, exporter failure isolation, and no application regression accepted |

M0-S5A (telemetry kernel and static observability assets) is complete. M0-08
(audit and observability foundation work package) remains open and visually
`In progress` because M0-S5B (X3M local observability integration proof) still
requires OBS-BIND-001 (X3M OTLP, Prometheus, Grafana, alert-routing, and
independent path-health binding). This evidence does not authorize live export,
staging/production activation, infrastructure mutation, or M0-08 completion.

The paragraph above preserves the dependency state at M0-S5A acceptance.
[OBS-BIND-001](obs-bind-001-local-observability-binding.md) (decided local
Docker OTLP, Prometheus, Grafana, and path-health binding) was subsequently
selected on 2026-08-22. M0-S5B now awaits exact merged context publication and
implementation; M0-08 remains open until its local acceptance evidence passes.
