# Curve M0 Completion Audit

## Document control

| Field | Value |
| --- | --- |
| Status | `AUDITED / M0 INCOMPLETE / LOCAL SKELETON ACCEPTED` |
| RUNTIME-M0-01 package status | `DONE_LOCAL` |
| Version | 1.13 |
| Date | 2026-09-01 |
| Product | Curve |
| Owner and human reviewer | Federico Ocampo |
| Audit scope | M0 (foundation and control plane), its P0 (foundation-readiness) decisions/proofs, Plane implementation evidence, and the next executable package |
| Audited Curve contract baseline | `030644db40e5a949ac02a193ad47b0c86f96dcab`, the squash merge of [Curve PR #65](https://github.com/faocampo/curve/pull/65) (RUNTIME-M0-01 exact human execution grant), containing the prior definition, authority decision, and fail-closed machine-dispatch contracts |
| Merged Plane `preview` baseline | `c516a612a29751b0d24bcbd32bfcba1bd73fe3af`, the squash merge of [Plane PR #15](https://github.com/faocampo/plane/pull/15) (deterministic Curve worker shutdown), containing the accepted M0-S9A checkpoint `af7187d049c6ee6d0c82a5c70b686d4c444e9b63`, M1-01A Initiative foundation, and [Plane PR #16](https://github.com/faocampo/plane/pull/16) (Critical/High CodeQL remediation) |
| Authority boundary | This audit records evidence and gaps. It authorizes no decision transition, code mutation, provider access, credential use, infrastructure change, deployment, or merge. |

## Audit outcome

The local M0 (foundation and control plane) vertical skeleton is implemented and
accepted through the M0-S9A Plane `preview` checkpoint
`af7187d049c6ee6d0c82a5c70b686d4c444e9b63`, and the same control path was
reverified on the current accepted descendant
`c516a612a29751b0d24bcbd32bfcba1bd73fe3af`. M0 (foundation and control plane)
as a whole remains incomplete because:

1. M0-04 (protected object storage and erasure) is blocked by D-009 (retention,
   backup, legal-hold, tombstone, and erasure decision).
2. M0-S9B (external provider transport and administration) is decomposed into
   six independently reviewable children, but every external-effect child
   remains blocked on its applicable identity, security, data,
   infrastructure, provider, owner, and budget decisions.
3. M0-S9C (Model Gateway routing and failover) is decomposed into five
   independently reviewable children, but remains blocked on D-004 (Curve
   Model Gateway decision), D-005 (model/provider data-policy decision), D-014
   (budget-policy decision), and D-009 (retention and erasure decision) where
   protected bodies would persist.

[RUNTIME-M0-01 implementation evidence](runtime-m0-01-implementation-evidence.md)
(accepted Plane head and merge, deterministic tests, live signals, CI,
security, cleanup, and rollback) records that the bounded worker-shutdown
correction is complete for `LOCAL_ONLY`. Generic Curve machine dispatch stays
fail closed until M4 (agent execution and sandbox milestone).

No broad M0 (foundation and control plane) completion claim is valid until the
remaining rows below satisfy their own completion boundaries.

## Baseline integrity

| Evidence | Result | Authority |
| --- | --- | --- |
| [Curve PR #29](https://github.com/faocampo/curve/pull/29) (M0-S9A provider-registry contract publication) | Approved head `075985a01dd2cac30423d7bc239407ef191da7a2` squash-merged as Curve `main` `7ea91188525c63d699e551910834f4602536f082`; exact-head and post-merge CI passed. | Canonical merged contract baseline |
| [Curve PR #31](https://github.com/faocampo/curve/pull/31) (M0-S9A dispatch-readiness reconciliation) | Approved head `22e7a7ac2335ec1f8fa64cbd25db5424a7a9254a` squash-merged as `b10f98e6f632fbd6efca94c418c151f40176395c`; CI passed. | Canonical dispatch-readiness baseline |
| [Curve PR #32](https://github.com/faocampo/curve/pull/32) (M0-S6A acceptance evidence) | Approved rebased head `f8a67dde19aaf1a9758e2a057012d6a4bda6f8bb` squash-merged as `58e9c95219bd191df96dcff6e3e554d06a28462e`; CI passed. | Canonical M0-S6A implementation evidence |
| [Curve PR #33](https://github.com/faocampo/curve/pull/33) (later-milestone decision-readiness packets) | Approved rebased head `f42d30412cd064a275577cea826fa5f3de250d9d` squash-merged as `72934b9b96420aa0df4ae7c0d5e1f85522003a18`; CI passed. | Canonical decision-preparation evidence; grants no decision or implementation authority |
| [Curve PR #35](https://github.com/faocampo/curve/pull/35) (M0-S9A policy-v2 contract correction) | Approved head `059e6e7b0185238f095c85e6a6b328accbaa5ecf` squash-merged as `13cec5e99889c68b885a57a8a98609885b1e27b3`; CI passed. | Prior merged policy-v2 baseline |
| [Curve PR #36](https://github.com/faocampo/curve/pull/36) (six-finding M0-S9A contract correction) | Approved head `737c52c52f6f8f8b5f59ec4c69450b2edcacea8d` squash-merged as `da44d27c3bde73b11640b165d3ddbca8451cd1f6`; both commits share Git tree `3596a70feecb6fd72f65e3394d7091141b3bbba8`; [Curve CI run 33181156641](https://github.com/faocampo/curve/actions/runs/33181156641) (contract and documentation validation) passed. | Accepted correction source; grants no Plane resumption authority |
| [Curve PR #37](https://github.com/faocampo/curve/pull/37) (M0-S9A post-correction lifecycle reconciliation) | Approved head `cf1ffb696b30f45e71a6edcaba062f67a3de7b8e` squash-merged as `e6e43ea7fdf99baf79922a4ae506bbcb73e7c4cb`; CI passed. | Canonical implementation contract and context source |
| [Curve PR #39](https://github.com/faocampo/curve/pull/39) (M0-S9A implementation-evidence reconciliation) | Approved head `05e759f6749861f3332bb124d5dca703f304726a` squash-merged as `03b26cdb576962fad8e2047fedcfafa2636bfc23`; CI passed. | Canonical post-implementation evidence |
| [Curve PR #40](https://github.com/faocampo/curve/pull/40) (M0-S9B/M0-S9C definition gates) | Approved head `8db2b1cbf29632c64b9498fb05925934d7ddd3ff` squash-merged as `02d383ada3941cdebc1939a1d7990f8ea7ff50d4`; CI passed. | Canonical definition packages and context source |
| [Curve PR #30](https://github.com/faocampo/curve/pull/30) (P0-12 retention-policy decision package) | Rebased head `b538d06c4e3392a574fafbef7184b24497c7d48b` squash-merged as `45590d356fa813a7407f624ee47d1c0ab3bc4cf2`; CI passed. | Historical M0 contract checkpoint; canonical fail-closed D-009 proposal and context source, without decision or implementation authority |
| [Curve PR #45](https://github.com/faocampo/curve/pull/45) (governance-baseline reconciliation and implemented physical ERD) | Squash-merged as `a1a34c142bc37bf331cc58056dba858851db9cbf`; CI passed. | Current governance, physical-schema, and accepted-preview reconciliation ancestor |
| [Curve PR #47](https://github.com/faocampo/curve/pull/47) (exact-preview local runtime refresh evidence) | Squash-merged as `a0d21bee7f98f2477d9cfe69708a8ac043c4fc69`; commit-bound documentation and contract CI passed. | Exact-preview runtime evidence checkpoint in the current baseline ancestry |
| [Curve PR #48](https://github.com/faocampo/curve/pull/48) (coding-agent task-packet contract hardening) | Reviewed head `b8e02b9579b0ab76daca2aaf04e44b521cd79f88` squash-merged as `68a05e9f2920454752e9039d596271dbb39d6e6e`; Documentation contracts CI passed. | Task-packet contract checkpoint in the current baseline ancestry; establishes non-circular packet publication, closed command grammars, and fail-closed implementation authority |
| [Curve PR #49](https://github.com/faocampo/curve/pull/49) (RUNTIME-M0-01 readiness definition) | Head `d837c84b6ce8945c16a3e3f8bed8cf2093f1d6f4` squash-merged as `c55686c8061f092f4f82ab73681e06f97d80893f`; Documentation contracts CI passed. | Current audited Curve baseline; defines the bounded shutdown correction and preserves fail-closed machine authority pending the follow-up owner decision |
| [Curve PR #50](https://github.com/faocampo/curve/pull/50) (RUNTIME-M0-01 manual-bootstrap decision) | Approved head `f8e2f4b3d497f747f9e8a3b7db7508510400bae9` squash-merged as `866032fa42e2cb57ad1a4e662d9561f742983f79`; Documentation contracts CI passed. | Approved Authority Option 3 and B-CODING-TOOLS-01 deferral checkpoint; the later one-attempt grant is now consumed |
| [Curve PR #65](https://github.com/faocampo/curve/pull/65) (RUNTIME-M0-01 exact human execution grant) | Head `624e9f105c167baf8fe0644a3822591988b1c047` squash-merged as `030644db40e5a949ac02a193ad47b0c86f96dcab`; Documentation contracts CI passed. | Consumed exact Plane implementation grant and canonical definition baseline |
| [Plane PR #10](https://github.com/faocampo/plane/pull/10) (M0-S6A durable orchestration implementation) | Approved head `af8335c42fa3c57e66f76c6ebd80220640630cf8` squash-merged as `ad5772c0565c934e64ea90f892be1374819979be`. Both commits resolve to Git tree `dde7e50afa1710b729ab86f9ed99e4c462c763d0`. | Canonical merged Plane baseline |
| [Plane API and Curve CI](https://github.com/faocampo/plane/actions/runs/32844162011) (M0-S6A API, Curve, replay, and migration validation) | Passed. | Accepted implementation evidence |
| [Plane CodeQL](https://github.com/faocampo/plane/actions/runs/32844164027) (M0-S6A security analysis) | Passed. | Accepted security evidence |
| [Plane copyright check](https://github.com/faocampo/plane/actions/runs/32844163453) (source-header compliance) | Passed. | Accepted licensing-hygiene evidence |
| [Plane PR #12](https://github.com/faocampo/plane/pull/12) (M0-S9A local provider-registry implementation) | Approved head `d48a7d09f6824f045a1077ce2de256bd3dcde5d4` squash-merged as `af7187d049c6ee6d0c82a5c70b686d4c444e9b63`; both commits resolve to Git tree `d43bdc22413627399f2232f1b17e2092d9e31cb1`. | Canonical merged Plane baseline |
| [Plane API and Curve CI run 33208175433](https://github.com/faocampo/plane/actions/runs/33208175433) (M0-S9A contracts, tests, migration drift, and lint) | Passed at the approved head. | Accepted implementation evidence |
| [Plane CodeQL run 33213223875](https://github.com/faocampo/plane/actions/runs/33213223875) (merge-bound Python and JavaScript security analysis) | Passed at the squash commit. | Accepted security evidence |
| [Plane copyright run 33213231056](https://github.com/faocampo/plane/actions/runs/33213231056) (merge-bound source-header compliance) | Passed at the squash commit. | Accepted licensing-hygiene evidence |
| [Plane PR #14](https://github.com/faocampo/plane/pull/14) (M1-01A Initiative backend foundation) | Squash-merged as `99a73b4eab5ee21fd012d7358bc9259252d47f71`, preserving the accepted M0-S9A checkpoint in its ancestry. | Current accepted Plane `preview` descendant used by the exact-preview local runtime refresh |
| [Plane PR #16](https://github.com/faocampo/plane/pull/16) (Critical/High CodeQL remediation) | Approved head `25500680cd610dd6de52ec37befa54752781cd0b` squash-merged as `b5d611ae77d5404e326f1ffa31694fbcead2cb94`; API, CodeQL, copyright, and exact-ref security gates passed. | Security prerequisite in the accepted Plane lineage |
| [Plane PR #15](https://github.com/faocampo/plane/pull/15) (deterministic Curve worker shutdown) | Exact rebased head `88921d95e8b5b997d2578a170fe79e260b61c8c2` squash-merged as `c516a612a29751b0d24bcbd32bfcba1bd73fe3af`; both commits resolve to Git tree `9bee343ffc7f9ba983bcef40a276f87553e8a342`. | Current accepted Plane `preview` descendant and RUNTIME-M0-01 completion |
| [Plane API and Curve CI run 33563636894](https://github.com/faocampo/plane/actions/runs/33563636894) (RUNTIME-M0-01 API lint, contracts, Curve tests, and migration drift) | Passed at exact head `88921d95...`. | Accepted implementation evidence |
| [Plane CodeQL run 33563639296](https://github.com/faocampo/plane/actions/runs/33563639296) (RUNTIME-M0-01 Python and JavaScript security analysis) | Passed at exact head `88921d95...`; exact-ref Critical/High count was zero. | Accepted security evidence |
| [Plane copyright run 33563642356](https://github.com/faocampo/plane/actions/runs/33563642356) (RUNTIME-M0-01 source-header compliance) | Passed at exact head `88921d95...`. | Accepted licensing-hygiene evidence |

## Requirement-by-package audit

| Package | Required outcome | Current evidence | Classification | Remaining action |
| --- | --- | --- | --- | --- |
| P0-01 (Plane community baseline) | Approved reuse/build and AGPL boundary | D-001 (Plane foundation, licensing, fork, and upgrade decision) plus accepted Plane inventory | `ACCEPTED` | Maintain upgrade and source-publication obligations per release. |
| P0-02 (runtime topology) | Local topology decided; non-local inputs explicit | D-003 (local runtime topology and trust-zone decision) plus private-platform connectivity amendment | `ACCEPTED_LOCAL` | Resolve staging/production activation inputs immediately before non-local use. |
| P0-03 (material-decision ADR set) | Every D-002 (Onyx delegation) through D-016 (KPI and rollout guardrails) decision approved or explicitly blocking its consumer | D-001 (Plane foundation) and D-003 (local runtime topology) are decided; [Curve PR #33](https://github.com/faocampo/curve/pull/33) (later-milestone decision-readiness packets) published the remaining owner packets | `IN_PROGRESS` | Obtain named-owner evidence and exact-revision decisions just in time; preserve fail-closed consumers. |
| P0-04 (documentation and contract validation) | Markdown, Mermaid, OpenAPI, schema, link, and semantic validation | Merged Curve validation suite and passing PR checks | `ACCEPTED` | Continue enforcing CI on every documentation/contract PR. |
| P0-05 (test strategy and audit closure) | Every PRD criterion mapped to package, suite, command, environment, and evidence | Accepted test matrix and semantic checks | `ACCEPTED` | Update traceability when requirements or owning packages change. |
| P0-06 (historical Temporal feasibility proof) | Retired standalone gates with executable replacement | D-003 (local runtime topology) makes M0-S3 (local Temporal round trip) the executable proof | `DONE_SUPERSEDED` | Preserve historical record; create no replacement standalone proof. |
| M0-01 (Curve module shell) | Additive, disabled-by-default, workspace-scoped Plane module | Accepted Plane implementation and migration evidence | `ACCEPTED` | None for local M0 (foundation and control plane). |
| M0-02 (core persistence) | Workspace-scoped records, immutable history, concurrency, and migration contracts | Accepted Plane implementation and M0-S2 (operation and delivery kernel) evidence | `ACCEPTED` | None for local M0 (foundation and control plane). |
| M0-03 (core authorization and policy) | Deny-by-default core policy, trusted-role derivation, separation, classification, and audit | Accepted Plane implementation through migration `0004_policydecision_recorded_at_default.py` | `ACCEPTED` | Add provider-specific policy only with its consuming decision and packet. |
| M0-04 (protected storage and erasure) | AccessEnvelope, object integrity, classification, retention, hold, tombstone, erasure, and backup behavior | D-009 (retention and erasure) owner workshop published in [Curve PR #33](https://github.com/faocampo/curve/pull/33) (later-milestone decision-readiness packets); [Curve PR #30](https://github.com/faocampo/curve/pull/30) (P0-12 machine decision package) is merged, validated, and remains `PROPOSED` | `BLOCKED_DECISION` | Named Security, Privacy, Legal, Platform Operations, Database Operations, and Curve Engineering approvers complete D-009; then materialize a separate M0-04 implementation packet. |
| M0-05 (delivery kernel) | Transactional outbox/inbox, idempotency, operation, audit, dead letter, and replay-safe relay | Accepted M0-S2 (operation and delivery kernel) implementation | `ACCEPTED` | Extend only through packet-bound destinations/consumers. |
| M0-06 (local Temporal skeleton) | Deterministic parent/child orchestration, signals, pause/resume, cancellation, replay, restart recovery, and Continue-As-New | [Plane PR #10](https://github.com/faocampo/plane/pull/10) (durable orchestration implementation) merged with identical approved/merge tree and green CI; [Curve PR #32](https://github.com/faocampo/curve/pull/32) (durable-orchestration acceptance evidence) is canonical on `main` | `DONE_LOCAL` | Keep provider dispatch, runner lifecycle, budget exhaustion, and full recovery qualification in M4-05 (slice dispatch workflow), M4-04 (trusted runner lifecycle), M6-05 (budget administration and capacity), and R1-03 (disaster-recovery exercise). |
| M0-07 (Operation API, SSE, and minimal UI) | Problem Details, ETag/If-Match, idempotency, pagination, resume, generated client, and Curve-first workspace page | Accepted M0-S4 (Operation API/SSE/minimal UI) implementation evidence | `ACCEPTED` | None for local M0 (foundation and control plane). |
| M0-08 (audit and observability) | Redacted logs/metrics/traces, dashboards, alerts, correlation, and local export-path health | Accepted M0-S5A (observability kernel) and M0-S5B (local observability binding) evidence | `ACCEPTED_LOCAL` | Qualify staging/production bindings before non-local activation. |
| M0-S9A (local provider-registry substrate) | Workspace-scoped connection/capability persistence, typed registry, fake adapter, synchronous reconciliation, bounded local delivery, and Option B authorization | [Plane PR #12](https://github.com/faocampo/plane/pull/12) (M0-S9A local provider-registry implementation) approved and merged; [M0-S9A implementation evidence](m0-s9a-implementation-evidence.md) (exact contract/context, implementation, CI, regression, dependency disposition, security boundary, and rollback) binds local acceptance. | `ACCEPTED_LOCAL` | None for the local synthetic substrate. Keep M0-09 open for M0-S9B and M0-S9C. |
| M0-S9B (external provider transport and administration) | Human administration, credentials/endpoints, callbacks, webhooks, scheduling, and real adapters | [M0-S9B task packet](m0-s9b-provider-transport-task-packet.md) (six independently reviewable children for administration, credentials/endpoints, callback ingress, outgoing webhooks, scheduled reconciliation, and named-provider activation) is published through [Curve PR #40](https://github.com/faocampo/curve/pull/40) (M0-S9B/M0-S9C definition gates) | `PREPARED_BLOCKED_DECISIONS` | Materialize only a child whose exact identity, security, data, infrastructure, provider, owner, budget, and external-effect decisions are approved. |
| M0-S9C (Model Gateway routing and failover) | Model/provider catalog, routing, failover equivalence, actual-route evidence, and no silent fallback | [M0-S9C task packet](m0-s9c-model-gateway-task-packet.md) (five independently reviewable children for candidate decisions/data policy, runtime contracts, policy/budget, OpenRouter transport, and failover/reconciliation) is published through [Curve PR #40](https://github.com/faocampo/curve/pull/40) (M0-S9B/M0-S9C definition gates); M0-S9C1A (candidate Model Gateway architecture and data-policy contracts) adds unselected D-004/D-005 proposals, closed schemas, fixtures, and empty fail-closed policy candidates | `PREPARED_BLOCKED_DECISIONS` | Decide D-004 (Curve Model Gateway decision), D-005 (model/provider data-policy decision), and D-014 (budget-policy decision), then materialize one runtime child at a time. D-009 applies before protected prompt or response persistence. |
| [RUNTIME-M0-01](runtime-m0-01-graceful-shutdown-task-packet.md) (graceful Curve worker shutdown classification) | Intentional `SIGINT`/`SIGTERM` is classified as graceful; independent worker/relay failure remains fail closed; cleanup is proven within the existing Compose deadline | [RUNTIME-M0-01 implementation evidence](runtime-m0-01-implementation-evidence.md) (accepted Plane head and merge, deterministic tests, live signals, CI, security, cleanup, and rollback) | `DONE_LOCAL` | Preserve the accepted evidence and keep full AC-58 disaster-recovery qualification in R1-03. |

## Next executable sequence

1. Merge the [RUNTIME-M0-01 implementation evidence](runtime-m0-01-implementation-evidence.md)
   (accepted Plane head and merge, deterministic tests, live signals, CI,
   security, cleanup, and rollback), then close
   [Curve issue #46](https://github.com/faocampo/curve/issues/46) (graceful
   worker-shutdown defect and acceptance criteria) and mark its Project item
   Done.
2. Complete D-009 (retention, backup, legal-hold, tombstone, and erasure
   decision) using the published P0-12 (retention-policy decision package), then
   materialize the separately reviewable M0-04 (protected object storage and
   erasure) task packet.
3. Materialize an M0-S9B (external provider transport and administration)
   child only after its applicable
   identity, security, data, infrastructure, provider, owner, budget, and
   external-side-effect decisions are approved.
4. Decide D-004 (Curve Model Gateway decision), D-005 (model/provider
   data-policy decision), and D-014
   (budget-policy decision) before materializing an M0-S9C (Model Gateway
   routing and failover) child.
5. Remediate the inherited High production dependency advisories recorded in
   [M0-S9A implementation evidence](m0-s9a-implementation-evidence.md)
   (dependency audit disposition) before pilot release.

## Completion-claim rule

The following narrower statements are currently evidence-backed:

- “Curve has an accepted local M0 (foundation and control plane) vertical
  skeleton through Plane M0-S9A checkpoint `af7187d…`, reverified on current
  Plane `preview` descendant `c516a61…`.”
- “M0-06 (local Temporal skeleton) is implemented, accepted, and closed for its
  defined local scope.”
- “M0-S9A (local provider-registry substrate) is implemented, accepted, and
  merged for its synthetic `LOCAL_ONLY` scope.”
- “RUNTIME-M0-01 (graceful Curve worker shutdown classification) is
  implemented, accepted, and merged for its `LOCAL_ONLY` scope.”
- “M0-S9B (external provider transport and administration) and M0-S9C (Model
  Gateway routing and failover) have validated, independently decomposed task
  packets; their external-effect children remain decision-blocked and
  unimplemented.”
- “Later milestone decisions have owner-ready packets on Curve `main` through
  Curve PR #33 (later-milestone decision-readiness packets); the decisions
  remain open.”

The statement “M0 (foundation and control plane) is complete” remains false
until the blocked and open packages in this audit reach their defined terminal
states or the governing PRD and development plan explicitly move them to a
later milestone through an approved architecture/product decision.
