# D-009 (Retention, Legal Hold, and Erasure) Owner Workshop Guide

## Document control

| Field | Value |
| --- | --- |
| Status | `OWNER WORKSHOP READY / INPUTS REQUIRED / NOT IMPLEMENTATION AUTHORITY` |
| Version | 1.0 |
| Prepared | 2026-08-27 |
| Product | Curve |
| Scope | D-009 (retention, backup, legal-hold, tombstone, and erasure decision) |
| Required accountable functions | Security; Privacy; Legal; Platform Operations; Database Operations; Curve Engineering |
| Prepared by | Codex under Federico Ocampo's review |
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

Add every other X3M service that stores, caches, indexes, replicates, scans, or
projects protected Curve data. An unknown destination remains unresolved.

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

- Is persistence duration-based, event-based, default-denied, or not
  applicable?
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

- Define the policy per provider/connection.
- Choose accepted proof among receipt, contract evidence, or truthful
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

Capture a source or controlled internal policy reference for every value.

## Session 5: approval

After all 39 cells, 8 copy entries, and 6 control blocks plus cost are complete:

1. Run the semantic validator and compute the stable policy-content digest.
2. Have each of the six named people approve that exact digest independently.
3. Record approval timestamps before the decision timestamp.
4. Set a future review date.
5. Change D-009 (retention, backup, legal-hold, tombstone, and erasure
   decision) to `DECIDED` only in the reviewed revision containing all evidence
   and approvals.

The decided record may permit preparation of M0-04 (protected-storage
foundation). Storage activation and staging/production activation retain their
own later approvals and evidence.

## Outputs

- Completed D-009 (retention, backup, legal-hold, tombstone, and erasure
  decision) machine decision worksheet
- Supporting internal source/reference register
- Feasibility and cost assessment
- Named approval record bound to one stable digest
- Decision date and next review date
- Open exceptions and their explicit capability blocks
