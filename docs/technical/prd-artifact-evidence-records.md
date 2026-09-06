# PRD artifact and evidence records

## Candidate scope

Version 0.1 candidate. This package defines immutable metadata linking a manually
authored external PRD checkpoint to its ArtifactVersion and exact evidence set.
It extends [external PRD conformance](m1-external-prd-checkpoints.md) (submission,
approval and API boundary) under the [domain model](domain-model.md) (Artifact,
version and evidence ownership) and [integration contract](integration-contracts.md)
(external authoring, source access and immutable approval checkpoints).

The [record schema](../../contracts/schemas/prd-artifact-records-v1.schema.json)
(closed Artifact, submitted ArtifactVersion, EvidenceItem and EvidenceSnapshot
metadata) and [graph validator](../../scripts/lib/prd-artifact-records.mjs)
(exact body/evidence/policy/attribution linkage and chronology) provide executable
conformance. They implement no provider read, storage, database migration or
authorization lookup. Protected-body activation remains subject to the
[security specification](security-and-operations.md) (retention, access and
publication controls) and its consuming policy/storage gates.

## Record semantics

- An Artifact owns one logical PRD and its current-version pointer. Every
  submitted ArtifactVersion has an immutable number, parent, protected body
  reference/digest, body schema, author and evidence snapshot.
- This manual-first candidate accepts human authors and no generation
  provenance. Model-generated versions need their own complete provenance and
  provider-policy contract before this schema can support them.
- `SUBMITTED` is the immutable capture state in this candidate. Approval,
  requested changes, rejection and supersession are separate appended decisions
  and lifecycle projections; they never overwrite the capture body. Consuming
  readers must derive the current review status from those decisions.
- EvidenceItem versions carry provider/source identity, source version,
  retrieval principal, classification, exact AccessEnvelope, trust/redaction
  state and retention-policy reference. An absent body preserves historical
  metadata and provides no proof that material evidence is currently readable.
- A snapshot binds one ArtifactVersion and an ordered, immutable evidence set.
  The explicit empty set represents a PRD with no material source evidence.
  Material entries need stable claim references. Excerpt bodies remain protected
  references with their own required runtime access/lineage proof.

The snapshot digest covers every snapshot field except the digest itself:
identity, workspace, Initiative, ArtifactVersion, creation instant, item order,
evidence identities/versions, source versions, content/envelope digests, material
flags, claim references and excerpt references. Canonical object-key order has
no effect. Membership and array order remain significant.

The graph validator requires the exact current ArtifactVersion pointer,
checkpoint body object/digest/length/media type, author, evidence and policy
references. It verifies same-workspace/Initiative ownership, consecutive version
lineage, deterministic evidence order, exact source/envelope membership,
classification/principal agreement and chronology. Inputs remain unchanged.
Capture and retrieval instants are normalized to UTC before graph validation;
unrepresentable instants, including unsupported leap seconds, fail closed.

## Remaining consuming implementation

Before this package can support the live submission/approval path, the child
packet must supply and verify:

1. PRD body/completeness and structural-diff rules for the supported normalized
   Google document, stable requirement/claim references, open questions and
   material evidence mapping. A body-schema name is not evidence of validation.
2. Database tenant foreign keys, immutable EvidenceItem versions and snapshot
   membership, ArtifactVersion parent/number uniqueness, append-only decision
   history and atomic checkpoint/Artifact/evidence/audit/outbox commits.
3. Current source/evidence access, envelope expiry/revocation, classification
   inheritance into the PRD envelope, destination policy and exact excerpt
   derivation/access checks. Stored envelope metadata is historical evidence,
   not a reusable permission grant.
4. Protected-body retrieval, byte/digest reproduction, permitted body absence,
   retention/hold/erasure controls and approved normalization-schema resolution.
5. The versioned authorization/event contracts, typed API consumers, worker
   replay/concurrency tests, review-status projection and authenticated UI flow.

The [automated tests](../../scripts/tests/prd-artifact-records.test.mjs)
(closed schemas, exact links, tampering, tenancy, source/envelope substitution,
lineage and chronology) use fabricated IDs and body digests. They check metadata
consistency rather than claiming those digests prove stored bytes exist.

Run `node --test scripts/tests/prd-artifact-records.test.mjs`. Runtime acceptance
must additionally exercise actual storage, policy, database and browser behavior.
Rollback removes this additive candidate package; it creates no persisted body
or deployed resource and changes no existing published contract pin.
