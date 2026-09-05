# M1-M7 Coding-Agent Task Packets

> Sanitized public reference. Fictional identities cannot authorize execution.
> Historical approvals apply only to their original bytes; see
> [public contract edition](public-reference-sanitization.md) (sanitization, integrity and approval boundaries).

## Document control

| Field | Value |
| --- | --- |
| Status | Deterministic M1-M6 materialization catalog plus deferred M7 charter; each M1-M6 package has an exact dependency/trace record and becomes `READY` only after its listed material gates, contracts, base SHA, commands, and context digest are satisfied; M7 has no active implementation packet or exact FR/NFR/AC trace |
| Version | 1.11 |
| Date | 2026-08-31 |
| Product baseline | [Curve PRD v0.13](../curve-ai-native-sdlc-prd.md) (product requirements, approved Product core, Curve-first shell, lifecycle, security invariants, and acceptance criteria) |
| Delivery baseline | [Development plan](development-plan.md) (milestones, package dependencies, product trace, and completion evidence) and [M1 task packet](m1-alignment-evidence-prd-task-packet.md) (manual-first/provider-enhanced lanes, implementation slices, contracts, tests, and readiness gates) |
| Decision readiness | [Later-milestone decision-readiness index](later-milestone-decision-readiness-index.md) (D-002 (Onyx delegation) through D-016 (KPI and rollout guardrails) owner inputs, machine contracts, acceptance evidence, and fail-closed milestone effects) |
| Default owner and reviewer | Designated reviewer (`example-reviewer`) until explicitly reassigned |
| Implementation repository | `git@github.com:faocampo/plane.git`, except an approved repository-specific delivery slice |

## Dispatch contract

This catalog prepares every M1-M6 work package for deterministic materialization
and preserves M7 only as a deferred extension charter. M7 requires a separately
approved product decision, exact FR/NFR/AC trace, and a later catalog revision
before any implementation packet can be materialized.
GitHub Project status is visual metadata and never authorizes implementation.
The [coding-agent task-packet schema](../../contracts/schemas/coding-agent-task-packet.schema.json)
(closed repository/base/context/contracts/commands/acceptance/policy/rollback
materialization contract) is the normative machine boundary for a `READY`
packet. This catalog supplies planning inputs only and is never dispatch
authority.
Each package row is completed by the exact dependency/product-trace matrix below
and the inherited control profile. An item becomes an immutable coding-agent
packet only when the dispatcher adds:

- a machine-readable source-catalog record that binds every dispatch-critical
  field and can be reconciled against the materialized packet;
- the normative merged Curve source revision, separately published evidence and
  source-catalog revisions, registry publication revision, and context-pack digest;
- one repository, target branch, live base SHA, feature branch, owner, and reviewer;
- satisfied dependency evidence and approved contract versions;
- exact repository-native `LINT`, `BUILD`, `TEST`, `SECURITY`, and `LOCAL_RUN`
  commands plus applicable `INSTALL`, `TYPECHECK`, and `MIGRATION` commands;
- Given/When/Then acceptance cases derived from the completion evidence below;
- data classification, model/tool policy, sandbox limits, budget, timeout, and egress;
- rollback or disabled-state behavior and the permitted external effects.

The materialized packet carries a canonical payload digest. Its versioned
Context Manifest lists the complete entry set used to recompute the canonical
context-pack digest. Publication is ordered without Git self-reference:
normative source (`S`) -> authority/context/state evidence (`E1..En`) -> source
catalog (`C`) -> sealed packet registry (`P`). Structural CI validates shape
and cross-field invariants;
the read-only dispatch preflight verifies the source catalog, machine state
records, referenced bytes, authoritative Git ancestry and repository identity,
clean base, and live Project work-package item. A `READY` result grants no
execution authority. A separate record governed by the
[coding-agent implementation-authorization schema](../../contracts/schemas/coding-agent-implementation-authorization.schema.json)
(human-attested, time-bounded, exact-packet execution grant) must bind the exact
workspace, attempt, packet/context tuple, repository/base/branches, people,
scope/non-scope, budget, permitted workflow actions, external effects, rollback,
and validity window.

The coding agent stops before mutation when any field or proof is absent or
stale. The dispatcher may resolve routine engineering details. Human approval
is required only for a material product, architecture, security, data-policy,
licensing, infrastructure, or external-side-effect decision.

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

### Inherited control profile

These controls apply to every package and may be narrowed by a package-specific
contract. A broader value requires the listed material decision and exact packet
revision.

| Control | Inherited value before materialization |
| --- | --- |
| Repository/branch | Public Plane fork `git@github.com:faocampo/plane.git`, target `preview`; a repository-specific delivery slice requires its approved binding and base SHA. |
| Owner/reviewer | Designated reviewer (`example-reviewer`) for both roles until an explicit replacement is recorded; the implementer cannot satisfy human review. |
| Data | Synthetic `INTERNAL` data only by default. Protected or permissioned data requires its classification, AccessEnvelope, D-009 (retention and erasure decision), and destination policy. |
| Runtime model | None by default. Model-enabled work requires D-004 (model-gateway decision), D-005 (model/provider data-policy decision), and D-014 (budget-policy decision), plus exact model/provider/prompt/tool versions and budget. |
| Network/egress | Dependency/build access only by default. Provider or destination traffic requires an exact workspace allowlist, approved connection, and package-specific conformance tests. |
| External effects | None by default. Any VCS, notification, provider write, preview, deployment, or production-system effect must be named in the packet and use the approved trusted controller. |
| Sandbox | Repository worktree and existing Plane test stack by default. Executable provider/quality/preview work requires the approved gVisor/runtime profile and JIT credentials. |
| Budget/time | US$0 external-service spend until D-014 (budget-policy decision) supplies limits. Every command/activity receives a timeout and cancellation behavior during materialization. |
| Secrets | No production/provider credential in code, fixtures, logs, prompts, or agent context. Approved runtime secrets are short-lived references resolved by a trusted controller. |
| Rollback | Feature disablement and code revert before shipment; persistent schema rollback uses an additive compensating migration after shipment. Package-specific cleanup/reconciliation remains mandatory. |

Three architecture inputs remain unresolved and are stop conditions only for the
children that consume them:

