# M0-S6A Durable Temporal Orchestration Implementation Evidence

## Document control

| Field | Accepted value |
| --- | --- |
| Status | `ACCEPTED_AND_MERGED / LOCAL_ONLY` |
| Package | M0-S6A (model-free parent/child Temporal orchestration substrate) |
| Parent | M0-06 (Temporal workflow-skeleton work package) |
| Evidence version | 1.0 |
| Acceptance date | 2026-08-25 |
| Reconciled | 2026-08-26 |
| Owner and human reviewer | Federico Ocampo, CTO at X3M |
| Implementer | Codex |
| Curve contract revision | `d97cc053a5d0eac7bc2aa9bebe263a245c95894f` |
| Context digest | `sha256:fcde6b95800c6bf657afe0cdf10cc28e1ddbb44aa16257833ca84f43714eedde` |
| Plane implementation base | `cb17734280260361cc3c8eccf44170a4bfbcb840` |
| Approved Plane head | `af8335c42fa3c57e66f76c6ebd80220640630cf8` |
| Plane squash merge | `ad5772c0565c934e64ea90f892be1374819979be` on `preview` |
| Approved and merged Git tree | `dde7e50afa1710b729ab86f9ed99e4c462c763d0` |
| Data and environment | Synthetic `INTERNAL` data in the existing local Plane Docker stack |

## Accepted outcome

M0-S6A adds a model-free durable orchestration substrate to the existing Curve
Temporal worker. It provides:

- `CurveInitiativeOrchestrationWorkflowV1` as a deterministic parent workflow;
- `CurveSliceAttemptWorkflowV1` as a synthetic child-attempt workflow;
- deterministic dependency waves and stable parent/child workflow identities;
- typed, target-bound, optimistic-versioned, idempotent signals;
- reference-and-digest-only question and answer handling;
- pause, resume, bounded timers, and cancellation propagation;
- Continue-As-New after a safe settled-wave barrier;
- additive worker and replayer registration alongside
  `CurveOperationWorkflowV1`; and
- four sanitized replay histories covering the operation, parent, child, and
  continued parent workflows.

The implementation adds no business aggregate, migration, public API, UI,
provider call, sandbox, VCS mutation, protected-body persistence, model call,
staging activation, or production activation.

## Governed inputs

