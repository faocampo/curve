# Manual planning reconstruction v2 candidate

Current implementation evidence is recorded in the [local pilot record](local-pilot-delivery-2026-10-06.md)
(draft, scope-reader and Gate 2 integration) and [Gate 2 successor](manual-gate2-reservation-candidate.md)
(manual approval, exclusive reservations and reconciled release). The original
contract-first status below is historical; its frozen contract bytes are preserved.

Status: contract-first proposal, 2026-10-05. No backend writer, new migration,
runtime qualification, Gate 2 approval, task reservation or execution is delivered
by these contracts. The recovered Plane baseline remains
`7d4225d594adf984de1451f16ad2c8ab741c58eb`.

## Provenance and review boundary

[Recovered contract provenance](recovered-plane-contracts-2026-10-05.md)
(exact Plane consumer mirrors and preservation limits) records the available
association, C1, C2a and C2b bytes. Later manual-plan and scope-read implementations
are unavailable. This candidate is newly authored; it does not impersonate their
commits, definitions, fixtures, qualification hashes or historical test passes.

[Manual planning candidate](../../contracts/candidates/manual-planning-v2/README.md)
(file inventory and proposed HTTP routes) and
[scope discovery candidate](../../contracts/candidates/scope-editor-read-v2/README.md)
(separate eight-field read contract) are the review inputs. All new schema IDs and
routes use explicit v2 identities. Existing recovered endpoints keep their current
editions. There is no invented v1 compatibility alias.

Before implementation, review the closed schemas, inert plan definition, named
runtime delta, fixed synthetic resolver, source preservation and migration/seal
strategy. A JSON Schema or passing pure contract test is not a current authority
grant and does not qualify a database.

## Reference types and immutable policy profile

[Domain model, logical types](domain-model.md#2-logical-type-system) (the recovered
reference definition) specifies VersionRef as `{entity_id, version}` or
`{entity_id, digest}`. The recovered common schema has no VersionRef definition.
The new candidate-local common schema defines both closed branches and their
exclusive union. Immutable manual inputs deliberately use the digest branch.

VersionRef is distinct from ResourceRef (`resource_type`, `resource_id`, optional
`resource_version`) and ObjectRef (`object_id`, `digest`, `size_bytes`,
`media_type`). No extra fields, null policy references or caller-provided latest
pointer substitute for an exact immutable reference.

The fixed manual profile has its own new entity identity and version 1. It binds
three separate immutable model, tool and budget definitions by exact entity ID
and raw-byte digest. All automated model calls, automatic tool calls, controller
execution, dispatch, automatic spending, paid fallback and budget increases are
denied. This is not a financial allocation or a production budget-policy decision.
Human native tools still require their own current authorization.

Exactly three gates remain: PRD_APPROVAL, PLAN_APPROVAL and CODE_READINESS.
Risk separation and quality obligations are unchanged. This first candidate is
SDLC_MANUAL and STANDALONE only. It does not introduce repository-free planning,
non-code applicability or a Code Readiness waiver.

## Exact HTTP surface

All routes begin with
`/api/v1/workspaces/{slug}/curve/initiatives/{initiative_id}/`.

| Method | Suffix | Result |
| --- | --- | --- |
| POST | `manual-plan-drafts/v2/` | New immutable revision, or exact currently authorized replay |
| GET | `manual-plan-drafts/v2/current/` | Current protected revision without a known revision ID |
| GET | `manual-plan-drafts/v2/revisions/{revision_id}/` | Exact protected historical revision with original-input access |
| GET | `manual-plan-drafts/v2/status/` | Minimal authorized head/status recovery |
| GET | `scope-editor/v2/preconditions/` | Separately qualified minimal current scope discovery |

Existing session authentication and normal Django CSRF apply. No API-key grant,
provider registration, credential, environment-variable shortcut or capability
claim is introduced. Query parameters are unsupported. Every response is no-store.

For this new v2 edition, save explicitly selects the strong typed C1-style
Initiative If-Match value `"curve-initiative:{initiative_id}:vN"`, where N is a
positive safe integer. The target UUID must match the route. Weak, untyped numeric,
wildcard, multi-value, leading-zero and unsafe-integer headers are rejected.
The lost draft's report described a numeric format; this selection is new v2
behavior, not a claim of byte-level compatibility with that unavailable API.
Idempotency-Key is also required. Missing preconditions return 428; a visible
stale precondition returns 412. Closed-body/validation failures are 422, bounded
input overflow 413, state or command-identity conflicts 409, uniform unavailable
access 404, and unavailable qualified edition/validator 503. Resource ETags and
revision Locations are emitted only on authorized success, never on denials.
Error messages never
echo protected content, identities, provider diagnostics or filesystem paths.

New saves return 201, the exact immutable revision Location and the current
Initiative ETag. An exact currently authorized replay returns 200 with the original
revision and current ETag. It never substitutes the newest revision, rewrites the
request identity or emits another domain effect. Lost save responses are recovered
through current/status GETs. An absent or inaccessible current head has the same
fixed 404 response.

