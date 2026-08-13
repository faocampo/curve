# Curve conversation decision and execution chronicle

## Document control

| Field | Value |
| ----- | ----- |
| Status | Living retrospective and engineering rationale |
| Product | Curve |
| Period covered | From the initial Plane license question through 2026-08-12 |
| Last updated | 2026-08-12 |
| Audience | X3M product, engineering, architecture, security, operations, legal, and AI agents |
| Normative authority | Informational only; the PRD and approved ADRs take precedence |

## Purpose and disclosure boundary

This document reconstructs the complete useful reasoning record from the conversation: source facts, interpretations, alternatives, recommendations, user decisions, executed actions, evidence, corrections, risks, and unresolved questions. It is intended to let another technical product manager, architect, or AI coding agent understand why the current Curve plan has its present shape without needing the original Drive document, image, or chat.

It is not a transcript of private model chain-of-thought. Internal hidden deliberation is neither exposed nor required for an auditable engineering decision. Instead, this record provides the decision-grade rationale: what was known, what was uncertain, which options mattered, why a direction was recommended, what was selected, and how it was verified.

## Executive retrospective

The conversation evolved from a licensing question into the definition and preparation of Curve, an AI-native product-development control plane built additively on the open-source Plane foundation. Curve is intended to cover the path from ideation and requirements through research, prototyping, PRD approval, architecture and execution planning, granular vertical slices, coding-agent execution, automated quality review, draft PR/MR creation, and human Code Readiness approval.

The principal architecture is now:

- Plane remains the human work-management and collaboration foundation.
- Temporal owns durable Curve lifecycle orchestration and mandatory human waits.
- Onyx supplies permission-aware internal knowledge under the initiating user's identity.
- A read-only MCP registry exposes approved tools and contextual sources.
- A thin Curve Model Gateway enforces model, provider, classification, policy, and budget decisions above X3M's OpenRouter access.
- OpenHands is the first coding execution provider; Orca remains behind the provider interface until its official contract is proven.
- gVisor-isolated Kubernetes runners execute coding and quality jobs.
- A trusted Curve controller, never an agent, owns commits, pushes, and draft MR creation.
- GitLab is the R0B pilot VCS; GitHub and GitLab remain R1 targets.
- X3M's existing AWS/Kubernetes, PostgreSQL, Secrets Manager, object storage/KMS, identity, observability, networking, and quality capabilities are reused.

The first pilot is the Loomit Admin SDK Compatibility panel in Sachiel, dependent on a CIA-owned versioned backend contract. The pilot tests whether Curve can materially reduce human effort and idea-to-draft lead time while improving first-pass acceptance and preserving security and repository-native CI.

## Evolution of the request

### 1. Plane licensing and feasibility

The first question was the license of the cloned open-source Plane project. Inspection established GNU Affero General Public License version 3 as the relevant repository license. That result shaped the product strategy in two ways:

1. Curve can modify and redistribute the Plane codebase, subject to AGPL obligations.
2. Every deployed Curve version derived from Plane needs a reproducible corresponding-source path, preserved notices, build instructions, and a prominent in-product link to the exact public source tag.

This was treated as a release-design concern rather than a final legal opinion. Qualified counsel and the release owner must accept the exact compliance procedure.

### 2. Product intent from the Drive document and workflow image

The user described an incomplete Google Drive product-management concept and supplied an “Agentic Development Workflow” image. The image established a lifecycle with these stages:

1. Alignment and idea refinement.
2. Optional research.
3. Optional prototype.
4. Destination specification or PRD.
5. Journey, phases, issues, and tasks.
6. Implementation by humans and agents.
7. Code review by humans and agents.

The lower implementation notes emphasized product and codebase context, granular slices, an agent pipeline with developer/code/security review, end-to-end testing, PR classifications, and KPIs.

The product interpretation was that Curve should not be only an agent launcher or another ticket tracker. It should be the control plane that turns product intent into versioned, approved, evidence-backed execution and retains lineage between every artifact, decision, repository snapshot, run, finding, and MR.

### 3. Initial product framing

The working product vision became:

> Curve is an AI-native product development platform that coordinates humans, knowledge systems, models, coding agents, repositories, quality systems, and delivery evidence across the software development lifecycle.

The initial design deliberately separated authority:

- Plane provides familiar product/project collaboration.
- Curve owns lifecycle semantics, immutable artifacts, evidence, approvals, execution plans, quality truth, budgets, and agent/provider state.
- Temporal owns durable orchestration rather than storing workflow truth in browser sessions, Celery jobs, or ticket statuses.
- External providers remain behind normalized interfaces to prevent the domain from becoming an OpenHands-, Orca-, GitLab-, or model-specific implementation.

### 4. PRD creation and technical derivation

The user requested a standalone PRD and later requested a more executable iteration suitable for an AI architecture/coding agent. The PRD was expanded to cover:

- document governance, vision, context, goals, non-goals, personas, and metrics;
- the complete lifecycle and three mandatory gates;
- functional and non-functional requirements;
- approvers and delegation;
- Plane, Temporal, Onyx, MCP, model, agent, VCS, flag, documentation, and quality integrations;
- domain entities and provider interfaces;
- workflow and event architecture;
- context/evidence/versioning/repository-snapshot rules;
- sandbox security and trusted VCS mutation;
- quality gates, findings, waivers, and commit invalidation;
- open-source technology choices and rejected alternatives;
- milestones, rollout, KPIs, acceptance criteria, risks, assumptions, open questions, and AGPL implications.

