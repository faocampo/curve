# Validation preparation evidence

Recorded: 2026-10-06T13:30:52.926438+00:00.

## Scope

This is preparation for the new manual-plan backend, not database or API
qualification. The [candidate README](README.md) (pure validator and runtime
boundary) defines the delivered scope. The [delivery matrix](../../docs/technical/local-pilot-delivery-2026-10-06.md)
(existing milestones, ordered work and blocker) remains the continuation plan.

The preserved Plane runtime and migrations remain byte-identical to
`7d4225d594adf984de1451f16ad2c8ab741c58eb`. Plane's new local commit
`5a80a2084f4635389b6703eab77c02db0bfb8cb0` only adds the isolated test profile
and its Markdown instructions. No source qualifier was repinned.

## Executed verification

| Verification | Actual result |
| --- | --- |
| Python unittest, including adversarial subcases and JavaScript parity | 14 passed |
| Python dependency consistency | `pip check` passed |
| Curve Node suite | 1,061 passed; 0 failed; 0 skipped |
| JSON schema and contract fixture validation | 117 schemas and 186 fixtures passed |
| Documentation inventory | 0 structural findings |
| Markdown and Mermaid validation | 118 Markdown files and 47 diagrams passed |
| Targeted new Markdown lint | Passed |
| Public disclosure pattern check | Passed; not a replacement for future full outbound review |
| Candidate contract integrity | All original raw-byte pins unchanged |
| Docker Compose configuration | Passed |
| Docker test dependencies | Python 3.12.5, Django 5.2.15, pytest 9.0.3, psycopg 3.3.4 and DRF 3.17.1 imports passed |
| PostgreSQL migration, catalog and API baseline | Not executed: source mount denied before application startup |
| Test resource cleanup | No containers or networks remain for the dedicated test project |

The first `pnpm check` invocation passed disclosure, Markdown and contracts, then
failed to launch Chromium from the Codex sandbox. The supported authorized retry
of `check:structure` passed all Mermaid diagrams, followed by a successful
`check:project` including the Node suite. Chromium's sandbox was not disabled.
Node.js was v26.7.0 and the host Python validator used Python 3.14.7.
No new application runtime, concurrency/database, browser UX or pilot-acceptance
pass is claimed.

## Tested source bytes

| File | SHA-256 |
| --- | --- |
| `validation.py` | `68366aba180bb7ff023244872e8e2171e909df61a0ff9d8495c92c15bd6010d2` |
| `test_validation.py` | `2949e706a9e5866d8ae1ef42b71a778cf04c891209d8bad9ec1f76ce95f56ab2` |
| `requirements.txt` | `9cba6d4508d006391ab899893990d5ac5d03b4811a0f71f152c5883897ee8120` |

## Required continuation

Docker Desktop must be authorized to read/mount the restored Plane API source
under Documents. The denial was `operation not permitted`, not an automatic
approval-review rejection. No source relocation, alternate mount or permission
bypass was attempted. Once access is authorized, rerun the documented isolated
baseline, then implement and qualify the new persistence successor.

All changes are local. Published recovery refs remain unchanged. No merge,
external publication, shared deployment, real provider access or AI spending
occurred.
