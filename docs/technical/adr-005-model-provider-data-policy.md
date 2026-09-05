# ADR-005: Candidate Model and Provider Data Policy

## Document control

| Field | Value |
| --- | --- |
| Decision | D-005 (model/provider data-policy decision) |
| Work package | M0-S9C1A (candidate Model Gateway architecture and data-policy contracts) |
| Status | `PROPOSED_NOT_NORMATIVE / EMPTY_ALLOWLIST / UNSELECTED / NO_DISPATCH` |
| Version | 0.1 |
| Date | 2026-08-31 |
| Surveyed Curve base | `1c38a5398b9e6c7cf83c8ee7e8a4615f8f2450d1` |
| Decision owners | AI Governance, Security, Privacy/Legal, and Curve Product; named humans unresolved |
| Activation | Candidate-contract review only; no model/provider route, fallback, `RESTRICTED` route, protected-data use, implementation, or runtime call |

## Decision question

Select the versioned task, classification, model, provider, endpoint, data
handling, evaluation, fallback, telemetry, exception, and drift policy that
every Curve model invocation must satisfy.

The [D-005 candidate decision record](../../contracts/governance/d005-model-data-policy-v1.json)
(unselected policy alternatives, raw-byte contract bindings, evidence gaps,
dependencies, approvals, and fail-closed activation) is the machine companion.

## Fixed invariants

- `UNKNOWN` classification normalizes to `RESTRICTED`.
- An empty model or task allowlist denies every model call.
- Model IDs, revisions, providers, endpoints, regions, and provider policies
  are exact; floating/latest/provider-agnostic aliases are rejected.
- Every route is eligible only when task, classification, capabilities, token
  limits, prompt policy, evaluation, provider terms, residency, telemetry, and
  budget all match.
- Provider defaults and silent fallback are disabled.
- Requested and actual route evidence is mandatory.
- The route policy is immutable for one chargeable attempt. A route change is a
  new attempt with new budget, idempotency, and audit bindings.
- Budget failure pauses; it never changes a route.
- `RESTRICTED` remains denied unless an exact route has all required current
  evidence and the later implementation is separately authorized.
- This candidate policy authorizes no protected-body persistence, runtime call,
  provider access, or implementation dispatch.

## Material alternatives

| Decision surface | Alternatives | Unselected consequence |
| --- | --- | --- |
| Classification | `EXACT_TASK_CLASSIFICATION_ROUTE_MATRIX`; `DEFER` | No task/classification route may run. |
| `RESTRICTED` | `DENY_ALL_RESTRICTED`; `ZDR_DLP_RESIDENCY_EVIDENCE`; `DEFER` | `RESTRICTED` remains denied. |
| Fallback | `SINGLE_ROUTE_NEW_AUDITED_ATTEMPT`; `EQUIVALENT_ROUTE_ENVELOPE`; `NO_FALLBACK`; `DEFER` | No fallback may occur. |
| Evaluation | `TASK_SPECIFIC_VERSIONED_THRESHOLDS`; `DEFER` | No model is quality-approved for any task. |
| Data terms | `ENDPOINT_SPECIFIC_EVIDENCE_SNAPSHOT`; `DEFER` | No provider endpoint is eligible. |
| Exceptions | `NO_EXCEPTIONS`; `TIME_BOUND_HUMAN_APPROVED`; `DEFER` | No exception exists. |
| Telemetry | `METADATA_ONLY`; `PROTECTED_TRACE_DESTINATION`; `DEFER` | Protected model traces remain disabled. |
| Catalog drift | `FAIL_CLOSED_ON_DIGEST_CHANGE`; `DEFER` | Any catalog mismatch denies routing. |

## Candidate contract set

| Contract | Candidate purpose | Current fail-closed state |
| --- | --- | --- |
| [Model catalog](../../contracts/models/m0-s9c1a-model-catalog-v1.json) (exact model/provider endpoint, capability, data-term, lifecycle, price, and evidence fields) | Versioned route inventory | Empty; allowlist inactive. |
| [Task-model policy matrix](../../contracts/models/m0-s9c1a-task-model-policy-v1.json) (task/classification route allowlist, prompt/evaluation pins, token/cost bounds, and exception profile) | Maps a Curve model task and classification to eligible routes | Empty; policy activation disabled. |
| [Fallback-equivalence contract](../../contracts/models/m0-s9c1a-fallback-equivalence-v1.json) (quality, capability, data, residency, security, context, latency, and cost evidence) | Proves exact route equivalence and allowed trigger codes | Empty and unselected; fallback disabled. |
| [`RESTRICTED` route-evidence contract](../../contracts/models/m0-s9c1a-restricted-route-evidence-v1.json) (ZDR, DLP, residency, terms, telemetry, legal, and actual-route proof) | Closes the eight-evidence route gate | Empty; approved route set empty. |

