# M0 Authorization and State Matrices

## Document control

| Field | Value |
| --- | --- |
| Status | `PROPOSED`; M0-03 security contract awaiting exact-head review |
| Version | 1.0 |
| Last updated | 2026-08-18 |
| Owner and reviewer | Federico Ocampo, CTO at X3M (`faocampo`) |
| Product source | [Curve PRD v0.8](../curve-ai-native-sdlc-prd.md) (product requirements, risk roles, and acceptance scenarios) |
| Machine contracts | [Core policy manifest](../../contracts/policy/core-policy-v1.json) (immutable action allowlist and deny precedence), [policy evaluation schema](../../contracts/schemas/policy-evaluation.schema.json) (safe evaluator input), and [policy decision schema](../../contracts/schemas/policy-decision.schema.json) (immutable decision output) |

## Authorization boundary

Every protected operation evaluates the authenticated actor, effective
principal, requested `workspace_id`, live Plane workspace membership, resolved
Curve roles, exact action, workspace-scoped resource metadata, object ACL,
classification, environment, assignment, risk tier, separation of duties,
target allowlist, and trusted-service authorization before loading a protected
body or invoking a side effect.

Plane owns authentication and workspace membership. Curve consumes the live
membership result and does not maintain an independent membership authority.
Later aggregate owners supply versioned approver assignments and object ACLs;
those values narrow the core action policy and cannot expand it. Provider
adapters add narrower rules only after their consuming decision is approved.

The evaluator returns one immutable result:

```text
ALLOW | DENY | REQUIRE_HUMAN_CONFIRMATION
```

M0 v1 actions produce only `ALLOW` or `DENY`. The third value is reserved for a
future approved policy version and exposes no protected projection.

## Safe evaluation order

| Order | Predicate | Deny code | Rule |
| --- | --- | --- | --- |
| 1 | Contract, manifest, and trusted time integrity | `POLICY_CONTEXT_INVALID` | Input schema, exact manifest byte digest, and caller-supplied trusted `evaluated_at` must pass; the pure evaluator reads no clock. |
| 2 | Feature enablement | `FEATURE_DISABLED` | Disabled Curve exposes no protected action. |
| 3 | Authentication and global actor ceiling | `UNAUTHENTICATED`, `AGENT_NOT_ALLOWED` | Actor must be authenticated; `AGENT` is globally rejected in v1. |
| 4 | Workspace equality and membership | `WORKSPACE_MISMATCH`, `INACTIVE_MEMBERSHIP` | Requested and resource workspace must match. A human requires active membership in that workspace; a non-human carries no Plane membership. |
| 5 | Exact action | `UNKNOWN_ACTION` | No wildcard, prefix, inferred, or prompt-supplied action exists. |
| 6 | Resource type and existence | `RESOURCE_TYPE_NOT_ALLOWED`, `RESOURCE_NOT_FOUND` | The exact type must be listed for the action. Lookup is workspace-scoped; absent and other-workspace IDs are indistinguishable and never trigger a global lookup. |
| 7 | Action actor type and effective principal | `UNSUPPORTED_PRINCIPAL` | Subject and effective principal must be allowed for the exact action and equal in M0. |
| 8 | Actor/role consistency and role floor | `ROLE_NOT_ALLOWED` | A human never carries `TRUSTED_SERVICE`; a service carries only `TRUSTED_SERVICE`; agent/system inputs carry no role. At least one resolved role must be action-allowed; ACL cannot repair a role denial. |
| 9 | Environment | `ENVIRONMENT_NOT_ALLOWED` | The exact environment must be listed. |
| 10 | Classification | `CLASSIFICATION_NOT_ALLOWED` | `UNKNOWN` becomes `RESTRICTED`; the normalized class must be listed. |
| 11 | Object ACL | `OBJECT_ACL_REQUIRED`, `OBJECT_ACL_DENIED` | Workspace/resource/version must match. Deny principal/role wins; allow entries only narrow. Required missing ACL denies unless the immutable action sets `owner_satisfies_acl=true` and exact owner metadata matches. |
| 12 | Assignment | `ASSIGNMENT_REQUIRED`, `ASSIGNMENT_MISMATCH` | Assigned actions require exact workspace/subject/version context plus the active human assignment and role. |
| 13 | Separation of duties | `SEPARATION_OF_DUTY_DENIED` | Risk-tier rules below must pass. |
| 14 | Target allowlist | `TARGET_ALLOWLIST_REQUIRED`, `TARGET_NOT_ALLOWED` | Context must match workspace; required empty lists deny; target comparison is exact. |
| 15 | Service authorization | `SERVICE_AUTHORIZATION_REQUIRED`, `SERVICE_AUTHORIZATION_INVALID`, `SERVICE_AUTHORIZATION_INACTIVE`, `SERVICE_AUTHORIZATION_EXPIRED` | Authorization ID/version, workspace, service, active state, exact action, issue time, and the input `evaluated_at` expiry comparison must match; non-service actors carry no service authorization. |
| 16 | External effect boundary | `EXTERNAL_EFFECT_NOT_ALLOWED` | Core v1 actions perform no provider/network external effect. |

