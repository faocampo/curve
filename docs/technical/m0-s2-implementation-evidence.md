# M0-S2 Implementation Evidence

## Document control

| Field | Value |
| --- | --- |
| Status | `ACCEPTED_IMPLEMENTATION_EVIDENCE` |
| Version | 1.0 |
| Recorded on | 2026-08-18 |
| Work package | M0-S2 (operation and delivery kernel) |
| Plane packages satisfied | M0-02 (core aggregate persistence) and M0-05 (transactional delivery kernel) |
| Human owner and reviewer | Federico Ocampo (`faocampo`) |
| Data classification | `INTERNAL`; synthetic local fixtures only |

## Purpose

This record binds the accepted Curve contracts to the exact Plane implementation
that satisfies M0-S2 (operation and delivery kernel). It is the durable
post-merge evidence used by later task packets; GitHub Project status remains
visual metadata.

## Source and implementation binding

| Evidence | Exact value |
| --- | --- |
| Curve repository | [`faocampo/curve`](https://github.com/faocampo/curve) |
| Curve contract merge | [Curve PR #5](https://github.com/faocampo/curve/pull/5) at merge commit `ab2c81a33ede719c02ff0a2a6ab35eabcf304de1` |
| Normative database contract | [M0-S2 relational contract](../../contracts/database/m0-s2-relational-contract.md) (PostgreSQL records, constraints, transaction boundaries, and recovery rules) |
| Plane repository | [`faocampo/plane`](https://github.com/faocampo/plane) |
| Plane implementation base | `7685bbc7cc5e1ab34f11e3912d9e47d31c365a9a` |
| Approved Plane implementation head | `f520075493290389aa54532baec36268c34e2885` |
| Plane merge | [Plane PR #3](https://github.com/faocampo/plane/pull/3), squash commit `eff8686a69aa112ea8fda79be0e1316dc1fd97d6` on `preview` |
| Approved-head and merge tree | `c666fdeabd642719e9482024af3e4c645f183380`; identical at the approved head and squash merge |
| Context-pack digest | `sha256:45c266e1ab0d096747d6493a828d689251584bad70a1570582478bfe1a91cedc` |
| Plane context record | [M0-S2 context snapshot](https://github.com/faocampo/plane/blob/eff8686a69aa112ea8fda79be0e1316dc1fd97d6/apps/api/plane/curve/contracts/m0-s2-context.json) (contract revision, ownership, paths, and context digest) |
| Plane integrity checker | [M0-S2 contract-integrity checker](https://github.com/faocampo/plane/blob/eff8686a69aa112ea8fda79be0e1316dc1fd97d6/apps/api/plane/curve/contracts/check-integrity.mjs) (byte-pinned context and schema verification) |

## Accepted implementation scope

- Workspace-scoped `Operation`, `DomainEvent`, `OutboxEvent`, `InboxMessage`,
  `IdempotencyRecord`, and `AuditEvent` persistence.
- Digest-only idempotency keys with database `ResourceRef` response replay.
- Atomic operation, domain-event, outbox, audit, and idempotency writes.
- Optimistic aggregate versions, state-dependent lifecycle constraints,
  immutable terminal/history records, and workspace-scoped uniqueness.
- Replay-safe outbox claim, acknowledgement, retry, dead-letter, and expired-
  claim recovery plus inbox deduplication.
- Contract serialization, byte-identical JSON Schema snapshots, and the
  dependency-free `pnpm check:contracts` integrity command.

## Verification evidence

| Verification | Accepted result |
| --- | --- |
| Complete Plane backend suite | 575 passed; 0 failed; 92 upstream warnings |
| Curve-focused backend suite | 59 passed |
| Pinned schema recheck | 6 passed; all eight schema byte digests matched the approved Curve revision |
| Django migration drift | No changes detected for `plane.curve` |
| Disposable migration proof | Forward, rollback to zero, and forward passed |
| Migration SQL | 34 lines; 7,760 bytes; SHA-256 `78ac6e18c3a7463555e1fcef86a132a8d200022647788745037bec6f3daaf21f` |
| Python format and lint | Ruff passed |
| Contract integrity | `pnpm check:contracts` verified eight pinned schemas |
| Plane frontend checks | `pnpm check`: 60/60 tasks passed |
| Plane production build | `pnpm build`: 16/16 tasks passed |
| Hygiene | Secret-pattern scan and `git diff --check` passed |
| Merge verification | Remote `preview` resolved to `eff8686a...`; its tree was identical to approved head `f520075...` |
| Visual tracking | M0-02 (core aggregate persistence) and M0-05 (transactional delivery kernel) both read back as `Done` in GitHub Project #2 |

## Scope boundary and rollback

This evidence covers the local persistence and delivery kernel only. Later
packages own Temporal topology and proof, protected object storage, provider
calls, trusted VCS mutation, and user-facing flows.

Rollback is a reviewed revert of Plane squash commit
`eff8686a69aa112ea8fda79be0e1316dc1fd97d6`. The Curve module remains disabled
by default. Any shipped migration rollback follows the additive-migration
policy; a persistent-environment rewind requires its own reviewed data plan.

## Downstream consequence

M0-02 (core aggregate persistence) and M0-05 (transactional delivery kernel)
are complete. M0-03 (core authorization and policy kernel) is also complete at
Plane merge `922dd6de5d5ed5081f35cd88343154022867ccad`; see
[M0-03 implementation evidence](m0-03-implementation-evidence.md) (exact
contract/context, implementation tree, tests, security acceptance, and
rollback). D-003 (runtime topology and trust-zone decision) is `DECIDED` for
`LOCAL_ONLY`, and P0-06A/P0-06B (superseded standalone Temporal proof packets)
remain historical. M0-S3 (local Temporal round trip) is the next executable
proof after its dispatch revision is merged and its exact context is
materialized against the accepted Plane base.
