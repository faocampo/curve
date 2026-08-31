# M1-01B (Curve-First Initiative Shell) Implementation Task Packet

## Document control

| Field | Value |
| --- | --- |
| Status | `IMPLEMENTATION_DEFINITION_PREPARED / MACHINE_PUBLICATION_SEQUENCE_REQUIRED / TOOL_DECISION_REQUIRED / DISPATCH_AUTHORITY_REQUIRED / NOT_IMPLEMENTATION_AUTHORITY` |
| Version | 1.0 |
| Prepared | 2026-08-31 |
| Product | Curve |
| Work package | M1-01B (Curve-first Initiative shell) |
| Owner and human reviewer | Federico Ocampo (`faocampo`) |
| Implementer | Codex |
| Target repository | `git@github.com:faocampo/plane.git` |
| Target branch | `preview` |
| Verified target base | `9f9bb14f46b80e1d05b4c900d25c1af7a229b55c` |
| Intended feature branch | `curve/m1-01b-initiative-shell` |
| Curve preparation base | `f7c211cfcd7cfff7fd026d9cdd7b57a6fe6c95fe`; the final normative source revision is assigned only after this definition is merged |
| GitHub Project item | `PVTI_lAHOBNjuQc4BgZzOzg4vNto` (`WORK_PACKAGE`, Project 2) |
| Data boundary | Existing authorized workspace projections plus synthetic `INTERNAL` local-test data; no protected body or credential |
| External spend | US$0 |
| Authority boundary | This definition authorizes no Plane mutation, command execution, branch push, PR creation, merge, deployment, provider call, credential use, or infrastructure change. |

## Readiness verdict

The product, UX, backend, API, repository scope, Plane base, target paths,
acceptance cases, rollback, and repository-native command forms are complete.
Two independent control layers remain open:

1. The task packet cannot become machine `READY` until
   B-CODING-TOOLS-01 (local coding-tool execution profile) supplies an approved
   Node/pnpm and security-evidence profile that the current task-packet grammar
   can represent as `AVAILABLE`, and the ordered context, state-evidence,
   source-catalog, and registry publication chain is completed after this
   normative definition is merged.
2. A future `READY` packet still cannot be dispatched until
   B-CODING-AUTHORITY-01 (trusted human authority and attempt lease) has a
   selected, implemented, independently verified bootstrap or production
   execution-authority path and an exact current-attempt lease.

The prepared machine packet therefore remains `BLOCKED`, and dispatch remains
separately fail closed.

## Demonstrable outcome

An authorized workspace member can open Curve's first-class Initiatives route,
load every accumulated authorized Initiative row, search and filter the loaded
collection, inspect one Initiative, create a standalone Draft with three valid
human gate assignments, and use the exact M1-01A lifecycle actions. The surface
preserves safe recovery, optimistic concurrency, idempotency, responsive list
visibility, keyboard operation, and the approved Curve-first visual hierarchy.

## Governed inputs

| Input | Evidence |
| --- | --- |
| Product and UX contract | [M1-01B Initiative shell experience contract](ux-m1-01b-initiative-shell.md) (approved Curve-first list/create/detail/lifecycle flow, state matrix, responsive and accessibility rules, and exact-commit test evidence) |
| Accepted backend | [M1-01A implementation evidence](m1-01a-initiative-core-implementation-evidence.md) (accepted Initiative domain/API implementation, tests, merge tree, data boundary, and rollback) |
| Backend semantics | [M1-01A Initiative core task packet](m1-01a-initiative-core-task-packet.md) (Product binding, assignments, lifecycle, authorization, idempotency, concurrency, and acceptance cases) |
| HTTP contract | [Curve OpenAPI v1](../../contracts/openapi/curve-v1.openapi.yaml) (workspace Product and Initiative resources, pagination, mutations, ETag, idempotency, and Problem Details) |
| Resource contract | [Initiative schema](../../contracts/schemas/initiative.schema.json) (Initiative fields, states, assignments, version, and state-dependent invariants) |
| Create contract | [Initiative create-request schema](../../contracts/schemas/initiative-create-request.schema.json) (required Product, standalone mode, definition, risk, and three assignments) |
| Transition contract | [Initiative transition-request schema](../../contracts/schemas/initiative-transition-request.schema.json) (bounded lifecycle-reason payload) |
| Authorization contract | [Initiative policy v1](../../contracts/policy/initiative-policy-v1.json) (workspace human authority, assignment separation, lifecycle actions, and fail-closed behavior) |
| Execution controls | [Coding-agent local execution and authority decision packet](coding-agent-local-execution-decision.md) (Node/tool trust profile and exact human grant/attempt-lease alternatives) |

