# Curve M0 Readiness Board

## Document control

| Field | Value |
| --- | --- |
| Status | Active readiness control; approvals pending |
| Version | 1.3 |
| Date | 2026-08-14 |
| Normative product baseline | [Curve PRD v0.7](../curve-ai-native-sdlc-prd.md) |
| Implementation repository | `git@github.com:faocampo/plane.git` |
| Candidate Plane baseline | `d380678912e9b46805ef852d2e05411f1fea6d8b` pending reviewed merge to fork `preview` |
| Published Curve baseline | `docs/m0-code-readiness-2026-08-12` at `2b39e89bcf0a46bd5feff3ffc6e56c1cc00b0bd0`; review pending; `validate` passed |
| Published Plane candidate | `curve/plane-upstream-sync-2026-08-12` at `d380678912e9b46805ef852d2e05411f1fea6d8b`; review and merge pending |

## Readiness rule

A role may prepare evidence, but a named person must approve an ADR before its state becomes `DECIDED`. A coding agent checks this board and the linked ADR before mutation. `PROPOSED`, `OPEN`, or a blank named approver means the dependent package is `BLOCKED`.

The local M0 skeleton uses synthetic data and excludes protected-object storage. D-009 therefore blocks M0-04 and all staging/production activation, but does not block the independent local module, operation, outbox, Temporal, API, UI, or audit packages.

## M0-priority decisions

| Decision | Status | Accountable role | Named approver | Evidence owner | Blocks now | Evidence and next action |
| --- | --- | --- | --- | --- | --- | --- |
| [D-001](adr-001-plane-upstream-foundation.md) | PROPOSED | Curve engineering approver; licensing reviewer | Federico Ocampo, CTO at X3M (both roles assigned; formal decision pending) | Federico Ocampo, Plane support/upgrade owner | Plane baseline merge; M0-01 | Federico's review of both exact PR heads, formal ADR approval record, branch merge, and additive migration/rollback proof remain. |
| [D-003](adr-003-runtime-topology.md) | PROPOSED | Platform Operations | **Required** | Curve platform engineering | Local Temporal M0-06 beyond an approved proof; every non-local activation | Local stack inventory, immutable dev-image pin, SDK pin, profile contract, and non-local decision matrix are prepared. Approve/authorize local proof; complete non-local cells before staging/production. |
| [D-007](adr-007-mcp-trust-and-orca-profile.md) | PROPOSED | Security; Platform Administration | **Required** | Curve security engineering | MCP-enabled M0-09/M1/M4 | MCP revision, proposed OAuth profile, closed v1.1 tool/result schemas, trust record, transition matrix, and conformance list are prepared. Approve identity/limits and authorize proof. |
| [D-009](adr-009-retention-and-erasure.md) | OPEN | Security; Privacy; Legal | **Required** | Data governance | M0-04; staging/production | Asset inventory, owner-fillable period/backup/hold matrix, erasure state machine, policy precedence and acceptance proof are prepared. Named owners must resolve every `TBD`; no period is inferred. |

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
| P0-01 Plane inventory | IN_REVIEW | Repository-level capability/license-boundary proof and reuse/build recommendation are present and the candidate branch is published. Federico Ocampo is assigned as engineering approver, licensing reviewer, support/upgrade owner, and interim human reviewer for both PRs. Formal D-001 approval, review disposition, merge, and migration/rollback proof remain. |
| P0-02 topology | IN_REVIEW | Exact local Temporal candidate pins/profile and a fail-closed staging/production matrix are documented; named D-003 approval and proof execution remain. |
| P0-03 ADR set | IN_PROGRESS | M0-priority D-001/D-003/D-007/D-009 packets are decision-ready; named approvals and authorized proofs remain. D-002/D-004-D-006/D-008/D-010-D-016 close just in time. |
| P0-04 documentation/contracts validation | IN_REVIEW | PRD v0.7, OpenAPI, 16 M0 JSON Schemas, positive/negative fixtures, Temporal/MCP contracts, traceability, validators, dispatch packets, ownership assignments, and GitHub Project governance are published at `2b39e89...`; required `validate` passed in [run 31856435020](https://github.com/faocampo/curve/actions/runs/31856435020). Federico's exact-head review disposition remains. |
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

## Interim repository-governance configuration

[Curve ruleset 20824868](https://github.com/faocampo/curve/rules/20824868) originally applied to `~ALL` branches with no bypass actor. It enforced branch creation restrictions, pull requests with one approval, linear history, `validate`, CodeQL, code quality, and 90% coverage. On 2026-08-14 it rejected a fast-forward update of the existing documentation PR branch at local commit `9ae80c8...`. The Plane fork reported no repository rulesets.

Federico Ocampo authorized an interim bootstrap configuration on 2026-08-14. The ruleset now targets `~DEFAULT_BRANCH`, retains creation/deletion/non-fast-forward protection, linear history, pull-request enforcement, and strict `validate`, and sets the approval count to zero because the current PR author and interim reviewer are both `faocampo`. CodeQL, code-quality, and coverage rules are deferred until applicable workflows exist. The existing branch then advanced to `2b39e89...` and `validate` passed. Curve retains an exact-head human disposition as a procedural gate, and the approval count returns to one when PRs use a separate trusted-controller or service author identity.

## Approval record

An approval entry must contain decision ID, ADR version/digest, approver name and role, decision time, scope/environment, evidence references, exceptions, and review/expiry date. Repository approval or a chat message without these fields is not sufficient.

Federico Ocampo is the interim human reviewer for every Curve and Plane PR. Each materialized packet records his name and GitHub username `faocampo` unless he assigns another named reviewer. Assignment alone does not satisfy `B-REVIEW`; the exact PR head requires a recorded disposition.

## Exit criteria

The first coding task may be dispatched only after:

- The documentation baseline is reviewed and committed.
- The Plane upstream-sync branch passes review/CI and its merge SHA is pinned.
- D-001 has named engineering and licensing approval.
- The exact package's other decision dependencies are `DECIDED`.
- Its task packet is `READY` under [development-plan.md](development-plan.md#entry-criteria-for-coding).
- Its unique [GitHub Project #2](https://github.com/users/faocampo/projects/2) item is `Ready` under the [project execution map](github-project-execution-map.md).