The status schema distinguishes ABSENT (null revision ID, expected revision zero)
from CURRENT or STALE (non-null existing head ID and positive revision). STALE is
advisory only after the status action's current authority has succeeded; it grants
no access to prior protected inputs and does not bypass unsupported lifecycle
states. A failed authority check returns the uniform denial, not a stale marker.

## Conservative pre-plan authority

The draft writer remains behind default-off trusted LOCAL/workspace/installation
gates. It requires an ordinary STANDALONE Initiative in PLANNING, active Product,
intact finite scope, exact approved scoped PRD and no pending reopening marker.
Current creator or explicitly resolved technical contributor plus the exact save
ACL is required. Read actions have their own exact ACLs. Active human membership,
all three current assignments, risk separation and material-source access are
rechecked; creator/admin status cannot override an explicit denial.

This reconstruction retains the documented conservative pre-plan C2a checks,
including exact current scoped-subject observations. It does not loosen them by
treating a changed native task observation as automatically acceptable. The
future Gate 2 distinction between normal task progress and historical approval
validity needs a separate reviewed control/history resolver. It is not silently
introduced into this draft replacement.

ProductApprover reopening preserves immutable drafts and invalidates their
current authority. A fresh scoped PRD must be submitted and approved. Old accepted
commands, original success results and draft inputs cannot authorize replacement
scope. No PLANNING pause/resume expansion is included. Unsupported paused/terminal
draft reads fail closed; cross-scope protected history remains unavailable.

## Strict parsing and canonicalization

The candidate reference implementation is
[manual-planning-v2.mjs](../../scripts/lib/manual-planning-v2.mjs)
(pure parsing, canonicalization and inert-definition checks). It has no database,
provider, runtime activation or command execution authority.

Accept strict UTF-8 JSON only. Reject BOM, duplicate keys including escaped-key
aliases, unpaired Unicode surrogates, non-finite numbers, unsafe integers, decimal
or exponent numeric tokens, negative zero, trailing data and unsupported values.
Command metadata is limited to 64 KiB inclusive before parsing. Protected plan
definition bytes are limited to 5 MiB inclusive, 32 container levels and 100,000
nodes, counting object keys and values. Reject unknown fields at every data object.

Canonical metadata uses UTF-8, Unicode-scalar key ordering, no insignificant
whitespace, well-formed strings, preserved array order and safe integer tokens.
It performs no Unicode normalization. Set-like arrays have explicit sorted/unique
semantic rules; canonicalization must not silently repair malformed data.
Metadata digests omit only the named top-level digest field. Protected object
digests cover the exact original bytes and are not replaced with a canonicalized
body digest. Raw manifest/schema/policy pins cover file bytes.

## Protected plan definition

The closed definition carries exact workspace/Initiative, approved subject,
manual profile, workflow, quality and scope-revision references. It requires 1–32
repositories, 1–256 one-repository slices and at most 4,096 typed dependency edges.
Repository identities, base branches/commits, repository policies and immutable
context inputs must match the fixed resolver's authorized original inputs.

Each slice declares user outcome, included/excluded work, known approved PRD
FR/AC traces, proposed delivery task references, components/interfaces, explicit
migration/compatibility impact, quality checks and inert verification instructions,
branch name, human owner and code approver, risk and rollback. Every required PRD
FR/AC and proposed-delivery task must be covered by at least one slice. A task may
support multiple slices; this proposal creates no reservation. Context-only scope
members cannot become proposed delivery through the plan body.

Repository and slice keys are unique and sorted; requirement/acceptance and
per-slice task-reference sets are sorted and unique. Every owner is currently
authorized, the code approver matches the assigned human, risk cannot be lower
than Initiative risk, and required quality checks cannot be removed. Traversal,
absolute component paths, NUL/control characters and unsafe branch forms fail
closed. This bounded edition requires exactly
`curve/<initiative-key>/<slice-key>` with lowercase letter/digit/hyphen keys.
An alternative repository branch policy needs a separately versioned contract.