Technical documentation was then derived for architecture, domain model, workflows/sequences, integration contracts, security/operations, patterns/technologies, architecture decisions, and the development plan.

## Product decisions accumulated during the conversation

| Area | Decision or current direction | Rationale |
| ---- | ----------------------------- | --------- |
| Product name | Curve | User-selected identity for the integrated platform. |
| Work-management base | Plane community edition | Provides mature collaboration primitives and an extensible AGPL codebase. |
| Existing Plane data | No migration | Curve begins with new initiatives and references existing identifiers without rewriting existing roadmaps. |
| Human gates | Exactly three mandatory gates | Product approves the PRD, technical leadership approves the plan, and code leadership approves Code Readiness. |
| Prototype | Optional | Some initiatives benefit from a runnable/Lovable prototype; requiring one would add waste to backend or well-understood work. |
| Slice boundary | One repository per slice | Keeps agent context, credentials, CI evidence, rollback, and ownership bounded. |
| Delivery unit | One PR/MR per releasable vertical slice | Preserves independent review and delivery while avoiding trivial task-level MRs. |
| Draft behavior | Automatic draft creation after pre-draft gates pass | Reduces manual handoff but retains human authority over ready/merge/deploy. |
| Merge/deploy | Outside R1 automation | Curve does not automatically merge or deploy to production in R1. |
| Durable orchestration | Temporal | Required for long-running workflows, signals, approvals, retries, cancellation, and replay. |
| Existing async jobs | Keep Plane/Celery for bounded Plane work | Avoids an unnecessary rewrite; Celery cannot advance Curve lifecycle truth. |
| Knowledge | X3M Onyx using delegated user identity | Retrieval must preserve the initiating user's source permissions. |
| MCP | Workspace-approved, authenticated, read-only Streamable HTTP registry | Limits R1 side effects and makes tool authorization explicit. |
| Model access | Thin Curve Model Gateway above X3M OpenRouter | Centralizes policy/budget/classification without adding Portkey/Envoy to R0B infrastructure. |
| First agent provider | OpenHands | It can be integrated and proven now behind a normalized contract. |
| Orca | Interface only until official contract exists | Prevents inventing API/event/auth/licensing behavior. |
| Agent isolation | Kubernetes runner pool with gVisor | Establishes a stronger sandbox boundary in X3M's existing platform. |
| VCS mutation | Trusted controller only | Agents return candidate artifacts and never receive push/MR/approval/deploy credentials. |
| Pilot VCS | GitLab | The supplied pilot repositories are in internal GitLab. |
| Documentation | Docusaurus only when a delivery contract requires it | Avoids an unnecessary documentation MR for the Loomit pilot. |
| Feature delivery | Provider-neutral Curve interface; Sachiel uses existing Flipt profile | Avoids coupling Curve's domain to one flag backend. |
| Security threshold | No Critical/High findings | User-selected pilot threshold; stronger non-waivable classes also fail closed. |
| Infrastructure additions | Temporal, gVisor, and OpenHands only | X3M already supplies other required platform services. |
| Environments | Existing local/staging/production topology | Curve integrates with current X3M promotion and operational boundaries. |

## Infrastructure reasoning

An early technology inventory considered workflow orchestration, sandboxing, agent execution, data stores, object storage, secrets, observability, identity, networking/egress, flag delivery, model routing, quality scanning, and VCS integrations. The user clarified that X3M already provides Kubernetes/AWS, PostgreSQL, Secrets Manager, S3/KMS-equivalent storage, identity, Prometheus/Grafana, logging/tracing, networking/egress, and other shared services.

The incremental infrastructure scope was therefore reduced to:

- Temporal, with a local development profile and an HA staging/production design to be proven;
- gVisor, including a dedicated RuntimeClass and runner pool rather than assuming a RuntimeClass alone installs and operates `runsc` on EKS nodes;
- OpenHands, deployed through an approved Agent Server/SDK/image mode still to be pinned.

This reduction matters because Curve should reuse X3M platform capabilities and avoid building a parallel internal platform. The technical documents nevertheless retain provider interfaces for shared services so workspace isolation, authorization, audit, and failure behavior remain explicit.

## Pilot definition and corrections

### User-provided pilot

The initial pilot target was:

- Repository: `git@gitlab.com:etermax/ads/x3m/back-office/sachiel.git`.
- Product: Loomit Admin web UI.
- Feature: an SDK compatibility tab in App Details displaying installed version, recommended version, and whether an upgrade is required.
- Product approver: PO.
- Technical approver: TL.
- Code approver: Dev.
- Team CIA owns backend services.
- A related backend/config repository was supplied at `https://gitlab.com/etermax/ads/x3m/general-config`.

### Baselines and success targets

The original comparison baseline was:

- seven days of human execution using AI to production;
- five days from idea to draft PR;
- 60% first-pass acceptance;
- manual regression.

The user then selected four primary success targets:

- at least 60% reduction in active human execution effort;
- at least 50% reduction in idea-to-draft-PR lead time;
- at least 70% first-pass acceptance of generated implementation;
- no Critical/High security findings and no regression in repository-native CI.

The plan converts the first two targets into pilot thresholds of no more than 2.8 active human-effort days and no more than 2.5 elapsed idea-to-draft days. Because one pilot cannot establish a statistically meaningful 70% rate, the single initiative is reported as a binary first-pass outcome; aggregate numeric targets are set after three comparable initiatives.

One unresolved metric definition remains important: whether the seven-day baseline is genuinely active human effort or elapsed lead time to production. Curve records clocks separately rather than silently conflating them.

### Backend ownership correction

