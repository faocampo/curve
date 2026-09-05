# D-009 (Retention, Legal Hold, and Erasure) Owner Workshop Guide

> Sanitized public reference. Fictional identities cannot authorize execution.
> Historical approvals apply only to their original bytes; see
> [public contract edition](public-reference-sanitization.md) (sanitization, integrity and approval boundaries).

## Document control

| Field | Value |
| --- | --- |
| Status | `OWNER WORKSHOP READY / INPUTS REQUIRED / NOT IMPLEMENTATION AUTHORITY` |
| Version | 1.1 |
| Prepared | 2026-08-31 |
| Product | Curve |
| Scope | D-009 (retention, backup, legal-hold, tombstone, and erasure decision) |
| Required accountable functions | Security; Privacy; Legal; Platform Operations; Database Operations; Curve Engineering |
| Prepared by | Codex under Designated reviewer's review |
| Governing baseline | Exact Curve revision named by the eventual decision PR |
| Activation boundary | Protected-object storage and every staging/production activation remain disabled until the completed decision is approved |

## Purpose

Collect the named-owner inputs required to decide D-009 (retention, backup,
legal-hold, tombstone, and erasure policy). This guide selects no policy value and
grants no implementation or environment-activation authority.

## Participants required

Record one named person for each accountable function:

1. Security
2. Privacy
3. Legal
4. Platform Operations
5. Database Operations
6. Curve Engineering

Record separately the owners referenced by individual policy cells, including
AI governance, Product records, Application Security, Integration ownership,
Incident response, and each external data owner where applicable.

## Session 1: controlled-copy inventory

For each required copy kind, record the exact product/service, AWS account,
region, catalog owner, lifecycle configuration reference, backup or replication
behavior, restore behavior, destruction method, and verification evidence:

- PostgreSQL full, incremental, and point-in-time recovery copies
- PostgreSQL replicas and failover copies
- S3 current objects
- S3 noncurrent versions and delete markers
- S3 incomplete multipart uploads
- S3 replication and archive copies
- Log and SIEM projections
- Forensic quarantine stores

Choose exactly one evidenced state for each required kind:

- `PRESENT`: identify product, account, regions, lifecycle, destruction proof,
  and `RESTORABLE` or `NON_RESTORABLE` behavior;
- `ABSENT`: evidence that the applicable topology was checked and contains no
  such copy; or
- `NOT_DEPLOYED`: evidence that the product/capability does not exist in the
  governed topology.

If another Example Organization service stores, caches, indexes, replicates, scans, or projects
protected Curve data, leave D-009 unresolved and add the copy kind through a
reviewed contract version.

## Session 2: asset and classification policy cells

Complete each asset class independently for `INTERNAL`, `CONFIDENTIAL`, and
`RESTRICTED`, producing 39 cells:

1. Evidence and research bodies
2. Derived artifacts and Context Packs
3. Prompts, model responses, and model traces
4. Human/agent transcripts and questions
5. Candidate trees, patches, and sandbox output
6. Quality logs, reports, findings, and attestations
7. Preview bodies and runtime state
8. Export staging and delivered-body metadata
9. Raw provider payloads
10. Audit and lineage metadata
11. Tombstones and erasure receipts
12. Database backups and object-store versions
13. Forensic quarantine

For every cell, answer:

- Is persistence duration-based, default-denied, or not applicable? For a
  duration, which governed event starts its clock? If an owner requires an
  event-only rule with no duration, record that as an unresolved contract
  extension rather than entering a value the v1 schema cannot represent.
- What is the exact ISO 8601 active duration when duration-based?
- What is the exact backup duration when duration-based?
- Which trusted event starts each period?
- Which event or authority makes deletion eligible?
- Which body fields are physically deleted or cryptographically erased?
- Which minimum non-sensitive metadata remains, and under what authority?
- How does legal hold suspend deletion and affect reads?
- How is backup destruction verified?
- Who is the named accountable owner?
- Which law, contract, policy, or business authority supports the value?
- What is the exact review cadence?

Treat `RESTRICTED` independently. Record default denial explicitly where that
is the approved result.

## Session 3: material control blocks

### Key erasure

