# Curve Later-Milestone Decision Readiness Index

## Document control

| Field | Value |
| --- | --- |
| Status | `PACKETS READY / MATERIAL DECISIONS OPEN / NOT IMPLEMENTATION AUTHORITY` |
| Version | 1.0 |
| Prepared | 2026-08-27 |
| Product | Curve |
| Scope | D-002 (Onyx delegation) through D-016 (KPI and rollout guardrails), excluding already decided D-003 (runtime topology for local scope) |
| Owner and reviewer | Federico Ocampo until specialist owners are named |
| Prepared by | Codex |
| Activation boundary | A packet makes an owner decision executable; it does not make the decision `DECIDED` and authorizes no code, provider, credential, infrastructure, deployment, or external mutation |

## Purpose

This index is the one-milestone-ahead readiness map for Curve. It separates:

1. a **decision-readiness packet**, which lists every required owner input,
   machine contract, proof, fallback, stop condition, and approval; from
2. a **decided record**, in which named accountable people approve one exact
   stable content digest and the consuming task packet pins that revision.

No coding agent may perform the second transition.

## Decision packet map

| Decision | Current decision state | Readiness packet | First consuming work | Accountable roles | Effective boundary until decided |
| --- | --- | --- | --- | --- | --- |
| D-002 (Onyx delegated-identity decision) | `PROPOSED / OWNER AND DEPLOYMENT EVIDENCE REQUIRED` | [M1 decision-readiness packet](d002-d004-d005-m1-decision-readiness.md) (Onyx delegation, Model Gateway, and model data-policy inputs/proofs) | M1-03 (Onyx delegation and evidence retrieval) | Security and Identity; Onyx Operations; Curve Product | Live Onyx retrieval disabled; metadata-only proposal work |
| D-004 (Curve Model Gateway decision) | `PROPOSED / OWNER AND ACCOUNT EVIDENCE REQUIRED` | [M1 decision-readiness packet](d002-d004-d005-m1-decision-readiness.md) (Onyx delegation, Model Gateway, and model data-policy inputs/proofs) | First model-enabled M1 (alignment and PRD) operation | AI Platform; Platform Operations; Security; FinOps | No model call through Curve |
| D-005 (model/provider data-policy decision) | `PROPOSED / OWNER AND ENDPOINT EVIDENCE REQUIRED` | [M1 decision-readiness packet](d002-d004-d005-m1-decision-readiness.md) (Onyx delegation, Model Gateway, and model data-policy inputs/proofs) | Every model-enabled M1 (alignment), M3 (planning), and M5 (quality) operation | AI Governance; Security; Privacy/Legal; Product | Empty model/provider allowlist; no silent fallback |
| D-006 (Orca ownership, compatibility, and support decision) | `PROPOSED / OWNER AND CLIENT CONFORMANCE REQUIRED` | [Orca/MCP decision-readiness packet](d006-d007-orca-mcp-decision-readiness.md) (Orca client support and MCP trust/write-back contract) | M4-02 (developer-operated Orca MCP workflow) | Agent Platform; Security; Licensing; Support | Orca MCP integration disabled; OpenHands automation remains independent |
| D-007 (MCP trust, delegated authorization, and write-back decision) | `PROPOSED / OWNER AND IDENTITY INPUTS REQUIRED` | [Orca/MCP decision-readiness packet](d006-d007-orca-mcp-decision-readiness.md) (Orca client support and MCP trust/write-back contract) | MCP-enabled M1 (evidence) and M4 (manual execution) work | Security; Platform Administration; Identity | No general MCP writes; Orca write-back disabled |
| D-008 (trusted VCS controller identity and permissions) | `PROPOSED / OWNER AND PROVIDER PROFILES REQUIRED` | [Delivery-control decision-readiness packet](d008-d010-d011-decision-readiness.md) (trusted VCS, quality/license, and feature-flag profiles) | M3 (repository planning) read/write boundary and M5 (draft PR/MR creation) | Developer Platform; Security; repository owners | Read-only inspection; no push, draft, ready, approval, merge, or deployment |
| D-009 (retention, backup, legal-hold, tombstone, and erasure decision) | `OPEN / 39 POLICY CELLS AND COPY INVENTORY REQUIRED` | [Retention/erasure owner workshop](d009-owner-workshop-guide.md) (class-by-asset retention, copy, hold, backup, and erasure inputs) | M0-04 (protected-object storage) and every non-local activation | Security; Privacy; Legal; Platform/Database Operations | Protected bodies and staging/production activation disabled |
| D-010 (quality, security, license, and waiver policy) | `PROPOSED / TOOL, RULE, LICENSE, AND OWNER INPUTS REQUIRED` | [Delivery-control decision-readiness packet](d008-d010-d011-decision-readiness.md) (trusted VCS, quality/license, and feature-flag profiles) | M5 (quality and Code Readiness) | Application Security; Legal/Licensing; Developer Platform | Critical/Major, non-waivable, unavailable required checks, and unknown licenses block |
| D-011 (OpenFeature backend and delivery conventions) | `OPEN / BACKEND AND PROFILE INPUTS REQUIRED` | [Delivery-control decision-readiness packet](d008-d010-d011-decision-readiness.md) (trusted VCS, quality/license, and feature-flag profiles) | Applicable M5 (feature-delivery contract) work | Platform Operations; Product; Security/Privacy | Runtime-flag delivery blocked without a registered profile |
| D-012 (Docusaurus documentation-delivery profile) | `PROPOSED / REPOSITORY PROFILE INPUTS REQUIRED` | [Delivery and rollout decision-readiness packet](d012-d016-rollout-decision-readiness.md) (documentation, roadmap, budgets, pilot, and KPI/rollout inputs) | M5-12 (Docusaurus documentation slice) | Product Documentation; repository technical owner | Applicable documentation delivery blocked; pilot remains `NOT_APPLICABLE` |
| D-013 (roadmap migration and new-initiative policy) | `PROPOSED / PRODUCT OPERATIONS APPROVAL REQUIRED` | [Delivery and rollout decision-readiness packet](d012-d016-rollout-decision-readiness.md) (documentation, roadmap, budgets, pilot, and KPI/rollout inputs) | M2 (product roadmap and schedule) | Product Operations; data steward; Curve Product | New Curve initiatives only; no inferred import or existing-roadmap mutation |
| D-014 (budget accounting and exception policy) | `PROPOSED / ACCOUNTING AND OWNER INPUTS REQUIRED` | [Delivery and rollout decision-readiness packet](d012-d016-rollout-decision-readiness.md) (documentation, roadmap, budgets, pilot, and KPI/rollout inputs) | Paid M1 (research), M4 (execution), M6 (budget), and R0B work | Product; Finance; Platform Operations; AI Platform | No paid action beyond a separately authorized proof budget; exhaustion pauses |
| D-015 (Loomit SDK Compatibility pilot profile) | `PROPOSED / NAMED PEOPLE AND ENVIRONMENT EVIDENCE REQUIRED` | [Delivery and rollout decision-readiness packet](d012-d016-rollout-decision-readiness.md) (documentation, roadmap, budgets, pilot, and KPI/rollout inputs) | R0A/R0B pilot dispatch | Product and Engineering; CIA/Sachiel technical owners | No coding-agent pilot dispatch |
| D-016 (KPI definitions and rollout guardrails) | `PROPOSED / EVENT DEFINITIONS AND PRODUCT APPROVAL REQUIRED` | [Delivery and rollout decision-readiness packet](d012-d016-rollout-decision-readiness.md) (documentation, roadmap, budgets, pilot, and KPI/rollout inputs) | M6-04 (KPI computation), pilot evaluation, and broad R1 rollout | Product; Analytics/Data; Engineering; AppSec | Baseline instrumentation and binary pilot report only; no broad rollout claim |

