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

## Current Gate 2 integration checkpoint

The manual draft, separate scope reader and separate Gate 2 successor are now
installed in local Plane source. The UI is mounted behind an explicit default-off
flag. The [Gate 2 implementation](manual-gate2-reservation-candidate.md) (exact
manual review, exclusive task ownership, reconciled release, pins and limits)
records the current behavior. The checkpoints below remain historical evidence.

The prospective implementation at `8fc8e15fb36fa0a8aa7890b40971c8df814c0753`
passed 23 native tests. Integration is `a69559f990c995f0d2c930306544979afd005d93`;
`8aede16b4aee1aa66eb0b9469c4c849b34250f6e` adapts the historical reader inventory
assertion to verify the unchanged predecessor and exact installed successor.
Full application TypeScript, 380 web tests, 107 manual host tests and 31 scope host
tests pass. Combined installed PostgreSQL/API passes **100 tests in 1417.36 seconds**; all
**186 historical regressions pass in 525.07 seconds** at the same `8aede16` cut.

Protected-definition preparation and current material reads are implemented;
provisioning still uses the explicit owner-only synthetic catalog. The real
browser-to-backend journey, bounded Today/roadmap surfaces and operational pilot
acceptance remain open. No workspace, API feature or deployment is activated.

## Historical draft and scope verification checkpoint

GSD inspection found no local `.planning` phase state; the existing roadmap remains
authoritative. The qualified manual draft is now integrated into the restored
Plane runtime. Both historical proofs and all 23 historical migration bytes remain
intact. The new exact manual successor and migration are installed in source,
with four session/CSRF routes and an explicit default-off feature setting.
No workspace activation, deployment or publication is part of this checkpoint.

Plane's `apps/api/plane/curve/manual_plan_v2` (single Python draft runtime,
policy, resolver, worker, reads and HTTP), its additive migration and qualification
now include:

- A transient current-authority DTO from independently checked native actors,
  owners and reviewers; local monotonic observation counters with no native-version
  claim; exact per-object current grants and final authority fences.
- An atomic owner-only catalog producer adapter with compare-and-swap publication,
  retained original identities and revoked-principal tombstones.
- Semantic facts derived from exact protected synthetic PRD, workflow, quality,
  repository and repository-policy body bytes, compared with the fixed catalog.
- A structural trusted successor loader for the exact additive draft delta, then
  a distinct scope-reader successor. The manual and separate scope-reader successors are pinned after their
  independent PostgreSQL/API qualification.
- A pure Gate 2 transition kernel with exact subject, assigned approver, exclusive
  task claims, retained holds and reconciled release; no ORM or active writer.

The manual host suite passes **107 tests** after promotion, with a separate
**31-test scope-reader host suite**, including JavaScript parity, adversarial
material/catalog checks and **12 Gate 2 kernel tests**. Host ORM/service doubles
remain explicitly separate from actual database evidence. The prior Curve Python
experiment has been consolidated into the single Plane implementation; its
historical verification remains preserved without a second runnable copy.

The operator-authorized retry restored Docker access to the original read-only API
source mount. No alternate source mount or permission bypass was used. Actual runs:

| Check | Result / limit |
| --- | --- |
| Recovered PostgreSQL/API baseline | **186 passed**, including existing-project association, scope, exact PRD and reopening concurrency |
| Historical regression on proposed application | **186 passed** with the manual-draft switch disabled and the complete reviewed successor enforced |
| Frozen candidate SQL shape functions | **14 passed**, including valid fixtures and malformed/extra/missing field rejection |
| Linux validator | **6 passed**, including real jobs, CPU/memory/descriptor limits and cross-process slot behavior |
| Candidate DDL experiment | **1 passed**, declared delta and empty reversal restore the exact original catalog; no seal/proof/pin installed |
| Actual native authority | **13 passed**, original approved normalized PRD, selected evidence body/excerpt, current native and object access, stale ledger and monotonic producer refresh |
| Complete proposed application | **6 passed**, gated forward migration, exact loader/seals, SQL denial and model/migration consistency |
| Complete migration reversal | **3 passed**, exact empty reverse/forward and retained evidence refusal, including standalone NO_EFFECT audit |
| Proposed draft graph/API | **15 passed**, actual append/history/replay, session/CSRF, two first-head races, native/file final rollback and 16 direct-SQL graph omission/substitution cases |
| Installed-source runtime rerun | **57 passed**, comprising the 14 SQL, 6 installed-guard/model, 3 migration, 15 graph/API, 13 authority and 6 worker tests above, against the actual integrated source |
| Separate proposed scope reader | **23 passed**, real sessions, complete saved-empty lineage, zero writes, current native permissions, final rollback, SQL mutation denial and both actual PostgreSQL blocking orders |
| Historical regression after reader integration | **186 passed** at Plane `ebbd330`, with both new switches disabled |
| Combined installed source | **80 passed**, the 57 manual runtime tests plus all 23 scope-reader tests, with the two distinct successors enforced through the original source bind |
| Draft UI/client | **27 passed** with synthetic fetch mocks; candidate TypeScript check passed |
| Visual review | Five synthetic desktop/mobile captures; no JS errors or horizontal overflow; fresh review disposition **ship** for unmounted candidate |

