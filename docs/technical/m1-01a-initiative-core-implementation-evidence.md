# M1-01A Initiative Core Implementation Evidence

> Sanitized public reference. Fictional identities cannot authorize execution.
> Historical approvals apply only to their original bytes; see
> [public contract edition](public-reference-sanitization.md) (sanitization, integrity and approval boundaries).

## Document control

| Field | Accepted value |
| --- | --- |
| Status | `ACCEPTED_AND_MERGED / LOCAL_ONLY` |
| Package | M1-01A (Initiative domain and API foundation) |
| Parent | M1-01 (Initiative aggregate and APIs) |
| Evidence version | 1.0 |
| Acceptance date | 2026-08-29 |
| Owner and human reviewer | Designated reviewer, Designated technical owner |
| Implementer | Codex |
| Curve contract revision | `ebbf22745e7939a633dd667246e7207a57ef526a` |
| Approved contract head | `9e5bb5042139746338e22dcfd71c5f975adc4ab6` |
| Context digest | `sha256:d2aa09a76f13ac840a846d25db5470e412c58f26828952f559763d506b3ceba8` |
| Plane implementation base | `afdb59388e4ea9b2321d33935000126303fc93b8` |
| Reviewed Plane head | `7e712e06f41087c013f4a8ed8fd1ff9223f628c4` |
| Plane squash merge | `99a73b4eab5ee21fd012d7358bc9259252d47f71` on `preview` |
| Reviewed and merged Git tree | `fd1c18aa4754620bd3b0d28f3cb82af565c4e5a4` |
| Data and environment | Synthetic `INTERNAL` data in `LOCAL_ONLY` |
| External spend | US$0 |

## Accepted outcome

[Plane PR #14](https://github.com/faocampo/plane/pull/14) (M1-01A
Initiative domain and API implementation) adds the manual-first Initiative
backend foundation to Plane's additive, default-off `plane.curve` Django
application:

- workspace-scoped `Initiative` and `GateAssignment` records through
  additive migration `0007_initiative_gateassignment.py`;
- list, create, read, draft update, refinement acceptance, pause, resume, and
  cancel APIs under the Curve workspace route;
- active Product binding, case-insensitive workspace keyword uniqueness,
  exactly three active-human gate assignments, and elevated-risk separation;
- optimistic concurrency, digest-only idempotent replay, immutable policy and
  audit decisions, durable domain events, and transactional outbox records;
- a real Initiative-backed Product archival guard; and
- byte-bound Curve OpenAPI, policy, schema, fixture, and context contracts.

The implementation keeps `ROADMAP` mode fail closed until M2, accepts only
bounded synthetic `INTERNAL` Markdown bodies, and preserves protected bodies,
providers, models, Onyx, MCP, Temporal changes, VCS operations, deployment, and
non-local activation outside this package.

## Governed inputs

| Input | Evidence |
| --- | --- |
| Task packet | [M1-01A task packet](m1-01a-initiative-core-task-packet.md) (Initiative scope, acceptance cases, commands, stop conditions, and rollback) |
| Relational contract | [M1-01A relational contract](../../contracts/database/m1-01a-initiative-core-relational-contract.md) (tables, constraints, transactions, migration, and rollback) |
| Authorization contract | [Initiative policy v1](../../contracts/policy/initiative-policy-v1.json) (human authorities, lifecycle states, and fail-closed preconditions) |
| HTTP contract | [Curve OpenAPI v1](../../contracts/openapi/curve-v1.openapi.yaml) (workspace Initiative resources, commands, concurrency, and stable failures) |
| Definition evidence | [Curve PR #41](https://github.com/faocampo/curve/pull/41) (merged M1-01A contracts and canonical context) |
| Implementation evidence | [Plane PR #14](https://github.com/faocampo/plane/pull/14) (reviewed implementation, CI record, and squash merge) |

## Verification evidence

| Check | Accepted result |
| --- | --- |
| Contract snapshot integrity | Passed for all historical snapshots and 20 M1-01A vendored files |
| Focused Initiative API suite | 9 passed |
| Contract suite | 27 passed |
| Complete Curve backend suite | 364 passed; 10 local Temporal workflow tests skipped |
| Migration drift | No changes detected |
| Disposable migration proof | Migration `0007` applied, reversed to `0006`, and reapplied |
| Ruff | Passed for the Curve API code |
| Monorepo checks | `pnpm check`: 60 of 60 tasks passed |
| Monorepo build | `pnpm build`: 16 of 16 tasks passed |
| Diff and credential-signature scan | Passed |
| [Plane CI run 33252718048](https://github.com/faocampo/plane/actions/runs/33252718048) (API lint, contract integrity, complete Curve backend tests, and migration drift) | Passed at reviewed head `7e712e06f41087c013f4a8ed8fd1ff9223f628c4` |

The reviewed head and squash merge resolve to the same Git tree,
`fd1c18aa4754620bd3b0d28f3cb82af565c4e5a4`. The squash changed commit
history while preserving the reviewed implementation.

## Acceptance mapping

| Acceptance area | Accepted evidence |
| --- | --- |
| Product and workspace boundary | Missing, archived, and cross-workspace Products fail closed; Product archival queries real non-terminal Initiatives |
| Assignment and risk rules | Three mandatory active-human gate types are enforced; STANDARD and HIGH require distinct approvers |
| Lifecycle | DRAFT, ALIGNING, PAUSED, and CANCELLED transitions, pause provenance, resume reauthorization, and terminal cancellation passed |
| Authorization and isolation | Creator, configured approver, and workspace-administrator rules are evaluated from live membership; cross-workspace and forged-role paths are denied |
| Concurrency and replay | ETag preconditions, digest-only idempotency, uniqueness-race translation, and duplicate command replay passed |
| Atomic evidence | Initiative, assignments, policy, audit, domain event, outbox, and idempotency outcome share the command transaction |

## Security and data boundary

- Every persisted Initiative, assignment, policy decision, audit record, event,
  outbox record, idempotency record, query, and authorization input is
  workspace scoped.
- Agents and services cannot satisfy the active-human creator or approver
  requirements.
- Denied and rolled-back commands persist no Initiative or delivery effect.
- No credential, provider runtime call, model call, protected body, external
  service, infrastructure mutation, or deployment is part of the accepted
  implementation.
- D-009 (retention and protected-storage governance) continues to gate
  protected evidence bodies and non-local protected persistence.

## Rollback and completion boundary

`CURVE_ENABLED=0` disables Curve routes, or the Curve Compose profile can be
omitted. The additive tables remain available for inspection while disabled.
Migration reversal is limited to disposable migration proof; after Initiative
data is relied on, remediation uses an additive change or a separately reviewed
revert.

M1-01A is complete for its approved `LOCAL_ONLY`, synthetic-data backend
scope. M1-01 remains open. M1-01B (Curve-first Initiative shell) still owns the
list/create/detail experience, assignment and lifecycle controls, accessibility,
responsive behavior, browser tests, and Plane implementation. Designated reviewer approved
its screen contract and test evidence at exact Curve commit `656a196...`; packet
finalization and separate dispatch authority remain pending.