## Scope

### In scope

1. Extend the shared Curve TypeScript model with Product, Initiative,
   GateAssignment, paginated response, create request, transition request,
   mutation result, and safe Problem Details types.
2. Extend the shared Curve service with typed Product/Initiative reads and
   Initiative create, refinement-acceptance, pause, resume, and cancel methods.
3. Add `/:workspaceSlug/curve/initiatives` as a first-class Curve route and
   replace the disabled Initiatives sidebar placeholder with an active link.
4. Implement authorized list accumulation, search, state/risk filtering,
   selection, detail, create, lifecycle, optimistic-concurrency recovery, and
   safe error states.
5. Use the existing Plane workspace-member store only to populate active,
   non-bot human selectors; the M1-01A API remains authoritative for role,
   workspace, active-human, and three-distinct-person validation.
6. Add focused Vitest and React Testing Library coverage for typed service
   behavior, state mapping, list/detail behavior, create validation, lifecycle,
   responsive semantics, recovery, and keyboard focus.

### Out of scope

- No backend/migration implementation is included in M1-01B.
- Django, model, migration, OpenAPI, schema, policy, event, outbox, audit,
  idempotency-kernel, or Temporal changes.
- Idea Brief, research, evidence, PRD, roadmap, planning, coding-provider,
  quality, review, or draft-PR behavior.
- Provider, model, Onyx, MCP, VCS-controller, credential, protected-data,
  staging, production, deployment, or infrastructure work.
- A new permissions system, a fourth gate, inferred authorization, or an
  independent copy of Plane member data.
- Pixel-for-pixel reuse of the static prototype implementation; the approved
  behavior and screen contract govern production components.

## Exact Plane implementation boundary

Every existing target below is verified at Plane base
`9f9bb14f46b80e1d05b4c900d25c1af7a229b55c`. That commit is a descendant of
the accepted M1-01A backend base `99a73b4eab5ee21fd012d7358bc9259252d47f71`.
Its intervening storage-only change touches `.env.example` (root local
environment example), `apps/api/.env.example` (API local environment example),
`apps/api/plane/settings/storage.py` (storage endpoint configuration),
`apps/api/plane/tests/unit/settings/test_storage.py` (storage configuration
tests), and `docker-compose-local.yml` (local MinIO endpoint wiring). None
overlaps an M1-01B target, route, type, service, component, hook, or test path.

