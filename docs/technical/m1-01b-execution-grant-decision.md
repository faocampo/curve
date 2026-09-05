# M1-01B (Curve-First Initiative Shell) Execution-Grant Decision

> Sanitized public reference. Fictional identities cannot authorize execution.
> Historical approvals apply only to their original bytes; see
> [public contract edition](public-reference-sanitization.md) (sanitization, integrity and approval boundaries).

## Document control

| Field | Value |
| --- | --- |
| Status | `DECIDED / HUMAN_OPERATED_OUTSIDE_CURVE_DISPATCH / MACHINE_DISPATCH_BLOCKED` |
| Version | 1.1 |
| Prepared | 2026-08-31 |
| Decided | 2026-09-01 |
| Work package | M1-01B (Curve-first Initiative shell) |
| Decision owner | Designated reviewer, Designated technical owner |
| Preparation base | Curve `f7c211cfcd7cfff7fd026d9cdd7b57a6fe6c95fe` |
| Target base | Plane `c516a612a29751b0d24bcbd32bfcba1bd73fe3af` |
| Governing analysis | [Coding-agent local execution and authority decision packet](coding-agent-local-execution-decision.md) (trust-tiered tool alternatives, exact human grant, durable attempt lease, production fail-closed behavior, and rollback) |
| Implementation definition | [M1-01B implementation task packet](m1-01b-initiative-shell-implementation-task-packet.md) (exact frontend scope, Plane paths, API behavior, acceptance, commands, blockers, and rollback) |
| Exact grant | [M1-01B human execution grant](m1-01b-human-execution-grant.md) (current Plane base, frontend paths, local tools, CI/security evidence, manual UX gate, exclusions, and rollback) |

## Decision purpose

This record asks for only the material choices that prevent M1-01B from
becoming machine `READY` and, separately, from receiving execution authority.
It does not approve UX changes, alter the Initiative contract, authorize Plane
mutation, or weaken the production fail-closed boundary.

The alternatives below are retained as the historical decision surface. The
selected bootstrap path is B-CODING-AUTHORITY-01 Option 3 (human-operated coding
outside Curve dispatch), already approved in Curve PR #50. Designated reviewer's
2026-09-01 standing delegation permits autonomous coding-only technical work;
product decisions and manual UX/UI acceptance remain explicit human gates.

## Selected local path

- Authority: `HUMAN_OPERATED_OUTSIDE_CURVE_V1`.
- Machine execution: B-CODING-TOOLS-01 remains `DEFERRED_TO_M4`.
- Local procedure: observed Node.js 26.7.0 and pnpm 11.3.0, offline frozen
  install with lifecycle scripts disabled, repository-native lint/type/test/build.
- Security acceptance: commit-bound Plane CodeQL plus an exact-ref query proving
  zero open Critical or High finding.
- Merge gate: Designated reviewer manually accepts the exact implementation UX/UI head.

The selected path is recorded in the
[M1-01B human execution grant](m1-01b-human-execution-grant.md) (exact local
frontend attempt, tools, security evidence, manual UX gate, and rollback). It
does not activate Curve machine dispatch or production execution.

## Decision A — Node/pnpm execution profile

Select exactly one:

| Value | Exact meaning |
| --- | --- |
| `LOCAL_TRUSTED_NODE_M1_01B_V1` | A human-supervised, local-only controller executes the exact pnpm commands from the M1-01B implementation packet in a clean Plane worktree. The controller pins Node, pnpm, executable bytes, environment allowlist, offline store, no-lifecycle-script install, paths, timeouts, outputs, cancellation, and cleanup. It receives no managed credential and no protected data. |
| `GVISOR_NODE_M1_01B_V1` | Every pnpm command executes in a dependency-complete, digest-pinned gVisor image with repository code mounted at declared paths, `.git` read-only, no credentials, and no network. Image build/pull/package download is completed outside the attempt by an approved controller. |
| `DEFER` | M1-01B remains `BLOCKED`; no Plane command or mutation may run through Curve authority. |

Required evidence after selection:

- exact Node and pnpm versions, launcher mode, canonical real paths, and SHA-256
  executable digests;
- exact environment-variable allowlist and prohibited preload/config variables;
- existing offline pnpm store or immutable image digest;
- exact allowed argv and repository paths;
- filesystem, network, credential, timeout, cancellation, output-redaction, and
  cleanup controls;
- adversarial tests for shell syntax, dynamic execution, lifecycle hooks,
  registry/network fallback, substituted launchers, symlinks, and writes outside
  the declared boundary.

The planned install form follows pnpm's
[CLI install options](https://pnpm.io/cli/install) (frozen lockfile, offline
resolution, and disabled lifecycle scripts). The selected controller must stop
when the offline store is incomplete; it cannot silently enable network access.

## Decision B — security-evidence profile

Select exactly one:

| Value | Exact meaning |
| --- | --- |
| `LOCAL_STATIC_AND_COMMIT_CODEQL_M1_01B_V1` | The selected Node controller runs the approved local lint/type/test/build phases. Security acceptance then requires commit-bound Plane CodeQL at the exact implementation head plus a trusted read-only alert query proving zero open Critical/High finding for that head. Missing access or partial analysis fails closed. |
| `GVISOR_CODEQL_M1_01B_V1` | A separately pinned, no-download CodeQL analyzer runs inside the approved gVisor boundary before PR publication, and commit-bound Plane CodeQL repeats the gate at the exact head. Database creation, packs, queries, paths, output, and result normalization are closed and digest-bound. |
| `DEFER` | `CMD-SECURITY` remains `PLANNED`; the packet cannot become machine `READY`. |

