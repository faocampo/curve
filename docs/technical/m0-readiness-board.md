# Curve M0 Readiness Board

## Document control

| Field | Value |
| --- | --- |
| Status | Active readiness control; D-001 (Plane upstream foundation decision) merged; D-003 (runtime topology and trust-zone decision) two-stage local proof direction approved and both executions gated; remaining scoped approvals pending |
| Version | 1.8 |
| Date | 2026-08-18 |
| Normative product baseline | [Curve PRD v0.8](../curve-ai-native-sdlc-prd.md) |
| Implementation repository | `git@github.com:faocampo/plane.git` |
| Accepted Plane baseline | Fork `preview` at M0-S2 merge `eff8686a69aa112ea8fda79be0e1316dc1fd97d6`; preserves the approved upstream candidate, M0-S1, and M0-S2 in its ancestry |
| Published Curve baseline | PR #5 merged the M0-S2 contract revision to `main` at `ab2c81a33ede719c02ff0a2a6ab35eabcf304de1` |
| Published Plane implementation | PR #3 merged exact M0-S2 head `f520075493290389aa54532baec36268c34e2885` into fork `preview` at `eff8686a69aa112ea8fda79be0e1316dc1fd97d6` |

## Readiness rule

A role may prepare evidence, but a named person must approve an ADR before its state becomes `DECIDED`. A coding agent checks this board and the linked ADR before mutation. `PROPOSED`, `OPEN`, or a blank named approver means the dependent package is `BLOCKED`.

A named owner may separately authorize a bounded P0 decision-proof while its
ADR remains `PROPOSED`. Each stage of a multi-stage proof requires its own
complete authorization, immutable packet and harness, merged context, preflight,
claim, bounded execution and VCS authority, signed broker start grant, immutable
evidence, and exact-evidence-head review. GitHub Project status is visual
tracking metadata and is outside these controls. Only a conformant broker's
signed start grant, issued after claim-time ruleset and authorization
revalidation, activates execution.
A consuming implementation package remains blocked until every required stage
is accepted and its decision scope is formally `DECIDED`.

The local M0 skeleton uses synthetic data and excludes protected-object storage. D-009 (retention, deletion, backup, and legal-hold decision) therefore blocks M0-04 (protected-storage work package) and all staging/production activation, but does not block the independent local module, operation, outbox, Temporal, API, UI, or audit packages.

## M0-priority decisions

