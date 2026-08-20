# P0-06 (Two-Stage Local Temporal Proof) Task Packet

## Document control

| Field | Value |
| --- | --- |
| Work package | `P0-06` (two-stage local Temporal proof work package) |
| Current stage | `P0-06_SUPERSEDED` (terminal historical projection) |
| Current state | `SUPERSEDED`; this packet grants no dispatch or execution authority |
| Decision | D-003 (runtime topology and trust-zone decision) is `DECIDED` for `LOCAL_ONLY`; M0-S3 (local Temporal round-trip implementation packet) is the executable proof |
| Decision owner | Federico Ocampo, CTO at X3M, acting as Platform Operations decision owner for `LOCAL_ONLY` |
| Human reviewer | Federico Ocampo (`faocampo`) |
| Technical operator | OpenAI Codex under Federico Ocampo's oversight |
| Original scope approval | On 2026-08-15 Federico approved the `LOCAL_ONLY` sections of ADR proposal revision `sha256:cac4dcac2a03156faf21b0deffdc22bec611da1b070a421b4d5b631bfec8a142` as a proof basis; staging and production content in that revision was not approved |
| Current interpretation | Historical proof design only. The live M0-S3 network contract is governed by [D-003 private-platform connectivity amendment](d003-private-platform-connectivity-amendment.md) (shared local network, private EKS direction, and revised proof acceptance). |
| Two-stage direction | On 2026-08-15 Federico approved P0-06A (isolated Temporal feasibility proof) followed by a separately designed and approved P0-06B (least-privilege Plane integration proof) |
| Durable supersession evidence | [Curve PR #9](https://github.com/faocampo/curve/pull/9), approved head `7826f4031a6f3862ed29d48c9f16292e8a1ab8bb`, green `validate`, merge `097016ffe2eb259cc780ad2a6cd41ca3422366b2` |
| P0-06A (isolated Temporal feasibility proof) authorization | `SUPERSEDED_UNISSUED`; proposed authorization `D003-LOCAL-PROOF-A-2026-08-15-01` was never activated |
| P0-06B (least-privilege Plane integration proof) authorization | `SUPERSEDED_UNISSUED`; no attempt was authorized |

Federico Ocampo retired both stages as standalone gates on 2026-08-18. The
historical design below is retained for audit and explains the superseded
control model. Its readiness lists, commands, leases, and state transitions are
inactive. The active implementation and proof contract is M0-S3 (local
Temporal round-trip implementation packet) in
[M0 local skeleton task packets](m0-local-skeleton-task-packets.md) (repository-local M0 scope, acceptance tests, commands, and rollback).

## Supersession effect

- P0-06A (isolated Temporal feasibility proof) and P0-06B (least-privilege
  Plane integration proof) have terminal status `SUPERSEDED`.
- The claim tag, broker start grant, proof ticket, execution/VCS leases,
  harness-only attempt, and terminal-publication flow are retired from the
  active local delivery path.
- GitHub Project status remains visual metadata; P0-06 may be shown as `Done`
  to record its supersession.
- The approved two-network topology, SDK pin, evidence, security checks, and
  rollback are executed once through M0-S3 (local Temporal round-trip
  implementation packet).
- Historical sections below must be read as prior design, never as current
  authority.

## Reference legend

- D-003 (runtime topology and trust-zone decision).
- P0-06 (two-stage local Temporal proof work package).
- P0-06A (isolated Temporal feasibility proof).
- P0-06B (least-privilege Plane integration proof).
- M0-S3 (local Temporal round-trip implementation packet).
- M0-06 (Temporal workflow-skeleton work package).

The parenthetical description accompanies these identifiers throughout this
packet so a reader does not need to memorize the catalog.

## Historical two-stage boundary (superseded)

| Stage | Purpose | Permitted result | Decision effect |
| --- | --- | --- | --- |
| P0-06A | Prove pinned Temporal server/SDK primitive behavior in a disposable, isolated, credential-free local harness. | Accepted or rejected feasibility evidence for start, signal, query, retry, cancellation, child-process restart, history replay, time/resource enforcement, and cleanup. | Cannot decide D-003, validate Plane integration, unblock M0-S3, or approve `dev_env`. Accepted evidence returns P0-06 to `Backlog` for P0-06B design. |
| P0-06B | Prove the final least-privilege Plane Compose profile, worker image compatibility, required data path, disabled/enabled behavior, failure isolation, and rollback. | Accepted or rejected integration evidence against a separately approved immutable packet. | Accepted evidence may support a D-003 `LOCAL_ONLY` decision. M0-S3 remains blocked until P0-06B is accepted and the exact local scope is formally `DECIDED`. |

P0-06B (least-privilege Plane integration proof) must replace the historical,
superseded shared-`dev_env` and Plane-application-environment candidate. Its
new design must enumerate the
minimum services, ports, credentials, data, and filesystem access required by
the Curve worker. Any revised topology requires Federico's separate exact-head
approval before execution. P0-06A supplies no authority for that design.

## P0-06A (isolated Temporal feasibility proof) readiness gates

P0-06A stays `Backlog` until all conditions are true:

1. This documentation PR is exact-head approved, merged, and green in Curve CI.
2. A separate harness PR commits every executable input under
   `docs/technical/proofs/p0-06a/harness/`: `compose.yaml`, container entrypoint/supervisor, validator,
   wrapper, worker/workflow/scenario sources, tests, complete dependency lock,
   evidence schema, and redaction rules.
3. Harness CI builds a public, immutable multi-platform image, publishes its
   index/platform/config digests, SBOM and provenance, runs unit/security tests,
   and records the exact source revision. Local execution never builds code or
   resolves dependencies.
4. Federico publishes the canonical exact-head approval described below for the
   harness PR. It merges with green
   post-merge CI. The versioned P0-06 (two-stage local Temporal proof) stage
   record captures its source, bundle, image, SBOM, provenance, and approval
   evidence.
5. A read-only workstation preflight proves the exact Plane SHA, one existing
   Plane Compose project and its baseline resource IDs, Docker Engine/Compose
   availability, a workstation-local Docker context/socket, host platform,
   trusted time, active exact-tag claim ruleset and normalized live snapshot, host-controller identity/source/
   executable/config/conformance/operation-allowlist, credential-broker
   conformance, signed-attestation verification contract, claim-time ruleset
   recheck policy, and four approved execution, reconciliation, review-
   disposition, and terminal-projection publication lease profiles that permit
   up to four outcome-dependent non-overlapping leases,
   signed-ticket/grant schema and verification key, evidence paths,
   host-artifact inventory, and no existing P0-06A resources. It emits a
   sanitized proposed per-attempt manifest without claiming or starting Docker
   resources.
6. A separate attempt-authorization PR commits the complete immutable
   `docs/technical/proofs/p0-06a/authorization/` bundle.
   Federico publishes its canonical exact-head approval including the
   authorization ID; the PR merges with green head and post-merge CI. Because a
   tracked file cannot contain the SHA or approval URL of its own containing
   commit, a subsequent projection-only PR records the three earlier execution-authority approvals and
   heads, approval URLs/times, merge/check evidence, and manifest digests in the
   versioned stage record. The projection PR carries no additional execution
   authority. It changes only the versioned stage record, receives the canonical
   `curve.projection-review/v1` integrity review, and merges with app-bound green
   head and merge CI. Project #2 may link that merged source,
   documentation-context digest, and stage-record digest for visual tracking.
   The live daemon, stack, live ruleset snapshot, absent claim ref, credential
   profile, and trusted-time checks are repeated immediately before claim
   without changing the approved bundle.
7. Validation enforces documentation completion, harness approval/completion,
   preflight completion, attempt approval/completion, projection review/
   completion and trusted times in that order, plus the corresponding merge
   ancestry. P0-06A has no unresolved field, exception, expired window, stale
   approval, or ambiguous claim. GitHub Project status may be updated separately
   for visual tracking and does not participate in this validation.

The harness, attempt-authorization, and projection PRs are separate future
steps. Creating them, publishing an image, or changing a repository ruleset
requires its own pre-action report, review, and authorization; this packet
performs none of those actions.

## P0-06A (isolated Temporal feasibility proof) proposed execution window

These values become binding only through exact-head approval of this packet,
the later harness head, and the immutable per-attempt manifest head:

| Field | Proposed binding value |
| --- | --- |
| `not_before` | A fixed instant approved in the per-attempt manifest. Effective eligibility is the later of that instant, all three execution-approval PR merge-and-CI completions, the projection-review PR merge/check completion, and successful read-only preflight. |
| `claim_by` | `2026-08-22T23:00:00Z` (`2026-08-22T20:00:00-03:00`) |
| Approved preflight lifetime | At most 24 hours from recorded completion; every live binding is rechecked immediately before claim |
| Active-attempt expiry | The earlier of 7,200 seconds after the first claim API request or `2026-08-23T01:00:00Z` (`2026-08-22T22:00:00-03:00`) |
| Reconciliation-only expiry | The earlier of 900 seconds after active-attempt expiry or `2026-08-23T01:15:00Z` (`2026-08-22T22:15:00-03:00`) |
| Review deadline | `2026-08-26T02:59:59Z` (`2026-08-25T23:59:59-03:00`) |
| Attempts | One; every successful, failed, timed-out, cancelled, ambiguous, or pre-existing-claim response consumes the authorization ID |
| Exceptions | None; any requested exception requires a new packet, authorization ID, exact-head approval, and time window |

The controller derives time from the TLS-authenticated GitHub API `Date`
header, records the response and a monotonic-clock correlation, and rejects
local or daemon clock skew greater than five seconds. At `claim_by`, an
unclaimed authorization becomes `EXPIRED`. Evidence not
accepted by the review deadline receives `NEW_AUTHORIZATION_REQUIRED`; a late
acceptance requires a new exact-head authorization and cannot revive the
consumed attempt.

If either prerequisite PR has not merged before `claim_by`, this authorization
expires without execution. Changing any source, context, image, tool, operator,
scope, environment, limit, or evidence rule invalidates it immediately.

## P0-06A (isolated Temporal feasibility proof) immutable inputs

| Field | Required value |
| --- | --- |
| Evidence repository | `git@github.com:faocampo/curve.git` |
| Evidence base | Merged Curve `main` revision containing the exact approved per-attempt manifest and stage record; linked from Project #2 |
| Evidence branch | `agent/p0-06a-isolated-temporal-proof-d003-2026-08-15-01`; created and advanced only by the trusted proof controller with evidence commits and normal non-force pushes |
| Immutable claim ref | Protected lightweight tag `curve-proof-claims/d003-local-p0-06a-2026-08-15-01`, created once at the exact evidence-base commit |
| Claim protection | Active repository ruleset targeting only the exact tag. It permits the one atomic creation, forbids update and deletion, exposes an empty bypass-actor list, and is re-read by ID and normalized digest before claim. Any ruleset change invalidates the authorization. |
| Read-only Plane target | `git@github.com:faocampo/plane.git`, fork `preview` SHA `549db1aea8f3307b337b3686dbb844a87549cd95`, materialized detached at `/private/tmp/plane-p0-06a-runtime` |
| Documentation context | SHA-256 over this packet, ADR-003, the Temporal M0 contract, development plan, and readiness board from one merged Curve commit |
| Harness context | Domain-separated SHA-256 over only the complete committed `docs/technical/proofs/p0-06a/harness/` subtree from one merged harness commit; image provenance must bind the same tree and commit |
| Authorization bundle | Immutable, mode-sensitive, domain-separated digest over `docs/technical/proofs/p0-06a/authorization/`, including attempt and supply-chain manifests, SBOM, provenance, preflight report, controller executable/config/conformance/allowlist, credential-broker conformance, ticket/grant and publication-attestation schemas, verification keys, claim-time ruleset recheck policy, four lease profiles, and reconciliation policy |
| Stage projection | Versioned v2 record at `docs/technical/proofs/p0-06-stage-record.json`, validated directly by the contract gate against [`p0-06-stage-projection-v2.schema.json`](../../contracts/schemas/p0-06-stage-projection-v2.schema.json); Project #2 links its merged source and digest rather than storing mutable proof fields by hand. |
| Per-attempt manifest | Immutable index within the authorization bundle. It binds daemon/context/socket, trusted time, Plane baseline, every artifact path/digest, controller and broker sources, claim ref/ruleset snapshot and recheck policy, evidence/temporary paths, harness/image digests, attestation issuer/audience/key/store, limits, dates, exact required check name/application IDs, and expected cleanup. |
| Existing Plane stack | Read-only baseline only. P0-06A never joins its networks, reads its environment, mounts its paths, restarts it, or changes its resources. |
| Data | Synthetic `INTERNAL` UUIDs, safe enums, digests, and explicit credential/protected-data sentinel strings only |
| Active resources | One container with `NanoCpus=2000000000`, `Memory=8589934592`, `MemorySwap=8589934592`, `PidsLimit=256`, `/run/curve-proof` tmpfs `rw,noexec,nosuid,nodev,size=4294967296,mode=0700`, read-only root, `local` logs with `max-size=10m` and `max-file=3`, `stop_grace_period=15s`, `restart: "no"`, `network_mode: none`, and no published ports |
| Host artifacts | Exact worktree, candidate-evidence, raw-output, quarantine, temporary-state, and pulled-image IDs/paths recorded in the per-attempt manifest with owner-only permissions and class-specific cleanup/disposition |
| Cost | US$25 maximum; local compute and approved immutable image retrieval only |

## Repository binding and canonical approval contract

The harness bundle digest covers only
`docs/technical/proofs/p0-06a/harness/`. It is SHA-256 over the domain separator
`curve-harness-bundle:v1\0`, the root path and `NUL`, then each regular Git blob
sorted by raw UTF-8 relative-path bytes. Each entry contributes Git mode,
`NUL`, relative-path byte length, `NUL`, relative-path bytes, `NUL`, content
byte length, `NUL`, raw blob bytes, and `NUL`. Only modes `100644` and `100755`
are accepted. Empty trees, symlinks, submodules, Git LFS pointers, invalid
UTF-8/control paths, duplicate paths, and paths outside the fixed root fail
validation. The authorization bundle uses the same mode-sensitive tree
algorithm with domain separator
`curve-proof-authorization-bundle:p0-06a:v1\0` and fixed root
`docs/technical/proofs/p0-06a/authorization/`. Its digest is external to the
bundle, recorded in the attempt-authorization approval and later stage
projection, avoiding self-reference. Every listed artifact is also re-read by
fixed path and raw-byte digest at the immutable bundle revision,
attempt-approved head, and current merged `main`. The controller executable
must remain mode `100755`; all other authorization artifacts use `100644`.
Canonical JSON, regular-blob, public-key-only, path, mode, and byte-equality
validation fail closed.

The successful harness build produces the data later committed at the immutable
manifest revision in
`docs/technical/proofs/p0-06a/authorization/supply-chain-manifest.json`, using schema
`curve.p0-06a-supply-chain/v1`. It binds the harness source/root/algorithm/
digest, GHCR image repository and index digest, both platform manifest/config
digests, `authorization/sbom.spdx.json` artifact/subject, and
`authorization/provenance.intoto.jsonl` SLSA v1 provenance artifact/
subject/source/bundle. The same immutable revision contains
`docs/technical/proofs/p0-06a/authorization/attempt-manifest.json`, using schema
[`curve.p0-06a-attempt/v1`](../../contracts/schemas/p0-06a-attempt-manifest.schema.json).
It binds the authorization ID, documentation head/context, supply-chain
path/digest, harness and selected-platform values, Plane repository/revision,
controller principal/source/executable/configuration/conformance/operation-
allowlist, broker source/conformance/attestation verifier, claim ref/ruleset,
execution-evidence and reconciliation-evidence branches, ticket and start-grant
schemas/key ID, all four lease profiles, preflight, normalized live-ruleset
snapshot digest and claim-time recheck policy, fixed window, runtime limits,
host artifacts, exact required check name/application IDs, and Security incident
owner. The schema has `additionalProperties: false` at every authority-bearing
object. In particular, `attempt_manifest.controller.operation_bindings` contains
exactly the eight execution/VCS operation IDs defined below and no additional
operation. GitHub Project status writes are administrative and are excluded.

`attempt_manifest.controller.operation_bindings` is the authoritative operation
map. Its digest is
`SHA-256("curve-p0-06a-operation-bindings:v1\0" + RFC-8785-JCS(operation_bindings))`,
where JCS is the [RFC 8785 JSON Canonicalization Scheme](https://www.rfc-editor.org/rfc/rfc8785).
The stage projection mirrors that digest and the following high-risk values;
validation recomputes each value from the authoritative map and rejects a
mismatch:

| Stage readiness field | Authoritative operation-binding source |
| --- | --- |
| `operation_binding_claim_sha` | `create-claim-ref.sha` |
| `operation_binding_evidence_sha` | `create-evidence-ref.sha` |
| `operation_binding_reconciliation_evidence_ref` / `operation_binding_reconciliation_evidence_sha` | `create-reconciliation-evidence-ref.ref` / `.sha` |
| `operation_binding_terminal_projection_bootstrap_sha` | Both `create-terminal-projection-ref.sha` and `create-terminal-projection-draft-pr.sha`; the values must be identical. |
| `operation_binding_terminal_projection_final_sha` | `finalize-terminal-projection-ref.sha` |

At `P0-06A_DESIGN`, the schema path is present while its digest, the operation-
bindings digest, and all six mirrored values are `null`. Populating those fields
does not authorize execution; the immutable attempt approval, projection review,
broker conformance, live revalidation, and signed start grant remain mandatory.

The attempt manifest does not contain its own digest, its containing revision,
or the future approval head. The attempt-authorization PR first commits the
complete immutable authorization bundle, then may add non-bundle projection
material; bundle bytes must remain unchanged. Its exact approved head is
therefore a descendant of the immutable bundle revision. The later
projection-only PR records both revisions. Validation requires the bundle
revision to be an ancestor of the approved attempt head and requires identical
bundle bytes and harness content at the immutable revision, approved head, and
current merged `main`.

Each approval is a new, unedited GitHub PR conversation comment by `faocampo`.
The documentation approval body is exactly:

```text
Approval-Contract: curve.approval/v1
Disposition: APPROVED
Approval-Scope: P0-06A_DOCUMENTATION
Exact-Head: <head-sha>
```

The harness approval changes the scope to `P0-06A_HARNESS`. The attempt
authorization approval is exactly:

```text
Approval-Contract: curve.approval/v1
Disposition: APPROVED
Approval-Scope: P0-06A_ATTEMPT_AUTHORIZATION
Exact-Head: <approved-attempt-pr-head>
Authorization-ID: D003-LOCAL-PROOF-A-2026-08-15-01
Attempt-Manifest-Revision: <immutable-manifest-revision>
Attempt-Manifest-Digest: sha256:<64-lowercase-hex>
Authorization-Bundle-Digest: sha256:<64-lowercase-hex>
```

The future broker-aware trusted controller resolves every comment to its PR and
verifies the exact author, body, head, base/head repositories, merge/ancestry,
approval-before-merge order, and three distinct execution-authority PRs.
Required checks are bound by exact check-run name and GitHub App ID. Head checks
must succeed before approval and belong to the exact PR; post-merge checks must
succeed after merge and before trusted validation time. A later rerun
supersedes an earlier run with the same name/App identity.

The fourth PR is a repository-integrity projection, distinct from the three
execution approvals. Its only changed file is
`docs/technical/proofs/p0-06-stage-record.json`. Federico's unedited comment is
exactly:

```text
Projection-Review-Contract: curve.projection-review/v1
Disposition: VERIFIED
Review-Scope: P0-06A_STAGE_PROJECTION
Exact-Head: <projection-pr-head>
Stage-Record-Digest: sha256:<64-lowercase-hex>
```

The future broker-aware trusted controller derives the head and merge SHAs from
the recorded PR number, recomputes the stage-record digest, requires that exact
one-file diff, validates app-bound head/merge checks, and requires the reviewed
bytes to equal current merged `main`. This review projects already-approved
authority; it grants none.

The live claim-ruleset response is normalized to ID, name, tag target,
repository source, active enforcement, creation/update times, empty bypass
actors, exact include/exclude conditions, and rules, then hashed as
`SHA-256("curve-github-ruleset:v1\0" + canonical-compact-JSON)`. The validator
requires the attempt-approved digest, exact tag include, empty exclusions,
`update` and `deletion` rules, absence of a `creation` rule, an explicitly
returned empty bypass list, and an absent claim ref. GitHub's response fields
and rule types are defined by GitHub REST rulesets documentation
([docs.github.com](https://docs.github.com/en/rest/repos/rules)).

### GitHub Project visual-tracking protocol

GitHub Project #2 is an administrative visualization. Federico Ocampo or
authorized automation may move P0-06 (two-stage local Temporal proof) between
`Backlog`, `Ready`, `In progress`, `In review`, and `Done` to represent the
team's current view. These writes require authenticated Project access and
read-back verification, but no proof lease, start grant, or stage transition.

The versioned stage record is the technical source of truth. The trusted proof
controller ignores the board column when deciding whether it may claim or start
an attempt. It validates the approved packet, immutable manifest, ruleset,
window, broker, claim state, and signed start grant instead.

The attempt manifest's `runtime` object is exact:

```json
{
  "max_duration_seconds": 7200,
  "nano_cpus": 2000000000,
  "memory_bytes": 8589934592,
  "memory_swap_bytes": 8589934592,
  "pids_limit": 256,
  "read_only_root": true,
  "no_new_privileges": true,
  "cap_drop": ["ALL"],
  "tmpfs": {
    "path": "/run/curve-proof",
    "options": "rw,noexec,nosuid,nodev,size=4294967296,mode=0700"
  },
  "network_mode": "none",
  "published_ports": [],
  "restart": "no",
  "stop_grace_seconds": 15,
  "logging": { "driver": "local", "max_size": "10m", "max_file": 3 }
}
```

## P0-06A (isolated Temporal feasibility proof) pinned supply chain

| Component | Exact pin |
| --- | --- |
| Temporal development image index used as the CI binary source | `docker.io/temporalio/temporal:1.8.1@sha256:59561b9ef060eaeb1f46cb6a1842d6cbdd8a393eb3b6d315ecef5fe2f0b1d7a6` |
| Temporal `linux/amd64` manifest/config | `sha256:d7fe04db99586b7e20c3ee96ced04e5585be380b5a565cabb1fb40281f1a64b5` / `sha256:8e96547357a3ab6d8b0087b4e4754e0104da22e8d88e3d8e688cd627d37d9c27` |
| Temporal `linux/arm64` manifest/config | `sha256:92ca723892947bbc7bb0cb2b076dd1c16acf4a79de8661780912d5d49fa16416` / `sha256:37ddc58fab6470b86620ef1fb18d50df0695627a337bb3d24762e3504743605d` |
| Embedded Temporal Server | `1.31.2` |
| Harness Python base index | `docker.io/library/python:3.12.5-slim-bookworm@sha256:c24c34b502635f1f7c4e99dc09a2cbd85d480b7dcfd077198c6b5af138906390` |
| Python `linux/amd64` manifest/config | `sha256:eac7a234d33269f362593c31d2ff1db7b116fbd794929f1f6015f5ea812ff254` / `sha256:d78016d8a6986d091bc02622818bccf0d92b07d8f3e153066cb325d19cc79a1f` |
| Python `linux/arm64` manifest/config | `sha256:f362e1c75ff1670f2776d72cff6ad84094029d2fa73b9fcf5bd7b5b07f45271c` / `sha256:41d3726271f96ae76387e81cd5d98ee9d4c853d402589bbd5a61f2955bbb825c` |
| Temporal Python SDK | `temporalio==1.30.0`; `linux/amd64` wheel SHA-256 `47b156138de30c2cd6723d5bfc06a30abcf680344c5481abb31f2a98a9b1f809`; `linux/arm64` wheel SHA-256 `108d1a56e174eabc18add58316084cdead230e239d3df22bbe999d6954986591` |
| Harness image | Required before internal `P0-06A_READY`: immutable GHCR index/platform/config digests produced from the exact approved harness commit; mutable tags are prohibited at execution |

The harness dependency lock contains every transitive wheel filename, version,
platform marker and SHA-256. CI installs with hash enforcement and disabled
dependency resolution, then scans the image and emits SBOM/provenance. Runtime
has no package index access. Official source metadata: Temporal CLI on GitHub
([github.com/temporalio/cli](https://github.com/temporalio/cli/releases/tag/v1.8.1)),
Temporal Server on GitHub
([github.com/temporalio/temporal](https://github.com/temporalio/temporal/releases/tag/v1.31.2)),
Temporal Python SDK on PyPI
([pypi.org](https://pypi.org/pypi/temporalio/1.30.0/json)), and Python on
Docker Hub
([hub.docker.com](https://hub.docker.com/v2/repositories/library/python/tags/3.12.5-slim-bookworm)).

## P0-06A (isolated Temporal feasibility proof) runtime and timeout model

The reviewed harness image contains the pinned Temporal CLI binary, Python
worker, scenarios, replay fixtures, validator, redaction logic, and a PID-1
supervisor. One container starts server and worker child processes and performs
all scenarios on its own loopback interface. This intentionally proves
primitives rather than the final distributed Plane topology.

The trusted proof controller establishes one absolute expiry from the claim
response's trusted server time: the earlier of 7,200 seconds after claim or the
fixed active-attempt expiry. Its host monotonic deadline starts before the
claim request and includes claim reconciliation, image pull, container create,
evidence extraction, and cleanup. At container create, the controller passes
only the approved expiry and remaining-seconds values. PID 1 starts its own
monotonic timer from that smaller remaining budget, begins graceful shutdown
15 seconds before expiry, and sends final `SIGKILL` no later than expiry.
Compose sets `restart: "no"`; therefore host, daemon, wrapper, or container
failure cannot auto-restart the attempt. A later trusted controller may remove
expired labeled resources through the same reconciliation rules; it never
resumes the consumed attempt.

Runtime enforcement requires:

- exact Docker values from the immutable-input table, read-only root,
  `no-new-privileges`, `cap_drop: [ALL]`, and a 15-second stop/kill grace;
- `network_mode: none`, no project/external/shared network, and no published
  host port; server and worker communicate only over container loopback;
- no Docker socket, host PID/IPC/network, device, bind mount, external/shared
  network or volume, secret, environment file, credential, or added capability;
- no environment key except the non-secret approved absolute-expiry and
  remaining-seconds keys, whose names and values are in the attempt manifest;
- no local image build, dependency installation, package-index access, or
  unpinned image pull; and
- resolved-config validation before create plus applied `HostConfig`, mounts,
  labels, port, network and image-digest inspection after create.

## Workstation and existing-stack safety

The read-only preflight rejects `DOCKER_HOST`, `DOCKER_CONTEXT`, SSH/TCP
endpoints, and any daemon outside the proposed workstation-local Unix socket.
It records the context name, endpoint, daemon ID, architecture, OS, Engine and
Compose versions. These values are committed to the separately reviewed
per-attempt manifest without changing the harness tree or image. A changed
daemon identity, endpoint, context, or socket invalidates that manifest and
requires a new exact-head approval before internal `P0-06A_READY`.

The existing Plane project is discovered from running containers, not from the
temporary worktree's derived Compose name. The preflight requires exactly one
project whose whitelisted Compose labels/config-file path correspond to the
authorized checkout. It records only container/network/volume IDs, names,
image IDs, health/state, loopback port mappings, and whitelisted Compose labels.
The host-side API probe uses the discovered loopback mapping, path `/`, expected
HTTP `200`, and exact body `{"status":"OK"}` before and after the proof.

`docker compose config`, `docker inspect` without a whitelist projection,
environment/command output, `.env` access, and API/container logs from the
existing Plane stack are prohibited because they can disclose credentials.
Structural comparison uses the exact Git blob parsed without interpolation or
environment-file resolution and emits only service names, profile declarations,
network/volume references, and published-port shapes.

## Trusted host-controller boundary

OpenAI Codex is the local technical proof operator. It may invoke only the
approved local harness after receiving a successful claim ticket and may
prepare candidate sanitized evidence. It receives no GitHub repository,
Project, branch, tag, review, or ruleset credential and cannot publish the
candidate output.

A separately named trusted proof controller performs and reconciles every
authority-bearing GitHub mutation: claim-tag creation, evidence-branch creation,
commit, and push. The per-attempt manifest binds that controller's
principal, source revision, executable/config digests, API-operation allowlist,
conformance-result digest, authentication mechanism, token issuer, audience,
exact repository permissions, issue/expiry times, and revocation
commands. Required permissions are limited to Curve metadata read,
contents/refs write, check/ruleset read, and
`pull_requests: write` solely for the single lease-scoped draft terminal-
projection PR creation described below. Administration, workflow, secrets,
environments, deployments, merge, approval, and unrelated repository
access are denied.

The credential broker is an independent activation and GitHub-operation
authority, not a token pass-through. Its source revision, executable/configuration, conformance report,
claim-time ruleset-recheck policy, signed-start-grant schema/key, publication-
attestation schema/key, append-only attestation-store URI template, issuer,
audience, clock policy, and revocation behavior are immutable authorization-
bundle inputs. Conformance must prove single-use redemption, fail-closed clock
and signature handling, exact operation/lease binding, duplicate and lost-
response reconciliation and ruleset/read failure denial. GitHub Project status
is outside this broker contract and cannot mint or substitute for a start grant.

For every write, the controller submits only an opaque lease handle, exact
operation ID, complete approved binding, and idempotency key. The independent
broker/GitHub App boundary atomically validates and consumes that tuple, then
executes the operation or signs and dispatches that exact operation itself. The
controller receives only the opaque lease handle and a signed operation receipt.
A GitHub token, private key, installation credential, bearer secret, or any other
reusable credential never enters the controller process, including process
memory, argv, environment, files, container state, logs, or evidence. Broker
conformance must prove that the controller cannot widen a method, resource, ref,
SHA, force flag, before/after state, call count, or
idempotency key.

GitHub Project status is visual tracking metadata. Federico Ocampo or authorized
administrative automation may update it independently of this proof. The broker
performs a two-phase claim-time check. Immediately before permitting the
single claim request, it independently re-fetches the claim ruleset by approved
ID, normalizes it with the approved algorithm, and verifies the exact tag
target, active enforcement, empty bypass actors, required update/deletion
protection, permitted initial creation, matching attempt-approved digest, and
absent expected claim ref. It also rechecks the authorization/window,
controller principal and source, Plane/context/harness/image digests, and daemon
identity. After the controller reconciles the claim response, the broker
re-fetches the ruleset and exact ref, proves the policy remains unchanged, and
requires the approved SHA before issuing a grant. Only the broker-issued
Ed25519 start grant for that complete observation set is activation authority.
The wrapper must possess and atomically consume that valid grant before it can
create Docker resources.

The current catalog synchronizer is an administrative Project updater, not the
proof controller or broker. It may update P0-06 (two-stage local Temporal proof
work package) status for visual tracking; it cannot issue a start grant, create
the claim/evidence refs, publish proof evidence, or activate Docker.

The current command-line implementation is intentionally narrower. Its no-arg
mode and `--context` are read-only; `--validate-status TASK-ID=<status>` validates
the requested informational projection locally; and write mode requires exactly
one explicit `--status TASK-ID=STATUS` assignment against one existing
synchronizer-owned draft item. It creates no Project item and performs no
full-catalog write. Every catalog package, including P0-06, uses this same
administrative status path.

The controller defines four lease profiles and may issue up to four outcome-
dependent, non-overlapping JIT leases. Their write-operation IDs are lease-
specific so a single allowlist entry cannot be reused under another lease:
execution permits `create-claim-ref` and `create-evidence-ref`; reconciliation
permits `create-reconciliation-evidence-ref`, `update-evidence-ref`, and
`write-evidence-objects`; review disposition produces a signed, immutable receipt
for Federico's exact-evidence-head decision and has no GitHub Project authority;
terminal projection permits only the three publication operations enumerated
below. The execution lease permits preflight, claim, exact evidence-branch
creation, and signed
ticket/start-grant issuance and expires no later than active-attempt expiry.
The reconciliation lease permits only exact-ID cleanup evidence publication,
creation or advancement of the fixed reconciliation-evidence branch, stage-
record reconciliation; it expires at the
earlier of 900 seconds after active expiry or the fixed reconciliation-only
expiry. It cannot claim, start/restart Docker, change approval evidence, or
mutate another ref.

The review-disposition lease is unavailable during proof execution and
execution-evidence publication. After Federico records an attributable
exact-evidence-head disposition, it validates and signs the immutable
disposition receipt that the later terminal projection consumes. It has no
GitHub Project, repository-ref, merge, gate, deployment, or Docker authority and
expires no later than the fixed review deadline. Its states are `UNAVAILABLE`,
`ISSUED`, and terminal `CONSUMED`,
`REVOKED`, or `EXPIRED`. At `P0-06A_READY`, the approved profile path/digest
exists while the actual lease is `UNAVAILABLE` and every lease ID/time/evidence
field is absent. Only `CONSUMED` can authorize publication of the terminal stage
record; `REVOKED` and `EXPIRED` are recorded failure/expiry outcomes.

The terminal-projection publication lease is unavailable until the disposition
lease is consumed, its authority window has ended, and the immutable evidence PR
and its app-bound merge checks are complete. It permits one deterministic
publication plan on the exact
`refs/heads/agent/p0-06a-terminal-projection-d003-2026-08-15-01` branch:

1. `create-terminal-projection-ref` writes deterministic bootstrap objects whose
   parent is the re-read Curve `main` head and creates the absent exact branch;
2. `create-terminal-projection-draft-pr` creates exactly one draft PR against
   `main`; and
3. `finalize-terminal-projection-ref` writes the final three precomputable
   objects and makes one non-force branch update. Those objects are the v2 stage
   record, review-disposition operation evidence, and
   `terminal-projection-publication-intent.json`. The intent binds only the
   re-read base SHA, exact branch, returned PR number, three paths, lease ID/
   principal/issued-at/expiry, operation IDs, and one unique idempotency key per
   operation. It contains no own digest, final head, final file digest,
   success/result, response ID, consumed-at time, or lease-consumption claim.

Each operation is bound to `lease_type: terminal_projection`, is idempotent,
has `max_calls: 1`, and targets only the exact branch or draft-PR collection.
No allowlisted operation can approve or merge a PR.

The credential broker atomically consumes the single-use lease when it redeems
the bound publication plan. After the final branch update and authoritative
GitHub reads, the broker emits a signed, append-only
`curve.p0-06a-publication-attestation/v1` outside the PR at the pre-approved URI.
That attestation, rather than any file inside the commit, binds the exact final
terminal-projection PR head before merge, base SHA, branch, PR number, all three
file paths and raw-byte SHA-256 digests,
GitHub request/response IDs, GitHub App ID/installation and controller principal,
all three operation IDs/idempotency keys/results, and the publication lease ID/
issued/consumed/expiry times. Validation retrieves it by the pinned HTTPS URI,
checks its digest and signature against the immutable authorization-bundle key,
reconciles every field with live GitHub, and rejects a missing, mutable, stale,
duplicated, or unverifiable attestation. A timeout, unexpected branch/PR, extra
path, second PR, force push, mismatched base/head, or ambiguous response consumes
the attempt and cannot be retried under the consumed lease. The lease cannot
mutate Project fields, either runtime evidence branch, another repository ref,
approval, checks, workflow configuration, rulesets, merge state, or deployment
state. Federico reviews and merges through normal repository governance; the
publication controller cannot approve or merge its own PR. The merge SHA,
ancestry, app-bound post-merge checks, and equality of the merged bytes to that
attested PR head are separate post-merge observations; the attestation does not
describe the PR head as already merged.

Every issued lease remains in the independent broker. An unredeemed credential
is revoked as soon as its bounded work completes or on ambiguity/cancellation; a
redeemed lease remains immutably `CONSUMED` and the broker revokes its internal
derived credential at the end of the bounded authority window.
Applied identity, executable, configuration, allowlist, scope, and expiry
checks must pass before use. No controller is named or authorized by this
packet; the attempt-authorization PR must supply and approve every value. The
execution lease must be consumed and expire before reconciliation is issued;
reconciliation must be consumed and expire before Federico's evidence review;
the disposition lease is issued only after that review and after evidence merge
checks, then consumed before its expiry. Its authority window ends before the
terminal-projection publication lease is issued; the publication lease is
consumed before its own expiry and the fixed review deadline. Canonical operation evidence under
`docs/technical/proofs/p0-06a/evidence/` binds every lease ID, principal,
issued/consumed/expiry time, result, and affected Project or repository identity.

The claim handoff uses an Ed25519-signed, single-use ticket and a separately
signed start grant. The attempt manifest pins the public-key digest, ticket and
grant schemas, and controller key ID. The ticket binds schema/version,
authorization ID, claim request/ref/resolved SHA, evidence-base and
documentation/harness/attempt-manifest digests, image index and selected
platform digest, daemon ID, controller principal/source/config digests,
issued-at, expiry, and a 128-bit nonce. The wrapper verifies every field and
signature, then creates an owner-only `O_CREAT|O_EXCL` consumption record bound
to the ticket digest. Replay or mismatch fails closed. It acknowledges the
ticket without starting Docker. Only after the controller reconciles that
durable acknowledgment and the broker completes every independent claim-time
policy/ruleset check does the broker issue the signed start grant. The wrapper
atomically consumes the exact grant before container creation. A missing,
duplicate, expired, mismatched, or ambiguous ticket, acknowledgment, or grant
prohibits Docker and cannot be retried with the consumed authorization.

## Claim and state-transition protocol

### Authoritative state vocabulary

The versioned stage record is the state projection; GitHub, the credential
broker, and immutable operation evidence are authoritative observations that
the controller must reconcile before projecting a transition. Every timestamp
below is an RFC 3339 UTC instant derived from trusted GitHub time and is
write-once. A terminal value never transitions back to an earlier value.

| Field | Complete vocabulary | Initial value | Permitted transition and trigger | Required timestamps/evidence |
| --- | --- | --- | --- | --- |
| `current_stage` | `P0-06A_DESIGN`, `P0-06A_READY`, `P0-06A_REVIEWED` | `P0-06A_DESIGN` | `DESIGN -> READY` records that the internal proof-readiness contract is complete; it grants no activation authority. `READY -> REVIEWED` occurs only in the terminal projection after immutable evidence review and successful disposition. | Stage-record commit, exact projection PR, checks, and merge; the broker start grant remains the sole activation authority. |
| `authorization.state` | `PROPOSED`, `APPROVED`, `CONSUMED`, `REVOKED`, `EXPIRED`; P0-06B alone starts `NOT_AUTHORIZED` | P0-06A: `PROPOSED`; P0-06B: `NOT_AUTHORIZED` | `PROPOSED -> APPROVED` after all three execution-authority approvals and the integrity projection validate; `APPROVED -> CONSUMED` atomically with the first claim request; either `PROPOSED` or `APPROVED` may transition to `REVOKED` on owner/security revocation or to `EXPIRED` when its fixed window closes. P0-06B requires a new packet to move `NOT_AUTHORIZED -> PROPOSED`. | `approved_at` is set only for `APPROVED`; claim request/time and operation evidence bind `CONSUMED`; revocation or expiry record binds the other terminal states. |
| `claim.state` | `UNAVAILABLE`, `UNCLAIMED`, `CONSUMED` | P0-06A: `UNCLAIMED`; P0-06B: `UNAVAILABLE` | `UNCLAIMED -> CONSUMED` before dispatching the single create-ref request. No response can restore `UNCLAIMED`. `UNAVAILABLE -> UNCLAIMED` requires a separately approved future stage packet. | `request_id` and request-start trusted time are mandatory when consumed; `claimed_at` is present only when exact claim creation is reconciled. |
| `claim.outcome` | `null`, `CLAIMED_EXACT`, `CLAIMED_OTHER`, `PREEXISTING`, `ABSENT_AMBIGUOUS`, `FAILED_AMBIGUOUS` | `null` | `null ->` exactly one terminal outcome after create-ref/read-only reconciliation. | Reconciled ref SHA, API/audit observations, and execution operation evidence. |
| `claim.branch_state` | `UNAVAILABLE`, `UNCREATED`, `CREATED_EXACT`, `CREATED_OTHER`, `PREEXISTING`, `AMBIGUOUS`, `EVIDENCE_MERGED` | P0-06A: `UNCREATED`; P0-06B: `UNAVAILABLE` | This is the normal execution-evidence branch. After an exact claim, `UNCREATED` transitions to one observed create result; only `CREATED_EXACT -> EVIDENCE_MERGED` after exact-head evidence review, merge, merge checks, and byte equality. A non-exact claim leaves it `UNCREATED`; recovery uses the separate reconciliation branch. | Branch ref/base/head reads; create request ID/time; evidence PR number/head/merge/check evidence for `EVIDENCE_MERGED`. |
| `claim.reconciliation_branch_state` | `UNAVAILABLE`, `UNCREATED`, `CREATED_EXACT`, `CREATED_OTHER`, `PREEXISTING`, `AMBIGUOUS`, `EVIDENCE_MERGED` | `UNAVAILABLE` | A non-exact claim or pre-ticket failure makes the fixed reconciliation branch eligible and projects `UNAVAILABLE -> UNCREATED`. Under the reconciliation lease, `create-reconciliation-evidence-ref` produces exactly one observed create result; only `CREATED_EXACT -> EVIDENCE_MERGED` after exact-head review, merge, merge checks, and byte equality. It is never used after the normal execution-evidence branch reaches `CREATED_EXACT`. | Fixed branch `refs/heads/agent/p0-06a-reconciliation-evidence-d003-2026-08-15-01`, create request ID/time, base/head reads, evidence PR number/head/merge/check evidence. |
| `claim.ticket_state` | `UNAVAILABLE`, `UNISSUED`, `ISSUED`, `ACKNOWLEDGED`, `START_GRANTED`, `CONSUMED`, `REJECTED`, `REPLAYED`, `AMBIGUOUS` | P0-06A: `UNISSUED`; P0-06B: `UNAVAILABLE` | The success path is `UNISSUED -> ISSUED -> ACKNOWLEDGED -> START_GRANTED -> CONSUMED`; validation failure yields `REJECTED`, duplicate consumption yields `REPLAYED`, and an unreconciled response yields `AMBIGUOUS`. Only a `CREATED_EXACT` branch may enter `ISSUED`; only `CONSUMED` permits container creation. | Ticket ID/digest/issue/acknowledgment times, start-grant digest/consumption time, signature/key ID, and wrapper receipt. |
| Each lease state | Execution: `UNISSUED`, `ISSUED`, `CONSUMED`, `REVOKED`, `EXPIRED`; later leases: `UNAVAILABLE`, `ISSUED`, `CONSUMED`, `REVOKED`, `EXPIRED` | Execution: `UNISSUED`; reconciliation, disposition, publication: `UNAVAILABLE` | Execution issues only after exact authorization/routing validation. If it is redeemed to send a claim, it is `CONSUMED` regardless of the claim result; `REVOKED` or `EXPIRED` is valid only before any claim request, leaves `claim.state=UNCLAIMED`, and uses no runtime-marker path. Reconciliation issues after execution authority ends; disposition issues after evidence review/merge checks and reconciliation authority ends; terminal publication issues after successful disposition and its authority window ends. `ISSUED -> CONSUMED` on one broker redemption; `ISSUED` transitions to `REVOKED` on revocation or `EXPIRED` at its deadline. The terminal PR may project the publication lease only through `ISSUED`; its later `CONSUMED` result exists solely in the signed external publication attestation. | Non-null lease ID, principal, `issued_at`, and `expires_at`; `consumed_at` for the first three leases is recorded in immutable operation evidence. Publication consumption/time is recorded only by the signed external attestation. Each predecessor expiry is no later than the successor issue time. |
| `review.disposition` | `PENDING`, `ACCEPT_STAGE_A`, `REJECT_STAGE_A`, `NEW_AUTHORIZATION_REQUIRED`; P0-06B may use `UNAVAILABLE` before design | `PENDING` | `PENDING ->` one terminal Federico disposition on the exact evidence head. The review deadline permits acceptance/rejection; after it, only `NEW_AUTHORIZATION_REQUIRED` is valid. | Immutable review URL, exact evidence revision, `reviewed_at`, author, canonical body, PR head/merge/check evidence. |

Terminal evidence requirements are outcome-specific:

| Observed path | Execution lease | Ticket/start grant | Evidence branch required before disposition |
| --- | --- | --- | --- |
| Claim not dispatched because the execution lease was revoked or expired | `REVOKED` or `EXPIRED`; no redemption | `UNISSUED`; no ticket or grant | None; `claim.state` remains `UNCLAIMED` and no execution evidence branch is created. |
| Non-exact claim outcome: `CLAIMED_OTHER`, `PREEXISTING`, `ABSENT_AMBIGUOUS`, or `FAILED_AMBIGUOUS` | `CONSUMED`, with execution-operation evidence for the single claim attempt | `UNISSUED`; issuing any ticket or grant is invalid | `claim.reconciliation_branch_state=EVIDENCE_MERGED`; the normal execution branch remains `UNCREATED` or its reconciled non-exact state. |
| `CLAIMED_EXACT` followed by execution-branch, ticket, acknowledgment, or grant failure before container creation | `CONSUMED` | The exact observed terminal value among `UNISSUED`, `REJECTED`, `REPLAYED`, or `AMBIGUOUS`; `CONSUMED` is invalid unless the wrapper consumed the grant | Exactly one reviewed evidence path reaches `EVIDENCE_MERGED`: the normal branch when it was `CREATED_EXACT`, otherwise the fixed reconciliation branch. |
| `CLAIMED_EXACT` with container creation | `CONSUMED` | `CONSUMED`, with valid ticket acknowledgment and broker-issued start-grant receipt | Normal `claim.branch_state=EVIDENCE_MERGED`; the reconciliation branch remains `UNAVAILABLE`. |

Terminal publication validates the row matching the immutable claim/ticket
observations; it never substitutes the successful-run row for an early failure. Exactly one
normal or reconciliation evidence branch must be `EVIDENCE_MERGED` whenever a
claim was dispatched and a human disposition is recorded.

`REVOKED`, `EXPIRED`, `REJECTED`, `REPLAYED`, every ambiguous/mismatched
outcome, and every invalid predecessor are fail-closed. They produce only
bounded reconciliation or incident evidence under an available later lease;
they never authorize execution, approval, terminal publication, or an implicit retry.

Immediately before the first claim request, the trusted proof controller:

1. re-runs the expiry, source, context, harness, image, daemon, stack-baseline,
   controller identity/permissions, ruleset, and reviewer checks, then obtains
   the broker's independent pre-claim
   approval after the broker re-fetches the live ruleset, proves the claim ref
   absent, and revalidates the authorization inputs;
2. starts the host monotonic deadline and submits the one exact create-ref
   binding to the independent broker. The broker atomically consumes the bound
   lease tuple and sends one GitHub create-ref request for the protected claim
   tag at the exact evidence-base SHA; and
3. reconciles the broker's signed receipt and live claim state. For
   `CLAIMED_EXACT`, it creates the evidence branch separately and reconciles the branch to
   the exact evidence-base SHA before ticket issuance. It then completes the
   signed ticket/acknowledgment handshake with the local technical operator.
   The credential broker then performs its independent post-claim ruleset and
   exact-ref rechecks and, only on exact success, issues the signed start grant.
   A missing or ambiguous branch result, ticket, acknowledgment, broker recheck,
   or grant consumes the authorization and
   stops before Docker.

Every create-ref outcome consumes the authorization, including timeout,
connection loss, malformed response, pre-existing ref, or returned mismatch.
The controller performs a read-only ref/audit reconciliation and records
`CLAIMED_EXACT`, `CLAIMED_OTHER`, `PREEXISTING`, `ABSENT_AMBIGUOUS`, or
`FAILED_AMBIGUOUS`. Every result except `CLAIMED_EXACT` stops before ticket or
Docker and proceeds to reconciliation evidence.
After the execution lease ends, the reconciliation lease uses
`create-reconciliation-evidence-ref` to create the absent fixed reconciliation
branch at the evidence-base SHA, publishes only sanitized claim/reconciliation
evidence, and reconciles that branch independently. Neither evidence branch is the
claim ledger and force-push is prohibited. If reconciliation ever finds
an absent claim after dispatch, it records `ABSENT_AMBIGUOUS`, treats the
attempt as consumed, and uses the same fixed
reconciliation branch without retrying execution. Ticket and evidence-branch
terminal values must match the outcome-specific table above. Only an exact
claim, exact normal evidence branch, and atomically consumed broker start grant
may create the proof container. Every other terminal or ambiguous state invokes
reconciliation-only evidence and no retry.

## Evidence contract

Committed evidence lives under `docs/technical/proofs/p0-06a/` and includes:

- `report.md` with every proof threshold, result, and exact evidence revision;
  it contains no later reviewer disposition;
- `evidence-manifest.json` conforming to the reviewed harness schema;
- `replay-history.json` containing synthetic history only;
- `outputs/` containing sanitized canonical command/scenario results sufficient
  for independent review; and
- the exact harness source revision, bundle digest, image/SBOM/provenance
  digests, claim response/reconciliation, and cleanup result.

Only explicitly allowlisted commands are captured. Each output record contains
stable command ID, redacted argv, working directory, UTC start/end, exit code,
byte count, SHA-256, schema version, and redaction disposition. Credential- or
environment-bearing commands are never invoked. Original bytes remain in a
`0700` private temporary directory, capped at 100 MiB, only until the sanitizer
produces canonical output
and both automated scanning and human review pass. Any unexpected secret or
protected value stops the attempt and moves the affected raw file into the
owner-only quarantine path named in the per-attempt manifest. It is never
committed. The manifest must name a Security incident owner before internal
proof readiness;
that owner supplies the retention or destruction disposition. Stage A cannot
be accepted while quarantine disposition is unresolved.

The committed manifest records all source/context/platform/image digests,
runtime limits, applied inspections, scenario results, deadline events,
sentinel scans, and baseline/post-cleanup resource IDs. It is immutable at the
reviewed evidence revision. Federico's attributable review record contains the
exact evidence revision, timestamp, disposition (`ACCEPT_STAGE_A`,
`REJECT_STAGE_A`, or `NEW_AUTHORIZATION_REQUIRED`), rationale, residual risks,
and P0-06B recommendations. The review-disposition lease copies only the
binding fields into the stage record's `review` object; it never rewrites the
reviewed report, manifest, replay history, or output files. Raw hashes are
retained only when the sanitized canonical evidence is independently
sufficient; unavailable secret-bearing bytes are not presented as reproducible
evidence.

Federico records the disposition as a new, unedited comment on the exact
evidence PR head. The evidence PR then merges normally to Curve `main`; the
later stage-record disposition update references this immutable URL and time.
The comment body is exactly:

```text
Review-Contract: curve.proof-review/v1
Disposition: <ACCEPT_STAGE_A|REJECT_STAGE_A|NEW_AUTHORIZATION_REQUIRED>
Evidence-Revision: <40-character-lowercase-head-sha>
Authorization-ID: D003-LOCAL-PROOF-A-2026-08-15-01
```

After that evidence PR and its merge checks complete, the disposition operation
produces the signed immutable review receipt. The separately issued publication
lease creates a draft terminal-projection PR whose final three-file head contains
the v2 stage record, disposition-operation evidence, and the precomputable
publication intent. The signed post-publication attestation remains outside the
PR. After independently verifying that attestation, live GitHub state, the exact
head, and all three bytes/digests, Federico's integrity-review comment is exactly:

```text
Projection-Review-Contract: curve.projection-review/v1
Disposition: VERIFIED
Review-Scope: P0-06A_TERMINAL_PROJECTION
Exact-Head: <terminal-projection-head>
Stage-Record-Digest: sha256:<64-lowercase-hex>
Disposition-Operation-Evidence-Digest: sha256:<64-lowercase-hex>
Terminal-Projection-Publication-Intent-Digest: sha256:<64-lowercase-hex>
Publication-Attestation-URI: <approved-https-uri>
Publication-Attestation-Digest: sha256:<64-lowercase-hex>
Publication-Attestation-Key-ID: <approved-key-id>
Publication-Attestation-Signature: <base64url-signature>
```

## P0-06A (isolated Temporal feasibility proof) proof thresholds

| Step | Required evidence | Pass threshold |
| --- | --- | --- |
| 1. Authorization and claim | Trusted time, controller and broker source/config/conformance/lease checks, claim-time live-ruleset recheck, protected claim and evidence-branch reconciliation, signed ticket/acknowledgment/broker-start-grant records, source/context/harness/attempt/image digests | Exact values, `CLAIMED_EXACT`, `CREATED_EXACT`, and one atomically consumed broker start grant for an executed proof; every other outcome follows the outcome-specific evidence matrix and terminates before Docker. |
| 2. Disabled baseline | Credential-safe structural projection, unique live Plane project/resource IDs, API `200 {"status":"OK"}`, ports, daemon identity, and absence of P0-06A resources | Existing Plane stack is healthy and unchanged; no proof resource exists. |
| 3. Isolated create | Resolved harness configuration and applied runtime inspection | One correctly labeled `network_mode: none` container with exact CPU/memory/swap/PID/tmpfs/log/stop/image/isolation/no-port/no-restart assertions. |
| 4. Durable primitives | Start, signal, query, retry-after-effect, cancellation, worker-child restart, server-child restart, and terminal results | Each scenario reaches its specified state once with no duplicate application effect. |
| 5. Replay | Committed synthetic history and replay output | Fixture digest matches; zero nondeterminism errors. |
| 6. Data boundary | Payload/history/telemetry canonical outputs and sentinel scans | Only approved synthetic values appear; no credential or protected body. |
| 7. Failure and expiry | Provider denial, child failure, wrapper/controller loss simulation, ticket/grant replay, internal watchdog, graceful shutdown, execution-lease expiry, and reconciliation-lease cleanup | No external call, replay, auto-restart, orphaned active child, active mutation after active expiry, or reconciliation mutation after its 15-minute expiry. |
| 8. Cleanup | Label/ID precheck, targeted removal, absence checks, Plane ID comparison, and API probe | All and only P0-06A resources are absent; Plane IDs and health match baseline. |

Every row is mandatory for `ACCEPT_STAGE_A`. Stage A acceptance proves isolated
feasibility only.

## Cleanup rules

Every Docker and host artifact is inventoried before claim. The proof container
carries the exact Compose project label, authorization ID, evidence-base SHA,
expiry timestamp, and stage. The cleanup planner enumerates exact IDs/paths and
aborts if a Docker target lacks every expected label, an ID existed in the
Plane baseline, or a path differs from the approved attempt manifest. Direct
`down --volumes --remove-orphans`, global pruning, name-prefix deletion, and
cleanup through unresolved variables or globs are prohibited.

The exact detached Plane worktree, clean raw-output directory, temporary state,
and candidate directory are removed after sanitized evidence is durably
prepared; post-removal absence is recorded. A quarantined file remains under
owner-only permissions until the named Security incident owner records its
disposition. The harness image ID is removed only when it was absent from the
baseline and no other container references it; otherwise it is retained and
recorded. The execution and reconciliation leases reach their recorded terminal
outcomes before human disposition. A later review-disposition lease is
separately issued, bounded, and consumed by its one terminal transition.
The terminal-publication lease is subsequently issued for the exact three-
operation publication plan; its signed external attestation records consumption
and final GitHub observations. Evidence reports the
disposition of every host path, Docker object, image, credential lease, and
quarantine entry.

## P0-06A (isolated Temporal feasibility proof) terminal transitions

1. Any claim request immediately consumes the authorization.
2. Claim ambiguity, pre-existence, or a mismatched ref stops without Docker; the
   later reconciliation lease creates and publishes the fixed
   reconciliation-evidence branch. `CLAIMED_EXACT` proceeds only through the
   signed ticket and start-grant checks.
3. Any later stop, failure, cancellation, timeout, or completion performs only
   manifest/label/ID-validated cleanup. After active expiry, the trusted
   controller uses only the reconciliation lease to publish the sanitized
   candidate or reconciliation-only evidence. If publication is ambiguous,
   execution never resumes. The
   reconciliation lease is consumed by the bounded reconciliation publication
   or expires without terminal-publication authority; it cannot overlap the earlier
   execution lease.
4. An unclaimed authorization at `claim_by` becomes `EXPIRED`. Once the review
   deadline passes, `ACCEPT_STAGE_A` and `REJECT_STAGE_A` are invalid; Federico
   records an exact-evidence-head `NEW_AUTHORIZATION_REQUIRED` disposition.
5. Federico reviews the exact evidence head; its app-bound head checks, merge,
   and merge checks complete without changing the reviewed bytes. Only then is
   the disposition lease issued. It validates Federico's review and emits the
   signed immutable disposition receipt without Project or repository mutation.
   After the disposition lease's
   authority window ends, the terminal-publication lease creates a draft PR and
   then makes its one final non-force update. The PR changes exactly the v2
   stage record, `evidence/review-disposition-operation.json`, and
   `evidence/terminal-projection-publication-intent.json`. These precomputable
   files record `P0-06A_REVIEWED`, the outcome-specific authorization/claim/
   ticket/branch state, the first three lease outcomes, publication lease issued
   data and intent, exact base/branch/PR
   number/paths, operation IDs, and idempotency keys. The signed external broker/
   GitHub App attestation subsequently binds publication-lease consumption,
   the exact final terminal-projection PR head before merge, all three file
   digests, response IDs, principal, and times. The later merge SHA, ancestry,
   app-bound checks, and merged-byte equality are verified separately.
   Federico verifies and binds that attestation in the canonical
   `P0-06A_TERMINAL_PROJECTION` integrity review; app-bound head/merge checks
   pass and the PR merges. `REJECT_STAGE_A` or
   `NEW_AUTHORIZATION_REQUIRED` leaves no reusable attempt. `ACCEPT_STAGE_A`
   records Stage A as reviewed and leaves P0-06 awaiting the separately approved
   P0-06B architecture and packet. GitHub Project status may be updated
   independently to reflect either outcome.
6. P0-06 reaches `Done` only after P0-06B evidence is accepted. A separate
   owner record then decides whether D-003 `LOCAL_ONLY` can become `DECIDED`.

## P0-06B (least-privilege Plane integration proof) mandatory design inputs

Before P0-06B can receive an authorization ID, its own packet must define and
prove:

- final Plane Compose/profile ownership and off-by-default behavior;
- exact Curve worker image and Plane/Python/Temporal compatibility;
- minimum worker access to PostgreSQL/outbox and any other required service;
- least-privilege networks, ports, identities, credentials and revocation;
- no unnecessary RabbitMQ, Valkey, MinIO, Docker socket, host, or internet
  reachability;
- synthetic schema/data migration boundaries and D-009 exclusions;
- profile absent/present, relay dispatch, worker restart, replay, cancellation,
  Plane regression, rollback and cleanup evidence;
- committed/reviewed executable harness, immutable image supply chain, resource
  limits, time window, protected claim ledger and evidence schema; and
- a separate exact-head approval by Federico Ocampo.

P0-06A cannot supply, infer, or waive any of these values.
