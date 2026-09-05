# Coding-Agent Local Execution and Authority Decision Packet

> Sanitized public reference. Fictional identities cannot authorize execution.
> Historical approvals apply only to their original bytes; see
> [public contract edition](public-reference-sanitization.md) (sanitization, integrity and approval boundaries).

## Document control

| Field | Value |
| --- | --- |
| Status | `DECIDED / OPTION 3 HUMAN-OPERATED / MACHINE PROFILE DEFERRED TO M4 / NOT IMPLEMENTATION AUTHORITY` |
| Version | 1.2 |
| Prepared | 2026-08-30 |
| Product | Curve |
| Decisions | B-CODING-TOOLS-01 (local coding-tool execution profile) and B-CODING-AUTHORITY-01 (trusted human authority and attempt lease) |
| Decision owner | Designated reviewer, Designated technical owner |
| Security/architecture reviewers | Designated reviewer until reassigned |
| First consumer | [RUNTIME-M0-01 task packet](runtime-m0-01-graceful-shutdown-task-packet.md) (graceful Curve worker shutdown classification, tests, evidence, and rollback) |
| Activation boundary | No command execution, code mutation, provider access, credential use, infrastructure change, deployment, or production dispatch is authorized by this packet. |

## Decision outcome

The coding-agent contracts merged through Curve PR #48 require every `READY`
command that executes repository code to run in a digest-pinned gVisor
container with no credentials and no network. The same contracts keep
`PYTHON_RUNTIME`, `DOCKER_LOCAL`, `CODEQL_ANALYZER`, `GH_READ_ONLY`, and
`NODE_RUNTIME` unavailable until each has a reviewed argv, helper, path, output,
and environment contract.

That boundary protects untrusted autonomous execution, but it cannot currently
represent the existing local Plane Python/Docker validation workflow. A second
independent boundary also prevents production dispatch until Curve can verify
the approving human's current authority and atomically acquire one durable
attempt lease.

Designated reviewer selected Authority Option 3 and explicitly deferred the machine
execution profile to M4 (OpenHands automation and gVisor runner integration).
Human-operated implementation still requires a separate exact repository grant;
this decision does not authorize Plane mutation.

### Current v1 representation boundary

The merged v1 machine contract permits only `LOCAL_WORKTREE` and
`GVISOR_CONTAINER` sandbox values. Its semantic classifier currently rejects
`PYTHON_RUNTIME`, `DOCKER_LOCAL`, `CODEQL_ANALYZER`, `GH_READ_ONLY`, and
`NODE_RUNTIME`, and requires every `READY` command that executes repository
code to use a digest-pinned gVisor container with no credential or network
destination. The existing Docker-backed Plane test suite also needs an
ephemeral local PostgreSQL network.

Therefore:

- Option A or C requires a reviewed successor command/runtime grammar and
  semantic tests; documentation or tool metadata alone cannot enable it.
- Option B requires a prebuilt digest-pinned image with every dependency and a
  reviewed way to prove the database-backed regression outside the no-network
  coding sandbox.
- No option may use a Docker socket inside the coding sandbox, pull/build an
  image during the attempt, download a package, or silently widen egress.
- Commit-bound Plane CI and GitHub CodeQL are evidence consumers, not a
  substitute for the packet's available focused lint/build/test/security/local-
  run commands.
- The successor grammar selected for this package must cover Python, Ruff,
  pytest, the trusted Docker/Compose helper, and the existing read-only Git
  boundary. Node/Pnpm remain unavailable until a later packet that needs them
  separately pins their executable, lifecycle-script, registry/cache, network,
  and output contract.
- Authority Option 3 creates no Curve machine-execution command. The human
  operator uses ordinary repository authorization and repository-native tools;
  Curve records commit-bound evidence afterward. B-CODING-TOOLS-01 may
  therefore remain `DEFERRED_TO_M4` while this path is active.

## Fixed invariants

