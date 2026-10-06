# Manual Gate 2 and exclusive task reservations

Status: **qualified successor integrated in local source; default off**,
2026-10-06. Installed-source regression is being completed. This is newly authored
reconstruction, not recovery of the missing backend or production activation.

Plane preserves the prospective implementation at local commit
`8fc8e15fb36fa0a8aa7890b40971c8df814c0753`; integration is
`a69559f990c995f0d2c930306544979afd005d93`. The historical reader assertion was
adapted at `8aede16b4aee1aa66eb0b9469c4c849b34250f6e` to validate the immutable
reader proof followed by the separate exact Gate 2 successor.

The [domain model](domain-model.md) (immutable decisions and exact subjects),
[manual reconstruction contract](manual-planning-reconstruction-v2.md) (original
draft contract and preserved proof chain), [Gate 2 contracts](../../contracts/candidates/manual-gate2-v2/README.md)
(closed schemas and exact manifest), and [pilot delivery record](local-pilot-delivery-2026-10-06.md)
(authorized scope and remaining milestones) define the boundary.

## Exact subject and current authority

PREPARE freezes a currently valid saved draft: original definition/input identity,
validator receipt, exact approved PRD/evidence/scope, workflow, repository/base and
policy, risk tier, human gate assignments and proposed delivery issue identities.
Current native and protected-material access is reacquired for reads, commands and
original replay, including the original owners and reviewers. Client JSON cannot
supply an authority object or an alternate task set.

Only the current assigned TechnicalApprover can APPROVE, REQUEST_CHANGES,
RECONCILE or RELEASE. Creator/contributor authority can prepare a review but does
not approve it. A replacement draft before approval needs another PREPARE; after
the first approval, draft editing and pre-plan scope reopening stay closed, even
when the claims have subsequently been released.

Native Initiative state remains PLANNING. A separate manual control record moves
through PLAN_REVIEW, CHANGES_REQUESTED, MANUAL_APPROVED and RELEASED. No EXECUTING
transition, dispatch, provider action, repository write, model call, spending or
completion credit is authorized.

## Persistence and task ownership

Plane's `apps/api/plane/curve/manual_gate2_v2/` (single installed kernel, authority,
repository, protected reads, service and HTTP modules) adds four models and one
migration under a separate closed successor. Model registration/policy identity
and routes are the only replaced predecessor runtime sources; nine modules are
added. All 24 predecessor migration files remain byte-identical.

APPROVE commits the complete control/record/claim/history graph, Initiative version,
policy, audit, event, outbox and idempotency together. Claims are unique by
workspace, installation and stable native issue identity. Existing workspace and
sorted native issue locks serialize first acquisition; the database unique
constraint and deferred graph guards provide independent enforcement. Concurrent
commands either acquire the complete delivery set or leave no partial approval.
Same-workspace serialization is intentional; no throughput claim is made.

Pause and cancellation retain physical ACTIVE claims with an effective hold.
Access loss denies reads and commands while retaining ownership. Moving a native
issue to another project preserves its claim identity. Release must recheck that
project's explicit Product association and every current principal's access.
Context/dependency references confer neither control nor completion credit.

RECONCILE records the exact claim subset, generations, current native observations,
current approver and protected rationale. The rationale must explicitly attest
`no_unresolved_controlled_work=true`; started native work is rejected. RELEASE
requires the same current approver, rationale, claim subset/generations and
unchanged native fence. This is a human reconciliation attestation, not independent
proof of external completion. Partial release is explicit. Later acquisition
increments the generation; replaying an old successful approval never reacquires
or moves ownership. Replay returns its original receipt and current ETag with only
a fresh policy and NO_EFFECT audit.

## Frozen proof and database gates

