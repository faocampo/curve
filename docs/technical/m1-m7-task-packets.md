# M1-M7 Coding-Agent Task Packets

## Document control

| Field | Value |
| --- | --- |
| Status | Prepared packet catalog; each slice becomes `READY` only after its listed material gates, dependencies, contracts, base SHA, and context digest are satisfied |
| Version | 1.0 |
| Date | 2026-08-15 |
| Product baseline | [Curve PRD v0.8](../curve-ai-native-sdlc-prd.md) |
| Delivery baseline | [Development plan](development-plan.md) |
| Default owner and reviewer | Federico Ocampo (`faocampo`) until explicitly reassigned |
| Implementation repository | `git@github.com:faocampo/plane.git`, except an approved repository-specific delivery slice |

## Dispatch contract

This catalog prepares every M1-M7 work package for deterministic materialization.
GitHub Project status is visual metadata and never authorizes implementation.
An item becomes an immutable coding-agent packet only when the dispatcher adds:

- the exact merged Curve revision and context-pack digest;
- one repository, target branch, live base SHA, feature branch, owner, and reviewer;
- satisfied dependency evidence and approved contract versions;
- repository-native install, lint, type, build, test, migration, and security commands;
- Given/When/Then acceptance cases derived from the completion evidence below;
- data classification, model/tool policy, sandbox limits, budget, timeout, and egress;
- rollback or disabled-state behavior and the permitted external effects.

The coding agent stops before mutation when any field is absent or stale. The
dispatcher may resolve routine engineering details. Human approval is required
only for a material product, architecture, security, data-policy, licensing,
infrastructure, or external-side-effect decision.

Every Plane-fork slice inherits these minimum commands, supplemented by the
pinned repository instructions:

```text
git diff --check
pnpm check
pnpm build
docker compose -f docker-compose-test.yml run --rm --build api-tests pytest plane/curve/tests
docker compose -f docker-compose-test.yml run --rm api-tests python manage.py makemigrations --check --dry-run
```

User-facing slices add focused browser/accessibility tests. Schema/API/event
changes add Curve contract validation and compatibility tests. Temporal slices
add replay tests. Provider slices add their conformance suite. Security-sensitive
slices add workspace-isolation, negative authorization, secret, SSRF, replay,
and redaction cases.

## M1 (alignment, evidence, and PRD)

| Packet | Repository-local outcome | Material gates | Executable completion evidence | Rollback or disablement |
| --- | --- | --- | --- | --- |
| M1-01 Initiative | Workspace-scoped Initiative aggregate, API, lifecycle, ownership, assignments, pause, and cancel | M0 core/API/Temporal dependencies complete | State, authorization, cancellation, uniqueness, migration, and API contract tests | Disable routes/navigation; reverse unshipped additive migration |
| M1-02 Idea Brief | Versioned Idea Brief and attributed conversation/artifact UI | D-005 (model and data-policy decision) before model execution | Browser/accessibility, attribution, blocker/assumption/contradiction, and regeneration-diff tests | Disable model generation while preserving manual editing |
| M1-03 Onyx delegation | Onyx adapter with initiating-user delegation and source-access recheck | D-002 (Onyx delegated-identity decision) and D-005 | Adapter conformance, revoked token, inaccessible approver, injection, workspace-isolation, and redaction tests | Revoke connection; disable retrieval; preserve metadata-only audit |
| M1-04 Evidence | Evidence Snapshot/Item, AccessEnvelope propagation, citations, DLP, freshness, and evidence UI | D-009 (retention and erasure decision) before protected persistence | Claim-to-evidence, ACL propagation, destination leakage, citation, digest, and erasure-state tests | Disable protected ingestion and retain permitted tombstone/audit records |
| M1-05 Research | Optional bounded research with skip, budget, sources, stop conditions, and partial results | D-014 (budget-policy decision); D-005 for selected models | Budget exhaustion, skip, cancellation, provider failure, and fact/inference tests | Disable activity; keep explicit skipped/partial disposition |
| M1-06 PRD versions | Immutable PRD versions, structural diff, edit/generate, submit, supersede, and approval UI | D-005 only for model generation | Immutable version, source access, concurrent edit, completeness, diff, and supersession tests | Disable generation; preserve manual versioning and prior immutable versions |
| M1-07 Gate 1 | Exact-version Product Approval workflow with changes requested and rejection | Product authority/role policy from approved PRD | Unauthorized/agent decision denial, evidence accessibility, risk confirmation, notification, and exact-version invalidation tests | Disable submission; leave draft PRDs editable and decisions immutable |