| Target | Required change |
| --- | --- |
| `packages/types/src/curve.ts` (shared Curve TypeScript contracts) | Add typed Product, Initiative, GateAssignment, request/page/mutation, filter, and safe-error shapes without weakening existing Operation types. |
| `packages/services/src/curve/curve.service.ts` (shared authenticated Curve HTTP client) | Add Product list and Initiative list/read/create/transition methods; preserve CSRF handling, structured headers, and rejected-response behavior. |
| `apps/web/core/services/curve.service.ts` (web Curve service singleton) | Reuse the shared service instance; change only if the new typed surface requires an exported wrapper. |
| `apps/web/app/routes/core.ts` (React Router workspace route registry) | Register `:workspaceSlug/curve/initiatives` without changing existing Plane or Foundation routes. |
| `apps/web/core/components/curve/curve-workspace-sidebar.tsx` (Curve-primary workspace navigation) | Replace only the Initiatives placeholder with an active `CurveLink`; keep Curve branding and Plane-backed Work management grouping. |
| `apps/web/app/(all)/[workspaceSlug]/(projects)/curve/initiatives/page.tsx` (new Initiative route entry) | Render the Initiative workspace for the route workspace slug and preserve disabled-state routing behavior. |
| `apps/web/core/components/curve/initiatives/` (new Initiative presentation components) | Own list, filters, detail, drawer, confirmation, badge, avatar, status, and recovery components. |
| `apps/web/core/hooks/use-curve-initiatives.ts` (new Initiative controller hook) | Own request cancellation, pagination accumulation, selection, mutation state, ETag, retry, and last-confirmed-resource behavior. |
| `apps/web/core/hooks/store/use-member.ts` (existing member-store hook) | Consume without changing its contract. |
| `apps/web/core/store/member/workspace/workspace-member.store.ts` (existing workspace member projection) | Consume `is_active` and bot-filtered member metadata without adding a second member cache. |
| `apps/web/tests/curve/curve-initiative-service.test.ts` (new typed-client contract tests) | Verify paths, query parameters, CSRF, idempotency, ETag, payloads, responses, and safe rejected errors. |
| `apps/web/tests/curve/curve-initiative-shell.test.tsx` (new UI acceptance tests) | Verify list/detail/create/lifecycle, human separation, mobile rows, reset, recovery, and keyboard behavior. |

No other file is in scope unless the implementation proves that an existing
Curve export barrel must expose one of the exact new types or components. Any
such file must be named in the PR evidence before review.

## Typed API behavior

### Reads

1. `listProducts(workspaceSlug, {state: "ACTIVE", pageSize: 100, cursor})`
   supplies the create selector. Archived Products never appear as eligible
   choices.
2. `listInitiatives(workspaceSlug, {pageSize: 100, cursor, state?, productId?})`
   follows the OpenAPI cursor contract. The hook accumulates unique results by
   Initiative ID in server order and exposes an explicit `Load more` action
   while `next_cursor` exists.
3. Search and risk filtering apply to the entire accumulated authorized
   collection. The displayed count is labeled as the visible loaded result
   count while more server pages remain.
4. `retrieveInitiative` returns both the typed resource and response ETag. The
   selected row is never populated from an unauthorized error body.
5. A new workspace slug aborts or ignores all prior-workspace responses before
   resetting resource, cursor, selection, ETag, and error state.

### Mutations

1. Every create and lifecycle attempt generates a fresh UUID idempotency key
   once and reuses that key only while retrying the same unchanged intent.
2. Create sends exactly one Product, `STANDALONE`, no Roadmap Item, the authored
   definition, one risk tier, and exactly the three gate types defined by the
   accepted schema.
3. Accept refinement sends `If-Match` plus `Idempotency-Key` and no body.
4. Pause, resume, and cancel send `If-Match`, `Idempotency-Key`, and one bounded
   reason body.
5. A successful mutation replaces the last-confirmed Initiative and ETag,
   updates the accumulated list, selects the resource, and announces the new
   state.
6. HTTP `409`, `412`, or `428` keeps the last-confirmed resource, presents a
   conflict recovery action, refetches deliberately, and never automatically
   repeats the mutation against a new version.
7. HTTP `401`, `403`, and `404` reveal no hidden Initiative metadata. Validation
   errors map only stable field codes to the exact controls; unknown errors use
   safe generic copy and preserve the correlation ID when supplied.

## UI behavior and state model

### List and selection

- Initial load shows the stable Curve shell and accessible loading state.
- Empty workspace and filter-empty states are distinct.
- Search covers title, keyword, Product name, and description for the loaded
  authorized collection.
- State and risk filters compose with search.
- Every matching accumulated Initiative remains rendered on mobile; selection
  changes the stacked detail without hiding sibling rows.
