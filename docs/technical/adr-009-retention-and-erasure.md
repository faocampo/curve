# ADR-009: Retention, Legal Hold, Backup, and Erasure

- Status: OPEN
- PRD decision: D-009
- Owner: Security, Privacy, and Legal
- Reviewers: Platform Operations, database operations, Curve engineering
- Decision date: Pending policy decision
- Required by: M0-04 and every staging/production activation
- Supersedes: None

## Context and constraints

Curve may handle evidence, prompts, transcripts, source code, patches, logs, reports, previews, exports, audit metadata, and provider observations across `INTERNAL`, `CONFIDENTIAL`, and `RESTRICTED` classifications. The implementation must not invent retention periods or claim erasure while recoverable copies remain outside the approved policy.

## Decision drivers and weighted criteria

1. X3M legal, privacy, contractual, and security obligations.
2. Data minimization and reliable deletion.
3. Evidence/audit integrity and legal-hold precedence.
4. Backup recoverability and post-restore re-erasure.
5. Operational feasibility and cost.

## Options considered

1. Class-by-asset policy with immutable non-sensitive audit metadata and separately erasable protected bodies.
2. One global retention period: rejected because asset/class obligations differ.
3. Permanent retention: rejected as the default because it violates minimization.
4. Ephemeral-only protected data: conservative fallback for approved local proofs, not a production policy.

## Required decision matrix

Named owners must supply a period and behavior for each classification and asset category: evidence bodies, derived artifacts, prompts/responses, transcripts, patches/candidate trees, quality logs/reports, previews, exports, provider payloads, audit metadata, tombstones, database backups, object-store versions, and forensic quarantine.

Each cell records active period, deletion eligibility, legal-hold behavior, body-versus-metadata split, backup expiry, cryptographic-erasure method, restore behavior, owner, authority, and review cadence. Blank cells block the affected capability.

## Conservative behavior until decided

- Use synthetic data only in the local M0 skeleton.
- Do not implement or enable protected-object persistence, evidence ingestion, sandbox artifact retention, previews, exports, or non-local activation.
- Automatically revoke ephemeral credentials and runner resources independently of content-retention policy.
- Preserve only minimum non-sensitive development audit metadata needed to prove the local workflow.

## Security, privacy, licensing, and operational impact

Legal hold always overrides scheduled deletion. Deletion must cover indexes, caches, replicas, object versions, provider-held copies under contract, and restored backups according to the approved matrix. Every deletion and failed deletion is auditable without retaining the deleted protected body.

## Data/API/event/migration compatibility impact

Data models carry `retention_class`, body/object reference, tombstone state, hold state, and policy version rather than hard-coded periods. Policy versions apply prospectively; historical actions retain the policy reference used.

## Failure, rollback, and exit strategy

Deletion failures retry safely and alert an owner; they never report completion prematurely. Restoring a backup reruns the deletion ledger before serving protected data. Cryptographic erasure requires documented key boundaries and proof that remaining ciphertext is unusable.

## Implementation consequences and affected work packages

D-009 blocks M0-04, protected M1 evidence, retained M4 artifacts, M6 previews/exports, and every staging/production activation.

## Validation and review date

Pending completed matrix, restore-and-re-erasure test design, cost analysis, and named Security/Privacy/Legal approval.