Repository inspection showed that the supplied General Config repository did not own the target route `GET /mm/organizations/{orgId}/apps/{appId}`. Treating that repository as the CIA implementation target would have caused an AI agent to modify the wrong system.

The corrected pilot boundary is:

- CIA owns the backend implementation in its authoritative internal repository.
- CIA publishes a versioned OpenAPI contract and deploys it to staging through its normal workflow.
- Curve records the exact deployed contract evidence before dispatching the dependent Sachiel slice.
- Sachiel is the only R0B coding-agent-dispatched repository slice unless the authoritative CIA repository is later supplied and approved.

### Contract correction

The first illustrative TypeScript shape used camelCase. Inspection of Sachiel conventions indicated snake_case wire representations. The contract was corrected to use snake_case on the wire and camelCase only in a frontend mapper/domain view.

The compatibility semantics distinguish:

- `COMPLIANT`;
- `UPGRADE_REQUIRED`;
- `UNKNOWN` when installed or recommended version data is missing or insufficient;
- unavailable compatibility data on an otherwise successful App response;
- complete App endpoint failure, which follows existing App Details failure behavior rather than fabricating compatibility status.

CIA owns platform-specific Android/iOS version policy. Curve and Sachiel must never infer an upgrade requirement from missing or invalid data.

### UI and feature-flag correction

The panel is added only where the existing App Details view is active, meaning `new-placement-view` is disabled. A default-off Flipt flag named `sdk-compatibility-panel-enabled` initially limits exposure to pilot organizations/users. Both navigation visibility and direct-route access require eligibility; hiding a tab alone is not an authorization or safety control.

Manual review evidence covers all four compatibility states plus App Details navigation and adjacent tabs. It binds the exact candidate head SHA and becomes invalid when the commit changes.

## Review findings that materially changed the plan

The implementation-readiness review identified that a coherent vision was not yet an executable plan. The most consequential findings and resulting changes were:

### Circular PR readiness

Problem: draft-MR creation depended on evidence that only existed after an MR was open.

Correction: separate lifecycle states and evidence:

1. `DraftEligible` — candidate tree passes pre-draft quality.
2. `DraftOpen` — trusted controller has opened the draft MR.
3. `ReviewReady` — MR-associated CI/review evidence is current.
4. `FeatureReleaseReady` — human Code Readiness approval is current.
5. `PostReleaseVerified` — later release evidence, outside automatic production deployment.

Every gate binds exact artifact versions and commit SHAs. Any commit change invalidates prior commit-bound evidence.

### Permissioned evidence leakage

Problem: committing full context under a repository path could permanently leak permissioned Onyx material into Git.

Correction: only a sanitized Context Manifest may enter Git. Full evidence/context remains encrypted in protected X3M object storage and is mounted ephemerally, read-only, into the sandbox when authorized.

### Incomplete tenancy

Problem: workspace tenancy was stated but not consistently represented in entities, events, caches, object keys, connections, and authorization.

Correction: `workspace_id` is mandatory across persistence, provider connections, event envelopes, cache namespaces, object paths, budgets, APIs, and audit. Derived artifacts inherit ACL/classification constraints. Revocation and delegated-token expiry fail closed.

### Weak sandbox/VCS boundary

Problem: agent sandboxing did not completely prevent agents from mutating VCS or exposing unsafe previews.

Correction:

- OpenHands receives no push, MR, approval, merge, deploy, or production credential.
- A trusted controller validates candidate trees and owns commit/push/draft creation.
- Credentials are JIT, scoped, expiring, and revoked on completion/cancellation.
- Network egress is default-deny with approved package mirrors and provider destinations.
- Context mounts outside the checkout are read-only.
- Runners enforce CPU/memory/time/concurrency limits, cleanup, quarantine, cancellation fencing, and reconciliation.
- Any preview is authenticated, TTL-bound, isolated, and automatically revoked.

### Non-executable quality policy

Problem: “block Critical/High” did not define precedence, applicability, tool versions, waivers, reclassification, or commit invalidation.

Correction:

- Organization baseline precedes workspace/repository policy; narrower scopes may strengthen but not weaken protected controls.
- Quality runs pin tool images, versions, rulepacks, policy versions, base/head SHAs, applicability, and evidence digests.
- Unknown applicability or tool/license status fails closed where required.
- Secrets, authorization, sandbox, restricted-data, destructive-data, prohibited-license, and security-policy failures are non-waivable.
- Only TL may waive Low/Info non-security findings, with rationale, expiry, rule/tool version, and commit SHA.
- Finding reclassification requires authorized AppSec evidence; it is not an agent judgment.

### “Open questions” that were actually blockers

Problem: production-critical security and operations choices were listed as ordinary open questions, allowing an implementation agent to invent answers.

Correction: the PRD now contains D-001 through D-016 controlled decisions with named owners, due milestones, conservative fail-closed defaults, status, and minimum proof. A planning direction is `PROPOSED`, not implementation authorization. Only the named owner may set `DECIDED`.

## Release-scope clarification

The plan had mixed a minimal pilot with broader R1 promises. It was normalized into:

- R0A: foundation and proof work.
- R0B: bounded GitLab/OpenHands Loomit pilot.
- R1: broader lifecycle and provider/repository capabilities after qualification.

R0B can validate OpenHands and GitLab without falsely claiming Orca, GitHub, automatic deployment, or MCP writes. R1 still retains dual VCS and provider-neutral architecture, while Orca dispatch remains blocked until D-006 is decided or the PRD is explicitly revised.

## Workflow and evidence rationale

