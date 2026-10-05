# Scope-editor minimal read v2 reconstruction candidate

Status: a separate new read-only contract proposal, not a restored v1 backend.

Read [manual reconstruction contract](../../../docs/technical/manual-planning-reconstruction-v2.md)
(preserved authority, exact editions and runtime qualification boundary).

## Wire contract

GET `/api/v1/workspaces/{slug}/curve/initiatives/{initiative_id}/scope-editor/v2/preconditions/`
accepts no query parameters. The response has exactly schema_version,
policy_edition, workspace_id, product_id, initiative_id, initiative_version,
scope_status and expected_scope_revision. It uses the incumbent strong Initiative
ETag and Cache-Control no-store. No task IDs, names, counts, bodies, fingerprints,
digests, reviewer identities or capabilities are exposed. No rows are written.

Only intact absence returns ABSENT and revision zero. A saved empty selection is
PRESENT with a positive revision. All missing, denied, corrupt, non-DRAFT and
unsupported-runtime results share the same fixed 404 shape.

## Authority and lineage

Require a separate default-off read flag, established LOCAL/workspace/installation
gates, active known-role human membership, current Initiative creator or workspace
administrator, STANDALONE DRAFT state and active Product. A successful read is not
a write grant. Replacement discovery does not require old task visibility;
protected member reads and every save keep independent current access checks.

Verify complete scope revision metadata lineage, not only the current head and
immediate predecessor. Limit history to 1,000 revisions and fetch at most 1,001
before broader integrity work. Reject orphan/cross-workspace/cross-Initiative
metadata, disconnected links, invalid sequence, wrong current pointer and
non-monotonic saved versions/times. Legitimate Initiative-version gaps remain
valid. The whole lineage and current authority participate in the final fence.

## Separate successor boundary

The proposed qualification adds only `scope_editor_read_v2.py` (read and bounded
lineage implementation), `scope_editor_read_views_v2.py` (HTTP view), and route
registration. Models, migrations, catalog, writers and exclusions must equal the
qualified reconstructed draft predecessor. The draft predecessor is not yet
implemented or qualified. No runtime availability is implied by this schema.

`manifest-v2.json` (candidate byte pins) covers the schema, safe error, policy and
OpenAPI description. `fixtures/` (synthetic examples) covers absent, saved present
and fixed denial. Fresh current authority, zero-write, full lineage, concurrency
and source closure tests remain mandatory in the eventual backend.
