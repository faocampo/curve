# M1-01A Initiative Domain and API Task Packet

## Document control

| Field | Value |
| --- | --- |
| Status | `ACCEPTED_AND_MERGED / LOCAL_ONLY`; Plane PR #14 merged reviewed head `7e712e0...` as `99a73b4...` |
| Version | 1.0 |
| Date | 2026-08-29 |
| Product | Curve |
| Work package | M1-01A (Initiative domain and API foundation) |
| Owner and human reviewer | Federico Ocampo (`faocampo`) |
| Implementer | Codex |
| Implementation repository | `git@github.com:faocampo/plane.git` |
| Candidate target | `preview`; dispatch pins the live post-M1-00A base |
| Risk classification | Medium; workspace authorization, human assignments, lifecycle, and additive persistence |
| Data classification | Synthetic `INTERNAL` test data only |
| Model/tool policy | No model, provider, protected data, Temporal change, or external service |
| Budget | US$0 external spend |
| Accepted implementation | [M1-01A implementation evidence](m1-01a-initiative-core-implementation-evidence.md) (exact context, Plane head/merge/tree, CI, tests, data boundary, and rollback) |

## Outcome

Implement the Initiative aggregate and workspace API required for manual-first
alignment. An active workspace member creates a `STANDALONE` Initiative under
an active same-workspace Product with a required title, bounded versioned
Markdown description, case-insensitively unique keyword, risk tier, creator,
and exactly three active-human gate assignments.

M1-01A exposes `DRAFT`, `ALIGNING`, `PAUSED`, and `CANCELLED`. Accepting
refinement pins built-in local manual-first workflow version
`82000000-0000-4000-8000-000000000001` and transitions
`DRAFT` to `ALIGNING`. Pause records the prior state, resume returns to that
state after reauthorization, and cancel is terminal. The schema retains the
complete Initiative state vocabulary for compatibility; later packages activate
later transitions.

`ROADMAP` remains a valid API vocabulary value and returns stable
`409 ROADMAP_MODE_NOT_AVAILABLE` until M2 supplies Roadmap Item persistence.

## Normative inputs

| Input | Contract |
| --- | --- |
| Product prerequisite | [M1-00A Product persistence contract](../../contracts/database/m1-00a-product-core-relational-contract.md) (active Product, workspace ownership, and archive guard) |
| Initiative resource | [Initiative schema](../../contracts/schemas/initiative.schema.json) (identity, Product, mode, rich description, risk, lifecycle, workflow pin, and assignments) |
| Commands and events | [Initiative request schemas](../../contracts/schemas/initiative-create-request.schema.json) (create, draft update, and lifecycle request bodies) and [Initiative event v1](../../contracts/schemas/initiative-event-v1.schema.json) (durable state and mutation evidence) |
| Authorization | [Initiative policy v1](../../contracts/policy/initiative-policy-v1.json) (human authorities, states, and fail-closed preconditions) |
| Persistence | [M1-01A relational contract](../../contracts/database/m1-01a-initiative-core-relational-contract.md) (tables, constraints, transaction boundary, and migration) |
| HTTP | [Curve OpenAPI v1](../../contracts/openapi/curve-v1.openapi.yaml) (workspace Initiative list/create/read/update/transition endpoints) |

Every implementation pins the exact merged Curve revision and its generated
M1-01A context digest. An unmerged revision is non-canonical.

## Included scope

- Additive Initiative and GateAssignment models and migration in `plane.curve`.
- Workspace-scoped repositories, serializers, policies, command services, and
  list/create/read/update/accept-refinement/pause/resume/cancel APIs.
- Product archive guard backed by real non-terminal Initiative state queries.
- Case-insensitive workspace keyword uniqueness while preserving display case.
- Three gate types, active same-workspace human validation, and LOW versus
  STANDARD/HIGH separation rules.
- Built-in immutable manual-first workflow identifier for local alignment.
- Optimistic concurrency, digest-only idempotency, durable DomainEvent/outbox,
  PolicyDecision, and redacted AuditEvent evidence using accepted M0 services.
- Focused database, authorization, lifecycle, contract, and migration tests.

## Excluded scope

- Initiative shell/UI; Roadmaps and Roadmap Items; Idea Brief and PRD artifacts;
  gate decisions or approver delegation; contributors; and later lifecycle
  transitions.
- Protected object bodies, Onyx, MCP, models, providers, Temporal changes,
  coding agents, VCS, notifications, deployment, and staging/production.
- External-resource creation and keyword freezing triggered by an external
  binding; M1-01A keeps that timestamp null.

## API and stable failures

| Operation | Success | Stable failures |
| --- | --- | --- |
| List | `200` cursor page | workspace `404`, authorization `403`, invalid filter `422` |
| Create | `201`, Location, ETag | `PRODUCT_INACTIVE`, `INITIATIVE_KEYWORD_CONFLICT`, `ROADMAP_MODE_NOT_AVAILABLE`, `GATE_ASSIGNMENT_INVALID`, `422` |
| Read | `200`, ETag | cross-workspace/absent `404` |
| Update draft | `200`, ETag | invalid state, frozen keyword, risk separation, `412`, `428`, `422` |
| Accept refinement | `200`, ETag | inactive Product/approver, invalid separation/state, `412`, `428` |
| Pause/resume/cancel | `200`, ETag | authority/state/reason/reauthorization failure, `412`, `428`, `422` |

