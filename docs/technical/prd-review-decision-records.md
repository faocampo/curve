# PRD review decision persistence

## Candidate boundary

This candidate defines the durable metadata representation of the existing
[review decision](../../contracts/schemas/external-prd-v1.schema.json)
(exact submitted subject, human attribution and terminal review outcome).
The [metadata schema](../../contracts/schemas/prd-review-decision-record-v1.schema.json)
(closed decision fields and protected rationale reference) preserves those
subject fields while separating user-authored rationale from ordinary metadata.
It introduces no provider, storage activation or retention duration.

## Rationale bytes and safe projections

Rationale is the original nonblank string of 1 through 2000 Unicode scalar values,
encoded as UTF-8 without trimming, newline replacement or Unicode normalization.
Reject unpaired surrogates. The protected ObjectRef has its SHA-256 digest, exact
byte length (1 through 8000), object ID and `text/plain; charset=utf-8` media type.
Bind separate rationale AccessEnvelope and retention-policy version references.
This envelope inherits the applicable source/classification restrictions; a PRD
envelope is never automatically a permission grant for a reviewer-authored body.

The metadata representation contains no `rationale`, excerpt, inline body, URL
or credential fallback. Capture must verify the actual bytes before writing the
reference. Authorized retrieval must reproduce byte length and digest before
reconstructing the existing Decision wire projection with `schema_version: 1.0`
and the original rationale string. Schema validity alone proves neither storage
existence nor current permission. An erased, held, revoked or unavailable body
must follow the current storage/access policy and truthful availability path;
readers must never invent replacement rationale or recover it from logs.

## Persistence and transaction requirements

- Keep terminal outcomes `APPROVED`, `CHANGES_REQUESTED` and `REJECTED` immutable.
  One terminal decision controls each submitted checkpoint. A return to Aligning
  requires a new checkpoint before another decision, including unchanged content.
- Bind the exact same-workspace Initiative, Product Approver assignment,
  checkpoint, native ArtifactVersion, digest, source version and EvidenceSnapshot.
  Preserve policy version IDs, current-access evaluation identity, confirmed risk,
  authenticated human actor, decision time and provider-validation cutoff.
- Before commit, lock the Initiative/current checkpoint and recheck version,
  state, active human assignments and membership, separation, source/evidence
  access, body integrity, policy and the action-specific authorization result.
  Stored allow/access metadata is historical evidence and cannot authorize replay.
- Commit the decision, Initiative pointer/state, command idempotency result and
  audit/outbox in one transaction. Competing outcomes have one winner; a replay
  reauthorizes and returns the original result without another decision/event.
- Exclude rationale from errors, ordinary metadata serializers, audit/outbox,
  Operation summaries, notification previews and logs. Give rationale reads their
  own current authorization and approved erasure/restore behavior.
- Enforce composite tenant references, exact subjects, chronology, uniqueness and
  append-only row guards in the database. Reverse only empty metadata tables;
  retained history requires a preserving migration or governed retention action.

The [relational contract](../../contracts/database/external-prd-v1-relational-contract.md)
(asynchronous command and lifecycle invariants) and
[security specification](security-and-operations.md) (classified storage,
authorization, retention and publication) remain authoritative. Implementation
may use disposable synthetic metadata while live protected storage is gated.

## Verification

Prove original-byte round trips, Unicode boundaries, wrong object digest/length,
closed metadata, current assigned human attribution, stale/competing decisions,
cross-tenant and cross-Initiative references, database immutability, transaction
rollback, retained-history migration refusal and independently authorized reads.
Synthetic byte/reference tests demonstrate the representation only. Live storage,
provider, lifecycle/API and authenticated browser checks remain required before
claiming the completed approval workflow.