## Milestone readiness projection

| Milestone | Decision-ready inputs | Remaining material gates |
| --- | --- | --- |
| M0 (foundation) | D-003 (local runtime topology) is decided; D-009 (retention/erasure) workshop is ready | D-009 (retention/erasure) before M0-04 (protected-object storage) or any staging/production activation |
| M1 (alignment, evidence, PRD, and Gate 1) | D-002 (Onyx delegation), D-004 (Model Gateway), D-005 (model data policy), D-009 (retention/erasure), and D-014 (budget policy) packets are ready | Named Onyx, model/data, retention, and budget decisions for their consuming children |
| M2 (product roadmap and schedule) | D-013 (new-initiative/no-migration policy) packet is ready | Product Operations approval and machine adoption/reference policy |
| M3 (architecture and planning) | D-008 (trusted VCS controller) packet is ready | Trusted VCS identities, allowlists, read/write split, signing, webhook, and reconciliation profiles |
| M4 (agent execution and Orca assistance) | D-006 (Orca support), D-007 (MCP trust), and D-014 (budget policy) packets are ready | Orca/MCP owners and conformance; budget policy; runtime/sandbox activation evidence |
| M5 (quality, VCS, delivery contracts, and Gate 3) | D-008 (trusted VCS), D-010 (quality policy), D-011 (feature flags), and D-012 (documentation delivery) packets are ready | Provider profiles, licensed quality manifest, flag backend/profile, and documentation profile when applicable |
| M6 (prototype, metrics, and optimization) | D-014 (budget policy), D-015 (pilot profile), and D-016 (KPI/rollout policy) packets are ready | Approved budgets, exact pilot profile, KPI event definitions, and rollout guardrails |
| R1 (qualification and rollout) | Every decision has a packet and fail-closed fallback | Every applicable decision decided, AC-01 through AC-60 passed, release/security/recovery/licensing evidence accepted |

## Common materialization rule

After a decision becomes `DECIDED`, its consuming coding packet is still not
dispatchable until it pins:

- the exact Curve decision/contract revision and deterministic context digest;
- one repository, target branch, and exact base SHA;
- named owner and human reviewer;
- scope, non-scope, FR/NFR/AC trace, and Given/When/Then tests;
- exact API/schema/event/workflow/migration contracts;
- commands, sandbox, data, network, model/tool, budget, and credential limits;
- rollback/disablement and evidence invalidation behavior; and
- explicit authorization for every external side effect.

The coding agent stops before mutation when any required field is absent,
ambiguous, stale, or inconsistent with the approved decision.

## Validation state

The five source packets and this index must pass:

- Markdown and heading validation;
- the Curve parenthetical identifier convention;
- Mermaid rendering where present;
- local-link resolution after repository placement;
- external-link verification against official sources;
- decision-to-consumer coverage against the PRD and development plan; and
- exact status checks proving no packet claims `DECIDED` or implementation
  authority before named approval.
