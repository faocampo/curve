# Curve project status

Updated: 2026-10-08. Existing work is consolidated into the canonical documentation
branch and one application review candidate. The remaining application merge is
held for the owner's exact-candidate UX acceptance. Upstream synchronization is
merged; the refreshed application candidate has passed exact-head CI.

## Baseline and merge position

| Repository | Integration position | Remaining work |
| --- | --- | --- |
| Curve | `main`: PRs #170 and #171 merged; reconstruction integration commit `e2428ae627c0022fda7a91d8e950b921b6a668c2`; final handoff delivered through [PR #172](https://github.com/faocampo/curve/pull/172) (consolidation results) | Application UX acceptance is the next delivery gate |
| Plane fork | `curve-integration`: `0cc166bc480525a8301535eb392e1708b0c555e7`; [PR #47](https://github.com/faocampo/plane/pull/47) (upstream synchronization) merged | Single draft PR #17 at `9b6ccc9903`: synchronized Initiative/PRD, existing-project, manual-planning/Gate 2 and local-pilot candidates |
| Private governance | Canonical remote branch inspected; no local-only work | Actual policy, activation and operational evidence stay in the protected repository |

The October 7 consolidation reduced Plane's 26 remote branches to **five**: integration, upstream `preview`, one
recovery checkpoint, the draft PR and an actively used reconstruction branch.
Twenty-one redundant remote heads were retired with exact-tip checks and recovery
refs. Original local changes, stashes and branches are preserved. The review
demo was left untouched; its containers were absent at the final environment check.
See the [consolidation ledger](project-consolidation-2026-10-07.md) (exact merges,
checks, retained exceptions and recovery evidence) and [branch inventory](project-consolidation-branch-inventory-2026-10-07.md)
(all original local branch dispositions).

The fork and upstream `preview` now match `bab49bb978`. PR #47 passed every CI
check, including 395 backend tests (10 skips). Its integration preserves Curve
contracts and Temporal 1.31.0 while adopting upstream source relocation, Propel,
React 19, security pins, uv and storage-image updates. The refreshed PR #17 passes
392 frontend tests, 22 script tests, types, lint and contract integrity locally.
Current candidate [API CI](https://github.com/faocampo/plane/actions/runs/37809745762)
(partitioned native backend and host-double checks) and
[web CI](https://github.com/faocampo/plane/actions/runs/37809749184)
(full package format, lint, build and types) passed for the exact candidate:
2,331 backend/host-double tests plus 13 storage regressions, with 12 Temporal
time-skipping skips. Migration-drift checks, API lint and full web checks passed.
Earlier evidence retains its historical scope.
The current [React Doctor report](https://github.com/faocampo/plane/actions/runs/37809756335)
(advisory frontend findings) reports 5 errors and 120 warnings; triage remains open.

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
   retire eligible source heads. Preserve the existing demo source and data until
   a separately authorized, recoverable environment refresh is ready.
3. **Development agent: select one remaining roadmap slice.** Use
   [pending stages](pending-stages.md) (outcomes and gates), qualify its prerequisites,
   then open one cohesive PR. Include advisory frontend findings in its triage.

The Today prototype's human acceptance and production storage/provider activation
retain separate gates. Twelve Temporal time-skipping cases remain unverified in
the available test environment; their fresh proof belongs to qualification.
The October 8 application CI passed; copyright validation and CodeQL also passed. See the ledger
for exact-head evidence and the advisory frontend findings still requiring triage.

Scope remains existing-work consolidation and integration repairs. Unfinished
features stay in backlog. Apply the [delivery policy](repository-delivery-policy.md)
(one cohesive PR, at most two dependent PRs, exact-head evidence and safe cleanup).
