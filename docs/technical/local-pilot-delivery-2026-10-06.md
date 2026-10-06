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

## Current implementation and verification checkpoint

GSD inspection found no local `.planning` phase state; the existing roadmap remains
authoritative. Current work is staged outside the recovered Plane runtime, whose
recursive source proof and all 23 migration bytes remain intact. No active route,
new installed proof, deployment or publication is part of this checkpoint.

Plane's `candidates/curve-manual-plan-v2` (single Python draft implementation,
additive migration, policy, resolver, worker, reads and HTTP) now includes:

- A transient current-authority DTO from independently checked native actors,
  owners and reviewers; local monotonic observation counters with no native-version
  claim; exact per-object current grants and final authority fences.
- An atomic owner-only catalog producer adapter with compare-and-swap publication,
  retained original identities and revoked-principal tombstones.
- Semantic facts derived from exact protected synthetic PRD, workflow, quality,
  repository and repository-policy body bytes, compared with the fixed catalog.
- A structural trusted successor loader for the exact additive draft delta, then
  a distinct scope-reader successor. Both successor pins remain unset.
- A pure Gate 2 transition kernel with exact subject, assigned approver, exclusive
  task claims, retained holds and reconciled release; no ORM or active writer.

The host suite passes **102 tests**, including JavaScript parity, adversarial
material/catalog checks and **12 Gate 2 kernel tests**. Host ORM/service doubles
remain explicitly separate from actual database evidence. The prior Curve Python
experiment has been consolidated into the single Plane implementation; its
historical verification remains preserved without a second runnable copy.

The operator-authorized retry restored Docker access to the original read-only API
source mount. No alternate source mount or permission bypass was used. Actual runs:

| Check | Result / limit |
| --- | --- |
| Recovered PostgreSQL/API baseline | **186 passed**, including existing-project association, scope, exact PRD and reopening concurrency |
| Frozen candidate SQL shape functions | **14 passed**, including valid fixtures and malformed/extra/missing field rejection |
| Linux validator | **6 passed**, including real jobs, CPU/memory/descriptor limits and cross-process slot behavior |
| Candidate DDL experiment | **1 passed**, declared delta and empty reversal restore the exact original catalog; no seal/proof/pin installed |
| Draft UI/client | **27 passed** with synthetic fetch mocks; candidate TypeScript check passed |
| Visual review | Five synthetic desktop/mobile captures; no JS errors or horizontal overflow; fresh review disposition **ship** for unmounted candidate |

Real execution found and corrected SQL alias ambiguity, an unintended timestamp
cast, migration-inspector search-path leakage and truncated bytecode writes under
the worker file-size ceiling. No complete installed draft migration, positive
save/replay graph or draft save race has yet been qualified.

The typed client and native-style draft panel are staged but unmounted. They clear
old data when user/context changes or access is rechecked, require exact headers
and closed bounded responses, show that drafts are unapproved, and retain the
same idempotency key for an explicit retry after an unknown save result. Protected
definition preparation and the real authenticated API/browser journey remain work.
The supplied visual captures do not establish backend or full-theme qualification.

The separate scope-editor candidate still has its **31 prior host tests**. It
returns only the eight contracted metadata fields with bounded lineage and fresh
access checks; its installed proof, real ORM reads and integrated UI remain pending.

## Ordered release gates

1. Build the real ORM positive fixture from the existing exact scoped PRD bridge,
   retaining the new synthetic PRD/evidence body bytes and grants for all principals.
2. Qualify producer/consumer generations, final native/material fences and revoked
   access in actual transactions; host counter and byte tests do not substitute.
3. Independently review expected DDL and prospective literal pins, then prove the
   complete gated forward migration, empty reversal and retained-evidence refusal.
4. Prove new save, append, original replay with current ETag, current/history denial,
   complete policy/audit/event/outbox/idempotency rollback, raw-SQL attacks and
   independent-connection save races. The DDL experiment is not that acceptance.
5. Finalize the exact manual successor, install one implementation, and preserve
   every prior proof/migration byte. Qualify scope-reader changes as a separate
   successor, with no new writers or storage.
6. Complete protected-definition preparation, mount the panel and run full app
   checks and an authenticated native browser journey.
7. Persist the Gate 2 kernel under its own successor: native task locks plus DB
   exclusivity, exact human approval, all-or-none claims, holds, reconciled release,
   generation-safe reacquisition and corresponding transaction/race/API evidence.
8. Complete the bounded Today/decisions and roadmap surfaces, synthetic seeding,
   disablement, backup/restore, observable failure handling and full pilot runbook.

Plane's `candidates/curve-manual-plan-v2/PROMOTION.md` (exact ordered release
checklist) and `candidates/curve-manual-plan-v2/VERIFICATION.md` (executed evidence
and remaining acceptance limits) carry the implementation details. The
[Gate 2 candidate](manual-gate2-reservation-candidate.md) (implemented pure domain
kernel and required persistence) remains separate from draft qualification.
No percentage, complete-recovery claim or R1 approval is inferred from these tests.
