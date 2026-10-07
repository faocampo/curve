# Pending stages

## Current consolidation checkpoint — 2026-10-07

Start with [project status](project-status.md) (current integration, acceptance
gates and next three actions). Curve reconstruction contracts are merged; Plane
application candidates are collected in one draft PR. The October and September
records below retain their dated scopes and do not supersede current merge evidence.

## Local reconstruction checkpoint — 2026-10-06

The [local pilot delivery record](local-pilot-delivery-2026-10-06.md) (restored
baseline, new implementation evidence and remaining acceptance) and
[manual Gate 2 implementation](manual-gate2-reservation-candidate.md) (separate
qualified successor, exclusive reservations and default-off UI) describe current
local work. These tests and integration records provide no publication, merge, deployment
or activation authority by themselves. The earlier roadmap and historical evidence below retain their original
scope; local integration does not complete M3, the manual pilot or R1.

This is the concise reading guide to the existing roadmap, not a replacement
catalog or execution grant. Work-package IDs, FR/NFR/AC traces and detailed
acceptance scenarios remain in the [development plan](development-plan.md)
(normative backlog) and [M1–M7 packets](m1-m7-task-packets.md) (child boundaries).
Use [coding handoff](coding-handoff.md) (current branch evidence and next task)
before dispatch. Preserve completed historical evidence; recheck current state.

## M0 — Complete the required foundation

- **Outcome:** authorized, durable, observable operations with protected storage
  and explicitly activated providers.
- **Remaining:** M0-04 protected objects, envelopes, upload/download, retention,
  hold/erasure/restore; M0-S9B provider transport/administration; M0-S9C model
  gateway and routing when a consuming task needs models.
- **Gates:** private scoped retention and storage activation evidence; exact
  provider identity/endpoint profile; model/data/budget decisions for model calls.
- **Exit:** isolation, integrity, revocation, erasure, restore, failure recovery
  and applicable provider conformance proven in the target environment.
- **Read:** [M0 audit](m0-completion-audit.md) (accepted local scope and gaps),
  [provider transport](m0-s9b-provider-transport-task-packet.md) (independent
  transport children), [model gateway](m0-s9c-model-gateway-task-packet.md)
  (model-only dependencies), [security](security-and-operations.md) (controls).

## M1 — Complete manual alignment and exact PRD approval first

- **Outcome:** Draft → Aligning → PRD Review → Planning after current assigned
  human approval of the displayed immutable PRD and accessible evidence.
- **Remaining:** accepted-command Git-reference integration; authorized Google
  binding/capture and storage; current Idea Brief/inventory inputs; edit/open,
  submit, review, return/resubmit and truthful progress/cancel UI; full regression.
- **Gates:** relevant M0 storage/provider profiles; approved screen behavior;
  Onyx/model/paid-work decisions only for those optional integration children.
- **Exit:** authenticated browser proves the complete lifecycle, source edits and
  permission loss, exact-version approval, rejection, replay and recovery. Every
  material approver can access the evidence used.
- **Read:** [M1 parent](m1-alignment-evidence-prd-task-packet.md) (child plan),
  [external PRD](m1-external-prd-checkpoints.md) (Google authoring/capture),
  [readiness](prd-submission-readiness.md) (submission requirements).

## M2 — Product roadmaps and work linkage

- **Outcome:** Products, Milestones and Features relate roadmap-backed Initiatives
  to execution without creating another lifecycle authority.
- **Remaining:** roadmap/movement aggregates, Initiative and Feature Delivery
  linkage, Plane work-item completion projection, portfolio/Gantt and snapshots.
- **Gates:** D-013 new-initiative/no-import policy; Product conformance variance
  R-027; M1 contracts for linkage; M0-04 for protected exports.
- **Exit:** movement/permission/history and completion formulas pass; immutable
  snapshots reproduce; absent critical-path data is shown explicitly.
