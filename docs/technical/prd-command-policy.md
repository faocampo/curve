# PRD command authorization policy

## Candidate scope

The [PRD policy](../../contracts/policy/prd-policy-v1.json) (four action-specific
authorization rules) is an additive candidate with its own policy key and digest.
The [manifest schema](../../contracts/schemas/prd-policy-manifest-v1.schema.json)
(closed immutable policy contents) pins this edition. Existing core and Initiative
policies retain their original bytes, identities and behavior.

This candidate supplies the policy dependency for the
[external PRD command contract](../../contracts/database/external-prd-v1-relational-contract.md)
(asynchronous acceptance, exact subject, current authorization and atomic commit).
It enables no route, provider, protected storage or deployment. Activation remains
subject to the applicable integration and security evidence.

## Authority and separation

| Action | Required authority | Required object access |
| --- | --- | --- |
| `CURVE.PRD.SUBMIT` | Active human creator or explicitly authorized contributor | Creator ownership or current action-specific object ACL; explicit deny wins |
| `CURVE.PRD.APPROVE` | Current active human Product Approver | Explicit current action-specific object ACL |
| `CURVE.PRD.REQUEST_CHANGES` | Current active human Product Approver | Explicit current action-specific object ACL |
| `CURVE.PRD.REJECT` | Current active human Product Approver | Explicit current action-specific object ACL |

All four actions require exactly three active human assignments: Product,
Technical and Code Approver. Standard and High risk require three distinct humans;
an overlap-exception field never relaxes this rule. Low risk permits one person
to hold multiple assignments, while retaining all three active assignments.
General workspace membership or administrator status alone grants neither
contributor authority nor Product Approval authority.

The server derives actor, active membership, Initiative creator, current risk and
assignment identities from current same-workspace records. The trusted object
authorization source resolves ACL for the exact action, Initiative and aggregate
version. A read ACL cannot be silently reused as a submission or approval grant.
HTTP clients never supply roles, grants, membership flags or policy observations.

## Evaluation and commit boundary

Use the Initiative as the policy resource, including its current aggregate
version. ACL and assignment context must match that exact scope and version.
Record the policy identity/digest, action, safe input digest and decision identity.
Successful evaluation permits `NO_BODY`; it does not grant source, evidence,
checkpoint-body or rationale reads.

The command additionally validates its allowed Initiative state, expected version,
exact current checkpoint, displayed review fields, current provider/evidence
permission, readiness and protected-byte integrity. Capture these observations
outside database locks and revalidate current authority at the final commit fence.
A stored policy decision is historical evidence and cannot authorize replay.

An unavailable authorization source fails closed. Provider/service identities
cannot substitute for the authenticated human. Current access to all assigned
material evidence remains required independently of the metadata-only policy.

## Verification

Prove each action independently, creator and contributor submission, explicit
denial precedence, administrator and actor substitution, foreign/stale ACLs,
inactive membership, missing/duplicate/inactive/nonhuman assignments, strict
Standard/High separation, Low overlap, immutable policy loading and unchanged
legacy policy results. Authenticated endpoint and final-commit race tests remain
required when consuming command handlers are connected.
