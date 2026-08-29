# M0-S9C Model Gateway Routing and Failover Task Packet

## Document control

| Field | Value |
| --- | --- |
| Package | M0-S9C (Curve Model Gateway routing, policy, usage, and failover), a decision-gated child of M0-09 (provider integration foundation) |
| Task ID | `CURVE-M0-S9C-MODEL-GATEWAY` |
| Status | `PREPARED / BLOCKED / NO_DISPATCH` |
| Version | 0.1 |
| Date | 2026-08-28 |
| Product | Curve |
| Contract repository | `git@github.com:faocampo/curve.git` |
| Implementation repository | `git@github.com:faocampo/plane.git` |
| Candidate Curve base | Curve `main` at `03b26cdb576962fad8e2047fedcfafa2636bfc23`, the squash merge of Curve PR #39 (M0-S9A implementation-evidence reconciliation); dispatch additionally requires accepted Curve `main` revisions for this packet, D-004 (Model Gateway architecture decision), and D-005 (model, provider, and data-policy decision) |
| Candidate Plane base | `preview` at `af7187d049c6ee6d0c82a5c70b686d4c444e9b63`, containing accepted M0-S9A (provider-neutral registry and reconciliation foundation) |
| Owner and human reviewer | Federico Ocampo, CTO at X3M |
| Implementer | Unassigned until exact child authorization |
| Risk | `MATERIAL`; model/provider routing, prompt destinations, usage/cost, streaming, cancellation, and data-policy enforcement |
| Runtime provider | OpenRouter is the proposed gateway transport; no account, key, model, provider, route, or data policy is approved by this packet |
| Acceptance ownership | Completes AC-57 (model failover preserves policy and records actual routing) after D-004 (Model Gateway architecture decision) and D-005 (model, provider, and data-policy decision) approval plus accepted implementation evidence |

## Outcome

Implement one thin Curve-owned policy and audit boundary above OpenRouter. The
gateway validates an immutable `ModelPolicyVersion`, reserves budget, resolves
one ordered set of eligible model/provider routes, executes through a
provider-neutral interface, records the actual route and usage, and fails
closed when no destination satisfies the task, classification, retention,
training, residency, capability, budget, and availability policy.

Curve never delegates its policy decision to OpenRouter defaults. OpenRouter
may execute only the exact route envelope Curve computed. A budget or provider
failure pauses or fails the operation with a typed result; it cannot silently
change model, provider, data handling, tool capability, prompt version, or
review independence.

## Blocking decisions and required values

| Gate | Required approved result before the consuming child can be `READY` |
| --- | --- |
| D-004 (Model Gateway architecture decision) | Exact in-process/service boundary, OpenRouter API/SDK version, availability/SLO ownership, request/stream/cancel/recovery behavior, telemetry boundary, key management, license/supply-chain review, and replacement strategy |
| D-005 (model, provider, and data-policy decision) | Task-class allowlist; exact model/provider identifiers and versions; required capabilities; `INTERNAL`/`CONFIDENTIAL`/`RESTRICTED` destination rules; ZDR/training/retention/residency constraints; fallback equivalence; evaluation evidence; approvers and review/expiry |
| D-014 (budget-policy decision) | Currency, reservation/commit/release semantics, workspace/initiative/operation limits, reset, exception authority, exhaustion behavior, and reconciliation owner |
| D-009 (retention, legal-hold, backup, and erasure decision) | Required before Curve persists prompt, completion, tool argument/result, or other protected body; references/digests and permitted metadata remain the default |
| Runtime identity | Approved OpenRouter account/workspace, opaque secret reference, scopes, rotation/revocation, environment, origin/TLS/egress policy, and operational owner |
| Contract baseline | Merged OpenAPI/JSON Schema/event/interface contracts, exact Plane base/migration allocation, deterministic context digest, owner/reviewer, budget, commands, and rollback |

The coding agent cannot select a model, latest alias, provider order, fallback,
region, ZDR setting, logging option, training permission, key, budget, prompt,
tool, or data classification. A missing, expired, or contradictory value stops
before repository mutation or model access.

## Independently reviewable children

| Child | Repository-local outcome | External access | Completion boundary |
| --- | --- | --- | --- |
| M0-S9C1 (Model Gateway contracts) | Closed schemas for `ModelPolicyVersion`, `ModelRouteEnvelope`, `ModelInvocation`, `ModelUsage`, normalized stream events/errors, capability rules, and fake conformance fixtures | None | Approved contracts and negative fixtures; no runtime call |
| M0-S9C2 (policy and budget kernel) | Workspace-scoped immutable policy versions, eligibility evaluator, budget reservation port, route decision, idempotency, audit, and deterministic fake gateway | None | Fake-only tests prove policy precedence, no-route, budget, route binding, and replay |
| M0-S9C3 (OpenRouter transport) | Authenticated request/stream/cancel/usage adapter behind `ModelGateway`, exact route-envelope translation, normalized errors, and actual-route evidence | Requires exact OpenRouter proof authorization | No fallback outside the Curve envelope; no public UI or policy administration |
| M0-S9C4 (failover and reconciliation) | Ordered eligible-route retry/failover, ambiguous/lost response reconciliation, usage settlement, cancellation, and actual-route audit | Requires D-004 (Model Gateway architecture), D-005 (model/provider/data policy), and D-014 (budget policy) values plus provider proof authorization | Completes AC-57 with deterministic plus bounded live evidence |

