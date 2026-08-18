# M0-03 Core Authorization and Policy Kernel Task Packet

## Document control

| Field | Value |
| --- | --- |
| Task ID | `CURVE-M0-03-CORE-POLICY` |
| Status | `READY_FOR_SECURITY_REVIEW`; Plane code dispatch is blocked until this exact packet head is approved and merged |
| Risk | `HIGH`; authorization and tenant-isolation control plane |
| Date | 2026-08-18 |
| Human owner and reviewer | Federico Ocampo, CTO at X3M (`faocampo`) |
| Implementer | AI coding agent; separate from human approval |
| Repository | `git@github.com:faocampo/plane.git` |
| Base branch | `preview` |
| Base SHA | `eff8686a69aa112ea8fda79be0e1316dc1fd97d6` |
| Feature branch | `curve/m0-03-core-policy` |
| GitHub Project item | `M0-03` in [Curve GitHub Project #2](https://github.com/users/faocampo/projects/2) (visual progress tracking for the core policy package) |
| Product trace | FR-043; NFR-009-NFR-012; AC-09, AC-35, AC-52 |

## Outcome

Implement one provider-neutral, deny-first Curve authorization kernel that:

- uses live Plane identity and workspace membership;
- evaluates exact action, effective principal, workspace, role, object ACL,
  classification, environment, assignment, risk-tier separation, target
  allowlist, and trusted-service authorization;
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
   deny precedence) is the v1 policy version. Unknown or missing actions and
   mismatched resource types deny.
4. `UNKNOWN` classification normalizes to `RESTRICTED`. ACLs and target
   allowlists can narrow permission but cannot broaden a role/action decision.
   ACL, assignment, target, and service-authorization contexts bind the exact
   workspace and owning resource/configuration version.
5. A policy-decision or denial-audit persistence failure fails the protected
   operation closed.
6. Provider-specific adapters and external-side-effect rules remain gated by
   their consuming ADRs and are outside this packet.

## Governed inputs

The implementation pins the exact merged Curve revision containing:

- [Curve PRD v0.8](../curve-ai-native-sdlc-prd.md) (product behavior, security requirements, and acceptance scenarios);
- [Architecture](architecture.md) (Curve components, trust boundaries, and PostgreSQL authority);
- [Security and operations](security-and-operations.md) (identity, tenant isolation, classification, and audit rules);
- [Domain model](domain-model.md) (workspace records, actor references, events, and audit entities);
- [M0 authorization matrices](m0-authorization-and-state-matrices.md) (deterministic role, ACL, assignment, separation, and response precedence);
- [M0-03 relational contract](../../contracts/database/m0-03-policy-contract.md) (physical decision record, transactions, migration, and rollback);
- [Core policy manifest](../../contracts/policy/core-policy-v1.json) (immutable v1 action allowlist and deny precedence);
- [Policy evaluation schema](../../contracts/schemas/policy-evaluation.schema.json) (safe evaluator input);
- [Policy decision schema](../../contracts/schemas/policy-decision.schema.json) (immutable evaluator output);
- [M0-S2 implementation evidence](m0-s2-implementation-evidence.md) (accepted Plane base, operation/delivery kernel, tests, and merge binding).

The context digest uses the repository's existing `curve-context-pack:v1`
algorithm over those paths at the exact merged Curve revision. Before code
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
   allowed for any resolved role, then the ACL cannot grant it.
9. **ACL precedence.** Given both allow and deny ACL matches, when evaluated,
   then deny wins. A required missing ACL denies unless exact owner metadata is
   accepted by the action contract.
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
    workspace, live active state, exact action, issue time, or expiry is missing
    or mismatched, or a Plane membership is supplied for the service, then it
    denies. A service never receives a human approver role. Human, system, and
    agent inputs carry no service authorization.
19. **Immutable evidence.** Given any policy decision, when it is recorded, then
    its positive sequence is unique and monotonic for the workspace/resource and
    `recorded_by` is a trusted `SERVICE` or `SYSTEM`, and `recorded_at` is not
    earlier than `evaluated_at`; when update/delete is attempted through model or
    queryset APIs, then it fails and the original row remains unchanged.
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
26. **Migration.** Given a disposable PostgreSQL database, when the new Curve
    migration runs forward, backward, and forward, then all steps pass and no
    existing Plane table or migration changes.
27. **Regression.** Given Curve disabled and enabled, when the complete Plane
    backend suite and repository checks run, then there is no repository-native
    regression.

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

M0-03 becomes `DONE` only after:

1. this exact packet head is approved and merged;
2. the Plane implementation starts from the pinned/reviewed base and contains a
   valid M0-03 context record;
3. every acceptance scenario and required command passes;
4. the implementation head receives Federico Ocampo's exact-head review and is
   merged into `preview`;
5. approved-head and merge trees are proven equivalent;
6. a post-merge evidence record updates M0 readiness and traceability;
7. GitHub Project M0-03 is moved to `Done` as visual metadata.