- Row state badges use one aligned geometry; status, risk, and selection are
  conveyed by text in addition to color.
- Route entry selects the first visible item only when no deliberate selection
  exists. Filtering never silently selects an invisible record.

### Human assignments

- The selector source is the current workspace's active members whose Plane
  user projection is not a bot.
- The form renders Product Approver, Technical Approver, and Code Approver while
  mapping them to `PRD_APPROVAL`, `PLAN_APPROVAL`, and `CODE_READINESS`.
- `STANDARD` and `HIGH` risk require three distinct user IDs before submission.
  All duplicate selectors receive an inline error, the first receives focus,
  and the summary is announced.
- `LOW` risk may submit assignments permitted by M1-01A; the backend remains
  authoritative for every active-human and policy invariant.
- Gate and signed-in-user avatars center derived initials with a shared,
  fixed-line-height geometry and an accessible text alternative.

### Create drawer

- Every opening resets authored fields, Product, risk, mode, three selector
  defaults, validation, status messages, and pending idempotency intent.
- Cancel, Escape, and successful creation clear the same state and return focus
  to the initiating control.
- Failed validation retains the current attempt's input. Reopening after close
  starts a fresh form.
- The drawer traps focus, labels itself as a dialog, announces errors and
  success, and remains inside the viewport at 320 CSS px width and 400% zoom.
- The production surface must satisfy the applicable WCAG 2.2 AA keyboard,
  focus, name, role, state, status-message, contrast, reflow, and target-size
  acceptance criteria from the approved experience contract.

### Lifecycle and recovery

- `DRAFT` exposes Accept refinement, Pause, and Cancel when returned as
  permitted by the authorized UI projection.
- `ALIGNING` exposes Pause and Cancel.
- `PAUSED` exposes Resume and Cancel.
- `CANCELLED` remains readable and exposes no incompatible mutation.
- Cancellation uses a named confirmation dialog and retains focus correctly
  when kept or confirmed.
- Loading, workspace empty, filter empty, permission-limited, load error,
  mutation conflict, validation error, and cancelled states follow the approved
  M1-01B experience contract.

## Acceptance matrix

| ID | Requirements | Given | When | Then | Automated evidence |
| --- | --- | --- | --- | --- | --- |
| AC-01-UI-LIST | FR-001, FR-043, NFR-016 | Authorized paginated Initiatives and Products | The route loads, accumulates, searches, filters, selects, and loads another page | Every authorized accumulated match remains addressable; workspace changes cannot leak prior state | `curve-initiative-shell.test.tsx` list/detail cases |
| AC-01-UI-CREATE | FR-001, FR-043, NFR-005 | One active Product and three active human members | A permitted member submits a valid standalone Initiative | One idempotent Draft is created, selected, announced, and shown with exact assignments and ETag | service and shell create cases |
| AC-01-UI-HUMANS | FR-001, FR-043, NFR-009 | Standard or High risk | One person is selected twice | Submission is blocked locally, every duplicate is identified, focus moves to the first invalid selector, and the API remains authoritative | distinct-human cases |
| AC-01-UI-RESET | FR-001, NFR-015 | A member closes the drawer or completes a creation | The drawer opens again | Authored fields, defaults, errors, status, and pending idempotency intent are fresh | form-reset cases |
| AC-01-UI-LIFECYCLE | FR-042, FR-043, NFR-005 | Draft, Aligning, Paused, and Cancelled resources | The permitted actions execute | Actions, ETag, idempotency, reason, state, selection, and announcements match M1-01A | lifecycle cases |
| AC-01-UI-CONFLICT | FR-043, NFR-005, NFR-009 | A stale ETag or concurrent mutation | The API returns `409`, `412`, or `428` | Last-confirmed content remains, retry is deliberate, and no mutation is automatically replayed against a new ETag | optimistic-concurrency cases |
| AC-01-UI-RECOVERY | FR-043, NFR-009, NFR-015 | Loading, empty, filter-empty, permission, validation, and server failures | Each state is entered | Copy is safe, focus and status are useful, metadata is not disclosed, and valid recovery is reachable | state-matrix cases |
| AC-01-UI-MOBILE | FR-001, NFR-015 | At least four loaded matching Initiatives at 390 px width | Search and filters change | Every match remains in the list before stacked detail; badges and avatars retain alignment with no horizontal overflow | responsive semantic/layout cases |
| AC-01-UI-KEYBOARD | FR-001, NFR-015 | Keyboard-only operation and reduced motion | The member navigates list, drawer, confirmation, and recovery | All tasks complete with visible focus, semantic names, announcements, Escape behavior, and focus restoration | keyboard/focus cases |
| AC-01-UI-DISABLED | NFR-016 | `CURVE_ENABLED=0` | Existing Plane checks and build run | The new route/navigation remains unavailable and existing Plane behavior is unchanged | disabled-state regression case |