- Choose the workspace/class/object key boundary.
- Identify the customer-managed KMS key type and AWS account/region ownership.
- Select the KMS deletion waiting period within AWS-supported limits.
- Define multi-region replica and custom-key-store backup handling.
- Name destruction authority and required separation of duties.
- Define proof that unrelated workspace data remains decryptable.

### Legal hold

- Name hold-creation, hold-release, and conflict-resolution authorities.
- Define mandatory case identifiers and scope over derivatives/backups.
- Define read-fencing behavior during a hold.
- Set review cadence and procedure/runbook references.

### Restore and re-erasure

- Confirm quarantine before restored data becomes serviceable.
- Define deletion/hold-ledger replay.
- Set the maximum re-erasure duration from restore completion.
- Name the verification owner and runbook.

### External-copy deletion

- Bind an exhaustive approved-connection inventory revision and digest.
- Record `NO_EXTERNAL_CONNECTIONS` with evidence or `ENUMERATED` with one
  explicit inventory ID and exactly one mapping per connection. The inventory
  ID set and mapping ID set must be equal.
- Bind each connection's policy revision/digest, proof mode, and proof
  revision/digest. Proof mode is receipt, contract evidence, or truthful
  outside-Curve-control reporting.
- Name the owner and procedure.

### Failure escalation

- Set a bounded retry schedule.
- Choose incident severity and notification policy.
- Name the owner and manual recovery runbook.

### Cost and capacity

- Estimate monthly USD cost.
- Link assumptions covering active data, versions, backups, quarantine,
  receipts, inventory scans, restore tests, and deletion verification.
- Name the cost approver.

## Session 4: feasibility and evidence

Validate selected values against:

- S3 current/noncurrent versions, delete markers, Object Lock, replication,
  archive, and incomplete multipart uploads
- PostgreSQL full/incremental/PITR/replica retention and restore behavior
- AWS Backup lifecycle and cold-storage constraints
- KMS key-deletion delay, replicas, and custom-key-store copies
- Log/SIEM and external-provider retention contracts
- Restore RTO/RPO and the selected re-erasure maximum
- Estimated storage, scan, restore-test, and operational costs

Capture every source or controlled internal policy as an artifact reference,
exact revision, and SHA-256 content digest. Bind the exact Curve base revision
and the ADR/schema content digests used by the decision. The semantic validator
must resolve that base as an ancestor of the candidate `HEAD` and match the
candidate ADR/schema bytes.

## Session 5: approval

After all 39 cells, 8 copy entries, and all 6 control blocks including cost are
complete:

1. Select the canonical human-identity authority.
2. Decide whether the six functions require `SIX_DISTINCT_PEOPLE` or allow
   `DUAL_HAT_ALLOWED`. If dual-hat is selected, list every permitted two-role
   pair; any unlisted pair and any person assigned more than two functions fail.
   Bind the authority and separation-policy evidence.
3. Keep the checked-in worksheet fail closed. Create a non-persisted final
   candidate subject in memory with every requirement, final `DECIDED` state,
   final scope and implementation-dispatch value, and a future review date.
4. Compute the stable decision-content digest from that final candidate
   subject. Set-like authority, region, and per-connection mappings are
   canonically ordered. The candidate is preparation input rather than an
   intermediate decision record.
5. Record one canonical authority/subject identity approval for each of the six
   functions against that exact digest, with subject proof bound to the same
   authority and subject.
6. Assemble the final state, digest, approvals, and a decision timestamp after
   every approval and before the bound review date. Write and semantically
   validate that complete record atomically in one reviewed change.
7. The resulting D-009 (retention, backup, legal-hold, tombstone, and erasure
   decision) may be `DECIDED` only in that reviewed revision containing all
   evidence and approvals.

The decided record may permit preparation of M0-04 (protected-storage
foundation). Storage activation and staging/production activation retain their
own later approvals and evidence.

## Outputs

- Completed D-009 (retention, backup, legal-hold, tombstone, and erasure
  decision) machine decision worksheet
- Revision/digest-bound source and controlled-policy evidence register
- Feasibility and cost assessment
- Canonical identity/separation policy and six functional approval records
  bound to one stable digest
- Decision date and next review date
- Open exceptions and their explicit capability blocks
