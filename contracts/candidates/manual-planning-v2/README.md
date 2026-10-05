# Manual planning v2 reconstruction contracts

Status: new contract proposal. These files do not recover the unavailable v1
implementation and do not qualify a runtime or authorize Gate 2.

Read [behavior and preservation contract](../../../docs/technical/manual-planning-reconstruction-v2.md)
(authority, canonicalization, original inputs, fixed resolver and qualification).

## File inventory

- `common-v2.schema.json` (closed candidate reference types grounded in the
  recovered logical VersionRef, with ObjectRef kept distinct).
- `manual-plan-profile-v2.json` and its schema (immutable manual profile).
- `manual-plan-model-policy-v2.json`, `manual-plan-tool-policy-v2.json`,
  `manual-plan-budget-policy-v2.json` and their schemas (zero automatic model,
  tool/controller execution and spending).
- `manual-plan-draft-save-v2.schema.json` (closed save metadata).
- `manual-plan-definition-v2.schema.json` (protected inert plan definition).
- `manual-plan-draft-revision-v2.schema.json` (protected immutable revision DTO).
- `manual-plan-draft-status-v2.schema.json` (minimal current head recovery).
- `manual-plan-draft-event-v2.schema.json` (bounded event payload).
- `manual-plan-input-identity-v2.schema.json` (private original identities).
- `manual-plan-current-authority-v2.schema.json` (separate current ACL/freshness).
- `manual-plan-validation-receipt-v2.schema.json` (private deterministic receipt).
- `manual-plan-error-v2.schema.json` (fixed safe error codes).
- `policy-v2.json` (default-off, conservative pre-plan policy and resource limits).
- `workflow-condition-subset-v2.json` (two supported typed dependency conditions,
  with pinned normative source hashes; no invented slice states).
- `qualification-delta-v2.json` (proposed source/model/migration delta; unqualified).
- `openapi-v2.json` (four draft command/read routes; description only).
- `manifest-v2.json` (raw-byte pins for every top-level candidate JSON file).
- `fixtures/` (synthetic valid schema examples and immutable semantic test facts).

## Proposed routes

Under `/api/v1/workspaces/{slug}/curve/initiatives/{initiative_id}/`:

- POST `manual-plan-drafts/v2/` (save one immutable draft revision).
- GET `manual-plan-drafts/v2/current/` (fresh-client current revision recovery).
- GET `manual-plan-drafts/v2/revisions/{revision_id}/` (original-input history).
- GET `manual-plan-drafts/v2/status/` (minimal authorized head/status).

No route currently exists in the recovered backend. No plan submission, approval,
task control or execution route is proposed here. Session/CSRF, current ACL,
the explicitly selected v2 typed C1-style Initiative If-Match and exact idempotency
remain required where applicable. Untyped numeric and weak ETags are not accepted.

## Review limitations

The pure reference validator checks data only and executes no plan instructions.
Its synthetic facts are not a public input or authority resolver. Source pins,
worker limits, migration guards, current ACL and independent database-catalog
checking still need actual backend implementation and real database tests.
The qualification delta intentionally has null current hashes and must never be
accepted as an executable proof. There is no generic runtime repinning utility.