Real execution found and corrected SQL alias ambiguity, an unintended timestamp
cast, migration-inspector search-path leakage and truncated bytecode writes under
the worker file-size ceiling. The real PRD bridge also exposed an incompatible
synthetic-only body requirement. The adapter now consumes the original approved
normalized bytes through a conservative single plain-text tab subset, preserving
the exact metadata, evidence snapshot and all access checks. Unsupported structures,
unparsed declarations and incomplete traceability fail closed.

The later proposed-application tests differ from the earlier DDL experiment.
They enforce a reviewed literal catalog pin and exact successor with the actual
production loader in disposable container storage. Their proof digest is
`sha256:b4f16de1a78f0ffb7f62df770f6fe2e50636da3961e22bb193ba5e914b87215b`.
Both historical proofs and all 23 historical migration bytes remain unchanged.
No unreviewed observed deployment is accepted as a proof. All 186 historical
regressions pass with the draft switch disabled. The exact tested bytes were then
moved into the restored application and the 57 runtime tests passed again through
the original read-only source bind. The duplicate candidate implementation and
assembly runner were removed; their history remains at Plane `27a16ae`.

The typed client and native-style draft panel are staged but unmounted. They clear
old data when user/context changes or access is rechecked, require exact headers
and closed bounded responses, show that drafts are unapproved, and retain the
same idempotency key for an explicit retry after an unknown save result. Protected
definition preparation and the real authenticated API/browser journey remain work.
The supplied visual captures do not establish backend or full-theme qualification.

The scope reader is now integrated as a distinct successor with its own default-off
setting. Its proof is
`sha256:c2e37caa561e943bf4f2883c62d8ed889c74a55809fa1f5ffc93aed5d4ce093e`.
The exact delta adds two modules and changes the URL module only; every model,
migration, catalog, writer and exclusion remains the manual predecessor's.
It returns eight contracted metadata fields and no task bodies or write authority.
Intact absence and saved-empty scope differ, while all bounded historical revision
metadata participates in the final consistency fence. The 23 real tests passed
before promotion at Plane `90996fb` and again within the combined 80-test installed
suite. All 31 host tests also passed after the move. The candidate copy was removed.
Its UI remains unmounted and protected-definition preparation is still pending.

## Ordered release gates

1. Real ORM PRD/evidence fixture and grants for all principals: verified in the
   disposable qualification application, preserving its actual approved body.
2. Producer/consumer generations, native/material fences and revoked access:
   actual transaction tests pass; host counter tests remain separate evidence.
3. Reviewed DDL and prospective literal pins: complete gated migration, empty
   reversal and retained-evidence refusal pass in the temporary application.
4. Real save, append, original replay with current ETag, protected history,
   graph rollback, raw-SQL attacks and independent-connection races pass.
   The complete historical regression also passes; the earlier DDL experiment
   alone does not provide these results.
5. The exact manual successor and one implementation are installed in local
   source, with every prior proof/migration byte preserved and the actual runtime
   suite passing. The separate scope-reader successor is also installed, with
   no new writers or storage, and the combined 80-test runtime suite passes.
6. Protected-definition preparation and the panel mount are implemented; full app
   TypeScript and 380 web tests pass. Authenticated native browser acceptance
   remains required; synthetic component and visual evidence are separate.
7. Gate 2 persistence is installed under its own exact successor with native locks,
   DB exclusivity, atomic approval, retained holds, reconciliation and generation-safe
   release/reacquisition. The prospective native suite passes 23 cases, the combined
   installed suite passes 100, and all 186 historical regressions pass.
8. Complete the bounded Today/decisions and roadmap surfaces, synthetic seeding,
   disablement, backup/restore, observable failure handling and full pilot runbook.

Plane's `candidates/curve-manual-plan-v2/PROMOTION.md` (exact ordered release
checklist) and `candidates/curve-manual-plan-v2/VERIFICATION.md` (executed evidence
and remaining acceptance limits) carry the implementation details. The
[Gate 2 candidate](manual-gate2-reservation-candidate.md) (installed manual writer, task ownership
and current evidence) remains a distinct successor to draft qualification.
No percentage, complete-recovery claim or R1 approval is inferred from these tests.
