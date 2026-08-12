# Curve M0 Readiness Board

## Document control

| Field | Value |
| --- | --- |
| Status | Active readiness control; approvals pending |
| Version | 1.0 |
| Date | 2026-08-12 |
| Normative product baseline | [Curve PRD v0.6](../curve-ai-native-sdlc-prd.md) |
| Implementation repository | `git@github.com:faocampo/plane.git` |
| Candidate Plane baseline | `d380678912e9b46805ef852d2e05411f1fea6d8b` pending reviewed merge to fork `preview` |

## Readiness rule

A role may prepare evidence, but a named person must approve an ADR before its state becomes `DECIDED`. A coding agent checks this board and the linked ADR before mutation. `PROPOSED`, `OPEN`, or a blank named approver means the dependent package is `BLOCKED`.

The local M0 skeleton uses synthetic data and excludes protected-object storage. D-009 therefore blocks M0-04 and all staging/production activation, but does not block the independent local module, operation, outbox, Temporal, API, UI, or audit packages.

## M0-priority decisions

| Decision | Status | Accountable role | Named approver | Evidence owner | Blocks now | Evidence and next action |
| --- | --- | --- | --- | --- | --- | --- |
| [D-001](adr-001-plane-upstream-foundation.md) | PROPOSED | Curve engineering lead; licensing reviewer | **Required** | Curve engineering | Plane baseline merge; M0-01 | Accept community/commercial inventory, AGPL obligations, upstream support/rebase ownership, and verified candidate evidence. |
| [D-003](adr-003-runtime-topology.md) | PROPOSED | Platform Operations | **Required** | Curve platform engineering | Local Temporal M0-06 beyond an approved proof; every non-local activation | Local stack inventory, immutable dev-image pin, SDK pin, profile contract, and non-local decision matrix are prepared. Approve/authorize local proof; complete non-local cells before staging/production. |
| [D-007](adr-007-mcp-trust-and-orca-profile.md) | PROPOSED | Security; Platform Administration | **Required** | Curve security engineering | MCP-enabled M0-09/M1/M4 | MCP revision, proposed OAuth profile, closed v1.1 tool/result schemas, trust record, transition matrix, and conformance list are prepared. Approve identity/limits and authorize proof. |
| [D-009](adr-009-retention-and-erasure.md) | OPEN | Security; Privacy; Legal | **Required** | Data governance | M0-04; staging/production | Complete and approve the class-by-asset retention/hold/backup/erasure matrix. No period is inferred. |

## Just-in-time decisions

| Decision | Required before | Current state | Accountable role |
| --- | --- | --- | --- |
| D-002 | Protected Onyx retrieval in M1 | PROPOSED | Security and identity owner |
| D-004/D-005 | First model-enabled M1 package | PROPOSED | AI platform, AI governance, security |
| [D-006](adr-006-orca-human-assistance.md) | Orca-enabled M4 | PROPOSED | Agent platform owner |
| D-008 | VCS-specific M3 work | PROPOSED | Developer platform and security |
| D-010 | M5 quality enforcement | PROPOSED | Application Security and legal |
| D-011 | M5 runtime flag delivery | OPEN | Platform Operations |
| D-012-D-016 | Their owning M2/M5/M6/pilot packages | PROPOSED or OPEN | Roles in the decision register |

## Package readiness

| Package | State | Allowed scope or blocker |
| --- | --- | --- |
| P0-01 Plane inventory | IN_REVIEW | Repository-level capability/license-boundary proof and reuse/build recommendation are present; D-001 named engineering/licensing approval, support ownership, reviewed branch publication, and migration/rollback proof remain. |
| P0-02 topology | IN_REVIEW | Exact local Temporal candidate pins/profile and a fail-closed staging/production matrix are documented; named D-003 approval and proof execution remain. |
| P0-03 ADR set | IN_PROGRESS | D-001-D-016 are indexed; named approvals remain. |
| P0-04 documentation/contracts validation | READY_FOR_IMPLEMENTATION | May proceed on the documentation branch. |
| P0-05 test strategy | READY_FOR_IMPLEMENTATION | May proceed using synthetic fixtures. |
| P0-06 local Temporal proof | BLOCKED | Requires named D-003 proof authorization and a pinned Temporal version/image. |
| M0-01 module shell | BLOCKED | Requires D-001 and P0A documentation baseline approval. |
| M0-02 core persistence | BLOCKED | Requires M0-01. |
| M0-03 core policy | BLOCKED | Requires M0-01. |
| M0-04 protected storage | BLOCKED | Requires M0-02, M0-03, and D-009. |
| M0-05 delivery kernel | BLOCKED | Requires M0-02. |
| M0-06 Temporal skeleton | BLOCKED | Requires M0-05 and approved D-003 local profile. |
| M0-07 API/SSE | BLOCKED | Requires M0-02, M0-03, and M0-05. |
| M0-08 audit/observability | BLOCKED | Requires the implemented M0 foundation packages. |
| M0-09 provider registry | BLOCKED | Requires M0-03, M0-05, M0-07, and D-007 before MCP enablement. |

## Approval record

An approval entry must contain decision ID, ADR version/digest, approver name and role, decision time, scope/environment, evidence references, exceptions, and review/expiry date. Repository approval or a chat message without these fields is not sufficient.

## Exit criteria

The first coding task may be dispatched only after:

- The documentation baseline is reviewed and committed.
- The Plane upstream-sync branch passes review/CI and its merge SHA is pinned.
- D-001 has named engineering and licensing approval.
- The exact package's other decision dependencies are `DECIDED`.
- Its task packet is `READY` under [development-plan.md](development-plan.md#entry-criteria-for-coding).