- `B-ARTIFACT-BODY-01` (manual artifact-body persistence contract): select and
  version the allowed local/synthetic persistence representation for manual Idea
  Brief and PRD bodies while D-009 (retention and erasure decision) and M0-04
  (protected-object storage) remain unavailable. The current non-null object
  reference model and the manual-first lane cannot both be implemented until this
  contract is approved.
- `B-NO-MODEL-BUDGET-01` (explicit no-model and zero-budget representation):
  define the versioned values that satisfy non-null ExecutionPlan model, tool, and
  budget references for deterministic/manual planning without implying a model
  route or paid authorization.
- `B-CODING-AUTHORITY-01` (trusted human-state verification and durable attempt
  lease): select an independently verifiable human authority/approval-receipt
  profile plus an atomic current-attempt lease store. It blocks Curve-dispatched
  execution authority for every packet while allowing schema publication,
  catalog preparation, structural validation, and read-only preflight to
  proceed. A separately approved human-operated bootstrap path remains outside
  this machine contract and cannot satisfy it.
- `B-CODING-TOOLS-01` (machine coding-tool execution profile): define the
  OpenHands/gVisor command, image, network, mount, output, cancellation, and
  cleanup boundary before automated M4 repository execution. A local manual
  bootstrap deferral changes no M4 acceptance criterion.

## M1 (alignment, evidence, and PRD)

| Packet | Repository-local outcome | Material gates | Executable completion evidence | Rollback or disablement |
| --- | --- | --- | --- | --- |
| M1-00A (minimal Product core) | Workspace-scoped Product aggregate/API with approved immutable key, mutable metadata, prospective IANA timezone, one human owner, ACTIVE/ARCHIVED lifecycle, Initiative archive guard, audit/outbox events, and no roadmap-specific behavior | M0 core/API/audit dependencies complete; merged Product decision/schema/OpenAPI/policy and historical persistence contract; exact context and dispatch; R-027 (Product timestamp/schema-version contract reconciliation) before production qualification or successor Product persistence | P-01-P-18 functional/local evidence: workspace isolation, exact authority, uniqueness, timezone history, concurrency, lifecycle/guard, migration, atomic audit/outbox, and API contract tests; exact relational conformance remains open | Disable routes; reverse unshipped additive migration; preserve rows after reliance |
| M1-01 (Initiative) | Workspace-scoped Initiative aggregate, required same-workspace Product reference, API, lifecycle, ownership, assignments, pause, and cancel | M1-00A (minimal Product core); M0 core/API/Temporal dependencies complete | Product-reference, state, authorization, cancellation, uniqueness, migration, and API contract tests | Disable routes/navigation; reverse unshipped additive migration |
| M1-02 (Idea Brief) | Versioned manual Idea Brief and attributed conversation/artifact UI; model refinement is a separately activated sub-packet | `B-ARTIFACT-BODY-01` (manual artifact-body persistence contract) before manual body persistence; M0-S9C (Model Gateway routing/failover), D-004 (model-gateway decision), D-005 (model/provider data-policy decision), and D-014 (budget-policy decision) only before model execution | Browser/accessibility, attribution, blocker/assumption/contradiction, manual diff, and model-regeneration provenance tests as applicable | Disable model generation while preserving manual editing and metadata |
| M1-03 (Onyx delegation) | KnowledgeProvider contract/fake plus a separately activated Onyx adapter with initiating-user delegation and source-access recheck | D-002 (Onyx delegated-identity decision) before live retrieval; D-009 (retention and erasure decision) plus M0-04 before protected persistence; D-005 (model/provider data-policy decision) only before content is sent to a model | Provider conformance, two-user ACL, revoked token, inaccessible approver, injection, workspace-isolation, redaction, and credential-leakage tests | Revoke connection; disable retrieval; preserve metadata-only audit |
| M1-04 (Evidence) | Manually attributable Evidence metadata/snapshots plus separately activated provider ingestion and protected bodies | M1-03 (KnowledgeProvider) before provider-derived evidence; D-009 (retention and erasure decision) and M0-04 (protected storage) before protected persistence; no provider gate for metadata-only manual references | Claim-to-evidence, ACL propagation, metadata-only manual path, destination leakage, citation, digest, and erasure-state tests | Disable protected/provider ingestion and retain permitted metadata/tombstone/audit records |
| M1-05 (Research) | Optional research lifecycle with manual skip/partial disposition and separately activated provider and model execution | No provider/model gate for manual skip/state; `B-ARTIFACT-BODY-01` (manual artifact-body persistence contract) before manual dossier-body persistence; M1-03 (KnowledgeProvider/Onyx) plus protected M1-04 (evidence) before live provider research; D-002 (Onyx delegated-identity decision) for live Onyx; M0-S9C (Model Gateway), D-004 (model gateway), D-005 (model/data policy), and D-014 (budget policy) before model execution | Manual skip/state, budget exhaustion, cancellation, provider failure, citation, and fact/inference tests for their applicable lanes | Disable provider activity; keep explicit skipped/partial disposition |
| M1-06 (PRD versions) | Immutable manual PRD versions, structural diff, submit/supersede/review UI, and separately activated model generation | `B-ARTIFACT-BODY-01` (manual artifact-body persistence contract) before manual PRD body persistence; M0-S9C (Model Gateway routing/failover), D-004 (model-gateway decision), D-005 (model/provider data-policy decision), and D-014 (budget-policy decision) only for model generation | Immutable version, source access, concurrent edit, completeness, diff, provenance, and supersession tests | Disable generation; preserve manual metadata/version lineage and prior immutable versions |
| M1-07 (Gate 1) | Exact-version Product Approval workflow with changes requested and rejection | Product authority/role policy from approved PRD | Unauthorized/agent decision denial, evidence accessibility, risk confirmation, notification, and exact-version invalidation tests | Disable submission; leave draft PRDs editable and decisions immutable |

M1 exits when an authorized Example Organization user completes an evidence-backed PRD and each
material approver can access every cited evidence item through their own identity.
The [M1 task packet](m1-alignment-evidence-prd-task-packet.md)
(manual-first/provider-enhanced lanes, implementation slices, contracts, tests,
and readiness gates) is the normative decomposition for materialization.

