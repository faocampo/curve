# P0-12 Retention, Hold, Backup, and Erasure Decision Packet

## Document control

| Field | Value |
| --- | --- |
| Package | P0-12 (retention, backup, legal-hold, tombstone, and erasure decision package) |
| Decision | D-009 (retention, deletion, backup, and legal-hold policy) |
| Status | `REVIEW_DRAFT / PROPOSED / NOT_DECIDED` |
| Version | 1.3 |
| Date | 2026-08-28 |
| Product | Curve |
| Repository | `git@github.com:faocampo/curve.git` |
| Curve review base | Curve `main` at `02d383ada3941cdebc1939a1d7990f8ea7ff50d4`, the squash merge of Curve PR #40 (M0-S9B/M0-S9C definition gates); this P0-12 package requires its own exact-head approval and merge before the decision worksheet becomes a published proposal |
| Prepared for | Named Security, Privacy, Legal, Platform Operations, Database Operations, and Curve Engineering approvers |
| Interim owner/reviewer | Federico Ocampo, CTO at X3M |
| Risk | `MATERIAL`; data-governance, deletion, backup, legal-hold, cryptographic-erasure, and non-local activation boundary |
| Consuming package | M0-04 (protected object-storage foundation) |

## Outcome

Complete one machine-verifiable policy for every Curve-controlled protected body,
derived copy, backup, version, log projection, and quarantine location. The
decision sets exact retention periods, start events, deletion eligibility,
lawful metadata residue, legal-hold behavior, storage inventory, cryptographic
erasure boundary, restore re-erasure SLA, external-copy reporting, failure
escalation, cost, and named approvals.

The current [D-009 decision worksheet](../../contracts/governance/d009-retention-policy-v1.json)
(machine-readable retention, backup, hold, erasure, and approval proposal) is
`PROPOSED`. It contains no approved period and grants no implementation or
activation authority.

## Authority and fail-closed boundary

- A person may prepare values for an accountable function, but only the named
  approver in each required function can approve the stable decision digest.
- An AI coding agent cannot change `decision_state` to `DECIDED`, populate an
  approval, select a policy value, or infer an X3M account, region, owner, cost,
  duration, SLA, legal authority, or provider obligation.
- Partial owner input is recorded as populated cells/inventory entries while
  the exact complement remains in `unresolved_cell_keys`,
  `unresolved_storage_keys`, and `unresolved_requirements`.
- `PROPOSED` always means `NONE_FAIL_CLOSED`: protected-object implementation,
  protected-body persistence, staging, and production remain unavailable.
- `DECIDED` permits M0-04 (protected object-storage foundation) implementation
  review. It never enables storage, staging, or production directly.

## Normative sources

