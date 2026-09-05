# D-012 (Documentation) Through D-016 (KPIs) Delivery and Rollout Decision Readiness

> Sanitized public reference. Fictional identities cannot authorize execution.
> Historical approvals apply only to their original bytes; see
> [public contract edition](public-reference-sanitization.md) (sanitization, integrity and approval boundaries).

## Document control

| Field | Value |
| --- | --- |
| Status | `ANALYZED / OWNER INPUTS REQUIRED / NOT IMPLEMENTATION AUTHORITY` |
| Version | 1.0 |
| Prepared | 2026-08-27 |
| Product | Curve |
| Scope | D-012 (Docusaurus documentation-delivery profile), D-013 (roadmap migration and new-initiative policy), D-014 (budget accounting and exception policy), D-015 (Example feature delivery pilot profile), and D-016 (KPI definitions and rollout guardrails) |
| Intended owners | Product Documentation; Product Operations; Product; Finance; Platform Operations; Engineering; Example backend and Example frontend technical owners; Curve Product and Engineering |
| Prepared by | Codex under Designated reviewer's review |
| Governing baseline | Exact Curve revision named by the eventual decision PR |
| Activation boundary | No documentation MR, roadmap import, paid provider action, coding-agent pilot dispatch, deployment, production access, or broad rollout is authorized by this packet |

## Executive outcome

The Curve PRD already fixes the initial direction for all five decisions. The
remaining work is to bind those directions to named people, versioned machine
profiles, executable proofs, and exact approval digests.