All matched deny reasons are retained in the safe decision record in the
manifest's precedence order. An allow records only `POLICY_ALLOWED`. Public
error bodies expose a stable general Problem Details code rather than ACL,
owner, assignment, classification, or policy internals.

## Roles and source of authority

| Curve role | Source | Core meaning | Never inferred from |
| --- | --- | --- | --- |
| `WORKSPACE_MEMBER` | Active Plane `WorkspaceMember` for exact workspace | May evaluate member actions subject to ACL/classification/action rules | A globally known user ID or inactive membership |
| `PRODUCT_APPROVER` | Current versioned Gate 1 assignment | May decide PRD gate only when exact assignment, access, and separation pass | Plane admin/member role |
| `TECHNICAL_APPROVER` | Current versioned Gate 2 assignment or later policy-limited finding assignment | May decide Plan gate and permitted non-security findings | Plane admin/member role |
| `CODE_APPROVER` | Current versioned Gate 3 assignment | May decide Code Readiness for the exact governed subject | Repository membership alone |
| `PLATFORM_ADMINISTRATOR` | Versioned workspace/platform assignment implemented by its owning package | May administer approved provider configuration subject to exact target policy | Plane admin role by default |
| `TRUSTED_SERVICE` | Curve service identity plus exact unexpired service authorization | May execute only listed controller/compensation actions | Process location, hostname, or caller-supplied claim |

Only a `HUMAN` actor may hold an approver role. `SERVICE`, `SYSTEM`, and `AGENT`
cannot decide a gate, grant a waiver, reclassify a finding, or become a human
assignment. M0-03 implements the role vocabulary/resolver boundary; later
packages persist their own assignments.

## Core action matrix

The exact machine-readable values live in the
[core policy manifest](../../contracts/policy/core-policy-v1.json) (immutable v1
action allowlist and deny precedence). This table is the human-readable view.

| Action | Resource type | Actor/role floor | Classification/environment | ACL/assignment/target | Projection or effect |
| --- | --- | --- | --- | --- | --- |
| `CURVE.SHELL.VIEW` | `WORKSPACE` | Human active workspace member or assigned/admin role | `INTERNAL`; enabled local/staging/production | ACL N/A; no assignment/target | Workspace ID/slug and shell state |
| `CURVE.OPERATION.READ` | `OPERATION` | Human member/assigned/admin role or exact trusted service | Any known class; enabled environment | ACL required; service authorization when service | Safe Operation metadata only |
| `CURVE.OPERATION.CANCEL` | `OPERATION` | Same role floor as read | Any known class; enabled environment | ACL required; operation must separately be cancellable/current | No protected body |
| `CURVE.FOUNDATION_PROBE.START` | `WORKSPACE` | Human active workspace member or assigned/admin role | `INTERNAL`; `LOCAL` only | ACL/assignment/target N/A | Safe Operation metadata |
| `CURVE.OPERATION.TRANSITION` | `OPERATION` | Exact service with only `TRUSTED_SERVICE` | Any known class; enabled environment | ACL/assignment/target N/A; exact versioned service authorization | No body; domain transition/version guard remains authoritative |
| `CURVE.PROVIDER_CONNECTION.ADMINISTER` | `PROVIDER_CONNECTION` | Human `PLATFORM_ADMINISTRATOR` | Any known class; enabled environment | Optional narrowing ACL; exact non-empty target allowlist | No body; provider adapter remains unimplemented |
| `CURVE.GATE.DECIDE.PRD` | `ARTIFACT_VERSION` | Assigned human `PRODUCT_APPROVER` | Any known class; enabled environment | ACL, exact assignment, and risk separation required | No body |
| `CURVE.GATE.DECIDE.PLAN` | `EXECUTION_PLAN` | Assigned human `TECHNICAL_APPROVER` | Any known class; enabled environment | ACL, exact assignment, and risk separation required | No body |
| `CURVE.GATE.DECIDE.CODE_READINESS` | `PULL_REQUEST_SET` | Assigned human `CODE_APPROVER` | Any known class; enabled environment | ACL, exact assignment, and risk separation required | No body |
| `CURVE.FINDING.DISPOSITION.NON_SECURITY` | `REVIEW_FINDING` | Assigned human `TECHNICAL_APPROVER` | Any known class; enabled environment | ACL and exact assignment required; later quality policy must allow disposition | No body |