Curve treats generated prose as versioned artifacts rather than mutable chat output. Important rules include:

- PRD, plan, workflow, policy, context, and repository snapshots are immutable versions.
- Approvals bind exact versions, identities, roles, policy, context, provider/model, budget, and relevant SHAs.
- Superseding an artifact never rewrites the approved historical version.
- Research claims retain citations and evidence references.
- Repository analysis binds an exact base SHA.
- Agent output is a candidate artifact, not trusted code.
- Quality truth is produced independently from the coding agent.
- Outbox/inbox delivery and idempotency keys protect Temporal/provider/VCS interactions from duplicate, stale, lost, or out-of-order messages.
- Reconciliation is a first-class capability rather than relying only on callbacks.

These rules exist because a long-running SDLC workflow spans changing repositories, users, permissions, providers, models, policies, and costs. Without immutable binding, a valid approval could be incorrectly applied to different work.

## Budget reasoning

The conservative pilot defaults are:

- USD 300 per workspace per month;
- USD 50 per initiative;
- USD 10 per research activity;
- USD 25 per coding attempt;
- two sandbox-hours per attempt;
- one active attempt per workspace;
- 2 vCPU and 8 GiB memory per active attempt.

Product and Platform jointly approve expiring exceptions. Exhaustion pauses work; Curve does not silently select a cheaper model/provider or continue unmetered.

The domain model adds atomic reservation across every applicable scope, immutable settlement/adjustment, versioned price/policy periods, and reconciliation. This prevents concurrent activities from each observing available budget and collectively overspending it.

## Plane upstream foundation reasoning and execution

### Question resolved

The user asked whether “Plane upstream as the baseline” meant using the original Plane repository as the source from which changes are incorporated into the user's fork, thereby allowing Curve to receive later Plane improvements. The answer was yes, with an important workflow qualification: Curve is developed and released from the fork, while official Plane is a read-only update source.

The user approved that strategy.

### Repository state before synchronization

| Item | Value |
| ---- | ----- |
| Fork | `git@github.com:faocampo/plane.git` |
| Shared fork branch | `preview` |
| Fork commit | `31853ab2b8b7810c59dc30d22e52c8f4b5a71a47` |
| Initial working tree | Clean |
| Initial remotes | Fork `origin` only |

### Safe synchronization procedure executed

1. Added `upstream` pointing to `https://github.com/makeplane/plane.git`.
2. Disabled the upstream push URL.
3. Fetched upstream branches and tags.
4. Pinned `upstream/preview` at `1c8a60f858d8472aa56e29994ec1c7926da2c6ce`.
5. Compared ancestry: fork `preview` was zero commits ahead and one behind; the fork commit was the merge base.
6. Inspected the one upstream delta: stale web chunk-load recovery affecting three web files, with no schema, lockfile, deployment, or license-file change.
7. Created `curve/plane-upstream-sync-2026-08-12` without moving shared `preview`.
8. Ran repository-native frontend and backend validation.

No commit was pushed and shared `preview` was not rebased, reset, or force-updated.

### Baseline defect discovered

The first full `pnpm check` failed in `@plane/i18n#check:format`. The generator created ignored `packages/i18n/src/types/keys.generated.ts` with the terminating TypeScript semicolon on a separate line. The repository's pinned formatter rejected that output even though the generated file is not tracked.

The source generator was corrected so the final union member carries the semicolon. During the approved local commit, repository hooks also replaced two mutating `.sort()` calls with `.toSorted()` to satisfy lint policy.

### Local commit and verification

| Evidence | Result |
| -------- | ------ |
| Candidate commit | `d380678912e9b46805ef852d2e05411f1fea6d8b` |
| Commit message | `fix(i18n): generate formatter-compatible translation keys` |
| Branch relation | One local commit ahead of `upstream/preview` |
| Working tree | Clean after commit |
| Exact-SHA frontend check | 60/60 tasks passed; 54 cached and 6 executed; 24.24 seconds |
| Production build | 16/16 tasks passed on the pre-commit-equivalent candidate tree |
| Backend tests | 516 passed, 92 warnings, 84.10 seconds |
| Backend cleanup | Disposable containers, network, and volumes removed; pre-existing development containers untouched |
| Push/merge | Not performed |

The commit used the repository machine's automatically inferred Git identity `Federico Ocampo <federico.ocampo@Soportes-MacBook-Pro.local>`. Git warned that the identity was inferred. It was not amended because changing authorship was not requested.

### Why D-001 remains proposed

The user approved the strategy and the exact candidate now passes the principal repository-native checks. However, D-001's own acceptance contract also requires:

- a deployment smoke test on the exact candidate SHA;
- acceptance of the complete community-versus-commercial capability inventory;
- legal/release acceptance of AGPL, notices, dependencies, and corresponding-source behavior;
- a named support/upgrade owner and review cadence;
- approval by the Curve engineering lead and required reviewers.

Marking D-001 `DECIDED` before those gates would contradict the PRD and falsely authorize M0 implementation. The accurate state is `PROPOSED` with the upstream direction selected and substantial evidence complete.

## Current decision register interpretation

The current controlled decisions are D-001 through D-016. Their status has a precise meaning:

- `OPEN`: the selection itself is unresolved.
- `PROPOSED`: a direction exists, but owner approval and/or required proof is incomplete.
- `DECIDED`: the named owner and required reviewers accepted the evidence and consequences.

An AI coding agent may gather bounded proof for an open/proposed decision when explicitly authorized. It may not implement a blocked package, provision production behavior, invent a provider contract, weaken security, or promote a recommendation to `DECIDED`.