| Decision | Status | Accountable role | Named approver | Evidence owner | Blocks now | Evidence and next action |
| --- | --- | --- | --- | --- | --- | --- |
| [D-001](adr-001-plane-upstream-foundation.md) (Plane upstream, licensing, fork, and upgrade decision) | DECIDED | Curve engineering approver; licensing reviewer | Federico Ocampo, CTO at X3M | Federico Ocampo, Plane support/upgrade owner | No unresolved D-001 action | Owner approval, exact-head dispositions, licensing acceptance, repository boundary, review triggers, Curve merge, and Plane foundation `549db1a...` are recorded. M0-01 separately completed additive migration, disabled-state, workspace-isolation, and rollback proof; current Plane `preview` is `eff8686a...` after M0-S2. |
| [D-003](adr-003-runtime-topology.md) | PROPOSED; two-stage `LOCAL_ONLY` proof direction approved | Platform Operations | Federico Ocampo, CTO at X3M, for `LOCAL_ONLY` | OpenAI Codex under Federico Ocampo's oversight | P0-06A and P0-06B remain gated; M0-S3/M0-06 and every non-local activation remain blocked | The local sections at proposal revision `cac4dcac...`, exact upstream pins, synthetic-only boundary, owner/operator, and two-stage response are approved. P0-06A cannot decide D-003. P0-06B requires a separate least-privilege design and approval; only accepted P0-06B evidence can support the local decision. |
| [D-007](adr-007-mcp-trust-and-orca-profile.md) | PROPOSED | Security; Platform Administration | **Required** | Curve security engineering | MCP-enabled M0-09/M1/M4 | Trust-record and typed-error contracts, identity/limit decisions, complete conformance fixtures, and dependency ordering with D-006 remain unresolved. No MCP package may proceed until the named owners decide the applicable scope. |
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
| P0-01 Plane inventory | DONE | Repository-level capability/license-boundary proof and reuse/build recommendation are approved under D-001; Plane PR #1 established foundation `549db1a...`. M0-01 completed migration/disabled-state/workspace-isolation/rollback evidence in Plane PR #2; M0-S2 advanced current `preview` to `eff8686a...`. |
| P0-02 topology | DONE | Federico Ocampo approved the local sections and two-stage proof direction, published through Curve PR #3 at `41373e8...`. Completion records the proposal boundary only; it does not claim Temporal works, decide D-003/shared-network topology, or authorize non-local activation. |
| P0-03 ADR set | IN_PROGRESS | D-001 is decided and D-003 has a two-stage local proof direction. Exact P0-06A/P0-06B authorization and evidence, D-007, and D-009 still require their named decisions/proofs; D-002/D-004-D-006/D-008/D-010-D-016 close just in time. |
| P0-04 documentation/contracts validation | DONE | PRD v0.8 and the accompanying contract/governance suite are merged through Curve PR #2 at `fe8664a...`; post-merge `validate` passed in [run 31888595658](https://github.com/faocampo/curve/actions/runs/31888595658). |
| P0-05 test strategy | READY_FOR_IMPLEMENTATION | May proceed using synthetic fixtures. |
| P0-06 (two-stage local Temporal proof) | BLOCKED | P0-06A (isolated Temporal feasibility proof) awaits exact-head packet publication, committed/reviewed harness and immutable image, a complete immutable authorization bundle, recomputed artifacts and app-bound ordered CI, trusted controller, conformant independent start-grant and operation broker, Security incident owner, active exact-tag ruleset with approved live digest/no bypass, workstation preflight, claim-time ruleset recheck, and atomic claim. The broker/GitHub App must execute or sign and dispatch every exact VCS or execution operation while exposing only opaque lease handles and signed receipts to the controller. A dispatched claim requires its outcome-specific ticket/start-grant terminal state and reviewed evidence. GitHub Project status may be updated independently for visual tracking and is not part of the proof authorization or evidence contract. P0-06B (least-privilege Plane integration proof) is unplanned and unauthorized. |
| M0-01 module shell | DONE | Plane PR #2 merged at `7685bbc...`; additive migration, disabled-state, workspace isolation, full regression, local-stack restart, and rollback/disablement evidence passed. Project item M0-01 is `Done`. |
| M0-02 core persistence | DONE | Plane PR #3 merged the accepted M0-S2 implementation at `eff8686a...`; workspace-scoped models, migrations, constraints, versioning, and immutable-history tests passed. Project item M0-02 is `Done`. See [M0-S2 implementation evidence](m0-s2-implementation-evidence.md) (exact contract, implementation, tests, and merge binding). |
| M0-03 core policy | READY_FOR_SECURITY_REVIEW | [M0-03 core policy task packet](m0-03-core-policy-task-packet.md) (exact Plane base, material security decisions, acceptance tests, commands, and rollback), [M0-03 relational contract](../../contracts/database/m0-03-policy-contract.md) (append-only decisions, evaluation order, transactions, and migration), and machine schemas/manifest are materialized. Federico Ocampo must approve the exact published Curve head and authorize merge before Plane code dispatch. Provider-specific policy adapters remain gated by their consuming decisions. |
| M0-04 protected storage | BLOCKED | Requires M0-02, M0-03, and D-009. |
| M0-05 delivery kernel | DONE | Plane PR #3 merged transactional operation/event/outbox/audit/idempotency writes, replay-safe relay primitives, inbox deduplication, recovery, and contract tests. Project item M0-05 is `Done`. |
| M0-S2 local operation/delivery packet | DONE | Contract revision `ab2c81a...`, context digest `sha256:45c266e1...`, approved implementation head `f520075...`, and Plane merge `eff8686a...` are bound in [M0-S2 implementation evidence](m0-s2-implementation-evidence.md) (post-merge acceptance record). |
| M0-06 Temporal skeleton | BLOCKED | Requires M0-05, accepted P0-06B integration evidence, and a decided D-003 local profile. |
| M0-07 API/SSE | BLOCKED | M0-02 and M0-05 are satisfied; M0-03 remains required. |
| M0-08 audit/observability | BLOCKED | Requires the implemented M0 foundation packages. |
| M0-09 provider registry | BLOCKED | M0-05 is satisfied; M0-03, M0-07, and D-007 remain required before MCP enablement. |

