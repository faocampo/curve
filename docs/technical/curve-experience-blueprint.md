# Curve Experience Blueprint Gate

## Purpose

This gate keeps Curve’s product experience centered on user decisions while Plane-backed work management and control-plane details remain in their appropriate contexts. It is a delivery prerequisite for every package that creates or materially changes a user-facing flow.

The record created through this gate becomes the implementation contract for the affected flow. It complements the PRD, architecture, API/event contracts, and accessibility tests; it does not change their authority.

## Required workflow gates

| Gate | Required artifact | Approval decision | Implementation effect |
| --- | --- | --- | --- |
| UX-001 | Information architecture and role model | Core navigation and role boundaries accepted | Identifies the surface that owns the flow. |
| UX-002 | End-to-end task flow for a representative thin slice | Primary user journey accepted | Confirms the path from user goal through decision/outcome. |
| UX-003 | Low-fidelity screen and state inventory | Interaction model accepted | Captures normal, loading, empty, error, permission-limited, confirmation, and recovery states. |
| UX-004 | Clickable prototype and task-based review record | Flow is approved for implementation | Demonstrates that target users can complete the primary task unaided and that advanced details appear progressively. |
| UX-005 | Work-package-linked screen contract | Exact implementation scope accepted | Enables the corresponding user-facing package to enter `Ready`. |

UX-001 through UX-004 may cover several coherent flows. UX-005 is required for each user-facing work package. A material change to the primary task, navigation location, role authorization, state transition, or progressive-disclosure behavior supersedes the affected record and requires a new UX-004/UX-005 disposition before implementation continues.

## Product-shell invariant

Curve owns the user-facing application shell. Every Curve-enabled experience uses the approved Curve logo, product name, global navigation, breadcrumbs, and lifecycle terminology as its primary identity. The global information architecture is:

| Navigation group | Primary destinations | Authority and purpose |
| --- | --- | --- |
| Product | Home, Initiatives, Roadmaps | Product intent, definition, sequencing, and accountable decisions. |
| Delivery | Execution, Quality, Evidence | Plan execution, exceptions, quality results, lineage, and delivery readiness. |
| Work management | Projects, Work items, Cycles, Views, Analytics | Plane-backed collaboration and work tracking; Plane remains authoritative for native records. |
| Platform | Integrations, Policies, Foundation status, Settings | Platform configuration and operational verification for authorized roles. |

The Curve shell exposes Plane attribution, open-source notices, and the exact-version AGPL source link through an About, Open source, or equivalent product surface. Plane attribution remains visible without becoming the primary application logo or a peer top-level product entry.

## Work-package experience records

| Work package | Experience record | Review state | Implementation effect |
| --- | --- | --- | --- |
| M0-S4 (API, SSE, and minimal UI implementation packet) | [Foundation probe experience](ux-m0-s4-foundation-probe.md) (clickable local foundation-status flow and screen contract) | `IMPLEMENTED_AND_ACCEPTED` | UX-004-M0-S4 (clickable prototype and task-based review) and UX-005-M0-S4 (work-package-linked screen contract) were approved at exact head `a463876...` and merged through Curve PR #17 as `42ea329...`; Plane PR #6 merged the accepted implementation as `e762fbb...`; see [M0-S4 implementation evidence](m0-s4-implementation-evidence.md) (exact context, tests, product/security acceptance, and rollback). |
| M1-01B (Curve-first Initiative shell) | [Initiative shell experience](ux-m1-01b-initiative-shell.md) (clickable list/create/detail/lifecycle prototype, state matrix, accessibility contract, and task-based review) | `UX_APPROVED / IMPLEMENTATION_PACKET_REQUIRED` | Federico approved UX-006-M1-01B (clickable prototype and task-based review) and UX-007-M1-01B (work-package-linked screen contract) at exact tested Curve commit `656a196...`; Plane implementation remains unauthorized until the implementation packet binds its exact context digest, Plane base, commands, acceptance, and dispatch approval. |

## Experience model

Curve organizes interaction around these user goals:

| User role | Primary job | Primary decision surface |
| --- | --- | --- |
| Product or program owner | Establish intent, scope, priorities, and product approval | Initiative, definition, roadmap, and Gate 1 |
| Delivery lead | Coordinate plan execution and resolve exceptions | Plan, execution status, dependencies, and escalations |
| Engineer or agent operator | Complete assigned work with bounded context | Assigned slice, questions, progress, evidence, and handoff |
| Technical, quality, or code approver | Evaluate current evidence and make an accountable decision | Quality, readiness, exceptions, and gates |