GitHub's [CodeQL code-scanning configuration](https://docs.github.com/en/code-security/code-scanning/creating-an-advanced-setup-for-code-scanning)
(advanced setup and exact workflow configuration) and
[code-scanning alerts API](https://docs.github.com/en/rest/code-scanning/code-scanning)
(alert instances and severity retrieval) define the commit-bound evidence
source. The selected profile must define exact-ref completeness rather than
assuming that one green workflow summary contains every required alert fact.

## Decision C — implementation authority

Select exactly one governing value from B-CODING-AUTHORITY-01 (trusted human
authority and attempt lease):

| Value | Exact meaning for M1-01B |
| --- | --- |
| `BOOTSTRAP_LOCAL_MANUAL_V1` | Use the analyzed Option 1: one exact human grant plus a controller-owned local SQLite attempt lease outside both repositories. The bootstrap authority applies only to this synthetic, local-only task. Production authority remains unresolved and fail closed. |
| `PRODUCTION_AUTHORITY_FIRST_V1` | Use Option 2: block M1-01B dispatch until the independent Example Organization identity/role receipt verifier and production atomic lease are implemented and accepted. |
| `HUMAN_OPERATED_OUTSIDE_CURVE_V1` | Use Option 3: Designated reviewer operates the coding tool through ordinary repository authority, and Curve records evidence afterward. The work is not represented as Curve-authorized machine dispatch. |
| `DEFER` | No implementation attempt is authorized. |

Selecting `BOOTSTRAP_LOCAL_MANUAL_V1` also requires the local SQLite lease
implementation, transaction/uniqueness/heartbeat/expiry/stale-recovery tests,
and controller integration defined by the governing analysis. An approval
sentence alone does not implement that lease or grant execution.

## Exact grant envelope

After Decisions A-C are selected and their controls pass, the human grant must
bind all values below. Any absent, placeholder, stale, or mismatched value keeps
implementation authority false.

```yaml
decision_id: M1-01B-EXECUTION-GRANT-01
decision_owner: Designated reviewer
decision_status: APPROVED | DEFERRED
decided_at: <exact ISO-8601 timestamp>
node_execution_profile: LOCAL_TRUSTED_NODE_M1_01B_V1 | GVISOR_NODE_M1_01B_V1 | DEFER
security_profile: LOCAL_STATIC_AND_COMMIT_CODEQL_M1_01B_V1 | GVISOR_CODEQL_M1_01B_V1 | DEFER
authority_profile: BOOTSTRAP_LOCAL_MANUAL_V1 | PRODUCTION_AUTHORITY_FIRST_V1 | HUMAN_OPERATED_OUTSIDE_CURVE_V1 | DEFER
packet_id: CURVE-M1-01B
packet_version: <registry packet version>
packet_digest: <sealed packet sha256>
curve_normative_revision: <S revision>
curve_packet_revision: <P revision>
context_digest: <resolved canonical context sha256>
target_repository: git@github.com:faocampo/plane.git
target_branch: preview
base_sha: 9f9bb14f46b80e1d05b4c900d25c1af7a229b55c
feature_branch: curve/m1-01b-initiative-shell
work_package_id: M1-01B
project_item_node_id: PVTI_lAHOBNjuQc4BgZzOzg4vNto
owner: faocampo
human_reviewer: faocampo
implementer: codex
data_classification: INTERNAL
protected_data_allowed: false
maximum_external_spend_usd: 0
maximum_compute_minutes: 120
maximum_active_attempts: 1
valid_from: <exact ISO-8601 timestamp>
valid_until: <exact ISO-8601 timestamp>
permitted_actions:
  - local Plane worktree creation
  - declared frontend file mutation
  - exact approved lint, type, test, build, security, and local-run commands
  - local commit
  - feature-branch push
  - draft Plane PR creation
  - GitHub Project visual progress update
prohibited_actions:
  - merge
  - deployment
  - staging or production mutation
  - backend or migration change
  - provider, model, Temporal, or infrastructure change
  - protected-data or managed-credential use
  - unapproved network or repository path
rollback: revert or delete the feature branch before merge; after merge set CURVE_ENABLED=0 and omit the Curve Compose profile
```

The machine-dispatch form above remains fail closed. The separately documented
human-operated path uses ordinary repository authority and therefore has no
Curve authorization receipt or attempt lease.

## Current outcome

```yaml
decision_status: DECIDED
node_execution_profile: HUMAN_OPERATED_LOCAL_NODE_PNPM
security_profile: LOCAL_STATIC_AND_COMMIT_CODEQL_M1_01B_V1
authority_profile: HUMAN_OPERATED_OUTSIDE_CURVE_V1
implementation_authority_granted: false
human_execution_grant: ACTIVE
manual_ux_acceptance_required_before_merge: true
curve_machine_dispatch_status: BLOCKED
production_dispatch_status: BLOCKED
```