The manifest is a permission ceiling. Later manifests may add actions or narrow
an action after review; they cannot change core v1 bytes, remove a deny
predicate, allow an agent, or silently weaken an existing action.

## Object ACL precedence

Object ACL evaluation occurs only after safe resource metadata is found through
`(workspace_id, resource_id)`. The protected body remains unloaded.

1. Role/action denial is final; ACL cannot grant beyond it.
2. Exact principal deny wins over principal allow, role allow, and ownership.
3. Any matching role deny wins over any role allow and ownership.
4. For a required ACL, an exact allow-principal, allow-role, or accepted owner
   match is required after deny checks. Ownership applies only to an action with
   `owner_satisfies_acl=true`; v1 enables it only for Operation read/cancel.
5. For optional narrowing ACL, an absent ACL leaves the role result unchanged;
   a present ACL applies the same deny/allow rules.
6. An empty required ACL denies unless the owning service supplies exact owner
   metadata and the action explicitly supports ownership.
7. ACL entries from another workspace, unvalidated JSON, retrieved evidence,
   prompt text, or provider output are invalid context and deny.

## Separation of duties

| Risk tier | Required rule |
| --- | --- |
| `HIGH` | Product, Technical, and Code approvers are three distinct active humans. The Code Approver is absent from the material-contributor set of authors and operators. Missing/inactive/non-human assignments deny. |
| `STANDARD` | Duplicate gate humans deny unless an approved, current workspace policy-exception `ResourceRef` is supplied. Code-author/operator restrictions from the applicable workflow still apply. |
| `LOW` | Overlap is permitted only when the pinned workflow version explicitly sets `low_risk_overlap_allowed=true`; otherwise deny. |

An agent/service can neither occupy a gate assignment nor satisfy an overlap
exception. A risk increase invalidates the prior separation result and requires
re-evaluation.

## Classification and destination rules

| Input | Normalized class | Core behavior |
| --- | --- | --- |
| `INTERNAL` | `INTERNAL` | Evaluate exact action rules. |
| `CONFIDENTIAL` | `CONFIDENTIAL` | Evaluate exact action and ACL; projection remains named/minimized. |
| `RESTRICTED` | `RESTRICTED` | Evaluate only actions that explicitly list `RESTRICTED`; no core external effect exists. |
| Explicit `UNKNOWN` | `RESTRICTED` | Never infer a lower class. |
| Missing required classification | N/A | Invalid policy context denies before evaluation. |

Target allowlists are exact typed IDs. `REQUIRED` with an empty list denies. A
retrieved instruction, model response, provider callback, URL parameter, or
agent claim cannot add a target, destination, role, action, or classification
exception.

## Lookup and HTTP response matrix

| Condition | Resource query | Effect | HTTP projection | Audit |
| --- | --- | --- | --- | --- |
| Curve disabled | None | Deny | `404` for disabled Curve route | Safe disabled signal; no resource details |
| Unknown workspace slug | Plane workspace resolution only | Deny | Existing stable `404` | Redacted security signal; no workspace-scoped row is possible |
| Known workspace, inactive/nonmember human | Membership lookup only | Deny | Stable `403` at workspace boundary | Safe decision/audit in requested workspace |
| Authorized workspace, missing resource | `(workspace_id, id)` only | Deny/not found | `404` | Safe no-existence detail |
| Resource ID exists only elsewhere | No global fallback | Deny/not found | `404` | Safe cross-workspace probe when target workspace is known |
| Known in-workspace role/ACL denial | Safe metadata only | Deny | Stable `403` | Immutable decision plus denied audit |
| Allowed but stale aggregate version | Safe metadata and decision | No mutation | `412` | Decision plus no-effect audit |
| Allowed/current | Named projection or command only | Allow | Action-specific success | Decision linked from mutation audit |

