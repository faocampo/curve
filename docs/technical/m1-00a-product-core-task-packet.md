# M1-00A Minimal Product Core Task Packet

## Document control

| Field | Value |
| --- | --- |
| Status | `PREPARED_NOT_DISPATCHABLE`; Product semantics are approved; contract publication, final context digest, and exact dispatch approval remain pending |
| Version | 1.1 |
| Date | 2026-08-28 |
| Product | Curve |
| Work package | M1-00A (minimal Product core) |
| Owner and human reviewer | Federico Ocampo (`faocampo`) |
| Implementation repository | `git@github.com:faocampo/plane.git` |
| Candidate target/base | `preview` at `af7187d049c6ee6d0c82a5c70b686d4c444e9b63`; dispatch re-verifies the live base and migration chain |
| Risk classification | Medium; workspace authorization, ownership, lifecycle, and additive persistence |
| Data classification | Synthetic `INTERNAL` test data only |
| Model/tool policy | No model, provider, protected data, or external service |
| Budget and timeout | US$0 external spend; repository commands use bounded CI timeouts |

## Approved outcome

Implement the minimum Product aggregate and workspace API required before
Initiative implementation:

- immutable lowercase workspace-unique `key` matching
  `[a-z0-9][a-z0-9-]{0,49}`;
- required mutable `name`;
- optional mutable `description`;
- required explicit IANA `timezone`; accepted changes apply prospectively and
  never rewrite history;
- one active human owner, initially the creating user;
- lifecycle states `ACTIVE` and `ARCHIVED`;
- archival only when no non-terminal Initiative exists;
- archived Products remain historically readable and reject new Initiatives;
- workspace administrators create, archive, restore, and reassign Products;
- Product owner or workspace administrator edits metadata; and
- R1 retirement uses reversible archival.

Roadmaps, Milestones, Features, Roadmap Items, schedules, and snapshots remain
M2 scope.

## Normative inputs

| Input | Contract |
| --- | --- |
| Product decision | [M1-00A machine decision](../../contracts/governance/m1-00a-product-core-v1.json) (approved exact semantics and M2 deferral) |
| Product resource and requests | [Product JSON Schemas](../../contracts/schemas/product.schema.json) (resource identity, lifecycle, ownership, and state-dependent fields) and adjacent create/update/reassign schemas |
| Product events | [Product event v1](../../contracts/schemas/product-event-v1.schema.json) (created, metadata, owner, archive, and restore payloads) |
| Authorization | [Product policy v1](../../contracts/policy/product-policy-v1.json) (Plane Admin mapping, owner permissions, human-only actions, and archive preconditions) |
| Persistence | [Product relational contract](../../contracts/database/m1-00a-product-core-relational-contract.md) (table, constraints, transactions, guard, and migration) |
| HTTP | [Curve OpenAPI v1](../../contracts/openapi/curve-v1.openapi.yaml) (workspace Product list/create/read/update/reassign/archive/restore endpoints) |

Every implementation task pins the exact merged Curve revision containing all
inputs above. A working-tree or unmerged PR revision is not dispatch authority.

## Scope

### Included

- Additive Curve Product model and migration in the dedicated `plane.curve`
  Django application.
- Repository/service commands for create, read/list, metadata update, owner
  reassignment, archive, and restore.
- Product-specific policy adapter after the accepted M0 core policy boundary.
- Workspace-scoped DRF endpoints under `/api/v1/workspaces/{workspace_slug}/curve/`.
- Digest-only idempotency, ETag/`If-Match`, durable DomainEvent/outbox, immutable
  audit evidence, and Problem Details responses through existing M0 services.
- Initiative guard interface and archived-Product acceptance check.
- Backend contract, database, authorization, concurrency, migration, and API
  tests.

### Excluded

- Product UI, Roadmaps, Milestones, Features, Roadmap Items, schedules,
  snapshots, imports, and migration of existing Plane data.
- Provider, model, Temporal, agent, VCS, notification, deployment, or production
  side effects.
- Hard deletion or destructive retirement.
- New Plane membership semantics or duplicated workspace membership data.

## API behavior

| Operation | Success | Concurrency/idempotency | Stable failure classes |
| --- | --- | --- | --- |
| List Products | `200` cursor page; active and archived filterable | Read only | `401`, `403`, workspace `404`, `422` filter error |
| Create Product | `201`, `Location`, Product ETag | `Idempotency-Key`; same digest replays same Product | `403`, `409 PRODUCT_KEY_CONFLICT`, `422 INVALID_PRODUCT` |
| Read Product | `200`, Product ETag | Read only | cross-workspace/absent `404` |
| Update metadata | `200`, new Product ETag | `If-Match` plus `Idempotency-Key` | `403`, `404`, `412`, `422` |
| Reassign owner | `200`, new Product ETag | `If-Match` plus `Idempotency-Key` | `403`, `404`, `409 TARGET_OWNER_INACTIVE`, `412` |
| Archive | `200`, new Product ETag | `If-Match` plus `Idempotency-Key` | `403`, `404`, `409 PRODUCT_HAS_NON_TERMINAL_INITIATIVE`, `412` |
| Restore | `200`, new Product ETag | `If-Match` plus `Idempotency-Key` | `403`, `404`, `409 INVALID_PRODUCT_STATE`, `412` |

The update schema contains only `name`, `description`, and `timezone`. A key,
owner, or state in that request is a `422` error. Reassignment and lifecycle use
their explicit commands.

## Authorization matrix

