# M0-S9B (External Provider Transport and Administration Task Packet)

## Document control

| Field | Value |
| --- | --- |
| Package | M0-S9B (external provider transport and administration foundation), a decision-gated child of M0-09 (provider integration foundation) |
| Task ID | `CURVE-M0-S9B-PROVIDER-TRANSPORT` (external provider transport and administration parent planning packet) |
| Status | `PREPARED / BLOCKED / NO_DISPATCH` |
| Version | 0.4 |
| Date | 2026-09-02 |
| Product | Curve |
| Contract repository | `git@github.com:faocampo/curve.git` |
| Implementation repository | `git@github.com:faocampo/plane.git` |
| Candidate Curve base | Curve `main` source revision `97c896ba0d82da14b3c4c8eeba54ef73c7803b01`; the original M0-S9B decision survey at `e7aa7e6...` remains immutable historical evidence, and dispatch additionally requires the accepted merge containing the exact child decision and contracts |
| Observed Plane base | `preview` at `4ae3a77f665368cf8f6a39e9434c2733551cf9d8`; `0007_initiative_gateassignment.py` (Initiative and gate-assignment migration) remains the latest accepted Curve migration and migration slot `0008` is observational only, not reserved; every implementation dispatch revalidates both values |
| Owner and human reviewer | Federico Ocampo, CTO at X3M |
| Implementer | Unassigned until an exact child packet is authorized; Codex may implement only under a later bounded authorization |
| Risk | `MATERIAL`; public administration, secret references, network endpoints, provider callbacks, outgoing notifications, schedules, and external state |
| Data boundary | Metadata-only `INTERNAL` fixtures until D-009 (retention, legal-hold, backup, and erasure decision) permits protected provider bodies |
| External effects | Prohibited until the exact child names its approved provider, target, identity, endpoint, environment, budget, and rollback |

## Outcome

Complete the provider control-plane boundary above the accepted M0-S9A
(provider-neutral registry and reconciliation foundation) substrate. The
result lets authorized humans administer provider connections, resolves
credentials through an approved broker, verifies and durably accepts provider
callbacks, sends policy-filtered Curve notifications, and schedules
authoritative reconciliation without letting callbacks or prompts become
commands.

This parent packet is a decomposition and dispatch contract. It is never sent
to a coding agent as one change. Each child below receives its own exact Curve
revision, Plane base, branch, migration allocation, owner, reviewer, budget,
data classification, environment, commands, and rollback before mutation.

## Authority and unresolved decisions

| Gate | Required approved value before the consuming child can be `READY` |
| --- | --- |
| `B-CURVE` (contract baseline) | Merged Curve revision containing this packet, the generated OpenAPI/schema/event contracts, negative fixtures, threat-model disposition, and deterministic context digest |
| `B-PLANE` (implementation baseline) | Exact reviewed Plane `preview` SHA and the next free additive Curve migration number |
| `B-ADMIN` (human administration authority and action profile) | Approved [M0-S9B1 decision record](../../contracts/governance/m0-s9b1-provider-administration-v1.json) (authority, membership, actions, separation, deny response, environment, review, budget, proofs, and approvals) at one accepted digest; the local M0-S9A (provider-neutral registry and reconciliation foundation) role-20 mapping is not generalized silently |
| `B-EXPOSURE` (provider-administration product surface) | Approved internal API-only, API-plus-Curve-UI, or defer decision; the UI alternative additionally requires its own UX contract and manual human test |
| `B-IDENTITY` (provider identity and secret policy) | Provider-specific service or delegated identity, credential broker/reference type, scopes, rotation, revocation, validation owner, and audit rules |
| `B-ENDPOINT` (network and callback policy) | Approved provider origins, DNS/IP/source allowlists, TLS/certificate requirements, signature algorithm/key source, timestamp window, payload/acknowledgement limits, and egress policy |
| `B-WEBHOOK` (outgoing notification policy) | Approved destination ownership, event allowlist, data-class ceiling, exact retry schedule within the 24-hour limit, secret rotation overlap, dead-letter owner, and external-write authorization |
| `B-RUNTIME` (environment activation) | D-003 (runtime topology and trust-zone decision) activation inputs for the target environment, worker/scheduler ownership, observability, capacity, backup, and recovery |
| `B-DATA` (body retention) | D-009 (retention, legal-hold, backup, and erasure decision) before any raw callback, normalized protected body, or protected delivery body is retained |
| `B-MCP` (MCP/Orca only) | D-006 (Orca support and license decision) and D-007 (MCP trust and delegated write-back decision); neither gates non-MCP provider transports |
| `B-VCS` (VCS only) | D-008 (VCS identity, credential, signing, allowlist, and controller-scope decision) before a GitHub or GitLab adapter is activated |
| `B-OWNER` (human accountability) | Named owner and distinct human reviewer for the exact child and provider profile, or the exact digest-bound, source-revision-bound, time-limited same-human bootstrap exception selected and approved by M0-S9B1 (provider administration API), extending beyond the next review and revalidated at dispatch |
| `B-BUDGET` (execution limits) | Exact coding-attempt budget plus provider/runtime cost ceiling where the child can incur external cost |

