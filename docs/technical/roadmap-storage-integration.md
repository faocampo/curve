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

## Hierarchy command successor

[Plane PR #51](https://github.com/faocampo/plane/pull/51) (authorized hierarchy
commands and API) merged into `curve-integration` at
`742a2f0040478006e8a7be4e944f9dd0854323d0`. Its complete fetched tree matches
tested head `91b9a226394cd954e22215de33df24b46e5df8be` and CI merge candidate
`ada3a0855c77b144d5148a3cb3f0b335698f0b09`:
`5bde24c06d78e1743ee233cc486d01efc6e16f97`. The integration base was
`d5c948786c46b4894d3819e4e34d800cfcc6510a`. The remote branch was retired using
an exact-tip lease after verifying tree equivalence and no open dependents;
the local checkout and history were preserved.

The implementation creates and updates Roadmaps and Milestones and atomically
reorders the complete Milestone set. Creation derives the Roadmap owner from
the authenticated creator after checking Product-owner or workspace-administrator
creation authority. Subsequent hierarchy changes require current Roadmap
ownership and active human membership. Exact versions, idempotent replay and
transactional events, outbox, audit and receipts protect command outcomes.
Bounded reads return safe hierarchy metadata; Milestone pagination requires a
refresh after reordering. Session writes require CSRF protection, responses
disable caching, and the new hierarchy API is disabled by default.

An additive qualification successor retains historical seals. Deferred hierarchy
constraints are checked in a nested rollback-only savepoint so validation
preserves the caller's transaction constraint modes. Released migration and
qualification bytes remain unchanged.