## M2 (product roadmap and schedule)

| Packet | Repository-local outcome | Material gates | Executable completion evidence | Rollback or disablement |
| --- | --- | --- | --- | --- |
| M2-01 (Roadmap domain) | Product, Roadmap, Milestone, Feature, Roadmap Item, and movement history | D-013 (no-migration and manual-import decision) | Cardinality, movement history, same-feature/multi-milestone, workspace, and migration tests | Disable routes; preserve additive tables for inspection |
| M2-02 (Delivery identity) | Initiative/PRD linkage and one Feature Delivery identity | Product classification and conversion rules in D-013 (no-migration and manual-import decision) and the PRD | Mode conversion, linkage, one-delivery identity, and classification-removal authorization tests | Disable conversion/link UI; preserve existing identities |
| M2-03 (Plane projection) | One-way WorkItemBinding and execution-completion projection | Plane binding boundary already decided by D-001 (Plane foundation, licensing, fork, and upgrade decision) | Formula fixtures for nested, blocked, cancelled, and unestimated work; no-feedback-loop tests | Stop projector and rebuild projection from Curve truth |
| M2-04 (Portfolio UI) | Filtered roadmap/Gantt, dependency graph, schedule impact, confidence, health, and critical path | Material UX/product rules approved through the experience blueprint | Scheduling-engine golden corpus, not-calculable cases, browser, accessibility, and load tests | Feature flag off; APIs remain read-only |
| M2-05 (Roadmap snapshot) | Immutable snapshot, copied render values, export, and PDF/image rendering | D-009 (retention and erasure decision) before protected exports; publication authority | Byte/digest reproducibility, ACL, immutability, renderer, and export tests | Disable publication/export; retain working roadmap |
| M2-06 (future import) | `DEFERRED_POST_R1`: no implementation in R1. A future validated import capability requires a new product decision, mapping, reconciliation owner, rollback design, and new FR/NFR/AC trace | D-013 (no-migration and new-initiative policy) confirms the R1 boundary; a separate future import decision is not yet defined | No R1 execution evidence; a future catalog revision must add import fixtures, dry-run reporting, duplicate handling, rollback, audit, and product acceptance | Keep import absent; new Curve roadmaps and initiatives remain authoritative |

## M3 (repository understanding and execution planning)

| Packet | Repository-local outcome | Material gates | Executable completion evidence | Rollback or disablement |
| --- | --- | --- | --- | --- |
| M3-01 (Repository discovery) | Read-only GitHub/GitLab discovery, base SHA, instructions, CODEOWNERS, CI, and commands | D-008 (VCS identity, credential, signing, allowlist, and controller-scope decision) | Both-provider conformance, allowlist, revocation, rate-limit, and cross-workspace tests | Revoke provider connections and disable discovery |
| M3-02 (Repository analyzer) | Deterministic package/service/symbol/schema/migration/dependency analysis | D-001 (Plane foundation, licensing, fork, and upgrade decision); approved analyzer dependencies/licenses | Golden repositories, digest/freshness, unsupported-language, timeout, and license tests | Disable analyzer version and rebuild derived indexes |
| M3-03 (Context Pack) | Signed bounded Context Pack, read-only mount contract, sanitized Git manifest | D-009 (retention and erasure decision) for protected context; security approval of mount/signing profile | Digest, ACL, revocation, expiry, mount read-only, and no-protected-content-in-Git tests | Revoke pack and destroy ephemeral mounts |
| M3-04 (Execution plan) | Deterministic Architecture Delta, impact map, typed DAG, slices, tests, rollback, traceability, and validator; model-assisted generation is a separately activated child | `B-NO-MODEL-BUDGET-01` (explicit no-model and zero-budget representation) before deterministic/manual plan persistence; D-004 (model-gateway decision), D-005 (model/provider data-policy decision), D-014 (budget-policy decision), and M0-S9C (Model Gateway routing/failover) only before model-assisted generation | Deterministic completeness, cycle, one-repository-per-slice, vertical-slice, and requirement-trace tests; model provenance/evaluation tests only for the generation child | Disable generation while preserving deterministic/manual plans; supersede rather than mutate an approved plan |
| M3-05 (Gate 2) | Exact-plan Technical Approval with providers, models, budgets, base SHAs, contracts, and side effects | D-008 (VCS identity, credential, signing, allowlist, and controller-scope decision) and D-014 (budget-policy decision); every material side effect named | Exact-version authorization, scope expansion denial, base drift, and re-plan invalidation tests | Pause undispatched slices; preserve approved decision evidence |
| M3-06 (Supersession) | Per-slice continue-pinned, pause, cancel, or re-plan assessment | Product/technical decision when active scope materially changes | Replay, audit, active-context immutability, cancellation, and dependency propagation tests | Restore prior projection from immutable decisions |

## M4 (agent execution and isolated runners)

| Packet | Repository-local outcome | Material gates | Executable completion evidence | Rollback or disablement |
| --- | --- | --- | --- | --- |
| M4-01 (Execution SDK) | Provider-neutral automated execution contract, fake provider, events, questions, usage, and reconciliation | Synthetic `INTERNAL`, credential-free, no-network fake-provider boundary; each real adapter remains separately gated by its provider-specific security, data, runtime, and activation decisions | Provider conformance, lease exclusivity, duplicate/out-of-order callback, polling, replay, and cancellation tests | Disable provider connections; retain fake provider |
| M4-02 (Orca MCP) | Developer-delegated read and narrow workflow write-back tools | D-006 (Orca support and license decision) and D-007 (MCP trust and delegated write-back decision) | Authn/authz, attribution, idempotency, stale version, revocation, transition, and prohibited-action tests | Revoke MCP tokens/connection; preserve manual UI workflow |
| M4-03 (OpenHands) | Pinned OpenHands execution adapter | P0-08 (OpenHands provider/runtime proof), including P0-07 (gVisor runner proof); approved target-environment D-003 (runtime topology), OpenHands version/license/security profile, and exact provider activation | Shared conformance plus heartbeat, artifact, question, cancellation, outage, and recovery tests | Disable adapter/version and reconcile active attempts |
| M4-04 (Runner controller) | gVisor runner lifecycle, JIT identity, mounts, quotas, egress, cleanup, and quarantine | P0-07 (gVisor runner-pool proof), D-003 (runtime topology and trust-zone decision) for the target environment, B-CODING-TOOLS-01 (machine coding-tool execution profile), B-CODING-AUTHORITY-01 (production human authority and durable attempt lease), D-014 (budget-policy decision), and D-009 (retention and erasure decision) plus M0-04 (protected storage) before protected context mounts | Escape, SSRF, egress, secret, cross-run/workspace, lost-runner, limit, authority/lease, cleanup, and quarantine tests | Revoke credentials, cancel pods, quarantine residue, disable RuntimeClass pool |
| M4-05 (Slice workflow) | Temporal child workflow for dependency dispatch, retries, questions, budgets, and cancellation | Decided local/non-local Temporal topology for target environment; accepted M4-04 machine execution and authority/lease controls | Replay corpus, retry, lost callback, budget pause, cancellation, worker restart, authority revocation, lease loss, and continue-as-new tests | Stop new dispatch; cancel/reconcile active workflows |
| M4-06 (Execution Console) | Authorized, redacted live execution UI | Material UX decisions through experience blueprint | SSE reconnect, authorization, accessibility, redaction, stale state, and recovery tests | Feature flag off; APIs remain available to operators |

