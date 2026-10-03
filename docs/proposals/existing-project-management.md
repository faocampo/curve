# Curve: managing existing projects

Status: draft pending owner approval of the mapping; no runtime authority or activation.
Date: 2026-10-02.

## Recommendation

Make an existing Plane Project a first-class entry point in Curve. Associate it explicitly with a Curve Product, and govern selected future changes through ordinary Curve Initiatives. Do not turn a long-lived project into one enormous Initiative or fabricate historical approvals.

This supports an already-running product immediately: its current backlog remains actionable in Plane, its project appears in Curve, and new decisions, PRDs and delivery scopes can be managed above the same work. A task does not have to be newly created to participate in a prospectively approved scope.

Importing data from another task manager is a separate prerequisite owned by the operator. Association begins after the existing project is present in Plane. It does not inspect or import another provider.

## What exists and what is proposed

| Capability | Current evidence | Remaining work |
| --- | --- | --- |
| Existing-project directory, lead, module targets, cycle ends, source coverage | Local candidate `6135f4df6e65207aa8ae07e08dc59b65b3c9abba`; 187 web tests and 60 aggregate checks passed | Visual acceptance and authenticated source qualification |
| Protected PRD metadata panel | Local candidate `e2556004ab253a2289677df14c193d845613b722`; backend/frontend and database tests | Trusted provider qualification, visual acceptance and operational gates |
| Explicit Project-to-Product association | Proposed here | Reviewed policy/schema, command implementation and tests |
| Existing work selected for a new approval scope | Proposed here, building on existing WorkItemBinding concepts | Exact-subject validation and lifecycle integration |
| Historical approvals or automatic lifecycle adoption | Excluded | Never inferred from task status, import time or association |
| Native task edits from the first MVP | Available through native Plane destinations, subject to Plane permissions | Embedded Curve task editing requires a separate bounded command surface |

These local candidates are not merge, deployment, live-provider or complete-MVP evidence.

## Domain mapping

1. One Plane Project has at most one active Curve Product association within the exact provider installation and workspace.
2. One Curve Product may associate several Plane Projects, accommodating separate platform or team backlogs.
3. A Product may contain many Initiatives. Each Initiative addresses an explicit scope, including a change in an already-running project.
4. An Initiative may reference selected existing work items within that Product's active associations. Reference membership is explicit, never all current and future project tasks by default.
5. For the first implementation, one work item has at most one active controlling Initiative binding. Read-only evidence references from other initiatives remain possible; they do not create duplicate completion accounting.
6. Plane Modules remain Modules and Cycles remain Cycles. Association never converts them into Curve Milestones or treats a cycle end as a release commitment.

The one-Product association constraint avoids competing authority. Moving a project between Products is a deliberate end-and-create operation after active bindings are reconciled, not an in-place rewrite of historical identity.

## User flow

### Add an existing project

- Open Projects in Curve and select an accessible Plane project.
- Choose an existing Curve Product, or create one through its normal authorized flow.
- Review the source identity, current lead, Product owner, effective date and scope: existing history remains source-owned; Curve governance applies to explicitly selected change scopes.
- Confirm association. Display an event receipt and effective time, not a claim that work was imported or approved.

### Manage work already underway

- Open the associated project in Curve and inspect current source facts.
- Use native Plane links to edit tasks immediately under existing permissions.
- Choose “Define next change” to create an Initiative with its normal initial state and reviewers. Existing work items may be selected as contextual evidence or proposed delivery scope.
- Describe the remaining outcome and acceptance criteria. Existing implementation is evidence, not proof that a gate has passed.
- Submit and approve the exact PRD and plan using the ordinary three-gate flow. Selecting an existing item does not skip PRD, planning or security requirements.
- Once the scope is authorized, execution tracking uses the explicitly approved bindings and versioned scope. Completed historical work stays visibly historical; it does not create a new approval event.

For a project already near completion, the Initiative can govern validation, remaining defects and release readiness. Curve must not force the operator to pretend the entire project started today.

## Proposed contract boundary

Introduce an additive policy edition, provisionally `EXPLICIT_EXISTING_PROJECT_ASSOCIATION`, as a successor to the D-013 proposed new-initiative-only boundary. Preserve the original text, approval subjects, digests and historical evidence. The new edition authorizes explicit references and prospective governance; it does not enable roadmap conversion or bulk import.

A proposed `ProjectAssociation` aggregate contains:

- Opaque ID, exact workspace and provider-installation identity.
- Immutable source project ID and Curve Product ID for that association.
- State `ACTIVE` or `ENDED`, monotonically increasing version.
- Effective time, authenticated initiating human, policy edition and command receipt.
- End time/reason when ended; no destructive deletion of audit evidence.

Keep observation state separate: `AVAILABLE`, `STALE`, `UNAVAILABLE`, or a confirmed source lifecycle state. Loss of access must not be represented as source deletion. Store a minimal permission-safe projection with observation time and source version when the provider supports one. Avoid collecting descriptions, comments or member emails just to create an association.

Suggested commands are ASSOCIATE and END_ASSOCIATION. Names and wire schemas remain candidates, not additions to the active action registry. Neither command modifies the Plane Project or reassigns its members, lead, tasks or historical events.

