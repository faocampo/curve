# Curve M0 Readiness Board

## Document control

| Field | Value |
| --- | --- |
| Status | Active readiness control; D-001 (Plane upstream foundation decision) and D-003 (runtime topology and trust-zone decision) `LOCAL_ONLY` are decided; remaining scoped approvals pending |
| Version | 1.10 |
| Date | 2026-08-18 |
| Normative product baseline | [Curve PRD v0.9](../curve-ai-native-sdlc-prd.md) (current product requirements and decision register) |
| Implementation repository | `git@github.com:faocampo/plane.git` |
| Accepted Plane baseline | Fork `preview` at M0-03 merge `922dd6de5d5ed5081f35cd88343154022867ccad`; preserves the approved upstream candidate, M0-S1, M0-S2, and M0-03 in its ancestry |
| Published Curve baseline | Curve PR #13 merged the reconciled D-003 decision and M0-S3 proof binding to `main` at `af7b5e872512b34516d451e26de312421eea78ec` |
| Published Plane implementation | Plane PR #4 merged exact M0-03 head `a807dd7a3f7b81f13ca815b165fba4f4bc068d9e` into fork `preview` at `922dd6de5d5ed5081f35cd88343154022867ccad` |

## Readiness rule

A role may prepare evidence, but a named person must approve an ADR before its state becomes `DECIDED`. A coding agent checks this board and the linked ADR before mutation. `PROPOSED`, `OPEN`, or a blank named approver means the dependent package is `BLOCKED`.

A named owner may separately authorize a bounded decision proof while its ADR
remains `PROPOSED`. A consuming implementation package remains blocked until
every prerequisite in its current task packet is satisfied and the applicable
decision scope is formally `DECIDED`. GitHub Project status is visual tracking
metadata.

The local M0 skeleton uses synthetic data and excludes protected-object storage. D-009 (retention, deletion, backup, and legal-hold decision) therefore blocks M0-04 (protected-storage work package) and all staging/production activation, but does not block the independent local module, operation, outbox, Temporal, API, UI, or audit packages.

## M0-priority decisions

| Decision | Status | Accountable role | Named approver | Evidence owner | Blocks now | Evidence and next action |
| --- | --- | --- | --- | --- | --- | --- |
| [D-001](adr-001-plane-upstream-foundation.md) (Plane upstream, licensing, fork, and upgrade decision) | DECIDED | Curve engineering approver; licensing reviewer | Federico Ocampo, CTO at X3M | Federico Ocampo, Plane support/upgrade owner | No unresolved D-001 action | Owner approval, exact-head dispositions, licensing acceptance, repository boundary, review triggers, Curve merge, and Plane foundation `549db1a...` are recorded. M0-01 separately completed additive migration, disabled-state, workspace-isolation, and rollback proof; current Plane `preview` is `922dd6d...` after M0-03. |
| [D-003](adr-003-runtime-topology.md) (local Temporal topology, pins, and trust boundary) | DECIDED for `LOCAL_ONLY`; non-local scopes OPEN | Platform Operations | Federico Ocampo, CTO at X3M, for `LOCAL_ONLY` | OpenAI Codex under Federico Ocampo's oversight | M0-S3/M0-06 still require their implementation prerequisites; every non-local activation remains blocked | Approved head `7826f403...`, merge `097016f...`, Temporal Python SDK 1.31.0, Curve-only Compose overlay, `curve-control` and `curve-data` networks, worker environment allowlist, synthetic-only data, rollback, and M0-S3 executable proof. P0-06A/P0-06B are superseded standalone gates. |
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
| P0-01 Plane inventory | DONE | Repository-level capability/license-boundary proof and reuse/build recommendation are approved under D-001; Plane PR #1 established foundation `549db1a...`. M0-01 completed migration/disabled-state/workspace-isolation/rollback evidence in Plane PR #2; M0-S2 and M0-03 advanced current `preview` to `922dd6d...`. |
| P0-02 topology | DONE | Federico Ocampo decided the `LOCAL_ONLY` topology at approved Curve PR #9 head `7826f403...`, merged as `097016f...`. Temporal behavior will be proven by M0-S3; non-local activation remains unauthorized. |
| P0-03 ADR set | IN_PROGRESS | D-001 and the D-003 `LOCAL_ONLY` scope are decided. D-007 and D-009 still require named decisions; D-002/D-004-D-006/D-008/D-010-D-016 close just in time. |
| P0-04 documentation/contracts validation | DONE | PRD v0.8 and the accompanying contract/governance suite are merged through Curve PR #2 at `fe8664a...`; post-merge `validate` passed in [run 31888595658](https://github.com/faocampo/curve/actions/runs/31888595658). |
| P0-05 test strategy | READY_FOR_IMPLEMENTATION | May proceed using synthetic fixtures. |
| P0-06 (historical two-stage local Temporal proof) | DONE / SUPERSEDED | Curve PR #9 retired P0-06A and P0-06B as standalone gates. Their historical packet and Git record remain available; M0-S3 supplies the executable local proof. |
| M0-01 module shell | DONE | Plane PR #2 merged at `7685bbc...`; additive migration, disabled-state, workspace isolation, full regression, local-stack restart, and rollback/disablement evidence passed. Project item M0-01 is `Done`. |
| M0-02 core persistence | DONE | Plane PR #3 merged the accepted M0-S2 implementation at `eff8686a...`; workspace-scoped models, migrations, constraints, versioning, and immutable-history tests passed. Project item M0-02 is `Done`. See [M0-S2 implementation evidence](m0-s2-implementation-evidence.md) (exact contract, implementation, tests, and merge binding). |
| M0-03 core policy | DONE | Plane PR #4 merged approved head `a807dd7...` as `922dd6d...`. [M0-03 implementation evidence](m0-03-implementation-evidence.md) (exact contract/context, implementation tree, tests, security acceptance, and rollback) records 113 Curve tests, 629 Plane backend tests, reversible migration proof, monorepo checks/builds, and tree equivalence. Provider-specific policy adapters remain gated by their consuming decisions. |
| M0-04 protected storage | BLOCKED | Requires M0-02, M0-03, and D-009. |
| M0-05 delivery kernel | DONE | Plane PR #3 merged transactional operation/event/outbox/audit/idempotency writes, replay-safe relay primitives, inbox deduplication, recovery, and contract tests. Project item M0-05 is `Done`. |
| M0-S2 local operation/delivery packet | DONE | Contract revision `ab2c81a...`, context digest `sha256:45c266e1...`, approved implementation head `f520075...`, and Plane merge `eff8686a...` are bound in [M0-S2 implementation evidence](m0-s2-implementation-evidence.md) (post-merge acceptance record). |
| M0-S3 local Temporal round trip | READY_AFTER_MERGE | D-003 `LOCAL_ONLY`, M0-03, owner/reviewer, Plane base `922dd6d...`, approved SDK/topology, commands, rollback, and Project item `PVTI_lAHOBNjuQc4BgZzOzg3CeqQ` are resolved. Merge this exact dispatch revision, materialize its deterministic context manifest into Plane before mutation, and verify live `preview` still matches. |
| M0-06 Temporal skeleton | READY_AFTER_MERGE | M0-S3 is the executable first slice of this decomposed package. It may start after the exact dispatch revision and context digest are materialized; broader parent/child workflow behavior remains later M0-06 scope. |
| M0-07 API/SSE | READY_FOR_PACKET_RECONCILIATION | M0-02, M0-03, and M0-05 are satisfied. M0-S4 still requires completed M0-S3 plus its own exact base/context materialization. |
| M0-08 audit/observability | BLOCKED | Requires the implemented M0 foundation packages. |
| M0-09 provider registry | BLOCKED | M0-05 is satisfied; M0-03, M0-07, and D-007 remain required before MCP enablement. |

