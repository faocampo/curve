# Curve M0 Readiness Board

## Document control

| Field | Value |
| --- | --- |
| Status | Active readiness control; D-001 (Plane upstream foundation decision) and D-003 (runtime topology and trust-zone decision) local profile are decided; M0-S3 is implemented; M0-S4 implementation is in human review; M0-S5 observability contracts are proposed for material approval |
| Version | 1.15 |
| Date | 2026-08-21 |
| Normative product baseline | [Curve PRD v0.12](../curve-ai-native-sdlc-prd.md) (current product requirements, Curve-first shell invariant, decision register, and accepted local Temporal proof) |
| Implementation repository | `git@github.com:faocampo/plane.git` |
| Accepted Plane baseline | Fork `preview` at M0-S3 merge `d99342f589db4eb488695487d3ae3f2c16bf0874`; preserves the approved upstream candidate, M0-S1, M0-S2, M0-03, and M0-S3 in its ancestry |
| Published Curve baseline | Curve PR #17 merged the approved Curve-first shell and M0-S4 Definition/UX artifacts to `main` at `42ea32981a3d5ce814a74c18e458ac8152a7e2fa` |
| Published Plane implementation | Plane PR #5 merged exact M0-S3 head `7fd231b062dc485b37078979a78ec83618be78d8` into fork `preview` at `d99342f589db4eb488695487d3ae3f2c16bf0874` |

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
| [D-001](adr-001-plane-upstream-foundation.md) (Plane upstream, licensing, fork, and upgrade decision) | DECIDED | Curve engineering approver; licensing reviewer | Federico Ocampo, CTO at X3M | Federico Ocampo, Plane support/upgrade owner | No unresolved D-001 action | Owner approval, exact-head dispositions, licensing acceptance, repository boundary, review triggers, Curve merge, and Plane foundation `549db1a...` are recorded. M0-01, M0-S2, M0-03, and M0-S3 completed their accepted proofs; current Plane `preview` is `d99342f...`. |
| [D-003](adr-003-runtime-topology.md) (Temporal topology, connectivity, and trust boundary) | DECIDED and implemented for `LOCAL_ONLY`; activation details OPEN | Platform Operations | Federico Ocampo, CTO at X3M, for connectivity direction | OpenAI Codex under Federico Ocampo's oversight | No local M0-S3 blocker; environment activation remains package-gated | Temporal Python SDK 1.31.0; shared Plane `dev_env`; direct loopback ports; private EKS/VPC/VPN; `ClusterIP`; dedicated namespace by default; internal UI ingress; workload identity/Secrets Manager; authenticated non-local Temporal clients. See [M0-S3 implementation evidence](m0-s3-implementation-evidence.md) (exact context, merge, tests, runtime proof, security acceptance, and rollback). |
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
| P0-01 Plane inventory | DONE | Repository-level capability/license-boundary proof and reuse/build recommendation are approved under D-001; Plane PR #1 established foundation `549db1a...`. M0-01, M0-S2, M0-03, and M0-S3 advanced current `preview` to `d99342f...`. |
| P0-02 topology | DONE_LOCAL / NON_LOCAL_INPUTS_OPEN | The shared-network amendment and M0-S3 implementation are accepted. Non-local activation retains its environment-package inputs. |
| P0-03 ADR set | IN_PROGRESS | D-001 and D-003 `LOCAL_ONLY` are decided; D-007 and D-009 still require named decisions; D-002/D-004-D-006/D-008/D-010-D-016 close just in time. |
| P0-04 documentation/contracts validation | DONE | PRD v0.8 and the accompanying contract/governance suite are merged through Curve PR #2 at `fe8664a...`; post-merge `validate` passed in [run 31888595658](https://github.com/faocampo/curve/actions/runs/31888595658). |
| P0-05 test strategy | READY_FOR_IMPLEMENTATION | May proceed using synthetic fixtures. |
| P0-06 (historical two-stage local Temporal proof) | DONE / SUPERSEDED | Curve PR #9 retired P0-06A and P0-06B as standalone gates. Their historical packet and Git record remain available; M0-S3 supplies the executable local proof. |
| M0-01 module shell | DONE | Plane PR #2 merged at `7685bbc...`; additive migration, disabled-state, workspace isolation, full regression, local-stack restart, and rollback/disablement evidence passed. Project item M0-01 is `Done`. |
| M0-02 core persistence | DONE | Plane PR #3 merged the accepted M0-S2 implementation at `eff8686a...`; workspace-scoped models, migrations, constraints, versioning, and immutable-history tests passed. Project item M0-02 is `Done`. See [M0-S2 implementation evidence](m0-s2-implementation-evidence.md) (exact contract, implementation, tests, and merge binding). |
| M0-03 core policy | DONE | Plane PR #4 merged approved head `a807dd7...` as `922dd6d...`. [M0-03 implementation evidence](m0-03-implementation-evidence.md) (exact contract/context, implementation tree, tests, security acceptance, and rollback) records 113 Curve tests, 629 Plane backend tests, reversible migration proof, monorepo checks/builds, and tree equivalence. Provider-specific policy adapters remain gated by their consuming decisions. |
| M0-04 protected storage | BLOCKED | Requires M0-02, M0-03, and D-009. |
| M0-05 delivery kernel | DONE | Plane PR #3 merged transactional operation/event/outbox/audit/idempotency writes, replay-safe relay primitives, inbox deduplication, recovery, and contract tests. Project item M0-05 is `Done`. |
| M0-S2 local operation/delivery packet | DONE | Contract revision `ab2c81a...`, context digest `sha256:45c266e1...`, approved implementation head `f520075...`, and Plane merge `eff8686a...` are bound in [M0-S2 implementation evidence](m0-s2-implementation-evidence.md) (post-merge acceptance record). |
| M0-S3 local Temporal round trip | DONE | Plane PR #5 merged approved head `7fd231b...` as `d99342f...`; context, tests, runtime, security, migration, replay, restart, cancellation, and rollback are accepted in [M0-S3 implementation evidence](m0-s3-implementation-evidence.md) (post-merge acceptance record). Project status is `Done`. |
| M0-06 Temporal skeleton | IN_PROGRESS / DECOMPOSED | M0-S3 completed the executable first slice. Broader parent/child, continue-as-new, provider-attempt, and reconciliation behavior remains later M0-06 scope. |
| M0-07 API/SSE | IN_PROGRESS | M0-02, M0-03, M0-05, and M0-S3 are satisfied. API, Problem Details, ETag/If-Match, idempotency, pagination, SSE resume, OpenAPI generation, and their acceptance evidence remain engineering work. |
| M0-S4 API/SSE/minimal UI checkpoint | IN_REVIEW | Federico Ocampo owns and reviews the package. UX-004-M0-S4 (clickable prototype and task-based review) and UX-005-M0-S4 (work-package-linked screen contract) were approved at `a463876...` and merged as `42ea329...`. Plane PR #6 implements API, SSE, Curve-first UI, tests, and acceptance evidence at exact head `4803893...`; automated checks are green and human exact-head acceptance remains pending. |
| M0-08 audit/observability | PROPOSED_FOR_MATERIAL_APPROVAL | [M0-S5 observability task packet](m0-s5-observability-task-packet.md) (five telemetry-kernel checkpoints, X3M binding proof, tests, evidence, and rollback) and [telemetry manifest v1](../../contracts/observability/m0-s5-telemetry-v1.json) (Curve-owned TLS/configuration, static private-provider controls, bounded metrics/spans/logs, dashboard, and four application alerts) are materialized for exact-head review. M0-S5A waits for M0-S4 merge/evidence and Federico's exact-head contract approval. M0-S5B additionally waits for OBS-BIND-001 (local X3M OTLP/Prometheus/Grafana binding and independent path-health signal). GitHub Project `In review` is visual metadata. |
| M0-09 provider registry | BLOCKED | M0-05 is satisfied; M0-03, M0-07, and D-007 remain required before MCP enablement. |