Every mutation requires `Idempotency-Key`; every post-create mutation also
requires `If-Match`. Reusing a key with the same digest replays the same
database `ResourceRef`; another digest returns conflict without domain effects.

## Acceptance cases

| ID | Given / When / Then |
| --- | --- |
| I-01 | Given an active Product and active human creator, when valid STANDALONE creation commits, then Initiative, three assignments, event, outbox, audit, policy decision, and idempotency result commit atomically. |
| I-02 | Given two workspaces, when they use keywords differing only by case, then each workspace may create one; a case variant in one workspace conflicts. |
| I-03 | Given missing Product, cross-workspace Product, or archived Product, when create or refinement acceptance runs, then it fails closed with no domain effect. |
| I-04 | Given ROADMAP input, when create runs before M2, then `ROADMAP_MODE_NOT_AVAILABLE` is returned and no row exists. |
| I-05 | Given missing, duplicate, inactive, service, agent, or other-workspace approvers, when create runs, then it fails without partial assignments. |
| I-06 | Given STANDARD or HIGH risk, when any approver overlaps, then creation/update fails; LOW accepts overlap when the built-in workflow permits it. |
| I-07 | Given a DRAFT Initiative, when the creator updates permitted fields with a current ETag, then one version/event is appended; Product, mode, creator, assignments, workflow, and state cannot be updated through metadata. |
| I-08 | Given a DRAFT Initiative, when its keyword changes before an external resource, then display case is preserved and uniqueness is checked case-insensitively. |
| I-09 | Given a valid DRAFT Initiative, when the creator accepts refinement, then the built-in workflow version is pinned and state becomes ALIGNING exactly once. |
| I-10 | Given DRAFT or ALIGNING, when an authorized actor pauses with reason, then state becomes PAUSED and prior state is recorded; resume reauthorizes and restores it. |
| I-11 | Given a non-terminal reachable state, when creator, configured approver, or administrator cancels with reason, then state becomes terminal CANCELLED and later mutations fail. |
| I-12 | Given a non-owner active member, service, agent, inactive member, or forged role, when a restricted command runs, then it is denied with no Initiative/outbox mutation. |
| I-13 | Given stale ETag, duplicate delivery, worker/retry replay, or changed idempotency digest, when a command repeats, then it produces no duplicate effect. |
| I-14 | Given a Product with any DRAFT, ALIGNING, PAUSED, or FAILED Initiative, when Product archive runs, then the real Initiative guard blocks it; READY_FOR_REPOSITORY_REVIEW and CANCELLED are terminal. |
| I-15 | Given a database failure before commit, when rollback completes, then no partial Initiative, assignment, domain event, outbox, or completed idempotency record remains. |
| I-16 | Given migration 0007 in a disposable database, when it migrates forward, reverses to 0006, and migrates forward again, then constraints and data-free rollback behave deterministically. |

## Exact implementation and verification sequence

1. Add models, managers, constraints, indexes, and migration
   `0007_initiative_gateassignment.py` after the accepted Product migration.
2. Replace the Product archive placeholder guard with a workspace-scoped query
   over actual Initiative terminal states.
3. Add policy resolution and locked active-membership/assignment checks.
4. Add atomic commands, event/outbox/audit/idempotency integration, and stable
   Problem Details mappings.
5. Add serializers, workspace-scoped routes, and contract compatibility tests.
6. Run focused tests, full Curve backend regression, migration drift and
   disposable forward/reverse/forward proof, `pnpm check`, and `pnpm build`.

The dispatch records exact commands from the live Plane base. Expected minimum
commands are:

```text
git diff --check
pnpm check
pnpm build
docker compose -f docker-compose-test.yml run --rm --build api-tests pytest plane/curve/tests -q
docker compose -f docker-compose-test.yml run --rm api-tests python manage.py makemigrations --check --dry-run
```

## Disablement and rollback

Curve remains disabled by default. Before merge, delete or revert the isolated
branch. After merge, `CURVE_ENABLED=0` disables routes and the existing Plane UI
and workers continue unchanged. Reverse migration is limited to the disposable
proof; once Initiative data is relied on, preserve it and use an additive fix.

## Dispatch and completion record

Curve PR #41 merged the contract source as
`ebbf22745e7939a633dd667246e7207a57ef526a`, and the canonical context digest
remained
`sha256:d2aa09a76f13ac840a846d25db5470e412c58f26828952f559763d506b3ceba8`.
Plane PR #14 implemented that context from base `afdb593...`, passed
commit-bound CI at reviewed head `7e712e0...`, and squash-merged to
`preview` as `99a73b4...`. The reviewed and merged trees are identical.

[M1-01A implementation evidence](m1-01a-initiative-core-implementation-evidence.md)
(exact dispatch, implementation, verification, merge, security boundary, and
rollback) is the acceptance record. M1-01B (Curve-first Initiative shell)
remains open and requires an approved screen contract plus manual UX acceptance.
