# RUNTIME-M0-01 Graceful Worker Shutdown Implementation Evidence

> Sanitized public reference. Fictional identities cannot authorize execution.
> Historical approvals apply only to their original bytes; see
> [public contract edition](public-reference-sanitization.md) (sanitization, integrity and approval boundaries).

## Document control

| Field | Accepted value |
| --- | --- |
| Status | `ACCEPTED_AND_MERGED / LOCAL_ONLY` |
| Package completion | `DONE_LOCAL` |
| Package | RUNTIME-M0-01 (graceful Curve worker-shutdown correction) |
| Parent | M0-06 (Temporal workflow-skeleton work package) |
| Evidence version | 1.0 |
| Acceptance date | 2026-09-01 |
| Owner and human reviewer | Designated reviewer, Designated technical owner |
| Implementer | Codex, human-operated outside Curve dispatch |
| Curve definition baseline | `030644db40e5a949ac02a193ad47b0c86f96dcab` |
| Plane rebased implementation base | `b5d611ae77d5404e326f1ffa31694fbcead2cb94` |
| Accepted Plane head | `88921d95e8b5b997d2578a170fe79e260b61c8c2` |
| Plane squash merge | `c516a612a29751b0d24bcbd32bfcba1bd73fe3af` on `preview` |
| Accepted and merged Git tree | `9bee343ffc7f9ba983bcef40a276f87553e8a342` |
| Data and environment | Synthetic `INTERNAL` data in the existing local Plane Docker stack |

## Accepted outcome

RUNTIME-M0-01 corrects the local Curve Temporal worker's signal handling. An
intentional `SIGINT` or `SIGTERM` now terminates normally, while independently
failed worker, relay, or shutdown work still fails closed with deterministic
precedence. Supervisor cancellation completes cleanup before propagating, and
no worker, relay, stop-waiter, cleanup, or shutdown-supervision task is left
running.

The implementation changes exactly three Plane files:

1. `apps/api/plane/curve/temporal/worker.py` (Curve Temporal worker entrypoint),
2. `apps/api/plane/curve/temporal/worker_lifecycle.py` (side-effect-free
   lifecycle supervisor), and
3. `apps/api/plane/curve/tests/test_curve_worker_lifecycle.py` (deterministic
   lifecycle, failure, cancellation, and cleanup tests).

It adds no migration, API, UI, workflow/activity contract, event, provider,
dependency, Compose, infrastructure, protected-data, staging, or production
change.

## Governed inputs