| Source | Authority for this package |
| --- | --- |
| [Curve PRD v0.12](../curve-ai-native-sdlc-prd.md) (product lifecycle, classifications, retention, erasure, and acceptance criteria) | NFR-010, NFR-011, NFR-018, NFR-020, AC-53, AC-56, and D-009 product invariants |
| [ADR-009](adr-009-retention-and-erasure.md) (asset inventory, policy matrix, hold/erasure state machine, and fail-closed behavior) | Human-readable policy authority and decision record |
| [D-009 decision worksheet](../../contracts/governance/d009-retention-policy-v1.json) (all policy cells, storage copies, material blocks, approvals, and activation guard) | Normative owner-fillable decision instance |
| [D-009 decision schema](../../contracts/schemas/retention-policy-decision.schema.json) (closed machine validation for the decision instance) | Field types, enums, coverage limits, named-person approvals, and unknown-field rejection |
| [Security and operations specification](security-and-operations.md) (classification, protected-storage, erasure, recovery, and incident controls) | Enforcement points and truthful completion boundary |
| [P0-05 test strategy](m0-test-strategy.md) (acceptance suites, commands, environments, ownership, and evidence gates) | Cross-repository verification and AC-53/AC-56 ownership |
| [Amazon S3 versioning deletion guidance](https://docs.aws.amazon.com/AmazonS3/latest/userguide/troubleshooting-versioning.html) (delete markers, noncurrent versions, and permanent version deletion) | S3 current/noncurrent/delete-marker inventory requirement |
| [Amazon S3 multipart-abort guidance](https://docs.aws.amazon.com/AmazonS3/latest/userguide/abort-mpu.html) (incomplete-part storage and abort verification) | Incomplete multipart-upload lifecycle and verification requirement |
| [AWS Backup recovery-point lifecycle API](https://docs.aws.amazon.com/aws-backup/latest/APIReference/API_UpdateRecoveryPointLifecycle.html) (transition, expiry, and cold-storage constraints) | Backup lifecycle feasibility; cold-storage minimums must be checked against selected periods |
| [AWS KMS key-deletion guidance](https://docs.aws.amazon.com/kms/latest/developerguide/deleting-keys.html) (destructive deletion, 7–30-day wait, replicas, and custom-key-store backup considerations) | Key-boundary, deletion-wait, replica, backup, and proof requirements |

AWS service constraints inform feasibility; they do not select X3M retention
policy.

## Required decision coverage

### Asset/classification cells

The decision requires exactly 39 populated policy cells: each of the 13 asset
classes crossed with `INTERNAL`, `CONFIDENTIAL`, and `RESTRICTED`.

| Asset class | Controlled content represented |
| --- | --- |
| `EVIDENCE_RESEARCH_BODY` | Retrieved evidence and research bodies |
| `DERIVED_ARTIFACT_CONTEXT_BODY` | PRDs, plans, roadmaps, architecture, and Context Packs |
| `PROMPT_RESPONSE_MODEL_TRACE` | Approved prompts, model outputs, and traces |
| `TRANSCRIPT_QUESTION_BODY` | Human/agent transcripts and question/answer bodies |
| `CANDIDATE_PATCH_SANDBOX_OUTPUT` | Candidate trees, patches, and sandbox outputs |
| `QUALITY_LOG_REPORT_BODY` | Quality logs, reports, findings, and attestations |
| `PREVIEW_BODY_RUNTIME` | Preview assets and runtime state |
| `EXPORT_STAGING_BODY` | Export staging and delivered-body metadata |
| `RAW_PROVIDER_PAYLOAD` | Provider callbacks retained for reconciliation |
| `AUDIT_LINEAGE_METADATA` | Lawful minimized audit and lineage metadata |
| `TOMBSTONE_ERASURE_RECEIPT` | Tombstones and non-sensitive erasure receipts |
| `DATABASE_BACKUP_OBJECT_VERSION` | Database backups and object-store versions |
| `FORENSIC_QUARANTINE` | Security-owned quarantined bodies |

Each populated cell requires:

1. Active-retention mode and exact ISO 8601 duration when duration-based.
2. Backup-retention mode and exact ISO 8601 duration when duration-based.
3. One enumerated start event.
4. One enumerated deletion trigger.
5. One physical/cryptographic/metadata/default-denied disposition.
6. Minimum lawful metadata profile reference.
7. Fixed legal-hold precedence.
8. Backup-destruction verification requirement.
9. Accountable owner role/person reference.
10. Legal/contract/policy authority reference.
11. Exact review cadence.

`RESTRICTED` is completed independently. It cannot inherit a less restrictive
cell. `DEFAULT_DENIED` is an explicit decision and carries no duration.

### Controlled-copy inventory

The named operations owners enumerate all eight required copy kinds:

| Required key | Required evidence |
| --- | --- |
| `POSTGRESQL_FULL_INCREMENTAL_PITR` | Product/service, AWS account, regions, catalog owner, lifecycle policy, destruction proof |
| `POSTGRESQL_REPLICA` | Every replica/failover copy and its destruction/restore behavior |
| `S3_CURRENT_OBJECT` | Current versions, bucket/account/region, lifecycle and proof |
| `S3_NONCURRENT_VERSION_DELETE_MARKER` | Noncurrent versions, delete markers, Object Lock interaction, and permanent-deletion proof |
| `S3_INCOMPLETE_MULTIPART_UPLOAD` | Abort lifecycle and empty-parts verification |
| `S3_REPLICATION_ARCHIVE` | Replicas, archives, replication lag, lifecycle, and destruction proof |
| `LOG_SIEM_PROJECTION` | Every approved log/SIEM projection and stricter-or-equal retention |
| `FORENSIC_QUARANTINE_STORE` | Security store, custody, hold, access, and final-disposition proof |

An unlisted X3M service that stores or projects protected Curve data adds a new
reviewed contract version before D-009 can be decided.

## Material decision blocks

| Block | Required named input |
| --- | --- |
| Key erasure | Workspace/class/object key boundary; customer-managed key type; 7–30-day KMS deletion wait; replica and custom-key-store backup handling; destruction authority; proof; unrelated-data isolation test |
| Legal hold | Creation/release/conflict authorities; case identifier; derivative/backup scope; read fencing; review cadence; procedure |
| Restore re-erasure | Quarantine-before-service, deletion-ledger replay, maximum re-erasure duration, verification owner, runbook |
| External-copy deletion | Per-connection policy, accepted receipt/contract/outside-control reporting, owner, procedure |
| Failure escalation | Exact bounded retry schedule, incident severity, owner, notice policy, manual recovery runbook |
| Cost/capacity | Monthly USD estimate, assumptions, active/version/backup/quarantine/scan coverage, approver |
| Named approvals | Security, Privacy, Legal, Platform Operations, Database Operations, and Curve Engineering people; decision date and next review |

## Owner-fill and approval protocol

1. Start from the exact merged Curve revision containing this packet.
2. A named owner adds one or more complete policy cells or storage inventory
   entries. The same change removes exactly those keys from the unresolved list.
3. A named owner completes an entire material block and sets its status to
   `DECIDED`; partial fields keep the block `UNRESOLVED`.
4. The semantic validator recomputes `unresolved_requirements`. Hand-authored
   progress claims that differ from content fail CI.
5. When all 39 cells, eight storage entries, and six material blocks are
   complete, Curve computes `approval_subject_digest` over policy content only.
6. Six named people independently approve that same digest and record their
   identity and approval time. The stable digest excludes approvals, avoiding a
   commit-hash/self-reference cycle.
7. The recorded decision time follows every approval; `next_review_at` follows
   the decision time.
8. Only after all checks pass may an authorized human set `decision_state` to
   `DECIDED`, `effective_scope` to `CURVE_CONTROLLED_COPIES`, and
   `implementation_dispatch_allowed` to true in the same reviewed change.
9. Protected storage, staging, and production flags remain false. Their later
   activation requires implementation, infrastructure, and environment evidence.

## Acceptance tests

| ID | Given / When / Then |
| --- | --- |
| `P0-12-AT-01` | Given the proposal, when validated, then it reports 39 unresolved cells, eight unresolved storage copies, nine unresolved requirements, and no implementation authority. |
| `P0-12-AT-02` | Given a missing/reordered catalog value, when validated, then v1 coverage drift fails. |
| `P0-12-AT-03` | Given duplicate or mismatched cell identity, when validated, then decision coverage fails. |
| `P0-12-AT-04` | Given partial cells or inventory, when unresolved projections differ from the exact complement, then validation fails. |
| `P0-12-AT-05` | Given `PROPOSED`, when any effective scope, approval digest, or implementation authority is claimed, then validation fails. |
| `P0-12-AT-06` | Given `DECIDED`, when any of 39 cells or eight storage entries is absent, then validation fails. |
| `P0-12-AT-07` | Given a decided cell, when duration mode lacks an ISO 8601 duration or a default-denied/not-applicable mode carries one, then schema validation fails. |
| `P0-12-AT-08` | Given an unresolved material block, missing legal-hold authority, or empty retry schedule, when `DECIDED` is claimed, then validation fails. |
| `P0-12-AT-09` | Given a complete decision, when content is canonicalized, then every named-person approval binds the same stable digest. |
| `P0-12-AT-10` | Given a forged digest or approval after decision time, when validated, then approval fails. |
| `P0-12-AT-11` | Given a decision/review chronology, when the next review is not later, then validation fails. |
| `P0-12-AT-12` | Given any state, when protected storage, staging, or production is directly enabled by the decision record, then validation fails. |

## Exact verification commands

Run from the Curve repository root at the exact candidate head:

```text
git diff --check
pnpm check:contracts
node --test scripts/tests/retention-policy.test.mjs
pnpm check
pnpm check:external
CURVE_PROJECT_SOURCE_REF=HEAD node scripts/sync-github-project.mjs --context P0-12
```

No Plane, AWS, EKS, PostgreSQL, S3, KMS, backup, object, key, provider, or
production command belongs to this proposal package.

## Required review evidence

- Exact Curve head, per-file context hashes, and aggregate P0-12 digest.
- Schema compilation, valid proposal, invalid fixture, and semantic test result.
- Machine-reported populated/unresolved cell, storage, block, and approval counts.
- Source links or controlled policy references for every completed value.
- Named-person approval evidence bound to `approval_subject_digest`.
- Review of AWS lifecycle feasibility and cost against the selected periods.
- Explicit confirmation that the decision unblocks implementation review only.

## Completion and handoff

P0-12 is `DONE` only when D-009 (retention and erasure policy) is `DECIDED`, all
machine and human evidence passes, the exact revision is merged, and the next
review is scheduled. At that point M0-04 (protected object-storage foundation)
may receive a separately approved implementation packet. Storage persistence
and every non-local environment remain disabled until their own implementation
and activation evidence passes.
