# Local manual pilot delivery

Status: implementation in progress, 2026-10-06. This is a bounded synthetic local
pilot candidate, not R1 completion, production activation or release approval.

## Baseline and authority

Curve starts at `04c1684d06c2aecd6c0b9c3532bbecc491109168`; Plane starts at
`7d4225d594adf984de1451f16ad2c8ab741c58eb`. Both restored checkouts were clean.
The published recovery branches and preview tags remain historical checkpoints.
New deliverables remain local commits until separately approved for publication.

Use the [product requirements](../curve-ai-native-sdlc-prd.md) (three gates,
product ownership and release criteria), [architecture](architecture.md)
(PostgreSQL authority, protected inputs and transactional delivery), and
[development plan](development-plan.md) (existing M0–M7 and R1 packages).
The [reconstruction contract](manual-planning-reconstruction-v2.md) (new v2
draft writer, fixed synthetic resolver and preservation requirements) is the
implementation boundary. Missing later source is reconstructed, never described
as recovered. Historical evidence remains historical.

## Milestone matrix

| Milestone | Backend at recovery baseline | Frontend at recovery baseline | Completion boundary / remaining |
| --- | --- | --- | --- |
| M0: foundation | Local identity/policy, delivery kernel, temporal skeleton and observability have accepted historical evidence; recovered source is present | Curve shell and Foundation status are present | Partial milestone: rerun relevant local checks; external providers, protected production storage and operational qualification remain pending |
| M1: alignment and PRD | Product/Initiative, finite C1 scope, C2a exact scoped PRD and C2b reopening are implemented candidates | Initiative shell, protected PRD metadata and project association UI are present | Partial: authenticated integrated scope/planning journey and new browser acceptance remain pending |
| M2: roadmap and work linkage | Minimal Product and explicit existing-project association exist; no full roadmap aggregate qualification | Existing-project outlook exists; no qualified product roadmap view | Partial: permission-safe roadmap vision; no fabricated completion percentage or conversion of native Modules/Cycles |
| M3: planning and Gate 2 | v2 draft/read schemas and pure validator exist; persistent writer, read service, Gate 2 and controlling task reservation are absent | Later UI input is preserved separately, not integrated | Pending implementation: immutable manual drafts, exact inputs, qualified persistence/read, then approval and exclusive reservation |
| M4: execution | Local orchestration skeleton only | Foundation operation status only | Automatic execution is excluded from this manual pilot; no dispatch or AI spending grant |
| M5: quality and delivery | Existing policy/check contracts and source-bound evidence | No completed integrated plan approval/reconciliation surface | Partial contracts; local verification required; no merge, provider push or deployment capability |
| M6: attention and feedback | Isolated attention experiment has its own local store and read-only MCP | Standalone attention experiment exists | Partial experiment: integrate Today/decisions only with source/permission provenance; no real source writes |
| R1: qualification | Complete release qualification absent | End-to-end pilot acceptance absent | Pending; synthetic local pilot must prove backup/recovery, observability and permission/concurrency/retry behavior |
| M7: expansion | Deferred | Deferred | Outside this delivery; no new provider integration or import |

“Present” describes inspected source. Historical passing tests are not a new run.
No milestone is marked complete merely from schemas, mocks or collected tests.

## Approved manual-pilot rules

- Generic open-source product and synthetic examples only. No adopting-organization
  identity or operational data enters source, documentation, tests or logs.
- Existing projects are essential. Migration/import from other task managers is
  excluded. Native work remains Plane-owned.
- Manual planning permits zero AI spending and zero automatic execution.
- The assigned Product approver may reopen scope before plan approval; a fresh
  exact PRD is required. Old approvals cannot authorize changed scope.
- The assigned technical approver approves the exact plan and controls exclusive
  task reservation per Initiative. Native Project membership alone is not a grant.
- Other Initiatives may retain context and dependency references without control
  or duplicate completion credit.
- Pause and cancellation retain reservations. Explicit technical-approver release
  follows reconciliation. Loss of access holds control until access is restored.
  Administrator exceptions remain deferred.
- Synthetic local resources only; no external provider credentials, new account
  permissions, shared deployment, external publication or paid operations.

## Ordered deliverables and acceptance

1. **Qualified baseline and persistent manual drafts** — M3 (exact planning).
   Execute the recovered database baseline, preserve migration/proof bytes, add
   the v2 fixed local resolver, bounded validator, immutable persistence, policy,
   idempotency, audit/outbox and protected reads. Prove actual PostgreSQL migration,
   direct-SQL guards, rollback, replay, authority loss and concurrent writes.
2. **Minimal scope discovery** — M1/M3 (scope editing into planning).
   Implement the separate default-off eight-field v2 reader after draft
   qualification. Prove complete bounded lineage, no writes, uniform denial,
   fresh authority and concurrent-change fences.
3. **Manual Gate 2 and task control** — M3 (exact approval).
   Introduce an explicit successor contract/proof without altering historical
   pins. Persist exact approval and exclusive reservations atomically; prove
   role separation, competing Initiatives, retries, access hold and explicit
   reconciled release. Keep all automatic-effect authorities denied.
4. **Integrated native interaction** — M1/M3 (human review journey).
   Reconcile preserved UI input against the new APIs. Reuse the existing design
   system, typed clients and fail-closed states. Verify errors/loading/empty states,
   keyboard focus, responsive layout and real authenticated API interaction.
5. **Bounded pilot surfaces and operations** — M2/M6/R1 (manual local pilot).
   Add source-aware Today/decisions and product roadmap visibility within the
   documented MVP. Supply synthetic seeding, backup/restore, observable failures,
   disablement and an acceptance runbook. Report untested or blocked cases.

Each checkpoint records its local SHA, exact executed checks and remaining gates.
No release or runtime qualification is inferred from this plan.

## Tooling and verification status

GSD progress inspection found no `.planning` phase state in the restored checkout.
The existing roadmap remains authoritative; no phase numbering is invented.
Impeccable context resolved the incumbent Curve design system for frontend work.
Docker is available through the approved local execution path. The dedicated
test network and synthetic PostgreSQL/Valkey services reached healthy state.
Docker Desktop then denied the source bind mount under Documents with
`operation not permitted`; the application container did not start. No database
migration or API test ran. Operator authorization for Docker Desktop to read the
restored API directory is required before retrying. No alternative mount or
permission bypass was attempted; the temporary stack was removed.

The [Python preparation](../../experiments/manual-planning-v2-python/README.md)
(strict parser, exact schema/identity checks and deterministic inert validation)
passed 14 unittest methods with adversarial subcases and cross-language parity.
This is independent validation preparation, not backend completion. It stays
outside Plane's runtime inventory so the recovered source qualification remains
unchanged while PostgreSQL qualification is blocked.
