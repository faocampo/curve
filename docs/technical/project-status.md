# Curve project status

Updated: 2026-10-07. Consolidation is in progress. This is the current entry
point; dated verification records retain their original scope.

## Integration baseline

| Repository | Integration branch | Verified starting commit | Pending work |
| --- | --- | --- | --- |
| Curve | `main` | `8326d3b788a18296ddae32ee2347f09cba9720b2` | Reconstruction branch: 12 commits ahead; independent status reconciliation |
| Plane fork | `curve-integration` | `9bedb74a77460c65ac681854b714a4607680398e` | Ten open PRs, plus existing-project/manual-planning reconstruction |

Plane `preview` is reserved for upstream tracking. Private governance remains in
its protected repository. Local changes, stashes and recovery checkpoints are
preserved. See the [consolidation ledger](project-consolidation-2026-10-07.md)
(branch dispositions, checks, merge outcomes and outstanding gates).

## Roadmap position

| Stage | Verified delivery position | Remaining outcome |
| --- | --- | --- |
| P0 / M0: foundation | Accepted local foundation; provider/storage work remains partial | Scoped provider proofs, protected storage and operational qualification |
| M1: Initiative and PRD | Core integrated; shell/PRD changes remain outside integration; exact-PRD and reopening candidates exist | Current authenticated journey, human UX acceptance and stack integration |
| M2: roadmap and existing work | Product core integrated; existing-project association candidate exists | Qualified roadmap, work projections and snapshot/export capabilities |
| M3: planning / Gate 2 | Manual drafts, scope reader and exclusive task-control source exists on reconstruction branch | Current integration validation and authenticated acceptance; broader planning remains pending |
| M4: execution | Foundation contracts and local orchestration skeleton | Qualified agent adapters, trusted runner and dispatch |
| M5: quality / delivery | Contracts and bounded checks exist | Integrated quality, review and trusted delivery workflow |
| M6: feedback / attention | Isolated attention experiment exists | Qualified integrated pilot surfaces and feedback/measurement |
| R1: qualification | Pending | Full acceptance, security, recovery, operations and release evidence |
| M7: expansion | Deferred | Separately approved scope and delivery packages |

Source: [development plan](development-plan.md) (milestones and exit criteria),
[GitHub Project](https://github.com/users/faocampo/projects/2) (administrative
tracking), and [reconstruction evidence](https://github.com/faocampo/curve/blob/af5616a5ca990f54943b7b6123c1b3362d0e6486/docs/technical/local-pilot-delivery-2026-10-06.md)
(dated implementation/test claims and remaining acceptance). Historical passing
tests are not fresh validation of the eventual merged tree.

## Current gates and next three tasks

1. **Finish evidence reconciliation.** Development agent: account for every branch,
   reconcile duplicate/changed merge results, validate and publish the status PR.
2. **Prepare the exact Initiative acceptance candidate.** Development agent:
   resolve integration conflicts, automate regression checks and provide the
   reviewable flow. Repository owner: review document handling, reviewer roles
   and operational flow. [Plane PR #17](https://github.com/faocampo/plane/pull/17)
   (Initiative shell) retains its explicit UX gate.
3. **Integrate qualified existing work and refresh this handoff.** Development
   agent: merge through PRs in verified dependency order; retire only proven
   redundant remote branches; report exact integration commits and exceptions.

Scope is existing-work consolidation plus integration fixes. Unfinished features
remain prioritized backlog; production deployment and runtime activation retain
their separate gates. Keep one cohesive outcome per PR and at most two dependent
open PRs per workstream under the [delivery policy](repository-delivery-policy.md)
(approved integration and cleanup rules).
