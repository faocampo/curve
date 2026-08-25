# M0-S9A Provider Registration Authorization Decision

## Document control

| Field | Value |
| --- | --- |
| Status | `APPROVED_OPTION_B / PENDING_EXACT_CONTRACT_PUBLICATION` |
| Date | 2026-08-25 |
| Decision owner | Federico Ocampo, X3M CTO |
| Decision | Plane workspace administrator as Curve platform administrator for the target workspace |
| Applies to | M0-S9A (provider-neutral registry and reconciliation foundation), local-only registration |

## Decision

Curve derives `PLATFORM_ADMINISTRATOR` from an authenticated human's active
Plane workspace membership when that membership has Plane role `20` in the
exact target workspace.

Provider registration is authorized with
`CURVE.PROVIDER_CONNECTION.REGISTER` against the existing `WORKSPACE` because
the `ProviderConnection` does not exist before the command succeeds. The
trusted static registry supplies target `curve.fake-local@1.0.0`; target
allowlisting is required. Existing connection commands continue to use
`CURVE.PROVIDER_CONNECTION.ADMINISTER` against the persisted
`PROVIDER_CONNECTION`.

The runtime derives the role from Plane persistence after authenticating the
human. A request cannot supply, override, or widen the derived role. Plane
roles `15` and `5`, inactive membership, another workspace, agents, services,
unknown targets, non-local environments, and classifications other than
`INTERNAL` fail closed.

## Exact contract

| Dimension | Required value |
| --- | --- |
| Policy | `CURVE_CORE_POLICY` version `2` |
| Policy manifest digest | `sha256:2895b63392236afa07e6f0572d6ddb1c91aa7f40d37282f250019d2829ed5787` |
| Action | `CURVE.PROVIDER_CONNECTION.REGISTER` |
| Resource | Existing `WORKSPACE` version `1` in the request workspace |
| Actor | Authenticated `HUMAN` |
| Trusted role | `PLATFORM_ADMINISTRATOR` |
| Trusted source | Active Plane `WorkspaceMember` role `20` in the target workspace |
| Role-mapping action scope | `CURVE.PROVIDER_CONNECTION.REGISTER` and `CURVE.PROVIDER_CONNECTION.ADMINISTER` only |
| Caller-supplied role | Rejected |
| Environment | `LOCAL` |
| Classification | `INTERNAL` |
| Target | Static allowlisted `curve.fake-local@1.0.0` |
| Projection | `NO_BODY` |
| External side effect | `false` |

The [core policy v2 manifest](../../contracts/policy/core-policy-v2.json)
(machine-readable Option B authorization rules) adds only this registration
action and trusted-role source. The [core policy v1 manifest](../../contracts/policy/core-policy-v1.json)
(immutable original M0 authorization rules) and its schema remain byte-for-byte
unchanged for historical decisions.

## Required implementation evidence

1. Plane role `20`, active membership, matching workspace, local environment,
   internal classification, and exact static target produce an allow receipt.
2. Plane roles `15` and `5`, inactive membership, and wrong-workspace
   membership produce stable denies without a provider row or delivery effect.
3. Caller-supplied `PLATFORM_ADMINISTRATOR`, agent, and service principals
   cannot register a provider.
4. Unknown or changed adapter target, staging/production environment, or wider
   classification produces a stable deny.
5. Plane role `20` does not derive `PLATFORM_ADMINISTRATOR` for any action
   outside provider registration and administration.
6. Registration evaluates the existing workspace; later commands evaluate the
   workspace-scoped provider connection.
7. Every accepted mutation still runs through `execute_authorized_mutation`,
   which alone issues the policy receipt.

## Alternatives recorded

- Option A required both Plane instance administration and active target
  workspace membership.
- Option C introduced a dedicated Curve platform-administrator assignment
  aggregate and administration lifecycle.

Federico Ocampo approved Option B for simplification on 2026-08-25. Status
becomes `PUBLISHED` only when the exact contract head is merged into Curve
`main`; implementation authorization remains a separate gate.