- **Read:** [M2 plan](development-plan.md#m2-product-roadmap-and-schedule)
  (packages M2-01–M2-06). Import is deferred post-R1. Cycles stay project-scoped.

## M3 — Exact repository plans and Gate 2

- **Outcome:** an approved, bounded multi-repository plan with typed dependencies,
  pinned bases/context, acceptance tests and rollback.
- **Remaining:** GitHub/GitLab read discovery, deterministic analysis, Context
  Packs, plan validator, human Gate 2 and supersession impact decisions.
- **Gates:** D-008 repository authority; storage for protected context;
  B-NO-MODEL-BUDGET-01 for deterministic zero-model/zero-budget plans. M3-05
  currently requires D-014 at Gate 2; retain that requirement pending the owner
  decision on the manual exception. Model policies gate activated generation.
- **Exit:** acyclic one-repository slices, complete traces and authorization;
  no permissioned content in Git; re-plan/invalidation tests pass.
- **Read:** [M3 plan](development-plan.md#m3-repository-understanding-and-execution-planning)
  (packages M3-01–M3-06), [decision index](later-milestone-decision-readiness-index.md)
  (owner decisions and fallbacks).

## M4 — Controlled execution and human assistance

- **Outcome:** observable, cancellable execution with isolated attempts and one
  current authorized lease; human assistance remains attributable.
- **Remaining:** execution SDK/fake, OpenHands adapter, Orca MCP profile, trusted
  runner, dispatch workflow and Execution Console.
- **Gates:** gVisor/OpenHands proofs, target runtime, tool/authority/lease profiles,
  budgets and protected context. D-006/D-007 apply to the Orca/MCP lane.
- **Exit:** both provider-specific lanes pass; replay, lease loss, cancellation,
  cleanup, secrets, egress and cross-run isolation are verified.
- **Read:** [M4 plan](development-plan.md#m4-agent-execution-and-isolated-runners)
  (packages M4-01–M4-06), [execution decision](coding-agent-local-execution-decision.md)
  (human bootstrap versus production dispatch).

## M5 — Quality, VCS and delivery readiness

- **Outcome:** exact-head quality evidence and human Code Readiness across a
  coordinated PR set, with feature-delivery obligations visible.
- **Remaining:** quality policy/executors/review, waivers, GitHub/GitLab controller,
  CI projection/rework, Gate 3, delivery contracts and applicable documentation,
  flags and observability evidence.
- **Gates:** D-008 VCS identity, D-010 quality/license policy; D-011 flags and
  D-012 Docusaurus only when applicable; model/data/budget profiles for AI review.
- **Exit:** both VCS providers pass; new heads invalidate approval; non-waivable
  failures block; human readiness remains separate from merge/deploy.
- **Read:** [M5 plan](development-plan.md#m5-quality-vcs-code-readiness-and-feature-delivery-contract)
  (packages M5-01–M5-14), [delivery lifecycle](kanban-delivery-lifecycle.md)
  (board projection and evidence).

## M6 — Prototypes, feedback and measurable operation

- **Outcome:** safe previews, attributable feedback, reliable metrics and bounded costs.
- **Remaining:** isolated preview lifecycle, local prompt export/authorized
  delivery, feedback promotion, KPI computation and budget/capacity controls.
- **Gates:** target environment, sandbox and paid budget where consumed; D-016
  metric definitions; provider/data policy for external delivery.
- **Exit:** expired previews are inaccessible, feedback creates new PRD versions,
  metrics reproduce and budget exhaustion stops the affected work safely.
- **Read:** [M6 plan](development-plan.md#m6-prototypes-feedback-kpi-and-optimization)
  (packages M6-01–M6-05). Local deterministic export needs no provider activation.

## R1 — Qualification and rollout

- **Outcome:** the complete M0–M6 product is verified, supportable and releasable.
- **Remaining:** AC-01–AC-60 evidence, security qualification, disaster recovery,
  licensing/source obligations and controlled pilot/rollout.
- **Gates:** all applicable decisions and owners; D-015 pilot, D-016 rollout.
- **Exit:** every required AC passes; release/security/operations/licensing
  sign-offs refer to the tested release. A manual M1 demonstration is not R1.
- **Read:** [R1 plan](development-plan.md#r1-qualification-and-controlled-rollout)
  (packages R1-01–R1-05), [test strategy](m0-test-strategy.md) (coverage ownership).

## M7 — Deferred expansion

- **Outcome:** post-R1 expense governance, attention intake and scheduled jobs.
- **Gate:** separate scope approval, provider/data/side-effect decisions and a
  revised catalog before coding. No current M7 implementation task is implied.
- **Exit:** to be specified in the approved extension packet.
- **Read:** [M7 charter](m7-intelligence-and-automation-extension.md)
  (proposed capabilities and extension rules).
