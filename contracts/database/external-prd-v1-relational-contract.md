# External PRD persistence and command contract

## Status and scope

Version 0.1 candidate, 2026-09-05. This defines the next runtime implementation
boundary for M1-06A (PRD submission) and M1-07A (Product Approval). It specifies
metadata, protected-body references, asynchronous commands and transaction
invariants. It creates no database migration and enables no storage or provider.

The [integration contract](../../docs/technical/integration-contracts.md)
(external authoring, immutable checkpoints and exact approval) and
[security specification](../../docs/technical/security-and-operations.md)
(tenant isolation, data access, retention and disclosure) are authoritative.
D-009 (retention/erasure), M0-04 (protected storage), D-012
(documentation-provider activation) and the consuming child packet remain gates.
The [retention proposal](../governance/d009-retention-policy-v1.json)
(unresolved policy and disabled activation) is unchanged. No candidate retention
duration or private deployment value is part of this contract.

## Published wire contract

The [external PRD schema](../schemas/external-prd-v1.schema.json) (closed binding,
checkpoint, approval and command shapes) and [candidate OpenAPI](../openapi/external-prd-v1.openapi.json)
(workspace-scoped reads and asynchronous link/create/submit/approve/reconcile)
define the runtime-facing boundary. The OpenAPI extension is separate from the
existing pinned API edition and explicitly disabled pending consuming contracts.
It uses the current Plane default session cookie name; deployments must bind
the actual approved session/CSRF configuration before activation.

Resource IDs use the existing UUID-based common contract. External provider
IDs and versions remain bounded opaque strings; the Google adapter additionally
validates decimal version precision. Server code derives document URLs from
validated provider identity, and the configured provider allowlist constrains
their destination. URL syntax alone provides no access or SSRF authorization.
Provider temporary access URLs and credentials have no fields in these records.

## Logical tables and foreign keys

Names below are candidate logical tables. The consuming migration must bind
the exact physical names against its accepted Plane base.

| Record | Required persistence invariants |
| --- | --- |
| ExternalDocumentBinding | Workspace/Initiative/provider connection foreign keys; one PRD binding per Initiative; immutable connection/file identity after binding; actor attribution and optimistic version; current access/sync projection |
| DocumentCheckpoint | Append-only metadata; unique `(workspace_id, binding_id, checkpoint_number)`; same-workspace binding, ArtifactVersion, EvidenceSnapshot, access/completeness evaluations and policy references; immutable source identity/version/digest and object reference |
| GateDecision | Append-only decision bound to assignment, checkpoint, ArtifactVersion, digest, source version, evidence and policy versions; current active human Product Approver attribution and provider-validation cutoff |
| Initiative pointers | Current submitted checkpoint and controlling PRD decision belong to the same workspace and Initiative; changed only in the submission/approval transaction |
| Command/Operation | Existing workspace/actor/command/target-scoped idempotency identity, request digest, result reference, aggregate precondition and command state |
| Audit/outbox | Append-only, same-workspace metadata committed with each authoritative domain transition; no document body or raw provider response |

Composite tenant foreign keys or equivalent database-backed integrity checks
must prevent cross-workspace references. A globally unique UUID is insufficient.
The one-binding constraint prevents silently replacing a reviewed source.
Rebinding and deleting a source binding require a separately approved successor
policy. Allowed container moves update current projection while historical
checkpoints retain their original captured container.

Every submission creates a corresponding immutable PRD ArtifactVersion,
referenced by the checkpoint. Material evidence is represented by an immutable
EvidenceSnapshot; a document with no material evidence uses an explicitly empty
snapshot. A checkpoint must never point at a mutable draft or a different
Initiative's artifact. The exact ArtifactVersion and EvidenceSnapshot schemas,
PRD completeness rules, policy extension and migration are remaining consuming
contracts, not implied by the existence of this metadata candidate.

## Body handling and immutability

`normalized_content_ref` uses the existing protected ObjectRef contract:
object ID, digest, byte length and media type. The digest must match
`content_digest`; media type is `application/json`; the retained canonical
bytes must reproduce the same digest. A checkpoint pins its normalization
schema, retention-policy version and AccessEnvelope. Ordinary metadata queries
return references; protected content goes through a separately authorized
stream/preview interface with current source and evidence access.

There is no database-text or inline-JSON fallback for an unavailable storage
adapter. No object may be persisted before the applicable policy/storage gates
pass. Capture promotion follows the approved staging/quarantine lifecycle;
failed commands schedule cleanup through that policy and never invent a TTL.
Legal hold, tombstones, erasure, orphan cleanup and restored-copy handling are
delegated to the activated protected-storage contract. Erased bodies retain
truthful metadata and availability state; a cached copy cannot bypass access.

Submission type remains `SUBMITTED`; approval and supersession are separate
append-only records. Runtime database guards must reject updates or deletes
of immutable capture/decision fields, including through bulk ORM operations.
Authorized body erasure occurs through the storage lifecycle and preserves
the lawful metadata history.

