# Curve M0 quality and test strategy

## Document control

| Field | Value |
| --- | --- |
| Product | Curve |
| Work package | P0-05 (test-harness strategy and R1 acceptance traceability) |
| Status | `IN_REVIEW` |
| Version | 1.0 |
| Owner | Federico Ocampo, CTO at X3M |
| Human reviewer | Federico Ocampo |
| Last updated | 2026-08-22 |
| Product source | [Curve PRD v0.12](../curve-ai-native-sdlc-prd.md) (product requirements, lifecycle, decisions, and AC-01 through AC-60) |
| Delivery source | [Development plan](development-plan.md) (milestones, packages, dependencies, and completion evidence) |
| Machine contract | [AC test matrix v1](../../contracts/testing/ac-test-matrix-v1.json) (suite, environment, command, gate, and evidence ownership for all 60 criteria) |
| Validation schema | [Test-strategy matrix schema](../../contracts/schemas/test-strategy-matrix.schema.json) (closed JSON Schema for the P0-05 matrix) |

## Purpose and completion boundary

P0-05 establishes the versioned test system that every Curve work package uses
to prove its acceptance criteria. It assigns all 60 R1 criteria to an owning
package, primary suite, primary environment, supporting suites, command
references, material decisions, automation mode, and durable evidence.

P0-05 is complete when:

1. the machine contract contains the exact ordered set AC-01 through AC-60 once;
2. every catalog and matrix reference resolves;
3. current coverage is distinguished from specified future coverage;
4. every available command is executable from a named repository root;
5. every planned command has a fail-closed readiness rule for its consuming
   package;
6. positive schema validation, negative-fixture rejection, semantic validation,
   Markdown validation, and repository structure checks pass; and
7. Federico Ocampo approves the exact PR head and the change is merged.

The strategy governs test planning and evidence. A consuming implementation
package remains responsible for its executable test code, exact base SHA,
environment authorization, and package-level acceptance result.

## Test principles

1. **Acceptance-first traceability.** Every test names the AC, FR/NFR, package,
   aggregate or adapter contract, and exact evidence revision it proves.
2. **Truthful coverage.** `coverage_state` reports the complete R1 scenario.
   Existing M0 evidence can establish `PARTIAL` while later packages remain to
   complete the criterion.
3. **Deterministic core.** Time, identifiers, model/provider outputs, callbacks,
   retries, budgets, VCS responses, and failure order use seeded or scripted
   fixtures in unit, contract, replay, and recovery suites.
4. **Real boundaries where behavior depends on them.** PostgreSQL constraints,
   Temporal replay, browser behavior, VCS ambiguity, gVisor isolation, and
   staging recovery run against their declared environment rather than an
   in-memory substitute.
5. **Workspace isolation by construction.** Every persistence, API, event,
   cache, object, provider, runner, and export package adds a paired-workspace
   negative fixture.
6. **Exact revision evidence.** Results bind the Curve contract revision, Plane
   base/head SHA, schema and policy versions, tool/rulepack/image versions, test
   command, environment identity, and evidence digest.
7. **Fail-closed readiness.** A planned command, blocked decision, unavailable
   environment, missing fixture, or stale head keeps the owning package from
   `READY` or keeps the criterion below `IMPLEMENTED_PASSING`.
8. **Repository-native parity.** Curve preflight and acceptance preserve the
   target repository's native build, lint, test, security, and protection
   semantics.
9. **Human evidence is structured.** Manual verification uses a numbered,
   attributed, versioned script with expected observations, timestamps,
   artifact digests, and an explicit result.

## Coverage-state contract

| State | Meaning | Promotion requirement |
| --- | --- | --- |
| `SPECIFIED` | Suite, environment, commands, package, and expected evidence are assigned. | Implement the owning behavior and executable tests. |
| `DECISION_BLOCKED` | At least one material product, architecture, security, data, licensing, infrastructure, or external-effect decision is open. | Record the named owner decision, then implement and run the evidence. |
| `ENVIRONMENT_BLOCKED` | The owning non-local or isolated runtime is not activated for the test. | Approve and prove the named environment, then execute the suite. |
| `PARTIAL` | Available evidence proves a bounded subset of the complete R1 scenario. | Complete the remaining surfaces and run the aggregate criterion suite. |
| `IMPLEMENTED_PASSING` | The complete criterion passed on the exact accepted head in an available authoritative environment. | Any relevant head, contract, policy, tool, or environment change invalidates the result and requires rerun. |