## Most important unresolved decisions

| Decision | Remaining question or evidence | Conservative behavior |
| -------- | ------------------------------ | --------------------- |
| D-001 Plane foundation | Deployment smoke, capability/license acceptance, support owner | Do not merge/publish candidate or begin blocked M0 implementation. |
| D-002 Onyx identity | Actual issuer/audience/scopes/token exchange, revocation and durable-wait proof | Protected retrieval disabled. |
| D-003 production topology | Exact Temporal/gVisor/OpenHands versions, regions, HA, backup/restore, RPO/RTO, ownership | Local/staging proof only; no production SLA/data. |
| D-004 model gateway | OpenRouter contract, approved models, enforcement, observability and replacement path | Development stub only. |
| D-005 model governance | Task/classification allowlists, terms, residency, retention/ZDR, evaluations and fallback equivalence | No silent fallback; restricted calls blocked. |
| D-006 Orca | Official API/events/auth/deployment/support/license | No Orca dispatch. |
| D-007 MCP | Protocol/version/auth/registry/injection/cancellation proof | Proven read path only; no writes. |
| D-008 VCS controller | Exact GitLab/GitHub identities, scopes, signing, rotation/revocation and conformance | Read-only VCS inspection. |
| D-009 retention | Class-by-asset periods, legal holds, backup expiry, tombstones and erasure | Restricted raw inputs ephemeral; production blocked. |
| D-010 quality | Licensed CodeQL or approved equivalent, pinned tool/rule/license manifest | Unknown or Critical/Major/non-waivable results block. |
| D-011 flags | Curve's OpenFeature backend and X3M conventions | Unregistered runtime flags blocked. |
| D-012 Docusaurus | Default branch, owners, auth, checks, preview and release relation | Applicable documentation delivery blocks; pilot remains N/A. |
| D-013 migration | Product Operations formal acceptance of no migration | New initiatives only. |
| D-014 budgets | Finance/Product/Platform acceptance and concurrency/reconciliation proof | Conservative caps; exhaustion pauses. |
| D-015 pilot | Authoritative CIA OpenAPI/staging evidence and owner acceptance | No agent pilot dispatch. |
| D-016 KPIs | Baseline clock confirmation and aggregate policy after three initiatives | Report baseline and binary pilot result only. |

## Technology choices rejected or deferred

| Technology or approach | Result | Reason |
| ---------------------- | ------ | ------ |
| Replace Plane entirely | Rejected | Discards mature work-management capabilities and expands scope. |
| Use Plane/Celery as Curve workflow truth | Rejected | Does not provide the required durable approval/retry/replay semantics. |
| Add Portkey or Envoy in R0B | Deferred | A thin gateway over existing OpenRouter meets the immediate boundary with less infrastructure. |
| Daytona as the foundational sandbox | Not selected | Does not replace the required gVisor plus trusted-controller boundary. |
| Give OpenHands Git credentials | Rejected | Violates separation between untrusted code generation and trusted VCS mutation. |
| Store full Onyx evidence in Git | Rejected | Can leak permissioned context permanently. |
| Require a prototype for every initiative | Rejected | Adds delay where a prototype has no decision value. |
| One MR per granular task | Rejected | Creates review overhead and may not form releasable behavior. |
| One cross-repository agent slice | Rejected | Expands credentials, context, ownership ambiguity, and rollback complexity. |
| Automatic merge/production deploy in R1 | Deferred | The pilot must first prove planning, coding, quality, and review safety. |
| MCP writes in R1 | Deferred | Read-only capability is sufficient for initial context gathering and materially safer. |

## Security model summarized

Curve uses defense in depth:

1. Plane/X3M identity authenticates humans.
2. Workspace-scoped RBAC/ABAC authorizes every operation.
3. Delegated provider tokens are short-lived and revalidated after durable waits.
4. Evidence carries classification, ACL, retention, provenance, and cryptographic integrity.
5. Agent workloads run in ephemeral gVisor-isolated pods with default-deny egress.
6. Agents have read-only context mounts and no VCS/deployment credentials.
7. Trusted controllers validate artifacts and perform bounded mutations.
8. Independent quality jobs produce commit-bound evidence.
9. Mandatory human gates bind exact versions and SHAs.
10. Immutable audit and safe telemetry preserve accountability without leaking protected bodies.

Cancellation fences further mutation, revokes credentials/previews, stops or quarantines runners, and reconciles ambiguous provider/VCS outcomes.

## Delivery strategy summarized

The intended sequence is:

1. Close P0 architecture decisions and foundation proofs.
2. Build M0 workspace, policy, artifact, audit, budget, event, and Temporal foundations.
3. Add M1 alignment/research/prototype/PRD Gate 1 with Onyx/MCP/model boundaries.
4. Add M2 product roadmap and immutable delivery-contract snapshots without migrating existing Plane roadmaps.
5. Add M3 repository inventory, execution-plan DAG, Context Packs/Manifests, Gate 2, and read-only VCS analysis.
6. Add M4 gVisor/OpenHands execution, questions, cancellation, reconciliation, and artifact retrieval.
7. Add M5 independent quality, trusted VCS mutation, automatic draft creation, Code Readiness Gate 3, flags, and documentation profiles.
8. Run M6 Loomit pilot measurement and hardening.
9. Complete two more comparable initiatives before broad R1 KPI commitments.

Every work package is expected to include prerequisites, exact base SHA, bounded files/components, contracts, tests, evidence, rollback, and stop/escalation rules suitable for an AI coding agent.

## Documentation artifacts produced

The current documentation package contains:

