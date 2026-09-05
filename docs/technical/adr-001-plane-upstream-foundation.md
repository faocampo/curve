# ADR-001: Use official Plane upstream as Curve's updateable foundation

> Sanitized public reference. Fictional identities cannot authorize execution.
> Historical approvals apply only to their original bytes; see
> [public contract edition](public-reference-sanitization.md) (sanitization, integrity and approval boundaries).

- Status: DECIDED
- Decision version: 1.0 (approved); evidence addendum updated 2026-08-18
- PRD decision: D-001
- Owner and engineering approver: Designated reviewer, Designated technical owner
- Licensing reviewer: Designated reviewer, Designated technical owner
- Plane support/upgrade owner: Designated reviewer, Designated technical owner
- Product sponsor approval: Upstream-baseline direction approved on 2026-08-12
- Interim human reviewer for both PRs: Designated reviewer, Designated technical owner (`example-reviewer`)
- Advisory reviewers when a consuming milestone triggers their scope: Release owner, application security, and platform operations
- Decision date: 2026-08-15
- Required by: M0 architecture sign-off
- Supersedes: None

## Context and constraints

Curve is an additive AGPL-covered module in Designated reviewer's Plane fork. It needs to reuse Plane's work-management capabilities while allowing controlled uptake of new official Plane releases. The shared fork branch `preview` must not be force-rebased or otherwise rewritten, upstream pushes must be impossible from the normal integration remote, and every Curve task must start from an exact accepted foundation SHA.

The product sponsor confirmed that the intended model is to use the original Plane repository as the code baseline, implement Curve in the fork, and periodically incorporate official Plane updates.

## Decision drivers and weighted criteria

| Driver | Weight | Acceptance signal |
| ------ | ------ | ----------------- |
| Preserve fork ownership and AGPL corresponding-source publication | 25 | Curve releases come from the public fork with exact tags, notices, and build provenance. |
| Safely consume Plane updates | 20 | Official upstream is fetchable and exact refs are comparable without a push path. |
| Avoid shared-history damage | 20 | Updates are prepared on new integration branches; shared `preview` is never force-rewritten. |
| Preserve repository-native quality | 20 | Full frontend check/build and backend suite pass on an exact candidate tree. |
| Minimize Curve/Plane coupling | 15 | Curve remains additive and the reuse-versus-build inventory identifies stable extension seams. |

## Options considered

| Option | Outcome | Reason |
| ------ | ------- | ------ |
| Official Plane upstream plus Example Organization fork and isolated integration branches | SELECTED DIRECTION | Preserves ownership while providing a reproducible upstream update path and controlled conflict resolution. |
| Permanently freeze the current fork | REJECTED | Avoids near-term integration work but accumulates security, compatibility, and maintenance debt. |
| Develop directly in official Plane upstream | REJECTED | Does not preserve Example Organization's release control and cannot assume upstream acceptance of Curve-specific scope. |
| Force-rebase shared fork `preview` for every update | REJECTED | Rewrites published history and creates avoidable coordination and rollback risk. |

## Evidence and proof results

