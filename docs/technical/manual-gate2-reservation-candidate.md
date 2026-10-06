# Manual Gate 2 and exclusive task reservation candidate

Status: **design preparation, not an implemented or qualified writer**, 2026-10-06.

The assigned TechnicalApprover must approve one exact immutable manual plan and
reserve its proposed delivery tasks atomically. Saving a draft, belonging to a
native project or seeing a task does not grant that authority. Existing projects
remain the source of work; this design requires no task-manager migration.

The [domain model](domain-model.md) (immutable gate decisions and exact subjects),
[manual reconstruction contract](manual-planning-reconstruction-v2.md) (draft-only
writer and preserved proof chain), and [pilot delivery record](local-pilot-delivery-2026-10-06.md)
(authorized manual rules and remaining milestones) are the starting point.
This candidate specifies the next reviewable transaction boundary without changing
those historical contracts or treating unrecovered backend code as present.

## Exact review subject

Prepare a separate immutable subject from a persisted, currently valid draft.
Its closed identity must include workspace, Product and Initiative; draft revision
ID/version/digest; definition ObjectRef; retained private input identity digest;
validator edition and receipt digest; exact scoped PRD subject, controlling PRD
decision, PRD artifact/body/evidence and scope revision; workflow, quality and
repository/base/policy inputs; the current three human gate assignments; risk tier;
and the sorted set of proposed delivery issue identities. A subject digest binds
all these values. No request may supply an unbound alternate task list.

Current ACL, membership, classification and source observations remain transient.
They must be reacquired before preparing, displaying, approving and replaying the
subject. The assigned technical approver needs current access to every original
material and task. A changed plan, PRD, scope, repository base, policy, owner or
assignment invalidates the subject rather than silently updating it.

The current draft implementation does not yet produce a qualified transient
authority projection or derive all semantic facts from protected bodies. Those
prerequisites must be completed before this review subject can be trusted.

## Proposed records and constraints

These are model requirements for a new successor, not an installed migration.

| Record | Immutable identity / relation | Required database protection |
| --- | --- | --- |
| Manual plan review subject | Exact draft, original input digest, approved PRD, workflow and proposed-delivery set | Closed metadata; digest; same-workspace composite references; append-only subject |
| Manual plan decision | Exact subject, assigned PLAN_APPROVAL gate, actor, decision, protected rationale reference and policy receipt | Append-only; fresh assigned human; no native-admin shortcut; one controlling approval per exact generation |
| Reservation claim | Workspace, provider installation, stable source issue ID, controlling Initiative, plan subject, decision and generation | Exclusive current ownership by task identity across all Initiatives; no project-ID-based escape |
| Reservation history | Claim/generation, acquire/hold/release event, actor and exact cause | Append-only; no cascade deletion on Initiative pause/cancel or native task movement |
| Release reconciliation | Exact claims/generations and plan, observed native state, unresolved work/result accounting, current approver and rationale reference | Immutable receipt; must remain current until release transaction commits |

A single current-claim table keyed by `(workspace, installation, source issue)`
can enforce exclusivity without an application-only “check then insert.” Prior
claims and releases stay in history; a release cannot erase approval provenance.
If a partial unique index is chosen instead, its live-state predicate must include
held claims. The final schema choice must have actual competing-transaction tests.
Task identities are sorted before locking to reduce deadlock risk. Use the native
source row or another guaranteed existing lock target when no claim row exists;
locking an empty query result does not serialize two first acquisitions.

## Proposed command flow

These operations require separate closed schemas, policy editions and a reviewed
successor proof. Route names and wire versions are not frozen by this document.

1. **Prepare review.** Recheck the exact draft and all current authority; freeze a
   review subject and move the Initiative into its explicit plan-review lifecycle
   only under the new qualified transition. No task reservation occurs yet.
2. **Approve.** Require a human session with CSRF, strong typed Initiative ETag,
   exact review-subject reference and Idempotency-Key. The actor must match the
   currently effective PLAN_APPROVAL assignment; maintain all three gates and the
   required risk-tier separation. Lock authority, scope and sorted task identities.
