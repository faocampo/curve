# Curve MVP development checkpoint

Date: 2026-10-03. Status: experimental development snapshot, not a release approval.

## References and scope

- Branch: `checkpoint/curve-mvp-2026-10-03`.
- Annotated tag: `curve-mvp-2026.10.03-preview.1`.
- Curve base: `8326d3b788a18296ddae32ee2347f09cba9720b2`.
- Companion Plane checkpoint uses the same branch and tag names in its own repository.

This snapshot preserves the generic adopting-organization disclosure boundary,
[attention pilot v0.2](../../experiments/attention-pilot-v0.2/README.md)
(synthetic attention, local durable personal review state and read-only MCP), and
[existing-project proposal](../proposals/existing-project-management.md)
(draft Product association and prospective selected-scope governance).

The attention pilot is an isolated experiment. It is not integrated with the
active Curve lifecycle, Plane authentication, or any live source provider.
The proposal remains pending owner approval of its mapping and authority model.
No normative adoption policy, contract edition or historical approval pin changes.

## Validation

The attention candidate passed syntax checks, all 70 tests, 16 schema fixtures and
MCP SDK 1.32.0 interoperability on Node.js 24.19.0. See its
[verification record](../../experiments/attention-pilot-v0.2/VERIFICATION.md)
(coverage and explicit remaining qualification).

Repository validation is recorded against the checkpoint commit by the delivery
handoff. Publication, integration, deployment and activation remain separate states.
The repository workflow runs on pull requests and main pushes; this checkpoint
branch and preview tag do not trigger a deployment workflow.

## Remaining gates

- Owner review of existing Project-to-Product mapping and authority boundaries.
- Existing Initiative-shell UX acceptance and dependent integration gates.
- v0.2 real-browser desktop/mobile and keyboard confirmation.
- Authenticated provider, storage, security and operational qualification.

No PR, merge, deployment, provider activation or new account authorization is part
of this checkpoint. Local databases, dependencies, user-specific records and private
operational materials are excluded from its source tree.
