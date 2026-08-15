# Curve GitHub Project Execution Map

## Document control

| Field | Value |
| --- | --- |
| Status | Active execution-control contract |
| Version | 1.0 |
| Date | 2026-08-14 |
| Project | [Curve GitHub Project #2](https://github.com/users/faocampo/projects/2) |
| Normative work catalog | [Development plan](development-plan.md#work-package-catalog) |
| Interim human reviewer | Federico Ocampo (`faocampo`) |
| Last reconciliation | 2026-08-14 at Curve revision `2b39e89...`: 70 total items, 70 unique IDs, zero duplicates, all Size values set |

## Purpose

GitHub Project #2 is Curve's execution index. Every P0, M0-M6, and R1 package in the development plan has exactly one project item whose title begins with the stable work-package ID. The development plan remains normative for scope, dependencies, traceability, and acceptance. The project shows current execution state and routes humans to that source.

No Curve application coding begins until the target package exists in Project #2, its dependencies and decision gates are satisfied, its immutable task packet is complete, and its project status is `Ready`.

## Source inventory

| Phase | ID range | Item count | Initial status policy |
| --- | --- | ---: | --- |
| P0A foundation readiness | P0-01-P0-06 | 6 | Current readiness-board projection |
| P0B just-in-time proofs | P0-07-P0-12 | 6 | Backlog until proof authorization |
| M0 foundation/control plane | M0-01-M0-09 | 9 | Backlog until dependencies and ADRs close |
| M1 alignment/evidence/PRD | M1-01-M1-07 | 7 | Backlog |
| M2 roadmap/schedule | M2-01-M2-06 | 6 | Backlog |
| M3 repository/planning | M3-01-M3-06 | 6 | Backlog |
| M4 agents/runners | M4-01-M4-06 | 6 | Backlog |
| M5 quality/VCS/readiness | M5-01-M5-14 | 14 | Backlog |
| M6 prototypes/KPIs | M6-01-M6-05 | 5 | Backlog |
| R1 qualification/rollout | R1-01-R1-05 | 5 | Backlog |
| **Total** |  | **70** |  |

## Field mapping

| GitHub Project field | Curve source | Rule |
| --- | --- | --- |
| Title | Work-package ID plus deliverable | Stable ID prefix is the deduplication key. |
| Status | Readiness/execution projection | Managed by the transition rules below. |
| Size | Development-plan size | `S`, `M`, or `L` from the normative catalog. |
| Priority | Unassigned | Product and engineering approvers must decide it; the sync does not infer priority from phase. |
| Estimate | Unassigned | Set only by an approved estimation method. |
| Iteration | Unassigned | Set only after capacity and sequencing approval. |
| Assignees | Unassigned until dispatch | A named owner is required before execution. |
| Reviewers | Federico Ocampo for the current phase | Exact-head disposition remains required. |

## Status contract

| Project status | Curve meaning | Allowed transition evidence |
| --- | --- | --- |
| Backlog | Blocked, dependency-unsatisfied, or not yet prepared | The body retains dependencies and the normative source. |
| Ready | Complete codeability definition satisfied | Pinned baseline/task packet, named owner/reviewer, ADRs, commands, budget, policy, and rollback are complete. |
| In progress | An authorized proof or implementation step is active | The executor records purpose, repository, exact scope, evidence, risk, and rollback before mutation. |
| In review | Output is complete and awaiting required human/CI/gate disposition | Exact artifact or commit head plus validation evidence is linked. |
| Done | Acceptance evidence is complete and required merge/gate outcome is recorded | Dependencies, tests, review, and immutable evidence all pass. |

Blocked work remains `Backlog`; blockers are represented in the item body and normative readiness board. `Done` never means merely "code generated" or "draft PR opened."

## Synchronization commands

The idempotent sync reads the development-plan tables directly and fails unless it finds exactly 70 unique package IDs.

```text
pnpm project:check
pnpm project:sync
pnpm project:sync -- --status M0-01="In progress"
pnpm project:sync -- --status M0-01="In review"
pnpm project:sync -- --status M0-01="Done"
```

`project:check` is read-only and validates the local catalog. `project:sync` is an explicit GitHub write. A full sync creates missing items and preserves the current status of existing items. A targeted `--status` update changes only the named item and refreshes its governed body.

Project #2 is private. The unauthenticated external-link checker excludes this one exact URL because GitHub returns 404 to anonymous callers; authenticated validation uses `gh project view 2 --owner faocampo` and the 70-item reconciliation instead.

The executor updates the project immediately before starting a package, after opening its review artifact, when a newly discovered blocker changes readiness, and after final acceptance. Every status update is reported before execution under the Curve execution protocol.

## Fail-closed rules

- Duplicate stable IDs stop synchronization before the affected item is changed.
- Missing `Status` or `Size` fields/options stop synchronization.
- Unknown task IDs or statuses stop synchronization.
- Priority, estimate, iteration, assignee, or milestone values are never invented.
- Project status never overrides an ADR, task packet, acceptance test, repository check, or human gate.
- Application coding stops if the project item is missing or is not `Ready` at dispatch.

## References

- GitHub CLI project manual: [GitHub CLI project](https://cli.github.com/manual/gh_project)
- GitHub Projects documentation: [GitHub Docs - About Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects)
- GitHub Projects filtering: [GitHub Docs - Filtering Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/filtering-projects)
