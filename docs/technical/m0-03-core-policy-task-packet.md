# M0-03 Core Authorization and Policy Kernel Task Packet

## Document control

| Field | Value |
| --- | --- |
| Task ID | `CURVE-M0-03-CORE-POLICY` |
| Status | `COMPLETED`; Plane PR #4 merged approved implementation head `a807dd7a3f7b81f13ca815b165fba4f4bc068d9e` as `922dd6de5d5ed5081f35cd88343154022867ccad` |
| Risk | `HIGH`; authorization and tenant-isolation control plane |
| Date | 2026-08-18 |
| Human owner and reviewer | Federico Ocampo, CTO at X3M (`faocampo`) |
| Implementer | AI coding agent; separate from human approval |
| Repository | `git@github.com:faocampo/plane.git` |
| Base branch | `preview` |
| Implementation base SHA | `eff8686a69aa112ea8fda79be0e1316dc1fd97d6` |
| Accepted implementation | [M0-03 implementation evidence](m0-03-implementation-evidence.md) (exact contract/context, Plane head/merge, validation, security acceptance, and rollback) |
| Feature branch | `curve/m0-03-core-policy` |
| GitHub Project item | `M0-03` in [Curve GitHub Project #2](https://github.com/users/faocampo/projects/2) (visual progress tracking for the core policy package) |
| Product trace | FR-043; NFR-009-NFR-012; AC-09, AC-35, AC-52 |

## Outcome

Implement one provider-neutral, deny-first Curve authorization kernel that:

- uses live Plane identity and workspace membership;
- evaluates exact action, effective principal, workspace, role, object ACL,
  classification, environment, assignment, risk-tier separation, target
  allowlist, trusted evaluation time, and versioned trusted-service
  authorization;
- persists an immutable safe `PolicyDecision` and binds it to `AuditEvent`;
- denies unknown actions, missing required context, agents, empty required
  allowlists, cross-workspace references, and persistence failures;
- introduces no provider, VCS, model, MCP, Temporal, sandbox, deployment, or
  protected-object behavior.

## Material security decisions in this packet

Federico Ocampo's exact-head approval accepts these implementation choices:

1. M0-03 adds one append-only `PolicyDecision` table. `AuditEvent` references the
   exact decision; safe inputs are represented by a digest rather than copied
   policy context.
2. Plane remains the only authentication and workspace-membership authority.
   M0-03 creates no membership mirror, general role-assignment table, or object
   ACL table. Later aggregate packages own their versioned assignments/ACLs and
   supply them to the same evaluator.
3. The byte-pinned [core policy manifest](../../contracts/policy/core-policy-v1.json)
   (immutable action/resource allowlist, allowed roles/classes/environments, and
   reason precedence) is the v1 policy version. An allowed decision records only
   `POLICY_ALLOWED`; denied reasons use the manifest's ordered deny list.
   Unknown or missing actions and mismatched resource types deny.
4. `UNKNOWN` classification normalizes to `RESTRICTED`. ACLs and target
   allowlists can narrow permission but cannot broaden a role/action decision.
   ACL, assignment, target, and service-authorization contexts bind the exact
   workspace and owning resource/configuration/authorization version. Only the
   Operation read/cancel actions allow an exact owner match to satisfy a
   required ACL.
5. A policy-decision or denial-audit persistence failure fails the protected
   operation closed.
6. Provider-specific adapters and external-side-effect rules remain gated by
   their consuming ADRs and are outside this packet.
7. `CURVE_ENVIRONMENT` and `CURVE_POLICY_RECORDER_ACTOR_ID` are required trusted
   process configuration whenever Curve is enabled. They have no permissive
   default, cannot be supplied by a request, and invalid or absent values fail
   policy evaluation closed before resource projection.
8. Current M0 runtime metadata has one exact source: Workspace and synthetic
   foundation-probe resources are `INTERNAL`; an Operation is `INTERNAL` until a
   later reviewed aggregate contract adds persisted classification; Workspace
   ownership comes from `Workspace.owner_id`; Operation ownership comes from
   its validated `created_by`; Operation version comes from
   `aggregate_version`. Unmaterialized resource types have no runtime resolver
   and therefore cannot be authorized by M0-03.
9. Query authorization and mutation authorization use separate enforcement
   functions. A query persists its decision and one linked query audit before
   returning a named projection. An allowed mutation persists its decision,
   domain mutation, event/outbox, and linked result audit in one transaction.
   A permission class cannot pre-commit an allowed mutation decision.
10. Existing Operation mutation primitives become internal implementation
    functions. The only public Curve mutation entry points require an opaque,
    immutable in-process authorization receipt produced by the approved policy
    service for the exact action, workspace, resource, version, and transaction.
    Caller dictionaries, model instances, and serialized policy output cannot
    manufacture that receipt.

## Governed inputs

The implementation pins the exact merged Curve revision containing:

- [this M0-03 task packet](m0-03-core-policy-task-packet.md) (implementation scope, boundaries, acceptance tests, commands, and stop conditions);
- [Curve PRD v0.8](../curve-ai-native-sdlc-prd.md) (product behavior, security requirements, and acceptance scenarios);
- [Architecture](architecture.md) (Curve components, trust boundaries, and PostgreSQL authority);
- [Security and operations](security-and-operations.md) (identity, tenant isolation, classification, and audit rules);
- [Domain model](domain-model.md) (workspace records, actor references, events, and audit entities);
- [M0 authorization matrices](m0-authorization-and-state-matrices.md) (deterministic role, ACL, assignment, separation, and response precedence);
- [M0-03 relational contract](../../contracts/database/m0-03-policy-contract.md) (physical decision record, transactions, migration, and rollback);
- [Core policy manifest](../../contracts/policy/core-policy-v1.json) (immutable v1 action allowlist and deny precedence);
- [Core policy manifest schema](../../contracts/schemas/core-policy-manifest.schema.json) (machine-valid manifest structure and required action fields);
- [Policy evaluation schema](../../contracts/schemas/policy-evaluation.schema.json) (safe evaluator input);
- [Policy decision schema](../../contracts/schemas/policy-decision.schema.json) (immutable evaluator output);
- [Policy schema examples](../../contracts/schemas/examples/) (accepted and rejected core-manifest, evaluation, and decision examples);
- [Policy semantic fixtures](../../contracts/schemas/semantic-fixtures/) (accepted and rejected M0-03 evaluation and decision examples matching `policy-*.json`);
- [Context-pack module](../../scripts/lib/context-pack.mjs) (ordered governed paths and deterministic `curve-context-pack:v1` digest algorithm);
- [Contract validator](../../scripts/validate-contracts.mjs) (schema compilation, fixture expectations, and immutable v1 policy assertions);
- [M0-S2 implementation evidence](m0-s2-implementation-evidence.md) (accepted Plane base, operation/delivery kernel, tests, and merge binding).

The context digest uses the repository's existing `curve-context-pack:v1`
algorithm over those paths at the exact merged Curve revision. The fixture
input contains every core-manifest/policy-evaluation/policy-decision example and
every path matching `contracts/schemas/semantic-fixtures/policy-*.json` at that
revision. The context-pack module stores the explicit sorted path list and the
test suite proves that it covers the complete matching fixture corpus. Before code
dispatch, the coding agent records the revision, ordered paths, per-file byte
digests, aggregate context digest, owner, reviewer, Plane base, and packet ID in
`apps/api/plane/curve/contracts/m0-03-context.json` (implementation context
manifest recording exact Curve/Plane revisions, paths, digests, and ownership).
Any source or base change
requires a new digest and review disposition.

## Dependencies

| Dependency | State | Evidence |
| --- | --- | --- |
| D-001 (Plane foundation, licensing, fork, and upgrade decision) | Satisfied | Approved/merged Plane fork; current base descends from the accepted foundation. |
| M0-01 (Curve module shell and additive boundary) | Satisfied | Plane PR #2 merged at `7685bbc7cc5e1ab34f11e3912d9e47d31c365a9a`. |
| M0-02 (core aggregate persistence) | Satisfied | Plane PR #3 merged at `eff8686a69aa112ea8fda79be0e1316dc1fd97d6`. |
| M0-05 (transactional delivery kernel) | Satisfied | Same accepted Plane PR #3 merge and M0-S2 evidence. |
| D-003 (runtime topology and trust-zone decision) | Not applicable | This packet adds no Temporal/runtime/infrastructure capability. |
| D-007 (MCP trust-model decision) | Not applicable | This packet exposes no MCP capability. |
| D-009 (retention and erasure decision) | Not applicable to local implementation | Only synthetic input and minimum safe policy/audit metadata are persisted; protected bodies remain disabled. |
| Exact packet approval | Required | Federico approves the published Curve head and authorizes its merge before Plane code dispatch. |

## Scope

### In scope

1. Byte-pinned copy of the approved core policy manifest and schemas in the
   existing Plane Curve contract directory, plus an integrity check against the
   M0-03 context record.
2. Typed, immutable policy input/output value objects and enums.
3. A pure deterministic evaluator implementing the exact ordered contract.
4. Live Plane workspace-membership adapter that derives only
   `WORKSPACE_MEMBER`; no approver/platform role inference from Plane role
   numbers.
5. Append-only `PolicyDecision` model, migration, serializer, indexes, monotonic
   per-resource sequence allocation, trusted recording attribution, and check
   constraints.
6. Transaction helpers that bind allowed/denied policy decisions to immutable
   audit events and fail closed on persistence error.
7. A Curve-specific permission/authorization adapter for the existing Curve
   workspace shell and operation service boundaries. It queries authoritative
   Plane identity/membership, persists Curve policy/audit evidence, and replaces
   `WorkspaceMemberPermission` only on Curve routes; no new public Operation
   endpoint or non-Curve authorization change is allowed.
8. Unit, contract, database, migration, workspace-isolation, no-leakage, and
   forced-failure tests.
9. Trusted configuration parsing for exact Curve environment and recorder
   identity, with enabled-and-unconfigured startup/evaluation denial.
10. A single query-authorization service and a single mutation-authorization
    transaction wrapper, plus a private Operation mutation adapter that rejects
    direct or forged authorization receipts.

### Out of scope

- General role/assignment administration UI or persistence.
- Initiative, GateAssignment, ObjectAcl, AccessEnvelope, ProviderConnection, or
  protected-object lifecycle implementation.
- Onyx, MCP, Orca, OpenHands, model, VCS, quality, Temporal, gVisor, flag,
  preview, export, webhook, deployment, or network behavior.
- Provider-specific action policy or credential handling.
- New Curve user-facing screens or navigation.
- Changes to existing Plane authorization semantics outside Curve routes.

## Implementation boundaries

The coding agent may change only the dedicated `plane.curve` Django application,
its tests/migrations/contract copy, and the minimum Curve-specific test-stack
configuration required to run those tests. Existing Plane membership models and
permission classes are reused through an adapter and remain unmodified. No
frontend package change is expected.

The implementation separates:

1. pure policy types and evaluator with no Django/database import;
2. manifest loader/integrity validation;
3. Plane membership resolver;
4. workspace-scoped metadata lookup;
5. decision persistence/audit transaction service;
6. request/domain adapters.

### Trusted runtime sources

The policy context builder reads only these process-owned sources:

| Policy input | M0-03 authoritative source | Fail-closed behavior |
| --- | --- | --- |
| Environment | Required `CURVE_ENVIRONMENT`, exactly `LOCAL`, `STAGING`, or `PRODUCTION` | Missing, empty, or unknown value produces `POLICY_CONTEXT_INVALID`; no `DEBUG`, hostname, branch, or request-header inference |
| Recorder identity | Required `CURVE_POLICY_RECORDER_ACTOR_ID`; adapter constructs `SERVICE` ActorRef and callers cannot override it | Missing/empty value prevents decision persistence and protected action |
| Trusted evaluation time | One timezone-aware UTC `timezone.now()` read by the request/controller adapter before pure evaluation | Naive, caller-provided, or changed-during-evaluation time is invalid |
| Feature state | `CURVE_ENABLED` plus exact workspace-slug allowlist from the existing Curve configuration | Unknown workspace or absent allowlist entry denies without resource projection |
| Human identity | Authenticated Plane `User.id` | Anonymous or inactive user denies; request fields cannot replace it |
| Membership | Live active `WorkspaceMember` for exact `(workspace_id, user_id)` | Missing/inactive membership denies; Plane role 20/15/5 maps only to membership metadata and always resolves the single M0 role `WORKSPACE_MEMBER` |
| Workspace metadata | Plane `Workspace` selected by requested slug/id; owner is `HUMAN` ActorRef from `owner_id`; class is `INTERNAL` | Global child lookup and request-supplied owner/class are prohibited |
| Operation metadata | Curve `Operation` selected by `(workspace_id, operation_id)`; owner is validated `created_by`; version is `aggregate_version`; M0 class is `INTERNAL` | Missing/cross-workspace resource is non-disclosing; caller-supplied owner/version/class is prohibited |
| Manifest | Fixed packaged v1 bytes and byte digest | Missing or digest mismatch disables the policy service |

The recorder actor ID is a non-secret stable deployment identifier, not an
authentication claim. Human/service authentication and service-authorization
validation remain separate. The API and future Temporal worker use distinct
recorder IDs when they are distinct processes.

Only `WORKSPACE` and `OPERATION` have runtime metadata resolvers in M0-03.
Manifest entries for later aggregates are a permission ceiling and testable
policy vocabulary; their runtime evaluation returns `RESOURCE_NOT_FOUND` until
their owning package supplies a reviewed versioned resolver. Adding persisted
classification to Operation or enabling a non-`INTERNAL` M0 resource requires
a new contract version and migration review.

### Enforcement API and transaction ownership

The implementation exposes two policy-owned orchestration paths:

1. `authorize_query` builds trusted context, evaluates once, and in one short
   transaction inserts the immutable `PolicyDecision` plus exactly one linked
   `AuditEvent` with `ALLOWED` or `DENIED`. It returns an immutable named
   projection receipt only for `ALLOW`. The request caches that receipt by
   `(action, workspace_id, resource_ref, resource_version)` so repeated DRF
   permission/object checks cannot append duplicate decisions.
2. `execute_authorized_mutation` opens the transaction, locks the exact
   workspace-scoped aggregate where applicable, builds/revalidates trusted
   context, evaluates once, inserts `PolicyDecision`, and either records one
   linked denied audit with no mutation or invokes a private mutation callback.
   The callback receives an opaque `AuthorizedPolicyReceipt`; it applies the
   domain change and appends the linked DomainEvent/outbox/audit before commit.

The receipt is process-local, immutable, constructed only inside the policy
module, and binds decision ID, manifest digest/version, action, workspace,
resource ref/version, effect, projection, evaluated time, and active database
transaction. Reusing it after the transaction, for another action/resource/
version, or after an aggregate change fails closed. Serialized policy decisions,
request JSON, and plain mappings are never accepted as receipts.
The wrapper stores the exact receipt identity in a module-private `ContextVar`
only for the callback lifetime; private mutation adapters require object-identity
equality with that active value plus an active Django atomic block. The context
is reset in `finally`, including callback failure and nested-savepoint paths.

`CurveCorePolicyPermission` uses `authorize_query` for the current shell read.
It may derive identity and membership for a later mutation view but cannot
persist an allowed mutation decision. Future M0-S4 (API, SSE, and minimal
approved UI packet) mutation views must call `execute_authorized_mutation`.
`create_operation` and `transition_operation` are moved behind private adapters;
tests prove imports/calls that omit the exact receipt cannot mutate state.

For an allowed mutation that later fails an optimistic-version or state guard,
the same transaction retains the `ALLOW` policy decision and one linked
`NO_EFFECT` audit while applying no domain/event/outbox change. A database error
while recording any required decision/audit rolls the complete transaction
back. An allowed query that later encounters an internal rendering error retains
its already committed authorization audit and exposes no protected error detail.

The protected boundary maps the current shell and operation services to exact
actions: shell read to `CURVE.SHELL.VIEW`, local probe creation to
`CURVE.FOUNDATION_PROBE.START`, Operation read/cancel to their named actions,
and trusted worker lifecycle changes to `CURVE.OPERATION.TRANSITION`. The
transition action requires a `SERVICE` principal with only the
`TRUSTED_SERVICE` role and exact active, versioned service authorization.

No endpoint or service may implement a parallel authorization path. A protected
resource query accepts `workspace_id` as a mandatory predicate and never falls
back to a global ID lookup.

The policy-evaluation schema is an internal service boundary. Public request
bodies cannot contain or override resolved roles, membership, resource
workspace/owner, ACL, assignment, classification, target allowlist, service
authorization, manifest digest, or effective principal. `IsAuthenticated`
remains the outer authentication boundary on Curve routes; the Curve-specific
adapter produces the auditable membership/policy result before protected view or
domain behavior. Plane's generic permission classes remain unchanged for every
other route.

## Executable acceptance

1. **Feature disablement.** Given Curve is disabled, when any Curve action is
   requested, then the policy effect is `DENY`, no protected resource is loaded,
   and existing Plane behavior is unchanged.
2. **Anonymous actor.** Given no authenticated Plane user, when a Curve action is
   evaluated, then it denies and creates no domain side effect.
3. **Inactive membership.** Given an inactive or absent workspace membership,
   when a human evaluates an action, then it denies before protected metadata.
4. **Workspace isolation.** Given a workspace-A principal and a workspace-B
   resource ID, when the resource is requested through workspace A or B, then no
   global child lookup occurs, no existence/classification/ACL detail is exposed,
   and the safe probe is audited when the target workspace is known.
5. **Unknown action.** Given an action absent from the exact manifest, when it is
   evaluated, then it denies without wildcard/prefix fallback.
6. **Resource type/existence.** Given an action with a mismatched resource type,
   or a resource ID absent from the requested workspace, when evaluated, then it
   denies without a global child-ID lookup and without revealing whether that ID
   exists in another workspace.
7. **Agent authority.** Given any `AGENT` actor and any claimed role/ACL, when any
   core action is evaluated, then it denies with `AGENT_NOT_ALLOWED`.
8. **Role floor.** Given an ACL that names a principal, when the action is not
   allowed for any resolved role, then the ACL cannot grant it. A human cannot
   carry `TRUSTED_SERVICE`; a service carries exactly `TRUSTED_SERVICE`; an
   agent or system carries no role in the v1 input.
9. **ACL precedence.** Given both allow and deny ACL matches, when evaluated,
   then deny wins. A required missing ACL denies unless exact owner metadata is
   accepted by the action's immutable `owner_satisfies_acl=true` rule.
10. **Classification.** Given `UNKNOWN`, when evaluated, then the persisted
   decision classification is `RESTRICTED`. A classification absent from the
   action policy denies.
11. **Environment.** Given the foundation probe action in staging or production,
    when evaluated, then it denies and starts no Operation.
12. **Assignment.** Given a gate action without an exact active human assignment,
    or assigned to a different human, when evaluated, then it denies.
13. **High-risk separation.** Given `HIGH` risk, when any two gate roles share a
    human or the Code Approver is a material author/operator, then the gate action
    denies.
14. **Standard-risk separation.** Given `STANDARD` risk with overlapping gate
    assignments, when no approved exception reference exists, then it denies.
15. **Low-risk separation.** Given `LOW` risk overlap, when the workflow has not
    affirmatively allowed overlap, then it denies; an affirmative flag permits
    continued evaluation.
16. **Target allowlist.** Given an action whose target allowlist is required, when
    the list is empty or does not contain the exact target, then it denies.
17. **Workspace-bound context.** Given an ACL, assignment, target, or service
    authorization from a different workspace/resource/version, when evaluated,
    then it denies as invalid policy context before any protected projection.
18. **Trusted service.** Given a service actor, when authorization identity,
    authorization version, workspace, live active state, exact action, issue
    time, trusted evaluation time, or expiry is missing or mismatched, or a
    Plane membership/human role is supplied for the service, then it denies. A
    service never receives a human approver role. Human, system, and agent
    inputs carry no service authorization.
19. **Immutable evidence.** Given any policy decision, when it is recorded, then
    its positive sequence is unique and monotonic for the workspace/resource and
    `recorded_by` is a trusted `SERVICE` or `SYSTEM`, and `recorded_at` is not
    earlier than the exact trusted input `evaluated_at`; an allowed decision has
    only `POLICY_ALLOWED` and a denied decision contains only ordered manifest
    deny codes; when update/delete is attempted through model or queryset APIs,
    then it fails and the original row remains unchanged.
20. **Atomic allow.** Given an allowed mutation, when audit append fails, then
    the decision, domain mutation, DomainEvent, outbox item, and audit all roll
    back.
21. **Atomic deny.** Given a denied mutation, when the denial transaction commits,
    then exactly one decision and one `DENIED` audit event exist and no Operation,
    DomainEvent, outbox, inbox, or idempotency row is created.
22. **Fail closed.** Given the policy manifest digest is wrong or decision/audit
    persistence fails, when a protected operation is attempted, then it fails
    closed with a safe error and no protected data projection.
23. **No leakage.** Given every accepted/denied fixture, when database values,
    logs, exceptions, responses, and test artifacts are scanned, then they contain
    no protected body, credential, token, raw idempotency key, or unauthorized ACL
    detail.
24. **Authority-field injection.** Given a public Curve request containing
    caller-supplied role, ACL, assignment, classification, target, service
    authorization, manifest digest, or effective-principal fields, when the
    request is processed, then serializers reject body fields with stable
    Problem Details and request adapters never read authority-bearing query
    parameters; trusted resolved context remains unchanged.
25. **Curve permission integration.** Given an inactive/nonmember human calls a
    known enabled Curve workspace, when the request is evaluated, then the
    Curve-specific adapter denies before the view loads protected state and
    records one safe decision/audit pair; every non-Curve Plane route retains its
    existing permission behavior.
26. **Trusted lifecycle transition.** Given the local worker presents exact
    versioned service authorization for `CURVE.OPERATION.TRANSITION`, when the
    workspace, Operation, action, role, evaluated time, expected aggregate
    version, and domain transition all match, then the transition may proceed;
    any mismatch denies before mutation.
27. **Migration.** Given a disposable PostgreSQL database, when the new Curve
    migration runs forward, backward, and forward, then all steps pass and no
    existing Plane table or migration changes.
28. **Regression.** Given Curve disabled and enabled, when the complete Plane
    backend suite and repository checks run, then there is no repository-native
    regression.
29. **Trusted configuration.** Given enabled Curve with missing/unknown
    `CURVE_ENVIRONMENT` or missing `CURVE_POLICY_RECORDER_ACTOR_ID`, when a
    protected query or mutation is attempted, then it fails closed before body
    projection/mutation and records no falsely attributed decision. Given valid
    settings, request/header/body values cannot override them.
30. **Current resource authority.** Given Workspace or Operation context, when
    policy input is built, then owner, version, membership, feature state, and
    fixed M0 `INTERNAL` classification come only from the named authoritative
    records. Given a later unmaterialized resource type, runtime authorization
    cannot succeed even if its manifest action and caller-supplied metadata look
    valid.
31. **Single query decision.** Given DRF invokes permission checks more than
    once for one shell request, when the request completes or denies, then one
    `PolicyDecision` and one linked query `AuditEvent` exist, and the view can
    receive only the permitted named projection.
32. **Atomic mutation authorization.** Given an allowed Operation create or
    transition, when the private callback succeeds, then decision, mutation,
    DomainEvent/outbox, and linked result audit commit together. Given denial or
    persistence failure, none of the protected mutation records commit. Given a
    post-authorization state/version failure, the allowed decision and one
    linked `NO_EFFECT` audit commit with no domain/event/outbox change.
33. **Bypass resistance.** Given direct calls to the prior Operation mutation
    functions, a plain mapping/model/serialized decision, an expired receipt, a
    receipt from another transaction, action, workspace, resource, or version,
    or a forged receipt-like object, when mutation is attempted, then it fails
    before database change and leaves no orphan decision/audit.

## Required commands

Run from the Plane repository root at the exact implementation head:

```text
git diff --check
node apps/api/plane/curve/contracts/check-integrity.mjs
docker compose -f docker-compose-test.yml run --rm --build api-tests pytest plane/curve/tests -m "unit or contract or migration or rollback"
docker compose -f docker-compose-test.yml run --rm api-tests pytest plane/curve/tests -k "policy or authorization or acl or classification or separation or workspace"
docker compose -f docker-compose-test.yml run --rm api-tests python manage.py makemigrations --check --dry-run
docker compose -f docker-compose-test.yml run --rm api-tests python manage.py migrate curve zero
docker compose -f docker-compose-test.yml run --rm api-tests python manage.py migrate curve
docker compose -f docker-compose-test.yml up --build --abort-on-container-exit --exit-code-from api-tests
pnpm check
pnpm build
```

The implementation PR records exact test counts, migration names/SQL, elapsed
time, environment, base/head SHAs, and any skipped test with reason. A command
may be adapted only when the repository proves the documented command is stale;
the packet and review record must be updated before acceptance.

## Data, tools, and budget

| Control | Value |
| --- | --- |
| Allowed data | Synthetic `INTERNAL` fixtures and minimum non-sensitive local policy/audit metadata |
| Protected data | Prohibited |
| External network | Dependency/build access already required by the repository; no provider call |
| Credentials | Existing local test-stack credentials only; no production/provider/VCS credential in code or fixtures |
| Model use | Implementation assistance only; no runtime model and no model-generated evidence accepted as test proof |
| Sandbox | Repository worktree and existing Plane Docker test stack |
| Time/resource limit | Existing CI/test limits; no long-running service or infrastructure resource |
| Cost authorization | US$0 external service spend |

## Stop conditions

The coding agent stops before mutation when:

- the exact approved/merged Curve revision or context digest is absent;
- `origin/preview` differs from the pinned base without a reviewed descendant;
- the manifest, schema, or relational contract conflicts;
- implementation would require changing Plane membership semantics or a
  non-Curve route;
- enabled execution lacks exact trusted `CURVE_ENVIRONMENT` or
  `CURVE_POLICY_RECORDER_ACTOR_ID` configuration, or code infers either value;
- a runtime resolver would authorize a resource type other than current M0
  `WORKSPACE` or `OPERATION`, or would accept caller-owned authority metadata;
- a public/direct mutation path can execute without the policy module's exact
  transaction-bound receipt;
- implementation requires provider, network side effect, protected storage, or
  unresolved D-003/D-007/D-009 behavior;
- a test requires real X3M data or credentials;
- a migration would modify an existing Plane table;
- any ambiguity changes tenant isolation, role precedence, classification,
  separation of duties, audit persistence, or failure posture.

## Rollback and disablement

Before shipment, disable Curve, stop new Curve commands, preserve safe audit
evidence, revert the implementation PR, and reverse the M0-03 migration only in
the disposable rollback database. The persistent local Plane stack proves that
feature disablement plus service restart leaves existing Plane behavior
unchanged without destructive down-migration. Later shipped rollback uses an
additive compensating migration under D-009 (retention, backup, legal-hold,
tombstone, and erasure policy).

## Completion evidence

M0-03 is `DONE`. The completion conditions were satisfied as follows:

1. Curve PR #7 merged this approved packet and its policy contracts.
2. The implementation started from reviewed Plane base `eff8686a...` and
   recorded context digest `sha256:113fcd3c...`.
3. The accepted validation is recorded in [M0-03 implementation evidence](m0-03-implementation-evidence.md)
   (exact contract/context, tests, migration proof, security evidence, and rollback).
4. Federico Ocampo approved Plane head `a807dd7...`; Plane PR #4 merged it into
   `preview` as `922dd6d...`.
5. The approved and merged trees both equal `a9ca8dd5...`.
6. M0 readiness and downstream traceability are updated by the dispatch-readiness
   revision containing this record.
7. GitHub Project M0-03 is `Done` as visual metadata.