## Interim repository-governance configuration

[Curve ruleset 20824868](https://github.com/faocampo/curve/rules/20824868) originally applied to `~ALL` branches with no bypass actor. It enforced branch creation restrictions, pull requests with one approval, linear history, `validate`, CodeQL, code quality, and 90% coverage. On 2026-08-14 it rejected a fast-forward update of the existing documentation PR branch at local commit `9ae80c8...`. The Plane fork reported no repository rulesets.

Federico Ocampo authorized an interim bootstrap configuration on 2026-08-14. The ruleset now targets `~DEFAULT_BRANCH`, retains creation/deletion/non-fast-forward protection, linear history, pull-request enforcement, and strict `validate`, and sets the approval count to zero because the current PR author and interim reviewer are both `faocampo`. CodeQL, code-quality, and coverage rules are deferred until applicable workflows exist. The existing branch then advanced to `2b39e89...` and `validate` passed. Curve retains an exact-head human disposition as a procedural gate, and the approval count returns to one when PRs use a separate trusted-controller or service author identity.

## Approval record

An approval entry must contain decision ID, ADR version/digest, approver name and role, decision time, scope/environment, evidence references, exceptions, and review/expiry date. Repository approval or a chat message without these fields is not sufficient.

Federico Ocampo is the interim human reviewer for every Curve and Plane PR. Each materialized packet records his name and GitHub username `faocampo` unless he assigns another named reviewer. Assignment alone does not satisfy `B-REVIEW`; the exact PR head requires a recorded disposition.

D-001 approval is recorded in [ADR-001](adr-001-plane-upstream-foundation.md#approval-record) and the [GitHub owner approval record](https://github.com/faocampo/curve/pull/1#issuecomment-5302192671). It binds the approved ADR content digest and both exact PR heads; it allocates implementation proof to M0-01 without authorizing packages that have other unresolved blockers.

D-003 `LOCAL_ONLY` is recorded in [ADR-003](adr-003-runtime-topology.md)
(approved local Temporal topology, pins, networks, evidence, and rollback) and
[Curve PR #9](https://github.com/faocampo/curve/pull/9). Federico Ocampo
approved exact head `7826f403...`; green CI preceded squash merge `097016f...`.
M0-S3 is the executable proof. P0-06A and P0-06B are superseded standalone
gates. GitHub Project statuses remain administrative visual tracking.

## Exit criteria

The first coding task may be dispatched only after:

- The documentation baseline is reviewed and committed.
- The Plane upstream-sync branch passes review/CI and its merge SHA is pinned.
- D-001 has named engineering and licensing approval.
- The exact package's other decision dependencies are `DECIDED`.
- Its task packet is `READY` under [development-plan.md](development-plan.md#entry-criteria-for-coding).
- Its unique [GitHub Project #2](https://github.com/users/faocampo/projects/2) visual-tracking item exists under the [project tracking map](github-project-execution-map.md); its current status does not gate dispatch.
