# Shared local store candidate

Status: **SYNTHETIC DEVELOPMENT ONLY**. Storage edition:
`attention-local-store-v0.2`. Existing evidence record edition remains
`attention-candidate-v0.1`; no approved Curve bundle is changed.

## One model, two interfaces

The loopback UI server and local read-only MCP process open the same SQLite file.
Both reconstruct the same deterministic view from an ordered synthetic command
journal. A handled/snoozed disposition appears through both interfaces at the same
store version and remains after either process restarts. Scope is fixed to the
fictional demo workspace/reviewer; callers cannot select another scope.

The generic store boundary exposes `read`, `readEvidence`, `apply` and `close`.
A future Curve persistence adapter can implement equivalent semantics. MCP opens
its adapter read-only and exposes no apply command. The browser is the sole pilot
write surface. All writes change local synthetic personal/demo state only; source
adapters and source task writes remain absent.

## Local storage and transactions

The default file is `.local-data/synthetic-state.sqlite` (local synthetic runtime
state) beside the pilot package entry point. It is excluded from source packaging.
An optional absolute `CURVE_PILOT_DATA_DIR` selects another local directory. Both
processes must use the same value. No file contents or configuration are uploaded.

SQLite WAL mode permits readers to observe committed snapshots while one writer
holds a transaction. `BEGIN IMMEDIATE` serializes commands; `synchronous=FULL`
requests durable WAL commits. The bounded busy timeout reports contention without
stealing locks or relying on process IDs. There is no custom lock or atomic-rename
protocol to recover. The storage engine owns commit/rollback and crash recovery.

The command journal and store version update inside one transaction. A command
replays successfully before SQL mutation. Failure before commit leaves the previous
logical version authoritative. A process killed before commit exposes no partial
review. A transport failure after commit is reconciled through the same request ID.

Directories are created with mode 0700, the database with mode 0600, and the adapter
rejects a broader existing mode on supported POSIX filesystems. Symlinked final
storage paths are rejected. No user system permissions/settings are modified.
These local controls do not establish authentication or permission to hold real data.

## Command contract

A command has exactly three fields:

- `requestId`: unique bounded string for this precise command attempt.
- `expectedVersion`: integer version the UI reviewed.
- `action`: a closed supported demo/review action and optional item ID.

An exact retry returns the original applied version plus the latest committed
snapshot, without appending a second command. Reuse of a request ID with different
bytes fails. A stale version fails before mutation; the UI reloads the current state
and requires another deliberate action. Reset returns the projected synthetic view
to its baseline while retaining ordered request receipts for safe retry semantics.

The pilot caps the journal at 1,000 commands and each HTTP request at 8 KiB. Exceeding
those bounds fails explicitly. There is no compaction or cross-edition migration.
The browser may keep an unconfirmed request in tab storage to retry it; personal
review state is authoritative only in the shared local database.

## Browser write boundary

- Bind only to 127.0.0.1; reject other Host values and cross-site requests.
- Require exact same Origin on POST, application/json and a per-server unpredictable
  CSRF value obtained from the same-origin state response.
- Compare CSRF values in constant time; rotate on server restart.
- Expose no CORS authorization, production cookie or real account identity.
- Validate closed command shape, supported action, bounded ID and expected version.
- Return no storage paths, stack traces or private error content.
- Serve only exact static routes and two API endpoints. Database files and backend
  modules cannot be fetched through the static server.

The CSRF value is transient browser-request protection, not a provider credential
or proof of human identity. This is still a single-user synthetic pilot.

## Remaining qualification

Power-loss/hardware durability, backup/restore, data retention/erasure, multi-user
identity, encryption, production-grade migrations, source authorization and real
provider conformance remain unqualified. The UI refreshes on load and its own actions;
it does not push another browser's updates live. A stale action detects the newer
version rather than silently overwriting it.

Sources: [Node SQLite API](https://nodejs.org/api/sqlite.html) (built-in database),
[SQLite WAL](https://www.sqlite.org/wal.html) (concurrent committed reads),
[SQLite synchronous pragma](https://www.sqlite.org/pragma.html#pragma_synchronous)
(commit synchronization).
