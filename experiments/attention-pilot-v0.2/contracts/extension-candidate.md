# Attention and existing-project reference extension candidate

Status: **PROPOSED / SYNTHETIC DEVELOPMENT ONLY**. Version: `attention-candidate-v0.1`.
No owner approvals, runtime grants, existing schema pins or catalog entries are changed.

## Relationship to the current Curve baseline

The Curve repository inspected for this pilot is based on
`8326d3b788a18296ddae32ee2347f09cba9720b2`. Existing records remain authoritative at
their original editions and scopes.

- M7 (attention and automation extension) currently defers implementation until a
  separately reviewed extension packet. This candidate is an isolated human-directed
  development prototype; it does not declare that gate satisfied.
- D-013 (roadmap migration and new-initiative policy) currently permits typed external
  references but prohibits inferred migration. This candidate proposes a broader
  existing-project user experience using references only. It does not alter that
  decision or import source projects into governed Curve aggregates.
- M1 (manual alignment and exact PRD approval) retains its exact artifact, actor,
  assignment and readiness rules. An attention disposition is never a gate decision.
- Provider profiles, access envelopes and retention decisions remain separate
  requirements for live source data. Synthetic receipts are not runtime evidence.

This candidate adds no migration or continuous third-party import engine. An optional
manual/ad-hoc preparation process is outside its scope and confers no integration grant.

## Ownership and models

| Model | Owner and responsibility |
| --- | --- |
| SourceEvidence | Immutable scoped observation of a provider-owned resource, with revision, link, timestamp, provenance and access receipt. |
| AttentionItem | Derived recommendation with stable scoped source/signal identity, reason, confidence and priority explanation. |
| ProjectBinding | Reference to an already-existing source project. Source task and history semantics remain authoritative. |
| ReviewDisposition | Append-only personal review event, scoped to workspace and reviewer. Source effect is always none. |
| RefreshRun | Bounded refresh outcome, time range, observed count and complete/partial/unknown/failed coverage. |

Source evidence and bindings are conservatively partitioned by principal as well as
workspace/connection in this pilot. They are not shared merely because an external ID
matches. A production implementation must recheck source access for the actual viewer;
the caller-supplied test context in this prototype is not an authentication mechanism.

## Deterministic invariants

1. Every lookup checks the exact workspace/reviewer scope before resolving an ID.
2. Natural IDs include workspace, reviewer, connection, resource type and external ID.
   Length-delimited components avoid concatenation collisions; IDs grant no authority.
3. A source revision cannot rewrite different material facts. Observations are immutable.
4. A refresh validates every record before any store mutation. Replayed run IDs are
   idempotent only for identical payloads. Time regressions and duplicates fail closed.
5. Missing records, including in complete coverage, do not close tasks or delete
   attention. Completion/deletion needs explicit future source semantics.
6. Material facts are normalized title, summary, project association, source state,
   deadline, priority and action reason. Merely changing a revision, observation time,
   link or confidence does not resurface a handled item. Crossing a due date does.
7. Review actions bind to the exact current evidence and retain previous dispositions.
   A changed source can reopen attention; it does not rewrite the previous review.
8. Source evidence access is checked again at read time. Revoked latest observations
   fence historical content. Project access expiry hides its tasks and source history.
9. Unknown project correlation is represented by null, never an invented binding.
10. Project history coverage and provenance remain explicit. No history entry becomes
    a Curve approval. Binding is not migration, ownership transfer or lifecycle adoption.
11. Source links must be provider-supplied canonical HTTPS URLs on an exact origin
    allowlist. Userinfo, query payloads, fragments and noncanonical forms are rejected.
12. This prototype accepts synthetic provenance and reserved example origins only.

## Portable local adapter seam

`DisabledLocalAdapter` (provider-neutral disabled boundary) exposes capabilities,
checkConnection, listChanges, readEvidence and checkpoint. It provides no transport,
secret handling, credential discovery or source-write method. Live methods fail closed.
A future local runtime can implement an independently reviewed equivalent interface.
It must not reuse private browser sessions or connector credentials implicitly.

## Production review still required

- Data classification, allowed derivatives, retention, erasure and access revocation.
- Authorized source identity/scopes, link patterns and selected account/channel/project.
- Durable database schema with tenant-aware constraints, concurrency, idempotency,
  conflict reporting, deletion semantics and consistent evidence lineage.
- Authenticated read-only MCP caller isolation and bounded query/output policies.
- Explicit existing-project eligibility and reconciliation/rollback ownership.
- Review of the proposed UX, recommendation quality and material-change policy.
- Source outages, access changes, partial pagination, version drift and checkpoint recovery.
- Disablement, logging redaction, operational support and rollout qualification.

No candidate record is an execution authorization or evidence that these reviews happened.
