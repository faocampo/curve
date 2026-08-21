# Curve GitHub Project Tracking Map

## Document control

| Field | Value |
| --- | --- |
| Status | Active visual-tracking contract |
| Version | 1.7 |
| Date | 2026-08-21 |
| Project | [Curve GitHub Project #2](https://github.com/users/faocampo/projects/2) |
| Normative work catalog | [Development plan](development-plan.md#work-package-catalog) (70-package delivery catalog, dependencies, and evidence) |
| Project administrator | Federico Ocampo (`faocampo`) |
| Human reviewer | Federico Ocampo |
| Last reconciliation | 2026-08-21: M0-S4 item `PVTI_lAHOBNjuQc4BgZzOzg3eZKI` and M0-07 item `PVTI_lAHOBNjuQc4BgZzOzg2nbxU` moved to `Done` after Plane PR #6 merged as `e762fbb...`; M0-S4-UX item `PVTI_lAHOBNjuQc4BgZzOzg3ej-0` remains `Done`; M0-08 item `PVTI_lAHOBNjuQc4BgZzOzg2nbyQ` remains `In review` pending M0-S5 material approval and implementation |

## Purpose and authority boundary

GitHub Project #2 is a visual index for Curve development. It helps the team see
the current phase, locate the normative task packet, and follow progress across
the 70 planned work packages plus explicit packet-level checkpoints used to
decompose a large package.

The development plan, approved product decisions, architecture decisions, task
packets, repository state, test evidence, and Curve runtime records remain the
authoritative sources for implementation. A GitHub Project status is
informational metadata. Changing it does not:

- approve a product or architecture decision;
- authorize a coding agent, Temporal workflow, sandbox, or deployment;
- satisfy a human product, technical, or code gate;
- waive a security, quality, licensing, budget, or data-policy control; or
- change the state of a future Curve project, initiative, slice, attempt, gate,
  or quality run.

Federico Ocampo and authorized automation may update Project statuses whenever
needed to keep the visual board useful. These administrative writes require no
separate governance approval, lease, task-packet authorization, or signed start
grant. Execution systems evaluate their own authoritative inputs independently.

## Source inventory

| Phase | ID range | Item count | Default visual status |
| --- | --- | ---: | --- |
| P0A foundation readiness | P0-01 through P0-06 (foundation-readiness packages) | 6 | Current working projection |
| P0B just-in-time proofs | P0-07 through P0-12 (integration-readiness packages) | 6 | Backlog |
| M0 foundation/control plane | M0-01 through M0-09 | 9 | Backlog |
| M1 alignment/evidence/PRD | M1-01 through M1-07 | 7 | Backlog |
| M2 roadmap/schedule | M2-01 through M2-06 | 6 | Backlog |
| M3 repository/planning | M3-01 through M3-06 | 6 | Backlog |
| M4 agents/runners | M4-01 through M4-06 | 6 | Backlog |
| M5 quality/VCS/readiness | M5-01 through M5-14 | 14 | Backlog |
| M6 prototypes/KPIs | M6-01 through M6-05 | 5 | Backlog |
| R1 qualification/rollout | R1-01 through R1-05 | 5 | Backlog |
| Canonical catalog total |  | **70** |  |
| M0-S3 packet checkpoint | Decomposed executable slice of M0-06 | 1 | Completed proof projection; Plane merge `d99342f...` |
| M0-S4 packet checkpoint | Decomposed executable slice completing local M0-07 | 1 | `Done`; Plane merge `e762fbb...` and accepted post-merge evidence |
| M0-S4-UX checkpoint | Definition/UX child of M0-S4 | 1 | `Done`; Curve-first shell and Foundation experience approved |
| M7 intelligence extension issues | M7-01 and M7-02 outside the active 70-row catalog | 2 | Backlog; governed by the separate M7 extension charter |
| **Current visual total** |  | **75** |  |

## Field mapping

| GitHub Project field | Source | Administrative rule |
| --- | --- | --- |
| Title | Work-package ID plus deliverable | The stable ID prefix is the synchronization key. |
| Status | Team's current visual progress assessment | Federico or authorized automation may update it directly. |
| Size | Development-plan size | `S`, `M`, or `L`; the current synchronizer leaves this Project field unchanged. |
| Priority | Product planning | Set when useful for planning; it is not inferred from phase. |
| Estimate | Delivery planning | Set when an estimate exists. |
| Iteration | Delivery planning | Set when the package is scheduled. |
| Assignees | Delivery ownership | Set when an owner is known. |
| Reviewers | Review ownership | Federico Ocampo is the interim reviewer. |

## Visual status convention

| Project status | Suggested visual meaning |
| --- | --- |
| Backlog | Work is not currently being executed. It may be unprepared, blocked, deferred, or simply unscheduled. |
| Ready | The team expects the package can be picked up soon. |
| In progress | Work is actively being performed. |
| In review | An output, decision, or change is being reviewed or validated. |
| Done | The tracked package is complete according to its authoritative acceptance evidence. |

The convention keeps the board understandable; it is not a transition state
machine. Direct corrections, backward transitions, and skipped columns are
allowed when they better represent current work.

## Synchronization commands

The synchronizer supports read-only inspection and one explicit existing-item
status update:

```text
pnpm project:check
node scripts/sync-github-project.mjs --context M0-S3
node scripts/sync-github-project.mjs --validate-status P0-06=Done
pnpm project:sync -- --status P0-06="Done"
pnpm project:sync -- --status M0-01="In progress"
pnpm project:sync -- --status M0-01="In review"
pnpm project:sync -- --status M0-01="Done"
```

`project:check` parses the 70-row canonical catalog and reports its default visual
projection. It performs no GitHub request. `--context` computes registered
context and stage-record digests for a whitelisted catalog or packet identifier
such as M0-S3 and remains read-only.
`--validate-status` validates a task ID and Project status locally and explicitly
reports that the result is informational.

`project:sync` performs one GitHub write operation for one explicit
`--status TASK-ID=STATUS` assignment. It applies to every catalog work package,
including P0-06 (two-stage local Temporal proof). It updates the deterministic
body and selected status of the existing synchronizer-owned draft item. It does
not create items or mutate the full catalog.

M0-S3 (local Temporal round-trip implementation packet) is a packet checkpoint
inside M0-06 rather than a second canonical work package. M0-S4 (API, SSE, and
minimal Curve-first UI implementation packet) is a checkpoint that completes
the local M0-07 API/SSE scope, and M0-S4-UX (Definition/UX checkpoint) is its
child evidence projection. Their draft items are managed directly by Federico
Ocampo or authorized automation and are excluded from the 70-row catalog
synchronizer. M7-01/M7-02 are separate GitHub issues governed by the
[M7 intelligence extension](m7-intelligence-and-automation-extension.md)
(future AI-expense, attention-intake, and scheduled-agent charter), not by the
active 70-row catalog.

For write safety, apply mode requires:

- a clean checkout whose `HEAD`, freshly fetched `origin/main`, and live GitHub
  `main` SHA are identical;
- exactly one Project item matching the stable task ID or ownership marker;
- the expected Project, draft-content, field, and status-option identities;
- an item body that is either the canonical prior merged projection, the exact
  current projection, or the exact body-first intermediate state; and
- read-back confirmation after each write, including recovery from a lost API
  response when the intended state is observable exactly.

These safeguards prevent accidental edits to the wrong item or overwriting
unrecognized content. They are operational integrity checks rather than approval
gates. The command may change a Project status regardless of the corresponding
Curve execution, product, or architecture state.

## P0-06 historical tracking rule

P0-06 (historical two-stage local Temporal proof) is tracked on the board like
every other work package. Its terminal technical state remains in the versioned
[stage record](proofs/p0-06-stage-record.json) (machine-readable supersession
binding), [ADR-003](adr-003-runtime-topology.md) (approved local topology,
pins, evidence, and rollback), and the [task packet](p0-06-local-temporal-proof-task-packet.md)
(superseded two-stage design and audit history).

Changing the P0-06 Project status does not change those records. `Done` records
that the standalone proof path was superseded. M0-S3 (local Temporal round-trip
implementation packet) owns the executable local proof.

The current governed technical state remains:

- D-003 (runtime topology and trust-zone decision): `LOCAL_ONLY` profile decided and implemented; private-platform activation inputs remain package-gated;
- P0-06A (isolated Temporal feasibility proof): `SUPERSEDED_UNISSUED`;
- P0-06B (least-privilege Plane integration proof): `SUPERSEDED_UNISSUED`; and
- M0-S3 (local Temporal round-trip implementation packet): executable proof,
  accepted and `Done` at Plane merge `d99342f...`.

## Reconciliation cadence

The executor or project administrator updates the board when work starts, enters
review, completes, becomes blocked, or materially changes direction. Exact timing
is administrative. The synchronizer records the normative source revision and
links back to the development plan so every visual item remains traceable.

GitHub Project #2 is private. The unauthenticated external-link checker excludes
this exact URL because anonymous access returns 404. Authenticated verification
uses `gh project view 2 --owner faocampo` and the 70-item reconciliation.

## References

- GitHub CLI project manual: [GitHub CLI — gh project](https://cli.github.com/manual/gh_project)
- GitHub Projects documentation: [GitHub Docs — About Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects)
- GitHub Projects filtering: [GitHub Docs — Filtering Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/filtering-projects)