| Evidence | Result |
| -------- | ------ |
| Historical fork baseline | Fork `preview` was `31853ab2b8b7810c59dc30d22e52c8f4b5a71a47` before upstream synchronization |
| Official upstream | `https://github.com/makeplane/plane.git`; fetch remote named `upstream`; push URL disabled |
| Selected upstream pin | `upstream/preview` at `1c8a60f858d8472aa56e29994ec1c7926da2c6ce` |
| Divergence | Fork baseline is the merge base; fork `0` ahead and `1` behind |
| Upstream delta | One web stale-chunk recovery commit; three web files; no migration, lockfile, deployment, or license-file change |
| Pre-merge fork/upstream base | `origin/preview` and `upstream/preview` were both at `1c8a60f858d8472aa56e29994ec1c7926da2c6ce` as verified on 2026-08-13 |
| Candidate branch and commit | Approved `curve/plane-upstream-sync-2026-08-12` at `d380678912e9b46805ef852d2e05411f1fea6d8b`; merged by Plane PR #1 |
| Accepted fork `preview` base | `549db1aea8f3307b337b3686dbb844a87549cd95`; merge parents are prior base `1c8a60f858d8472aa56e29994ec1c7926da2c6ce` and approved candidate `d380678912e9b46805ef852d2e05411f1fea6d8b` |
| M0-S1 implementation descendant at decision time | Plane PR #2 merged M0-S1 at `7685bbc7cc5e1ab34f11e3912d9e47d31c365a9a`; approved exact head `81712b66e22f1a60883a619c5db63a2101dc365d` is its parent |
| Post-decision M0-S2 descendant | Plane PR #3 merged approved M0-S2 head `f520075493290389aa54532baec36268c34e2885` into `preview` at `eff8686a69aa112ea8fda79be0e1316dc1fd97d6`; the approved-head and merge trees are identical |
| Post-decision M0-03 descendant | Plane PR #4 merged approved M0-03 head `a807dd7a3f7b81f13ca815b165fba4f4bc068d9e` into `preview` at `922dd6de5d5ed5081f35cd88343154022867ccad`; the approved-head and merge trees are identical |
| Accepted Curve governance baseline | Curve PR #1 squash-merged to `main` at `1529b8b7f04f226ac8be151f89104b6582650b42`; post-merge validation run 31887095811 passed |
| Frontend verification | `pnpm check`: 60/60 successful at the exact candidate SHA; `pnpm build`: 16/16 successful on the pre-commit-equivalent candidate tree |
| Backend verification | Repository Compose suite: 516 passed, 92 warnings, 84.10 seconds; exit code 0 |
| Local deployment smoke | PASS at exact candidate SHA using the existing local Plane Compose project and persistent development volumes: migrator `0`/no pending migrations, API health `200`, `check --deploy` exit `0` with five expected local-profile warnings, worker and Beat initialized, and safe nonexistent-asset task consumed. Unrelated local workloads were preserved. |
| Candidate correction | `packages/i18n/scripts/generate-types.ts` emits the type-union semicolon on the final member so the generated ignored file satisfies pinned `oxfmt`; commit hooks also changed two `.sort()` calls to `.toSorted()` under repository lint policy |
| Cleanup | Test containers, network, and disposable volumes removed without `--remove-orphans` |
| Public-source license evidence | Root `LICENSE.txt` contains GNU AGPL v3; README identifies AGPL v3; inspected source uses `SPDX-License-Identifier: AGPL-3.0-only` |
| Community/commercial boundary | Core models/APIs/UI and Gantt implementation are present in public source; public `extended` route and instance-config lists are empty, the page extension points to an enterprise repository, and inspected `packages/editor/src/ee` files only re-export `ce` code |
| Reuse/build recommendation | Reuse public Plane authority and presentation primitives; implement Curve lifecycle truth additively in `plane.curve`; treat empty/abstract/enterprise-reference seams as unavailable pending separate proof and legal approval |

The full command/result narrative and capability matrix are in the [Plane foundation inventory](plane-foundation-inventory.md).

## Decision

Use the official public Plane repository as Curve's upstream code baseline and Designated reviewer's public fork as the Curve implementation and release repository. Fetch official changes through a remote named `upstream` whose push URL is disabled. Prepare every update on a new `curve/plane-upstream-sync-<date>` integration branch, compare exact ancestry/delta, and never force-rebase or force-push shared `preview`.

Keep the Curve and Plane repositories separate. The Curve repository is the governance and normative-contract source for PRDs, ADRs, security decisions, architecture, and immutable task packets. The public Plane fork owns deployable Curve code, migrations, UI, worker/runtime configuration, generated clients, and a pinned implementation snapshot or reference to the approved Curve contracts. This avoids a combined monorepo while allowing code and generated artifacts to change atomically in Plane. This repository boundary is approved by D-001.

The accepted Plane `preview` merge commit `549db1aea8f3307b337b3686dbb844a87549cd95` is the historical foundation base for the first Curve implementation task packets. Plane PR #2 completed M0-S1 (Curve module shell) and advanced the implementation base at the time of this decision to `7685bbc7cc5e1ab34f11e3912d9e47d31c365a9a`. The local repository-level commercial/community audit, reuse/build recommendation, additive migration, feature-disabled behavior, workspace-isolation, and rollback proof are complete. Designated reviewer approved the applicable exact heads on 2026-08-15 and both changes merged through their authorized methods.

The 2026-08-18 evidence addendum preserves the approved D-001 decision and its
version-1.0 digest. It records that Plane PR #3 completed M0-S2 (operation
and delivery kernel) and advanced the current accepted implementation descendant
to `eff8686a69aa112ea8fda79be0e1316dc1fd97d6`, then Plane PR #4 completed
M0-03 (core authorization and policy kernel) and advanced the descendant to
`922dd6de5d5ed5081f35cd88343154022867ccad`. See [M0-S2 implementation evidence](m0-s2-implementation-evidence.md)
(exact contract, context, implementation, validation, merge, and rollback
binding) and [M0-03 implementation evidence](m0-03-implementation-evidence.md)
(exact contract, context, security validation, merge, and rollback binding).

## Approval record

