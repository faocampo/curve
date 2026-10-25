# Roadmap storage integration

## Integrated subject

[Plane PR #49](https://github.com/faocampo/plane/pull/49) (scoped Roadmap storage
and integrity qualification) merged into `curve-integration` at
`6428c6a6146ea135ffdbd704dd3ecdb6514f821f`. The fetched integration tree exactly
matches tested `04206ff9acc3a1b29cc4f8d2b3108d36aa78a51e`:
`5e5d3570d4338d2de2caf996fc926167ec504940`.

The implementation consumes [Curve PR #175](https://github.com/faocampo/curve/pull/175)
(Roadmap candidate contracts and two-stage direction), merged at
`3badab22e914df85c3d3cdbfc18a728c7eedea82`. The former candidate branches were
retired only after exact tree equivalence and absence of open dependents were
verified; local working copies were preserved.

## Implemented boundary

The additive migration introduces workspace/Product-scoped Roadmap, Milestone,
Feature, Roadmap Item and immutable Item history. Deferred reciprocal foreign
keys require the defining Initiative and Item to commit together. Scoped
uniqueness prevents duplicate Feature placement and permits atomic Milestone
reordering. Application timestamps and format enforcement follow the approved
Product convention.

Released migration and qualification bytes remain unchanged. The narrow runtime
successor validates new model registration, migration, relationships and exact
catalog coverage while retaining historical seals. Populated reversal is refused.
A deterministic name for PostgreSQL's deferred-uniqueness recheck trigger gives
independent installations the same catalog fingerprint without changing enforcement.

## Validation and retained limitations

All current results below apply to tested commit `04206ff9`.

| Evidence | Result |
| --- | --- |
| [Full API run](https://github.com/faocampo/plane/actions/runs/40153973457) (native, host and storage regression) | Success: 2,870 native cases passed, 12 Temporal cases skipped; 156 host and 13 storage cases passed; all backend migration-drift checks passed |
| Local Temporal follow-up (the two files containing hosted skips) | 23 passed, zero skips, using the verified local test server |
| [Web checks](https://github.com/faocampo/plane/actions/runs/40153980312) (format, types, lint and package builds) | Success; existing dependency/lint warnings remain |
| [CodeQL](https://github.com/faocampo/plane/actions/runs/40153975272) (analysis workflow) | Success |
| [Migration check](https://github.com/faocampo/plane/actions/runs/40153978704) (migration validation) | Success |
| [Copyright check](https://github.com/faocampo/plane/actions/runs/40153977022) (source headers) | Success |

Additional local evidence includes 93 focused storage/qualification cases,
555 web cases and 12 supplemental/repaired-fixture cases. Earlier full failures
remain recorded: the initial hosted run had two obsolete fixtures; the initial
local suite completed with 2,889 passed, zero skips and those same two failures.
The repaired reader fixture creates a valid reciprocal Roadmap pair; the repaired
attack fixture forges the active coverage seal. Both original rejection assertions
remain intact. Only those tests changed between the original candidate and the
successful current-head run; runtime and migration bytes are identical.

## Metadata history successor

[Plane PR #50](https://github.com/faocampo/plane/pull/50) (priority, health,
confidence and schedule history storage) merged at
`d5c948786c46b4894d3819e4e34d800cfcc6510a`. Its complete fetched tree matches tested
`86121a289e51ee8f37a2732aacf5125d9c154981`:
`5cbf376cb8c0abec14284a4b9fb4266077b17023`. The integration base remained
`6428c6a6146ea135ffdbd704dd3ecdb6514f821f`. The merged remote branch was retired;
the local checkout was preserved.

The additive migration expands supported history types, retains immutable history,
and installs a narrowly qualified catalog/runtime successor. Original storage
migration and qualification bytes remain unchanged. Reversal rejects metadata
rows; legacy-only round trips preserve rows and restore the predecessor verifier.
The [metadata candidate](../../contracts/candidates/roadmap-domain-v1/ITEM-METADATA-HISTORY.md)
(closed metadata deltas) still requires command-side semantic enforcement.

Validation at the tested head:

| Evidence | Result |
| --- | --- |
| [Full API run](https://github.com/faocampo/plane/actions/runs/40158862225) (native, host and storage regression) | 2,895 native passed, 12 Temporal skipped; 156 host and 13 storage passed; migration drift checks passed |
| Local Temporal follow-up (both files containing hosted skips) | 23 passed, zero skips |
| Local qualification follow-up (three historical successor-chain modules) | 62 passed, zero skips |
| [Web checks](https://github.com/faocampo/plane/actions/runs/40158863648) (format, types, lint and builds) | Success; existing warnings retain their scope |
| [Migration check](https://github.com/faocampo/plane/actions/runs/40158865244) (migration validation) | Success |
| [CodeQL](https://github.com/faocampo/plane/actions/runs/40158867001) (analysis workflow) | Success |
| [Copyright check](https://github.com/faocampo/plane/actions/runs/40158868771) (source headers) | Success |
| [React Doctor](https://github.com/faocampo/plane/actions/runs/40160478041) (PR frontend review) | Success |

The original local full suite began at `796abc13c20d1ae94681a5a89662bf1839dc8156`
and remains a separately scoped diagnostic run. It exposed historical qualification
chains that stopped before the metadata successor. The repaired three modules
explicitly apply that successor before comparing installed source bytes; existing
historical assertions remain intact. Runtime, migration and proof bytes did not
change during that repair. The completed current-head hosted suite and local
Temporal follow-up establish the validation above; the original local run is not
reported as passing. Duplicate PR-triggered workflows were not used as passing
evidence for merge.

## Next implementation boundary

The [command candidate](../../contracts/candidates/roadmap-domain-v1/COMMANDS.md)
(scoped commands, concurrency and permission prerequisites) remains to implement.
Initial creator ownership follows the [approved defaults](roadmap-approved-defaults.md)
(ownership and opening-screen purpose). Contributor mapping and runtime permission
enforcement remain implementation work.
No Roadmap route or permission-dependent service is enabled by this storage layer.

Next work must qualify joint Initiative/Item creation, protected references,
exact replay and history, scope/approval supersession, and current membership.
New work retains Product review of the PRD and Technical review of the plan under
[the two-stage direction](two-stage-new-work-direction.md) (current approvals and
historical-edition handling). The [experience blueprint](curve-experience-blueprint.md)
(prototype and screen acceptance) remains the gate for material Roadmap UI work.

This evidence establishes storage integration. Full M2-01 command/UI acceptance,
later M2 packages, provider qualification and production rollout remain pending.
