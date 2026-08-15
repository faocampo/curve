# Curve Technical Documentation

## Purpose

This directory is the architecture and implementation handoff derived from the [Curve PRD v0.8](../curve-ai-native-sdlc-prd.md). Together, these documents define the logical system, data model, workflows, integration boundaries, security posture, engineering patterns, technology decisions, and dependency-ordered development plan needed by human engineers and AI coding agents.

The suite is implementation-oriented. D-001 is owner-approved and recorded as `DECIDED`; other agreed planning directions remain `PROPOSED` until their named owners approve them. A coding work package remains blocked until all of its required decisions and ADRs are `DECIDED` and its remaining entry criteria pass.

## Document set

| Document | Purpose | Primary authority |
| -------- | ------- | ----------------- |
| [Architecture](architecture.md) | Logical components, deployment profiles, trust zones, data/control flow, storage, orchestration, and operability | Component ownership and boundaries |
| [C4 architecture views](c4-architecture.md) | System context, containers, module components, actors, and relationships | Navigational diagrams derived from the Architecture and component contracts |
| [Domain model](domain-model.md) | Aggregates, entities, fields, cardinalities, invariants, persistence, versioning, and deletion | Curve data semantics |
| [Workflows and sequences](workflows-and-sequences.md) | Initiative, slice, agent, quality, VCS, contract, recovery, and Temporal execution flows | State-transition and orchestration behavior |
| [Integration contracts](integration-contracts.md) | Public API, commands, events, SSE, webhooks, adapters, idempotency, and reconciliation | Wire and provider boundaries |
| [Security and operations](security-and-operations.md) | Identity, authorization, data/evidence policy, isolation, threats, incident response, and service objectives | Security and production controls |
| [Engineering patterns and technologies](engineering-patterns-and-technologies.md) | Required implementation patterns, Plane extension strategy, technology baseline/candidates, and ADR rules | Engineering conventions and technology use |
| [Architecture decisions](architecture-decisions.md) | D-001-D-016 evidence, ownership, decision, and supersession process | ADR prerequisites and decision governance |
| [Development plan](development-plan.md) | Milestones, work packages, dependencies, traceability, tests, task packets, and AI-agent protocol | Delivery sequencing and Definition of Done |
| [Kanban delivery lifecycle](kanban-delivery-lifecycle.md) | User-facing delivery-board statuses from definition through monitored customer use and closure | Kanban projection and state-transition evidence |
| [M7 intelligence and automation extension](m7-intelligence-and-automation-extension.md) | Post-R1 charter for AI-expense governance, Gmail/Slack attention intake, and scheduled AI-agent jobs | Future-extension scope and entry gates; does not expand the active 70-item catalog |
| [Implementation-readiness review](review-analysis-and-remediation.md) | Prioritized gaps, closure evidence, owners, dependencies, and remediation status | Review record; never overrides the PRD or approved ADRs |
| [Plane foundation inventory](plane-foundation-inventory.md) | Selected upstream strategy, exact fork/upstream pins, candidate verification, community reuse/build matrix, commercial safeguards, and closure checks | Approved D-001 evidence; fork `preview` pinned at `549db1a...` |
| [ADR-001: Plane upstream foundation](adr-001-plane-upstream-foundation.md) | Decided updateable upstream baseline, fork workflow, proof results, consequences, rollback, approval, and review triggers | D-001 decision record; `DECIDED` on 2026-08-15 |
| [ADR-003: Runtime topology](adr-003-runtime-topology.md) | Proposed local/non-local Temporal and Curve runtime boundary | D-003 decision packet; owner approval pending |
| [ADR-006: Orca human assistance](adr-006-orca-human-assistance.md) | Proposed developer-operated Orca MCP integration boundary | D-006 decision packet; owner/licensing approval pending |
| [ADR-007: MCP and Orca profile](adr-007-mcp-trust-and-orca-profile.md) | Proposed MCP trust registry and developer-operated Orca write-back allowlist | D-007 decision packet; security/platform approval pending |
| [ADR-009: Retention and erasure](adr-009-retention-and-erasure.md) | Required data-class/asset retention, hold, backup, and erasure decision | D-009 remains open and blocks protected storage/non-local activation |
| [M0 readiness board](m0-readiness-board.md) | Decision, package, owner, evidence, and blocking-state control | Operational coding-readiness source |
| [M0 authorization/state matrices](m0-authorization-and-state-matrices.md) | Core roles, authorization inputs, operation transitions, and Orca tool effects | M0 policy/state contract |
| [M0 traceability](m0-traceability.md) | Requirement-to-contract-to-test ownership | M0 verification control |
| [M0 local task packets](m0-local-skeleton-task-packets.md) | Independently reviewable Plane-fork implementation packages | Dispatch specification; blocked until entry criteria pass |
| [GitHub Project execution map](github-project-execution-map.md) | One-to-one mapping and status synchronization for all 70 development-plan packages in Curve GitHub Project #2 | Mandatory execution index before package dispatch |
| [Machine-readable contracts](../../contracts/README.md) | OpenAPI, JSON Schema, MCP, SSE, provider, operation, and Temporal contracts | Normative wire/schema source |

