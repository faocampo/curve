# M0-03 Core Policy Implementation Evidence

## Document control

| Field | Value |
| --- | --- |
| Status | `ACCEPTED_AND_MERGED` |
| Date | 2026-08-18 |
| Package | M0-03 (core authorization and policy kernel) |
| Human owner and reviewer | Federico Ocampo, CTO at X3M (`faocampo`) |
| Curve contract revision | `097016ffe2eb259cc780ad2a6cd41ca3422366b2` |
| Context digest | `sha256:113fcd3cf9795585a5db5a59e5d21965dd4e6ba9525fe5ea9d3bd4b15e546359` |
| Plane base | `eff8686a69aa112ea8fda79be0e1316dc1fd97d6` on `preview` |
| Plane approved head | `a807dd7a3f7b81f13ca815b165fba4f4bc068d9e` |
| Plane merge | `922dd6de5d5ed5081f35cd88343154022867ccad` on `preview` |
| Pull request | [Plane PR #4](https://github.com/faocampo/plane/pull/4) (M0-03 core policy implementation and review record) |
| Project tracking | M0-03 is `Done` in [Curve GitHub Project #2](https://github.com/users/faocampo/projects/2) (visual development tracker) |

## Accepted outcome

Plane PR #4 (M0-03 core policy implementation and review record) implements the
approved provider-neutral authorization kernel inside the additive
`plane.curve` Django application. The merged implementation provides:

- a deny-first evaluator using the immutable v1 policy manifest;
- trusted Plane workspace-membership resolution before workspace-child lookup;
- canonical policy-input digests with semantic-set normalization;
- immutable, workspace-scoped `PolicyDecision` records;
- linked safe `AuditEvent` evidence;
- separate authorized query and mutation paths;
- transaction-bound receipts for Operation creation and lifecycle transitions;
- atomic decision, domain mutation, event, outbox, and audit persistence; and
- fail-closed handling of invalid configuration, policy input, persistence, and
  response-projection order.

The implementation adds no Temporal, provider, VCS, deployment, protected-body,
model, MCP, or user-interface capability.

## Contract and source binding

The Plane implementation vendors the exact governed inputs selected by the
[M0-03 context manifest](https://github.com/faocampo/plane/blob/922dd6de5d5ed5081f35cd88343154022867ccad/apps/api/plane/curve/contracts/m0-03-context.json)
(exact Curve revision, Plane base, ordered paths, per-file digests, ownership,
and aggregate context digest). Its integrity checker passed at the approved
head; the squash-merge tree is byte-identical.

The approved implementation tree and squash-merge tree are identical:

| Revision | Tree SHA |
| --- | --- |
| Approved head `a807dd7...` | `a9ca8dd5c2758750b2966f9df3b9feacedcdfdf4` |
| Merge `922dd6d...` | `a9ca8dd5c2758750b2966f9df3b9feacedcdfdf4` |

## Verification evidence

| Verification | Accepted result |
| --- | --- |
| Contract/context integrity | Passed for the M0-S2 and M0-03 governed copies and digests |
| Ruff lint and format | Passed for 23 scoped Python files |
| Django system check | Passed |
| Migration drift | `makemigrations curve --check --dry-run` reported no changes |
| Reversible migration proof | Curve `0001 -> 0002 -> 0003 -> 0002 -> 0003` passed against a disposable PostgreSQL database; the disposable database was deleted |
| Focused policy/security suite | 63 passed |
| Complete Curve backend suite | 113 passed |
| Complete Plane backend suite | 629 passed; 92 pre-existing deprecation warnings; 0 failures |
| Monorepo checks | `pnpm check`: 60/60 tasks passed |
| Monorepo builds | `pnpm build`: 16/16 tasks passed |
| Patch hygiene | `git diff --check` passed; no credential/debug indicator was introduced |
| Runtime dependencies | Existing local Plane PostgreSQL, Valkey, RabbitMQ, and MinIO services were reused; no second persistent stack or non-local infrastructure was created |
| GitHub checks | The Plane fork reported no automated check suite for this branch; the accepted evidence is the reproducible local validation above and Federico Ocampo's exact-head approval |

## Security acceptance

The accepted suites cover cross-workspace denial, inactive/nonmember denial,
role and actor mismatch, ACL/classification/assignment/target validation,
trusted-service identity and expiry, canonical-digest stability, immutable
decision/audit binding, authorization-receipt forgery, projection ordering,
forced persistence failure, and transaction rollback. Invalid policy input and
missing trusted configuration fail closed without exposing protected resource
state.

## Compatibility and rollback

Curve remains disabled by default. The additive policy migration modifies only
Curve-owned tables. Operational rollback disables Curve and stops new Curve
commands while retaining inspectable safe records; source rollback uses a
reviewed revert. A persistent environment does not require a destructive
down-migration. The forward/backward/forward proof applies only to the disposable
migration database.

## Downstream effect

M0-03 (core authorization and policy kernel) now satisfies the authorization
dependency of M0-S3 (local Temporal round-trip implementation packet), M0-07
(public API and resumable-event work package), and other local packages that do
not require an additional material decision. Each consumer still pins its own
exact Plane base, Curve revision, context digest, owner, reviewer, scope,
commands, and rollback before implementation.