| Input | Evidence |
| --- | --- |
| Definition | [Curve PR #49](https://github.com/faocampo/curve/pull/49) (RUNTIME-M0-01 shutdown-correction definition) published the bounded behavior and acceptance matrix. |
| Human-operated authority decision | [Curve PR #50](https://github.com/faocampo/curve/pull/50) (Option 3 human-operated coding and deferred machine profile) selected `HUMAN_OPERATED_OUTSIDE_CURVE_DISPATCH` and kept Curve machine dispatch fail closed. |
| Exact execution grant | [Curve PR #65](https://github.com/faocampo/curve/pull/65) (RUNTIME-M0-01 exact Plane execution grant) published the repository, base, branch, file, data, command, Docker-effect, evidence, validity, and rollback boundaries as Curve merge `030644db40e5a949ac02a193ad47b0c86f96dcab`. |
| Implementation and merge | [Plane PR #15](https://github.com/faocampo/plane/pull/15) (deterministic Temporal worker-shutdown implementation) contains the accepted three-file change and squash merge into `preview`. |
| Rebased security prerequisite | [Plane PR #16](https://github.com/faocampo/plane/pull/16) (Critical/High CodeQL remediation) merged as `b5d611ae77d5404e326f1ffa31694fbcead2cb94`; PR #15 was rebased onto that exact `preview` commit before its final verification. |

The implementation remained a human-operated local attempt. It created no
Curve machine task packet, attempt lease, provider call, or runtime dispatch
claim. B-CODING-TOOLS-01 (machine coding-tool execution profile) remains
deferred to M4 (agent execution and sandbox milestone).

## Plane implementation

[Plane PR #15](https://github.com/faocampo/plane/pull/15) (deterministic Curve
Temporal worker-shutdown implementation) was rebased after the security
prerequisite merged. The final head
`88921d95e8b5b997d2578a170fe79e260b61c8c2` has base
`b5d611ae77d5404e326f1ffa31694fbcead2cb94` and is the exact commit verified by
the final CI and security gates.

The approved head and squash commit
`c516a612a29751b0d24bcbd32bfcba1bd73fe3af` resolve to the same Git tree,
`9bee343ffc7f9ba983bcef40a276f87553e8a342`. Squashing changed commit history
without changing the accepted implementation content.

## Verification evidence

### Local deterministic and regression suites

| Check | Accepted result |
| --- | --- |
| Focused lifecycle and worker-bootstrap suites | 20 passed |
| Complete Curve backend suite | 382 passed; 10 local Temporal platform skips |
| Complete Plane backend suite | 900 passed; 10 local Temporal platform skips |
| Migration drift | `No changes detected` |
| Ruff | Passed |
| Ruff security rules | Passed |
| Diff hygiene | Passed |

The lifecycle coverage includes worker/relay/stop races, simultaneous failures,
worker-before-start failure during pending shutdown, shutdown failure,
supervisor cancellation, deterministic error precedence, and terminal-state
assertions for all owned tasks.

### Live local signal and recovery proof

| Proof | Accepted result |
| --- | --- |
| `SIGTERM` container `curve-runtime-m0-01-sigterm` | Workflow and activity pollers observed for identity `curve-runtime-m0-01-sigterm-v1`; exit `0`; no traceback or lifecycle `RuntimeError`; complete log digest `sha256:673b9de6e5309e01c05e27fdb579e13347614e71ef1debe0774465b2c6f17d3f`. |
| `SIGINT` container `curve-runtime-m0-01-sigint` | Workflow and activity pollers observed for identity `curve-runtime-m0-01-sigint-v1`; exit `0`; no traceback or lifecycle `RuntimeError`; complete log digest `sha256:673b9de6e5309e01c05e27fdb579e13347614e71ef1debe0774465b2c6f17d3f`. |
| Recovery container `curve-runtime-m0-01-recovery` | Workflow and activity pollers observed for identity `curve-runtime-m0-01-recovery-v1`; health passed; graceful exit `0`; complete log digest `sha256:673b9de6e5309e01c05e27fdb579e13347614e71ef1debe0774465b2c6f17d3f`. |
| Worker-owned quiescence | Workspace `c6d757e7-7c0d-4721-990b-4cfbf4063e8e` had zero non-terminal Operations, zero undelivered `CURVE_TEMPORAL_OPERATION_V1` events, and zero open workflows on `curve-runtime-m0-01-validation-v1`. |
| Unrelated application delivery | 95 `CURVE_LOCAL` pending events were separately inventoried and remained outside the worker-owned signal-proof boundary. |
| Long-lived runtime identities | PostgreSQL `3f15d23836e505c2420697e7d299188a529ada6c0f0de9b73239c092fd80e2ee`, Temporal `1b99fabd8f227bbb93df047e1cbca0a7323d8bb32e58024de786087928997583`, Curve worker `2cae0b59b80752a2dda844879dec11e351f31eb90a8d964a3ad79bd259e837e9`, and network `2fad83313a6d22a09ee6ce52633559d5199a8d034f6f80774cc5a726e6daac29` remained healthy and unchanged. |
| Cleanup | Validation Compose resources, attempt-local `.env`, generated bytecode/static assets, image alias, and all three disposable signal containers were removed; the implementation worktree was clean. |

### Exact-head repository-native checks

| Evidence | Exact-head result |
| --- | --- |
| [Plane API and Curve CI run 33563636894](https://github.com/faocampo/plane/actions/runs/33563636894) (API lint, contract integrity, Curve tests, and migration drift) | Passed at `88921d95e8b5b997d2578a170fe79e260b61c8c2`. |
| [Plane CodeQL run 33563639296](https://github.com/faocampo/plane/actions/runs/33563639296) (Python and JavaScript security analysis) | Both language analyses passed at `88921d95e8b5b997d2578a170fe79e260b61c8c2`. |
| [Plane copyright run 33563642356](https://github.com/faocampo/plane/actions/runs/33563642356) (source-header compliance) | Passed at `88921d95e8b5b997d2578a170fe79e260b61c8c2`. |
| Exact-ref open CodeQL alerts | Zero `critical` or `high` findings whose most recent instance is the accepted head. The complete empty-response digest is `sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945`. |

## Acceptance mapping

| Acceptance | Result and boundary |
| --- | --- |
| AC-58-RUNTIME-01 through AC-58-RUNTIME-16 | Passed through the deterministic lifecycle suite, full regression, live signals, recovery, attached CI, and exact-ref security gate. |
| FR-015 and FR-022 | The accepted local Temporal worker now handles intentional process signals without a false failure while retaining versioned workflow registration. |
| NFR-004 | Local worker shutdown and restart are deterministic, bounded by the approved ten-second container deadline, and leave no owned task orphaned. |
| NFR-005 | The signal proof ran only from worker-owned quiescence and introduced no duplicate workflow, event, or effect. |
| AC-58 | Local enabling evidence only; R1-03 (full disaster-recovery exercise) retains multi-dependency RPO/RTO qualification. |

## Security and authority acceptance

- Synthetic `INTERNAL` identifiers and public local service settings were the
  only application data used.
- No provider, model, protected-data, VCS credential, deployment credential,
  staging, or production access was used.
- The implementation stays within the three authorized files and preserves
  the existing Temporal SDK, workflow/activity contracts, and Compose topology.
- Critical/High security findings are zero at the accepted head.
- Curve machine dispatch remains fail closed until M4 (agent execution and
  sandbox milestone) implements the approved OpenHands/gVisor execution,
  authority, and attempt-lease profile.

## Rollback and completion boundary

The change has no migration. Operational disablement is `CURVE_ENABLED=0` or
omitting the Curve Compose profile. Source rollback is reverting Plane squash
commit `c516a612a29751b0d24bcbd32bfcba1bd73fe3af` on `preview` and rerunning the
same lifecycle, regression, signal, and security gates.

RUNTIME-M0-01 is complete for its approved local-only scope. This record does
not claim full AC-58 disaster-recovery qualification, non-local runtime
activation, M0 completion, machine coding dispatch, provider operation, or
deployment.
