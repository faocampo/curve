# Curve project status

Updated: 2026-10-07. Existing work is consolidated into the canonical documentation
branch and one application review candidate. The remaining application merge is
held for the owner's exact-candidate UX acceptance and current-head validation.

## Baseline and merge position

| Repository | Integration position | Remaining work |
| --- | --- | --- |
| Curve | `main`: PRs #170 and #171 merged; reconstruction integration commit `e2428ae627c0022fda7a91d8e950b921b6a668c2` | Final status reconciliation in this document's PR |
| Plane fork | `curve-integration`: `9bedb74a77460c65ac681854b714a4607680398e` | Single draft PR #17: Initiative/PRD, existing-project, manual-planning/Gate 2 and local-pilot candidates |
| Private governance | Canonical remote branch inspected; no local-only work | Actual policy, activation and operational evidence stay in the protected repository |

Plane's 26 remote branches became **five**: integration, upstream `preview`, one
recovery checkpoint, the draft PR and an actively used reconstruction branch.
Twenty-one redundant remote heads were retired with exact-tip checks and recovery
refs. Original local changes, stashes, branches and the running demo are preserved.
See the [consolidation ledger](project-consolidation-2026-10-07.md) (exact merges,
checks, retained exceptions and recovery evidence) and [branch inventory](project-consolidation-branch-inventory-2026-10-07.md)
(all original local branch dispositions).

## Roadmap position

| Stage | Current delivery position | Remaining outcome |
| --- | --- | --- |
| P0 / M0: foundation | Accepted local foundation; provider/storage work partial | Scoped provider proofs, protected storage and operational qualification |
| M1: Initiative and PRD | Core integrated; shell, exact-PRD, scope and reopening candidates consolidated in PR #17 | Accepted authenticated journey and integration; qualified Google/storage flow; legacy command-edition successor |
| M2: roadmap / existing work | Product core integrated; existing-project association in PR #17 | Roadmap/work projections and snapshots; import deferred post-R1 |
| M3: planning / Gate 2 | Manual drafts, scope reader and exclusive task-control candidate in PR #17 | Accepted authenticated flow and integration; broader planning remains pending |
| M4: execution | Foundation contracts and local orchestration skeleton | Qualified agent adapters, trusted runner and dispatch |
| M5: quality / delivery | Contracts and bounded checks | Integrated quality, review and trusted delivery workflow |
| M6: attention / feedback | Attention experiment merged in Curve; standalone Today prototype in PR #17 | Accepted screen contract, authenticated integration and measurement |
| R1: qualification | Pending | Full acceptance, security, recovery, operations and release evidence |
| M7: expansion | Deferred | Separately approved scope and delivery packages |

Sources: [development plan](development-plan.md) (milestones and exit criteria),
[GitHub Project](https://github.com/users/faocampo/projects/2) (administrative
tracking), [Curve PR #171](https://github.com/faocampo/curve/pull/171) (merged
reconstruction contracts), and [Plane PR #17](https://github.com/faocampo/plane/pull/17)
(single application candidate and exact-head evidence).

## Next three actions

1. **Owner: review the Initiative UX on the exact PR #17 candidate.** Accept or
   return document handling, reviewer responsibilities and operational-flow
   simplification. Reconcile the description-first request with FR-002/AC-03
   (current Idea Brief requirements) before changing the frozen product contract.
2. **Development agent: finish the gated application delivery loop.** After
   acceptance and passing current-head checks, merge PR #17 into
   `curve-integration`, verify its integration commit, update this handoff and
   retire eligible source heads. Keep the existing demo until a separately
   authorized, recoverable refresh is ready.
3. **Development agent: select one remaining roadmap slice.** Use
   [pending stages](pending-stages.md) (outcomes and gates), qualify its exact
   prerequisites, then open one cohesive PR. Keep the Today prototype's human
   acceptance and production storage/provider activation as separate gates.

Scope remains existing-work consolidation and integration repairs. Unfinished
features stay in backlog. Apply the [delivery policy](repository-delivery-policy.md)
(one cohesive PR, at most two dependent PRs, exact-head evidence and safe cleanup).