| Field | Recorded decision evidence |
| --- | --- |
| Decision | D-001 |
| Approved subject | ADR-001 decision content plus the explicitly approved M0-01 gate allocation |
| Approved ADR content digest | `sha256:0c780a0264dcc1a301ee412dfce18c3c50453436679c8d4a55729052bdcdc488` |
| Approver and roles | Designated reviewer, Designated technical owner; Curve engineering approver, licensing reviewer, Plane support/upgrade owner, and interim human reviewer |
| Decision time | 2026-08-15; recorded at `2026-08-15T09:17:55-03:00` |
| Scope and environment | Plane foundation, public-fork implementation/release boundary, Curve governance boundary, licensing strategy, and upgrade process for all Curve environments. Each implementation package remains subject to its other decision and environment gates. |
| Exact Curve disposition | Approved Curve PR #1 at `62e144f37d4fea3064ae7cd21868117b9eb78edb` |
| Exact Plane disposition | Approved Plane PR #1 at `d380678912e9b46805ef852d2e05411f1fea6d8b` |
| Accepted obligations | Documented public/community reuse boundary and AGPL licensing, notices, dependency, corresponding-source, publication, and support obligations |
| Gate allocation | M0-01 supplies additive migration, feature-disabled behavior, and rollback proof; that implementation evidence is not a D-001 decision prerequisite. |
| Evidence | [Owner approval record](https://github.com/faocampo/curve/pull/1#issuecomment-5302192671), [Curve PR #1](https://github.com/faocampo/curve/pull/1), [Curve validation run 31856579059](https://github.com/faocampo/curve/actions/runs/31856579059), [Plane PR #1](https://github.com/faocampo/plane/pull/1), and the [Plane foundation inventory](plane-foundation-inventory.md) |
| Exceptions | None |
| Review and expiry | No fixed expiry. Review at every Plane foundation upgrade, material licensing change, repository-boundary change, or support-owner change. |

## Security, privacy, licensing, and operational impact

- Curve reuses only public/community Plane source whose availability and license are proven; enterprise placeholders or route seams are not implementation evidence.
- Every deployed Curve release must publish exact corresponding source, notices, dependency manifest, SBOM/provenance, and a functioning in-product source link under the PRD's AGPL release gate.
- Upstream intake must include dependency, migration, security, license, build, and operational-impact review.
- A named Curve foundation owner is accountable for monitoring upstream, preparing updates, resolving conflicts, and coordinating security updates.
- No production or permissioned data is involved in foundation synchronization or verification.

## Data/API/event/migration compatibility impact

This candidate upstream delta contains no migration or API/event contract change. Future updates must explicitly inventory migrations, schemas, generated clients, event contracts, routes, feature flags, deployment manifests, and supported upgrade order. Curve schema changes remain additive and feature-disabled by default until their own milestone gates pass.

## Failure, rollback, and exit strategy

- Abandon a failed integration branch; shared `preview` remains at its prior exact commit.
- Never conceal broken checks, destructive migrations, commercial-only dependencies, or an unclear license boundary to make an update appear compatible.
- If a later upstream update cannot be accepted, Curve remains pinned to the last accepted foundation SHA while the owner chooses remediation, deferral, or a superseding ADR.
- If official Plane becomes unsuitable, a superseding ADR must select and prove another baseline; implementation agents cannot silently fork away from the accepted source.

## Implementation consequences and affected work packages

- P0 must finish the capability inventory and foundation acceptance before M0 application implementation.
- Every task packet records the accepted foundation SHA and refuses a stale or unrelated base.
- Curve modules must remain additive, feature-gated, workspace-scoped, and separated from Plane/Celery lifecycle ownership as defined by the technical architecture.
- Upstream synchronization is a recurring release-engineering responsibility, not an ad hoc developer action.

## Validation and review date

The D-001 decision evidence and the independently tracked M0-01 implementation proof are complete:

- [x] Product sponsor approves the upstream/fork/integration-branch strategy.
- [x] Exact fork and upstream refs plus ancestry/divergence are recorded.
- [x] Full frontend check, production build, and backend test suite pass on the candidate tree.
- [x] The i18n generator correction is committed at an exact candidate foundation SHA and the full frontend check passes at that SHA.
- [x] Deployment smoke passes on that exact SHA in the approved local non-production topology.
- [x] Repository-level community-versus-commercial capability proof and reuse/build recommendation are documented.
- [x] Named engineering approver and licensing reviewer are assigned: Designated reviewer, Designated technical owner.
- [x] Designated reviewer records formal acceptance of the reuse/build boundary and AGPL, notices, dependency, and corresponding-source consequences against an exact ADR version/digest.
- [x] Plane support/upgrade ownership and event-driven review cadence are recorded: Designated reviewer; review at every Plane foundation upgrade, material licensing change, or change of support owner.
- [x] Designated reviewer records a disposition for the exact head of both draft PRs.
- [x] The ADR approval record contains decision time, scope/environment, evidence, exceptions, and review/expiry date.
- [x] Merge the approved Plane candidate and pin resulting fork `preview` SHA `549db1aea8f3307b337b3686dbb844a87549cd95` before dispatching M0-01.
- [x] M0-01 proves additive migration, feature-disabled behavior, workspace isolation, and rollback; Plane PR #2 exact head `81712b66e22f1a60883a619c5db63a2101dc365d` merged into `preview` at `7685bbc7cc5e1ab34f11e3912d9e47d31c365a9a`.

Review this decision at every Plane foundation upgrade, material licensing change, repository-boundary change, or change of support owner.