## Command processing and concurrency

All five commands require the current Initiative `If-Match` and an
`Idempotency-Key`. The server derives actor, workspace, current memberships,
object ACL, policy and approved connection/configuration. Unknown request
fields fail validation, including supplied actor identities and direct URLs.

1. Authorize scope, action, state, precondition and activation before enqueuing
   work. Persist the command, Operation and outbox atomically. Return `202` with
   Operation location and the accepted Initiative ETag; the Operation query
   supplies its own ETag. Acceptance is distinct from lifecycle completion.
2. A trusted activity obtains current permission and performs provider work
   outside the transaction. Link validates a one-use Picker receipt bound to
   actor/workspace/connection/file. Create resolves approved template and
   destination configurations; ambiguous creation reconciles by stable marker.
3. Submit/approve read metadata, complete normalized document content, then
   metadata again. Require stable source version and location/access at both
   reads. Validate exact material evidence and PRD completeness. A prior
   completeness result is reusable only when its binding, digest, version,
   evidence and rule profile still match.
4. For submission, obtain an immutable protected-object reference through the
   approved adapter. At commit, lock the workspace-scoped Initiative and current
   binding, recheck original version, cancellation fence, creator/contributor authority,
   evidence/access validity and policy. Append ArtifactVersion/checkpoint,
   advance its number/pointer, enter PRD Review and commit audit/outbox/result.
5. For approval, recheck current assignment IDs, active membership, object and
   evidence access, policy, risk and three-person separation. Lock and compare
   Initiative/current checkpoint; match every displayed subject field. Append
   one controlling GateDecision, enter Planning and commit audit/outbox/result.
6. Conflict, cancellation or lost access leaves domain state unchanged and
   records a safe failure. A captured but unreferenced object follows the
   approved orphan-cleanup policy.

The current submitted checkpoint ID and digest are the approval subject.
Submission authority is a current action-specific decision for the authenticated
creator or authorized contributor. Bind it to workspace, Initiative, source
binding, aggregate version and policy version, then re-evaluate it at final
commit. Persist its decision identity with submission audit metadata. Neither a
general workspace role nor a client-supplied contributor flag grants submission.
Metadata-only provider version drift conservatively requires a successor.
Risk confirmation must use the current three active human assignments; Standard
and High require distinct people. No administrator or service role substitutes
for the assigned Product Approver. Policy/evidence must be rechecked at the
final use; a stored allow result is not a reusable grant.

Duplicate keys with equal canonical request digests return the original command
result after current authorization. Different payloads return `409`. Distinct
keys racing against one Initiative version yield one committed transition;
the loser fails the precondition. A delayed duplicate approval cannot approve
a successor. Permit one active create command per workspace/Initiative/artifact
through a database-backed active-command constraint and fenced controller lease.
An expired lease with an unresolved provider call requires reconciliation before
another mutation. The stable external marker is a recovery key, not a provider
uniqueness guarantee. Multiple matching documents or an unprovable outcome
remain an explicit ambiguous-operation failure for authorized recovery; the
controller must not select or delete one silently. Provider mutations never
run inside the database lock.

Google and Curve do not share a transaction. Record the final provider-read
cutoff. An edit after this cutoff can be discovered after approval; preserve the
approved checkpoint and project `CHANGED_SINCE_APPROVAL`. Reconciliation updates
source health/freshness and never infers a Gate decision or material-change
lifecycle transition.

## Verification and rollback before activation

The [record conformance checks](../../scripts/lib/external-prd-records.mjs)
(tenant linkage, object/digest equality, successor numbering, exact decision
subject and active human assignment consistency) supplement schema validation.
They are pure record checks, not a replacement for runtime authentication,
provider reads, policy evaluation or database constraints.

The consuming implementation must prove:

- forward/reverse migrations on a disposable database, including real database
  FK/unique/immutability failures and preservation of unrelated Plane entities;
- same-key replay, different-payload conflict, two-key races, worker redelivery,
  cancellation and transaction/outbox rollback;
- approval subject/risk/assignment races, expired membership, revoked access,
  policy supersession and inaccessible material evidence;
- source capture races, unsupported content, provider outage, deleted/moved
  files, ambiguous creation and no identity fallback;
- protected-object digest/byte verification, promotion/orphan cleanup and
  all approved retention/hold/erasure/restore controls;
- typed client, keyboard, responsive preview, submit/review states and
  authenticated browser coverage using synthetic provider fixtures;
- disabled-capability behavior, safe errors and full disclosure checks.

Rollback first disables commands, fences in-flight activities and reconciles
accepted Operations; it preserves lawful historical metadata. The additive
migration is reversible only before retained use. After activation use the
approved compensating-migration/retention procedure. A code rollback cannot
implicitly delete a provider document, checkpoint or approval history.
