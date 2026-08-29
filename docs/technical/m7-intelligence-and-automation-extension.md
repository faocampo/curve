# M7 Intelligence and Automation Extension

## Document control

| Field | Value |
| --- | --- |
| Status | Post-R1 product-extension charter |
| Version | 0.1 |
| Last updated | 2026-08-15 |
| Source | [Curve PRD v0.8](../curve-ai-native-sdlc-prd.md), M7 integration-expansion scope |
| Audience | Product, finance, engineering, security, operations, and integration owners |
| Catalog status | Future scope; outside the active 71-item GitHub Project #2 catalog |

## Purpose and scope

Curve will eventually extend its control-plane capabilities in three connected areas:

1. **AI-execution expense governance** — observe, explain, forecast, and control costs produced by model, tool, sandbox, and agent-execution activity.
2. **Attention intake** — integrate with user-authorized Gmail accounts and explicitly selected Slack channels to gather notices, identify items requiring human attention, and route the resulting attention item to the right Curve decision context.
3. **Scheduled AI-agent jobs** — create, govern, run, pause, and audit recurring AI-agent jobs against approved workspaces, contexts, policies, budgets, and schedules.

These capabilities extend Curve after R1. They preserve the existing three-gate lifecycle, workspace isolation, delegated access, immutable audit history, trusted-controller boundaries, and human approval authority.

## Capability 1: AI-execution expense governance

### Product outcome

An authorized user can understand current and projected AI-execution spending, identify the initiative/run/provider responsible for material consumption, and apply approved controls before a budget is exceeded.

### Required capabilities

| Capability | Required behavior |
| --- | --- |
| Unified usage ledger | Normalize model tokens, cache reads/writes, provider requests, tool calls, sandbox time, storage, preview resources, and provider fees into attributable usage records. |
| Cost attribution | Attribute each record to workspace, initiative, activity, attempt, provider/model/tool, policy version, and time window. Shared costs use a named allocation method and retain its source inputs. |
| Budget hierarchy | Support workspace, initiative, activity, attempt, provider, and schedule budgets with currency, reset period, hard/soft limit, owner, and escalation policy. |
| Forecasting and alerts | Show actual spend, reserved spend, projected spend, variance, and budget runway. Alert responsible users before soft or hard limits are reached. |
| Execution controls | Apply approved pause, resume, rate-limit, concurrency-limit, provider/model restriction, and budget-adjustment commands. Every control action records actor, reason, policy version, effective time, and affected work. |
| Explainability | From every cost total, navigate to the underlying usage records and execution/evidence context without exposing restricted prompts, secrets, or protected content. |

### Control invariants

- A hard-budget breach pauses the affected activity before another chargeable operation begins.
- Forecasts and allocation results remain projections; the underlying normalized usage ledger remains authoritative.
- A budget adjustment is a human-authorized, versioned decision. An agent cannot raise its own budget or change its own provider/model allowance.
- Provider-reported cost and internal estimates are stored separately with their source and measurement time.

## Capability 2: Gmail and Slack attention intake

### Product outcome

An authorized user can connect Gmail and selected Slack channels so Curve identifies high-signal notices requiring attention and relates them to an initiative, task, gate, risk, or operational follow-up.

### Connection and scope model

| Source | Initial scope | Curve behavior |
| --- | --- | --- |
| Gmail | User-authorized account, configured labels/search scope, and explicitly selected message categories | Read metadata and permitted content, classify candidate notices, retain only the minimum permitted derivative, and link the user to the source message. |
| Slack | Workspace-authorized connector and explicitly selected channels | Read allowed channel activity, identify candidate notices, retain the minimum permitted derivative, and link the user to the original conversation. |

The initial integration mode is read and classify. Sending email, posting Slack messages, changing labels, altering channel settings, or inviting users requires a distinct future write-capability decision, scope, and authorization model.

### Attention workflow

```text
Authorized source event or bounded poll
  -> source access and workspace policy check
  -> signal extraction and importance classification
  -> deduplication and correlation with Curve work
  -> attention item with source link, reason, confidence, and expiry
  -> user review, assign, dismiss, snooze, or create a governed follow-up
```

### Attention-item contract

Every attention item records source type, external message/conversation reference, workspace, connector and access scope, observed time, relevance reason, confidence, classification, correlation target, deduplication key, status, and immutable review disposition. Curve presents the user with the provider-supplied link; it does not construct a substitute message URL from an identifier.