Browser-visible layout, mobile reflow, focus order, and readable recovery states
require accountable human acceptance before the M1-01B implementation PR may
merge. Automated jsdom tests supplement that review and do not replace it.

## Exact repository-native commands

These are the required Plane commands discovered at the pinned base. Their
machine representation remains `PLANNED` until B-CODING-TOOLS-01 (local
coding-tool execution profile) approves and implements the Node/pnpm and
security execution boundary.

| Phase | Exact command | Evidence |
| --- | --- | --- |
| Install precondition | `pnpm install --frozen-lockfile --offline --ignore-scripts` | Uses the existing lockfile/cache only; any missing offline dependency stops before mutation. |
| Focused lint | `pnpm --filter=web check:lint` | Existing web lint script. |
| Focused types | `pnpm --filter=web check:types` | React Router type generation and TypeScript check. |
| Focused tests | `pnpm --filter=web test -- tests/curve/curve-initiative-service.test.ts tests/curve/curve-initiative-shell.test.tsx` | Typed client and UI acceptance cases. |
| Regression tests | `pnpm --filter=web test -- tests/curve` | Entire existing and new Curve web suite. |
| Required lint | `pnpm check` | Complete repository check. |
| Required build | `pnpm build` | Complete repository build. |
| Diff hygiene | `git --no-pager diff --check --no-ext-diff --no-textconv --ignore-submodules=all` | Closed read-only Git grammar. |
| Local run | `pnpm --filter=web dev` | Manual UI acceptance in the existing local Plane stack. |
| Security | `UNRESOLVED` | Requires the selected B-CODING-TOOLS-01 security profile and commit-bound Plane CodeQL evidence. |

The implementation PR must attach Plane CI at its exact head and provide a
CodeQL result that is complete for that same head with no Critical or High
finding. A missing, stale, partial, or inaccessible scan fails the gate.

## Fixed policy envelope

| Area | M1-01B value |
| --- | --- |
| Data | `INTERNAL`; existing authorized metadata and synthetic UI fixtures only; no protected body or credential. |
| Model | `NONE`; zero model/provider calls. |
| Budget | US$0 external spend; one active attempt; at most 120 compute minutes after authority exists. |
| Network | No provider or arbitrary egress. Existing authenticated local Plane HTTP is used only for manual acceptance after a separately authorized implementation. |
| Filesystem | Writes limited to the declared Plane web/types/services/test paths; `.git` and repository instructions remain read-only. |
| VCS | Candidate worktree only. Commit, push, and PR actions require separate explicit authority; merge is never part of the packet. |
| Security | No raw server error, credential, protected body, hidden member, or cross-workspace identifier enters UI copy, logs, snapshots, or fixtures. |
| Rollback | Revert the feature branch before merge, or disable Curve with `CURVE_ENABLED=0` after merge; no persistence rollback exists. |

## Machine-publication sequence