## Authorization and consistency

- Only an authenticated human with current authority over the target Curve Product and the exact Plane project may associate them. Recommended MVP requires a current workspace administrator plus current authorized access to the project, using a new explicit policy action. Existing provider-registration role mapping must not be reused as a blanket grant.
- Resolve principal, membership and permission from trusted current services; ignore caller-supplied role assertions. Recheck inside the transaction or use the established consistency fence before commit.
- Cross-workspace and cross-installation associations fail closed. Product archival, missing source identity and an existing conflicting association block creation.
- Every mutation requires an idempotency key, exact association/Product version where relevant, and a policy decision tied to the command subject. Following the existing integration conventions, missing expected version is 428 and stale version is 412.
- Enforce one active association with a database constraint, not only a preflight query. Commit association, audit and outbox together.
- Replays return the original authorized outcome only after current visibility checks; they must not disclose a resource after access is revoked.
- Source timeouts never authorize a command. A cached display or successful read is not permission to write.

## Scope, progress and decisions

Show two distinct concepts without making users learn a second task tracker:

- Project operations: current Plane work, lead, schedules and source coverage.
- Governed changes: the Product's scoped Initiatives, exact PRD checkpoints, accountable reviewers, decisions and delivery evidence.

A project is not “approved” merely because one Initiative is approved. A completed task is not proof of release, activation, adoption or business outcome. If execution completion is later enabled, use the existing estimate-weighted/COUNT_BASED contract over approved non-cancelled leaf bindings; preserve the method and denominator and keep this separate from product outcome metrics. The present outlook intentionally shows no completion percentage.

Today/attention can link to these same project and Initiative identities. Closing a personal reminder never closes a Plane task or approves a PRD. Deduplicate references without exposing restricted source content.

## Reconciliation and safe removal

- Project rename: refresh the safe display projection; immutable source identity is unchanged.
- Lead/member changes: reread current permissions; do not copy project lead into gate assignments automatically.
- Temporary outage: retain only permitted cached display with explicit age/coverage; block dependent mutations.
- Revoked access: clear protected projections immediately when detected; stop reads/actions and require fresh authorization. Audit must use safe identifiers and avoid leaking project existence to unauthorized callers.
- Archived/deleted project: distinguish a trusted explicit lifecycle event from a generic 404; mark confirmed status and prevent new bindings. Preserve authorized historical audit.
- Ending association: default block while any active controlling Initiative binding depends on it. Offer a review of affected scopes; no cascade delete or silent reassignment.
- Reassociation: create a new aggregate after reconciliation, with a reference to the earlier association when permitted. Do not repoint prior snapshots.

For the MVP, reconcile on view refresh and immediately before commands. Background scheduling, provider events and service-level objectives require a separately qualified operating profile; do not imply instant detection while offline.

## Delivery slices and acceptance

### A. Review the interaction and policy

Deliver a clickable synthetic “associate existing project” flow and a closed candidate schema/policy. Review explicit scope, permissions, confirmation text, conflicts and removal. Existing source-connected features stay read-only until this gate passes.

### B. Implement local association

Implement storage, same-workspace constraints, guarded commands, audit/outbox and projection. Use synthetic source adapters and real database transactions. Prove concurrent creation, revocation between read/commit, idempotent replay, stale versions, archived Product, association conflict, response redaction and rollback.

### C. Govern a selected existing scope

Integrate explicit existing-work selection into ordinary Initiative creation/refinement. Prove no synthetic approvals; exact checkpoint/plan binding; cancelled/parent-child accounting; changed scope invalidation; and no bypass through MCP.

### D. Qualify an operator-controlled pilot

On an approved local installation, choose one accessible existing project, associate it, define one remaining change and complete the authorized review flow. Record actual evidence and rollback. Provisioning credentials, activating providers and migrating real data are separate operator/security actions.

The MVP is acceptable when an already-running project can be opened in Curve, associated deliberately, operated through native Plane, and have a selected remaining change governed prospectively without duplicating tasks or falsifying history.

## Owner decision

Recommended default: approve the explicit Product association and prospective selected-scope model described here for the next implementation packet. The requirement to support existing projects is already established; the remaining review concerns this mapping and its authority boundaries. If direct task editing entirely inside Curve is required for first release, define that command scope explicitly before adding it.

## Repository evidence

Read at Curve main `8326d3b788a18296ddae32ee2347f09cba9720b2` (local generic-boundary edits do not change these adoption contracts):

- `docs/curve-ai-native-sdlc-prd.md`: D-013, three-gate lifecycle, FR-028/AC-38 progress semantics.
- `docs/technical/d012-d016-rollout-decision-readiness.md`: original new-only adoption boundary, external references, reconciliation and import gates.
- `docs/technical/domain-model.md`: Product, Initiative, RoadmapItem, WorkItemBinding and snapshot ownership.
- `docs/technical/integration-contracts.md`: command concurrency and error conventions.
- `docs/technical/coding-handoff.md` and `repository-delivery-policy.md`: exact-subject authority, pending UX gate, no dependent-PR growth and separate deployment evidence.

This proposal is a standalone design artifact. It does not edit those contracts or resolve their review gates by itself.