M1 exits when an authorized X3M user completes an evidence-backed PRD and each
material approver can access every cited evidence item through their own identity.

## M2 (product roadmap and schedule)

| Packet | Repository-local outcome | Material gates | Executable completion evidence | Rollback or disablement |
| --- | --- | --- | --- | --- |
| M2-01 Roadmap domain | Product, Roadmap, Milestone, Feature, Roadmap Item, and movement history | D-013 (no-migration/manual-import decision) | Cardinality, movement history, same-feature/multi-milestone, workspace, and migration tests | Disable routes; preserve additive tables for inspection |
| M2-02 Delivery identity | Initiative/PRD linkage and one Feature Delivery identity | Product classification and conversion rules in D-013/PRD | Mode conversion, linkage, one-delivery identity, and classification-removal authorization tests | Disable conversion/link UI; preserve existing identities |
| M2-03 Plane projection | One-way WorkItemBinding and execution-completion projection | Plane binding boundary already decided by D-001 | Formula fixtures for nested, blocked, cancelled, and unestimated work; no-feedback-loop tests | Stop projector and rebuild projection from Curve truth |
| M2-04 Portfolio UI | Filtered roadmap/Gantt, dependency graph, schedule impact, confidence, health, and critical path | Material UX/product rules approved through the experience blueprint | Scheduling-engine golden corpus, not-calculable cases, browser, accessibility, and load tests | Feature flag off; APIs remain read-only |
| M2-05 Roadmap snapshot | Immutable snapshot, copied render values, export, and PDF/image rendering | D-009 before protected exports; publication authority | Byte/digest reproducibility, ACL, immutability, renderer, and export tests | Disable publication/export; retain working roadmap |
| M2-06 Import | Validated manual/import path with references and reconciliation | D-013 | Valid/invalid import fixtures, duplicate handling, dry-run report, rollback, and audit tests | Import is disabled by default; rejected imports have no domain effect |

## M3 (repository understanding and execution planning)

| Packet | Repository-local outcome | Material gates | Executable completion evidence | Rollback or disablement |
| --- | --- | --- | --- | --- |
| M3-01 Repository discovery | Read-only GitHub/GitLab discovery, base SHA, instructions, CODEOWNERS, CI, and commands | D-008 (VCS identity and scope decision) | Both-provider conformance, allowlist, revocation, rate-limit, and cross-workspace tests | Revoke provider connections and disable discovery |
| M3-02 Repository analyzer | Deterministic package/service/symbol/schema/migration/dependency analysis | D-001 reuse boundary; approved analyzer dependencies/licenses | Golden repositories, digest/freshness, unsupported-language, timeout, and license tests | Disable analyzer version and rebuild derived indexes |
| M3-03 Context Pack | Signed bounded Context Pack, read-only mount contract, sanitized Git manifest | D-009 for protected context; security approval of mount/signing profile | Digest, ACL, revocation, expiry, mount read-only, and no-protected-content-in-Git tests | Revoke pack and destroy ephemeral mounts |
| M3-04 Execution plan | Architecture Delta, impact map, typed DAG, slices, tests, rollback, and traceability | D-005 for model planning | Completeness, cycle, one-repository-per-slice, vertical-slice, and requirement-trace tests | Supersede plan version; never mutate an approved plan |
| M3-05 Gate 2 | Exact-plan Technical Approval with providers, models, budgets, base SHAs, contracts, and side effects | D-008 and D-014; every material side effect named | Exact-version authorization, scope expansion denial, base drift, and re-plan invalidation tests | Pause undispatched slices; preserve approved decision evidence |
| M3-06 Supersession | Per-slice continue-pinned, pause, cancel, or re-plan assessment | Product/technical decision when active scope materially changes | Replay, audit, active-context immutability, cancellation, and dependency propagation tests | Restore prior projection from immutable decisions |

## M4 (agent execution and isolated runners)

