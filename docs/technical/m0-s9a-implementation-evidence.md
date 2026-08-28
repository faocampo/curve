# M0-S9A Provider Registry Implementation Evidence

## Document control

| Field | Accepted value |
| --- | --- |
| Status | `ACCEPTED_AND_MERGED / LOCAL_ONLY` |
| Package | M0-S9A (provider-neutral registry and reconciliation foundation) |
| Parent | M0-09 (provider integration foundation) |
| Evidence version | 1.0 |
| Acceptance date | 2026-08-28 |
| Owner and human reviewer | Federico Ocampo, CTO at X3M |
| Implementer | Codex |
| Curve contract revision | `e6e43ea7fdf99baf79922a4ae506bbcb73e7c4cb` |
| Context digest | `sha256:9e07550799a6e4d88a6734f9a98e0de59812402d983bc7291396332a6b214cb0` |
| Plane implementation base | `ad5772c0565c934e64ea90f892be1374819979be` |
| Approved Plane head | `d48a7d09f6824f045a1077ce2de256bd3dcde5d4` |
| Plane squash merge | `af7187d049c6ee6d0c82a5c70b686d4c444e9b63` on `preview` |
| Approved and merged Git tree | `d43bdc22413627399f2232f1b17e2092d9e31cb1` |
| Data and environment | Synthetic `INTERNAL` identifiers and fixed fake observations in `LOCAL_ONLY` |
| Budget | Existing authorized maximum of US$25 for the implementation attempt |

## Accepted outcome

M0-S9A adds the first provider-neutral registry substrate to Plane's additive,
default-off `plane.curve` Django application. It provides:

- workspace-scoped `ProviderConnection` persistence and append-only
  `ProviderCapability` observations;
- additive migration
  `0005_providerconnection_providercapability.py` after policy migration
  `0004_policydecision_recorded_at_default.py`;
- policy-v2 registration and administration authorization derived from the
  initiating human's live Plane workspace role;
- one static, deterministic `FAKE_LOCAL` adapter;
- synchronous provider commands with explicit post-commit and
  authorized-next-command outbox/inbox draining;
- idempotency, optimistic concurrency, immutable audit evidence, lifecycle
  transitions, bounded retries, dead-letter settlement, and resumable pending
  reconciliation; and
- versioned validation for every provider event payload.

The accepted implementation performs no provider runtime network call,
credential or secret access, protected-data use, Temporal workflow, Celery
task, scheduler, background loop, public API/UI operation, real adapter,
infrastructure change, deployment, or staging/production mutation.

## Governed inputs