| Actor | Read | Create | Edit metadata | Archive/restore | Reassign owner |
| --- | --- | --- | --- | --- | --- |
| Active workspace member | Yes, including archived | No | Only if current active owner | No | No |
| Current active Product owner | Yes | No unless also admin | Yes | No unless also admin | No unless also admin |
| Active workspace administrator | Yes | Yes | Yes | Yes | Yes |
| Inactive member, service, or agent | No | No | No | No | No |

The implementation reads authority from current Plane membership and the locked
Product owner. Request fields, tokens, or cached UI roles cannot grant authority.

## Implementation sequence

1. Add the Product model, manager/repository, constants, constraints, indexes,
   and additive migration after the accepted M0 migration chain.
2. Add Product policy evaluation and membership/owner resolution using existing
   Plane workspace permissions and the M0 PolicyDecision/audit boundary.
3. Add transactional command services that bind Product, DomainEvent, outbox,
   audit, and idempotency state.
4. Add the Initiative guard interface; register the no-Initiative implementation
   only while the Initiative module is disabled, and fail archive closed when
   the guard is unavailable.
5. Add serializers and workspace-scoped endpoints matching OpenAPI exactly.
6. Add focused tests, migration proof, schema/OpenAPI compatibility, and full
   Plane regressions.

Each pull request remains one repository-local, independently reviewable change.
If the implementation is split, the model/migration commit may precede the
service/API commit only while routes and navigation remain disabled.

## Given/When/Then acceptance cases

| ID | Scenario |
| --- | --- |
| P-01 | Given a workspace administrator and valid input, when Product creation commits, then the key is stored unchanged, owner equals the creating human, state is `ACTIVE`, version is 1, and one Product event/outbox/audit/idempotency result commits atomically. |
| P-02 | Given two workspaces, when both create the same valid key, then both succeed; a duplicate in one workspace returns `409` and creates no second Product. |
| P-03 | Given uppercase, underscore, leading-hyphen, empty, or 51-character keys, when create is requested, then `422` is returned and no Product exists. |
| P-04 | Given a Product, when metadata update contains `key`, `owner`, or `state`, then `422` is returned and version/history remain unchanged. |
| P-05 | Given the active Product owner or workspace administrator, when name, description, or timezone is updated with current ETag, then version increments once and one matching event is appended. |
| P-06 | Given a non-owner workspace member, inactive member, service, or agent, when metadata update is attempted, then access is denied with no Product event or outbox effect. |
| P-07 | Given valid named IANA zones and invalid offsets/unknown zones, when create or update runs, then named zones succeed and invalid zones return `422`. |
| P-08 | Given timezone A and historical records, when an authorized update changes to timezone B, then the event records A and B, future reads expose B, and no historical row changes. |
| P-09 | Given an active same-workspace human, when an administrator reassigns ownership, then exactly one owner remains and the old owner loses owner-only edit authority. |
| P-10 | Given an inactive or other-workspace target user, when reassignment is attempted, then `409`/`404` is returned without ownership change. |
| P-11 | Given only terminal Initiative states, when an administrator archives, then state becomes `ARCHIVED` with non-null actor/time and the Product remains readable. |
| P-12 | Given any non-terminal Initiative, including `FAILED`, when archive is attempted, then `409 PRODUCT_HAS_NON_TERMINAL_INITIATIVE` is returned with no mutation. |
| P-13 | Given the Initiative guard is unavailable, when archive is attempted, then it fails closed with no Product mutation. |
| P-14 | Given an archived Product, when new Initiative creation checks it, then `PRODUCT_ARCHIVED` is returned; after administrator restore, the same check succeeds. |
| P-15 | Given a stale ETag or a reused idempotency key with another request digest, when any mutation is attempted, then `412` or `409` is returned and no domain/outbox effect occurs. |
| P-16 | Given a Product ID from another workspace, when read or mutation is attempted, then the result is indistinguishable from absent and the denial is safely audited. |
| P-17 | Given a database failure after Product mutation but before commit, when the transaction rolls back, then Product, DomainEvent, outbox, audit-success, and idempotency completion all remain absent. |
| P-18 | Given an archived Product, when R1 retirement is inspected, then no delete route, cascade, or tombstone exists and restore remains available to an administrator. |

## Exact verification commands

Run from the Plane repository root at the dispatched base:

```text
git diff --check
pnpm check
pnpm build
docker compose -f docker-compose-test.yml run --rm --build api-tests pytest plane/curve/tests -q
docker compose -f docker-compose-test.yml run --rm api-tests python manage.py makemigrations --check --dry-run
docker compose -f docker-compose-test.yml run --rm api-tests python manage.py migrate
```

The implementation PR also records disposable-database reverse-to-prior and
forward-again proof for the Product migration. Run from the Curve contract
repository pinned by the task:

```text
pnpm check
pnpm check:external
git diff --check
```

## Rollback and disablement

- Curve remains disabled by default; disabling Product routes leaves existing
  Plane behavior unchanged.
- Before shipment, reverse the additive Product migration in a disposable or
  explicitly approved environment.
- After Product data is relied on, preserve rows and use a compensating additive
  migration or code revert; do not destroy Product history.
- A partially deployed API/service change is rolled back while the Product table
  remains inert and unexposed.

## Dispatch blockers

This packet becomes `READY` only after:

1. the exact Curve revision containing every normative contract is reviewed and
   merged to `main`;
2. P0-05 (R1 acceptance-test strategy) is merged and its context is authoritative;
3. the live Plane `preview` base and migration chain are reverified;
4. the M1-00A context pack digest is generated from merged bytes;
5. exact repository commands are reconfirmed against that base; and
6. Federico explicitly dispatches the implementation packet.

No coding agent may infer that Project `In progress` status or this prepared
document authorizes Plane code mutation.