## M5 (quality, VCS, Code Readiness, and delivery contracts)

| Packet | Repository-local outcome | Material gates | Executable completion evidence | Rollback or disablement |
| --- | --- | --- | --- | --- |
| M5-01 (Quality policy) | Versioned policy merge with non-reducible Example Organization baseline, additive repository policy, tool/rulepack/image pins, applicability, and thresholds | P0-11 (quality/security/license baseline proof) and D-010 (quality, security, license, waiver, and severity decision) | Precedence, unknown-license, non-waivable, pinned-tool, and commit-invalidation fixtures | Disable new policy version; last approved deterministic/security baseline remains fail-closed |
| M5-02 (Isolated preflight) | gVisor command runner for build/type/lint/test/browser/security checks, protected logs, and exact-SHA attestation | P0-07 (gVisor runner proof), P0-11 (quality/security/license baseline proof), M5-01 (Quality policy), and approved runner profile | Seeded pass/fail/flaky/malicious cases, secret/egress isolation, and exact-SHA attestation | Stop new jobs, cancel/clean runners, preserve safe metadata, and keep mandatory checks blocking |
| M5-03 (Independent review) | Independent AI code/security review, normalized findings, fingerprints, severity, dispositions, and re-review | P0-11 (quality/security/license baseline proof), M0-S9C (Model Gateway routing/failover), D-004 (model-gateway decision), D-005 (model/provider data-policy decision), D-014 (budget-policy decision), and D-010 (quality/security/license policy) | Model/prompt pins, precision corpus, no self-approval, deterministic-check precedence, and commit invalidation | Disable AI review; deterministic and mandatory security checks remain authoritative |
| M5-04 (Waivers/applicability) | Human waiver and `NOT_APPLICABLE` decision workflows with authority, non-waivable matrix, expiry, and follow-up | D-010 (quality, security, license, waiver, and severity decision); product applicability authority | Unauthorized/agent/non-waivable denial, expiry, stale-commit, and non-compliant projection tests | Revoke/expire decision and recompute readiness; immutable history remains |
| M5-05 (GitHub VCS controller) | Trusted candidate validation, commit attribution/signing, branch push, draft PR create/update, state reads, explicit ready conversion, and reconciliation | P0-10 (trusted VCS-controller proof), D-008 (VCS identity, credential, signing, allowlist, and controller-scope decision), and exact external-write authorization | No-agent-token, signing, stale base/head, ambiguous response, one-draft-per-slice, and reconciliation tests | Revoke controller credential and stop writes; preserve/reconcile existing GitHub state |
| M5-06 (GitLab VCS adapter) | GitLab adapter with the same trusted VCS behavior plus provider-specific auth and webhook mapping | P0-10 (trusted VCS-controller proof), M5-05 (trusted controller core), D-008 (VCS identity, credential, signing, allowlist, and controller-scope decision), and exact external-write authorization | Full shared VCS conformance, GitLab webhook/auth fixtures, and provider-parity tests | Revoke controller credential and stop writes; preserve/reconcile existing GitLab state |
| M5-07 (Post-draft validation) | CI/check, protection, CODEOWNERS, mergeability, draft-capable finding, head-invalidation, and reconciliation projection | M5-01/M5-02 (decided quality policy and preflight), M5-05/M5-06 (VCS adapters), D-008 (trusted VCS decision), D-010 (quality/security/license policy), and repository protection policy | New-head invalidation, delayed/missing webhook, stale protection, mergeability, and reconciliation tests | Mark projection stale/non-ready and rebuild from trusted VCS reads |
| M5-08 (Review rework) | Review-comment synchronization and authorized actionable rework on the same branch/PR with rerun orchestration | Product/security rework-authority policy; exact VCS write authorization | Human/bot comment, thread authorization, same-binding, stale-result, scope-limit, and rerun tests | Stop automated rework, preserve comments/binding, and require human resolution |
| M5-09 (Code Readiness) | Gate 3 UI/workflow for exact heads and explicit trusted-controller draft-to-ready; repository approval remains external | Code-approver role/separation policy; exact draft-to-ready external-effect authorization | Head-race fail-closed, role separation, approval accessibility, and no-auto-merge/deploy tests | Return Curve projection to draft/in-review; retain immutable decision and VCS history |
| M5-10 (Delivery contract) | Feature Delivery aggregate, versioned contract, checks/evidence, Pull Request Set, binding states, and readiness projection | Product release-readiness, applicability, and coordinated-set rules | Multi-repository partial failure, cardinality, applicability, dependency, and readiness tests | Mark contract non-ready; retain per-repository and immutable decision state |
| M5-11 (Monitoring contract) | Observability contract check and R1 manual post-release evidence through a trusted MonitoringProvider boundary | MonitoringProvider access/data policy; product release-verification rules | Pre/post separation, source attribution, unavailable provider, and no-production-sandbox-access tests | Disable provider reads and mark post-release evidence pending; preserve prior observations |
| M5-12 (Documentation) | Docusaurus provider plus documentation slice/build/link/navigation evidence | D-012 (documentation-provider, repository, branch, preview, and applicability decision); exact documentation write authorization | Applicable/not-applicable authority, `pnpm build`, link/navigation, preview, and coordinated-set tests | Close/revert documentation branch or MR through normal repository process |
| M5-13 (Feature flags) | OpenFeature validation, flag lifecycle, applicability, dual-path evidence, targeting, expiry, and cleanup | D-011 (feature-flag backend and delivery decision); exact runtime flag write authorization | Provider contract, default-off/targeted states, expiry, cleanup, N/A authority, and provider-outage tests | Disable integration and preserve target system default-off behavior |
| M5-14 (Quality UI) | Quality/Contract/PR Set UI and draft-body/check-summary renderer with lineage and current-head state | Approved Curve Experience Blueprint (user roles, screen flows, prototype, and usability evidence) | Browser/accessibility, redaction, lineage, waiver, dependency, current-head, and update tests | Feature flag off; source aggregates remain authoritative |