Dependency endpoints must exist, cannot self-reference, and the whole graph is
acyclic. This bounded edition permits only the two condition pairs directly
supported by the recovered [PRD lifecycle](../curve-ai-native-sdlc-prd.md#slice-agent-quality-and-pr-states)
(slice states, provider-binding states and dependency defaults): EXECUTION_ORDER
requires predecessor VERTICAL_SLICE state DRAFT_ELIGIBLE from the pinned workflow;
MERGE_ORDER requires predecessor PR_MR_BINDING state MERGED, observed from VCS only.
MERGED is not a slice state, and the candidate cannot perform a merge.
PLANNING_ORDER, PLAN_APPROVED and other condition pairs are unsupported here.
Each condition names its aggregate type, observation source and exact workflow
reference; the fixed resolver must bind it to that workflow's qualified condition
catalog. A mere enum match does not grant authority. The immutable
`workflow-condition-subset-v2.json` (bounded condition pairs and exact normative
source hashes) records the source basis. Every condition is FUTURE_NOT_ASSERTED.
An optional artifact ObjectRef must match both the fixed resolver's allowed
dependency-artifact set and the retained protected original-input inventory;
it never means a future condition has already happened. This draft validator does
not dispatch, branch, run checks, merge, or execute instruction text.

## Original input identity versus current authorization

The private original-input receipt retains exact immutable approved PRD/body/
evidence/scope references, plan definition/profile, workflow, quality, repository
bases/policies/context, protected material versions/envelopes, owners and human
assignment identities. Require exactly one of each gate, in sorted gate-type
order, three unique assignment IDs and the required risk-tier human separation.
Context inputs retain their 500 MiB bound; ordinary attachments have a 100 MiB
bound. Its digest is persisted with the revision, not exposed in
the public revision DTO. A historical read resolves those same original inputs.
It cannot replace them with newer input identities sharing a subject ID.

Current ACL/classification/membership generations, source access, material-catalog
generation and final authority fence are a separate transient schema. They bind
the original-input digest but never replace it, and historical freshness values
never confer current permission. Reviewers and the acting human need current
access. Denial or missing original content fails closed.

The proposed runtime is the exact server-owned class
`plane.curve.manual_plan_v2.synthetic.SyntheticManualPlanResolverV2` (fixed local
fixture resolver). Require exact type identity; reject subclasses, duck-typed
objects, callback dictionaries and import paths supplied by callers. Configuration
contains bounded typed data under an owned local root, never executable callbacks.
Every file is resolved by opaque object identity; request JSON carries no path or
URL. No network, arbitrary Python import, eval, shell or provider operation is part
of this resolver. Privileged replacement of the trusted code remains outside this
candidate's threat model and cannot be solved through a self-hash.

Protected validation runs before database locks in a bounded ephemeral process:
15 CPU seconds, 30 wall seconds, 512 MiB address space, 32 descriptors and at most
two validators per API process. The worker emits only the closed validation
receipt bound to definition and original-input digests. Timeout, crash, malformed
output and interruption fail closed. The final local fence rechecks authority and
no-follow file identity/stat observations. Stat is not proof against privileged
out-of-band content replacement. No production protected-store qualification is
claimed.

## Planned persistence and qualification delta

[Qualification delta](../../contracts/candidates/manual-planning-v2/qualification-delta-v2.json)
(proposed exact additions and deliberately absent runtime hashes) names eleven new
manual-plan modules, replacement of only Curve model registration and route
registration, two additive models with exact planned column names, and distinct
`0024_manual_draft_reconstruction.py` (new draft storage and guards). The trusted
qualification loader is explicitly reviewed separately from recursive source pins.

One Initiative-owned head points to append-only revisions. Publication must
atomically commit head/revision, Initiative version, policy/audit, event/outbox
and completed idempotency. SQL guards independently reject partial/cross-identity
graphs and forbidden rewriting. Raw protected body bytes do not enter these rows.

The new proof follows the recovered association-read proof and retains original
C2b proof bytes, all 23 original migration files and their seals. It adds only the
named draft writer, retaining PLAN_APPROVAL, CONTROLLING_WORK_BINDING, EXECUTION
and COMPLETION_CREDIT exclusions. Counts in the delta are descriptive, never
authorization for arbitrary matching-size code inventories.

Before new DDL, verify the exact predecessor catalog, applied migrations and
historical seal. Preserve the original C2b coverage table, row and immutable
trigger. Add separate immutable current-seal storage and explicitly replace the
DB coverage verifier called by reopening guards. The application must independently
recompute the physical catalog from pinned SQL. Unknown structure, no-op verifier,
forged old/current seal or altered function/trigger/index/constraint denies use.

Current source/migration/catalog digests are null in this design delta because
the implementation and database proof do not exist. An executable loader must
reject this proposal as a qualification file. New runtime proof values can be
frozen only from reviewed source and real disposable PostgreSQL qualification.
There is no generic repinning command or observed-catalog approval shortcut.

A database claiming the unavailable historical 0024 or later structures is
unsupported; it requires a separately reviewed preservation/import path. Destructive
reversal refuses retained draft or related authority/audit/event/outbox/idempotency
evidence. Any permitted empty reversal must restore the exact predecessor catalog.
Disabling the feature never deletes history.

## Verification and remaining gates

Pure new schema/parser/definition tests cover closed nested objects, exact policy
references, private/current identity separation, strict numeric/Unicode parsing,
inclusive byte bounds, PRD traces, owners, risk, quality, paths, coverage, DAGs,
inert instructions and proposed proof exclusions. Imported mirror tests separately
verify original bytes, manifests, source provenance and linked historical tests.

The fresh cloud environment permits local preparation and pure checks, but creating
an AF_UNIX socket returns EPERM even through the single official review probe.
No PostgreSQL or Redis service was started. Django system checks passed and the
recovered 2,044-case suite collected with its three original Temporal-server
exclusions. Collection is not execution. No migration, physical catalog, DB race,
rollback, replay or backend aggregate qualification has run here.

A capable isolated environment must verify the recovered baseline, then implement
and prove the reviewed new writer. The separate scope reader follows only after
writer qualification. Typed clients/native UI require separate owned integration
work. Gate 2/control is a later contract with already recorded product decisions.
No automatic release, AI execution, provider activation or association END is
enabled by this reconstruction.