| Area | Invariant |
| --- | --- |
| Repository scope | Curve machine dispatch uses one packet, one repository, one pinned base, one feature branch, and one active attempt. The manual path binds the same repository/base/branch tuple in its human grant and makes no Curve lease claim. |
| Data | Local bootstrap tasks use synthetic `INTERNAL` data and no protected body. |
| Credentials | Repository-code sandboxes receive no Curve-managed VCS, provider, deployment, production, or cloud credential. |
| Commands | Curve machine dispatch uses exact argv arrays with no shell wrapper, interpolation, dynamic module, package download, lifecycle hook, alias, or caller-supplied executable path. The manual path records the exact human-run repository-native commands and outputs. |
| Tools | Curve machine dispatch pins executable path, regular-file/symlink policy, byte digest, version, and isolated version probe. The manual path records observed image/tool versions and digests without claiming Curve enforcement. |
| Network | Curve machine dispatch defaults to deny and binds every destination to a named policy decision and command. The manual path uses the existing developer-owned local stack and intentionally accesses no provider, protected-data, production, or deployment destination. |
| VCS mutation | Curve-dispatched agents return candidate changes and the trusted controller owns VCS effects. Under Authority Option 3, the human operator uses ordinary developer repository authority and records the resulting branch, commit, and PR evidence. |
| Human authority | An agent cannot attest or infer a human approval, role, receipt, or revocation state. |
| Production dispatch | Remains fail closed until an independently verified authority receipt and atomic current-attempt lease exist. |
| gVisor | Remains mandatory for OpenHands, quality jobs, and every untrusted/non-local automated workload. |
| Manual bootstrap | Human-operated coding uses ordinary developer authority outside Curve dispatch, produces no Curve machine-execution claim, and records implementation evidence after repository CI and review. |

Official implementation references:

