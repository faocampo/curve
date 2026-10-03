# Curve attention development pilot v0.2

A runnable, synthetic-only candidate for reviewing attention and existing projects.
The UI and read-only MCP now use **the same durable local state**. Handling an item
in the UI is reflected in MCP reads and remains after both processes restart.

This standalone experiment is versioned in Curve, outside its active implementation.
It is not an
approved M7 implementation, production integration or lifecycle migration. The
frozen v0.1 package remains separate; no old contract or approval pin is changed.

## Run locally

Use Node.js 24.19+ in the 24.x line, or Node.js 26.7+ in the 26.x line. These runtime
lines expose built-in `node:sqlite` without an enabling flag. This version was tested
on Node.js 24.19.0; other supported runtime/platform checks remain pending.
There are no runtime packages to install.

```sh
cd experiments/attention-pilot-v0.2
npm run check
npm start
```

Open `http://127.0.0.1:4319` (local synthetic preview). This separate port leaves the
older v0.1 preview untouched. The server binds only to loopback and validates Host,
Origin, CSRF value, content type, payload size, command shape and expected version.
`PORT=4320 npm start` selects another local port. Stop with Control-C.

The default store is `.local-data/synthetic-state.sqlite` (local synthetic runtime
state), inside this standalone task folder. It is excluded from source archives.
Browser restarts, port changes and MCP restarts do not erase its saved reviews.
Use an absolute `CURVE_PILOT_DATA_DIR` only when deliberately selecting another local
store. Both UI server and MCP must use the same directory. No v0.1 browser-state
migration or real data loading is included.

## What works

- Attention search, filters, evidence details and explicit priority reasons.
- Personal handled-for-now, one-day snooze, reopen and undo.
- Shared durable personal review state through UI and read-only MCP.
- Material source changes and crossing a due date resurface earlier reviews.
  Unchanged observations, revision-only changes and whitespace-only title changes
  do not. Snoozes also expire at the chosen time.
- Existing source projects retain their original tasks, states and historical
  events. History coverage can be partial or unknown. Binding grants no past approvals.
- Unlinked messages remain actionable without an invented project association.
- Partial and failed refreshes retain earlier observations with original timestamps.
- Explicit unknown, stale, inaccessible and disabled states.
- Safe retries and stale-version conflicts across tabs/processes.

Use **Try the demo scenarios** to simulate source changes, partial refreshes,
failures or time passing. Reset returns the synthetic view to its baseline while
keeping the local command receipts required for retry safety. Source links use
reserved fictional domains and do not resolve to real work.

A lost save response leaves a **Retry save** action. It reuses the exact request ID
rather than submitting a duplicate change. A stale-version conflict loads current
state and asks for another deliberate review. The demo disclosure and initiating
refresh/scenario control retain their state/focus across data-only rendering.

## Local MCP

Start the UI server once to initialize the local store. Run `node mcp.mjs` as a local
stdio subprocess in an MCP-compatible client, using the absolute path to this
package's `mcp.mjs` (read-only synthetic tool server). No persistent client setup,
account connection or credentials are needed for the supplied test harness.

MCP opens the same SQLite file with a read-only connection. It does not create a
missing store, write dispositions or expose refresh, import, approval or source-write
commands. The MCP process opens no network listener.

The pinned protocol is `2025-06-18`: initialize, initialized notification, ping,
tools/list and tools/call. Five available tools:

- `list_attention`
- `list_projects`
- `read_project_outlook`
- `read_evidence`
- `read_refresh_health`

Responses identify the shared store version. For an unsupported protocol request,
the server proposes its supported version and waits for initialized. A client that
cannot use that version should disconnect.

### Official SDK interoperability check

Verified with official `@modelcontextprotocol/sdk` **1.32.0** on Node.js 24.19.0:
initialize, listTools, all five callTool methods, an HTTP disposition observed through
MCP, unchanged source tasks, and persistence after UI/server and MCP restart.

The optional test SDK belongs in a separate development folder, not runtime setup:

```sh
mkdir ../attention-sdk-check
cd ../attention-sdk-check
npm init -y
npm install --ignore-scripts --save-exact @modelcontextprotocol/sdk@1.32.0
cd ../attention-pilot-v0.2
node scripts/verify-sdk.mjs ../attention-sdk-check
```

The harness creates and deletes its own temporary synthetic store. It changes no
Codex/Claude client configuration and uses no real provider or model credentials.
This verifies that SDK/version and stdio workflow, not every AI application's UI.

## Candidate and evidence

- [Extension candidate](contracts/extension-candidate.md) (ownership and adoption limits).
- [Shared local store](contracts/local-store-candidate.md) (transaction, concurrency and browser write boundary).
- [Record schema](contracts/candidate.schema.json) (unchanged synthetic model shapes).
- [Command schema](contracts/local-command.schema.json) (bounded local write request).
- [Verification](VERIFICATION.md) (exact checks, limitations and remaining manual review).
- [Design](DESIGN.md) (inherited Curve visual system and responsive composition).

## Explicit limits

This is a single-user synthetic development candidate, not a finished production MVP
or authentication system for real data. The fixed actor context and access receipts
are test inputs. SQLite is not encrypted. There is no cross-device sync, live update
push between browsers, backup qualification, erasure workflow or power-loss proof.
The journal is capped at 1,000 commands; compaction and edition migration are absent.

Real adapters remain disabled. No mail/chat/Plane provider fetch, credential exchange,
source mutation, background poll, model call, import/sync engine, governed Initiative
creation or retrospective approval exists. Actual adoption mapping belongs in
approved private configuration outside public source repositories.

Production identity, source authorization, data/retention controls, migrations,
operational qualification and deployment still require their own reviews/evidence.

## License and references

Curve's existing horizontal logo derivative is copied unchanged from its public
brand assets. Plane attribution remains. The included [AGPL-3.0 license](LICENSE)
(source terms) applies.

Primary implementation references: [Node SQLite](https://nodejs.org/api/sqlite.html)
(built-in database), [MCP lifecycle](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle)
(negotiation), [MCP stdio](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports)
(transport), [official SDK client](https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.x/docs/client.md)
(client test workflow).
