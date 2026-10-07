# v0.2 verification and handoff

Checked: 2026-10-03 on Node.js 24.19.0. Experimental source candidate, version 0.2.0.
This checkpoint adds the standalone candidate to Curve under `experiments/`.
It does not qualify production integration, live-provider activation or any
persistent AI-client configuration. Historical Curve contract pins stay unchanged.

## Passed on the checkpoint source

- `npm run check`: syntax checks and all 70 local tests.
- `python scripts/validate-contracts.py`: five valid runtime records, five rejected
  unknown-authority-field records, two valid commands and four invalid commands.
- `node scripts/verify-sdk.mjs <isolated-sdk-directory>` with official MCP SDK 1.32.0:
  initialize, listTools, all five read-only callTool methods, HTTP-to-MCP review parity,
  unchanged source projects/tasks, and UI/server plus MCP restart persistence.
- Complete new-source disclosure review and repository disclosure-pattern check.
  Fixtures use fictional identities and reserved example domains. The logo is
  byte-identical to the existing public Curve brand derivative.

## New persistence/security coverage

Tests use actual separate OS processes for simultaneous writers, MCP reads, a reader
observing committed data while another writer has uncommitted changes, and an
uncommitted writer killed before recovery. No process-ID-based lock stealing exists.

Verified cases include:

- shared UI/MCP handled state before/after restart;
- serialized concurrent writes and stale-version rejection;
- busy timeout, pre-write failure and post-update/pre-commit rollback;
- duplicate request reconciliation after a lost response;
- request-ID reuse with changed content/version rejected;
- no source-task mutation from personal reviews;
- foreign scope, corrupt stored scope and missing read-only store rejected;
- mode-0700 directory and mode-0600 database/WAL/shared-memory artifacts;
- same-origin/Host/CSRF/content-type guards, bounded payloads and no database serving;
- CSRF rotation after server restart without losing saved review state.

SQLite WAL with FULL synchronous commits supplies the local transaction boundary.
These tests establish logical commit/rollback and process-crash behavior, not power
loss, filesystem corruption recovery or production backup/retention qualification.

## UI evidence and remaining manual pass

Six targeted DOM-state unit tests cover refresh/scenario controls, closed disclosure,
All-filter focus, search cursor, mismatched item controls and summary focus.
These tests are not a substitute for a real browser confirmation.

**v0.2 desktop/mobile visual and real keyboard confirmation are still pending.**
No whole-surface UX approval is claimed by this checkpoint.

Remaining manual checklist on port 4319:

1. Start the v0.2 server, load Attention and verify the shared-state status.
2. Handle, snooze, undo and reopen; reload/restart the browser and server.
3. Confirm unchanged refresh stays handled and material change resurfaces.
4. Keep demo scenarios expanded; keyboard-activate refresh and scenarios. Confirm
   disclosure remains open and focus returns to the initiating control.
5. Exercise All-filter keyboard operation, search/clear and Back/Forward.
6. Simulate partial/failed refresh and verify source timestamps/history stay truthful.
7. Use two browser tabs: an action on stale data must show conflict and current state.
8. Inspect desktop and mobile overflow/readability after the unchanged-layout transport
   update, then complete the single bounded visual confirmation pass.

## Deliberate qualification limits

Official SDK stdio interoperability is verified at 1.32.0. Other AI applications,
SDK major versions, custom clients and real account installation are not implied.
Node.js 26.7+ is an allowed runtime line, not yet tested for this package.
Old browser-local v0.1 state is not imported automatically.

The adapter remains fixed-scope and synthetic-only. Production authentication,
source authorization, encryption, tenancy, data lifecycle, migrations, provider
conformance and deployment are not approved or qualified by this work.