- the implementation-oriented Curve PRD;
- high-level architecture and deployment/trust boundaries;
- detailed domain entities and invariants;
- workflow and sequence definitions;
- API, event, provider, and reconciliation contracts;
- security and operations requirements;
- engineering patterns and technology recommendations;
- the D-001-D-016 decision process;
- the dependency-ordered development plan;
- the implementation-readiness review and remediation ledger;
- the Plane foundation capability inventory;
- ADR-001 for the Plane upstream strategy;
- this retrospective decision/execution chronicle.

The documents use `PROPOSED` and `OPEN` intentionally. They should not be read as permission to implement milestone-blocked production behavior.

## Validation performed on documentation

The documentation suite has been checked for:

- Git whitespace errors;
- heading hierarchy and balanced fenced blocks;
- local Markdown link resolution;
- Mermaid fence presence and structural consistency;
- documentation-only repository scope.

At the point immediately before this chronicle was added, 13 Markdown files passed structure validation and all 44 local links resolved. The final validation for this new file is recorded after creation rather than asserted in advance.

## Current state and next recommended action

The verified Plane candidate exists locally at `d380678912e9b46805ef852d2e05411f1fea6d8b`; it has not been pushed or merged. The most direct next D-001 action is to define and run the approved non-production deployment smoke test against that exact SHA, then obtain community/commercial, licensing, and ownership acceptance for ADR-001.

After D-001, the recommended blocking-decision order is:

1. D-003 Temporal/gVisor/OpenHands topology and proof boundaries.
2. D-002 Onyx delegated identity.
3. D-004 and D-005 model gateway/governance.
4. D-008 VCS trusted-controller identity.
5. D-009 retention and D-010 quality/security licensing.
6. D-014 budgets and D-015/D-016 pilot acceptance and metric clocks.

That order closes the minimum authority and infrastructure needed for M0/M1 without prematurely implementing the pilot UI.

## Change-control note

This chronicle is descriptive. If it conflicts with the PRD, an approved ADR, a versioned schema, or verified repository evidence, those authorities win. New decisions should update the PRD/ADR/technical contract first and then append a dated correction here; historical decisions should not be silently rewritten.

## 2026-08-12: local D001 deployment smoke execution

The approved D001 smoke test reused the existing stopped local Plane Docker Compose project rather than creating an isolated test stack. It retained the named development volumes for PostgreSQL, Valkey, RabbitMQ, and MinIO and recreated all Plane services from candidate `d380678912e9b46805ef852d2e05411f1fea6d8b`.

The first recreation failed because an unrelated running `x3m-hr-local-frappe-1` container owned host ports `8000` and `9000`. That container was not stopped or changed. A temporary non-repository Compose override remapped only Plane's host-facing API and MinIO ports to `127.0.0.1:18000`, `127.0.0.1:19000`, and `127.0.0.1:19090`; internal Plane service addresses remained unchanged. The second recreation succeeded.

The migrator exited `0` and found no pending migrations. API, worker, Beat, PostgreSQL, Valkey, RabbitMQ, and MinIO remained up. The API completed its normal database/migration wait, local-instance setup, MinIO bucket check, cache clear, and Django startup. The health endpoint at `http://127.0.0.1:18000/` returned `200` with `{"status":"OK"}`. `manage.py check --deploy --settings=plane.settings.local` exited `0` with expected warnings for insecure local-profile settings: HSTS, SSL redirect, secure session/CSRF cookies, and `DEBUG=True`.

The worker connected and registered its task set. Beat initialized the database-backed scheduler. Reusing persistent Beat state had an important consequence: overdue periodic jobs ran immediately after startup, including cleanup and telemetry tasks. The displayed cleanup tasks reported zero deletions; telemetry reached Plane's configured OTEL endpoint. This was not planned as a functional test and is evidence that future reuse of persistent local Beat state needs explicit side-effect disclosure.

The smoke probe enqueued `get_asset_object_metadata` for a random nonexistent asset, task ID `ffb878bb-446f-4b3c-a79a-92b9fd1f8a9c`. The worker received it; it was no longer active or reserved and no failure was logged. The task code returns on a missing asset and Plane has no Celery result backend, so no durable terminal result was available. The local stack was intentionally left running; no volumes were deleted and no Plane branch was pushed or merged.

The successful smoke closes the deployment-smoke portion of D001 only. D001 remains `PROPOSED` until the community/commercial capability matrix, AGPL/release acceptance, and named support/upgrade ownership are formally accepted.

## 2026-08-12: planning-to-execution rationale for the D001 smoke

The user asked to both plan and perform the next D001 action. The initial response was intentionally a deployment-smoke plan rather than an immediate restart because the evidence requirement was specific: the run had to prove the candidate commit, not merely demonstrate that some old local Plane container still started. The planning pass established four facts before a state-changing command was allowed:

1. Plane supplies a local Compose stack with API, worker, Beat, migrator, PostgreSQL, Valkey, RabbitMQ, and MinIO, plus documented migration and deployment-check commands.
2. The existing local stack was stopped but had persistent development volumes. It was appropriate to reuse only after the user explicitly authorized the standard migrator to operate on that development database.
3. The stopped stack's historical API mount referenced `/Users/federico.ocampo/Development/tools/plane`, which was not the candidate Git checkout. Reusing those old containers would therefore not have proved candidate `d380678912e9b46805ef852d2e05411f1fea6d8b`.
4. Recreating the existing Compose project from `/Users/federico.ocampo/Development/tools/project_management/plane` would preserve the intended development volumes while binding newly built images and source mounts to the candidate checkout.