| Decision | Fixed direction | First consuming scope |
| --- | --- | --- |
| D-012 (Docusaurus documentation-delivery profile) | Use the [Example Organization Docusaurus repository](https://vcs.example.invalid/example/repository) (documentation application and build source); create a feature-named branch only when documentation is applicable; run `pnpm build`; the first pilot is `NOT_APPLICABLE` | M5-12 (Docusaurus documentation slice) |
| D-013 (roadmap migration and new-initiative policy) | No migration or inferred import; Curve begins with new initiatives and references existing Plane identifiers without repurposing them | M2-01 (roadmap domain), M2-02 (delivery identity), and M2-06 (manual import) |
| D-014 (budget accounting and exception policy) | R0B caps are USD 300/workspace/month, USD 50/initiative, USD 10/research activity, USD 25/attempt, and two sandbox-hours/attempt; exhaustion pauses work; Product and Platform jointly approve exceptions | Metered M1 research, M4 execution, M6 budget administration, and R0B pilot |
| D-015 (Example feature delivery pilot profile) | Example backend backend is an external versioned-contract/staging prerequisite; Example frontend is the only agent-dispatched slice; PO/TL/Dev hold the three approval roles; classification is `CONFIDENTIAL`; the flag defaults off | R0A/R0B pilot preparation and dispatch |
| D-016 (KPI definitions and rollout guardrails) | Measure four primary KPIs; report the first pilot as binary; establish broader numeric targets only after three comparable initiatives | M6-04 (KPI computation), pilot evaluation, and broad R1 rollout |

Each decision is independently reviewable. No coding agent may change a status
to `DECIDED`; a named accountable person must approve the exact stable decision
digest.

## Governing Curve sources

- `docs/curve-ai-native-sdlc-prd.md` (product requirements, pilot contract,
  budgets, KPIs, rollout, and decision register).
- `docs/technical/development-plan.md` (milestones, dependencies, package
  outcomes, and acceptance evidence).
- `docs/technical/m1-m7-task-packets.md` (repository-local later-milestone
  packets, entry gates, commands, and rollback expectations).
- `docs/technical/review-analysis-and-remediation.md` (open documentation,
  roadmap, budget, pilot, and KPI gaps).
- `contracts/testing/ac-test-matrix-v1.json` (acceptance ownership and evidence
  environments).

The eventual decision PR replaces path-only references with links pinned to its
exact Curve revision.

## Official upstream evidence

### Docusaurus and pnpm

- Docusaurus, [Deployment](https://docusaurus.io/docs/deployment) (production
  build output, base URL, hosting, and deployment configuration).
- Docusaurus, [Markdown links](https://docusaurus.io/docs/markdown-features/links)
  (file-path links, generated routes, and broken-link behavior).
- pnpm, [`pnpm run`](https://pnpm.io/cli/run) (script execution and argument
  forwarding).
- GitLab, [Merge requests API](https://docs.gitlab.com/api/merge_requests/)
  (draft merge-request identity and reconciliation fields).

These sources define product capabilities. The Example Organization repository's exact default
branch, Node/pnpm versions, scripts, ownership, CI, preview, and release process
remain authoritative for D-012 (Docusaurus documentation-delivery profile).

## D-012 (Docusaurus documentation-delivery profile)

### Decision statement

Select the exact Example Organization Docusaurus repository profile, branch/build/link/navigation
commands, trusted GitLab identity, ownership, preview behavior, applicability
contract, reconciliation, and release relationship used by Curve documentation
slices.

### Fixed boundary

- Repository: [Example Organization Docusaurus](https://vcs.example.invalid/example/repository)
  (documentation application and build source).
- A documentation branch is created only when an approved delivery contract
  declares documentation applicable.
- The branch name derives from the developed feature.
- `pnpm build` is mandatory.
- The Example feature delivery pilot records documentation as
  `NOT_APPLICABLE` at Gate 2 and creates no documentation branch or MR.
- Agents receive no GitLab mutation credential; any future automated branch or
  draft creation uses the trusted VCS controller under D-008 (trusted VCS
  controller identity and permissions).

### Owner inputs required

| Input | Required exact value or evidence |
| --- | --- |
| Repository identity | Immutable GitLab project ID, canonical URL, default branch, allowed source branch prefix, and fork policy |
| Ownership | Named Product Documentation owner, technical owner, reviewers, support owner, and escalation path |
| Toolchain | Node version, pnpm version, lockfile policy, install command, build command, and timeout |
| Quality commands | Non-mutating format/lint/type/link/navigation checks and native CI required jobs |
| Navigation | Sidebar/navbar ownership, route conventions, versioning/i18n rules, redirects, and broken-link policy |
| Authentication | Trusted-controller token reference, scopes, expiry, rotation, revocation, and repository allowlist |
| Preview | Whether previews exist; identity, URL exposure, expiry, access policy, cleanup, and evidence |
| Release relationship | Merge-to-publish, tagged release, scheduled publish, or another exact process plus observation source |
| Applicability | Product/Technical Approver predicate and evidence required for `APPLICABLE` or `NOT_APPLICABLE` |
| Reconciliation | Existing branch/MR behavior, duplicate request, lost response, base drift, external edits, closure, and disablement |

### Required machine contracts

1. A closed `DocumentationProviderProfile` schema and sanitized Example Organization fixture.
2. A versioned applicability record binding initiative, delivery contract,
   approvers, rationale, evidence, and decision time.
3. Command/result contracts for validate repository, prepare candidate,
   validate links/navigation, ensure draft MR, observe CI, and reconcile state.
4. A build-evidence schema binding repository, base/head SHA, lockfile/toolchain,
   commands, result digests, and timestamps.
5. A release-observation schema that separates draft readiness, merge, publish,
   and post-publish verification.
6. A disablement/rotation/recovery runbook.

### Acceptance suite

| Proof | Required result |
| --- | --- |
| Not applicable | Pilot `NOT_APPLICABLE` produces no branch, MR, provider call, or credential access and retains both human decisions. |
| Applicable build | Exact candidate head passes install, required checks, `pnpm build`, and link/navigation validation. |
| Repository isolation | The identity cannot mutate another project, default/protected branch, approval, merge, deployment, or settings. |
| Duplicate/lost response | Retry plus authoritative readback produces at most one active documentation MR. |
| Base/head drift | Changed base or head makes prior build and link evidence stale and forces revalidation. |
| Preview lifecycle | When applicable, access, expiry, cleanup, and failure states match the profile. |
| Release separation | Curve distinguishes Code Ready, merged, published, and verified states without claiming deployment authority. |

## D-013 (roadmap migration and new-initiative policy)

### Decision statement

Approve the no-migration baseline, new Product/Initiative creation boundary,
read-only Plane reference semantics, reconciliation ownership, and requirements
for any later manual import.

### Fixed boundary

- Existing Plane roadmaps and roadmaps outside Curve are not migrated,
  transformed, inferred, or repurposed.
- Curve begins with new Products and Initiatives.
- Existing Plane identifiers may be stored as typed external references; Curve
  does not copy their lifecycle authority.
- A later manual import requires a separate approved decision, deterministic
  mapping, dry run, validation report, audit, and rollback.

### Owner inputs required

| Input | Required exact value or evidence |
| --- | --- |
| Accountability | Named Product Operations owner, workspace administrators, data steward, and reconciliation owner |
| Eligibility | Workspaces/products allowed to create Curve Products and Initiatives during R0B and R1 |
| Reference policy | Allowed Plane resource types, immutable provider IDs, display projections, refresh cadence, and missing/deleted object behavior |
| Naming and ownership | Product key/name collision behavior, initial owner, reassignment, archival, and restoration operations |
| Reconciliation | Drift detection, stale projection display, operator action, audit, and support SLO |
| Later import gate | Required source manifest, mapping version, duplicate policy, dry-run approval, migration window, verification, and rollback |
| Reporting | How excluded historical Plane work appears in portfolio and KPI views without synthetic Curve history |

### Required machine contracts

1. A closed `RoadmapAdoptionPolicy` record fixed to `NEW_INITIATIVES_ONLY`.
2. A typed `ExternalPlaneReference` contract with provider/resource identity,
   observed version/time, safe projection, and stale/missing state.
3. A reconciliation command/result and immutable audit contract.
4. A future-import authorization schema that remains disabled and empty until a
   later approved decision exists.
5. Positive and negative fixtures proving that no existing Plane object is
   silently converted into a Curve aggregate.

### Acceptance suite

| Proof | Required result |
| --- | --- |
| Zero migration | Enabling Curve creates no Product, Initiative, Roadmap, Milestone, Feature, or history from existing Plane data. |
| Reference only | Allowed Plane IDs resolve as projections while Plane remains lifecycle authority. |
| Missing reference | Deleted, inaccessible, or wrong-workspace Plane resources fail closed and retain safe historical identity. |
| Collision | Product keys and external-reference uniqueness reject ambiguous adoption. |
| Import disabled | Every import or inferred-conversion command fails before mutation without an approved future policy. |
| Portfolio truth | Reports distinguish Curve-managed work from referenced historical Plane work. |

## D-014 (budget accounting and exception policy)

### Decision statement

Approve the R0B budget scopes and caps, micro-USD accounting, reservation and
settlement semantics, price catalogs, sandbox-hour measurement, reset periods,
late-usage reconciliation, exception authority/expiry, alerts, and operator
recovery.

### Fixed R0B caps

| Scope | Cap |
| --- | --- |
| Workspace | USD 300 per month |
| Initiative | USD 50 |
| Research activity | USD 10 |
| Attempt | USD 25 |
| Sandbox | Two allocated runtime hours per attempt |

All monetary values use integer micro-USD. Every metered action reserves its
maximum expected charge atomically against all applicable scopes before it
starts. Exhaustion pauses work. Product and Platform jointly approve any
exception. Curve never changes model/provider silently after exhaustion.

### Owner inputs required

| Input | Required exact value or evidence |
| --- | --- |
| Owners | Named Product, Finance, Platform Operations, AI Platform, and incident owners |
| Reset | Workspace accounting timezone, calendar boundary, first period, and policy-version behavior |
| Price catalog | Source, effective time, token/tool/sandbox units, immutable version, refresh cadence, and stale-price behavior |
| Reservation | Maximum estimator, safety margin, minimum billable unit, concurrency serialization, and rejection response |
| Settlement | Provider usage identity, observed/estimated precedence, partial/cancelled charge behavior, and maximum settlement window |
| Late adjustment | Overdraft state, new-work pause, reconciliation cadence, Finance disposition, and immutable correction event |
| Sandbox hours | Allocation start/stop events, paused/waiting treatment, rounding, cleanup, and lost-runner accounting |
| Shared infrastructure | Included/excluded cost classes and separate reporting rules |
| Exceptions | Maximum amount/duration, Product and Platform identities, Finance consultation threshold, rationale, follow-up, expiry, and revocation |
| Alerts | Warning thresholds, exhaustion recipients, delivery channels, acknowledgement, and escalation |
| Reporting | Currency/source date, scope attribution, reservation/settlement/adjustment views, and immutable export |

### Required machine contracts

1. A closed budget-policy manifest and R0B fixture.
2. Versioned price-catalog, usage-observation, reservation, settlement,
   release, adjustment, and exception schemas.
3. A PostgreSQL transaction contract proving atomic multi-scope reservation and
   no concurrent overcommit.
4. A budget state machine covering available, warning, exhausted, exception,
   reconciliation, overdraft, paused, and resumed states.
5. Provider-usage idempotency and ambiguity rules.
6. A dashboard/alert evidence contract and operator runbook.

### Acceptance suite

| Proof | Required result |
| --- | --- |
| Multi-scope reservation | One transaction reserves every applicable scope or none; concurrent requests cannot overcommit. |
| Settlement | Observed usage settles once, releases unused reservation, and retains original estimate/version. |
| Late usage | Late provider usage appends one adjustment and pauses affected scopes on overdraft without rewriting history. |
| Ambiguous usage | The reservation remains held until reconciliation or the approved settlement deadline. |
| Exhaustion | Research/attempt/workspace exhaustion pauses only the governed work and cannot trigger silent fallback. |
| Exception | Both authorized humans, expiry, amount, rationale, policy version, and follow-up are required; replay is idempotent. |
| Sandbox time | Running, waiting, pause, cancellation, timeout, and cleanup fixtures produce the approved accounting. |
| Reset/version change | Period reset and prospective policy changes preserve historical calculations. |

## D-015 (Example feature delivery pilot profile)

### Decision statement

Bind the selected pilot to exact Products, repositories, external prerequisites,
base SHAs, people, organizations/users, staging fixtures, data classification,
flag profile, manual regression, measurement events, and stop/rollback rules.

### Public pilot boundary

Use a fictional Product, synthetic repositories and disposable fixtures in
public examples. Actual application behavior, source repository identities,
external prerequisites, feature flags, people, staging profiles, metrics and
operational decisions remain private.

### Required owner inputs

Owners supply exact scope, repository and contract versions, approver
assignments, access classification, default-off rollout, regression cases,
measurement definitions and rollback. The decision remains blocked until
those inputs are approved in the private control plane.

### Required machine contracts

Publish provider-neutral binding, evidence, authorization, versioning and
rollback schemas with synthetic fixtures. Keep real deployment values outside
source and public collaboration surfaces.

### Acceptance suite

Verify least privilege, exact-version dependencies, direct-route authorization,
default-off exposure, unavailable data, current-head quality evidence,
cancellation, rollback and public-disclosure protection.

## D-016 (KPI definitions and rollout guardrails)

### Decision statement

Approve event definitions, clocks, attribution, baselines, exclusions,
comparability criteria, first-pass rules, security/CI outcomes, reporting, and
broad-rollout decision thresholds.

### Fixed primary KPIs

| KPI | Pilot target or rule |
| --- | --- |
| Human execution effort | Compare against an owner-approved private active-effort baseline and target |
| Idea-to-draft lead time | Compare elapsed time against an owner-approved private baseline and target |
| First-pass acceptance | Apply the configured aggregate target; the first pilot is recorded as pass/fail without implementation rework |
| Security and native CI | No Critical/High security finding and no regression in repository-native CI |

The first pilot cannot prove a stable portfolio rate. Product sets broad-R1
numeric targets only after three comparable initiatives using the same
versioned definitions.

### Owner inputs required

| Input | Required exact value or evidence |
| --- | --- |
| Owners | Named Product owner, data/analytics owner, Engineering owner, AppSec owner, and rollout decision body |
| Clocks | Exact start/end events for idea-to-draft, idea-to-ready, merge, deployment, and post-release observation |
| Human effort | Included roles/activities, unit, timer method, parallel work, interruption, rework, external wait, and missing-entry behavior |
| Baselines | Private evidence for comparable active effort, elapsed time, first-pass acceptance and manual regression; store each measure separately |
| First pass | Exact implementation-rework boundary, allowed documentation/test/evidence correction, rejected attempt, and multi-slice aggregation |
| Security | Tool/policy version, normalized severity, open/closed/stale finding treatment, and exact candidate head |
| Native CI | Required job set, skipped/cancelled/manual job treatment, pre-existing failure, flaky retry, and base comparison |
| Comparable initiative | Repository count, risk/classification, change size, external dependencies, provider mode, and exclusion authority |
| Attribution | Initiative, slice, attempt, human role, actor, source, timestamp, and correction rules |
| Reporting | Calculation version, confidence/sample disclosure, dashboard/export, review cadence, and immutable snapshot |
| Broad rollout | Minimum sample, target values after the third initiative, stop/go authorities, rollback triggers, and workspace expansion sequence |

### Required machine contracts

1. Versioned KPI-definition and event schemas.
2. Immutable baseline records with source/evidence references.
3. Deterministic calculation fixtures for elapsed time, active effort,
   first-pass acceptance, security, and CI regression.
4. A comparability profile and human disposition record.
5. A pilot evaluation report schema that exposes missing data and does not
   manufacture a rate from one initiative.
6. A three-initiative aggregate and broad-rollout decision schema.
7. Correction events that append adjustments without rewriting original time
   entries or provider observations.

### Acceptance suite

| Proof | Required result |
| --- | --- |
| Clock separation | Active effort, idea-to-draft, idea-to-ready, merge, deployment, and external wait remain distinct. |
| Time attribution | PO, TL, Dev, and Example backend entries are attributable; missing entries remain visible and do not become zero. |
| First pass | Implementation rework deterministically changes the outcome; evidence-only correction follows the approved rule. |
| Security/CI | Results bind exact head/tool/policy/jobs; stale or unavailable required evidence cannot pass. |
| One-pilot report | Shows binary outcomes, raw values, definitions, and sample size one without claiming an aggregate rate. |
| Comparability | Included/excluded initiatives retain exact profile, rationale, and authorized human decision. |
| Three-initiative decision | Broader targets and rollout guardrails require three accepted comparable records and named Product approval. |
| Historical stability | Definition changes apply prospectively or produce a separately versioned recomputation; prior published values remain queryable. |

## Cross-decision dependency order

1. Name the accountable and consulted people for all five decisions.
2. Complete D-013 (roadmap migration and new-initiative policy) before M2
   (product roadmaps and schedule) implementation.
3. Complete D-014 (budget accounting and exception policy) before any paid
   model/provider execution or R0B pilot attempt.
4. Complete D-015 (Example feature delivery pilot profile) and D-016 (KPI
   definitions and rollout guardrails) before pilot dispatch/evaluation.
5. Complete D-012 (Docusaurus documentation-delivery profile) before the first
   applicable M5-12 (Docusaurus documentation slice); its pilot
   `NOT_APPLICABLE` proof may be accepted independently.
6. Publish each ADR, machine record, schema, fixtures, tests, and owner evidence
   in an exact reviewed Curve revision.
7. Obtain named approvals bound to each stable decision digest.
8. Materialize repository-local coding packets only after their own applicable
   decisions are `DECIDED`.

## Decision-complete definition

Each decision is complete only when:

- every required owner input has an exact value or an explicit denied
  capability;
- every machine contract is published with a closed schema and positive/
  negative fixtures;
- every acceptance proof passes in its named environment;
- security, privacy, licensing, cost, support, and rollback consequences are
  recorded where applicable;
- accountable and consulted people approve the same stable content digest;
- decision/review dates and supersession triggers are present; and
- the readiness board and consuming task packets point to the exact decided
  revision.

Until then, Curve retains these effective boundaries: documentation delivery
is blocked when applicable; existing roadmaps are not migrated; paid actions
remain disabled or limited to separately approved proof budgets; the pilot is
not dispatched; and broad rollout is not authorized.
