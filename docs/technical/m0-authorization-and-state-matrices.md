# M0 Authorization and State Matrices

## Authorization evaluation

Every command evaluates the authenticated actor, effective principal, `workspace_id`, workspace membership, Curve role, object ACL, classification, assignment, risk tier, requested action, current aggregate version, and enabled environment policy before loading a protected body or invoking an external system.

Objects are queried through a mandatory workspace scope. A caller receives `404` for an object outside the authorized workspace boundary and `403` for a known in-workspace object whose action is denied. Denials append safe audit metadata without leaking the object's protected fields.

## M0 roles

| Action | Workspace member | Product approver | Technical approver | Code approver | Platform administrator | Trusted service | Agent |
| --- | --- | --- | --- | --- | --- | --- | --- |
| View enabled Curve shell | Allow | Allow | Allow | Allow | Allow | N/A | Deny |
| Read own permitted operation | Allow | Allow | Allow | Allow | Allow | Allow by service policy | Deny |
| Start local foundation probe | Local-only allow | Local-only allow | Local-only allow | Local-only allow | Local-only allow | Deny | Deny |
| Cancel own permitted operation | Allow when cancellable | Allow when cancellable | Allow when cancellable | Allow when cancellable | Allow when cancellable | Allow only for approved workflow compensation | Deny |
| Administer provider connection | Deny | Deny | Deny | Deny | Allow | Deny unless executing an approved admin command | Deny |
| Approve a gate | Deny unless assigned | Allow only when assigned to Gate 1 | Allow only when assigned to Gate 2 | Allow only when assigned to Gate 3 | Deny unless separately assigned and policy permits | Deny | Deny |
| Grant waiver/reclassify finding | Deny | Deny | Policy-limited non-security only | Deny | Deny | Deny | Deny |

The foundation probe is absent outside local development. Role overlap and separation-of-duty policy are evaluated per initiative in later milestones; no service or agent may act as a human approver.

## Operation transitions

| From | Command/event | To | Preconditions |
| --- | --- | --- | --- |
| New | Create operation transaction | `PENDING` | Authorized action, unique idempotency key, feature enabled. |
| `PENDING` | Outbox accepted by relay | `QUEUED` | Matching workspace/operation/version; no terminal state. |
| `QUEUED` | Workflow running activity | `RUNNING` | Workflow ID matches operation; idempotent activity command. |
| `PENDING`, `QUEUED`, `RUNNING` | Authorized cancel | `CANCEL_REQUESTED` | `If-Match`/expected version is current; operation is cancellable. |
| `CANCEL_REQUESTED` | Workflow confirms cancellation | `CANCELLED` | Cleanup complete or no cleanup required. |
| `RUNNING` | Successful terminal activity | `SUCCEEDED` | Expected version and workflow identity match. |
| `PENDING`, `QUEUED`, `RUNNING` | Non-retryable or exhausted failure | `FAILED` | Typed failure and safe evidence recorded. |

`SUCCEEDED`, `FAILED`, and `CANCELLED` are terminal. A duplicate command with the same idempotency key returns the original status and response. Reuse of a key with a different canonical request returns `409`. A stale expected version returns `412` and never changes state.

## Orca manual-attempt transitions

| Tool/event | From | To/effect | Required checks |
| --- | --- | --- | --- |
| `claim_slice` | `READY` | `CLAIMED_ACTIVE`; create manual attempt and bounded lease | Assignment, current Gate 2/plan, dependencies, one repository, one active lease, version/idempotency. |
| `release_slice` | `CLAIMED_ACTIVE` | Attempt `RELEASED`; slice returns to `READY` if still eligible | Claim owner or authorized coordinator; current lease; no completion declaration or controller mutation in flight. |
| Lease expiry | `CLAIMED_ACTIVE` | Attempt `EXPIRED`; slice returns to `READY` if still eligible | Trusted clock/controller; no client-supplied time; audit and notification. |
| `heartbeat_attempt` | `CLAIMED_ACTIVE` | State unchanged; extend bounded lease | Claim owner, matching lease ID, active attempt, monotonic aggregate version, bounded rate. |
| `report_progress` | `CLAIMED_ACTIVE` | State unchanged; append safe progress observation | Claim owner, active lease, monotonic client sequence, no lifecycle inference. |
| `ask_question` | `CLAIMED_ACTIVE` | State unchanged; create attributed `OPEN` question | Claim owner, active lease, permitted audience, bounded/redacted content. |
| `complete_manual_attempt` | `CLAIMED_ACTIVE` | `COMPLETION_DECLARED` | Claim owner, active lease, no open blocking question; does not imply code, quality, draft, or readiness success. |
| `link_vcs_reference` | `CLAIMED_ACTIVE` or `COMPLETION_DECLARED` | `REFERENCE_VALIDATING` while trusted validation runs | Approved repository binding; exact branch/MR/PR plus head SHA; controller re-read; no MCP VCS mutation. |
| Trusted validation succeeds | `REFERENCE_VALIDATING` with completion declared | `CANDIDATE_AVAILABLE` | Repository/reference/head all match the approved slice; controller evidence is current and attributable. |
| Trusted validation succeeds before completion | `REFERENCE_VALIDATING` | Return to `CLAIMED_ACTIVE` with valid reference recorded | Developer must still declare completion; no quality/readiness inference. |
| Trusted validation rejects | `REFERENCE_VALIDATING` | Return to previous active/declaration state with safe rejection | No draft or quality dispatch; developer may submit a new version-checked reference. |
| Authorized cancellation | Any nonterminal manual state | `CANCELLED` | Existing Curve cancellation authority, not an Orca-only capability; revoke lease and fence late writes. |

`CANDIDATE_AVAILABLE`, `RELEASED`, `EXPIRED`, and `CANCELLED` are terminal for the manual attempt. A new attempt is required after release, expiry, or cancellation. All other MCP writes and all late writes to terminal attempts are denied even if a client advertises them.