An AI coding agent stops without mutation when any consuming gate is absent.
An agent cannot choose a provider, credential, secret store entry, public URL,
certificate, signature scheme, role mapping, payload retention period, retry
schedule, infrastructure owner, or production/staging activation.

## Independently reviewable children

| Child | Repository-local outcome | Additional gates | Completion boundary |
| --- | --- | --- | --- |
| M0-S9B1 (provider administration API) | Versioned OpenAPI, generated TypeScript client, workspace-scoped list/read/register/validate/reconcile/disable/enable/revoke commands, safe projections, optimistic concurrency, and audit | `B-ADMIN`, `B-EXPOSURE`, `B-OWNER`, and `B-BUDGET`; [M0-S9B1 decision gate](m0-s9b1-provider-administration-decision.md) (material alternatives, fixed API/security invariants, machine lifecycle, tests, and handoff) | No credential resolution, network call, callback, schedule, or real adapter |
| M0-S9B2 (credential and endpoint profiles) | Opaque secret-reference and endpoint-profile records, broker port, rotation/revocation state, capability revalidation, and no-secret projections; the [M0-S9B2 decision packet](m0-s9b2-provider-profile-decision.md) (unselected material alternatives, fail-closed schemas, raw-byte bindings, and adversarial tests) is `PROPOSED / OWNER_SELECTION_REQUIRED / NO_DISPATCH` | `B-IDENTITY`, `B-ENDPOINT`, `B-DATA` when protected configuration is retained | No callback listener, outgoing delivery, scheduler, or provider mutation |
| M0-S9B3 (verified callback ingress) | Opaque callback endpoint binding, pre-body limits, signature/timestamp/source verification, durable inbox receipt, normalized observation, and reconciliation trigger | `B-IDENTITY`, `B-ENDPOINT`, `B-RUNTIME`, `B-DATA` when a body is retained | A callback can append an observation or request reconciliation; it cannot issue a Curve command or directly mutate external state |
| M0-S9B4 (outgoing Curve webhooks) | Subscription policy, SSRF-safe destination validation, versioned signed projection, outbox delivery, bounded retries, rotation, and visible dead letter | `B-WEBHOOK`, `B-ENDPOINT`, `B-RUNTIME`, `B-DATA` | Notifications only; a receiver response cannot change Curve business state |
| M0-S9B5 (scheduled reconciliation) | Durable due-work selector, 15-minute maximum active-binding interval, immediate gap/ambiguity trigger, lease, recovery, cancellation, and authoritative-read projection | `B-RUNTIME`, provider read identity, target-environment observability/capacity | Polling repairs projections and records conflict; it never overwrites ambiguous human provider edits |
| M0-S9B6 (provider activation packet) | One named adapter and provider profile passing shared and provider-specific conformance | Every applicable identity, data, security, infrastructure, licensing, cost, and external-effect decision | One provider/profile/environment per packet; later milestone adapters retain their own product ownership |

