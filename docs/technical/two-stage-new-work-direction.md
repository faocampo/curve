# Current two-stage direction for new work

The accepted new-work experience requires two human reviews: Product approves
the exact PRD, and Technical approves the exact implementation plan. New work
has no Code Approver assignment and no additional Curve human Code Readiness
gate. This direction governs new implementation packets, including roadmap-backed
Initiatives, while their consuming services still require qualified contracts.

## Authority and implemented boundary

[Plane PR #17](https://github.com/faocampo/plane/pull/17) (merged two-stage interface
and access-loss recovery) records the integrated implementation. The
[two-stage experience](https://github.com/faocampo/plane/blob/53109983aa90de1f6784008c55315e4bd3018f29/docs/curve/two-stage-document-review.md)
(approved document journey and participant authority) and
[runtime successor](https://github.com/faocampo/plane/blob/53109983aa90de1f6784008c55315e4bd3018f29/apps/api/plane/curve/two_stage_review/README.md)
(versioned Initiative, PRD and Technical-plan contracts) define its scope.

The connected local new-Initiative journey supports PRD upload, Product review,
plan upload and Technical review. Roadmap command and document-context integration
remain implementation work. Integration evidence does not establish production
provider, storage or rollout acceptance. Resolve environment-specific approval
and activation from the approved private authority source.

| Stage | Human decision | Required subject |
| --- | --- | --- |
| Product review | Approve or request changes | Exact PRD version, current Product/context and current reviewer assignment |
| Technical review | Approve or request changes | Exact implementation plan and its current approved PRD/context |

Current access and assignment are checked before protected reads and again before
command effects. Replacing an approved PRD requires renewed Product review and
an updated Technical plan. Saved historical decisions remain attributable to their
original subjects; a replacement cannot inherit approval merely by reusing an ID.

## Reading historical requirements

The [PRD](../curve-ai-native-sdlc-prd.md) (product requirements and dated lifecycle
baseline), [development plan](development-plan.md) (milestone catalog), and
[task packets](m1-m7-task-packets.md) (materialization dependencies) retain older
three-gate language. For new work, apply the following explicit successor mapping:

| Historical instruction | Current new-work interpretation |
| --- | --- |
| Three assignments, Code Approver role, FR-001 and AC-01 | Require Product and Technical reviewer assignments; preserve the existing Product and Initiative requirements |
| Three-person gate separation | Apply the qualified two-reviewer policy for the selected Initiative edition; do not derive authority from a retained Code-review assignment |
| Gate 3, J-10, AC-29 and M5-09 | Delivery readiness depends on current-head quality evidence and separately authorized repository actions; implement no third Curve human approval |
| M5 dependency on Code Readiness | Consume the delivery-readiness successor described below, preserving quality, repository protection and exact-head checks |

The [retained workflow subset](../../contracts/candidates/manual-planning-v2/workflow-condition-subset-v2.json)
(pinned normative-source references) binds the historical PRD's exact bytes.
This separate direction supplies the new-work interpretation through the current
handoff and task guidance while that source remains unchanged.

Historical schema, policy, workflow, migration, approval and evidence pins retain
their original bytes and scope. This mapping does not reinterpret an old record
as a current-edition decision or permit an old command receipt to authorize a new
writer. New writers require explicit versioned successor contracts and regression
coverage for current and retained editions.

## M5-09 successor: delivery readiness and explicit repository action

M5-09 (delivery readiness) must consume current-head quality, test, independent
review, applicable waiver and delivery-contract evidence. A head change, failed
required check, stale base or expired waiver invalidates the affected readiness
projection. Required ordinary repository reviews and branch protections remain
effective.

The future draft-to-ready command needs an exact provider actor/action policy
under D-008 (repository authority) before implementation. The concrete packet
must identify who can request that external action, the exact base/head subject,
current access checks, replay and race behavior, and protected audit evidence.
Removing the Code Approver role grants no automatic draft-to-ready, merge or
deployment authority. Keep that external action unavailable until its successor
contract and authority are qualified.

Acceptance must prove current-head checks, denied and revoked access, changed-head
races, replay without duplicate effects, preserved historical decisions, and the
two-stage user journey. The remaining delivery-policy detail does not block
independent roadmap storage or contract work.
