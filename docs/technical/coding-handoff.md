# Coding handoff

## Current consolidation checkpoint — 2026-10-07

Start with [project status](project-status.md) (verified integration position and
next three tasks) and the [consolidation ledger](project-consolidation-2026-10-07.md)
(branch dispositions, merge evidence and gates). Existing work is being reconciled
before feature expansion. The September implementation boundary below is dated
history; inspect October reconstruction source before repeating its next task.

## Local reconstruction checkpoint — 2026-10-06

The [local pilot delivery record](local-pilot-delivery-2026-10-06.md) (restored
baseline, new implementation evidence and remaining acceptance) and
[manual Gate 2 implementation](manual-gate2-reservation-candidate.md) (separate
qualified successor, exclusive reservations and default-off UI) describe current
local work. These tests and integration records provide no publication, merge, deployment
or activation authority by themselves. The earlier roadmap and historical evidence below retain their original
scope; local integration does not complete M3, the manual pilot or R1.

## Authority and reading order

Follow the approved [repository delivery policy](repository-delivery-policy.md)
(cohesive PRs, bounded work in progress, integration and branch retirement).

The [PRD](../curve-ai-native-sdlc-prd.md) (product requirements) defines behavior.
Approved ADRs define architecture/security decisions within their recorded scope.
Approved, exact-version schemas define wire format. The
[development plan](development-plan.md) (work packages and exit criteria) defines
delivery order. If those sources conflict, resolve the conflict before changing
behavior; a passing test or newer timestamp does not decide policy.

Use [pending stages](pending-stages.md) (concise stage handoffs) to select work,
then read the named packet and relevant FR/NFR/AC requirements. The
[technical index](README.md) (reference library) includes dated evidence and
historical snapshots. The [review log](documentation-review.md) (audit findings,
coverage and unresolved decisions) records this reconciliation.

## Current implementation boundary

Snapshot: 2026-09-06; recheck live Git state before using these references.

- [Curve PR #166](https://github.com/faocampo/curve/pull/166)
  (documentation audit including external-PRD and Git-retention contracts) is merged
  at `06ebf29c8400718c9d493edbddbfaba3c6f3ca99`. Redundant PRs #162–#164 and #167
  are closed; integration grants no runtime activation authority.
- [Plane PR #40](https://github.com/faocampo/plane/pull/40)
  (latest stacked evidence-envelope implementation), commit
  `6e7c923f6759575d955d1a996ec4860f0898beb3`, includes preceding metadata,
  checkpoint, policy, lifecycle, acceptance, completion, Temporal, normalization,
  readiness and retention-reference work. Its local synthetic regression passed
  1,814 tests. This establishes that implementation boundary only.
- The running UI and deployed backend must be inspected independently. Open PRs,
  synthetic tests and historical local acceptance never prove the current browser
  can complete the Google Docs approval flow.
- Production storage, Google transport/identity, erasure/hold/backup operations,
  authenticated UI integration and full milestone qualification remain pending.

## Next cohesive task: PRD command integration

**Integration gate:** the repository owner requires Initiative-shell UX review,
including documents, reviewer responsibilities and simplified operational flow,
before Plane PR #17 and dependent PRs #20–#40 merge. Freeze additional dependent
PR creation. Prepare that reviewable flow and reconcile existing work first;
independent fixes can proceed. The implementation task below remains within this
gate and requires a live check for already completed local work before coding.

**Outcome:** carry explicit Git-policy record editions through acceptance,
protected rationale references and completion, then verify the exact-submission
lifecycle end to end in the isolated runtime.

**Read:** [command policy](prd-command-policy.md) (action-specific authorization),
[retention references](git-retention-policy-reference.md) (versioned commit IDs),
[external PRD](m1-external-prd-checkpoints.md) (capture and lifecycle),
[review records](prd-review-decision-records.md) (protected rationale), and
[readiness](prd-submission-readiness.md) (exact current completeness report).

**Implement:** additive accepted-command persistence and schema-edition handling;
thread the declared edition through submission/review completion and safe replay.
Keep full Git commits distinct from UUID policy-decision and object IDs. Retain
legacy command digests and records. Do not infer an edition from identifier length.

**Prove:** legacy/v2 round trips; malformed/mismatched references; fresh actor,
assignment and source access; exact checkpoint/readiness/body; transaction and
outbox rollback; concurrent outcomes; idempotent replay; cancellation/restart;
immutable historical evidence; preservation on migration reversal.

**Boundary:** synthetic/runtime seams can be tested with authorized local data.
Live provider/storage activation requires the exact approved private profile and
its operational evidence. Define stop/disable behavior before connecting it.
Publishing this handoff supplies no new infrastructure, credential or gate authority.

## Decision scope

- D-012 is the M5 Docusaurus delivery profile. Google Docs authoring uses its own
  approved provider identity/transport profile plus D-009/M0-04 storage controls.
- Public D-009 worksheets remain immutable proposals. They do not establish the
  status of an approved private, scoped retention baseline. Resolve the latter by
  its full Git commit in trusted private configuration. Baseline approval and
  operational activation are separate checks.
- D-002 applies to live Onyx; D-004/D-005/D-014 apply to model/data/paid operations.
  They do not become blanket gates for deterministic metadata-only work.
- Human-operated development and Curve-dispatched production agents use distinct
  authority paths. Keep scope, permission and evidence explicit in either path.