| Identity | SHA256 |
| --- | --- |
| Manual predecessor proof | `b4f16de1a78f0ffb7f62df770f6fe2e50636da3961e22bb193ba5e914b87215b` |
| Scope-reader predecessor proof | `c2e37caa561e943bf4f2883c62d8ed889c74a55809fa1f5ffc93aed5d4ce093e` |
| Gate 2 successor proof | `34661219609b64ae715466aa7a20f756eb85a17365f30a3ab0d25a926f28c8ec` |
| Migration 0025 | `29f2864ec4f3670da8798ba5154d8591aecd8b7897de862e724a2901e67cbd13` |
| Physical catalog | `4d33761d55c0f0cb509af13a729cdb6a7479c7b8ca662fc843f856bce33adb08` |
| Contract manifest | `72877f8914391b231fe916853faed3c72f5d11456d154b1fe54d9ba6714b8387` |

Plane's `apps/api/plane/curve/manual_gate2_reconstruction_qualification_v2.json`
(exact runtime, model, migration and physical-catalog inventory) covers 144 modules
and 25 migrations. The loader validates each successor's declared delta and literal
pin; observed source/catalog hashes cannot grant permission. Existing predecessor
proofs and seals are preserved.

The catalog query adds constraint-name ordering to deterministically include all
composite foreign keys. Empty reversal restores the exact 0024 catalog and its
verifier. Retained Gate 2 evidence, including standalone NO_EFFECT audit, blocks
reversal. Disabling features retains records instead of rolling back migrations.

## Manual interface and protected input boundary

The typed client and panel are mounted in the Initiative workspace behind the
explicit build flag `VITE_CURVE_MANUAL_PLAN_V2_ENABLED=true`, signed-in identity
and PLANNING/PAUSED/CANCELLED lifecycle. The independent API setting
`CURVE_MANUAL_GATE2_V2_ENABLED` defaults to false; draft enablement and the workspace
allowlist are still required. No environment or workspace has been activated.

Preparation lists at most 25 already protected, qualified definitions. It creates
no grants or documents. Current material reads require fresh exact authorization.
The UI requires explicit review, separates prepared replacements from the saved
draft under decision, displays retained holds, and retains one uncertain command
in memory for deliberate identical retry. Focus, identity changes and errors clear
previously displayed protected material. The client validates closed responses,
ETag, scope, returned identity and material bytes/digests; the server remains the
authority.

Definitions/rationales must already be provisioned in the owner-only synthetic
catalog with exact grants for all original principals. There is no production
protected-storage/provider adapter or browser authoring editor in this delivery.

## Executed evidence and remaining acceptance

The final prospective PostgreSQL/API suite passed **23 tests in 359.34 seconds**:
20 Gate 2 cases and three adapted historical migration gates. It includes real
session/CSRF, complete positive SQL graphs, 20 omission/substitution attacks,
immutable mutation/truncate guards, independent-connection races, overlapping
Initiatives, release/reacquisition and original retry, access loss, native project
movement, changed definitions and exact proof/seal/model consistency.

The installed host suites passed **107 manual plus 31 scope tests**, including
12 pure Gate 2 transitions. Full application TypeScript and **380 web tests across
33 files** passed through normal dependency builds; the manual client/panel subset
contains 45 cases. Seven schemas compile and ten new contract tests verify the
manifest and malformed commands. Synthetic visual review has five desktop/mobile
captures, no JavaScript errors or overflow, and a bounded **ship** disposition.

Plane's `candidates/curve-manual-gate2-v2/VERIFICATION.md` (executed native, host,
web and visual evidence) and `qualification/reviewed-integration.json` within that
directory (exact pins and verification state) record installed-source results.
The full combined native suite and historical regression remain pending until their
final recorded results. An earlier combined run stopped at an obsolete reader
inventory assertion after 69 passes; that assertion now verifies both successors.
No runtime/proof bytes changed for the correction.

Authenticated real browser-to-backend acceptance, operational backup/restore,
production protected storage and full manual-pilot/R1 qualification remain open.
Synthetic screenshots and mocked browser transport cannot close those gates.
No deployment, new remote publication, activation or automatic execution occurred.