| Packet | Repository-local outcome | Material gates | Executable completion evidence | Rollback or disablement |
| --- | --- | --- | --- | --- |
| M4-01 Execution SDK | Provider-neutral automated execution contract, fake provider, events, questions, usage, and reconciliation | Approved provider security/data boundary | Provider conformance, lease exclusivity, duplicate/out-of-order callback, polling, replay, and cancellation tests | Disable provider connections; retain fake provider |
| M4-02 Orca MCP | Developer-delegated read and narrow workflow write-back tools | D-006 (Orca support/license decision) and D-007 (MCP trust decision) | Authn/authz, attribution, idempotency, stale version, revocation, transition, and prohibited-action tests | Revoke MCP tokens/connection; preserve manual UI workflow |
| M4-03 OpenHands | Pinned OpenHands execution adapter | D-003 runner topology; approved OpenHands version/license/security profile | Shared conformance plus heartbeat, artifact, question, cancellation, outage, and recovery tests | Disable adapter/version and reconcile active attempts |
| M4-04 Runner controller | gVisor runner lifecycle, JIT identity, mounts, quotas, egress, cleanup, and quarantine | D-003 infrastructure topology and D-014 budgets | Escape, SSRF, egress, secret, cross-run/workspace, lost-runner, limit, cleanup, and quarantine tests | Revoke credentials, cancel pods, quarantine residue, disable RuntimeClass pool |
| M4-05 Slice workflow | Temporal child workflow for dependency dispatch, retries, questions, budgets, and cancellation | Decided local/non-local Temporal topology for target environment | Replay corpus, retry, lost callback, budget pause, cancellation, worker restart, and continue-as-new tests | Stop new dispatch; cancel/reconcile active workflows |
| M4-06 Execution Console | Authorized, redacted live execution UI | Material UX decisions through experience blueprint | SSE reconnect, authorization, accessibility, redaction, stale state, and recovery tests | Feature flag off; APIs remain available to operators |

## M5 (quality, VCS, Code Readiness, and delivery contracts)

| Packet group | Repository-local outcomes | Material gates | Executable completion evidence | Rollback or disablement |
| --- | --- | --- | --- | --- |
| M5-01-M5-04 Quality policy | Policy merge, isolated checks, independent review, findings, waivers, and applicability | D-010 (quality/security/license decision); D-005 for AI review | Precedence, pinned tools, seeded findings, precision corpus, non-waivable denial, expiry, and commit invalidation | Disable AI review; fail closed on mandatory deterministic/security checks |
| M5-05-M5-06 VCS controller | Trusted controller plus GitHub and GitLab adapters for validated candidate commits and draft PR/MR lifecycle | D-008; repository allowlist; external write authorization | Provider parity, no-agent-token, signing, stale base/head, ambiguous response, one-draft-per-slice, and reconciliation tests | Revoke controller credentials and stop writes; preserve linked VCS state |
| M5-07-M5-09 Review readiness | Post-draft CI/protection projection, review-comment rework, and exact-head Gate 3 | Code-approver role and repository protection policy | New-head invalidation, webhook loss, scope-safe rework, head-race, separation, and no-auto-merge/deploy tests | Return to draft/in-review projection; do not rewrite VCS history |
| M5-10-M5-11 Delivery contract | Feature Delivery aggregate, PR Set, release evidence, and monitoring contract | Product release-readiness rules; MonitoringProvider access policy | Multi-repository partial failure, cardinality, applicability, pre/post separation, and no-production-sandbox-access tests | Mark contract non-ready; retain per-repository state |
| M5-12 Documentation | Docusaurus provider and documentation slices | D-012 (documentation-provider decision); documentation external-effect authorization | Applicable/not-applicable authority, `pnpm build`, link/navigation, preview, and coordinated-set tests | Close/revert documentation branch or MR through normal repository process |
| M5-13 Feature flags | OpenFeature validation, lifecycle, applicability, evidence, and cleanup | D-011 (flag backend decision); runtime flag external-effect authorization | Provider contract, disabled/enabled, targeting, expiry, cleanup, and unavailable-provider tests | Disable flag integration and preserve target default-off behavior |
| M5-14 Quality UI | Quality/Contract/PR Set UI and draft summary renderer | Material UX decisions through experience blueprint | Browser/accessibility, redaction, lineage, current-head, waiver, dependency, and update tests | Feature flag off; source aggregates remain authoritative |

