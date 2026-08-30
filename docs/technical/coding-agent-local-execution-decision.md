# Coding-Agent Local Execution and Authority Decision Packet

## Document control

| Field | Value |
| --- | --- |
| Status | `ANALYZED / OWNER DECISIONS REQUIRED / NOT IMPLEMENTATION AUTHORITY` |
| Version | 1.0 |
| Prepared | 2026-08-30 |
| Product | Curve |
| Decisions | B-CODING-TOOLS-01 (local coding-tool execution profile) and B-CODING-AUTHORITY-01 (trusted human authority and attempt lease) |
| Decision owner | Federico Ocampo, CTO at X3M |
| Security/architecture reviewers | Federico Ocampo until reassigned |
| First consumer | [RUNTIME-M0-01 task packet](runtime-m0-01-graceful-shutdown-task-packet.md) (graceful Curve worker shutdown classification, tests, evidence, and rollback) |
| Activation boundary | No command execution, code mutation, provider access, credential use, infrastructure change, deployment, or production dispatch is authorized by this packet. |

## Decision outcome required

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

Federico must select one execution profile and one authority profile. An AI
coding agent may prepare and validate the alternatives but cannot select either
security architecture.

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

## Fixed invariants

| Area | Invariant |
| --- | --- |
| Repository scope | One packet, one repository, one pinned base, one feature branch, one active attempt. |
| Data | Local bootstrap tasks use synthetic `INTERNAL` data and no protected body. |
| Credentials | Repository-code sandboxes receive no Curve-managed VCS, provider, deployment, production, or cloud credential. |
| Commands | Exact argv arrays only; no shell wrapper, interpolation, dynamic module, package download, lifecycle hook, alias, or caller-supplied executable path. |
| Tools | Executable path, regular-file/symlink policy, byte digest, version, and isolated version probe are pinned. |
| Network | Default deny; each allowed destination requires a named policy decision and command binding. |
| VCS mutation | Agents return candidate changes; the trusted controller owns commit, push, and draft PR/MR effects. |
| Human authority | An agent cannot attest or infer a human approval, role, receipt, or revocation state. |
| Production dispatch | Remains fail closed until an independently verified authority receipt and atomic current-attempt lease exist. |
| gVisor | Remains mandatory for OpenHands, quality jobs, and every untrusted/non-local automated workload. |

Official implementation references:

- gVisor, [Kubernetes RuntimeClass quick start](https://gvisor.dev/docs/user_guide/quick_start/kubernetes/) (containerd/runsc workload isolation).
- Python, [`-m` module execution](https://docs.python.org/3/using/cmdline.html#cmdoption-m) (module-bound command invocation).
- pytest, [command invocation](https://docs.pytest.org/en/stable/how-to/usage.html) (test selection and exit behavior).
- Ruff, [rule catalog](https://docs.astral.sh/ruff/rules/) (`S` flake8-bandit security rules and other static checks).
- GitHub, [configure code scanning](https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/configure-code-scanning) (default and advanced CodeQL setup for commit-bound repository security workflows).

## B-CODING-TOOLS-01 (Local Coding-Tool Execution Profile)

### Option A — Trust-tiered local bootstrap profile (recommended)

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

The approval must select exactly one option and bind:

- profile ID/version and allowed environment;
- trusted executor/helper implementation owner;
- exact Python, Ruff, pytest, Docker/Compose, and image versions/digests;
- accepted argv grammars and path constraints;
- network, credential, environment, mount, output, timeout, cancellation, and
  cleanup policy;
- security evidence split between pre-PR Ruff `S` and commit-bound CodeQL, or a
  stricter approved replacement;
- residual risks, review date, and revocation/disable behavior.

## B-CODING-AUTHORITY-01 (Human Authority and Attempt Lease)

### Option 1 — Bootstrap-local human grant plus production fail-closed (recommended)

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
quarantined, and a Federico-attributed recovery record that closes the prior
attempt before a new transaction can acquire the scope. Crash recovery and
double-acquire races are mandatory tests. This local store is bootstrap
coordination evidence; it is not the production authority or lease provider.

### Option 2 — Implement production authority and lease first

Block all further automated implementation until Curve integrates:

1. X3M's authenticated human identity/role source;
2. an immutable approval/revocation receipt verifiable independently of the
   task-packet repository;
3. a PostgreSQL-backed atomic lease for the exact non-terminal attempt; and
4. nonce, freshness, replay, role-separation, revocation, audit, and recovery
   tests.

Benefits: no bootstrap exception and one production-grade authority path.
Cost: RUNTIME-M0-01 and every later automated implementation wait for a new
security/control-plane package and its deployment boundary.

### Option 3 — Continue human-operated coding outside Curve dispatch

Keep the machine registry and production dispatcher blocked. Federico may
operate Codex manually using ordinary repository authorization, branch review,
and CI, and Curve records the resulting implementation evidence afterward.

Benefits: no bootstrap authority adapter. Limitation: this path does not prove
Curve's machine dispatch contract and cannot be called Curve-authorized
automated execution.

### Authority decision record

The approval must select exactly one option and bind:

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

Selecting Option 1 or Option 3 changes only the local bootstrap process.
Production dispatch remains blocked until Option 2's equivalent controls are
approved, implemented, and independently verified.

Every decision record must expose the two lifecycles separately. The local
field is one of `LOCAL_BOOTSTRAP_PROFILE_SELECTED`,
`LOCAL_BOOTSTRAP_OUTSIDE_CURVE`, or `LOCAL_BOOTSTRAP_UNRESOLVED`. The production
field remains `PRODUCTION_AUTHORITY_UNRESOLVED` until the independently
verified identity/receipt source and PostgreSQL-backed durable lease are
implemented and accepted. Selecting Option 1 may change only the first field;
it cannot imply production readiness.

## Recommendation

Select B-CODING-TOOLS-01 Option A (trust-tiered local bootstrap profile) and
B-CODING-AUTHORITY-01 Option 1 (bootstrap-local exact human grant with
production fail-closed). This matches the existing local Plane Docker workflow,
preserves gVisor for untrusted execution, permits RUNTIME-M0-01 to proceed with
synthetic data and zero external spend, and keeps production security claims
closed until the real verifier and lease provider exist.

## Acceptance before implementation

1. Federico approves one exact option from each decision section.
2. The selected decision text is committed and merged at an exact Curve
   revision.
3. The command classifier, schema, fixtures, and adversarial tests implement
   the selected tool boundary without caller-selectable helpers.
4. The RUNTIME-M0-01 machine packet is published in
   `S -> E1..En -> C -> P` order (normative source; ordered authority,
   state, and context evidence; source catalog; sealed registry) and passes
   structural plus read-only preflight.
5. The selected authority profile produces a separate exact-digest
   authorization before Plane mutation.
6. GitHub Project items reflect visual progress without being used as evidence
   of approval or authority.

## Rollback

Before decision approval, close or revert this documentation package. After a
decision is implemented, disable the selected local profile, revoke any active
bootstrap authorization, terminate its attempt, remove its local worktree, and
return dispatch to fail closed. No application data or migration is involved in
the decision packet itself.