| Input | Evidence |
| --- | --- |
| Task packet | [M0-S9A task packet at the accepted contract revision](https://github.com/faocampo/curve/blob/e6e43ea7fdf99baf79922a4ae506bbcb73e7c4cb/docs/technical/m0-s9a-provider-registry-task-packet.md) (immutable local implementation scope, acceptance, stop conditions, and rollback) |
| Relational contract | [M0-S9A relational contract at the accepted contract revision](https://github.com/faocampo/curve/blob/e6e43ea7fdf99baf79922a4ae506bbcb73e7c4cb/contracts/database/m0-s9a-provider-registry-contract.md) (tables, constraints, transactions, delivery, migration, and rollback) |
| Machine contract | [M0-S9A provider-registry manifest](https://github.com/faocampo/curve/blob/e6e43ea7fdf99baf79922a4ae506bbcb73e7c4cb/contracts/providers/m0-s9a-provider-registry-v1.json) (closed local authority, lifecycle, replay, delivery, persistence, and event rules) |
| Authorization decision | [M0-S9A registration authorization decision](https://github.com/faocampo/curve/blob/e6e43ea7fdf99baf79922a4ae506bbcb73e7c4cb/docs/technical/m0-s9a-registration-authorization-decision.md) (approved Option B workspace-admin role mapping and target) |
| Implementation authorization | Federico Ocampo authorized the exact Curve contract revision and digest, Plane base, existing branch, local-only implementation, migration, tests, commit, push, draft PR, Project updates, synthetic data boundary, exclusions, budget, and rollback. |
| Exact-head merge approval | Federico Ocampo approved Plane head `d48a7d09f6824f045a1077ce2de256bd3dcde5d4` and authorized its squash merge into `preview` while commit-bound CI remained green. |

## Plane implementation

[Plane PR #12](https://github.com/faocampo/plane/pull/12) (M0-S9A local
provider-registry implementation, review, validation, and merge) contains the
accepted change. It:

1. Adds workspace-scoped provider connection and append-only capability models,
   managers, constraints, and migration `0005`.
2. Adds policy-v2 action evaluation and trusted Plane workspace-role
   derivation for the exact fake-provider registration target.
3. Adds a typed static registry, deterministic fake adapter, closed error
   taxonomy, and safe context/result projections.
4. Adds synchronous registration, lifecycle, and reconciliation services with
   optimistic concurrency, replay, and immutable audit binding.
5. Adds explicit local outbox/inbox delivery with destination
   `CURVE_PROVIDER_LOCAL_V1`, consumer `curve-provider-local-v1`, maximum batch
   ten, 30-second claim lease, five-second retry delay, and dead-lettering on
   the third failed or abandoned claim.
6. Vendors and integrity-checks the exact Curve contract snapshot and adds
   contract, persistence, authorization, service, lifecycle, delivery,
   security-boundary, and migration tests.

The approved head and squash merge resolve to the same Git tree,
`d43bdc22413627399f2232f1b17e2092d9e31cb1`; the squash changed commit history
without changing the reviewed implementation tree.

## Verification evidence

### Exact-head implementation checks

| Check | Accepted result |
| --- | --- |
| Contract snapshot integrity | Passed for all pinned snapshots, including 28 M0-S9A files |
| Focused M0-S9A suite | 72 passed |
| Complete Curve backend suite | 326 passed; 10 local Temporal integration tests skipped |
| Migration drift | No changes detected |
| Disposable migration proof | Migration `0005` reversed to `0004` and reapplied successfully |
| Ruff | Passed for `plane/curve` and `plane/settings/common.py` |
| Monorepo checks | `pnpm check`: 60 of 60 tasks passed |
| Monorepo build | `pnpm build`: 16 of 16 tasks passed |
| Diff and credential-signature scan | Passed |
| AGPL source-link regression | Five test files and 27 tests passed, including exact public-release revision binding and fail-closed missing/mutable revision behavior |
| Installed Python dependency consistency | `pip check`: `No broken requirements found` in the disposable API test image |

### Commit-bound GitHub checks

| Evidence | Result |
| --- | --- |
| [Plane API and Curve CI run 33208175433](https://github.com/faocampo/plane/actions/runs/33208175433) (contract integrity, Curve backend suite, migration drift, and API lint) | Passed at approved head `d48a7d09f6824f045a1077ce2de256bd3dcde5d4` |
| [Plane CodeQL run 33213223875](https://github.com/faocampo/plane/actions/runs/33213223875) (Python and JavaScript security analysis) | Both language analyses passed at squash commit `af7187d049c6ee6d0c82a5c70b686d4c444e9b63` |
| [Plane copyright run 33213231056](https://github.com/faocampo/plane/actions/runs/33213231056) (Python and TypeScript source-header compliance) | Passed at squash commit `af7187d049c6ee6d0c82a5c70b686d4c444e9b63` |

### Full Plane regression comparison

The complete backend suite was executed in isolated disposable Docker Compose
projects at the exact base and accepted implementation tree.

| Revision | Passed | Skipped | Failed | Interpretation |
| --- | ---: | ---: | ---: | --- |
| Base `ad5772c0565c934e64ea90f892be1374819979be` | 684 | 10 | 42 | Baseline failures were outside `plane/curve`; most report the disposable environment's absent `APP_BASE_URL`/`WEB_URL`. |
| Accepted M0-S9A tree `d43bdc22413627399f2232f1b17e2092d9e31cb1` | 800 | 10 | 42 | The same 42 test identities failed; M0-S9A added 116 passing tests and no additional full-suite failure. |

The comparison is a no-regression result rather than a claim that the entire
repository suite is green. The implementation-specific Plane CI and the
complete Curve suite are green.

### Dependency audit disposition

`pnpm audit --prod --audit-level high` reports five High advisories inherited
from the Plane base:

- `brace-expansion`: [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg) and [GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895);
- `react-router`: [GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2); and
- `nanoid`: [GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv) and [GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8).

M0-S9A changes no package manifest, Python requirement file, or lockfile. The
base and accepted head use the same `pnpm-lock.yaml` blob,
`454debf594e2b3e657f223ce3e026fb4a0b4b95a`. [Curve issue #38](https://github.com/faocampo/curve/issues/38)
(SEC-M0-01 inherited High production dependency remediation) tracks this
repository security debt as a release blocker before the Curve pilot; its
remediation is outside this provider-registry package.

## Acceptance mapping

| Acceptance | Result and boundary |
| --- | --- |
| M0-S9A package scenarios | Passed across contract integrity, 72 focused tests, 326 complete Curve tests, migration proof, and commit-bound CI |
| AC-33 (provider delivery and reconciliation) | Partial enabling evidence: local fake-provider registration, capability history, reconciliation, replay, bounded delivery, recovery, dead-lettering, and workspace isolation are accepted |
| AC-33 remaining ownership | M0-S9B retains authenticated administration, credentials, real transports/adapters, callbacks/webhooks, and scheduled reconciliation |
| AC-57 (model failover and actual-route evidence) | No claim; the separately defined Model Gateway child remains decision-bound by D-004 (model catalog and data-policy decision) and D-005 (model task-routing decision) |

## Security and authority acceptance

- Registration authority is derived only from the initiating human's active
  Plane workspace role `20` for the exact target workspace and static fake
  adapter target.
- Caller-supplied roles, inactive membership, wrong workspace, roles `15` and
  `5`, agent/service actors, wrong target, non-local environment, and
  non-`INTERNAL` classification fail closed.
- Authorization precedes authorized-next-command draining; denied commands
  cause no inbox or outbox mutation.
- Workspace references remain guarded across normal and bulk ORM paths.
- The fake adapter cannot access the network, subprocesses, credentials,
  secrets, protected data, VCS, models, callbacks, or public APIs.
- Provider events use versioned aggregate-aware payload validation before
  persistence.
- CodeQL passes at the exact squash commit; the inherited production dependency
  advisories remain separately tracked for remediation before pilot release.

## Rollback and recovery

Set `CURVE_PROVIDER_REGISTRY_ENABLED=0` to disable the provider registry or
`CURVE_ENABLED=0` to disable Curve. Pending, retrying, and dead-letter local
outbox records remain inspectable and inert while disabled. No provider
network connection, credential, schedule, or external effect requires cleanup.
The additive tables remain in place during normal disablement. The reversible
migration proof is limited to a disposable database; reverting the Plane merge
is the code-level rollback before production use.

## Completion boundary

M0-S9A is complete for its approved `LOCAL_ONLY`, synthetic-provider scope.
M0-09 (provider integration foundation) remains open. M0-S9B (external provider
transport and administration) still owns authenticated administration,
credentials, callbacks/webhooks, schedules, and real adapters. The future Model
Gateway child still owns AC-57 (model-failover policy and actual-route
evidence). This record grants no MCP, Orca, OpenHands, Onyx, model, VCS,
credential, protected-data, staging, production, merge-automation, or
deployment authority.