| Evidence | Result |
| --- | --- |
| [Full API CI](https://github.com/faocampo/plane/actions/runs/40243285550) (native, host and storage regression) | 2,962 native passed, 12 workflow cases skipped; 156 host and 13 storage passed; all migration-drift checks passed |
| Local workflow coverage (both modules containing hosted skips) | All 23 cases passed with zero skips on unchanged implementation bytes |
| Corrected integrity group (active and historical seal tampering) | 44 passed, zero skips; final CI also passed the complete group |
| [Web checks](https://github.com/faocampo/plane/actions/runs/40243285568) (format, lint, types and package builds) | Success; existing warnings retain their scope |
| [CodeQL](https://github.com/faocampo/plane/actions/runs/40243285480) (Python and JavaScript analysis) | Success |
| [Copyright check](https://github.com/faocampo/plane/actions/runs/40243285478) (source headers) | Success |
| [React Doctor](https://github.com/faocampo/plane/actions/runs/40243285458) (PR frontend review) | Success |

The original local full run on `7c2662694bf03ae2a876af9f220104717630f876`
completed with 2,985 passed, zero skips and one integrity-test failure. That test
forged the historical metadata seal, which the new verifier correctly rejected
before the intended application-level proof check. The final test-only commit
targets the current command seal and adds explicit historical-seal rejection
coverage. Strict rejection assertions remain intact. Runtime and migration
bytes are identical between those commits; formatter-only test changes preserve
the Python syntax tree. The original failed run remains diagnostic evidence;
the final-head hosted suite establishes the passing full regression result.

Final local API static, formatting, system and migration checks passed. All 56
repository check tasks passed from cache, retaining 539 existing lint warnings
and zero errors. The unchanged frontend tree retains its 555 passing local tests.

## Feature editor storage successor

[Plane PR #52](https://github.com/faocampo/plane/pull/52) (versioned Product-scoped
editor grants and membership lifetimes) merged into `curve-integration` at
`0b2d3e07d49d697eb3439d23b652f82d293b8cac`. Its complete tree
`a2c5373d74506e0886849c20dd0f0a804aae7a5f` matches tested head
`c39751e93306a07d6c673d19d6bce3c906f5a26c`, based on the hierarchy integration
`742a2f0040478006e8a7be4e944f9dd0854323d0`.

The additive storage preserves attribution, versioned revocation and historical
grants. Membership removal and restoration cannot revive a prior grant. Current
Product ownership and explicit grants follow the
[approved authority](roadmap-approved-defaults.md#feature-editor-authority--approved-2026-10-26)
(owner/admin management and explicit Feature edit rights). Grant/revoke commands
and UI remain separate implementation work.

All 17 current-head GitHub checks passed. Six native partitions passed 3,076
cases (671, 728, 676, 715, 100 and 186), with 12 workflow skips; a separately
scoped local SDK workflow run passed all 23 cases covering those modules.
Hosted storage checks passed 13 cases, host doubles passed 156, and migration
drift, API lint, frontend lint/format/types/build and security analysis passed.
Local repository checks passed 56 cached tasks, with 539 existing warnings and
zero errors. Focused versioned storage regressions passed 209 cases and installed
backfill checks passed two cases.

The prior local broad run retained 3,064 passes, five failures, six fixture errors
and 12 skips. Three obsolete verification-structure tests were corrected with
strict assertions preserved; their affected groups and unchanged failure/fixture
rechecks passed. Transient fixture timing remains a hypothesis. Fresh complete
CI on the published head establishes the final regression result; earlier failed
evidence remains retained. Storage integration grants no runtime activation or
actual editor assignments. The remote source branch was retired after verifying
complete-tree equivalence, no dependent PRs and its exact unchanged tip; local
history remains preserved.

## Feature editor command candidate — local checkpoint

Original Plane commit `685d36ba31df95bec75574efd0554faffc8cf232`, based on the
storage integration above, implements session-authenticated grant, list, detail
and revoke commands. The routes default to disabled. Commands atomically retain
policy decisions, audit, domain events, outbox entries and idempotency receipts;
successful replays recheck current authority. Membership restoration requires a
fresh grant. [Plane PR #53](https://github.com/faocampo/plane/pull/53)
(qualified editor-management commands) merged at
`17ff5ebb64401656e49e78b00496f9abaaf9384b`. Its complete tree
`d8894205d684f063a7e7cb22f7b4925f9578fe61` matches tested head
`60b47a047b67fdb8945df2c7533801351c6474a0`. Its two successor commits correct
tests only; application and migration bytes are unchanged from the original
published candidate.

All 17 final-head checks passed. The six native partitions passed 3,145 cases
(729, 742, 658, 730, 100 and 186), with twelve workflow skips covered by the
separately scoped 23-case SDK run below. Host doubles passed 156 cases and hosted
storage checks passed thirteen. Migration-drift, API static, frontend and security
checks passed. The retained earlier failures below do not supersede this final
complete result. No editor assignments or runtime activation were included.
After full-tree equivalence and no dependent PRs were verified, the remote source
branch was retired using its exact tested tip; the local checkout remains preserved.

The expanded permission and historical-qualification regression passed 211 cases
before final JSON formatting. A focused concurrency/session/migration regression
passed 44 cases after fixing a reproduced membership-restoration deadlock. The
formatted editor regression passed 68 cases and failed one transaction-fixture
test; correcting the fixture without weakening assertions passed the complete
four-case receipt group. Separate SDK workflow coverage passed 23 cases; host
doubles passed 156 and storage checks passed 13. Repository checks passed 56
cached tasks, with 539 existing warnings and zero errors.

A fresh complete editor regression on exact committed
`685d36ba31df95bec75574efd0554faffc8cf232` passed all 69 cases in 464.81 seconds,
including the corrected receipt fixture. Its ten modules cover commands, reads,
session/CSRF transport, PostgreSQL concurrency, migration integrity, runtime
qualification, normalized input, events and receipts. The four test files added
after the frozen full-suite snapshot are all included. The original fixture
failure remains retained; this result establishes the final editor-test scope.

The full native regression completed on a frozen pre-format candidate with 3,120
passes, one failure and 12 workflow skips. Manual planning passed 100 cases and
scope regression passed 186 cases.
Its first three partitions passed 727, 756 and 648 cases, with 12 workflow skips
covered by the separately scoped workflow run. The fourth partition passed 703
cases and failed one historical storage-reversal test: it reversed storage SQL
while leaving the later command successor installed, then asserted the earlier
catalog. A local test-only correction reverses the installed migration chain
before making the same exact predecessor-catalog and retained-table assertions.
The complete 19-case migration/integrity recheck passed in 200.42 seconds, with
lint and formatting checks passing. The correction is published at
`09c386430c79d745a6e340b9e1bfea685c3c678e`; all 33 implementation files from its
parent remain byte-identical. The original failure remains retained.
The manually started backend workflow on
`685d36ba31df95bec75574efd0554faffc8cf232` completed all six partitions with
3,135 passes, ten failures and 12 workflow skips, plus 156 passing host doubles
and passing API lint. One failure repeats the corrected migration test above.
The other nine endpoint failures depended on the main URL configuration being
imported after Curve enablement. Explicit installed-route test configuration
passed all 21 configuration/endpoint cases in 227.97 seconds; fresh-process
probes also passed real application routing with Curve enabled and disabled at
startup. This second test correction is included in PR #53's current head.

JSON values and runtime behavior were preserved by formatting, but qualification
hash literals changed and additional tests were added. That run must retain its
original source scope. Final-head CI and integration are recorded above.
Feature editing, joint Initiative/Item commands and native UI acceptance remain
separate work.

## Next implementation boundary

The [command candidate](../../contracts/candidates/roadmap-domain-v1/COMMANDS.md)
(scoped commands, concurrency and permission prerequisites) remains partially
implemented: the hierarchy actions above are integrated; Feature and Item actions
remain pending.
Initial creator ownership follows the [approved defaults](roadmap-approved-defaults.md)
(ownership, Product Feature editor authority and milestone-focus composition).
The approved contributor mapping is current Product ownership or an explicit
current Product-scoped editor grant. Owner/admin grant management supplies no
implicit Feature editing authority. Runtime enforcement for the remaining
Feature and Item actions remains implementation work. The hierarchy
API requires explicit enablement; storage integration alone enables no routes.

Feature command preparation has twenty-three passing normalized-input, event and
protected-reference requirement tests, plus nine passing native permission-fact
resolver tests in an isolated candidate. It is not installed in the application. The next native
adapter must reuse the installed editor rules, recheck current membership and
grant generation under compatible locks, and authorize both retained and
replacement protected descriptions before writes or successful replay.
The existing local document authority is Initiative-scoped; byte storage alone
does not establish Product Feature description access. Qualify a scoped protected
description adapter before exposing the complete Feature command boundary.

Next work must qualify joint Initiative/Item creation, protected references,
exact replay and history, scope/approval supersession, and current membership.
New work retains Product review of the PRD and Technical review of the plan under
[the two-stage direction](two-stage-new-work-direction.md) (current approvals and
historical-edition handling). The [experience blueprint](curve-experience-blueprint.md)
(prototype and screen acceptance) remains the gate for material Roadmap UI work.

This evidence establishes storage and hierarchy-command integration. Full M2-01 command/UI acceptance,
later M2 packages, provider qualification and production rollout remain pending.