The recommendation was therefore to recreate, rather than merely start, the existing `plane` Compose project. This met both constraints: it used the user's existing local Plane state and supplied evidence about the actual candidate tree. The standard migrator was included because Plane API, worker, and Beat entrypoints explicitly wait for migrations; skipping it would have left the deployment path only partially tested.

The plan originally selected Beat startup-only validation to avoid deliberately running recurring cleanup or notification work against persistent data. In implementation, the persistent database-backed Beat schedule immediately released overdue jobs on startup. That observation changes the operating guidance: a future persistent-stack smoke must either accept and document this normal side effect, or temporarily isolate/disable Beat before startup. “Do not wait for a periodic job” is not sufficient to prevent scheduled jobs from running when prior schedule state is overdue.

### Runtime deviations and their treatment

| Observation | Reasoning and outcome |
| ----------- | --------------------- |
| Docker port conflict on `9000` and `8000` | The process belonged to the unrelated X3M HR Frappe stack. Stopping it would broaden scope and risk another local product. The conflict was resolved with a temporary, non-repository Compose override that changed only Plane's host bindings. |
| First port override appended rather than replaced bindings | Docker Compose merged the port lists, retaining conflicting entries. The configuration was inspected before retrying. The override was corrected with Compose's `!override` tag, and the resolved configuration showed only the intended bindings before services were recreated. |
| `check --deploy` produced warnings but exit code `0` | The candidate was tested under `plane.settings.local`, not an HTTPS production profile. The warnings are evidence of the local profile's boundaries, not a false “production-ready” claim. They remain relevant to D003 production topology and security hardening. |
| Celery worker runs as root | The repository-local development Compose configuration launches the worker as root. This is recorded as a local-container hardening warning and must not be copied into Curve's gVisor production runner design. |
| Celery results backend is disabled | Probe completion could not be retrieved as a durable result object. The evidence standard used receipt plus absence from active/reserved queues plus no failure logs. Curve's own provider/quality workflows must retain durable completion state independently. |

### Execution-control principles applied

- Every destructive or state-changing action was preceded by an explicit scope statement and target verification.
- Existing persistent volumes were retained; no `down -v`, reset, or cleanup command was used.
- The unrelated X3M HR stack was treated as out of scope and left untouched.
- Temporary host-port configuration lived outside both repositories in `/private/tmp`, preventing a developer-machine workaround from becoming a tracked deployment convention.
- Candidate identity was checked both before recreation and after the smoke test.
- Passing local smoke was recorded as evidence, not as authority to mark D001 `DECIDED`.

### Updated immediate state

The candidate stack remains available for local development on these intentionally temporary host addresses:

| Service | Local address |
| ------- | ------------- |
| Plane API health endpoint | `http://127.0.0.1:18000/` |
| Plane MinIO API | `http://127.0.0.1:19000/` |
| Plane MinIO console | `http://127.0.0.1:19090/` |

The normal `8000` and `9000` addresses are occupied by the X3M HR stack. The temporary override is not part of the Curve or Plane source tree and should be recreated deliberately if the local Plane project is restarted while that conflict persists.

### Remaining decision logic

The deployment-smoke proof is now complete, but D001 still has three non-technical authorization boundaries:

1. The Curve engineering lead must accept the community-versus-commercial capability and reuse/build matrix.
2. Legal and release owners must accept the AGPL, notice, dependency, corresponding-source, and release-manifest obligations.
3. An accountable support/upgrade owner and upstream-review cadence must be assigned.

These items cannot be resolved by more local tests. They require named-owner decisions, so the next work should prepare bounded decision packets rather than implementing Curve application modules prematurely.

## 2026-08-12: M0 codeability iteration

The subsequent planning pass narrowed “fully codeable” to progressive readiness: close the foundation decisions and make M0 dispatchable first, then refine M1-M7 one milestone ahead of implementation. Freezing every R1 implementation detail before M0 would increase delay and make late integration contracts stale.

The Orca boundary changed materially. OpenHands is now the sole automated `AgentExecutionProvider`. Developers continue to operate Orca manually; Orca connects to Curve as an authenticated MCP client using the developer's short-lived delegated identity. Its write scope is limited to claim, release, heartbeat, progress, question, completion, and VCS-reference workflow updates. It cannot upload executable artifacts, approve gates, grant waivers, change plans, mutate VCS through Curve, or deploy. This removes the unsupported assumption that Curve must invent an Orca execution API while retaining Orca in the R1 developer experience.

The M0 dependency graph was also corrected. Model-gateway/model-policy decisions D-004/D-005 now block the first model-enabled M1 work rather than the model-free M0 skeleton. VCS identity decision D-008 begins blocking at VCS-specific M3 work. Core M0 authorization retains generic deny-by-default allowlists without selecting provider credentials. Retention decision D-009 blocks protected-object storage and every staging/production activation, while independent local M0 work may use synthetic data.

P0 is now split into foundation readiness (`P0A`) and just-in-time integration proofs (`P0B`). P0A covers the Plane baseline, topology, documentation/contracts, test strategy, and local Temporal proof. gVisor/OpenHands, Onyx, VCS, quality, and retention proofs close immediately before their consuming packages. This does not waive any ADR; it prevents unrelated future-provider proofs from blocking a safe local foundation.

The implementation handoff now includes machine-readable OpenAPI and JSON Schemas, a Temporal M0 workflow contract, an M0 readiness board, ADR decision packets, authorization/state matrices, traceability, and five repository-local task packets. A pinned documentation toolchain validates Markdown, OpenAPI, JSON Schema syntax/references, local links, heading hierarchy, Mermaid diagrams, and external Markdown links. These artifacts make blockers executable and auditable, but they do not turn a missing named-owner approval into a decision.