All four records declare `PROPOSED_NOT_NORMATIVE`, bind no decision digest, and
activate no route. Their raw UTF-8 bytes are SHA-256-bound in the D-005
(model/provider data-policy decision) candidate record. Any byte change requires
a reviewed successor binding.

## Route-eligibility algorithm

1. Normalize source classifications; any unknown source makes the request
   `RESTRICTED`.
2. Resolve the exact immutable task-policy and model-catalog versions/digests.
3. Require an exact task/classification policy row. An absent row denies.
4. Intersect allowed route IDs with current active catalog entries.
5. Require the exact capabilities, prompt/evaluation versions, input/output
   limits, provider terms, training/retention rules, region, telemetry policy,
   and expiry.
6. For `RESTRICTED`, require one complete route-evidence record whose eight
   evidence artifacts are passing, unexpired, route-bound, and human approved.
7. Require D-014 (budget accounting and exception policy), reserve maximum cost,
   and bind the reservation to the exact route decision.
8. Emit one immutable route decision or `NO_ELIGIBLE_ROUTE`.
9. Reject a response whose actual route differs from the allowed decision.
10. Settle usage; missing or contradictory cost remains unsettled rather than
    becoming zero.

## Fallback equivalence

An eligible fallback must separately pass all eight dimensions:

- task-quality threshold and regression corpus;
- capability and parameter support;
- data retention/training/ZDR terms;
- processing residency;
- security and red-team requirements;
- context and output limits;
- latency/SLO bounds; and
- D-014-compatible cost bounds.

Allowed trigger codes are closed to rate limit, bounded transient failure,
timeout, and provider outage. Authentication, authorization, policy,
classification, capability, budget, moderation/refusal, malformed output,
ambiguous result, and usage disagreement cannot silently trigger fallback.

The candidate recommendation is one exact route per chargeable attempt, with
an equivalent fallback represented as a new audited attempt. It remains an
unselected alternative in both D-004 (Model Gateway architecture decision) and
D-005 (model/provider data-policy decision).

## `RESTRICTED` route gate

Each approved route needs exactly these evidence types:

1. `ZERO_DATA_RETENTION`;
2. `PRE_CALL_DLP`;
3. `POST_CALL_LEAK_SCAN`;
4. `PROCESSING_RESIDENCY`;
5. `RETENTION_AND_TRAINING_TERMS`;
6. `TELEMETRY_DESTINATION`;
7. `PRIVACY_LEGAL_APPROVAL`; and
8. `ACTUAL_ROUTE_ATTESTATION`.

Every evidence artifact binds its type, route ID, repository, reference, source
revision, content digest, checked time, expiry, and result. One artifact cannot
authorize another route. An expired, missing, failed, mismatched, or duplicate
evidence type removes the route from the approved set.

OpenRouter's
[provider logging](https://openrouter.ai/docs/guides/privacy/provider-logging)
(provider-specific logging, retention, and training information),
[data collection](https://openrouter.ai/docs/guides/privacy/data-collection)
(OpenRouter metadata and optional prompt/response collection), and
[Zero Data Retention](https://openrouter.ai/docs/guides/features/zdr)
(account, guardrail, model-group, request, and endpoint ZDR behavior) are source
inputs. Exact Example Organization contractual terms, account settings, endpoints, regions, and
measured evidence remain required before any route can be approved.

## Evaluation and drift

Every task-policy row binds a prompt policy, evaluation suite/version/digest,
minimum score, input/output limits, and exact allowed routes. Model/provider
changes, catalog-byte changes, terms changes, evaluation regression, route
expiry, evidence expiry, or price changes invalidate the old eligibility
decision. Curve pauses; it does not silently update to a new model or provider.

## D-009 and D-014 dependencies

- D-009 (retention, backup, legal-hold, and erasure decision) must be decided
  before Curve persists prompt, completion, reasoning, tool, or protected trace
  bodies. This candidate stores only metadata and digests.
- D-014 (budget accounting and exception policy) must be decided before any
  chargeable invocation. Every catalog price is integer micro-USD and declares
  a D-014 binding requirement; every task policy carries a maximum cost.

## Promotion and stop conditions

D-005 (model/provider data-policy decision) remains `PROPOSED` until all eight
material selections, exact catalog and policy rows, required evaluation and
data evidence, four named owners, four distinct human approvals, decision
timestamp, review timestamp, and decision digest are complete. An approved
D-005 decision also requires a digest-bound decided D-004 (Model Gateway
architecture decision). `DEFER` is a valid explicit outcome.

Stop if any candidate artifact activates an allowlist, task policy, fallback,
or `RESTRICTED` route; if a model/provider/endpoint is invented; if evidence is
not exact-route bound; if D-014 cost authority is absent; or if the package
claims runtime, implementation, protected-data, provider, or deployment
authority.
