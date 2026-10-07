# Archived Python validation preparation

Status: implementation moved to the Plane candidate, 2026-10-06.

The Python implementation and its tests now have one maintained home in Plane:
`candidates/curve-manual-plan-v2/overlay/manual_plan_v2/` (intended runtime modules
and immutable consumer contract snapshot), with host tests in
`candidates/curve-manual-plan-v2/tests/` (parser parity, model, resolver, policy,
HTTP and transaction-order checks). The duplicate experiment code was removed.

The [historical verification](VERIFICATION.md) (14 tests and the original
PostgreSQL access blocker) remains evidence for the earlier checkpoint; its
commands describe that earlier checkout. It is not current backend qualification.

The [JavaScript reference](../../scripts/lib/manual-planning-v2.mjs) (strict JSON,
canonical digests and inert semantics) and [v2 reconstruction contract](../../docs/technical/manual-planning-reconstruction-v2.md)
(fixed local draft writer and preservation requirements) remain canonical in Curve.
The [delivery record](../../docs/technical/local-pilot-delivery-2026-10-06.md)
(milestones, current implementation and remaining gates) records continuation.

The Plane package remains outside the installed application until its semantic
catalog/authority integration and real PostgreSQL successor proof are complete.
No approval, reservation, execution or spending authority follows from validation.