## 2026-08-12: governed-baseline execution and foundation decision evidence

The approved implementation plan began with a governed documentation baseline rather than premature Plane application mutation. The Curve documentation branch now contains a committed PRD, architecture, ADR set, readiness board, task packets, OpenAPI, JSON Schemas, Temporal contract, validation scripts, and requirement-to-contract-to-test traceability. OpenHands remains the sole automated execution provider; Orca is consistently modeled as a delegated developer MCP client with bounded workflow write-back.

The Plane upstream candidate could not yet be published because the local GitHub CLI credential for `Fedoca82` is invalid. That failure was treated as an external mutation boundary: no alternative credential path, connector bypass, push, or PR creation was attempted. Work continued only on independent local evidence. The candidate branch remains local at `d380678912e9b46805ef852d2e05411f1fea6d8b`, and M0 code mutation remains blocked because the plan requires a reviewed merge SHA and a `DECIDED` D-001.

The D-001 audit then inspected the actual public fork rather than inferring availability from product marketing or directory names. The root license and README establish AGPL v3, and inspected files use `AGPL-3.0-only` SPDX headers. Public models/APIs/UI include the expected work-management primitives and Gantt presentation implementation. Conversely, public extension lists are empty, one page service explicitly places added implementation in an enterprise repository, and the inspected editor `ee` files only re-export `ce` code. The resulting rule is conservative: reuse proven public primitives, build Curve semantics additively in `plane.curve`, and treat placeholders or enterprise references as unavailable until separately proven and legally accepted. This completed technical evidence without impersonating engineering or legal approval.

D-003 preparation followed the same boundary. The existing Plane local stack was inventoried without changing it. Current official Temporal sources and registry metadata were used to propose the development CLI image `1.8.1` by immutable multi-architecture digest, its embedded server `1.31.2`, and Python SDK `1.30.0`. The proposed local profile adds only the dev server and a dedicated Curve worker to the existing Compose topology, uses synthetic-only SQLite history, retains PostgreSQL as product truth, binds host ports to loopback, and leaves Celery unchanged. No image was pulled and no service was started. Staging/production placement, HA sizing, PostgreSQL databases, TLS/auth, encryption, backups, RPO/RTO, ownership, and cost remain explicit Platform Operations decisions rather than inferred defaults.

The D-007 contract audit found that naming an allowlist was insufficient while the JSON Schema still accepted arbitrary per-tool arguments. The request contract was therefore tightened to closed v1.1 schemas for every approved read and write, with a matching typed result schema. The proposed transport pins the stable MCP `2026-07-28` revision and an OAuth 2.1 protected-resource flow, but keeps issuer, audience, client registration, token ceiling, revocation implementation, and supported Orca client under named Security/Platform review. The manual-attempt state machine now distinguishes developer completion declaration from trusted VCS-reference validation: neither an Orca message nor a linked branch can claim quality or code-readiness success. Unknown fields/tools, forged identity, stale versions, replayed sequences, late terminal writes, and silent protocol downgrade all fail closed.

D-009 could not be decided by choosing convenient retention numbers. Its readiness work instead enumerated Curve-controlled and external-copy asset classes, specified the lawful metadata that may remain after body erasure, and converted every unresolved period/authority into an explicit `TBD` that blocks the affected capability. The proposed erasure state machine makes legal hold, read fencing, partial failure, non-retrievability verification, and restored-backup re-erasure observable rather than treating object deletion as success. This preserves the user's “no invented answers” requirement while giving Security, Privacy, Legal, Platform Operations, and database owners a finite approval worksheet and executable evidence list.

The next status audit found that the active desktop workspace path was no longer the verified Plane checkout; it contained only an unrelated `docs/` directory. The candidate repository remained intact at `/Users/federico.ocampo/Development/tools/project_management/plane`, so no files were copied or initialized in the misleading path. GitHub authentication was still invalid, and publication remained paused rather than bypassed.

Independent contract work then exposed two contradictions and an explicit deliverable gap. The PRD still named `/api/curve/v1/` while the normative OpenAPI and prior reconciliation used `/api/v1/workspaces/{workspace_slug}/curve/`; the integration document also omitted `QUEUED` and `CANCEL_REQUESTED` from its Operation vocabulary. PRD v0.7 resolves both in favor of the versioned OpenAPI and M0 workflow contract. The M0 contract pack now supplies distinct workspace-record, immutable-history, Access Envelope, provider-connection, Outbox, Inbox, Idempotency, Audit, Operation, Event Envelope, and typed operation-event schemas with synthetic positive/negative fixtures. Protected bodies and raw secrets are excluded by closed schemas, retention remains a policy reference rather than an invented duration, and the digest wire form is consistently `sha256:<lowercase hex>`.

The next readiness audit compared each local-skeleton packet with the plan's own coding-entry contract. Scope and rollback were present, but exact commands, per-packet traceability and contracts, executable scenarios, risk, data/tool/sandbox budgets, and named-person fields were not. Repository inspection at the pinned Plane candidate established the actual root checks, isolated Docker pytest stack, Django migration commands, API and React route seams, and the absence of an `apps/web` test command. The packet specification now makes those obligations explicit, assigns a minimal frontend harness to M0-S1 so its UI boundary is independently testable, and leaves publication, reviewed base SHA, named humans, and owner decisions as fail-closed blockers rather than silently treating them as complete.