Only one child PR is active at a time. A live OpenRouter test is confined to
M0-S9C3 or M0-S9C4 and requires a separate exact account/key/data/cost/egress
authorization.

## Required interface contracts

`ModelGateway` exposes:

- `generate(request) -> ModelResult`.
- `stream(request) -> ordered ModelStreamEvent`.
- `count_tokens(request) -> TokenEstimate`.
- `cancel(invocation_ref) -> CancelResult`.
- `report_usage(invocation_ref) -> ModelUsage`.

Each request includes `workspace_id`, `operation_id`, task class, classification,
prompt/body references and digests, prompt version, requested capabilities,
maximum input/output tokens, maximum cost, deadline, cancellation token,
immutable policy version/digest, context digest, correlation/causation IDs, and
an idempotency digest. The request carries no caller-selected route outside the
policy envelope.

`ModelRouteEnvelope` contains the ordered eligible route IDs, exact model and
provider identifiers, capability requirements, data-handling constraints,
maximum cost/tokens, expiry, and policy digest. It is immutable after dispatch.
The adapter accepts no route absent from that envelope.

`ModelInvocation` records the planned envelope digest, actual model/provider/
endpoint evidence, provider request ID when available, normalized status,
token/cost usage, timestamps, prompt/response digests or protected references,
trace policy, provider policy snapshot, and error code. Raw prompt, completion,
reasoning, tool data, key, and exception text are excluded from ordinary tables,
logs, traces, metrics, SSE, and safe audit projections.

## OpenRouter transport rules

