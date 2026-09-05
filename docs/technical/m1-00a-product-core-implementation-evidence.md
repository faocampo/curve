# M1-00A Product Core Implementation Evidence

> Sanitized public reference. Fictional identities cannot authorize execution.
> Historical approvals apply only to their original bytes; see
> [public contract edition](public-reference-sanitization.md) (sanitization, integrity and approval boundaries).

## Document control

| Field | Value |
| --- | --- |
| Status | `MERGED / LOCAL_ACCEPTANCE_RECORDED / CONFORMANCE_VARIANCE_OPEN`; R-027 (Product timestamp/schema-version contract reconciliation) remains undecided and blocks production qualification |
| Version | 1.0 |
| Date | 2026-08-29 |
| Product | Curve |
| Work package | M1-00A (minimal Product core required before Initiative implementation) |
| Owner and human reviewer | Designated reviewer |
| Implementation repository | [faocampo/plane](https://github.com/faocampo/plane) (public Plane fork containing Curve application code) |
| Implementation pull request | [Plane PR #13](https://github.com/faocampo/plane/pull/13) (minimal Product core implementation) |
| Environment and data | `LOCAL_ONLY`; synthetic `INTERNAL` identifiers; US$0 external spend |

## Recorded merge binding

| Evidence | Exact value |
| --- | --- |
| Curve contract revision | `46880350e0ca1e57dd08b6fb5a6a6546f37c4473` |
| Canonical context digest | `sha256:951fd873f4a9179aae58359e595e48e80ba081a9703202f6b9d9eed51b4b3b6f` |
| Product policy digest | `sha256:37e93b93cf9a3b6e560f5123fc147353127ba8be8aadba7b6c3dbb7a73fbbd06` |
| Plane base | `af7187d049c6ee6d0c82a5c70b686d4c444e9b63` |
| Reviewed Plane head | `d4ab9ea7c6d19222c316a51d7d2992415c8940f0` |
| Plane squash merge | `afdb59388e4ea9b2321d33935000126303fc93b8` |
| Shared reviewed/merged Git tree | `1c4904d617207b8301954c1019fe0fc6bf099b6d` |
| Current accepted descendant at reconciliation | `99a73b4eab5ee21fd012d7358bc9259252d47f71` |

The reviewed head and squash merge resolve to the same Git tree. The merged
Product implementation is an ancestor of the current Plane `preview` revision;
later Initiative work did not replace its Product semantics.

## Implemented outcome

The merged Plane change adds the minimum workspace-scoped Product aggregate
and API required before Initiative creation:

- immutable lowercase workspace-unique Product keys;
- mutable name and description plus prospective IANA timezone changes;
- one active human owner, initially the creating administrator;
- exact workspace-administrator and Product-owner authority;
- reversible `ACTIVE` and `ARCHIVED` lifecycle;
- fail-closed non-terminal Initiative archive guard;
- session-authenticated workspace endpoints;
- optimistic concurrency and digest-bound idempotent response replay; and
- atomic Product, DomainEvent, outbox, audit, and idempotency persistence.

The additive Plane migration is `0006_product.py`. M1-01A (Initiative domain and
API foundation) subsequently replaced the temporary no-Initiative guard with
the real Initiative-backed guard while preserving M1-00A behavior.

The [M1-00A physical-schema evidence](../../contracts/database/m1-00a-product-physical-schema-evidence-v1.json)
(commit-bound Product index attestation) records the exact migration
Git blob and SHA-256 digest and confirms that `0006_product.py` creates both
contract-required query indexes through physical `RunSQL` operations.

R-027 (Product timestamp/schema-version contract reconciliation) records two
post-merge conformance variances that the original local acceptance did not
resolve: the implemented `schema_version` column is absent from the v1
relational table list, and Django application UTC time does not match that
contract's database-time wording. This evidence records the approved merge and
local test result without deciding whether either variance is acceptable. Exact
relational conformance, production qualification, and any successor persistence
packet remain fail-closed until R-027 is decided and closed.

## Recorded local verification

The reviewed Plane head recorded:

- 355 passing Curve backend tests and 10 intentional local Temporal skips;
- 22 focused Product tests;
- 33 contract and Product checks;
- four Product model checks;
- `pnpm check` with 60 of 60 successful tasks;
- `pnpm build` with 16 of 16 successful tasks;
- Ruff format/check and Python compilation;
- migration drift with no changes detected;
- disposable migration `0006` forward, reverse to `0005`, and forward again;
- Curve contract-integrity validation; and
- staged diff and credential-signature checks.

Three manually dispatched, commit-bound Plane workflows passed at the reviewed
head:

- [Build and lint API run 33233528896](https://github.com/faocampo/plane/actions/runs/33233528896)
  (API build and lint verification);
- [CodeQL run 33233531615](https://github.com/faocampo/plane/actions/runs/33233531615)
  (security analysis); and
- [copyright run 33233534728](https://github.com/faocampo/plane/actions/runs/33233534728)
  (copyright policy verification).

The broader repository commands above are the recorded PR evidence and remain
separately reproducible from the pinned Plane base and reviewed head.

## Scope and security boundary

The merged local implementation contains no Product UI, roadmap entity, provider,
model, Onyx, protected-body storage, Temporal change, agent execution, VCS
mutation, infrastructure change, deployment, or staging/production mutation.
Curve remains disabled by default. The implementation used only synthetic
`INTERNAL` data and introduced no dependency or lockfile change.

## Lifecycle result

M1-00A (minimal Product core required before Initiative implementation) has a
merged, locally tested implementation on Plane `preview`. The local functional
evidence is complete; exact relational-contract conformance and production
qualification remain open under R-027 (Product timestamp/schema-version
contract reconciliation). M1-01 (Initiative capability) consumes the current
Product implementation and inherits that unresolved variance until closure.

## Rollback

- Disable Curve with `CURVE_ENABLED=0` or omit the Curve Compose profile.
- Revert application code through a separately reviewed Plane change.
- Reverse migration `0006` only in the disposable proof or before Product rows
  are relied on; otherwise preserve rows and use a compensating additive
  migration.