## M6 (prototypes, feedback, KPI, and optimization)

| Packet | Repository-local outcome | Material gates | Executable completion evidence | Rollback or disablement |
| --- | --- | --- | --- | --- |
| M6-01 (Preview runtime) | Authenticated, isolated, TTL preview controller/runtime | P0-07 (gVisor runner proof), approved non-local D-003 (runtime topology) activation profile, and D-014 (budget-policy decision) | Supported-repository golden tests, unique origin, egress, authentication, expiry, teardown, and route-isolation tests | Revoke URL/credentials, destroy runtime, preserve metadata-only evidence |
| M6-02 (Lovable export) | Deterministic local redacted prompt-package serializer plus separately authorized delivery to Lovable and untrusted return handling | No model/provider decision for local byte generation; D-005 (model/provider data-policy decision), an approved destination profile, and exact external-effect authorization before delivery to Lovable | Local golden bytes/redaction/version/digest tests; destination and untrusted-return tests only for the activated external-delivery child | Disable delivery/export and invalidate outstanding external packages; local serialization remains inspectable |
| M6-03 (Prototype feedback) | Attributed feedback and selective promotion into a new PRD version | Product promotion rules | Immutable prototype/feedback, authorization, PRD supersession, and rejected-promotion tests | Disable preview/feedback UI; preserve version history |
| M6-04 (KPI computation) | Versioned KPI events, formulas, baselines, and dashboards | D-016 (KPI and rollout decision) | Numerator/denominator fixtures, exclusions, attribution, late event, versioning, and no-history-rewrite tests | Disable dashboard version; preserve source metric events |
| M6-05 (Budgets and capacity) | Budget administration, cost/SLO dashboards, alerts, and capacity qualification | D-014 (budget-policy decision), infrastructure capacity approval, and D-005 (model/provider data-policy decision) only for provider/model-coupled exhaustion and routing behavior | Reservation, exhaustion, reset, exception, load, SLO, cost, and capacity tests; provider/model substitution cases only when that lane is activated | Pause chargeable execution and revert limits to last approved policy |

## M7 (post-R1 intelligence and automation)

M7 remains outside the active 71-item catalog. Materialization requires an
approved catalog revision and the extension decision described in the
[M7 charter](m7-intelligence-and-automation-extension.md) (post-R1 expense,
attention-intake, and scheduled-job product boundaries).

| Packet | Repository-local outcome | Material gates | Executable completion evidence | Rollback or disablement |
| --- | --- | --- | --- | --- |
| M7-01 (Expense ledger) | Normalized usage/cost ledger and attribution | Finance/product cost semantics; provider terms; D-014 (budget-policy decision)-compatible controls | Provider reconciliation, attribution, allocation, currency, workspace isolation, and immutable-ledger tests | Disable ingestion per provider; preserve source-attributed ledger |
| M7-02 (Budget intelligence) | Forecasts, alerts, hierarchy, and authorized execution controls | Finance/product threshold policy and external notification effects | Forecast fixtures, hard-limit pause, authorized adjustment, alert dedupe, and audit tests | Disable forecast/alerts; hard limits continue fail-closed |
| M7-03 (Attention intake) | User-delegated Gmail and selected-Slack read/classify intake | Security/identity/privacy/retention decisions and connector terms | Delegation/revocation, scope/channel filter, source link, dedupe, redaction, precision, and audit tests | Revoke connectors; delete/expire derivatives per policy |
| M7-04 (Attention workflow) | Review, assign, dismiss, snooze, correlate, and governed follow-up | Product workflow and notification-side-effect decisions | State, authorization, expiry, attribution, duplicate, and accessibility tests | Feature flag off; source systems remain unchanged |
| M7-05 (Scheduled jobs) | Timezone-aware schedules, occurrences, policy/budget recheck, execution, and output routing | Product/platform/security/operations schedule and side-effect decision | DST/recurrence, idempotent dispatch, missed runs, concurrency, cancellation, reconciliation, and routing tests | Pause schedules, cancel/reconcile attempts, preserve occurrence history |

## Exact dependency and product-trace matrix

This matrix is normative for packet materialization and is reconciled with
[Development plan](development-plan.md) (milestone dependencies, PRD trace, and
completion evidence). An unsatisfied dependency remains a stop condition. M7 is
post-R1; its missing product trace is an explicit material product decision, not
a value that the dispatcher may invent.