Only one active Plane PR is permitted for a child. M0-S9B6 (provider activation packet) is repeated for
each provider; it cannot be used as a generic approval for Onyx, MCP, Orca,
OpenHands, GitHub, GitLab, quality, flags, documentation, prototype, monitoring,
or another provider.

## Explicit child dependency graph

The provider children are not a parallel blanket authorization. Their minimum
predecessors are:

```text
M0-S9A (provider-neutral registry and reconciliation foundation) accepted provider substrate
  -> M0-S9B-D1 (external provider transport definition gate) accepted parent definition
    -> M0-S9B1-D1 (provider administration decision/readiness gate)
      -> accepted M0-S9B1 (provider administration API) implementation
        -> M0-S9B2 (credential and endpoint profiles)
          -> M0-S9B3 (verified callback ingress)
          -> M0-S9B4 (outgoing Curve webhooks)
          -> M0-S9B5 (scheduled reconciliation)
            -> M0-S9B6 (one named provider activation)
```

M0-S9B3 (verified callback ingress) through M0-S9B5 (scheduled reconciliation) may be prepared after M0-S9B1 (provider administration API) contracts are accepted,
but implementation also requires their exact M0-S9B2 (credential and endpoint profiles), runtime, and data predecessors.
M0-S9B6 (one named provider activation) consumes every applicable accepted child and one named provider profile.
No child infers an absent predecessor from this diagram.

## Required contracts before each child dispatch

### Administration API

The [M0-S9B1 decision gate](m0-s9b1-provider-administration-decision.md)
(owner-fillable authority and product choices plus fixed candidate contracts)
and its machine record remain `PROPOSED / NO_DISPATCH`. After all material
choices are approved, M0-S9B1 (provider administration API) must extend the Curve OpenAPI under
`/api/v1/workspaces/{workspace_slug}/curve/` with these resources before code:

- `GET/POST providers/connections`.
- `GET providers/connections/{connection_id}`.
- `POST providers/connections/{connection_id}:validate`.
- `POST providers/connections/{connection_id}:reconcile`.
- `POST providers/connections/{connection_id}:disable`.
- `POST providers/connections/{connection_id}:enable`.
- `POST providers/connections/{connection_id}:revoke`.

Every command requires `Idempotency-Key`; every command that mutates an existing
aggregate also requires `If-Match`. Registration creates an aggregate and
therefore has no prior ETag to match. List operations use the existing
opaque-cursor and bounded page conventions. Cross-workspace and absent identifiers share the same safe
response. Secret references, configuration bodies, callback endpoint secrets,
signing material, provider tokens, and protected provider payloads never appear
in responses, SSE, Problem Details, logs, traces, or metrics.

The candidate M0-S9B1 (provider administration API) request, connection
response, and page schemas remain explicitly `PROPOSED_NOT_NORMATIVE`, closed,
and raw-byte digest-bound until approval. They consume M0-S2 (operation,
idempotency, event, delivery, and audit persistence contract) `ResourceRef`
replay semantics and the exact accepted M0-S9A (provider-neutral registry and
reconciliation foundation) adapter coordinate. The page limit is 100 and the
opaque cursor limit is 4,096 characters.

### Persistence and event contracts

The owning child must publish closed schemas and migrations for any new record.
The expected records are `ProviderEndpointProfile`, `ProviderCallbackReceipt`,
`WebhookSubscription`, `WebhookDelivery`, and `ReconciliationLease`. Every
record, unique constraint, cache key, event, inbox/outbox row, secret reference,
and authorization input carries `workspace_id`.

