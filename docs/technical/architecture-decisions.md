# Curve Architecture Decision Process

## Document control

| Field | Value |
| ----- | ----- |
| Status | Decision index; D-001 (Plane upstream foundation decision) is decided; D-003 (runtime topology and trust-zone decision) local private-platform profile is decided and implemented; remaining activation scopes and cross-cutting coding-agent execution/authority profiles require owner approval and applicable proof |
| Version | 1.4 |
| Last updated | 2026-08-30 |
| Source | [Curve PRD v0.13 decision register](../curve-ai-native-sdlc-prd.md#decision-register) (controlled product and architecture decisions, approved Product core, Curve-first shell, and accepted local Temporal proof) |
| Audience | Decision owners, architects, security, operations, product, licensing, and AI planning agents |

## Purpose

The PRD leaves D-001 through D-016 (controlled architecture and product decisions) to named X3M owners and records planning-session directions as `PROPOSED` where applicable. Federico Ocampo decided D-001 (Plane upstream foundation decision) on 2026-08-15 after accepting its engineering, community/commercial boundary, licensing, ownership, and exact-head evidence. On 2026-08-18 he decided the original D-003 (runtime topology and trust-zone decision) local scope, approved Temporal Python SDK 1.31.0, retired P0-06A (isolated Temporal feasibility proof) and P0-06B (least-privilege Plane integration proof), and selected M0-S3 (local Temporal round-trip implementation packet) as the executable proof. On 2026-08-20 he approved and merged the [D-003 private-platform connectivity amendment](d003-private-platform-connectivity-amendment.md) (shared local network, private EKS direction, security boundary, and revised proof); M0-S3 then completed its accepted local implementation proof. This document defines how an architecture agent researches and proves proposals, and how an approved decision becomes an implementation prerequisite.

An AI agent may draft an ADR, gather evidence, run non-destructive proofs, and recommend an option. Only the PRD owner for that decision can change status from `OPEN` or `PROPOSED` to `DECIDED`.

## Decision index

| PRD ID | Status | ADR subject | Blocks | Minimum evidence before decision |
| ------ | ------ | ----------- | ------ | -------------------------------- |
| D-001 | DECIDED | [Plane upstream foundation and reuse-versus-build boundary](adr-001-plane-upstream-foundation.md) (approved fork, licensing, reuse, and upgrade strategy) | P0/M0 | Federico Ocampo approved ADR digest `0c780a...`, both exact foundation PR heads, the reuse/license boundary, and the repository/upgrade strategy. Plane foundation `549db1a...` and Curve governance baseline `fe8664a...` are merged. Accepted M0 packages through M0-S9A established checkpoint `af7187d...`; accepted M1-00A and M1-01A advanced current Plane `preview` to `99a73b4eab5ee21fd012d7358bc9259252d47f71`. |
| D-002 | PROPOSED | [Onyx per-operation delegated identity](d002-onyx-delegated-identity-decision-packet.md) (deployed auth/OpenAPI proof, grant options, two-user ACL test, revocation, and decision template) plus [machine decision record](../../contracts/governance/d002-onyx-delegation-v1.json) (computed gaps, proof set, digest-bound approvals, and activation state) | Live/protected M1 knowledge retrieval | The machine record closes only after named Security/Identity and Onyx Operations owners, exact deployed version/OpenAPI/configuration, supported grant and principal binding, read-only endpoints, credential lifecycle, all 12 proof cases, three digest-bound approvals, and zero computed gaps. |
| D-003 | DECIDED and implemented for `LOCAL_ONLY`; environment activation inputs OPEN | [Development/staging/production topology and trust zones](adr-003-runtime-topology.md) (runtime topology, Temporal pins, connectivity, and activation boundary) | M0-S3 (local Temporal round trip)/M0-06 (Temporal workflow skeleton); non-local M0/M4/M6 activation | Temporal Python SDK 1.31.0 remains fixed. The effective 2026-08-20 amendment selects shared Plane `dev_env`, direct loopback ports, private EKS/VPC/VPN, `ClusterIP`, a dedicated namespace by default, internal UI ingress, workload identity/Secrets Manager, and authenticated non-local Temporal clients. [M0-S3 implementation evidence](m0-s3-implementation-evidence.md) (exact context, merge, tests, runtime proof, security acceptance, and rollback) accepts the local proof at Plane merge `d99342f...`. Environment activation still requires persistence, certificate, HA, backup/recovery, capacity, cost, and ownership evidence. |
| D-004 | PROPOSED | Thin Curve Model Gateway over approved OpenRouter access | Model-enabled M1/M3/M5 | Versioned contract, failure behavior, policy enforcement, telemetry, HA impact, license/supply chain, operations proof, replacement strategy. |
| D-005 | PROPOSED | Approved models/providers and data policy | M1/M3/M5 | Task evaluations, classification/residency/training/retention terms, ZDR proof, fallback equivalence, costs, red-team results, owner. |
| D-006 | PROPOSED | Orca developer-operated MCP profile, support, and license | Orca-enabled M4/R1 | Supported client/version, delegated auth, bounded read/write capabilities, ownership, support and license classification, conformance proof. |
| D-007 | PROPOSED | MCP registry, Streamable HTTP, trust, delegation, and pre-authorization | MCP/Orca portions of M0-S9B/M1/M4 | Protocol/version/transport, server identity, delegated auth, tool risk model, scopes, idempotency, state transitions, injection controls, allowlist proof, and dependency ordering with D-006. M0-S9A's local fake-provider substrate is independent. |
| D-008 | PROPOSED | GitHub App and GitLab project-token controller identities and scopes | M3/M5 | Repository scopes, signing/attribution, rotation/revocation, webhook model, allowlists, proof. |
| D-009 | PROPOSED / MACHINE PROPOSAL PUBLISHED | [Retention, deletion, backup, and legal hold](adr-009-retention-and-erasure.md) (asset policy, controlled copies, hold/erasure state machine, and fail-closed behavior) | M0-04 protected storage; protected M1/M4/M6 capabilities; every staging/production activation | [P0-12 decision packet](p0-12-retention-decision-task-packet.md) (owner inputs, machine worksheet, approval protocol, tests, and fail-closed handoff) was published by [Curve PR #30](https://github.com/faocampo/curve/pull/30) (P0-12 retention-policy decision package). Named owners must decide 39 policy cells, eight controlled-copy entries, key/hold/restore/external-copy/failure/cost blocks, and six digest-bound approvals. |
| D-010 | PROPOSED | X3M quality, security, and license baseline | M5 | Licensed tool selection, pinned images/rules, normalized thresholds, non-waivable matrix, suppressions, false-positive baseline, prohibited licenses, update owner. |
| D-011 | OPEN | OpenFeature backend and conventions | M5 | Existing X3M backend inventory, OpenFeature support, environments, audit, targeting/rollout, HA, license, operations proof; Sachiel Flipt profile. |
| D-012 | PROPOSED | Docusaurus integration conventions | M5 | Default branch/owners, auth, build/link/navigation rules, preview/release relationship, failure handling, proof MR. |
| D-013 | PROPOSED | No migration; new Curve initiatives only | M2 | Product Operations approval, reference behavior, reconciliation/rollback implications, future import change process. |
| D-014 | PROPOSED | Conservative R0B workspace/activity budgets and escalation | R0B/M4/M6 | Reservation/concurrency/reconciliation semantics, cost scope, reset/currency, exception expiry, finance approval, denial-of-service analysis. |
| D-015 | PROPOSED | Loomit SDK Compatibility pilot and comparison | R0A/R0B | Approval of CIA external-contract/staging boundary, authoritative OpenAPI/deployment evidence, reversible Sachiel scope, user approvals, data class, metric definitions, support and rollback commitment. |
| D-016 | PROPOSED | Pilot targets and post-three-initiative R1 guardrails | Pilot/R1 rollout | Versioned metric events, numerator/denominator, inclusion/exclusion, binary pilot rule, confidence caveats, owner, review cadence. |

## Cross-cutting execution decisions

The task-packet security model exposes two cross-cutting blockers that are not
new PRD product decisions and therefore do not consume a D-001 through D-016
identifier:

| Blocker | Status | Decision packet | Blocks | Minimum evidence before decision |
| --- | --- | --- | --- | --- |
| B-CODING-TOOLS-01 (local coding-tool execution profile) | PROPOSED | [Local execution and authority decision packet](coding-agent-local-execution-decision.md) (trusted-local versus gVisor profiles, Python/Docker command boundary, security evidence, and rollback) | Machine-`READY` Python/Docker task packets, beginning with RUNTIME-M0-01 (graceful Curve worker shutdown classification) | Selected trust tier, helper owner, exact tool/image versions and digests, argv/path/environment/network/output grammar, adversarial tests, cleanup, and residual-risk acceptance. |
| B-CODING-AUTHORITY-01 (trusted human authority and attempt lease) | PROPOSED | [Local execution and authority decision packet](coding-agent-local-execution-decision.md) (bootstrap authority alternatives, production verifier/lease requirements, and fail-closed behavior) | Implementation dispatch after registry publication and read-only readiness preflight; it does not block `S -> E1..En -> C -> P` publication | Authoritative identity/role and approval/revocation receipt sources, nonce/freshness/replay rules, required roles, atomic attempt-lease provider, lifecycle/recovery tests, kill switch, and named approval. |

An AI agent may prepare these records and prove negative fail-closed behavior.
Only Federico Ocampo, with any reassigned Security/Platform reviewers, may
select the execution and authority profiles.

## Required ADR structure

Every ADR uses this structure:

```markdown
# ADR-NNN: Decision title

- Status: PROPOSED | DECIDED | SUPERSEDED | REJECTED
- PRD decision: D-NNN
- Owner:
- Reviewers:
- Decision date:
- Required by:
- Supersedes:

## Context and constraints
## Decision drivers and weighted criteria
## Options considered
## Evidence and proof results
## Decision
## Security, privacy, licensing, and operational impact
## Data/API/event/migration compatibility impact
## Failure, rollback, and exit strategy
## Implementation consequences and affected work packages
## Validation and review date
```

## ADR acceptance rules

An ADR is `DECIDED` only when:

- The named owner approves it and required specialist reviewers have recorded dispositions.
- It references exact versions, commits, images, licenses, terms, and proofs where applicable.
- Alternatives include the conservative default and a “do nothing/defer” option.
- Security, privacy, residency, supply chain, AGPL/third-party licensing, cost, failure, support, migration, and exit consequences are explicit.
- Its proof reproduces in the approved environment and stores commands/results as evidence.
- It identifies affected schemas, provider capabilities, work packages, acceptance tests, runbooks, and documentation.
- It does not weaken a PRD invariant. A desired conflict requires a PRD revision first.

### Bounded proof authorization and scoped decisions

A named decision owner may approve the scope for a bounded P0 proof while its
ADR remains `OPEN` or `PROPOSED`. Complete execution authorization must bind the proposal digest, named
owner and operator, exact environment, allowed data and mutations, limits,
evidence, stop conditions, cleanup, expiry, and exclusions. Authorization is
permission to collect decision evidence; it is neither proof acceptance nor an
implementation decision.

A scope-only approval does not make the proof `Ready`. Every additional
guardrail or execution field must be approved against the publication PR's
exact head before the proof can pass its remaining packet gates.

An ADR spanning several environments or activation profiles may record
scope-specific states. A package may consume only an exact scope that has met
all ADR acceptance rules and is recorded as `DECIDED`. An accepted local scope
does not decide staging, production, protected-data, provider, or SLA scopes.
The ADR header remains `PROPOSED` while the currently evaluated scope has only
proof authorization.

## Supersession

A changed decision creates a new ADR or a new approved version, never an in-place historical rewrite. The impact assessment identifies active plans, workflows, contexts, stored data, provider connections, deployments, and task packets. Active work remains pinned until an authorized continue, pause, cancel, or re-plan decision.

## AI-agent behavior

An AI architecture or coding agent must:

1. Read the current ADR index and the package's prerequisite list.
2. Treat `OPEN` and `PROPOSED` as blockers when the package says they block.
3. Present options and evidence without representing a recommendation as approval.
4. Avoid installing, provisioning, sending data to, or mutating a candidate provider unless the proof scope is explicitly authorized.
5. Record uncertainty and request an owner decision rather than embedding a default in code.

## Progressive readiness rule

P0 is split into two readiness lanes. `P0A` closes the Plane baseline, repository/runtime topology, documentation/contracts, test strategy, and local Temporal proof required for M0. `P0B` contains integration proofs for gVisor, OpenHands, Onyx, VCS, and quality and must close immediately before the consuming milestone. This split does not waive a decision: a package remains blocked by every decision listed in its own entry criteria.

D-009 (retention, deletion, backup, and legal-hold decision) gates protected-object storage, backup/hold/erasure behavior, and every staging or production activation. Independent local M0 packages may proceed without persisting protected bodies, using synthetic data only. D-004 (model-gateway decision) and D-005 (model/provider data-policy decision) gate model-enabled M1/M3/M5 work, not the model-free local M0 skeleton. D-007 (MCP trust-model decision) remains required by MCP-enabled packages but does not gate M0-S1 through M0-S5 (local skeleton packets) because they expose no MCP capability. D-008 (VCS controller-identity decision) gates VCS-specific work beginning in M3; generic deny-by-default allowlist primitives belong to M0.
