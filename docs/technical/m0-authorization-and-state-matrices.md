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

| Tool | Allowed transition/effect | Required checks |
| --- | --- | --- |
| `claim_slice` | Approved unclaimed slice to developer-claimed manual attempt | Assignment, Gate 2, dependency readiness, one active lease, version/idempotency. |
| `release_slice` | Active developer claim to released/available | Claim owner or authorized coordinator; no terminal attempt. |
| `heartbeat_attempt` | Refreshes lease observation only | Claim owner, active attempt, bounded rate. |
| `report_progress` | Appends safe progress observation | Claim owner, active attempt, no lifecycle inference. |
| `ask_question` | Creates attributed pending question | Claim owner, active attempt, permitted audience and safe content. |
| `complete_manual_attempt` | Marks developer work ready for VCS-reference validation | Claim owner; does not imply code, quality, draft, or readiness success. |
| `link_vcs_reference` | Adds a pending branch/head or MR/PR reference | Approved repository; trusted controller re-read; no direct VCS mutation. |

All other MCP writes are denied even if a client advertises them.