### Privacy, relevance, and safety controls

- Users and workspace administrators choose the Gmail scopes and Slack channels; unselected sources remain inaccessible.
- Source access is rechecked for every retrieval and every later refresh.
- The classifier produces a recommendation with reason and confidence. It does not present a message as an established project fact without linked source evidence.
- Retention, redaction, export, and deletion follow the source classification and approved policy. Content that Curve cannot retain safely is represented only by permitted metadata and a source link.
- A user can dismiss, snooze, or mark an item as non-actionable; the disposition improves future routing while preserving audit history.

## Capability 3: Scheduled AI-agent jobs

### Product outcome

An authorized user can define a recurring AI-agent job, understand its next run and budget, control its lifecycle, and review every resulting attempt and attention item.

### Job definition

| Field | Required meaning |
| --- | --- |
| Job identity and owner | Workspace-scoped stable identity plus accountable human owner. |
| Purpose and target | A bounded objective, selected initiative or operational domain, and explicit success/stop conditions. |
| Schedule | Timezone-aware one-time or recurring schedule, effective period, missed-run policy, blackout windows, and next-run calculation. |
| Execution policy | Approved agent/provider/model/tool policy, data classification, context sources, allowed side effects, concurrency limit, retry policy, and timeout. |
| Budget policy | Per-run, period, and aggregate cost limits; reservation behavior; alert threshold; and escalation owner. |
| Human control | Enabled, paused, cancelled, superseded, or expired state; attributed commands and reason are immutable. |
| Output routing | Approved destination such as a Curve attention item, task update, evidence record, or review queue. |

### Runtime behavior

1. The scheduler evaluates the timezone-aware schedule and records a due occurrence with an idempotency key.
2. Curve rechecks job status, owner, policy version, connector access, data classification, concurrency, and budget reservation before dispatch.
3. The trusted execution boundary starts an attributed attempt only when all checks pass.
4. The job records attempt state, usage, output references, questions, errors, and result disposition using the same replay-safe workflow conventions as other Curve execution.
5. A missed, duplicate, blocked, or exhausted occurrence remains visible with its reason. It does not silently execute later under changed conditions.

### Control invariants

- A scheduled job has no authority beyond its approved execution policy and output-routing allowlist.
- Each scheduled occurrence is independently idempotent, auditable, cancellable, and budgeted.
- Pausing or cancelling a job prevents future dispatch and triggers the applicable in-flight cancellation/reconciliation process.
- Any side effect beyond a read, candidate artifact, or permitted Curve workflow update requires an explicit pre-authorized action and the existing trusted-controller path.

## Delivery and governance gates

Before any M7 capability enters implementation, its accountable owners record an extension decision that includes scope, data classification, provider terms, access model, retention, threat model, cost limits, support ownership, rollout/rollback, acceptance tests, and disablement behavior. The resulting repository-local work packages are added only through an approved revision of the development plan and GitHub Project catalog.

| Extension area | Required owners | Minimum proof before enablement |
| --- | --- | --- |
| Expense governance | Product, finance, platform, security | Usage-source reconciliation, attribution/forecast fixtures, hard-limit pause, authorized adjustment, and dashboard access-control tests. |
| Gmail/Slack attention intake | Product, security/identity, privacy, connector owner | Delegated access/revocation, channel/scope filtering, source-link correctness, deduplication, redaction/retention, classifier precision review, and audit tests. |
| Scheduled jobs | Product, platform, security, operations | Timezone/recurrence fixtures, idempotent dispatch, missed-run handling, budget/concurrency enforcement, cancellation/reconciliation, and output-routing authorization tests. |

## User-facing surfaces

The M7 surfaces extend the existing Curve navigation model without exposing provider administration as the primary experience:

| Surface | User decision |
| --- | --- |
| Cost control | Understand spend and forecast; adjust an approved budget or pause affected execution. |
| Attention inbox | Review, assign, dismiss, or snooze a high-signal Gmail/Slack notice with its source link and Curve correlation. |
| Scheduled jobs | Create, review, pause, resume, cancel, and inspect a governed recurring job and its occurrences. |

Every user-facing M7 package follows the [Curve Experience Blueprint](curve-experience-blueprint.md) gate before implementation.