The initial v1 matrix contains 15 `SPECIFIED`, 35 `DECISION_BLOCKED`, seven
`ENVIRONMENT_BLOCKED`, and three `PARTIAL` criteria. Promotion counts are
computed from the machine contract rather than edited in dashboards by hand.

## Test-suite architecture

| Suite ID | Responsibility | Framework or boundary | Current state |
| --- | --- | --- | --- |
| `S-UNIT` | Pure domain, policy, mapper, scheduler, and state-machine behavior | [pytest](https://docs.pytest.org/) and [Vitest](https://vitest.dev/) | Available |
| `S-DATABASE` | PostgreSQL constraints, transactions, concurrency, outbox/inbox, audit, immutable history | [Django testing tools](https://docs.djangoproject.com/en/stable/topics/testing/) against Plane's PostgreSQL test stack | Available |
| `S-CONTRACT` | OpenAPI, JSON Schema, events, SSE, Problem Details, policy, provider, and evidence envelopes | [JSON Schema 2020-12](https://json-schema.org/draft/2020-12), [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0), and repository validators | Available |
| `S-FAKE-PROVIDER` | Scripted success, question, timeout, duplicate, reordered, lost response, revocation, and reconciliation | Provider-neutral adapters with deterministic clocks and identifiers | Planned in M4-01 (provider-neutral execution SDK) |
| `S-TEMPORAL-REPLAY` | Workflow determinism, signals, queries, retries, cancellation, restart, and version evolution | [Temporal Python testing](https://docs.temporal.io/develop/python/testing-suite) and checked-in histories | Partial; M0-S3 replay exists |
| `S-COMPONENT` | React rendering, state mapping, safe errors, navigation, and component interaction | [Vitest](https://vitest.dev/) with the Plane web test harness | Available |
| `S-BROWSER-E2E` | Authenticated lifecycle, SSE resume, gates, accessibility flows, downloads, and multi-page state | [Playwright](https://playwright.dev/) with pinned browser artifacts | Planned; first browser package pins the command and image |
| `S-ACCESSIBILITY` | Keyboard flow, focus, semantic names, announcements, contrast, zoom, and reduced motion | Pinned browser accessibility runner plus manual keyboard script | Planned; first accessibility package pins runner and ruleset |
| `S-SECURITY` | RBAC/ABAC, tenancy, injection, redaction, SSRF, credentials, authorization, and data leakage | Negative API/adapter fixtures plus gVisor hostile workloads | Partial; M0 policy/API fixtures exist |
| `S-MIGRATION` | Forward migration, rollback/disablement, compatibility, locks, data preservation, and drift | Django migrations against a disposable PostgreSQL database | Available |
| `S-LOAD` | API/SSE throughput, workflow backlog, schedule calculations, budgets, and capacity | Seeded workload harness with declared SLO and abort thresholds | Planned by the first load-owning package |
| `S-CHAOS-RECOVERY` | Database, Temporal, gateway, Onyx, runner, and VCS disruption and reconciliation | Local deterministic failure injection plus authorized staging faults | Partial; local Temporal restart/replay exists |
| `S-SANDBOX` | gVisor escape, egress, metadata, secret, resource, cross-run, cleanup, and quarantine controls | Dedicated staging `RuntimeClass` and disposable hostile-workload corpus | Environment-blocked |
| `S-MANUAL-EVIDENCE` | Deployment observation, adjacent regression, and other irreducibly human checks | Versioned scripts and immutable evidence records | Planned per consuming packet |
| `S-RELEASE-COMPLIANCE` | AGPL source link, exact public tag, notices, SBOM, provenance, and build/install proof | Public release CI plus attributed verification | Planned in P0-04 (AGPL compliance implementation package) |

## Environment model

| Environment ID | Purpose | Data boundary | Activation rule |
| --- | --- | --- | --- |
| `E-CURVE-DOCS-CI` | Contract and documentation validation | Synthetic and sanitized fixtures | Available on Curve PRs |
| `E-PLANE-TEST-CI` | Django, PostgreSQL, contract, migration, and complete backend tests | Synthetic only | Available on Plane PRs |
| `E-PLANE-WEB-CI` | TypeScript unit and component tests | Synthetic only | Available on Plane PRs |
| `E-CURVE-LOCAL-COMPOSE` | Curve API, worker, Temporal, observability, and UI integration | Synthetic only | Available under D-003 (local runtime topology and trust-zone decision) `LOCAL_ONLY` |
| `E-BROWSER-LOCAL` | Authenticated browser and accessibility flows | Synthetic only | First owning package pins authentication, browser, traces, and cleanup |
| `E-TEMPORAL-LOCAL` | Workflow, replay, restart, cancellation, and delivery integration | Synthetic only | Available under D-003 (local runtime topology and trust-zone decision) `LOCAL_ONLY` |
| `E-DISPOSABLE-PROVIDER` | Provider, GitHub, GitLab, Onyx, MCP, and ambiguity conformance | Synthetic only | Provider decision, scoped identity, cleanup, and external-write authorization required |
| `E-GVISOR-STAGING` | Runner and preview containment | Approved staging data only | Platform activation plus applicable D-003 (runtime topology), D-009 (retention), and D-014 (budget) decisions |
| `E-X3M-STAGING` | Integrated recovery, monitoring, flags, evidence, and release-readiness proof | Approved staging data only | Consuming decision set and Platform Operations activation required |
| `E-RELEASE-CI` | Public deployed-release compliance | Public release metadata | P0-04 (AGPL compliance implementation package) publishes the exact command and evidence contract |

Local proof uses X3M's approved Docker topology and disposable volumes.
Staging fault or sandbox tests require explicit infrastructure authorization,
bounded targets, abort conditions, and cleanup evidence.

## Command catalog and readiness

The [AC test matrix v1](../../contracts/testing/ac-test-matrix-v1.json)
(suite, environment, command, gate, and evidence ownership for all 60 criteria)
is authoritative for command IDs. Available commands are:

| Command ID | Repository root | Exact command |
| --- | --- | --- |
| `CMD-CURVE-CHECK` | Curve | `pnpm check` |
| `CMD-CURVE-EXTERNAL` | Curve | `pnpm check:external` |
| `CMD-PLANE-API-CURVE` | Plane | `docker compose -f docker-compose-test.yml run --rm --build api-tests pytest plane/curve/tests` |
| `CMD-PLANE-API-FULL` | Plane | `docker compose -f docker-compose-test.yml up --build --abort-on-container-exit --exit-code-from api-tests` |
| `CMD-PLANE-MIGRATION-CHECK` | Plane | `docker compose -f docker-compose-test.yml run --rm api-tests python manage.py makemigrations --check --dry-run` |
| `CMD-PLANE-WEB-UNIT` | Plane | `pnpm --filter web test` |
| `CMD-PLANE-CHECK` | Plane | `pnpm check` |
| `CMD-PLANE-BUILD` | Plane | `pnpm build` |
| `CMD-TEMPORAL-LOCAL` | Plane | `docker compose -f docker-compose-local.yml -f docker-compose-curve.yml --profile curve exec api pytest plane/curve/tests -k "workflow or temporal or replay or cancellation"` |

Each planned command has `working_directory: null` and `command: null` until
its consuming packet pins an executable tool/version, exact command, fixture or
workload, environment, timeout, output, and cleanup. The schema rejects an
`AVAILABLE` command without an exact working directory and command.

## Fixtures and test-data policy

- Repository fixtures use synthetic workspace, user, provider, repository,
  evidence, commit, finding, cost, and deployment identifiers.
- Authorization fixtures always include two workspaces, two users with
  different access, a revoked identity, a stale aggregate version, and an
  unsupported service principal.
- Provider fixtures include success, bounded partial result, question, timeout,
  cancellation, duplicate callback, stale callback, out-of-order callback,
  missing callback, lost response, reconciliation, and revocation.
- Security corpora use tagged canary strings and synthetic secrets. Passing
  requires absence from Git, PR text, artifacts, model telemetry, logs, traces,
  metrics, exports, and unauthorized API responses.
- Temporal histories are immutable fixtures named by workflow type and version.
  Every workflow evolution replays all prior histories before new code is
  accepted.
- Browser fixtures create their own workspace-scoped records, never depend on
  execution order, and delete disposable runtime resources after evidence is
  captured.
- Load and recovery workloads declare seed, concurrency, duration, failure
  schedule, SLO/RPO/RTO assertions, maximum cost, abort thresholds, and cleanup.

Protected or `RESTRICTED` fixtures enter a test only after D-009 (retention,
deletion, backup, and legal-hold decision) and the applicable Access Envelope
are approved. Synthetic tests remain the default at every layer.

## Evidence contract

Every accepted result records:

| Field | Requirement |
| --- | --- |
| Requirement identity | AC, FR/NFR, owning package, and scenario or fixture ID |
| Source revisions | Exact Curve contract commit plus Plane or target-repository base and head SHAs |
| Runtime identity | Environment ID, service/image/browser/tool/rulepack versions and digests |
| Execution | Exact command ID and expanded command, start/end time, actor or service identity, attempt number |
| Result | Pass, fail, blocked, skipped-with-authority, or flaky; exit code and failed assertions |
| Artifacts | Logs, reports, traces, screenshots, videos, histories, scans, and digests under the applicable access/retention policy |
| Correlation | Workspace-safe correlation ID, workflow/operation reference, and provider/VCS binding where applicable |
| Freshness | Exact head/policy/context binding and invalidation reason when any bound input changes |

Evidence bodies remain in their authorized storage boundary. Git and PR text
contain sanitized manifests, digests, and resolvable references.

## Flake, retry, and quarantine policy

1. Deterministic unit, database, contract, migration, replay, and security tests
   run without automatic retry.
2. A browser or external-provider retry is allowed only when the owning packet
   defines the retryable failure class and retains the first failure artifacts.
3. A pass after retry records `FLAKY`, opens an attributed follow-up, and cannot
   satisfy a mandatory security, authorization, migration, data-leakage, or
   release-compliance gate.
4. Repeated provider or infrastructure instability pauses the package and
   preserves authoritative state for reconciliation.
5. Suspected cross-workspace, secret, restricted-data, or sandbox leakage
   quarantines artifacts and stops the affected environment pending security
   review.

## Package gate sequence

1. **Task-packet readiness:** dependencies and material decisions are satisfied;
   planned commands become exact; synthetic data, environment, tools, timeouts,
   cost, rollback, and expected evidence are pinned.
2. **Developer loop:** focused unit, component, contract, replay, migration, and
   local integration commands run against the changed surface.
3. **Pull-request gate:** repository checks, the complete affected suite, native
   CI, security fixtures, contract compatibility, and evidence validation run on
   the exact head.
4. **Environment gate:** authorized browser, provider, gVisor, load, recovery, or
   staging suites run when the criterion depends on that boundary.
5. **Acceptance gate:** the criterion receives `IMPLEMENTED_PASSING` only when
   the complete Given/When/Then scenario passes and evidence is bound to the
   accepted head. A changed head, contract, policy, context, tool, rulepack, or
   environment invalidates the result.

## AC ownership summary

The machine matrix is the normative row-level source. Its current distribution
is:

| Owning milestone | Criteria |
| --- | ---: |
| P0 | 0 |
| M0 | 4 |
| M1 | 8 |
| M2 | 8 |
| M3 | 6 |
| M4 | 5 |
| M5 | 20 |
| M6 | 4 |
| R1 | 5 |
| **Total** | **60** |

The contract validator also reads the acceptance section from the [Curve PRD
v0.12](../curve-ai-native-sdlc-prd.md) (product requirements, lifecycle,
decisions, and AC-01 through AC-60). Any missing, duplicated, reordered, or
renamed AC fails validation until this strategy is intentionally versioned.

## Change and versioning rules

- V1 remains immutable after approval. A change to suite semantics, environment
  authority, command meaning, AC ownership, or evidence requirements creates a
  reviewed successor matrix/schema version.
- A PRD acceptance-criterion change updates the PRD version, creates a successor
  test matrix, reconciles requirement-to-package traceability, and records the
  migration impact.
- Implementing a planned command updates the successor matrix with its exact
  repository root, command, version/digest inputs, and readiness rule.
- Coverage promotion is evidence-driven and occurs on a reviewed exact head.
  Dashboards derive counts from the versioned matrix and immutable test events.
- Project-board status remains a visual projection of repository evidence.

## P0-05 verification

Run from the Curve repository root:

```bash
pnpm check
pnpm check:external
git diff --check
```

Acceptance requires the contract validator to report the matrix schema and
fixture totals, verify AC-01 through AC-60 against the PRD, and reject the
negative matrix fixture. The PR diff must remain limited to the P0-05 strategy,
contract, fixtures, validator, and contract index.