## Interim repository-governance configuration

[Curve ruleset 20824868](https://github.com/faocampo/curve/rules/20824868) originally applied to `~ALL` branches with no bypass actor. It enforced branch creation restrictions, pull requests with one approval, linear history, `validate`, CodeQL, code quality, and 90% coverage. On 2026-08-14 it rejected a fast-forward update of the existing documentation PR branch at local commit `9ae80c8...`. The Plane fork reported no repository rulesets.

Federico Ocampo authorized an interim bootstrap configuration on 2026-08-14. The ruleset now targets `~DEFAULT_BRANCH`, retains creation/deletion/non-fast-forward protection, linear history, pull-request enforcement, and strict `validate`, and sets the approval count to zero because the current PR author and interim reviewer are both `faocampo`. CodeQL, code-quality, and coverage rules are deferred until applicable workflows exist. The existing branch then advanced to `2b39e89...` and `validate` passed. Curve retains an exact-head human disposition as a procedural gate, and the approval count returns to one when PRs use a separate trusted-controller or service author identity.

## Approval record

An approval entry must contain decision ID, ADR version/digest, approver name and role, decision time, scope/environment, evidence references, exceptions, and review/expiry date. Repository approval or a chat message without these fields is not sufficient.

Federico Ocampo is the interim human reviewer for every Curve and Plane PR. Each materialized packet records his name and GitHub username `faocampo` unless he assigns another named reviewer. Assignment alone does not satisfy `B-REVIEW`; the exact PR head requires a recorded disposition.

D-001 approval is recorded in [ADR-001](adr-001-plane-upstream-foundation.md#approval-record) and the [GitHub owner approval record](https://github.com/faocampo/curve/pull/1#issuecomment-5302192671). It binds the approved ADR content digest and both exact PR heads; it allocates implementation proof to M0-01 without authorizing packages that have other unresolved blockers.

The original D-003 `LOCAL_ONLY` approval is recorded in
[ADR-003](adr-003-runtime-topology.md) (runtime topology, historical approval,
live amendment, evidence, and rollback) and
[Curve PR #9](https://github.com/faocampo/curve/pull/9) (original exact-head
approval and merge). The 2026-08-20
[private-platform connectivity amendment](d003-private-platform-connectivity-amendment.md)
(shared local network, private EKS direction, controls, and revised proof)
supersedes its two-network implementation contract at merge `aece539...`.
M0-S3 is accepted at Plane merge `d99342f...`; see
[M0-S3 implementation evidence](m0-s3-implementation-evidence.md) (exact
context, merge, tests, runtime proof, security acceptance, and rollback).
P0-06A and P0-06B remain
retired standalone gates. GitHub Project statuses remain administrative visual
tracking.

## Exit criteria

The first coding task may be dispatched only after:

- The documentation baseline is reviewed and committed.
- The Plane upstream-sync branch passes review/CI and its merge SHA is pinned.
- D-001 has named engineering and licensing approval.
- The exact package's other decision dependencies are `DECIDED`.
- Its task packet is `READY` under [development-plan.md](development-plan.md#entry-criteria-for-coding).
- Its unique [GitHub Project #2](https://github.com/users/faocampo/projects/2) visual-tracking item exists under the [project tracking map](github-project-execution-map.md); its current status does not gate dispatch.