Navigation and screen hierarchy must use these goals. Domain detail—such as provider configuration, audit lineage, orchestration internals, or reconciliation—appears in context when it supports the current decision. The primary action and current state remain visible without requiring the user to interpret internal service topology.

## Blueprint record template

Every work-package-linked record contains the following fields:

```yaml
id: UX-<stable-id>
work_package: <M0-01 or other project package ID>
status: DRAFT | APPROVED | SUPERSEDED
owner: <named product owner>
approver: <named accountable approver>
target_role: <role from experience model>
user_job: <user outcome expressed as a task>
information_architecture: <owning navigation surface and entry points>
primary_flow:
  trigger: <entry condition>
  steps: <ordered screen/action/state transitions>
  success_outcome: <observable completed outcome>
  recovery_paths: <resume, retry, cancel, escalation>
screen_state_inventory:
  - screen: <name>
    primary_action: <one dominant action>
    states: [normal, loading, empty, error, permission_limited, confirmation]
    progressive_disclosure: <details hidden until relevant and how revealed>
    accessibility: <keyboard, focus, labels, live updates, error recovery>
prototype_review:
  artifact: <prototype URL or immutable artifact digest>
  participants: <target-role reviewers>
  tasks: <task script>
  result: PASS | REWORK_REQUIRED
  findings_and_disposition: <tracked outcome>
approval:
  decision_at: <UTC timestamp>
  evidence: <review record or immutable digest>
```

## Review and acceptance criteria

The accountable product owner approves UX-004/UX-005 only when all of the following are demonstrated:

1. A representative target-role user completes the primary flow without assistance beyond the task prompt.
2. Each screen has a clear purpose and one dominant action appropriate to the flow state.
3. The screen/state inventory covers normal, loading, empty, error, permission-limited, confirmation, and recovery behavior when applicable.
4. Role visibility and actions match the authorization contract; sensitive evidence remains protected.
5. Keyboard navigation, focus management, labels, status updates, and recovery paths are specified sufficiently for the package’s browser/accessibility tests.
6. Advanced orchestration, provider, audit, and runtime information is presented progressively in the decision context that needs it.
7. The approved record links to the exact project package and its planned acceptance tests.

## Initial design sequence

The first experience artifact is the initiative-to-approval thin slice:

```text
Select or create initiative
  -> define outcome, constraints, and ownership
  -> generate or edit the plan
  -> follow execution and resolve exceptions
  -> inspect current evidence
  -> make or request the accountable decision
```

This flow must be prototyped and reviewed before its related user-facing packages enter implementation. Subsequent roadmap, execution-console, quality/readiness, and prototype-feedback flows inherit the same gate and are specified as their work packages become ready.

## Concept mockup set

The following v1 mockups establish a shared visual direction for the first Curve surfaces. They are concept artifacts for UX-001 through UX-003. The accountable product owner records the UX-004/UX-005 review outcome in the relevant work-package record before implementation begins.

| Surface | Concept artifact | Primary user decision |
| --- | --- | --- |
| Main dashboard | [Dashboard](../design/mockups/curve-dashboard-v1.png) | Select the next initiative-level decision. |
| Projects, roadmaps, and tasks | [Product planning](../design/mockups/curve-planning-v1.png) | Sequence work, identify dependencies, and act on the critical path. |
| Kanban board | [Delivery board lifecycle](../design/mockups/curve-kanban-delivery-lifecycle-v2.png) | Move work from definition through pre-production, monitored customer rollout, verified use, and closure. |
| Task details and coding-agent execution | [Task execution](../design/mockups/curve-task-execution-v1.png) | Review progress and evidence, answer a scoped question, and control the run. |
| M0 local foundation verification | [Foundation probe](../design/mockups/curve-foundation-probe-v2.png) | Run, follow, recover, or cancel the local end-to-end foundation check from Platform in the Curve product shell. |

The set uses the Curve-owned navigation model defined above. Product and Delivery remain the primary lifecycle surfaces; Plane-backed capabilities are grouped under Work management; platform configuration and foundation verification are grouped under Platform. Policy, audit, provider, and runtime detail appears progressively in the decision context that needs it.

The [Kanban delivery lifecycle](kanban-delivery-lifecycle.md) (delivery-board statuses, transition meaning, and progression evidence) defines the board columns, status meaning, and progression evidence for this surface.