OpenRouter's official
[Quickstart](https://openrouter.ai/docs/quickstart)
(Bearer authentication and `/api/v1/chat/completions`) and
[Chat API reference](https://openrouter.ai/docs/api/api-reference/chat/send-chat-completion-request?explorer=true)
(request/response contract) are implementation inputs after D-004 (Model
Gateway architecture decision) approval.
The official
[provider-routing documentation](https://openrouter.ai/docs/guides/routing/provider-selection)
(provider order, fallback, parameter, data-collection, ZDR, and allowlist controls)
shows that OpenRouter has routing defaults; Curve therefore supplies an explicit
provider envelope and never relies on those defaults.

For every request:

- `models`/`model` and provider `only`/`order` contain only approved exact IDs.
- `require_parameters` is enabled when the task contract requires capabilities.
- fallback is disabled unless the immutable Curve envelope contains more than
  one approved equivalent route; fallback never widens that envelope.
- the request's data-collection and ZDR controls are derived from D-005 (model,
  provider, and data-policy decision), never
  from a caller or a convenience default.
- `RESTRICTED` is rejected unless D-005 supplies an unexpired approved ZDR,
  residency, retention, and training-compatible route plus required DLP proof.
- actual-route metadata is requested and validated. The official
  [router-metadata documentation](https://openrouter.ai/docs/guides/features/router-metadata)
  (actual routing metadata across completion routes) is the proposed evidence
  source; absent or contradictory route evidence prevents successful audit
  settlement.
- prompt/input-output logging remains disabled unless D-005 (model, provider,
  and data-policy decision) and D-009 (retention, legal-hold, backup, and erasure
  decision) explicitly
  approve the exact purpose, destination, access, and retention. OpenRouter's
  [data-collection documentation](https://openrouter.ai/docs/guides/privacy/data-collection)
  (provider touchpoints and opt-in prompt retention) and
  [ZDR documentation](https://openrouter.ai/docs/guides/features/zdr)
  (per-request ZDR routing) are reviewed and pinned in the D-005 evidence.

No `latest`, automatic, floating, free, preview, or provider-agnostic alias is
permitted unless D-005 explicitly names its resolution and invalidation policy.

## Policy, failover, and budget semantics

1. Resolve the immutable policy version and reject expiry/supersession.
2. Intersect task, classification, capability, provider/model, data handling,
   residency, trace, and budget constraints; stricter constraints win.
3. Produce and audit one ordered immutable route envelope or `NO_ELIGIBLE_ROUTE`.
4. Reserve the maximum approved cost before network access.
5. Execute the first route with the exact prompt/tool/policy versions.
6. Retry only normalized transient/rate-limit failures within deadline and the
   same route policy. An ambiguous result is reconciled before another call.
7. Move to the next route only when the envelope explicitly permits equivalent
   failover and the original failure class allows it.
8. Record the actual route and settle usage against the reservation. Missing
   usage becomes a reconciliation case, not zero cost.
9. Release unused reservation or pause on settlement ambiguity under D-014
   (budget-policy decision).
10. Emit a typed terminal result; never silently rerun on another model/provider.

Changing the plan, prompt, context, policy, classification, capability, budget,
or allowed route set creates a new invocation and idempotency digest. It cannot
reuse or overwrite the old invocation.

## Normalized statuses and errors

Statuses are `PENDING`, `RESERVED`, `ROUTED`, `STREAMING`, `SUCCEEDED`,
`FAILED`, `CANCELLED`, `TIMED_OUT`, and `RECONCILIATION_REQUIRED`. Errors are
closed and include `VALIDATION`, `AUTHENTICATION`, `AUTHORIZATION`, `POLICY`,
`DATA_CLASSIFICATION`, `NO_ELIGIBLE_ROUTE`, `CAPABILITY_UNSUPPORTED`,
`BUDGET_EXHAUSTED`, `RATE_LIMIT`, `TRANSIENT`, `AMBIGUOUS_RESULT`,
`USAGE_UNSETTLED`, `CANCELLED`, `TIMEOUT`, and `TERMINAL`.

Provider text is mapped to the closed taxonomy and retained only as a protected
reference when policy permits. An unknown provider error maps to `TERMINAL` or
`RECONCILIATION_REQUIRED` under the approved contract; it is never treated as
retryable by string matching.

## Executable acceptance matrix

1. Curve-disabled behavior makes no model call and leaves Plane unchanged.
2. Cross-workspace policy, budget, key, invocation, usage, and result access is
   denied before lookup or provider access.
3. Duplicate request digest replays one invocation/result; changed digest
   conflicts without another call.
4. Missing, expired, unapproved, or conflicting policy produces no route and no
   reservation/provider call.
5. Classification, retention/training, residency, ZDR, capability, model,
   provider, token, cost, and prompt-version mismatches fail closed.
6. Budget reservation failure or exhaustion makes no provider call; ambiguous
   settlement pauses later chargeable work.
7. Primary outage uses only the next explicitly approved equivalent route and
   records the primary failure plus actual fallback route.
8. Prohibited provider, model, or route returned by transport metadata fails
   settlement and opens a security/reconciliation case.
9. Streaming sequence, disconnect/reconnect, cancellation, timeout, late event,
   and duplicate terminal event preserve one terminal invocation.
10. Ambiguous/lost response reconciles by provider request identity before any
    repeated chargeable call.
11. Usage/token/cost metadata reconciles exactly; missing or changed usage does
    not become zero or overwrite immutable history.
12. Prompt, completion, reasoning, tool data, key, arbitrary metadata, and
    provider exceptions are absent from logs, traces, metrics, SSE, Problem
    Details, and safe audit.
13. Fake conformance covers every status/error/failover path deterministically;
    the bounded live proof confirms only the approved transport/account profile.
14. Migration, contract-integrity, complete Curve/Plane regression, CodeQL,
    copyright, dependency, and AGPL source-link checks pass on the exact head.

## Exact verification command template

The dispatched child pins migration values and any approved live conformance
command before mutation.

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

The fake-gateway children prohibit network and credentials. The OpenRouter
children add one approved provider-conformance command with a hard cost ceiling,
synthetic permitted prompts, redacted captured evidence, credential revocation,
and cleanup. No live model response is accepted as the sole proof of policy,
failover, budget, workspace isolation, or recovery.

## Rollback and stop conditions

Before merge, rollback is branch reversion. After merge, disable the Model
Gateway feature and all model `ProviderConnection` versions, cancel/reconcile
active invocations, release or quarantine unsettled reservations under D-014
(budget-policy decision),
revoke the OpenRouter secret reference, and preserve immutable metadata-only
audit/usage evidence. Additive tables remain for the compatibility window;
reverse migration is limited to disposable proof databases.

Stop if any exact decision, model/provider route, data policy, key, budget,
classification, prompt/tool version, endpoint, command, migration, owner,
reviewer, or rollback value is absent or changed. Stop if implementation would
allow provider defaults, silent failover, prompt logging, unbounded metadata,
agent-selected policy, external side effects, or production/staging activation
outside the approved child.

## Completion boundary

This packet closes the Model Gateway planning and identifier gap. M0-S9C and
AC-57 become complete only after D-004 (Model Gateway architecture decision),
D-005 (model, provider, and data-policy decision), and D-014 (budget-policy
decision) are decided, all required
children have accepted merge-bound evidence, and the actual-route failover
matrix passes. No model-enabled M1, M3, or M5 package may infer readiness from
this prepared packet.