## Authority and conflict order

1. The PRD's scope invariants, numbered requirements, and acceptance criteria.
2. Approved ADRs resolving D-001-D-016.
3. Normative state/cardinality/security rules in this suite.
4. Generated and approved OpenAPI, event, JSON Schema, and provider-contract artifacts.
5. The development backlog and individual task packets.

A lower item cannot weaken a higher item. When a conflict is found, implementation stops, the conflict is recorded, and the owning document is corrected and reviewed. Silent interpretation by an AI coding agent is prohibited.

## Reading order

1. Read the PRD and its decision register.
2. Read Architecture, C4 Architecture Views, and Domain Model to understand boundaries and truth ownership.
3. Read Workflows and Sequences with Integration Contracts to understand commands, states, events, and failure behavior.
4. Read Security and Operations before selecting credentials, providers, destinations, runners, or deployment topology.
5. Read Engineering Patterns and Technologies before creating component designs or code conventions.
6. Use the Development Plan to materialize approved, repository-local task packets.

## Documentation dependency map

```mermaid
flowchart TD
    prd["Curve PRD v0.8"] --> decisions["D-001 through D-016 and ADRs"]
    prd --> architecture[Architecture]
    architecture --> c4["C4 architecture views"]
    prd --> domain[Domain model]
    architecture --> workflows[Workflows and sequences]
    domain --> workflows
    architecture --> integrations[Integration contracts]
    domain --> integrations
    architecture --> security[Security and operations]
    integrations --> security
    decisions --> technology["Engineering patterns and technologies"]
    architecture --> technology
    domain --> plan[Development plan]
    workflows --> plan
    integrations --> plan
    security --> plan
    technology --> plan
    decisions --> plan
```

## Versioning

- Each document has its own version and source PRD version.
- A behavioral or wire-contract change increments the affected document and schema versions and includes migration/compatibility impact.
- A clarification with no behavior change may increment the patch version.
- Active task packets pin exact document, ADR, schema, policy, repository-base, and context versions.
- Updating documentation never changes an active task silently; the PRD impact process decides continue-pinned, pause, cancel, or re-plan.

## Architecture readiness versus coding readiness

This suite may be used to complete architecture while some decision-register items remain open. It is coding-ready only package by package:

- The package's decision prerequisites are approved.
- Its component, domain, API/event, workflow, security, migration, and test contracts are complete.
- It has one target repository and pinned base SHA.
- Its task packet meets the Development Plan entry criteria.

## Contract and generated artifacts

The normative M0 contract source is now versioned under [`contracts/`](../../contracts/README.md). Implementations and generated clients must record the exact Curve repository commit. Later milestones add:

- Generated API examples/clients from the Curve OpenAPI document.
- Additional JSON Schemas for Context Manifests, task packets, policy, and delivery contracts.
- Temporal workflow compatibility/replay fixtures.
- Provider adapter conformance suites and fake providers.
- Database migration and ERD outputs.
- Threat model and data-flow diagrams.
- SBOMs, provenance attestations, third-party notices, and corresponding-source manifest.
- Acceptance trace report for AC-01-AC-60.

Generated implementation paths in Plane depend on the reviewed D-001 module mapping; the normative source remains in the Curve repository.
