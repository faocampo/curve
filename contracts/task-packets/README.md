# Materialized coding-agent task packets

This directory is the discovery root for closed coding-agent task-packet JSON
records. Store one repository-local packet per `.json` file; nested directories
may group packets by milestone or parent package.

`pnpm check:contracts` performs structural validation here: JSON Schema,
canonical packet digest, cross-field semantics, nested packet/work-package and
Project-item uniqueness, and complete parent/child set validation. It does not
read another checkout or prove that a pinned Git object still resolves.

Before dispatch, run the task-packet materializer/preflight with the exact local
target-repository checkout and a registered `packet_id` from a clean Curve
checkout whose `HEAD` equals the live `origin/main` tip. The CLI uses its own
Curve checkout as the registry trust root and does not accept a caller-selected
Curve path. Before packet selection, it validates the whole registry's discovery
set, packet schemas and semantics, exact equality between each supplied packet
object and its committed registry bytes, and each packet's top-level publication
revisions and ancestry. Arbitrary packet paths are not accepted. After selection,
the readiness preflight resolves the selected packet's digest-bound source
catalog, canonical multi-entry context pack, attested machine state, and nested
authority evidence; proves regular Git blobs from exact commits without
replacement or lazy fetching;
checks target repository identity, clean `HEAD`, and the selected stale-base
rule; and reconciles the stable work-package item in GitHub Project 2. A remote
tip is accepted only as a fresh object that binds the normalized repository
identity, branch, `origin`, timestamp, exact commit, and
`source: GIT_LS_REMOTE`; strings, missing timestamps, stale observations, and
caller-declared sources fail closed. Mutable
Project status is informational. It rejects a `BLOCKED` packet and emits no
implementation authority. Authorization remains a separate human or governed
workflow action.

The materializer performs `READINESS` preflight only. A successful result is
`PASSED_WITH_IMPLEMENTATION_AUTHORITY_REQUIRED` and carries
`state_authority_verification: REQUIRED_BEFORE_IMPLEMENTATION`, blocker
`B-CODING-AUTHORITY-01`, and `implementation_authority_granted: false`. The
separate production `DISPATCH` entry point remains fail closed until the
verifiers in the gate below are approved and implemented.

Every `AVAILABLE` command is checked against the recognized grammar for its
approved `tool_kind`. The current contract recognizes bounded local pnpm/npm/yarn
scripts and exact-offline installs, local CodeQL database analysis, explicitly
read-only Git/GitHub forms, Docker Compose configuration, Node syntax checking,
and Python `compileall`. Package-manager dynamic execution, deploy/publish/release
scripts, Git configuration/aliases/exec-paths or mutation, GitHub Project or
other mutation, inline interpreter evaluation, host-privileged Docker forms,
and unknown task-runner forms fail closed. `--prefer-offline` remains
network-capable; only exact `--offline` satisfies the offline install grammar.

Tool preflight binds the command's tool kind to one PATH launcher, its declared
regular-file or symlink mode, the canonical realpath basename, exact executable
bytes, and the approved isolated version probe. Multiple PATH launchers,
undeclared symlinks, alias targets, substituted bytes, and version mismatches
fail closed.

```shell
node scripts/materialize-coding-agent-task-packet.mjs \
  --packet-id CURVE-M0-S6A \
  --target-repo /absolute/path/to/plane \
  --project-owner faocampo
```

The registry is intentionally empty in the schema-publication revision. A
materialized packet uses four distinct, ordered revision roles so no file must
predict the commit that will contain itself:

1. **Normative source revision (`S`).** Merge the approved schemas, governance,
   requirements, contracts, repository instructions, context-entry bytes, and
   applicable authority inputs. `curve_binding.curve_revision` means `S`.
   Direct Curve references and every Context Manifest entry must use `S`.
2. **Evidence publication revisions (`E1..En`).** Publish digest-bound authority
   sources first, then any state records that cite them, plus the Context
   Manifest. Each artifact carries the exact commit that contains its bytes.
   Every evidence commit must descend from `S`; each authority-source commit
   must precede its consuming state-record commit.
3. **Source-catalog revision (`C`).** Publish the catalog only after all packet
   fields other than `packet_digest` and `source_catalog_binding` are stable.
   The canonical packet projection deliberately excludes those two self-bound
   fields and visual-only Project status. `C` must descend from `S` and every
   referenced evidence publication.
4. **Registry publication revision (`P`).** Seal the packet with its catalog
   reference, add only the packet JSON to this directory, and merge it. `P`
   must descend from `C`; the clean Curve checkout and live `origin/main` must
   both equal `P` during materialization.
5. Run the whole-registry structural and top-level publication preflight. Then
   run the full nested-evidence readiness preflight for the selected packet and
   bind any implementation authorization to the packet digest, context digest,
   repositories, exact target base SHA, normative source revision, and the
   registry-published packet bytes.

The source catalog itself lives outside this packet-only discovery directory.
All referenced revisions remain immutable raw-byte/digest bindings. Readiness
preflight verifies `S -> E1..En -> C -> P` ancestry and rejects sibling,
unmerged, reversed, missing, non-commit, or locally edited evidence.

## State-authority verifier gate

State records and their embedded attestations are claims; their repository bytes
cannot independently establish actor identity, current role membership,
authority scope, required multi-role separation, issuance, or revocation. The
production dispatch entry point therefore remains fail closed until a material
security/provider decision approves and implements both interfaces below:

- A trusted external state-authority verifier that independently binds actor
  identity and role, workspace, exact authority scope, subject/state/digest,
  state-record and authority-source bytes/revisions, issuance/revocation, and
  returns all authoritative distinct required roles. Dispatch must require one
  active, independently verified, distinct human for every required role.
- A trusted deterministic derivation verifier for SYSTEM dependency completion
  that independently executes or verifies the exact derivation contract against
  digest-bound input and output bytes. A packet assertion or embedded SYSTEM
  attestation cannot establish `machine_derived`.

The identity/role authority, signature or equivalent proof mechanism,
revocation source, verifier deployment boundary, and the governing security
decision remain explicitly unresolved. This publication does not select an IdP,
signature provider, or trust service. The exported test-only remote/controller
seams exercise contract behavior and are unavailable to the production
materializer.

An empty registry, a locally edited packet, a `BLOCKED` packet, or a preflight
result without a separate exact-digest authorization grants no command-execution
authority.

The canonical schema fixture remains under
[`contracts/schemas/examples/coding-agent-task-packet.valid.json`](../schemas/examples/coding-agent-task-packet.valid.json)
(real M1-01B blocked-readiness specimen). It is validation evidence and is not a
materialized dispatch packet.
