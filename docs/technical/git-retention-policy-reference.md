# Git retention policy versions

Status: additive candidate wire contracts; runtime migration and activation remain pending.

The [Git retention reference](../../contracts/schemas/git-retention-policy-reference-v1.schema.json)
(full commit identity) identifies the exact policy commit. Trusted workspace
configuration binds that commit to an approved repository and policy path.
Keep actual governance repository locations, policy values and approval evidence
in approved private configuration. Public fixtures use fabricated commit IDs.

## Versioned record families

| Candidate schema | Change |
| --- | --- |
| [Artifact records v2](../../contracts/schemas/prd-artifact-records-v2.schema.json) (artifact, version, evidence and snapshot metadata) | `2.0-candidate`; retention IDs contain full Git commits; evidence uses access envelope v2 |
| [External PRD v2](../../contracts/schemas/external-prd-v2.schema.json) (binding, checkpoint and decision wire records) | `2.0`; checkpoint retention ID contains a full Git commit |
| [Review record v2](../../contracts/schemas/prd-review-decision-record-v2.schema.json) (protected rationale metadata) | `2.0-candidate`; rationale retention ID contains a full Git commit |
| [Access envelope v2](../../contracts/schemas/access-envelope-v2.schema.json) (scoped access and retention metadata) | `2.0`; retention resource reference contains a full Git commit |

Existing v1 schemas and records retain their original UUID identities and bytes.
Readers select the exact schema from the explicit record version. Never infer
the version from string length or rewrite an immutable historical record.
Policy commit identity is distinct from artifact IDs, access-envelope IDs,
aggregate counters and other policy decision IDs; their types remain unchanged.

## Resolution and authority

Resolve a full commit object in the approved scoped repository, read the policy
at its exact path and verify current approval and activation evidence. Reject
branches, tags, abbreviated hashes, revision expressions, replacement objects,
unapproved commits and inaccessible policies. The initial format supports full
lowercase SHA-1 Git object IDs; another object format needs an explicit version.
A commit reference establishes version identity, not permission or deployment
readiness. Recheck source access and active policy at capture, approval and erasure.

## Required database and service migration

Add an explicit metadata record version and a commit-capable retention column
with version-dependent constraints. Preserve legacy UUID values and immutable
history. Update evidence-envelope equality, checkpoint/artifact agreement,
rationale acceptance/completion, outbox serialization and exact-schema validators
together. Retain parent/successor and cross-workspace constraints. A rollback
must refuse to drop or cast retained commit-based records into UUID columns.

Cross-version history remains readable. A successor may reference a historical
parent under its original version, while each new record graph must pass its
declared schema and current policy authorization. Changing an envelope changes
its digest; snapshots must retain the exact referenced envelope digest rather
than recalculate historical evidence. Test direct SQL, concurrent append,
rollback preservation and original schema pins before enabling new writes.

These contracts perform no provider calls, body persistence or activation.