3. **Reserve and commit.** Recheck the subject and current source access. Acquire
   every proposed delivery task or none. Commit the approval, all reservation
   claims/history, controlling plan identity/version, policy, audit, event, local
   outbox and completed idempotency result as one graph. Revalidate immediately
   before commit. Conflicts disclose no inaccessible competing Initiative identity.
4. **Replay.** Reauthorize against the original exact subject and current access.
   Return the original decision/reservation receipt and current Initiative ETag.
   Do not reacquire, duplicate history, move a reservation or run work again.
5. **Request changes.** Retain the review subject and append the decision. Return
   through the qualified planning transition without reserving tasks. A later plan
   requires a fresh exact review subject and approval.

The manual-only lifecycle transition after approval still needs explicit contract
reconciliation with the existing Initiative states. In particular, a generic
EXECUTING state must never be interpreted as permission to dispatch agents,
providers, repository changes, model calls or spending. No lifecycle code or
execution permission is added by this preparation.

## Holds and release

Pause and cancellation retain reservations. Loss of membership, source access or
protected material places control on hold and blocks approval/release/resume;
it does not make the tasks available for another Initiative. Restoring access
requires a fresh authority check before further action.

Only the currently assigned TechnicalApprover may explicitly release exact claim
generations after reconciliation. The release transaction locks the claims and
checks its immutable reconciliation receipt, current source facts and absence of
unresolved controlled work. Partial release needs an explicit exact subset; it
cannot be inferred from task completion, cancellation, pause or project removal.
A stale generation, missing access or changed reconciliation rolls everything back.
Administrator exceptions are deferred; there is no implicit recovery override.

Other Initiatives may retain context and dependency references to those tasks.
Those references neither compete for control nor receive duplicate completion
credit. The proposed delivery set alone drives reservations. Context becomes
controlled work only through a new exact scope/PRD/plan and explicit approval.

Before plan approval, the assigned ProductApprover retains the existing scoped
reopening path. It requires a fresh exact PRD and invalidates pending plan subjects.
After approval, the pre-plan reopening path must refuse; a separate change/release
protocol must preserve existing control and history.

## Required proof before implementation can be called integrated

| Case | Expected result |
| --- | --- |
| Creator, native project member or administrator tries to approve | Denied unless that person is the current assigned TechnicalApprover with all required access |
| Changed plan, PRD, scope, policy, owner, gate or repository base | Old review subject rejected; no reservation |
| Two Initiatives approve overlapping task sets concurrently | At most one complete winner; loser has no partial approval/reservations |
| Two disjoint task sets | Both can complete without cross-Initiative authority leakage |
| Same command retries after success or later activity | Original receipt returned under current authorization; one effect |
| Revoked actor/reviewer/owner/material/source between read and commit | Denial and rollback of the entire graph |
| Native task moves projects | Stable identity keeps its reservation; access is rechecked |
| Context/dependency reference to a reserved task | No second control claim or completion credit |
| Pause, cancel, deleted membership or inaccessible task | Reservation remains held; no automatic release |
| Stale release generation or reconciliation | No claim released |
| Explicit authorized reconciled release | Exact claims released once; immutable history retained |
| Direct SQL omission, forged receipt, rewrite or truncate | Database guard rejects the incomplete/unauthorized graph |
| Feature disabled, missing proof or incompatible catalog | Fail closed before mutation; no permission from historical evidence |
| Approval observed by automatic worker | No dispatch, model call, provider action, repository write or spending |

Use independent PostgreSQL connections for races and real Django session/API
requests for authorization. Mocks can test orchestration but cannot qualify
exclusive ownership or atomic release. New migrations, source pins and seals must
form an explicit successor to the qualified draft writer, preserving its proof.
No Gate 2 model, route, migration, UI approval control or reservation writer has
been installed in this checkpoint.
