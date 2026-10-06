# Python preparation for manual planning v2

Status: pure candidate validation, not a qualified backend, 2026-10-06.

This ports the [JavaScript reference](../../scripts/lib/manual-planning-v2.mjs)
(strict JSON, canonical digests and inert plan semantics) into Python for the
[v2 reconstruction contract](../../docs/technical/manual-planning-reconstruction-v2.md)
(future persistent drafts and protected reads). It consumes the exact existing
candidate files without changing their bytes or identifiers.

## Implemented checks

- Strict UTF-8 JSON with duplicate-key, unsafe-number and surrogate rejection;
  inclusive byte bounds, 32 container levels and 100,000 nodes.
- Unicode-scalar canonical ordering, exact original-byte definition digests and
  the selected strong typed Initiative ETag.
- Pinned closed JSON schemas resolved only from an in-memory local registry.
- Repository/input equality, PRD and delivery coverage, current-fact fixture
  ownership, three assignments, risk separation and mandatory quality checks.
- Safe relative component paths, exact branch convention, typed future
  dependency conditions and acyclic dependency graph.
- A closed deterministic validation receipt; instruction text stays inert.

Facts passed to this experiment are synthetic test inputs. They are not a current
ACL resolver. The result cannot authorize persistence, approval, reservation,
execution or any external action.

## Run

From the repository root:

```sh
python3 -m venv experiments/manual-planning-v2-python/.venv
experiments/manual-planning-v2-python/.venv/bin/python -m pip install \
  -r experiments/manual-planning-v2-python/requirements.txt
experiments/manual-planning-v2-python/.venv/bin/python -m unittest discover \
  -s experiments/manual-planning-v2-python -v
```

Node.js is required by the parity tests. The tests compare acceptance and
canonical output with the incumbent JavaScript reference, then exercise closed
objects, input identity, coverage, DAGs, branch/path safety and inert commands.

## Qualification boundary

This code deliberately stays outside Plane's qualified runtime inventory.
Adding a runtime module before reviewing the successor proof would invalidate
the recovered fail-closed source checks even with the new feature disabled.

Still required: the fixed server-owned synthetic resolver, per-action current
authorization, resource-limited subprocess validation, actual PostgreSQL migration
and catalog evidence, SQL guards, atomic persistence/audit/outbox/idempotency,
protected HTTP reads and the separate scope editor reader. Gate 2/control and
native UI follow those verified prerequisites.

The [delivery record](../../docs/technical/local-pilot-delivery-2026-10-06.md)
(milestone matrix, delivery order and current blocker) records continuation.