## Decision and audit persistence

The [M0-03 relational contract](../../contracts/database/m0-03-policy-contract.md)
(physical decision record, transactions, migration, and rollback) defines the
append-only `PolicyDecision` row. Every decision contains exact action/resource,
subject/effective principal, effect/reasons, normalized classification, manifest
version/digest, canonical safe input digest, projection, trusted time, and
correlation ID.

Allowed mutations insert the decision, domain change, event/outbox, and
`AuditEvent` in one transaction. Denied operations insert only the decision and
safe denied audit. Any decision/audit persistence failure denies and rolls back
the protected operation.

## Operation transitions

Authorization passes before the domain transition guard. Passing policy cannot
make an invalid transition valid.

| From | Command/event | To | Additional preconditions |
| --- | --- | --- | --- |
| New | Create operation transaction | `PENDING` | Allowed exact action, unique idempotency key, feature enabled. |
| `PENDING` | Outbox accepted by relay | `QUEUED` | Matching workspace/operation/version; no terminal state. |
| `QUEUED` | Workflow running activity | `RUNNING` | Workflow ID matches operation; idempotent authorized service command. |
| `PENDING`, `QUEUED`, `RUNNING` | Authorized cancel | `CANCEL_REQUESTED` | Current expected version, ACL, actor/service authorization, and cancellable state. |
| `CANCEL_REQUESTED` | Workflow confirms cancellation | `CANCELLED` | Authorized service compensation and cleanup complete or unnecessary. |
| `RUNNING` | Successful terminal activity | `SUCCEEDED` | Expected version and workflow identity match. |
| `PENDING`, `QUEUED`, `RUNNING` | Non-retryable/exhausted failure | `FAILED` | Typed failure and safe evidence recorded. |

`SUCCEEDED`, `FAILED`, and `CANCELLED` are terminal. Same-key/same-request
idempotency replays the original response; changed request returns `409`; stale
version returns `412`; none changes state.

## Orca manual-attempt transitions

These later transitions remain governed by D-006 (Orca human-assistance client
decision) and D-007 (MCP trust, delegation, and action decision). M0-03 supplies
the generic authorization primitives only; it exposes no MCP capability.

| Tool/event | From | To/effect | Required checks |
| --- | --- | --- | --- |
| `claim_slice` | `READY` | `CLAIMED_ACTIVE`; create manual attempt/lease | Assignment, current Gate 2/plan, dependencies, repository, one active lease, version/idempotency. |
| `release_slice` | `CLAIMED_ACTIVE` | Attempt `RELEASED`; eligible slice returns `READY` | Claim owner/coordinator, current lease, no completion/controller mutation in flight. |
| Lease expiry | `CLAIMED_ACTIVE` | Attempt `EXPIRED`; eligible slice returns `READY` | Trusted clock/controller; audit and notification. |
| `heartbeat_attempt` | `CLAIMED_ACTIVE` | State unchanged; extend bounded lease | Claim owner, matching lease, active attempt, version, rate. |
| `report_progress` | `CLAIMED_ACTIVE` | State unchanged; append observation | Claim owner, active lease, monotonic sequence, safe content. |
| `ask_question` | `CLAIMED_ACTIVE` | Create attributed `OPEN` question | Claim owner, active lease, permitted audience, bounded content. |
| `complete_manual_attempt` | `CLAIMED_ACTIVE` | `COMPLETION_DECLARED` | Claim owner, active lease, no blocking question; no quality/readiness inference. |
| `link_vcs_reference` | Active/declaration state | `REFERENCE_VALIDATING` | Approved binding/head; trusted re-read; no MCP VCS mutation. |
| Trusted validation succeeds | Validating + completion | `CANDIDATE_AVAILABLE` | Repository/reference/head match approved slice. |
| Trusted validation rejects | `REFERENCE_VALIDATING` | Prior active/declaration state | Safe rejection; no draft/quality dispatch. |
| Authorized cancellation | Any nonterminal manual state | `CANCELLED` | Existing Curve authority revokes lease and fences late writes. |

`CANDIDATE_AVAILABLE`, `RELEASED`, `EXPIRED`, and `CANCELLED` are terminal for a
manual attempt. All unspecified tools and late writes deny.