| Input | Evidence |
| --- | --- |
| Product and workflow contract | [Curve PR #28](https://github.com/faocampo/curve/pull/28) (approved M0-S6A contract publication) squash-merged the exact contract as `d97cc053...` |
| Task packet | [M0-S6A task packet at the approved revision](https://github.com/faocampo/curve/blob/d97cc053a5d0eac7bc2aa9bebe263a245c95894f/docs/technical/m0-s6a-durable-orchestration-task-packet.md) (immutable dispatch scope, tests, stop conditions, and rollback) |
| Machine workflow manifest | [M0-S6A orchestration manifest](https://github.com/faocampo/curve/blob/d97cc053a5d0eac7bc2aa9bebe263a245c95894f/contracts/temporal/m0-orchestration-v1.json) (workflow identities, payloads, signals, scheduling, cancellation, Continue-As-New, and acceptance cases) |
| Implementation authorization | Federico Ocampo authorized branch `curve/m0-s6a-durable-orchestration`, the exact Plane base, Curve contract, context digest, owner/reviewer, Codex implementer, local-only scope, tests, commit/push/draft authority, US$25 limit, and rollback |
| Runtime topology | D-003 (local runtime topology and trust-zone decision) remained `DECIDED / LOCAL_ONLY`, with Temporal Python SDK 1.31.0, Temporal server 1.31.2, namespace `curve-local`, and queue `curve-control-plane-v1` |

## Plane implementation

[Plane PR #10](https://github.com/faocampo/plane/pull/10) (durable
parent/child Temporal orchestration implementation, review, CI, and merge)
contains the accepted changes. The implementation:

1. Added closed JSON and Python contracts for parent, child, signal, query, and
   result payloads.
2. Added the synthetic child state machine, idempotent command ledger,
   reference-only durable question wait, terminal completion, and cancellation.
3. Added deterministic DAG validation and wave scheduling, stable child IDs,
   pause/resume/cancel handlers, and safe Continue-As-New.
4. Registered the workflows additively in the existing worker and replayer.
5. Added unit, workflow, replay, worker-bootstrap, contract, and runtime-proof
   coverage without a migration or public surface.
6. Added a CI path that validates the Curve contract snapshot, full Curve
   backend suite, and migration drift for API changes.

The approved PR head and squash merge resolve to the same Git tree,
`dde7e50afa1710b729ab86f9ed99e4c462c763d0`. The squash operation therefore
changed commit history but not the reviewed implementation content.

## Local runtime proof

The committed
[runtime evidence](https://github.com/faocampo/plane/blob/ad5772c0565c934e64ea90f892be1374819979be/apps/api/plane/curve/contracts/temporal/m0-s6a-runtime-evidence.json)
(sanitized local worker restart, cancellation, Continue-As-New, replay, test,
and security results) binds implementation commit
`b9681f9dbb8cc3d1a34d9acee9073a1a3f83f8e7` inside the accepted PR tree.

| Proof | Accepted result |
| --- | --- |
| Worker restart | A child recovered from `WAITING_FOR_HUMAN` and completed `SUCCEEDED`; four commands were processed without duplication; retained history replayed. |
| Parent cancellation | Two of two children reached `CANCELLED`, zero children remained active, and the parent reached `CANCELLED`; retained history replayed. |
| Continue-As-New | Eleven slices completed across two runs with one continuation and no duplicate child start; retained history replayed. |
| Worker and stack health | Curve worker and existing Plane stack were healthy before and after the worker restart. |
| Replay corpus | Operation, parent, child, and continued-parent histories replayed with zero nondeterminism errors. |
| Safe-history boundary | Protected sentinel values, credential fields, and free-form question/answer bodies were absent. |

## Verification evidence

### Complete local verification recorded in the implementation PR

| Check | Result |
| --- | --- |
| Contract, context, and supply-chain integrity | Passed |
| Ruff check and format check | Passed |
| Migration drift | `No changes detected` |
| Curve backend suite | 210 passed; 10 ARM time-skipping-server skips |
| Live local Temporal workflow suite | 7 passed; 3 timer-acceleration-only skips |
| Local-profile targeted suite | 48 passed; 10 ARM time-skipping-server skips |
| Complete Plane backend Docker suite | 726 passed; 10 ARM time-skipping-server skips |
| Retained Temporal histories | 4 replayed; zero nondeterminism errors |
| `pnpm check:contracts` | Passed |
| `pnpm check` | Passed |
| `pnpm build` | Passed |
| Sentinel, credential, and free-form body scans | Passed |

The skipped tests require Temporal's embedded time-skipping server, which was
unavailable for local ARM. Equivalent non-accelerated cases ran against the
real local Temporal server, including explicit restart, cancellation, and
Continue-As-New proofs.

### Exact-head attached Plane CI

| Evidence | Exact-head result |
| --- | --- |
| [Plane API and Curve CI](https://github.com/faocampo/plane/actions/runs/32844162011) (API lint, contract integrity, Curve tests, and migration drift) | Passed at `af8335c...`; 210 tests passed, 10 platform-specific skips, and no migration changes were detected |
| [Plane CodeQL](https://github.com/faocampo/plane/actions/runs/32844164027) (Python and JavaScript security analysis) | Both language analyses passed at `af8335c...` |
| [Plane copyright check](https://github.com/faocampo/plane/actions/runs/32844163453) (source-header compliance) | Passed at `af8335c...` |

GitHub has no check runs attached directly to the squash commit. This does not
substitute a new check result: the accepted head and squash commit have the
same Git tree, and the exact-head CI above is the bound automated evidence.

### Human evidence and authorization

- Federico Ocampo recorded a local Plane smoke test in
  [Plane PR #10 comment](https://github.com/faocampo/plane/pull/10#issuecomment-5409812990)
  (human local application smoke-test evidence).
- Federico approved exact head
  `af8335c42fa3c57e66f76c6ebd80220640630cf8` after the attached CI passed and
  authorized its squash merge into `preview`.
- Plane PR #10 merged on 2026-08-25 as
  `ad5772c0565c934e64ea90f892be1374819979be`.

## Acceptance mapping

| Acceptance | Result and boundary |
| --- | --- |
| M0-S6A-AT-01 through M0-S6A-AT-12 | Passed in the committed runtime-evidence manifest and accepted implementation tests |
| AC-17 (durable question resume) | Partial enabling evidence: the same synthetic child resumed after restart using reference/digest-only question data; M4-05 retains provider-backed human-attribution and context-version ownership |
| AC-20 (cancellation) | Partial enabling evidence: Temporal children and parent settled deterministically; M4-04 retains JIT revocation, runtime cleanup, push prevention, and VCS reconciliation ownership |
| AC-58 (recovery) | Partial enabling evidence: local worker restart and replay caused no duplicate child; R1-03 retains multi-dependency RPO/RTO ownership |
| AC-18, AC-19, AC-21 | No claim; provider retry, budget exhaustion, runner quarantine, and replacement-attempt behavior remain in their owning packages |

## Security acceptance

- All workflow inputs and histories use synthetic `INTERNAL` identifiers and
  closed fields.
- Workflow history contains references and digests, not protected or free-form
  bodies.
- The workflows perform no provider, VCS, model, application-network, or
  application-database side effect.
- The agent receives no production, provider, VCS, deployment, gate, or waiver
  credential.
- Cancellation and restart preserve deterministic replay and do not create a
  duplicate child or command.
- Curve remains disabled with `CURVE_ENABLED=0` or when the Curve Compose
  profile is omitted.

## Rollback and recovery

The implementation is additive and has no migration. Disable it by setting
`CURVE_ENABLED=0` or omitting the Curve Compose profile. Stop the Curve worker
while retaining Temporal history for inspection and replay. Reverting the
Plane merge removes the new workflow code; restoring a compatible worker
resumes retained histories. Existing Plane behavior and
`CurveOperationWorkflowV1` remain registered by the accepted worker set.

## Completion boundary

M0-S6A is complete for its approved local-only scope and satisfies the defined
local M0-06 (Temporal workflow-skeleton work package) deliverable. M0-06 remains
formally `IN_PROGRESS` only until its shared development-plan, readiness-board,
traceability, and GitHub Project projections are reconciled after Curve PR #31.
No M0-S6B provider-backed child is required.

M4-05 (provider-backed slice execution workflow) owns persistent
Initiative/Plan/Slice/Attempt integration, provider dispatch, retries,
attributed questions, and application-service writes. M4-04 (trusted runner
lifecycle) owns attempt replacement, authority revocation, and quarantine.
M6-05 (budget administration and capacity) owns budget exhaustion. This record
does not authorize M0-S9A (provider-neutral registry and reconciliation
foundation), a real provider, protected storage, staging, production, merge
automation, or deployment.