## Interim repository-governance configuration

[Curve ruleset 20824868](https://github.com/faocampo/curve/rules/20824868) originally applied to `~ALL` branches with no bypass actor. It enforced branch creation restrictions, pull requests with one approval, linear history, `validate`, CodeQL, code quality, and 90% coverage. On 2026-08-14 it rejected a fast-forward update of the existing documentation PR branch at local commit `9ae80c8...`. The Plane fork reported no repository rulesets.

Federico Ocampo authorized an interim bootstrap configuration on 2026-08-14. The ruleset now targets `~DEFAULT_BRANCH`, retains creation/deletion/non-fast-forward protection, linear history, pull-request enforcement, and strict `validate`, and sets the approval count to zero because the current PR author and interim reviewer are both `faocampo`. CodeQL, code-quality, and coverage rules are deferred until applicable workflows exist. The existing branch then advanced to `2b39e89...` and `validate` passed. Curve retains an exact-head human disposition as a procedural gate, and the approval count returns to one when PRs use a separate trusted-controller or service author identity.

## Approval record

An approval entry must contain decision ID, ADR version/digest, approver name and role, decision time, scope/environment, evidence references, exceptions, and review/expiry date. Repository approval or a chat message without these fields is not sufficient.

Federico Ocampo is the interim human reviewer for every Curve and Plane PR. Each materialized packet records his name and GitHub username `faocampo` unless he assigns another named reviewer. Assignment alone does not satisfy `B-REVIEW`; the exact PR head requires a recorded disposition.

D-001 approval is recorded in [ADR-001](adr-001-plane-upstream-foundation.md#approval-record) and the [GitHub owner approval record](https://github.com/faocampo/curve/pull/1#issuecomment-5302192671). It binds the approved ADR content digest and both exact PR heads; it allocates implementation proof to M0-01 without authorizing packages that have other unresolved blockers.

D-003 `LOCAL_ONLY` proof direction is recorded in
[ADR-003](adr-003-runtime-topology.md#local-proof-scope-and-two-stage-approval-record)
and the [P0-06 task packet](p0-06-local-temporal-proof-task-packet.md). It binds
Federico Ocampo as scoped decision owner, OpenAI Codex as operator, the local
sections at revision `cac4dcac...`, exact upstream pins, synthetic-only data,
and the P0-06A (isolated Temporal feasibility proof)/P0-06B (least-privilege
Plane integration proof) separation. Three exact heads carry execution approval
before Stage A: this publication PR, the immutable harness PR, and the immutable
authorization-bundle/attempt-authorization PR. A fourth one-file PR receives
repository-integrity review and projects their non-self-referential evidence.
Together they bind the proposed authorization ID, dates, limits,
controller/ticket/start-grant contract, bounded execution and VCS lease profiles,
exclusions, claim, fixed evidence branches, cleanup, immutable evidence review,
and publication evidence. GitHub Project statuses are administrative visual
tracking and are outside those leases. The conformant broker's signed start grant
activates execution only after its claim-time ruleset and authorization recheck.
P0-06B has no authorization.
All execution and decision effects remain pending.

## Exit criteria

The first coding task may be dispatched only after:

- The documentation baseline is reviewed and committed.
- The Plane upstream-sync branch passes review/CI and its merge SHA is pinned.
- D-001 has named engineering and licensing approval.
- The exact package's other decision dependencies are `DECIDED`.
- Its task packet is `READY` under [development-plan.md](development-plan.md#entry-criteria-for-coding).
- Its unique [GitHub Project #2](https://github.com/users/faocampo/projects/2) visual-tracking item exists under the [project tracking map](github-project-execution-map.md); its current status does not gate dispatch.
