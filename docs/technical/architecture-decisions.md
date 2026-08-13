# Curve Architecture Decision Process

## Document control

| Field | Value |
| ----- | ----- |
| Status | Decision index; `PROPOSED` directions remain blocked until owner approval and required proof |
| Version | 0.3 |
| Source | [Curve PRD v0.7 decision register](../curve-ai-native-sdlc-prd.md#decision-register) |
| Audience | Decision owners, architects, security, operations, product, licensing, and AI planning agents |

## Purpose

The PRD leaves D-001-D-016 to named X3M owners and records planning-session directions as `PROPOSED` where applicable. The product sponsor has selected the D-001 upstream-baseline direction, but D-001 remains `PROPOSED` until its engineering, deployment, commercial-boundary, licensing, and ownership evidence is accepted. This document defines how an architecture agent researches and proves proposals without silently approving them, and how an approved decision becomes an implementation prerequisite.

An AI agent may draft an ADR, gather evidence, run non-destructive proofs, and recommend an option. Only the PRD owner for that decision can change status from `OPEN` or `PROPOSED` to `DECIDED`.

## Decision index

| PRD ID | Status | ADR subject | Blocks | Minimum evidence before decision |
| ------ | ------ | ----------- | ------ | -------------------------------- |
| D-001 | PROPOSED | [Plane upstream foundation and reuse-versus-build boundary](adr-001-plane-upstream-foundation.md) | P0/M0 | Selected official upstream and safe branch strategy; pinned fork/upstream/candidate commits; 0-ahead/1-behind ancestry; frontend/backend checks and local deployment smoke pass. Still required: full community/commercial proof, license acceptance, and support/upgrade owner. |
| D-002 | PROPOSED | Onyx per-operation delegated identity | M1 | Supported OAuth mechanism, issuer/audience/scopes, token lifetime/revocation, source ACL behavior, durable-wait reauthorization, audit, threat model, proof. |
| D-003 | PROPOSED | Development/staging/production topology and trust zones | M0/M4/M6 | Capacity, residency, HA, RPO/RTO, Kubernetes/gVisor, databases/object storage/Temporal, secrets, backup/restore, cost, ownership. |
| D-004 | PROPOSED | Thin Curve Model Gateway over approved OpenRouter access | Model-enabled M1/M3/M5 | Versioned contract, failure behavior, policy enforcement, telemetry, HA impact, license/supply chain, operations proof, replacement strategy. |
| D-005 | PROPOSED | Approved models/providers and data policy | M1/M3/M5 | Task evaluations, classification/residency/training/retention terms, ZDR proof, fallback equivalence, costs, red-team results, owner. |
| D-006 | PROPOSED | Orca developer-operated MCP profile, support, and license | Orca-enabled M4/R1 | Supported client/version, delegated auth, bounded read/write capabilities, ownership, support and license classification, conformance proof. |
| D-007 | PROPOSED | MCP registry, Streamable HTTP, trust, delegation, and pre-authorization | M0/M1/M4 | Protocol/version/transport, server identity, delegated auth, tool risk model, scopes, idempotency, state transitions, injection controls, and allowlist proof. |
| D-008 | PROPOSED | GitHub App and GitLab project-token controller identities and scopes | M3/M5 | Repository scopes, signing/attribution, rotation/revocation, webhook model, allowlists, proof. |
| D-009 | OPEN | Retention, deletion, backup, and legal hold | M0 production | Data inventory/classes, regulatory/legal input, periods, erasure feasibility, immutable audit split, backup expiry, cost. |
| D-010 | PROPOSED | X3M quality, security, and license baseline | M5 | Licensed tool selection, pinned images/rules, normalized thresholds, non-waivable matrix, suppressions, false-positive baseline, prohibited licenses, update owner. |
| D-011 | OPEN | OpenFeature backend and conventions | M5 | Existing X3M backend inventory, OpenFeature support, environments, audit, targeting/rollout, HA, license, operations proof; Sachiel Flipt profile. |
| D-012 | PROPOSED | Docusaurus integration conventions | M5 | Default branch/owners, auth, build/link/navigation rules, preview/release relationship, failure handling, proof MR. |
| D-013 | PROPOSED | No migration; new Curve initiatives only | M2 | Product Operations approval, reference behavior, reconciliation/rollback implications, future import change process. |
| D-014 | PROPOSED | Conservative R0B workspace/activity budgets and escalation | R0B/M4/M6 | Reservation/concurrency/reconciliation semantics, cost scope, reset/currency, exception expiry, finance approval, denial-of-service analysis. |
| D-015 | PROPOSED | Loomit SDK Compatibility pilot and comparison | R0A/R0B | Approval of CIA external-contract/staging boundary, authoritative OpenAPI/deployment evidence, reversible Sachiel scope, user approvals, data class, metric definitions, support and rollback commitment. |
| D-016 | PROPOSED | Pilot targets and post-three-initiative R1 guardrails | Pilot/R1 rollout | Versioned metric events, numerator/denominator, inclusion/exclusion, binary pilot rule, confidence caveats, owner, review cadence. |

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

D-009 gates protected-object storage, backup/hold/erasure behavior, and every staging or production activation. Independent local M0 packages may proceed without persisting protected bodies, using synthetic data only. D-004 and D-005 gate model-enabled M1/M3/M5 work, not the model-free local M0 skeleton. D-008 gates VCS-specific work beginning in M3; generic deny-by-default allowlist primitives belong to M0.
