# Project consolidation ledger — 2026-10-07

Status: in progress. Owner: development agent for verification and integration;
repository owner for explicit human acceptance. Scope: existing work and
integration fixes. The [project status](project-status.md) (concise roadmap and
next actions) is the current handoff.

## Starting inventory

- Curve: three remote branches, no open PRs, 62 open issues. Reconstruction at
  `af5616a5ca990f54943b7b6123c1b3362d0e6486` is 12 commits ahead of `main`.
- Plane: 26 remote branches; ten open PRs (#17, #20–#28). PR #17 is a conflicting
  draft. PRs #29–#40 merged into intermediate branches on 2026-10-06; those
  merge records do not establish integration into `curve-integration`.
- The documented Plane qualification commit
  `8aede16b4aee1aa66eb0b9469c4c849b34250f6e` is retrievable and is an ancestor of
  `feature/existing-project-association` at
  `a6b0a8db15c42625712d083b8022cd4011eef892`.
- Private governance: inspect and retain private evidence in its existing
  protected destination; no policy values or identifying references are copied here.
- Local preservation: existing package-manager edit, untracked reports/critique,
  package cache, three Curve stashes and one Plane stash remain untouched.
  Historical local branches and missing-worktree registrations are retained.

## Remote branch disposition

| Group | Disposition | Gate / evidence |
| --- | --- | --- |
| Curve `main`; Plane `curve-integration` | Keep canonical integration branches | Record each actual PR merge result |
| Plane `preview` | Keep upstream tracker | Separate from Curve delivery; preserve local divergent work |
| Both `checkpoint/curve-mvp-2026-10-03` branches | Preserve recovery checkpoints | Published preview history; no cleanup in this pass |
| Curve `reconstruction/manual-planning-v2` | Review and integrate through PR | Candidate contracts, recovered material and experiment require full diff/validation |
| Plane `curve/m1-01b-initiative-shell` (#17) | Resolve conflicts; retain pending UX acceptance | Explicit owner gate, current-head tests |
| Plane PR #20–#28 heads | Retain dependent stack until verified integration | Merge order #20 through #28 after root acceptance; re-evaluate after each merge |
| Plane PR #29–#38 and #40 heads | Evaluate retirement after replacement proof | Original tips are contained in reconstruction; merged PR status alone is insufficient |
| Plane `curve/prd-rationale-git-retention-v2` (#39) | Content-equivalent retirement candidate | Tree equals PR #28 and #40 tips despite different commit ancestry |
| Plane `feature/existing-project-association` | Preserve; prepare coherent integration | Contains scope/PRD/reopening/manual Gate 2; current authenticated acceptance pending |

Each retained local branch is a preservation exception until its unique work and
active use have been checked. Stale upstream labels and prunable registrations
are not deletion evidence. Deletion requires exact-tip concurrency checks,
replacement evidence and absence of open dependants/active use.

## Tracking discrepancies

- September handoffs call command integration the next task while October source
  records additional manual planning/Gate 2 implementation. Use this ledger and
  exact source inspection before duplicating work.
- Project items for PRD versioning, Gate 1 and manual planning still say Backlog
  despite candidate implementations. Reconcile scope and update to In progress
  where evidence supports it; retain full-package completion gates.
- The legacy Idea Brief issue and import wording require reconciliation against
  approved description-first and existing-project/manual-only scope. Preserve
  historical decisions and link any superseding definition.
- Public issue/Project metadata includes adopting-organization wording; sanitize
  verified public metadata without copying the original values into this ledger.

## Validation and merge results

Initial status reconciliation merged through [Curve PR #170](https://github.com/faocampo/curve/pull/170)
(inventory and status entry point), producing `4dc0879606f72a4d97eab4a30a001b89e2dad77a`.
Its required validation check passed. Application UX acceptance remains pending.
Git ancestry and live GitHub PR/branch/Project reads were executed on 2026-10-07.
Historical runtime suites remain dated evidence until rerun on a current candidate.
Required failures and human gates remain explicit blockers.

- Initial status candidate: full `pnpm check` passed using pinned pnpm 11.3.0:
  709 tests, 79 JSON Schemas, 186 contract fixtures, 47 Mermaid diagrams and no
  structural findings. Staged disclosure check passed for 497 tracked text files.
- Initial dependency reuse failed because old dependency links were incomplete;
  a clean isolated install resolved it without changing the original checkout.
- PR #28, #39 and #40 tips share tree
  `e60e6c6cad7bd22af20ae0de9e3875ace0bba3b3`; commit ancestry alone overstated
  divergence. Their exact tips remain preserved pending safe retirement.
- Isolated Plane integration exposed two Quicklink conflicts. Resolution retains
  the integrated HTTP default, strict host/protocol validation, backend field
  errors and the candidate's accessible inline error display. Unsupported schemes
  and credential-bearing links are rejected. Regression verification is underway.
- First frontend run passed 114 tests; 24 suites could not import unbuilt workspace
  packages. Ten dependency build tasks subsequently passed; rerun is required.

### Subsequent verified results

- Twelve merged intermediate Plane remote branches (#29–#40) were retired with
  exact-tip leases. Eleven original tips are ancestors of the preserved
  reconstruction; #39 has the equivalent tree recorded above. Each exact tip is
  also retained in a local consolidation archive ref. No local branch or stash was
  removed. Plane remote branch count decreased from 26 to 14.
- The resolved Plane candidate at `3dc307a483` passed 392 frontend tests across
  34 files, full web type checking, seven contract tests, 109-file contract
  integrity verification and five validation-workflow tests. Native backend
  requalification is running in a separate disposable environment.
- The combined Curve reconstruction/status tree passed `pnpm check`: 1,071 tests,
  124 schemas, 186 fixtures, 123 Markdown files and 47 Mermaid diagrams, with no
  structural findings. Its separate attention experiment passed all 70 tests.
  Seven loopback tests initially encountered sandbox `EPERM`; the permitted
  loopback rerun passed without source changes.
- Project items #97, #99, #100, #110 and #111 were moved to In progress to reflect
  partial existing implementation. Public issues #78 and #119 were sanitized to
  organization-neutral wording. Package completion gates remain open.
- A further clean, unpublished Plane branch, `feature/local-pilot-recovery` at
  `f2be82077e6d20ec24befbf578dde47736f94cb3`, contains five additional commits:
  synthetic recovery/persistence qualification and an isolated Today prototype.
  It is preserved for review. Its dated evidence does not close operational or
  human UX gates. The running review demo is preserved without restart/reseed.
- Private governance has only its canonical remote branch. Its clean local
  checkout is five commits behind that branch, with no local-only work requiring
  a PR. Actual policy and evidence identifiers stay in the private destination.
