# Kanban Delivery Lifecycle

## Purpose

The Curve Kanban board expresses the delivery journey from an identified need through pre-production validation, monitored production rollout, confirmed customer use, and closure. It gives product, engineering, quality, and Operations one shared operational view of work progress.

This is a delivery-board projection. Curve continues to retain its separate initiative, slice, PR/MR, Code Readiness, and Feature Delivery Contract states as authoritative evidence models. The board surfaces their relevant facts in a user-centered sequence.

## Canonical status order

| Order | System code | Board label | Meaning | Required progression evidence |
| ---: | --- | --- | --- | --- |
| 1 | `DEFINITION` | Definition | The outcome, scope, constraints, dependencies, and acceptance conditions are being established. | A bounded outcome, accountable owner, and initial acceptance conditions exist. |
| 2 | `PLANNED` | Planned | The work is sized, sequenced, assigned, and ready to begin according to the approved plan. | Dependencies, plan/contract applicability, owner, and start conditions are satisfied. |
| 3 | `IN_PROGRESS` | In progress | Engineering and approved agent activity are producing the required change. | An active implementation attempt or attributable human work record exists. |
| 4 | `STAGING` | Staging / Pre-prod | The change is being tested in a pre-productive environment. | A deployed pre-production candidate, applicable test evidence, known-risk disposition, and promotion/rollback decision are recorded. |
| 5 | `SHIPPED_MONITORING` | Shipped & Monitoring | The feature is released to production and is being observed while Operations coordinates its expansion across the customer portfolio. | Production release observation, monitoring definition/current signals, Operations rollout plan, customer-cohort state, and escalation owner are recorded. |
| 6 | `DONE` | Done | The feature has been successfully used by at least one customer. | A named or appropriately redacted customer-use observation, success criteria result, time, source, and accountable confirmation are recorded. |
| 7 | `CLOSED` | Close | The delivery record is administratively closed after its customer-use outcome, remaining ownership, evidence, and follow-up disposition are complete. | Closure decision, final evidence summary, continuing Operations/support ownership or explicitly accepted completion, and linked follow-up items are recorded. |

## Transition rules

1. Board progression follows the order above; a recovery, failed validation, or monitoring signal can return work to the relevant earlier status with an attributed reason.
2. `Staging / Pre-prod` is the canonical label. `Pre-prod` is the accepted compact label where screen width is constrained.
3. `Shipped & Monitoring` begins only after an observed production release. Its purpose includes monitoring behavior and coordinating Operations-led expansion from an initial customer cohort across the portfolio.
4. `Done` requires successful use by at least one customer; release alone or a passing pre-production test does not satisfy this status.
5. `Close` retains the full delivery record and evidence. It ends active Kanban tracking after the accountable owner records the final disposition.

## Board treatment

### Card evidence

The board shows the single lifecycle status as the column location. Cards also display the evidence appropriate to the current status:

| Status | Required visible card evidence |
| --- | --- |
| Definition | Outcome, owner, dependencies, and open assumptions. |
| Planned | Planned date/sequence, owner, dependency state, and rollout intent. |
| In progress | Implementation progress, active attempt/person, and current blocker or question. |
| Staging / Pre-prod | Environment, test/check summary, rollback readiness, and promotion decision. |
| Shipped & Monitoring | Release observation, health signals, Operations owner, current customer cohort, and next expansion decision. |
| Done | Customer-use confirmation, success observation, and date. |
| Close | Closure owner, final evidence summary, archive/support handoff, and linked follow-up work. |

### Independent overlays

`Blocked`, `At risk`, `On track`, `Waiting for human`, and similar health/attention indicators are overlays. They remain visible on a card at any lifecycle status and never replace its lifecycle column.

Quality review, VCS validation, and Code Readiness remain card-level evidence and gate projections. They support movement into pre-production and production; the Kanban board displays their state without creating separate `Review` or `Ready` columns.

## Experience artifact

The approved visual direction is [Curve Kanban delivery lifecycle v2](../design/mockups/curve-kanban-delivery-lifecycle-v2.png). It presents all seven headers, a horizontal-scroll affordance for compact screens, pre-production test evidence, an Operations cohort-expansion signal, customer activation confirmation, and a final closure record.
