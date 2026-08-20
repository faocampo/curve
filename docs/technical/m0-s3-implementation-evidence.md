# M0-S3 Local Temporal Round-Trip Implementation Evidence

## Document control

| Field | Value |
| --- | --- |
| Status | `ACCEPTED_AND_MERGED` |
| Evidence date | 2026-08-20 |
| Task | M0-S3 (local Temporal round-trip implementation packet) |
| Decision | D-003 (runtime topology and trust-zone decision), `LOCAL_ONLY` shared-network profile |
| Human owner and reviewer | Federico Ocampo (`faocampo`), CTO at X3M |
| Curve contract revision | `aece53943525c6e7f7993551453954fe27b00746` |
| Plane base | `922dd6de5d5ed5081f35cd88343154022867ccad` on `preview` |
| Plane approved head | `7fd231b062dc485b37078979a78ec83618be78d8` |
| Plane merge | `d99342f589db4eb488695487d3ae3f2c16bf0874` on `preview` |
| Plane PR | [Plane PR #5](https://github.com/faocampo/plane/pull/5) (review and squash merge of the local Temporal round trip) |
| Project item | `PVTI_lAHOBNjuQc4BgZzOzg3CeqQ`, `Done` in [Curve GitHub Project #2](https://github.com/users/faocampo/projects/2) (visual M0-S3 delivery tracker) |
| Data classification | Synthetic `INTERNAL` proof data only |

## Accepted outcome

M0-S3 (local Temporal round-trip implementation packet) is complete. The
accepted Plane implementation adds:

1. Temporal Python SDK `1.31.0` and a digest-pinned local Temporal development
   server containing server version `1.31.2`.
2. A dedicated Curve Temporal worker built from the Plane API image without
   loading Plane's Celery application.
3. Transactional-outbox relay dispatch, deterministic workflow identity,
   idempotent application activities, durable cancellation, bounded retries,
   explicit workflow patches, and retained replay history.
4. The approved shared Plane `dev_env` topology, direct host-loopback Temporal
   ports, and removal of Curve-specific proxy/network components.
5. Worker environment and credential allowlists, a read-only filesystem,
   resource limits, safe identifier-only Temporal payloads, health checks, and
   a reproducible local proof command.
6. No Curve database migration and no replacement of Plane's existing Celery
   responsibilities.

The implementation is bound to the
[M0-S3 context manifest](https://github.com/faocampo/plane/blob/d99342f589db4eb488695487d3ae3f2c16bf0874/apps/api/plane/curve/contracts/m0-s3-context.json)
(39-file deterministic Curve input and ownership record) with aggregate digest
`sha256:0edadab2d51b7898ed91b556ea3f072f4127b909d0755bd7d5993597fe618f26`.

## Approval and merge binding

Federico Ocampo approved exact Plane head
`7fd231b062dc485b37078979a78ec83618be78d8` and authorized its squash merge
into `preview`. GitHub recorded the merge on 2026-08-20 at
`d99342f589db4eb488695487d3ae3f2c16bf0874` with parent
`922dd6de5d5ed5081f35cd88343154022867ccad`.

The approved-head tree and merge tree are identical:

| Revision | Git tree |
| --- | --- |
| Approved head `7fd231b...` | `1286f5a5547034dd297f10a9fbf97c5a89724c0f` |
| Merge `d99342f...` | `1286f5a5547034dd297f10a9fbf97c5a89724c0f` |

The PR was clean and mergeable at the approved head. The Plane repository did
not register a GitHub status-check rollup for this PR; acceptance therefore
binds the explicit local and isolated verification evidence below rather than
claiming a GitHub-hosted check result.

## Contract and supply-chain binding

| Control | Accepted evidence |
| --- | --- |
| Curve context | Revision `aece539...`; 39 sorted, unique paths; aggregate and per-file SHA-256 values verified |
| Plane base | Exact `preview` base `922dd6d...`; no base drift before publication |
| Temporal SDK | `temporalio==1.31.0`; MIT; musllinux ARM64 and x86-64 wheel digests pinned |
| Temporal server | `docker.io/temporalio/temporal:1.8.1@sha256:59561b9ef060eaeb1f46cb6a1842d6cbdd8a393eb3b6d315ecef5fe2f0b1d7a6`; embedded server `1.31.2`; MIT |
| Namespace and task queue | `curve-local`; `curve-control-plane-v1` |
| Workflow identity | `CurveOperationWorkflowV1`; `curve:{workspace_id}:{operation_id}` |
| Payload ceiling | Workspace/operation identifiers, aggregate versions, safe enums, correlation and command references only |
| Migration | `python manage.py makemigrations curve --check --dry-run` returned `No changes detected in app 'curve'` |

The accepted implementation includes the
[Temporal supply-chain manifest](https://github.com/faocampo/plane/blob/d99342f589db4eb488695487d3ae3f2c16bf0874/apps/api/plane/curve/contracts/temporal-supply-chain.json)
(SDK, image, license, version, and digest pins) and
[contract-integrity checker](https://github.com/faocampo/plane/blob/d99342f589db4eb488695487d3ae3f2c16bf0874/apps/api/plane/curve/contracts/check-integrity.mjs)
(M0-S2, M0-03, M0-S3, and Temporal supply-chain verification).

## Verification results

| Verification | Result |
| --- | --- |
| Clean isolated Plane backend suite | `651 passed`, 92 upstream deprecation warnings, exit `0` |
| Complete Curve backend suite | `135 passed`, exit `0` |
| Post-review contract and replay regression | `15 passed`, one read-only pytest-cache warning, exit `0` |
| Ruff over every M0-S3 Python path | Passed with `--no-cache` |
| Monorepo checks | `pnpm check`: 60 of 60 tasks successful |
| Monorepo build | `pnpm build`: 16 of 16 tasks successful |
| Contract/context/supply-chain integrity | Passed for M0-S2, M0-03, M0-S3, SDK `1.31.0`, and server `1.31.2` |
| Diff hygiene | `git diff --check` passed before and after commit |
| Secret-pattern review | No private-key, AWS access-key, GitHub token, or GitLab token pattern found in the M0-S3 scope |
| Migration drift | No Curve model changes detected |

The isolated backend run used disposable PostgreSQL, Valkey, RabbitMQ, and
MinIO services, then removed only that test project. A separate run against the
long-lived local services identified 12 legacy magic-link failures caused by
persistent Redis counters and missing test email configuration; all 12 passed
in the clean repository-native test environment, producing the authoritative
`651 passed` result.

## Runtime acceptance evidence

The enabled `curve` profile resolved to the existing Plane `dev_env`. The
resolved Compose model contained no Curve-specific network or proxy. Temporal
published only `127.0.0.1:7233` and `127.0.0.1:8233`; the Curve worker reached
`temporal:7233` and `plane-db:5432` through internal service discovery.

| Scenario | Terminal evidence |
| --- | --- |
| Success | Operation `9c1baca7-4e4b-4df5-bbdb-0f34a67caf5f` reached `SUCCEEDED` at aggregate version 4; one Operation, four events, four outbox rows, two inbox rows, and four audit rows |
| Direct cancellation | Operation `3be36bc1...` reached `CANCELLED` at aggregate version 5; one Operation, five events, five outbox rows, two inbox rows, and five audit rows |
| Durable cancellation recovery | Operation `2e057208...` reached `CANCELLED` at aggregate version 5 with the same exact evidence cardinality and no direct signal dependency |
| Duplicate workflow start | Rejected by the fixed workflow-ID reuse policy |
| History replay | Every produced and committed v1 history replayed without nondeterminism |
| Protected-data sentinel | Absent from Temporal histories and safe runtime evidence |

### Real worker-restart proof

Operation `2e5f1d71-c45b-4d83-9b92-458d4ed8fbf5` reached `RUNNING` at version 3.
The worker container was restarted during the deterministic five-second proof
window. The operation subsequently reached `SUCCEEDED` at version 4 with
exactly one Operation, four events, four outbox rows, two inbox rows, and four
audit rows. Replay passed, the protected sentinel remained absent, and no
duplicate effect was recorded.

## Security acceptance

1. The worker receives only its database, Temporal, feature, identity, and log
   configuration allowlist.
2. Model-provider, OpenHands, Orca, VCS, AWS, SMTP, RabbitMQ, Redis, and
   production credentials are rejected or absent from the worker environment.
3. The worker uses a read-only root filesystem, bounded temporary filesystem,
   dropped Linux capabilities, no-new-privileges, PID/CPU/memory limits, and no
   published port.
4. Temporal payload contracts reject free text and unapproved operation types;
   synthetic canonical request bodies remain in PostgreSQL-derived digests and
   are not written to Temporal history.
5. Local Temporal gRPC and UI exposure is host-loopback-only. Non-local client
   authentication, persistence, backup, HA, certificate, and ownership inputs
   remain activation-package requirements.

## Rollback proof

The proof stopped and removed only the `curve-worker`, `temporal`, and volume
initializer containers. Ports `7233` and `8233` closed, the ordinary Plane API
and seven baseline services remained running, and the named
`plane_curve_temporal_data` proof volume was retained. Plane without the Curve
overlay therefore preserved its existing service model and behavior.

Operational rollback remains:

1. Disable Curve relay dispatch and omit the `curve` profile.
2. Stop and remove only the Curve worker and Temporal services.
3. Preserve PostgreSQL Operation, event, inbox, outbox, policy, and audit state.
4. Retain or explicitly delete only the named local Temporal proof volume.
5. Revert merge `d99342f...` through a separately reviewed Plane PR if source
   rollback is required.

## Acceptance mapping and remaining scope

| Requirement | Evidence disposition |
| --- | --- |
| FR-015, FR-022 | Durable workflow start, signal/cancellation, outbox relay, application activities, and audit linkage accepted |
| NFR-004 | Duplicate start, retry/idempotency, restart, cancellation recovery, and deterministic replay accepted for the local foundation probe |
| AC-17-AC-21 | Local Temporal execution, durable cancellation, restart, replay, and no duplicate effect accepted |
| AC-58 | Identifier-only history and protected-sentinel exclusion accepted for M0-S3 |

M0-S3 (local Temporal round-trip implementation packet) completes the first
executable slice of M0-06 (Temporal workflow-skeleton work package). The broader
parent/child workflow, continue-as-new, provider-attempt, reconciliation, and
production-operability scope remains in later M0-06 packages. M0-S4 (API, SSE,
and minimal UI implementation packet) may now be reconciled against Plane
`preview` at `d99342f...`; it still requires its own exact context, owner,
reviewer, acceptance commands, and user-facing experience gate before dispatch.

Development EKS, staging, and production Temporal activation remains outside
this evidence and requires the unresolved D-003 (runtime topology and
trust-zone decision) environment inputs plus D-009 (retention and protected
storage decision) where protected persistence applies.