The current contract requires distinct ordered revisions. A single commit
cannot truthfully self-bind the evidence, catalog, and packet that it publishes.

1. **S — normative source.** Merge this packet, its context-source list, exact
   blocked packet projection, and tests. Recompute every direct reference from
   the resulting Curve source revision.
2. **E1 — authority sources.** Publish any exact human approval/role receipt
   required by the state claims. Existing approval records may be referenced
   only when their exact bytes and scope satisfy the authority contract.
3. **E2 — state and context.** Publish state-evidence records that cite an
   earlier authority-source revision and a Context Manifest whose entries bind
   S. Recompute the canonical context digest.
4. **C — source catalog.** Project the now-stable packet fields into the source
   catalog and publish it after S/E1/E2.
5. **P — packet registry.** Resolve the catalog/context/state references, make
   every required command/policy `AVAILABLE`/`APPROVED`, seal the final packet,
   and publish only that packet under the registry.
6. Run whole-registry and selected-packet readiness preflight from a clean Curve
   checkout at live `origin/main` and a clean Plane checkout whose `HEAD` is the
   allowed remote-tip commit.
7. Obtain a separate exact-digest implementation authorization and acquire one
   current attempt lease before the first repository mutation.

The prepared context and source-catalog records on this branch are review
inputs. Their future publication revisions must be filled from Git history;
they never predict or fabricate their own containing commit.
The prepared Context Manifest, source catalog, state records, packet direct
references, and canonical digest must be regenerated after the normative source
is merged; none may be promoted from this preparation branch unchanged.

## Remaining blockers

| Blocker | Exact closure |
| --- | --- |
| B-CODING-TOOLS-01 (local coding-tool execution profile) | Select and implement a Node/pnpm profile plus an exact no-download security command/evidence path; pin tool/image bytes, argv grammar, mounts, network, timeouts, outputs, and cleanup. |
| B-CODING-AUTHORITY-01 (trusted human authority and attempt lease) | Select the local bootstrap or production authority option; publish an exact human grant receipt; independently verify it; atomically acquire and maintain one current-attempt lease. |
| B-M1-01B-PUBLICATION (ordered machine publication) | Complete S -> E1 -> E2 -> C -> P with real descendant revisions, exact digests, and a passing clean-checkout preflight. |
| B-M1-01B-SECURITY (commit-bound security evidence) | Attach complete same-head Plane CI/CodeQL evidence and prove zero Critical/High finding before human merge review. |
| B-M1-01B-UX-ACCEPTANCE (implementation UX acceptance) | After implementation, Federico manually verifies the browser-visible desktop/mobile/keyboard behavior and either accepts it or reports corrections. |

The exact choices requested from the human owner are recorded in the
[M1-01B execution-grant decision record](m1-01b-execution-grant-decision.md)
(minimal Node/security profile and implementation-authority selections). No
coding agent selects those material security alternatives.

## Stop conditions

Stop before Plane mutation when any pinned source/base no longer resolves; the
Plane remote tip differs under `REQUIRE_EXACT_REMOTE_TIP`; the worktree is
dirty; the context or packet digest differs; the Project item is absent or not
the M1-01B work package; a required command is unavailable; the human grant or
lease is missing, expired, consumed, revoked, or mismatched; a target path
requires backend/migration scope; protected data or credentials would be used;
or the UI would weaken the accepted API/policy/UX contract.

During an authorized implementation, stop on an unexpected repository change,
unapproved dependency, API/schema variance, cross-workspace disclosure,
ambiguous member identity, missing same-head CI/security evidence, Critical or
High finding, or need for a material UX/product decision.

## Rollback and disablement

Before merge, revert or delete the feature branch and discard its task-local
worktree after preserving redacted evidence. After merge, set
`CURVE_ENABLED=0` and omit the Curve Compose profile; the Initiative API data
remains unchanged and historically readable. Re-enable only after the failed
acceptance or security evidence is corrected at a new exact head.