Provider observations use a new schema version when they add fields to the
accepted M0-S9A (provider-neutral registry and reconciliation foundation) event
payloads. Incompatible changes use dual-read/dual-publish
and a replay fixture. Callback and delivery events contain metadata and
digests; protected bodies remain object references governed by D-009
(retention, legal-hold, backup, and erasure decision).

### Callback ingress

The provider-facing route is
`POST /api/v1/curve/provider-callbacks/{endpoint_key}` where `endpoint_key` is
opaque and resolves the workspace/connection from trusted configuration. The
request body cannot select the workspace, connection, provider, schema, secret,
or command. Ingress performs, in order:

1. connection/endpoint resolution, method/content-type/body-size/rate checks;
2. provider-specific source, signature, and trusted-time verification;
3. closed schema/version validation and provider delivery-ID extraction;
4. durable inbox and safe audit commit keyed by workspace, connection, and
   provider delivery ID or approved canonical digest;
5. acknowledgement within the provider-specific deadline;
6. asynchronous normalization and ordered projection or reconciliation.

Duplicates acknowledge after proving the original durable receipt. Forged,
stale, wrong-source, oversized, schema-invalid, and cross-workspace callbacks
produce bounded security evidence and no domain transition. A five-minute
timestamp window is the default architecture ceiling when the provider signs a
timestamp; the provider activation packet must pin its exact supported rule.

### Outgoing webhooks

