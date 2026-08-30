# Coding-agent implementation authorizations

This directory is the canonical discovery root for human-bound coding-agent
implementation authorization JSON records. An authorization is separate from a
task packet: packet `READY` state and read-only preflight establish codeability,
while one current `ACTIVE` authorization permits the explicitly listed agent
workflow actions for the exact workspace, attempt, and digest-bound packet.

Store one record per `authorization_id` and `authorization_version` in a `.json`
file and retain every prior version. An issuance starts at version one with
`ACTIVE` lifecycle. Its optional revocation is version two under the same ID,
has `REVOKED` lifecycle, references version one, and carries a canonical
revocation subject, human revocation attestation, time, and rationale. An ID
cannot be reactivated or extended; a later grant is a new authorization ID with
a newly attested subject. Registry validation rejects gaps, duplicate ID/version
pairs, a non-latest revocation, and duplicate effective active grants for the
same workspace, packet, and attempt. The CLI requires an exact ID and version
and rejects a selected version when a newer version exists.

The standalone authorization-inspection CLI accepts only the closed argument
grammar documented by this directory and does not accept arbitrary
authorization paths. The control-plane library also requires the Curve
checkout to be clean and exactly equal to the live remote `origin/main` tip.
The selected authorization is read back as an exact regular Git blob from that
current revision before its bytes, canonical approval-subject digest, human
attestation, validity window, lifecycle, and complete packet projection are
validated. Merged governance establishes policy provenance; it does not prove
the identity, role, or authority of the human who approved a specific attempt.
Every approval and revocation therefore carries an opaque immutable authority
receipt and must be independently verified by a configured trusted
human-authority verifier on every dispatch. The controller creates a unique
256-bit request nonce and exact `requested_at` instant. The verifier result,
immutable verification receipt, and source-receipt revocation check bind that
nonce, the canonical request digest, human identity, exact authority role,
workspace, `AUTHORIZE_IMPLEMENTATION` or `REVOKE_IMPLEMENTATION` action,
subject digest, issue time, and source receipt. The result and a fresh
`NOT_REVOKED` source-receipt observation must be no more than 15 seconds old.
Stale, replayed, mismatched, revoked, unknown, self-declared, substituted, or
unverified authority fails closed. The production entry point uses its own wall
clock and rejects caller-supplied time. No IdP, signature service, or receipt
provider is selected by this contract.

The packet may bind an older Curve revision only when that revision
is an ancestor of current `origin/main`; every packet/context reference is still
resolved as an exact regular blob from its bound historical revision.

An authorization grants no merge, deployment, provider call, credential,
protected-data, or infrastructure capability. External effects remain limited
to the task packet's exact trusted-controller policy. The
`REQUEST_TRUSTED_CONTROLLER_EFFECTS` action is valid only for an `APPROVED`
`TRUSTED_CONTROLLER_ONLY` policy with at least one effect and controller
contract. The authority result returns canonical digests for both arrays so the
trusted controller can reject substitutions.

Authority is returned only after a configured durable attempt-lease provider
atomically acquires one single-consumption lease for the exact workspace,
current nonterminal attempt, packet digest, authorization ID/version, lease ID,
expiry, and deterministic idempotency key. Replay, concurrent acquisition,
terminal, cancelled, replaced, cross-workspace, or stale-lease results fail
closed. The immutable lease receipt is part of the returned authority evidence.
The lease provider remains a control-plane integration boundary; this contract
does not select a database or runtime implementation.

Local Git trust uses a branded runner created from the fixed absolute verified
`/usr/bin/git` executable or an explicitly bound trusted-controller resolver.
The runner constructs a minimal environment, ignores inherited Git transport
and configuration overrides, rejects executable local Git configuration, and
requires a fresh observation that exactly binds `origin`, the requested branch,
and the configured observation source. Test doubles are accepted only through
the explicitly named trusted-test seam.

The registry is intentionally empty in this schema-publication revision. The
publication sequence is:

1. Merge the task-packet and implementation-authorization contracts and
   verifier.
2. Materialize and merge the exact task packet in the task-packet registry.
3. Record the explicit human approval as an authorization whose subject binds
   that packet's immutable digest and complete execution tuple.
4. Merge the authorization record, use an exact clean `origin/main` checkout,
   integrate the trusted human-authority verifier and durable attempt-lease
   provider in the Curve control plane, and run the separate authorization
   decision before any implementation mutation.

The standalone CLI validates argument grammar only. It never authorizes or
starts real execution because it has no authority-verifier or attempt-lease
implementation. It rejects every invocation before registry access or
preflight. A future control-plane adapter must call the fail-closed library,
supply both reviewed trusted providers, and be bound as trusted platform code;
caller-selected modules, commands, or task-packet preflight validators are not
accepted. Positive authorization semantics are exercised only through the
explicitly tagged test-controller entry point; the production authorization
entry point cannot use that option.

Missing, locally edited, unmerged, future, expired, revoked, non-human, or
projection-mismatched authorization evidence fails closed.