## M6 (prototypes, feedback, KPI, and optimization)

| Packet | Repository-local outcome | Material gates | Executable completion evidence | Rollback or disablement |
| --- | --- | --- | --- | --- |
| M6-01 Preview runtime | Authenticated, isolated, TTL preview controller/runtime | D-003 preview infrastructure; D-014 budgets | Supported-repository golden tests, unique origin, egress, authentication, expiry, teardown, and route-isolation tests | Revoke URL/credentials, destroy runtime, preserve metadata-only evidence |
| M6-02 Lovable export | Versioned redacted prompt-package export and untrusted return handling | D-005 data destination/model policy | Golden bytes, redaction, version/digest, destination, and untrusted-code tests | Disable exporter and invalidate outstanding packages |
| M6-03 Prototype feedback | Attributed feedback and selective promotion into a new PRD version | Product promotion rules | Immutable prototype/feedback, authorization, PRD supersession, and rejected-promotion tests | Disable preview/feedback UI; preserve version history |
| M6-04 KPI computation | Versioned KPI events, formulas, baselines, and dashboards | D-016 (KPI and rollout decision) | Numerator/denominator fixtures, exclusions, attribution, late event, versioning, and no-history-rewrite tests | Disable dashboard version; preserve source metric events |
| M6-05 Budgets and capacity | Budget administration, cost/SLO dashboards, alerts, and capacity qualification | D-014; infrastructure capacity approval | Reservation, exhaustion, reset, exception, load, SLO, cost, and capacity tests | Pause chargeable execution and revert limits to last approved policy |

## M7 (post-R1 intelligence and automation)

M7 remains outside the active 70-item catalog. Materialization requires an
approved catalog revision and the extension decision described in the
[M7 charter](m7-intelligence-and-automation-extension.md).

| Packet | Repository-local outcome | Material gates | Executable completion evidence | Rollback or disablement |
| --- | --- | --- | --- | --- |
| M7-01 Expense ledger | Normalized usage/cost ledger and attribution | Finance/product cost semantics; provider terms; D-014-compatible controls | Provider reconciliation, attribution, allocation, currency, workspace isolation, and immutable-ledger tests | Disable ingestion per provider; preserve source-attributed ledger |
| M7-02 Budget intelligence | Forecasts, alerts, hierarchy, and authorized execution controls | Finance/product threshold policy and external notification effects | Forecast fixtures, hard-limit pause, authorized adjustment, alert dedupe, and audit tests | Disable forecast/alerts; hard limits continue fail-closed |
| M7-03 Attention intake | User-delegated Gmail and selected-Slack read/classify intake | Security/identity/privacy/retention decisions and connector terms | Delegation/revocation, scope/channel filter, source link, dedupe, redaction, precision, and audit tests | Revoke connectors; delete/expire derivatives per policy |
| M7-04 Attention workflow | Review, assign, dismiss, snooze, correlate, and governed follow-up | Product workflow and notification-side-effect decisions | State, authorization, expiry, attribution, duplicate, and accessibility tests | Feature flag off; source systems remain unchanged |
| M7-05 Scheduled jobs | Timezone-aware schedules, occurrences, policy/budget recheck, execution, and output routing | Product/platform/security/operations schedule and side-effect decision | DST/recurrence, idempotent dispatch, missed runs, concurrency, cancellation, reconciliation, and routing tests | Pause schedules, cancel/reconcile attempts, preserve occurrence history |

## Materialization and review checklist

- [ ] Exact Curve revision and context digest recorded.
- [ ] Exact repository, base branch, live base SHA, and feature branch recorded.
- [ ] Federico Ocampo is owner/reviewer or an explicit replacement is recorded.
- [ ] Dependency edges are satisfied by merged, head-bound evidence.
- [ ] Applicable material decisions are approved; routine project-status changes are excluded.
- [ ] Contracts and migrations are versioned, compatible, and linked.
- [ ] Exact commands and Given/When/Then acceptance tests are executable.
- [ ] Data, model, tools, sandbox, budget, egress, and timeout are bounded.
- [ ] External effects use the approved trusted controller and fail closed.
- [ ] Rollback/disablement preserves authoritative state and auditability.