Destinations are administrator-approved HTTPS URLs. Validation and every send
resolve all A/AAAA results and reject loopback, link-local, private, metadata,
multicast, reserved, mixed-public/private, alternate scheme, user-info, and
unapproved port targets. Redirect following is disabled. This follows the OWASP
[SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
(allowlisting, IP/domain validation, DNS-pinning defense, and redirect control).

The signed request uses the already specified `X-Curve-Delivery-ID`,
`X-Curve-Timestamp`, `X-Curve-Schema-Version`, and
`X-Curve-Signature-256` headers. The signature covers timestamp, delivery ID,
and exact body bytes. The approved child pins retry delays, maximum attempts,
rotation overlap, and dead-letter ownership while remaining within the
24-hour delivery window.

### Scheduled reconciliation

Every active callback-capable binding is authoritatively read at least every
900 seconds and immediately after a sequence gap, ambiguous result,
authentication recovery, suspected callback loss, or operator request. Claims
are workspace-scoped, leased, idempotent, recoverable after worker loss, and
bounded by provider rate/cost policy. Reconciliation preserves external human
edits as `EXTERNAL_STATE_CONFLICT`; it cannot reopen, delete, force-push,
approve, merge, deploy, or repeat an ambiguous mutation.

## Mandatory security and failure rules

- Workspace preauthorization executes before any provider-connection lookup.
  Read and existing-aggregate commands then perform an exact
  `(workspace_id, connection_id)` safe-metadata lookup and evaluate the exact
  `PROVIDER_CONNECTION` resource authorization before secret resolution,
  provider-event draining, network access, or scheduling mutation.
- Secret values remain in X3M Secrets Manager or another explicitly approved
  broker. Curve persists only opaque versioned references and safe status.
- Connection disablement stops new calls, callbacks after verification become
  no-effect evidence, schedules stop claiming, and active work reconciles or
  terminates under the child policy.
- Revocation is terminal for the credential/profile version and cannot be
  reversed by callback, retry, scheduler, or prompt text.
- Callback acknowledgement means durable receipt, not successful business
  processing.
- Provider success is an observation. Curve applies it only through
  workspace-scoped compare-and-set and applicable policy.
- Duplicate, stale, missing, lost, forged, delayed, and out-of-order messages
  never duplicate an external effect.
- Logs, metrics, traces, audit safe projections, SSE, and errors contain no
  secret, raw callback/delivery body, arbitrary URL, authorization header,
  provider exception, prompt, code, or unbounded identifier.

## Executable acceptance matrix

Each child owns Given/When/Then tests for its outcome and the shared matrix:

1. Curve-disabled behavior leaves Plane unchanged and starts no transport work.
2. Cross-workspace reads/writes/callbacks/schedules are indistinguishable from
   absent targets and create no cross-tenant evidence.
3. Duplicate and changed-digest administration commands authorize before
   idempotency lookup, then resolve the stored `ResourceRef` to the current safe
   projection or conflict without a second effect.
4. Denied administration performs no secret, network, callback, outbox-claim,
   schedule, or provider mutation.
5. Secret rotation, revocation, wrong version, and unavailable broker fail
   closed with redacted evidence.
6. Valid, duplicate, forged, stale, oversized, wrong-source, schema-invalid,
   out-of-order, and missing-delivery-ID callbacks exercise the durable ingress
   boundary.
7. DNS rebinding, mixed DNS answers, alternate schemes, redirects, encoded
   hosts, IPv4/IPv6 special ranges, and unapproved ports fail outgoing webhook
   validation and send-time revalidation.
8. Lost response and retry produce one outgoing delivery; approved exhaustion
   produces one visible dead-letter record.
9. Scheduler restart, expired lease, duplicate trigger, rate limit, provider
   outage, and clock boundary produce one accepted reconciliation result.
10. External human edits are preserved and produce an explicit conflict.
11. Callback and reconciliation never approve a gate, grant a waiver, mutate a
    plan, merge, deploy, or infer an external side effect.
12. Migration forward/backward-one/forward, migration-drift, contract-integrity,
    full Curve/Plane regression, CodeQL, copyright, and AGPL source-link checks
    pass on the exact child head.

## Exact verification command template

The dispatched child replaces `<PREVIOUS_MIGRATION>` and `<CHILD_MIGRATION>`
with values allocated against its exact Plane base; missing values stop before
mutation.

```bash
./setup.sh
docker compose -f docker-compose-test.yml up -d test-db test-redis test-mq test-minio
docker compose -f docker-compose-test.yml run --rm --build api-tests python manage.py migrate
docker compose -f docker-compose-test.yml run --rm api-tests pytest plane/curve/tests
node apps/api/plane/curve/contracts/check-integrity.mjs
docker compose -f docker-compose-test.yml run --rm api-tests python manage.py makemigrations curve --check --dry-run
docker compose -f docker-compose-test.yml run --rm api-tests python manage.py migrate curve <PREVIOUS_MIGRATION>
docker compose -f docker-compose-test.yml run --rm api-tests python manage.py migrate curve <CHILD_MIGRATION>
docker compose -f docker-compose-test.yml up --build --abort-on-container-exit --exit-code-from api-tests
pnpm check
pnpm build
docker compose -f docker-compose-test.yml down -v
```

Provider activation packets add only their official conformance command,
approved mock/server fixture, and explicitly authorized live proof. A live proof
never substitutes for deterministic contract, security, recovery, and
workspace-isolation tests.

## Rollback and stop conditions

Before merge, rollback is branch reversion. After merge, disable the exact
provider-transport feature, revoke its secret/profile version, stop new
callback endpoint acceptance and schedule claims, retain inspectable metadata
receipts, and reconcile outstanding deliveries under the approved runbook.
Additive tables remain during the compatibility window; reverse migration is
limited to disposable proof databases.

Stop immediately if work needs an unresolved decision, another repository,
provider access, credential, protected body, public/staging/production endpoint,
infrastructure mutation, wider role, different retry/retention value, or
external side effect absent from the exact child authorization.

## Completion boundary

This packet closes the M0-S9B (external provider transport and administration
foundation) planning gap only. M0-S9B (external provider transport and
administration foundation) becomes complete after
every required foundation child and each R1-required provider activation packet
has accepted, merge-bound evidence. M0-S9C (Model Gateway routing and failover)
separately owns AC-57 (model-failover policy and actual-route evidence).