- gVisor, [Kubernetes RuntimeClass quick start](https://gvisor.dev/docs/user_guide/quick_start/kubernetes/) (containerd/runsc workload isolation).
- Python, [`-m` module execution](https://docs.python.org/3/using/cmdline.html#cmdoption-m) (module-bound command invocation).
- pytest, [command invocation](https://docs.pytest.org/en/stable/how-to/usage.html) (test selection and exit behavior).
- Ruff, [rule catalog](https://docs.astral.sh/ruff/rules/) (`S` flake8-bandit security rules and other static checks).
- GitHub, [configure code scanning](https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/configure-code-scanning) (default and advanced CodeQL setup for commit-bound repository security workflows).

## B-CODING-TOOLS-01 (Local Coding-Tool Execution Profile)

### Option A — Trust-tiered local bootstrap profile

Allow a narrowly defined `LOCAL_TRUSTED_WORKTREE_V1` profile for local-only,
human-supervised bootstrap changes. Keep gVisor mandatory for untrusted,
provider-backed, quality, staging, and production execution.

The profile would:

1. Permit exact Python module commands for `compileall`, Ruff, and pytest from
   one pinned Python installation with no dynamic `-c`, stdin, arbitrary module,
   package installer, or environment override.
2. Permit a fixed local Compose helper owned by the trusted controller for the
   exact Plane test-stack and Curve-profile commands. The helper, not a
   free-form agent command, validates Compose files, services, subcommands,
   flags, project root, environment allowlist, timeout, and cleanup. It uses a
   task-specific Compose project, resolves every service image to an approved
   digest before execution, replaces the current dependency-installing
   `api-tests` entrypoint with a reviewed non-installing entrypoint in a
   dependency-complete prebuilt image, prohibits build/pull/package
   installation and public egress, and permits only the fixed ephemeral test-
   stack network.
3. Use repository-native Ruff `E/F` checks plus an explicit Ruff `S` pass over
   production files as the pre-PR static security gate. Test assertions are
   excluded from `S101` applicability instead of broadly suppressing the rule.
   Commit-bound Plane CodeQL follows before merge.
4. Bind the local developer-owned runtime, no managed credentials, synthetic
   data, zero external spend, one attempt, and automatic cleanup.
5. Record every command, output digest, exit code, start/end time, exact
   repository tree, container/image digest, ephemeral network identity, and
   cleanup result. Bytecode caches and task-local containers/networks/volumes
   are created only inside the disposable task boundary and removed afterward.
6. Reuse the existing closed `GIT_READ_ONLY` grammar only for supplemental
   inspection such as `git diff --check`; this adds no VCS mutation authority.

Benefits: supports the existing local Plane stack, keeps commands inspectable,
and preserves the stricter gVisor boundary where untrusted execution begins.
Residual risk: repository code executes on the developer-owned local runtime;
the profile therefore applies only to explicit bootstrap-local tasks and never
to protected data, providers, staging, or production.

### Option B — gVisor for every coding command

Retain the current uniform rule and provision a digest-pinned, dependency-
complete Python/gVisor image plus a trusted external Compose/runtime proof
controller before any further code task.

Benefits: one isolation model for all automated repository execution. Cost:
local bootstrap stops until the gVisor runner, image publication, tool digests,
repository mounts, and trusted runtime-proof controller exist. Docker-in-Docker
and Docker-socket exposure remain prohibited.

### Option C — Docker-controller-only local execution

Allow only a reviewed `DOCKER_LOCAL_V1` trusted-controller helper. All lint,
test, migration, and local-run evidence executes through the existing Plane API
test/runtime containers; direct Python commands remain unavailable.

Benefits: close parity with current Plane CI and dependency topology. Residual
risk: Docker daemon authority is highly privileged, so the agent must never
receive a socket or raw Docker argv; every action must pass through the fixed
helper and service/file allowlists.

### Tool decision record

An approval that selects Authority Option 1 or 2 must select exactly one tool
option and bind:

- profile ID/version and allowed environment;
- trusted executor/helper implementation owner;
- exact Python, Ruff, pytest, Docker/Compose, and image versions/digests;
- accepted argv grammars and path constraints;
- network, credential, environment, mount, output, timeout, cancellation, and
  cleanup policy;
- security evidence split between pre-PR Ruff `S` and commit-bound CodeQL, or a
  stricter approved replacement;
- residual risks, review date, and revocation/disable behavior.

An approval that selects Authority Option 3 may instead bind
`B-CODING-TOOLS-01: DEFERRED_TO_M4`. That deferral authorizes no Curve machine
command and preserves the current fail-closed classifier and dispatcher.

## B-CODING-AUTHORITY-01 (Human Authority and Attempt Lease)

### Option 1 — Bootstrap-local human grant plus production fail-closed

Permit an interim `BOOTSTRAP_LOCAL_MANUAL_V1` grant for explicitly approved,
synthetic, local-only repository tasks while the production verifier and lease
provider are built. The grant must bind the exact packet digest, Curve/context
revisions, Plane base and branch, owner/reviewer/implementer, scope/non-scope,
budget, validity window, and permitted actions. The approval is copied into a
merged Curve authority record and bound to the exact human message or review
receipt.

The bootstrap controller enforces one local worktree/attempt and records its
terminal state. It grants no provider, credential, protected-data,
infrastructure, deployment, merge, or production authority. Curve's production
dispatcher remains fail closed.

For this option, the bootstrap lease is an implemented controller-owned local
SQLite store outside both repositories. Acquisition uses one `BEGIN IMMEDIATE`
transaction and uniqueness over the active `(repository, base_sha,
work_package_id)` and worktree-path scopes. The row binds a random attempt
nonce, packet digest, authorization digest, process identity, worktree path,
holder, acquired/heartbeat/expiry times, and state. Only the holder may renew
or release it. Expiry alone does not permit takeover: stale recovery also
requires the recorded process to be absent, the exact worktree to be clean or
quarantined, and a Designated reviewer-attributed recovery record that closes the prior
attempt before a new transaction can acquire the scope. Crash recovery and
double-acquire races are mandatory tests. This local store is bootstrap
coordination evidence; it is not the production authority or lease provider.

### Option 2 — Implement production authority and lease first

Block all further automated implementation until Curve integrates:

1. Example Organization's authenticated human identity/role source;
2. an immutable approval/revocation receipt verifiable independently of the
   task-packet repository;
3. a PostgreSQL-backed atomic lease for the exact non-terminal attempt; and
4. nonce, freshness, replay, role-separation, revocation, audit, and recovery
   tests.

Benefits: no bootstrap exception and one production-grade authority path.
Cost: RUNTIME-M0-01 and every later automated implementation wait for a new
security/control-plane package and its deployment boundary.

### Option 3 — Continue human-operated coding outside Curve dispatch

Keep the machine registry and production dispatcher blocked. Designated reviewer may
operate Codex manually using ordinary repository authorization, branch review,
and CI, and Curve records the resulting implementation evidence afterward.

Benefits: no bootstrap authority adapter. Limitation: this path does not prove
Curve's machine dispatch contract and cannot be called Curve-authorized
automated execution.

If selected for the bootstrap phase, this option also records
B-CODING-TOOLS-01 as `DEFERRED_TO_M4`. There is no local machine command packet,
trusted Docker gateway, human-receipt adapter, or local lease to implement for
the manual path. M4 must decide and implement the production-relevant
OpenHands/gVisor command, authority, lease, and evidence boundary before Curve
dispatches an automated coding attempt.

### Authority decision record

An approval selecting Option 1 or 2 must bind:

- environment and expiry/review date;
- authoritative identity/role source;
- immutable approval and revocation receipt format/source;
- required roles and separation;
- attempt identity, single-consumption behavior, lease store, transaction and
  uniqueness rules, lease TTL, renewal, cancellation, and recovery;
- nonce/freshness/replay constraints;
- audit/redaction requirements;
- permitted actions and explicit prohibitions;
- kill switch, rollback, and incident owner.

An approval selecting Option 3 instead binds the human operator, repository,
base, feature branch, files, commands, synthetic-data boundary, permitted local
Docker and VCS effects, tests, budget, validity window, review, rollback, and
production fail-closed state. It has no Curve authority receipt, nonce, lease,
renewal, or recovery semantics because the work occurs outside Curve dispatch.

Selecting Option 1 or Option 3 changes only the local bootstrap process.
Production dispatch remains blocked until Option 2's equivalent controls are
approved, implemented, and independently verified.

Every decision record must expose the two lifecycles separately. The local
field is one of `LOCAL_BOOTSTRAP_PROFILE_SELECTED`,
`LOCAL_BOOTSTRAP_OUTSIDE_CURVE`, or `LOCAL_BOOTSTRAP_UNRESOLVED`. The production
field remains `PRODUCTION_AUTHORITY_UNRESOLVED` until the independently
verified identity/receipt source and PostgreSQL-backed durable lease are
implemented and accepted. Selecting Option 1 sets the local field to
`LOCAL_BOOTSTRAP_PROFILE_SELECTED`; selecting Option 3 sets it to
`LOCAL_BOOTSTRAP_OUTSIDE_CURVE`. Neither implies production readiness.

## Verified bootstrap feasibility evidence

The 2026-08-30 local audit used Curve `main`
`c55686c8061f092f4f82ab73681e06f97d80893f` and Plane `preview`
`99a73b4eab5ee21fd012d7358bc9259252d47f71`.

| Evidence | Verified result | Consequence |
| --- | --- | --- |
| Host Python/Ruff | Python 3.14.7; no host Ruff executable | Option A needs a separately pinned disposable Python/Ruff environment rather than the current host tools. |
| Existing Curve worker image | Image digest `sha256:afaf09281c96e984df0f5510657e5609e9bb88200b12f040bc0cb672d9706617`; Python 3.12.5; Ruff 0.9.7 | The local image is usable human-operated evidence, while a machine profile requires provenance, full runtime-tree pinning, and controller receipts. |
| Existing dependency-complete test image | Image digest `sha256:5dcd00dec45aebe57fd0965e0b04e1765cad6dcce32af474fbc29073bbe834d7`; Python 3.12.5; Ruff 0.9.7; pytest 9.0.3 | A human operator can reuse the exact local image through an isolated disposable project. Machine use additionally requires a reviewed immutable image and non-installing Compose model. |
| Cached test dependencies | PostgreSQL `sha256:468d34f...`, Valkey `sha256:10328d0...`, RabbitMQ `sha256:611107e...`, and MinIO `sha256:14cea49...` are present locally | The exact human grant binds and revalidates the full image IDs and uses `--pull never`; any missing or changed dependency stops the proof. |
| Existing source-image project resources | Four healthy dependency containers and the `test_env` network remain active under Compose project `plane-m1-01a-initiative-core-20260829` | RUNTIME-M0-01 must not reuse or clean that project. The manual proof uses a dedicated project plus a disposable alias of the exact source image ID, and stops if its own alias or project resources pre-exist. |
| Exact-preview environment file | `apps/api/.env` is absent; `docker-compose-test.yml` requires it for four services | The manual proof creates an ignored mode-`0600` byte copy of the public `.env.example`, appends no secret, rejects any pre-existing `.env`, and removes only the attempt-created copy in `finally`. |
| Plane API test definition | The `api-tests` entrypoint installs `requirements/test.txt`; the stack includes shell entrypoints, mutable dependency tags, environment-file reads, and an egress-capable bridge | Option A or C requires a new image supply-chain decision, sanitized Compose model, trusted helper, receipt schema, and adversarial validation before machine use. |
| Synthetic local workspace | Workspace `c6d757e7-7c0d-4721-990b-4cfbf4063e8e`; zero non-terminal Operations; zero undelivered `CURVE_TEMPORAL_OPERATION_V1` events; 95 pending `CURVE_LOCAL` application events | Worker shutdown quiescence must examine worker-owned Temporal work. Application-local events are inventoried separately and do not block the signal proof. |

## Decided simplified bootstrap

Designated reviewer approved B-CODING-AUTHORITY-01 Option 3 (human-operated coding outside
Curve dispatch) and B-CODING-TOOLS-01 as `DEFERRED_TO_M4` at Curve PR #50 head
`f8e2f4b3d497f747f9e8a3b7db7508510400bae9`, squash-merged as
`866032fa42e2cb57ad1a4e662d9561f742983f79`. RUNTIME-M0-01 (graceful Curve
worker shutdown classification) may proceed as an ordinary human-supervised
Plane change after its separate exact grant. Curve machine dispatch remains
fail closed until M4 implements the production-relevant OpenHands/gVisor
execution and authority boundary.

## Acceptance before implementation

1. Authority Option 3 plus `B-CODING-TOOLS-01: DEFERRED_TO_M4` is approved and
   merged at exact Curve revision `866032fa42e2cb57ad1a4e662d9561f742983f79`.
2. The consuming task has a separately approved exact human execution grant.
3. For Authority Option 1 or 2, the command classifier, schema, fixtures,
   adversarial tests, ordered machine packet, trusted authority receipt, and
   current-attempt lease must exist before Plane mutation.
4. For Authority Option 3, Designated reviewer supplies one exact human execution grant
   binding the Plane base, branch, scope, data boundary, commands, external
   effects, tests, rollback, and review. The implementation is recorded as
   human-operated rather than Curve-dispatched.
5. GitHub Project items reflect visual progress without being used as evidence
   of approval or authority.

The prepared [RUNTIME-M0-01 human execution grant](runtime-m0-01-human-execution-grant.md)
(exact Plane base, branch, scope, Docker/VCS effects, tests, exclusions,
validity, and rollback) is the first consumer-specific grant proposal. It
requires its own exact-revision approval.

## Rollback

Before a consumer grant is approved, close or revert its preparation package.
After a machine profile is implemented, disable the selected local profile,
revoke any active bootstrap authorization, terminate its attempt, remove its
local worktree, and return dispatch to fail closed. Under Authority Option 3,
abandon or revert the human-operated feature branch and keep machine dispatch
fail closed. No application data or migration is involved in this decision.