| Packet | Exact dependencies | Product trace and short scope |
| --- | --- | --- |
| M1-00A (minimal Product core) | M0-02 (core persistence), M0-03 (core policy), M0-07 (API/SSE); R-027 (Product timestamp/schema-version contract reconciliation) before production qualification or successor Product persistence | FR-025, AC-35, AC-52, and P-01-P-18 (the approved Product identity, ownership, prospective timezone, reversible lifecycle, and Initiative guard required before an Initiative can exist; exact relational conformance remains open) |
| M1-01 (Initiative) | M1-00A (minimal Product core), M0-02 (core persistence), M0-03 (core policy), M0-06 (Temporal skeleton), M0-07 (API/SSE) | FR-001, FR-042-FR-043; AC-01-AC-02, AC-20 (initiative lifecycle, Product binding, ownership, execution control, and tenant authorization) |
| M1-02 (Idea Brief) | M1-01 (Initiative); `B-ARTIFACT-BODY-01` (manual artifact-body persistence contract) before body persistence; M0-S9C (Model Gateway), D-004 (model gateway), D-005 (model/data policy), and D-014 (budget policy) only for model refinement | FR-002; G-01; AC-03 (alignment conversation, attributed brief, blockers, assumptions, and contradictions) |
| M1-03 (Onyx delegation) | M0-09 (provider registry), D-002 (Onyx delegated-identity decision) for live retrieval; D-009 (retention and erasure decision) plus M0-04 before protected body persistence; D-005 (model/provider data-policy decision) only before a model destination | FR-003-FR-004, FR-043; AC-04, AC-09, AC-53-AC-54, AC-60 (permission-aware knowledge retrieval and evidence access) |
| M1-04 (Evidence) | M0-02 (core persistence), M0-03 (core policy), M0-07 (API/SSE), M1-01 (Initiative); M1-03 (KnowledgeProvider) before provider-derived evidence; D-009 (retention and erasure decision) and M0-04 (protected storage) before protected bodies | FR-004, FR-021; NFR-010-NFR-012; AC-09, AC-34, AC-53 (manual metadata, evidence lineage, access, classification, and protected-body audit) |
| M1-05 (Research) | M1-01 (Initiative), M1-02 (Idea Brief), metadata-only M1-04 (Evidence); no provider/model gate for manual skip/state; `B-ARTIFACT-BODY-01` (manual artifact-body persistence contract) before dossier-body persistence; M1-03 plus protected M1-04 before live provider research; D-002 (Onyx delegated-identity decision) for live Onyx; M0-S9C (Model Gateway), D-004 (model gateway), D-005 (model/data policy), and D-014 (budget policy) before model execution | FR-005; AC-05 (optional bounded research, skip, source quality, and partial results) |
| M1-06 (PRD versions) | M0-02 (core persistence), M1-02 (Idea Brief), metadata-only M1-04 (Evidence); `B-ARTIFACT-BODY-01` (manual artifact-body persistence contract) before body persistence; protected M1-04 when cited; M0-S9C (Model Gateway), D-004 (model gateway), D-005 (model/data policy), and D-014 (budget policy) only for generation | FR-007, FR-021; AC-08-AC-09 (immutable PRD versions, completeness, evidence, diff, and supersession) |
| M1-07 (Gate 1) | M1-06 (PRD versions), M0-06 (Temporal skeleton), M0-03 (core policy) | FR-007, FR-015; AC-08-AC-09 (exact-version Product Approval and evidence accessibility) |
| M2-01 (roadmap planning domain) | M1-00A (minimal Product core), M0-02 (core persistence), M0-03 (core policy), D-013 (no-migration and manual-import decision), R-027 (Product timestamp/schema-version contract reconciliation) | FR-025-FR-027; AC-02, AC-37, AC-40 (Roadmap, Milestone, Feature, item, schedule, and movement history extending the existing Product using the decided common timestamp/schema-version convention) |
| M2-02 (Delivery identity) | M1-01 (Initiative), M1-06 (PRD versions), M1-07 (Gate 1), M2-01 (Roadmap domain) | FR-026, FR-032, FR-038; AC-02, AC-43-AC-44, AC-51 (roadmap-backed initiative linkage and one delivery identity) |
| M2-03 (Plane projection) | M0-09 (provider registry), M2-01 (Roadmap domain), D-001 (Plane foundation, licensing, fork, and upgrade decision) | FR-028, FR-037; AC-38, AC-42 (one-way work-item binding and execution-completion formula) |
| M2-04 (Portfolio UI) | M2-01 (Roadmap domain), M2-02 (Delivery identity), M2-03 (Plane projection), P0-01 (Plane foundation inventory), approved Curve Experience Blueprint (screen-flow and usability gate) | FR-030-FR-031; NFR-015; AC-37-AC-42 (roadmap/Gantt, dependency, schedule impact, confidence, and critical path) |
| M2-05 (Roadmap snapshot) | M0-04 (protected storage), M2-01 (Roadmap domain) through M2-04 (Portfolio UI), D-009 (retention and erasure decision) for protected exports | FR-029; NFR-018; AC-39-AC-40 (immutable copied snapshot and reproducible exports) |
| M2-06 (future import) | `DEFERRED_POST_R1`: D-013 (no-migration and new-initiative policy) keeps import absent; a future product decision must add exact dependencies, mapping, reconciliation, rollback, and repository scope | OPEN: a future catalog revision must add exact FR/NFR/AC; no R1 acceptance criterion authorizes import |
| M3-01 (Repository discovery) | M0-09 (provider registry), D-008 (VCS identity, credential, signing, allowlist, and controller-scope decision) | FR-008-FR-009, FR-043; AC-10, AC-52 (read-only GitHub/GitLab discovery and workspace allowlists) |
| M3-02 (Repository analyzer) | M3-01 (Repository discovery), D-001 (Plane foundation, licensing, fork, and upgrade decision), approved dependency/license inventory | FR-009-FR-010; AC-10 (deterministic repository structure, symbol, schema, migration, and dependency analysis) |
| M3-03 (Context Pack) | M0-04 (protected storage), M1-04 (Evidence), M3-01 (Repository discovery), M3-02 (Repository analyzer), D-009 (retention and erasure decision) for protected context | FR-012, FR-021; NFR-010-NFR-011; AC-15, AC-53 (bounded signed context and sanitized Git manifest) |
| M3-04 (Execution plan) | M1-06 (PRD versions), M1-07 (Gate 1), M3-02 (Repository analyzer), M3-03 (Context Pack), and `B-NO-MODEL-BUDGET-01` (explicit no-model and zero-budget representation) for deterministic/manual plans; M0-S9C (Model Gateway routing/failover), D-004 (model-gateway decision), D-005 (model/provider data-policy decision), and D-014 (budget-policy decision) only for model-assisted generation | FR-010-FR-011; AC-11-AC-14 (deterministic architecture delta, impact map, typed DAG, validation, vertical slices, and separately gated model generation) |
| M3-05 (Gate 2) | M3-04 (Execution plan), M0-06 (Temporal skeleton), D-008 (VCS identity, credential, signing, allowlist, and controller-scope decision), D-014 (budget-policy decision) | FR-010-FR-012, FR-032-FR-040; AC-11-AC-15, AC-44-AC-48 (exact-plan Technical Approval, providers, budgets, contracts, and side effects) |
| M3-06 (Supersession) | M1-06 (PRD versions), M3-04 (Execution plan), M3-05 (Gate 2) | FR-007, FR-021; AC-08, AC-25 (continue-pinned, pause, cancel, or re-plan assessment) |
| M4-01 (Execution SDK) | M0-09 (provider registry), M3-04 (Execution plan); synthetic fake-provider work requires no Orca or live-provider decision | FR-013-FR-015; NFR-007-NFR-008, NFR-013; AC-16-AC-21 (provider-neutral automated execution, attempts, events, questions, usage, and reconciliation) |
| M4-02 (Orca MCP) | M0-09 (provider registry), M3-04 (Execution plan), D-006 (Orca support and license decision), D-007 (MCP trust and delegated write-back decision) | FR-013-FR-015; AC-16-AC-21 (developer-delegated reads and narrow attributed workflow updates) |
| M4-03 (OpenHands) | M4-01 (Execution SDK), P0-08 (OpenHands provider/runtime proof), P0-07 (gVisor runner proof), approved target-environment D-003 (runtime topology and trust-zone decision), and approved OpenHands version/license/security profile | FR-013-FR-015; AC-16 (first automated coding-provider adapter, independent of Orca D-006 (Orca support and license decision) and D-007 (MCP trust and delegated write-back decision)) |
| M4-04 (Runner controller) | M0-03 (core policy), M3-03 (Context Pack), M4-01 (Execution SDK), P0-07 (gVisor runner proof), target-environment D-003 (runtime topology and trust-zone decision), B-CODING-TOOLS-01 (machine coding-tool execution profile), B-CODING-AUTHORITY-01 (production human authority and durable attempt lease), D-014 (budget-policy decision), and D-009 (retention and erasure decision) plus M0-04 (protected storage) before protected mounts | FR-013-FR-015, FR-042-FR-043; NFR-007-NFR-010; AC-20-AC-22, AC-52-AC-55 (gVisor runner lifecycle, JIT authority, quotas, egress, cleanup, quarantine, and durable lease control) |
| M4-05 (Slice workflow) | M0-06 (Temporal skeleton), M3-05 (Gate 2), M4-01 (Execution SDK) through accepted M4-04 (Runner controller and authority/lease controls) | FR-013-FR-015, FR-042; AC-17-AC-21 (durable dependency dispatch, retries, questions, budgets, cancellation, authority revocation, and lease loss) |
| M4-06 (Execution Console) | M4-05 (Slice workflow), M0-07 (API/SSE), M0-08 (audit and observability), approved Curve Experience Blueprint (screen-flow and usability gate) | FR-014-FR-015, FR-024; NFR-012, NFR-015; AC-17-AC-21 (authorized redacted live execution UI) |
| M5-01 (Quality policy) | M0-02 (core persistence), M3-01 (Repository discovery), P0-11 (quality/security/license baseline proof), D-010 (quality, security, license, waiver, and severity decision) | FR-016-FR-018; NFR-013; AC-23-AC-25 (policy precedence, pins, applicability, and non-waivable rules) |
| M5-02 (Isolated preflight) | M4-04 (Runner controller), M4-05 (Slice workflow), M5-01 (Quality policy), P0-07 (gVisor runner proof), P0-11 (quality/security/license baseline proof) | FR-016, FR-018; NFR-009-NFR-011; AC-23-AC-25, AC-55 (isolated repository-equivalent and security checks bound to exact SHA) |
| M5-03 (Independent review) | M4-01 (Execution SDK), M5-01 (Quality policy), M5-02 (Isolated preflight), P0-11 (quality/security/license baseline proof), M0-S9C (Model Gateway), D-004 (model-gateway decision), D-005 (model/provider data-policy decision), D-010 (quality/security/license policy), and D-014 (budget policy) | FR-017-FR-018; NFR-011-NFR-012; AC-23-AC-25, AC-48 (independent AI review, normalized findings, and precision evidence) |
| M5-04 (Waivers/applicability) | M0-03 (core policy), M5-01 (Quality policy), M2-02 (Delivery identity), D-010 (quality, security, license, waiver, and severity decision) | FR-039-FR-040; AC-47-AC-48 (human authority, non-waivable classes, expiry, and applicability) |
| M5-05 (GitHub VCS controller) | M3-01 (Repository discovery), M4-04 (Runner controller), M4-05 (Slice workflow), M5-02 (Isolated preflight), P0-10 (trusted VCS-controller proof), D-008 (VCS identity, credential, signing, allowlist, and controller-scope decision) | FR-018-FR-020, FR-044; AC-22, AC-25-AC-33 (trusted candidate commit, draft PR lifecycle, and reconciliation) |
| M5-06 (GitLab VCS adapter) | M5-05 (trusted controller core), P0-10 (trusted VCS-controller proof), D-008 (VCS identity, credential, signing, allowlist, and controller-scope decision) | FR-008, FR-019-FR-020, FR-044; AC-26-AC-33 (GitLab behavior parity and provider-specific mapping) |
| M5-07 (Post-draft validation) | M5-01 (Quality policy), M5-02 (Isolated preflight), M5-05 (GitHub VCS controller), M5-06 (GitLab VCS adapter), D-008 (trusted VCS decision), D-010 (quality/security/license policy) | FR-020, FR-041, FR-044; AC-25, AC-27-AC-28, AC-31-AC-33 (CI/protection/CODEOWNERS/mergeability projection and invalidation) |
| M5-08 (Review rework) | M5-03 (Independent review), M5-05 (GitHub VCS controller) through M5-07 (Post-draft validation) | FR-041; AC-31 (authorized review-comment synchronization and same-binding rework) |
| M5-09 (Code Readiness) | M5-03 (Independent review) through M5-08 (Review rework), M0-06 (Temporal skeleton) | FR-020, FR-037; AC-25, AC-27-AC-30 (exact-head Gate 3 and explicit draft-to-ready) |
| M5-10 (Delivery contract) | M2-02 (Delivery identity), M3-05 (Gate 2), M5-04 (Waivers/applicability) through M5-09 (Code Readiness) | FR-032-FR-040; AC-32, AC-42, AC-44-AC-51 (Feature Delivery, Pull Request Set, evidence, and release readiness) |
| M5-11 (Monitoring contract) | M5-10 (Delivery contract), approved MonitoringProvider access/data policy | FR-033; AC-45, AC-49-AC-50 (pre-release observability and manual post-release evidence) |
| M5-12 (Documentation) | M3-01 (Repository discovery), M5-10 (Delivery contract), D-012 (documentation-provider, repository, branch, preview, and applicability decision) | FR-034, FR-036; AC-46, AC-49 (Docusaurus slices, build, link, navigation, and coordinated evidence) |
| M5-13 (Feature flags) | M5-10 (Delivery contract), D-011 (feature-flag backend and delivery decision) | FR-035-FR-036; AC-47-AC-49 (OpenFeature validation, flag lifecycle, dual-path evidence, and cleanup) |
| M5-14 (Quality UI) | M5-03 (Independent review) through M5-13 (Feature flags), approved Curve Experience Blueprint (screen-flow and usability gate) | FR-019-FR-021, FR-036-FR-040; NFR-012, NFR-015; AC-29-AC-34, AC-44-AC-51 (quality, contract, PR-set, waiver, and current-head UI) |
| M6-01 (Preview runtime) | M0-03 (core policy) through M0-09 (provider registry), M1-06 (PRD versions), P0-07 (gVisor runner proof), approved non-local D-003 (runtime topology and trust-zone decision) activation profile, D-014 (budget-policy decision) | FR-006; NFR-019; AC-06, AC-55 (authenticated isolated TTL preview runtime) |
| M6-02 (Lovable export) | M1-04 (Evidence), M1-06 (PRD versions); local serializer has no provider decision; D-005 (model/provider data-policy decision), approved destination profile, and external-effect authorization before Lovable delivery | FR-006; AC-07 (redacted versioned prompt-package generation, export, and untrusted return) |
| M6-03 (Prototype feedback) | M6-01 (Preview runtime), M6-02 (Lovable export), M1-06 (PRD versions) | FR-006-FR-007; AC-06-AC-08 (attributed feedback and selective promotion to a new PRD version) |
| M6-04 (KPI computation) | M0-08 (audit and observability), M1-01 (Initiative), M5-10 (Delivery contract), D-016 (KPI and rollout decision) | FR-024; G-09; AC-36 (versioned KPI events, formulas, baselines, and immutable history) |
| M6-05 (Budgets/capacity) | M0-08 (audit and observability), M4-05 (Slice workflow), M6-04 (KPI computation), D-014 (budget-policy decision), and D-005 (model/provider data-policy decision) only for provider/model-coupled exhaustion and routing behavior | NFR-001-NFR-008, NFR-017; AC-19, AC-36, AC-58 (budget administration, cost/SLO dashboards, alerts, and capacity) |
| M7-01 (Expense ledger) | OPEN: M7 extension decision must pin M6/provider/finance dependencies before catalog activation | OPEN: post-R1 extension decision must add exact FR/NFR/AC (provider-normalized usage/cost ledger and attribution) |
| M7-02 (Budget intelligence) | OPEN: M7 extension decision must pin Expense ledger, Budget/capacity, finance, and notification dependencies | OPEN: post-R1 extension decision must add exact FR/NFR/AC (forecasts, alerts, hierarchy, and authorized execution controls) |
| M7-03 (Attention intake) | OPEN: M7 extension decision must pin provider registry, evidence, identity/privacy/retention, Gmail, and Slack dependencies | OPEN: post-R1 extension decision must add exact FR/NFR/AC (user-delegated Gmail and selected-Slack attention intake) |
| M7-04 (Attention workflow) | OPEN: M7 extension decision must pin Attention intake, Initiative, notification, and UX dependencies | OPEN: post-R1 extension decision must add exact FR/NFR/AC (review, assign, dismiss, snooze, correlate, and follow-up workflow) |
| M7-05 (Scheduled jobs) | OPEN: M7 extension decision must pin Temporal, execution, budget, output-routing, infrastructure, and operations dependencies | OPEN: post-R1 extension decision must add exact FR/NFR/AC (timezone-aware recurring jobs, occurrences, and governed routing) |

