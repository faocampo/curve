# Project consolidation ledger — 2026-10-07

Scope: existing work and integration repairs. The [project status](project-status.md)
(concise roadmap position and next actions) is the current handoff. Application
integration remains gated by exact-candidate owner UX acceptance and CI.

## Merge results

| Outcome | Evidence |
| --- | --- |
| Initial status baseline merged | [Curve PR #170](https://github.com/faocampo/curve/pull/170) (inventory and status entry point); integration `4dc0879606f72a4d97eab4a30a001b89e2dad77a`; required validation passed |
| Reconstruction contracts merged | [Curve PR #171](https://github.com/faocampo/curve/pull/171) (manual planning, scope/Gate 2 contracts, recovered evidence and attention experiment); integration `e2428ae627c0022fda7a91d8e950b921b6a668c2`; required validation passed |
| Application work consolidated | [Plane PR #17](https://github.com/faocampo/plane/pull/17) (single Initiative/PRD/manual-planning candidate); draft head `c2d5e85f536787fed3b358c7fec623603341736b`; base `9bedb74a77460c65ac681854b714a4607680398e` |
| Intermediate PR stack reconciled | PR #20 became merged by containment in the updated root; PRs #21–#28 closed as superseded; PRs #29–#40 retain their earlier intermediate merge records |
| Final handoff | This status PR records actual outcomes and remaining gates; its merge result is available in GitHub history |

The Plane candidate preserves existing-project reconstruction
`a6b0a8db15c42625712d083b8022cd4011eef892` and five formerly local pilot commits
through `f2be82077e6d20ec24befbf578dde47736f94cb3` in its ancestry. Quicklink
conflicts preserve the integrated HTTP default, strict host/protocol validation
and accessible backend field errors. Credentials and unsupported URL schemes
remain rejected. Existing manual capabilities retain their default-off gates.

## Branch reconciliation

Starting inventory: Curve had three remote branches and no open PRs; Plane had
26 remote branches and ten open PRs. After consolidation, Plane has **five remote
branches and one open draft PR**.

| Retained remote | Purpose / next action |
| --- | --- |
| Curve `main` | Canonical documentation/contracts integration |
| Curve `reconstruction/manual-planning-v2` | Merged through #171; retained because original/restored checkouts still actively use it |
| Curve `checkpoint/curve-mvp-2026-10-03` | Recovery checkpoint |
| Plane `curve-integration` | Canonical application integration; unchanged pending #17 acceptance |
| Plane `preview` | Upstream tracker, separate from Curve changes |
| Plane `curve/m1-01b-initiative-shell` | Single draft PR #17 head |
| Plane `feature/existing-project-association` | Contained in #17; retained for active restored checkout |
| Plane `checkpoint/curve-mvp-2026-10-03` | Recovery checkpoint |
| Private governance canonical branch | Protected authority/evidence; no local-only work to merge |

The temporary Curve status branch for #170 was retired after exact merged-tree,
active-worktree and open-dependant checks. The final status PR's temporary branch
is retired after its merge under the same rule.

Twenty-one Plane remote heads (#20–#40) were retired in two atomic batches, each
with exact-tip leases and retained local
`refs/consolidation-archive/20261007/<branch>` recovery refs. Nineteen original
tips are ancestors of the consolidated reconstruction. #28 and #39 use exact
tree equivalence with preserved #40, rather than an ancestry claim:

`e60e6c6cad7bd22af20ae0de9e3875ace0bba3b3`.

The [branch inventory](project-consolidation-branch-inventory-2026-10-07.md)
(all 81 original Curve and 48 original Plane local branches) records exact tips
and evidence. Local refs, stashes and worktrees remain available for recovery.
Prunable registrations and historical refs are outside the active delivery queue.

### Preserved local exceptions

- Ten historical Curve branches lack direct containment or an exact final PR-head
  match: four backup/rebase snapshots, an early Google PRD contract, an early
  foundation UX proposal, three pre-correction publication branches and a
  readiness-packet snapshot. Preserve them as historical references; compare
  against current authority before reusing any content.
  Content inspection found pre-sanitization organization-specific fixtures in
  early provider/Google snapshots, and weaker normalization checks than current
  `main`. These snapshots must not be republished or merged over their sanitized,
  validated successors. Current provider contracts are delivered through #58;
  bootstrap through #50, M1 packets through #20 and #59–#62, and foundation UX
  through #17–#19. Patch/commit identity alone does not capture those revisions.
- Plane `curve/prd-command-git-retention-v2` has two local-only command-edition
  commits. Its old migration numbered 0020 collides with the reconstructed
  project-association migration, and its runtime changes require a reviewed
  qualification successor. This remains unfinished M1 backlog reference, excluded
  from the current candidate; no pinned runtime/schema evidence was overwritten.
- The active original Plane checkout retains the user's package-manager edit.
  Original Curve untracked reports/critique/cache, three Curve stashes and one
  Plane stash remain unchanged.
- Private governance's clean local checkout is five commits behind its sole
  canonical remote, with no local-only work. Actual policy values and identifying
  evidence stay in the protected destination.

## Verification

| Subject | Fresh result / boundary |
| --- | --- |
| Initial Curve status candidate | 709 tests; 79 schemas; 186 fixtures; 47 diagrams; disclosure check passed |
| Merged Curve reconstruction tree | 1,071 tests; 124 schemas; 186 fixtures; 123 Markdown files; 47 diagrams; no structural findings |
| Final status / inventory working tree | 1,071 tests; 124 schemas; 186 fixtures; 124 Markdown files; 47 diagrams; no structural findings |
| Separate attention experiment | 70 tests passed; seven sandbox loopback failures passed on permitted rerun without source changes |
| Plane frontend | 392 tests across 34 files passed after final sorting fix; full web type check passed locally |
| Native manual planning, scope reader and Gate 2 | 100 tests passed in isolated synthetic containers |
| Native existing-project / scope / PRD / reopening regressions | 186 tests passed in isolated synthetic containers |
| Migration drift | `makemigrations --check --dry-run`: no changes detected |
| Recovery/persistence tooling | 25 focused unit tests passed |
| Standalone Today prototype | 29 fresh headless-browser checks passed; fresh screenshots saved separately from historical evidence |
| Contract integrity / workflow guards | 109-file integrity check, seven contract tests and nine workflow tests passed |
| Local formatting / lint | 16 format tasks and 16 lint tasks passed; API Ruff passed; lint budgets unchanged |

The backend runtime module bytes and migrations remained unchanged during the
final CI repairs; fixture changes only reformatted SQL construction. Tests used
disposable synthetic databases. The test containers/network were removed afterward.
The running review demo and its detached source at
`8aede16b4aee1aa66eb0b9469c4c849b34250f6e` were preserved without restart,
reseed or deployment. Its historical acceptance is separate from the new PR head.

### Remote CI repairs and exact-head runs

Earlier failures remain visible in [initial web CI](https://github.com/faocampo/plane/actions/runs/37646363646)
(format/lint failures), [initial API CI](https://github.com/faocampo/plane/actions/runs/37646368985)
(unavailable unpinned MinIO dependency and lint findings), and [intermediate web CI](https://github.com/faocampo/plane/actions/runs/37648437829)
(ES-target incompatibility introduced during lint repair).

Repairs: format four files; preserve canonical sorting using fresh arrays compatible
with the browser target; keep bounded stream reads sequential; make API lint
read-only; preserve byte-pinned Django model-registration imports using a scoped
lint exception; start the complete Curve test dependency set explicitly without
the unrelated MinIO service. The full Curve suite and migration check remain enabled.

Current candidate runs:
[web CI](https://github.com/faocampo/plane/actions/runs/37649774910)
(exact-head format, lint, build and types: all passed) and
[API CI](https://github.com/faocampo/plane/actions/runs/37649779668)
(exact-head lint, full Curve backend suite and migration drift).
Final outcomes are recorded before handoff; incomplete/failed checks remain gates.

## Tracking reconciled

- Project items #97, #99, #100, #110 and #111 moved to In progress because partial
  implementation exists; their full-package acceptance remains open.
- [Issue #106](https://github.com/faocampo/curve/issues/106) (future import) now
  states `DEFERRED_POST_R1` and preserves its superseded historical wording.
- Public issues #78 and #119 now use organization-neutral wording.
- [Issue #95](https://github.com/faocampo/curve/issues/95) (Idea Brief) still follows
  FR-002/AC-03. The description-first UX request needs explicit product-contract
  reconciliation at the owner's UX review; this consolidation does not silently
  rewrite frozen requirements.
- No bulk Project sync: the source catalog and administrative board have different
  coverage, and planned/partial packages cannot be marked Done from passing tests.

## Remaining delivery gate and resumption

Owner: accept or return the exact Initiative document/reviewer/operational UX for
PR #17. Development agent: satisfy current-head CI, then perform the authorized
PR merge, verify `curve-integration`, refresh status and retire eligible remote
heads. The separate Today screen contract, protected-storage/provider activation
and R1 operational acceptance retain their own gates.

Keep subsequent work to one cohesive outcome and at most two dependent PRs.
Unfinished features remain in the roadmap; future work starts from the verified
integration branch rather than historical recovery refs.

GitHub reported `curve-integration` as unprotected at this audit. The approved
delivery policy and explicit human gate were enforced during this work. Separate
repository-protection hardening remains an administrative follow-up; no protection
or approval was bypassed, and repository settings were left unchanged.
