# Implemented features — local reconstruction checkpoint

This record separates recovered source, newly implemented behavior and remaining
acceptance. It does not claim recovery of the lost later backend, completion of
M3/R1 or production readiness. See the [pilot delivery record](local-pilot-delivery-2026-10-06.md)
(milestones and evidence) and [Gate 2 boundary](manual-gate2-reservation-candidate.md)
(exact manual authority, reservations, reconciliation and proof pins).

## Integrated behavior

| Feature | Implemented behavior | Verification boundary |
| --- | --- | --- |
| Persistent manual drafts | Save immutable revisions, current state and protected history from exact definitions; atomically retain policy, audit, event, outbox and idempotency | Actual PostgreSQL, session/CSRF, same/different-key races, rollback and raw-SQL guards |
| Protected synthetic inputs | Owner-only local catalog, exact per-principal grants, original PRD/evidence bytes, monotonic observations and final native/file fences | Synthetic local storage only; no production provider/storage adapter |
| Bounded validation | Derive semantic facts from protected bodies and validate the exact definition in a bounded Linux worker | Real worker jobs and resource/slot tests; no automatic execution or AI spending |
| Scope preconditions | Read eight metadata fields with complete bounded lineage, fresh authorization and consistency fences; distinguish absence from saved-empty scope | No task bodies, grants or writes; 23 native cases and 31 host cases |
| Manual Gate 2 | Prepare an exact saved draft; assigned TechnicalApprover approves or requests changes under current access | Separate qualified successor; native Initiative stays PLANNING |
| Exclusive task reservations | Atomic ownership across Initiatives by stable native issue identity; retained ownership on pause, cancellation or access loss | Independent-connection overlap/retry tests and database uniqueness/graph guards |
| Reconciled release | Current approver explicitly reconciles exact claim generations and native observations, then releases the exact subset | Protected human attestation; started work and stale observations are rejected; no external-completion claim |
| Generation-safe retries | Later acquisition increases generation; original successful-command retry returns its receipt without reacquiring ownership | Actual release/reacquisition and original replay evidence |
| Manual UI | Protected definition/evidence review, visible reservations/holds, explicit decisions and same-command retry after uncertainty | Mounted behind a default-off flag; full app types and 380 web tests; synthetic visual review |

The installed native suite passes **100 tests**: 57 draft/worker/authority/migration,
23 scope-reader and 20 Gate 2 cases. All **186 historical regressions** also pass.
The host suites pass **107 manual plus 31 scope**
tests. The separate prospective Gate 2 suite passes **23 tests**, including three
historical migration gates. Combined installed verification uses Plane
`8aede16b4aee1aa66eb0b9469c4c849b34250f6e`; the runtime integration commit is
`a69559f990c995f0d2c930306544979afd005d93`.

Curve's complete contract/documentation check passes **1,071 tests**, 124 schemas,
186 fixtures and 47 Mermaid diagrams. Contract implementation is
`a466dab761354933c724776dbd1cbe3077f8aac6`. Later evidence-only documentation does
not change those tested runtime or contract bytes.

## Recovered and preserved behavior

The recovery baseline already contained Products/Initiatives, explicit association
of existing native projects, scope proposal, exact PRD submission/approval and
pre-plan reopening. These were not newly recovered from the missing backend.
Historical regression for this new successor is recorded separately in the
[delivery record](local-pilot-delivery-2026-10-06.md) (exact executed results).

Every prior proof and migration remains intact. New manual draft, scope-read and
Gate 2 editions have separate literal pins. Prospective assemblies remain in Git
history; the current application has one installed implementation. Prepared source
is not treated as a deployed feature or a user acceptance result.

## Branches and review cut

Work was committed on these existing recovery branches:

- Curve: `reconstruction/manual-planning-v2`.
- Plane: `feature/existing-project-association`.

The review application uses a separate checkout of the tested Plane commit. Local
operator configuration may enable only its synthetic workspace; product defaults
remain off. Publication, CI results, local URLs and access instructions belong to
the concrete delivery handoff. No merge or deployment is implied by a branch push.

## Remaining boundaries

A real authenticated browser journey is separate from component tests and synthetic
captures. Broader pilot/R1 acceptance, operational backup/restore/failure exercises,
production protected storage, Today/decisions and product roadmap surfaces remain
open. Protected definitions and rationales require explicit local provisioning;
this cut does not include a document authoring editor, new external provider,
automatic agent execution, model calls, spending or completion credit.
