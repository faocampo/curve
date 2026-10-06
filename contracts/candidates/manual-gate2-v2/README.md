# Manual Gate 2 local contract

This independent successor freezes manual review, exact approval, stable task
reservation and reconciled release. It is new reconstruction, not recovered
backend code or production activation. See the [implementation boundary](../../../docs/technical/manual-gate2-reservation-candidate.md)
(local persistence, proof chain, UI and limits).

The [manifest](manifest.json) (exact SHA256 file inventory) is pinned as
`sha256:72877f8914391b231fe916853faed3c72f5d11456d154b1fe54d9ba6714b8387`
in the Plane runtime. The seven closed schemas and explicit [policy](policy.json)
(manual-only authority and lifecycle) must remain byte-identical to its snapshot.
The [contract tests](../../../scripts/tests/manual-gate2-contracts.test.mjs)
(manifest integrity, schema compilation and malformed command rejection) do not
substitute for native authorization, database exclusivity or browser acceptance.

Native Initiative state remains PLANNING after approval, with manual control in
its separate state. Paused/cancelled/access-lost ownership is retained; only exact
current reconciliation permits explicit release. No dispatch, completion credit,
provider permission, model call or spending is granted by this edition.