## Materialization and review checklist

- [ ] A digest-bound machine source-catalog record agrees with the packet's canonical projection of every dispatch-critical field; only the packet self-digest, the catalog self-binding, and visual-only Project status are excluded.
- [ ] Exact Curve revision and context digest recorded.
- [ ] A versioned Context Manifest resolves every entry and reproduces the canonical context-pack digest.
- [ ] Exact repository, base branch, live base SHA, and feature branch recorded.
- [ ] Designated reviewer is owner/reviewer or an explicit replacement is recorded.
- [ ] Dependency edges are satisfied by merged, head-bound evidence.
- [ ] Applicable material decisions are approved; routine project-status changes are excluded.
- [ ] Contracts and migrations are versioned, compatible, and linked.
- [ ] Exact `LINT`, `BUILD`, `TEST`, `SECURITY`, and `LOCAL_RUN` commands plus applicable optional phases and Given/When/Then acceptance tests are executable.
- [ ] Data, model, tools, sandbox, budget, egress, and timeout are bounded.
- [ ] External effects use the approved trusted controller and fail closed.
- [ ] Rollback/disablement preserves authoritative state and auditability.
- [ ] Structural validation and the read-only exact-evidence dispatch preflight pass for the complete packet registry.
- [ ] A separate human-attested implementation authorization binds the exact workspace, attempt, packet/context tuple, repository/base/branches, people, scope/non-scope, budget, permitted workflow actions, external effects, rollback, and validity window.
- [ ] For Curve-dispatched execution, `B-CODING-AUTHORITY-01` (trusted human-state verification and durable attempt lease) is resolved, every required human role is independently verified, and one atomic current-attempt lease is acquired before any mutation. Human-operated work outside Curve dispatch uses a separate exact grant and cannot satisfy this item.
