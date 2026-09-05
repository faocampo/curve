# External PRD checkpoint conformance

## Status and authority

Version 1.0 candidate, 2026-09-05. This package provides executable synthetic
contracts for M1-06A (immutable PRD submission) and M1-07A (exact-version Product
Approval). It extends the [integration contract](integration-contracts.md)
(provider-neutral external authoring, lifecycle, access and reconciliation)
on the sanitized public baseline. Existing published contract pins are unchanged.

Google Docs is the visible authoring repository. Curve owns submitted
checkpoints, decisions and Initiative state. The primary editing action opens
the external document; any Curve preview is read-only and permission checked.

The package is an in-memory conformance model, with no app routes, database
migration, network transport, credentials, provider fallback or protected-body
storage. Its `synthetic` flag is a test-mode assertion, not a data-classification
or authorization mechanism. Tests supply fabricated authority and observations;
a runtime controller must derive them from authenticated policy/provider reads.

The [security specification](security-and-operations.md) (public disclosure,
tenant isolation, current source access and protected-data controls) and
[M1 parent packet](m1-alignment-evidence-prd-task-packet.md) (dependencies,
artifact persistence blocker, child contracts and delivery gates) still apply.
D-009 (retention, legal hold, backup and erasure), D-012 (documentation-provider
activation) and the approved protected-storage contract gate live activation.
This package supplies no private deployment values or retention defaults.

## Implemented behavior

| Command or observation | Conformance result |
| --- | --- |
| Creator submits while Aligning | Capture immutable checkpoint 1 and enter PRD Review |
| Creator submits a successor during review | Increment checkpoint number, retain predecessor and advance the Initiative version |
| Assigned active human approves the exact unchanged checkpoint | Append a decision identifying the binding, provider connection/file/version, digest and evidence snapshot; enter Planning |
| Source version or normalized content changes during review | Reject approval; require a successor submission |
| Actor loses workspace/object/source/evidence access | Reject the affected command |
| Binding, workspace or provider connection is substituted | Reject the affected command |
| Source changes after approval | Preserve Planning and approved checkpoint; project `CHANGED_SINCE_APPROVAL` |
| Caller requests a material-change lifecycle transition | Return `MATERIAL_CHANGE_POLICY_REQUIRED` until a separate product policy is approved |

The existing app owns Draft to Aligning. This conformance model starts from
Aligning and does not claim a completed browser flow. It rejects submission
from Draft, Paused, Cancelled and Planning. Submissions use the creator-only
candidate policy; broader contributor rights require an explicit policy version.

The [lifecycle model](../../scripts/lib/external-prd-lifecycle.mjs) (pure submit,
successor and approval transitions) returns new immutable values. It preserves
its input, emits content-free submission metadata, derives attribution from the
trusted synthetic actor and rejects extra command fields. It verifies expected
Initiative versions and current checkpoint identity. Repeating a transition
with a stale version fails; durable idempotent replay remains an API/database
implementation requirement.

## Checkpoint and content boundary

The [checkpoint envelope schema](../../contracts/schemas/google-docs-checkpoint-candidate.schema.json)
(closed synthetic checkpoint metadata with inline test content) uses
provider-neutral snake_case domain fields, including
`external_document_binding_id`, `provider_connection_id`, `provider_file_id`,
`provider_container_id`, `provider_version`, `revision_id`, `checkpoint_number`,
`checkpoint_type`, `normalized_content_ref`, `content_digest`, `schema_version`,
`submitted_or_approved_by` and `recorded_at`.

The inline `normalized_content` field exists only in the synthetic test
envelope. Runtime metadata must carry `normalized_content_ref`; the body must
be retrieved through the approved protected-storage adapter after current
authorization. Approval is a separate immutable decision, so the checkpoint
retains its original `SUBMITTED` type. Successor submission retains its
predecessor rather than modifying the earlier checkpoint.

The [capture evaluator](../../scripts/lib/google-docs-checkpoint.mjs)
(stable source reads, bounded canonical JSON hashing, immutable capture and
exact-checkpoint approval) treats provider versions as decimal strings to
preserve values beyond JavaScript safe integers. Revision IDs are optional
provenance. Every approval recomputes the checkpoint digest and compares the
current live version and normalized content. Canonical object keys are sorted;
array order and suggestions remain significant. Invalid, sparse, cyclic or
excessively nested normalized content fails closed.

## Google adapter normalization

The [normalizer](../../scripts/lib/google-docs-normalization.mjs) (bounded all-tab
Google Docs capture, suggestions and authorized image-byte digests) requires
an unmasked all-tab read with `SUGGESTIONS_INLINE`. It retains tab hierarchy,
paragraphs, lists, tables, headers, footers, footnotes, links and inline
suggestions. Unsupported structural nodes, equations, drawings, linked objects
and missing referenced content block capture. Unknown metadata remains in the
digest. Raw Google response fields retain the provider's camelCase spelling
inside the normalized content; domain metadata uses snake_case.

Temporary image access URLs are replaced with the digest and length of
separately authorized supplied bytes. The normalizer performs no URL fetch.
The future transport must independently enforce source identity, permission,
byte limits, safe URL resolution and deadlines before supplying image bytes.
This supported subset makes no complete comments-capture guarantee; the review
interface must disclose that limitation until comments have their own contract.

Google's [documents.get reference](https://developers.google.com/workspace/docs/api/reference/rest/v1/documents/get)
(all-tab retrieval, suggestion view modes and per-file OAuth support) defines
the read options. Google's [Drive files reference](https://developers.google.com/workspace/drive/api/reference/rest/v3/files)
(version metadata and current file capabilities) defines the source observations.

## Remaining runtime work and verification

The following are implementation prerequisites, not completed features:

1. Publish the binding/checkpoint API, relational model, events and complete
   PRD/evidence schema and completeness rules in the consuming child packet.
2. Implement authenticated server-side policy and provider reads with current
   actor, workspace, object ACL, assignment, evidence and connection scope.
3. Implement transactional optimistic concurrency, append-only audit/outbox,
   checkpoint uniqueness and actor/action/target-scoped idempotent replay.
4. Implement Google Picker/template commands, connection administration,
   notification deduplication/renewal and bounded authoritative reconciliation.
5. Implement the author/reviewer UI and automated authenticated browser tests.
6. Activate retained bodies and live Google access only against the approved
   retention/storage decision and private deployment profile.

Google and Curve have separate transaction boundaries. The runtime must record
the final provider-observation time and revalidate Initiative version,
assignment and checkpoint within its final database transaction. A provider
edit after the final observation is a detectable post-approval change. These
pure tests do not establish database atomicity or eliminate that interval.

Run the [checkpoint tests](../../scripts/tests/google-docs-checkpoint.test.mjs)
(schema, integrity, access and exact-approval cases), [normalization tests](../../scripts/tests/google-docs-normalization.test.mjs)
(provider-shaped content, suggestions, images and unsupported-node failures)
and [lifecycle tests](../../scripts/tests/external-prd-lifecycle.test.mjs)
(submission, successors, authorization denial and Planning handoff):

```sh
node --test scripts/tests/google-docs*.test.mjs scripts/tests/external-prd-lifecycle.test.mjs
pnpm check
```

All fixtures contain fictional identities and document content. The full
outbound diff and disclosure scan must pass before publication. Rollback removes
this additive candidate package; no retained body, subscription or database
record is created by the conformance tests.
