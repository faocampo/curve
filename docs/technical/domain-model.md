# Curve Domain Model and Persistence Contract

## Document control

| Field | Value |
| --- | --- |
| Status | Architecture input; M0-S2 relational decisions and M0-03 policy kernel implemented; M0-S9A local provider substrate has approved bounded delivery and Option B registration authority and remains exact-publication/dispatch gated; remaining capabilities stay packet/decision gated |
| Source | [Curve PRD v0.12](../curve-ai-native-sdlc-prd.md) (product, Curve-first shell, lifecycle, security, private-platform connectivity, accepted local Temporal proof, and acceptance contract) |
| Audience | Architecture, backend, workflow, security, data, and AI coding agents |
| Last updated | 2026-08-25 |
| Scope | Logical domain and persistence model for Curve R1 |

## 1. Purpose and precedence

This document derives the logical domain model required by [Curve PRD v0.12](../curve-ai-native-sdlc-prd.md) (current product and acceptance contract). It is sufficiently precise to drive an ERD, migrations, API schemas, workflow code, repositories, and tests. D-001 fixes the Plane/Curve repository and authority boundary; D-003 fixes the implemented local shared-network and private-platform connectivity direction while retaining environment-package activation inputs. The document does not select the remaining database topology details, object-storage product, identity mechanism, real-provider version, retention period, or other owner-gated decisions D-002 through D-016.

The PRD remains authoritative. Its scope invariants, lifecycle transitions, numbered functional requirements (FR), non-functional requirements (NFR), acceptance criteria (AC), and decision register take precedence over this document. If this document cannot be implemented without changing one of those contracts, the implementation MUST stop and propose a PRD revision; it MUST NOT silently reinterpret the requirement.

Normative terms use RFC 2119 meanings. The models below are logical types. A derived architecture MUST map them to physical types, constraints, and services without weakening their semantics.

### 1.1 Traceability summary

| Domain area | Primary PRD traceability |
| --- | --- |
| Workspace, authorization, and external references | FR-001, FR-003, FR-043, FR-044; NFR-005, NFR-009-NFR-011; AC-04, AC-35, AC-52-AC-54, AC-60; D-001-D-003, D-007-D-009 |
| Product roadmaps | FR-025-FR-031, FR-037; NFR-018; AC-02, AC-37-AC-43; D-001, D-013 |
| Initiative, workflow, artifacts, and gates | FR-001-FR-007, FR-021-FR-022, FR-042; NFR-004, NFR-011-NFR-012, NFR-018; AC-01-AC-09, AC-20, AC-34 |
| Evidence and context | FR-003-FR-004, FR-012, FR-043; NFR-010-NFR-011, NFR-018, NFR-020; AC-04, AC-09, AC-15, AC-53-AC-54, AC-56, AC-60; D-002, D-005, D-007, D-009 |
| Planning and execution | FR-008-FR-015, FR-042; NFR-004-NFR-008, NFR-017, NFR-020; AC-10-AC-22; D-006, D-008, D-014 |
| Quality and VCS | FR-016-FR-024, FR-041, FR-044; NFR-003-NFR-005, NFR-011, NFR-013-NFR-014, NFR-018; AC-23-AC-36, AC-44, AC-49; D-008, D-010 |
| Feature Delivery | FR-032-FR-040; NFR-011, NFR-018; AC-44-AC-51; D-010-D-012 |
| Operations, history, and erasure | FR-021, FR-023-FR-024, FR-042-FR-044; NFR-003-NFR-005, NFR-011, NFR-014, NFR-018-NFR-020; AC-33-AC-36, AC-52, AC-56, AC-58; D-003, D-009 |

## 2. Logical type system

| Logical type | Contract |
| --- | --- |
| `OpaqueId` | Globally unique, non-semantic identifier. UUID versus ULID is an architecture decision. Never infer workspace or type from it. |
| `WorkspaceId` | The external Plane workspace identifier carried on every Curve record, reference, event, cache key, object key, and provider scope. |
| `ActorRef` | Typed reference `{actor_type, actor_id}` where `actor_type` is `HUMAN`, `SERVICE`, `AGENT`, or `SYSTEM`. Only `HUMAN` may approve or waive. |
| `ExternalRef` | `{provider_type, provider_connection_id, resource_type, external_id, canonical_url?}`. It is not a database foreign key to a provider. |
| `Instant` | UTC timestamp with sufficient precision to establish ordering. UI rendering uses the viewer timezone. |
| `LocalDate` | Inclusive calendar date interpreted with the owning Product's IANA timezone. |
| `Digest` | Algorithm-qualified lowercase string, initially `sha256:<64 lowercase hexadecimal characters>`. Canonical serialization is versioned by the owning artifact/object schema. A new digest algorithm requires an additive union or new schema version and cannot replace SHA-256 silently. Signing/key-management controls remain governed by D-003. |
| `Money` | `{amount_decimal, currency}`; never a binary floating-point number. |
| `ObjectRef` | `{object_id, digest, size_bytes, media_type}` referring to immutable workspace-scoped object metadata. |
| `VersionRef` | `{entity_id, version}` or `{entity_id, digest}` for immutable subjects. |
| `JsonDocument` | Schema-versioned JSON whose schema ID and version are persisted with the value. It MUST NOT be an unvalidated catch-all for fields with query or policy semantics. |
| `RichTextRef` | `ObjectRef` plus editor/schema version for a rich document body. |
| `Sha` | Provider-reported immutable commit identifier plus hash algorithm when the provider exposes it. |
| `EnumCode` | Stable uppercase wire code. Unknown codes MUST be retained and surfaced, not coerced to an existing value. |

Nullability below is `NO`, `YES`, or `CONDITIONAL`. `CONDITIONAL` always names the condition. Empty strings and empty opaque JSON MUST NOT substitute for null or an absent relationship.

## 3. Universal persistence rules

### 3.1 Common fields

Every mutable aggregate root carries these fields unless a table below explicitly strengthens the rule:

| Attribute | Type | Nullable | Rule |
| --- | --- | --- | --- |
| `id` | `OpaqueId` | NO | Stable for the life of the logical entity and never reused. |
| `workspace_id` | `WorkspaceId` | NO | First component of every authorization lookup, relationship, and uniqueness rule. |
| `aggregate_version` | unsigned integer | NO | Starts at 1 and increments exactly once for each accepted mutation. |
| `created_at` | `Instant` | NO | Immutable. |
| `created_by` | `ActorRef` | NO | Immutable actor attribution. |
| `updated_at` | `Instant` | NO | Timestamp of the accepted mutation that produced `aggregate_version`. |
| `updated_by` | `ActorRef` | NO | Actor or system rule responsible for the accepted mutation. |
| `tombstoned_at` | `Instant` | YES | Logical deletion marker; does not erase append-only history. |
| `tombstoned_by` | `ActorRef` | CONDITIONAL | Required when `tombstoned_at` is present. |
| `tombstone_reason` | text | CONDITIONAL | Required when `tombstoned_at` is present. |

Append-only records instead carry `id`, `workspace_id`, a parent aggregate identifier, a per-parent monotonically increasing `sequence`, `recorded_at`, `recorded_by`, and immutable content. They are never updated in place except for policy-authorized body-erasure fields described in [Security and Operations](security-and-operations.md#data-classification-evidence-and-retention).

### 3.2 Workspace and tenant isolation

1. Every Curve-owned row, join row, object, event, inbox/outbox item, lease, idempotency record, provider connection, cache entry, and projection MUST carry `workspace_id` (scope invariant 10; FR-043; AC-52).
2. Every Curve-to-Curve relationship MUST verify equal `workspace_id`. A derived physical schema MUST use composite foreign keys, row-level enforcement, service-level authorization, or a defense-in-depth combination that makes a cross-workspace reference impossible. The exact mechanism is part of D-003.
3. `WorkspaceId` references Plane's workspace identity. Curve MUST NOT duplicate Plane membership as an independent source of truth. A cached membership projection MUST carry source version/freshness and cannot authorize after expiry or ambiguity (D-001; AC-52, AC-60).
4. Provider connections are workspace-scoped. An external repository, Onyx delegation, MCP server, model route, object bucket/prefix, or runner identity from workspace A MUST NOT be attached to workspace B, even if the external provider exposes the same resource identifier.
5. Object and cache lookup APIs MUST accept the authenticated `workspace_id`; they MUST NOT discover the workspace by globally querying an opaque child ID.
6. Cross-workspace analytics use explicitly de-identified, policy-approved projections. Raw domain joins across workspaces are outside R1.
7. Workspace deletion is a controlled lifecycle, not a cascading SQL delete. It follows D-009, legal holds, provider reconciliation, and the erasure rules in [Security and Operations](security-and-operations.md#data-classification-evidence-and-retention).

### 3.3 Actor and lifecycle ownership

- Human identity and membership are Plane references. Service and agent identities are Curve-managed references scoped to a workspace and run.
- Aggregate lifecycle transitions are owned by the command service named in the PRD transition table. Temporal coordinates; it does not write product state directly.
- Provider callbacks append observations. They do not directly overwrite Curve business truth. A reconciliation command validates and projects them (FR-044; AC-33).
- A coding or review agent may create candidate artifacts and events, but it cannot become `created_by` or `decided_by` for approvals, waivers, VCS pushes, draft creation, or draft-to-ready transitions (scope invariant 8; AC-22, AC-30, AC-48).

## 4. Aggregate boundaries

| Aggregate root | Owned records or immutable children | Lifecycle owner | Transactional boundary and invariant |
| --- | --- | --- | --- |
| `Product` | Product configuration references | Product administrator / Roadmap owner | Product timezone and configured integration references change with optimistic concurrency. |
| `Roadmap` | Roadmap metadata | Roadmap owner | Milestones, Features, and Items are separately versioned roots to avoid one large concurrent aggregate; publication validates a consistent version set. |
| `Milestone` | Milestone placement metadata | Roadmap owner | Belongs to one Roadmap and Product; position changes append roadmap history. |
| `Feature` | Feature identity and description | Product contributor | Belongs to one Product; it is reusable across Roadmap Items. |
| `RoadmapItem` | `RoadmapItemHistory`, `WorkItemBinding` | Roadmap owner | Current scope/progress changes and their history append occur atomically. |
| `RoadmapSnapshot` | Frozen payload and export references | Roadmap owner / export worker | Publication atomically seals the exact input version set. Published content never resolves mutable rows. |
| `Initiative` | Gate assignments, current lifecycle pointers, subordinate activity references | Authenticated command service under creator/approver authority | One command changes initiative state and writes its outbox event atomically. Artifact bodies and runs are separate roots referenced by immutable IDs. |
| `WorkflowTemplate` | Immutable `WorkflowVersion` records | Platform administrator | An active Initiative pins one immutable WorkflowVersion; template updates never mutate it. |
| `Artifact` | Immutable `ArtifactVersion` records | Creator/contributor; gates control approved versions | Version submission and content immutability are local. Gate decisions are separate append-only records tied to exact versions. |
| `EvidenceItem` | Access envelope and immutable protected body reference | Effective principal / evidence service | Source identity, digest, classification, and access policy travel together; body erasure cannot change prior lineage identifiers. |
| `EvidenceSnapshot` | Ordered `EvidenceSnapshotItem` references | Artifact/context builder | Content-addressed and immutable after creation; a new set creates a new snapshot. |
| `ExecutionPlan` | Immutable plan generation, `VerticalSlice`, `SliceDependency` definitions | Technical contributor; Gate 2 controls approval | Submission validates the whole DAG and immutable plan version. Runtime slice state is versioned separately to avoid rewriting the approved plan definition. |
| `AgentRun` | `AgentRunAttempt`, `AgentQuestion`, `AgentAnswer`, `AgentEvent`, active lease | Trusted runner controller / Temporal command handler | At most one attempt owns the active lease and at most one candidate result is accepted for a slice. |
| `QualityRun` | `QualityCheck`, `ReviewFinding`, finding disposition history | Trusted quality controller | Entire result is bound to exact repository/base/head/context/policy coordinates. Later commits mark it stale; they never rewrite it. |
| `FeatureDelivery` | Contract versions, checks, waivers, current release-readiness projection | Roadmap-backed initiative workflow | Exactly one Feature Delivery per roadmap-backed Initiative; one current contract per approved plan generation. |
| `PullRequestBinding` | Provider observations, synchronized review-comment bindings | Trusted VCS controller | One slice has at most one active binding. VCS facts and Curve Code Readiness remain distinct fields. |
| `PullRequestSet` | Required binding membership for a plan generation | Initiative workflow projection | Aggregate state is derived; it is never an atomic cross-repository transaction. |
| `ProviderConnection` | Capability/version and secret-reference metadata | Platform administrator | Secret values are external to the domain store. Configuration changes create an audited version and do not alter active runs. |
| `PolicyDecision` | Immutable safe evaluation result | Curve authorization service | One evaluated subject/workspace/resource/action produces one append-only decision. Allowed mutations bind the exact decision, domain event/outbox, and audit in one transaction; denied operations bind only the decision and safe denied audit. |
| `Budget` | Immutable policy versions plus reservation and usage-ledger records | Product/Platform approvers and budget service | Reservation checks and ledger append are atomic across applicable scopes; historical usage is never rewritten. |
| `StoredObject` | Immutable bytes plus retention/erasure metadata | Object service | Bytes are create-once and digest-verified; ACL and legal/retention state are separately controlled. |

Commands that must coordinate several roots use one PostgreSQL transaction only when the selected D-003 topology permits it. Otherwise the architecture MUST use an explicit saga with fail-closed intermediate states; it MUST NOT relax the invariant.

## 5. Roadmap and product entities

All mutable roots include the common fields in section 3.1.

| Entity.attribute | Type | Nullable | Lifecycle ownership and constraint |
| --- | --- | --- | --- |
| `Product.name` | text | NO | Human-visible long-lived product name. |
| `Product.description` | `RichTextRef` | YES | Curve-owned content. |
| `Product.timezone` | IANA timezone code | NO | Interprets roadmap `LocalDate` values; changing it never rewrites persisted dates or published snapshots. |
| `Product.documentation_repository_binding_id` | `OpaqueId` | CONDITIONAL | Required before applicable Docusaurus checks can pass; concrete configuration blocked by D-012. |
| `Product.feature_flag_connection_id` | `OpaqueId` | CONDITIONAL | Required before applicable OpenFeature delivery can pass; backend choice blocked by D-011. |
| `Roadmap.product_id` | `OpaqueId` | NO | Same-workspace Product. |
| `Roadmap.name` | text | NO | Planning-horizon label. |
| `Roadmap.horizon_start`, `horizon_end` | `LocalDate` | YES | If both are present, start MUST NOT follow end. The PRD permits different planning horizons but does not require dates for all Roadmaps. |
| `Milestone.roadmap_id`, `product_id` | `OpaqueId` | NO | Product MUST equal the Roadmap's Product. |
| `Milestone.name` | text | NO | Human-visible label. |
| `Milestone.type` | `MilestoneType` | NO | `RELEASE_VERSION`, `CALENDAR_PERIOD`, `PRODUCT_OUTCOME`, or `INTERNAL_DEVELOPMENT_PHASE`. |
| `Milestone.position` | ordered scalar | NO | Unique ordering key within the Roadmap. Physical rank representation is an architecture choice. |
| `Milestone.target_start`, `target_end` | `LocalDate` | YES | If both are present, start MUST NOT follow end. |
| `Feature.product_id` | `OpaqueId` | NO | Same-workspace Product. |
| `Feature.name` | text | NO | Reusable capability name. |
| `Feature.description` | `RichTextRef` | YES | Does not represent a delivery attempt. |
| `RoadmapItem.roadmap_id`, `milestone_id`, `feature_id` | `OpaqueId` | NO | All references share Product and workspace. A Feature occurs at most once in a Milestone in R1. |
| `RoadmapItem.defining_initiative_id` | `OpaqueId` | NO | Exactly one `ROADMAP` Initiative; reciprocal one-to-one relationship. |
| `RoadmapItem.owner` | `ActorRef` | NO | Active human Roadmap owner. |
| `RoadmapItem.scope_body` | `RichTextRef` | NO | Milestone-specific Feature scope. |
| `RoadmapItem.status` | `RoadmapItemStatus` | NO | Lifecycle value; never inferred from PR, execution, or contract state. |
| `RoadmapItem.priority` | `RoadmapPriority` | NO | `CRITICAL`, `HIGH`, `MEDIUM`, or `LOW`. |
| `RoadmapItem.confidence` | `Confidence` | NO | `HIGH`, `MEDIUM`, or `LOW`. |
| `RoadmapItem.health` | `RoadmapHealth` | NO | `ON_TRACK`, `AT_RISK`, `OFF_TRACK`, or `UNKNOWN`. |
| `RoadmapItem.planned_start`, `planned_end` | `LocalDate` | CONDITIONAL | May be absent only while `PROPOSED`; `COMMITTED` requires a target window. Start MUST NOT follow end. |
| `RoadmapItem.declared_progress` | integer | NO | Inclusive 0-100. Only Roadmap owner mutates. |
| `RoadmapItem.progress_note` | text | CONDITIONAL | Required for a decrease or a change of 20 or more points. |
| `RoadmapItem.approved_prd_version_id` | `OpaqueId` | CONDITIONAL | Required before `COMMITTED`; exact approved ArtifactVersion. |
| `RoadmapItem.execution_completion` | percentage projection | YES | Read-only projection over linked Plane leaf work items. Stores calculation method, inputs, input versions, and calculated time; never overwrites declared progress. |
| `RoadmapItemHistory.roadmap_item_id` | `OpaqueId` | NO | Parent item. Append-only sequence. |
| `RoadmapItemHistory.change_type` | stable code | NO | At minimum distinguishes scope, milestone, progress, schedule, status, owner, health, and priority changes. Final code list is an architecture schema decision. |
| `RoadmapItemHistory.before`, `after` | schema-versioned JSON | NO | Only fields relevant to the recorded change; protected data rules still apply. |
| `RoadmapItemHistory.rationale` | text | CONDITIONAL | Required for Milestone movement and policy-defined material changes. |
| `RoadmapItemHistory.expected_schedule_impact` | text | CONDITIONAL | Required for Milestone movement. |
| `WorkItemBinding.roadmap_item_id` | `OpaqueId` | NO | Same-workspace item. |
| `WorkItemBinding.plane_project_id`, `plane_work_item_id` | external opaque IDs | NO | Plane is authoritative and the logical binding treats these as provider-scoped opaque IDs. The applicable migration/compatibility design must decide physical referential enforcement without transferring Plane lifecycle authority to Curve. |
| `WorkItemBinding.observed_version`, `observed_state`, `estimate` | provider projection | YES | Used to calculate Execution Completion with source timestamp and method. |
| `WorkItemBinding.cancelled`, `is_leaf` | boolean projection | NO | Cancelled entries are excluded; parents with linked children are not double counted. |
| `RoadmapSnapshot.roadmap_id` | `OpaqueId` | NO | Same-workspace Roadmap. |
| `RoadmapSnapshot.version_number` | positive integer | NO | Monotonic within Roadmap. |
| `RoadmapSnapshot.state` | `RoadmapSnapshotState` | NO | `DRAFT`, `PUBLISHED`, or `SUPERSEDED`. |
| `RoadmapSnapshot.input_version_set` | schema-versioned JSON | NO | Exact Roadmap, Milestone, Item, Product timezone, PRD, dependency, progress-input, and filter versions used. |
| `RoadmapSnapshot.payload` | `ObjectRef` | NO | Frozen rendered values; rendering MUST NOT resolve working rows. |
| `RoadmapSnapshot.payload_digest` | `Digest` | NO | Verified before publish/export. |
| `RoadmapSnapshot.published_at`, `published_by` | `Instant`, `ActorRef` | CONDITIONAL | Required in `PUBLISHED` or `SUPERSEDED`. |
| `RoadmapSnapshot.pdf_export`, `image_export` | `ObjectRef` | YES | Immutable derived exports with renderer/schema version recorded in payload metadata. |

Execution Completion implements FR-028 and AC-38: use estimate weighting only when every included non-cancelled leaf has a positive estimate; otherwise use item count and label the result `COUNT_BASED`. Blocked items remain in the denominator.

## 6. Initiative, workflow, artifact, and approval entities

| Entity.attribute | Type | Nullable | Lifecycle ownership and constraint |
| --- | --- | --- | --- |
| `Initiative.product_id` | `OpaqueId` | NO | Same-workspace Product. |
| `Initiative.mode` | `InitiativeMode` | NO | `ROADMAP` or `STANDALONE`. |
| `Initiative.roadmap_item_id` | `OpaqueId` | CONDITIONAL | Exactly one when mode is `ROADMAP`; absent when `STANDALONE`. Conversion rules follow FR-038 and AC-51. |
| `Initiative.keyword` | text | NO | Case-insensitively unique in workspace; immutable after first external resource is created. |
| `Initiative.title` | text | NO | Required at creation. |
| `Initiative.description` | `RichTextRef` | NO | Required rich description. |
| `Initiative.risk_tier` | `RiskTier` | NO | `LOW`, `STANDARD`, or `HIGH`; confirmed at Gate 1. A risk increase invalidates dependent approvals. |
| `Initiative.state` | `InitiativeState` | NO | Normative PRD state. |
| `Initiative.paused_from_state` | `InitiativeState` | CONDITIONAL | Required only while `PAUSED`; resume returns here after reauthorization. |
| `Initiative.workflow_version_id` | `OpaqueId` | NO | Immutable WorkflowVersion pinned when refinement starts. |
| `Initiative.creator` | `ActorRef` | NO | Active human at creation. |
| `Initiative.current_prd_version_id` | `OpaqueId` | YES | Current controlling PRD version; approval state is not inferred from this pointer. |
| `Initiative.current_plan_id` | `OpaqueId` | YES | Current controlling ExecutionPlan generation. |
| `Initiative.feature_delivery_id` | `OpaqueId` | CONDITIONAL | Required for roadmap-backed delivery after Gate 2; optional only for explicitly opted-in standalone delivery. |
| `Initiative.first_external_resource_at` | `Instant` | YES | Freezes keyword when first branch, preview, provider run, or other external resource is recorded. |
| `Activity.initiative_id` | `OpaqueId` | NO | Subordinate research or prototype activity; it never creates a fourth gate. |
| `Activity.type` | stable code | NO | `RESEARCH`, `RUNNABLE_PREVIEW`, or `LOVABLE_PACKAGE`. |
| `Activity.state` | `ActivityState` | NO | `RECOMMENDED`, `RUNNING`, `WAITING_FOR_HUMAN`, `COMPLETED`, `SKIPPED`, `FAILED`, or `CANCELLED`. A resumed activity creates an attributed transition from `WAITING_FOR_HUMAN`, or a new Activity that references a terminal partial/failed/skipped predecessor. |
| `Activity.budget_policy_ref` | `VersionRef` | CONDITIONAL | Required for provider/model/sandbox activity; D-014 supplies production values. |
| `Activity.output_artifact_version_id` | `OpaqueId` | YES | Immutable output or partial result. |
| `Activity.coverage_gap` | text | YES | Required when budget/provider failure yields partial research. |
| `Activity.preview_expires_at` | `Instant` | CONDITIONAL | Required for a published runnable preview; default R1 TTL is 72 hours. |
| `WorkflowTemplate.name` | text | NO | Reusable X3M lifecycle definition. |
| `WorkflowTemplate.active_version_id` | `OpaqueId` | YES | Default for new Initiatives only. |
| `WorkflowVersion.template_id`, `version_number` | `OpaqueId`, positive integer | NO | Unique immutable version. |
| `WorkflowVersion.definition` | `ObjectRef` | NO | Versioned stages, gates, policies, roles, and required artifacts. |
| `WorkflowVersion.digest` | `Digest` | NO | Pinned by Initiative and event envelope. |
| `Artifact.initiative_id` | `OpaqueId` | NO | Logical artifact belongs to one Initiative. |
| `Artifact.kind` | `ArtifactKind` | NO | Stable type such as Idea Brief, Research Dossier, PRD, Architecture Delta, Repository Impact Map, Execution Plan presentation, Preview Report, or Lovable Package. Extending codes requires schema versioning. |
| `Artifact.current_version_id` | `OpaqueId` | YES | Convenience pointer; historical versions remain addressable. |
| `ArtifactVersion.artifact_id`, `version_number` | `OpaqueId`, positive integer | NO | Unique, immutable version. |
| `ArtifactVersion.state` | `ArtifactVersionState` | NO | `DRAFT`, `SUBMITTED`, `APPROVED`, `CHANGES_REQUESTED`, `REJECTED`, or `SUPERSEDED`. Submitted-and-later bodies are immutable. |
| `ArtifactVersion.body` | `ObjectRef` | NO | Validated against `body_schema_id` and version. |
| `ArtifactVersion.body_schema_id`, `body_schema_version` | text, positive integer | NO | Enables deterministic parsing/migration. |
| `ArtifactVersion.body_digest` | `Digest` | NO | Digest of canonical body bytes. |
| `ArtifactVersion.evidence_snapshot_id` | `OpaqueId` | YES | Required when material claims rely on retrieved evidence. |
| `ArtifactVersion.parent_version_id` | `OpaqueId` | YES | Previous or source version used for diff and supersession. |
| `ArtifactVersion.generation_provenance` | schema-versioned JSON | YES | Required for AI material: prompt/model policy versions, actual model, context digest, effective principal, classification, timestamps, and costs (NFR-011). |
| `GateAssignment.initiative_id` | `OpaqueId` | NO | Exactly one active assignment for each of the three gate types. |
| `GateAssignment.gate_type` | `GateType` | NO | `PRD_APPROVAL`, `PLAN_APPROVAL`, or `CODE_READINESS`. |
| `GateAssignment.approver` | `ActorRef` | NO | Must be an active human. Risk-tier separation rules apply. |
| `GateAssignment.valid_from`, `valid_until` | `Instant` | NO, YES | Delegation is time- and scope-bounded; replacement appends assignment history. |
| `GateAssignment.delegation_reason` | text | CONDITIONAL | Required for a substitute approver. |
| `GateDecision.initiative_id`, `gate_assignment_id` | `OpaqueId` | NO | Same workspace and initiative. Append-only. |
| `GateDecision.state` | `GateDecisionState` | NO | `PENDING`, `APPROVED`, `CHANGES_REQUESTED`, `REJECTED`, or `SUPERSEDED`. |
| `GateDecision.subject_type`, `subject_id`, `subject_version` | stable code, `OpaqueId`, integer/digest | NO | Exact PRD version, plan generation, or PR-binding/head set. |
| `GateDecision.base_sha`, `head_sha` | `Sha` | CONDITIONAL | Required for every Gate 3 per-binding decision. |
| `GateDecision.policy_version_refs` | list of `VersionRef` | NO | Exact authorization, quality, workflow, and contract policies shown to approver. |
| `GateDecision.evidence_access_result` | schema-versioned JSON | NO | Records gate-time access check. An inaccessible material source blocks approval (AC-09). |
| `GateDecision.decided_by`, `decided_at`, `rationale` | `ActorRef`, `Instant`, text | CONDITIONAL | Required for any non-`PENDING` decision; actor MUST be human. |
| `GateDecision.supersedes_decision_id` | `OpaqueId` | YES | Preserves prior controlling decision. |
| `ChangeImpact.initiative_id` | `OpaqueId` | NO | Created for a superseding PRD/plan or raised risk after approval. |
| `ChangeImpact.old_subject`, `new_subject` | `VersionRef` | NO | Immutable compared versions. |
| `ChangeImpact.affected_slice_ids` | list of `OpaqueId` | NO | May be empty only if impact analysis proves no execution effect. |
| `ChangeImpactDecision.slice_id`, `decision` | `OpaqueId`, `ChangeImpactDecisionCode` | NO | `CONTINUE_PINNED`, `PAUSE`, `CANCEL`, or `REPLAN`; human authority follows PRD change control. |

Gate 3 is complete only when every required current-head binding has an approved decision and the trusted controller has successfully converted each exact draft to ready. A convenience aggregate decision MUST NOT obscure the per-binding subject SHAs (FR-020; AC-25, AC-29-AC-30).

## 7. Evidence, access, and content-addressed context

### 7.1 Evidence entities

| Entity.attribute | Type | Nullable | Lifecycle ownership and constraint |
| --- | --- | --- | --- |
| `EvidenceItem.source` | `ExternalRef` | NO | Original Onyx/source-system identity. Source remains authoritative for live access. |
| `EvidenceItem.title` | text | YES | Source metadata; not an authorization input. |
| `EvidenceItem.source_version` | text | YES | Provider version/etag when available. |
| `EvidenceItem.retrieved_at` | `Instant` | NO | Exact retrieval time. |
| `EvidenceItem.effective_principal` | `ActorRef` | NO | Human whose short-lived delegation authorized retrieval. |
| `EvidenceItem.content` | `ObjectRef` | YES | Permitted excerpt or protected body. May later be cryptographically erased. |
| `EvidenceItem.content_digest` | `Digest` | NO | Remains as non-sensitive lineage only when D-009/legal policy permits. |
| `EvidenceItem.classification` | `DataClassification` | NO | `INTERNAL`, `CONFIDENTIAL`, or `RESTRICTED`; unknown input takes strictest source classification. |
| `EvidenceItem.access_envelope` | `AccessEnvelope` | NO | Immutable snapshot of policy at retrieval; live access is rechecked at protected use. |
| `EvidenceItem.trust_flags` | set of stable codes | NO | Records untrusted instructions/prompt-injection indicators; never grants permission. |
| `EvidenceItem.redaction_state` | `RedactionState` | NO | Logical state; exact codes defined below. |
| `EvidenceItem.retention_class` | stable code | NO | Value and periods come from D-009, not application constants. |
| `EvidenceItem.last_access_check_at`, `last_access_result` | `Instant`, stable code | YES | Cache only. Gates and attempt start require a fresh check under workspace policy. |
| `EvidenceSnapshot.artifact_or_context_scope` | typed reference | NO | ArtifactVersion or ContextPack build request that owns the immutable set. |
| `EvidenceSnapshot.digest` | `Digest` | NO | Digest over ordered entry identities, versions, digests, and envelopes. |
| `EvidenceSnapshotItem.snapshot_id`, `evidence_item_id` | `OpaqueId` | NO | Same workspace. |
| `EvidenceSnapshotItem.ordinal` | non-negative integer | NO | Deterministic order for hashing and rendering. |
| `EvidenceSnapshotItem.material` | boolean | NO | Material evidence requires approver access or authorized redacted replacement. |
| `EvidenceSnapshotItem.claim_refs` | list of stable claim IDs | NO | May be empty for contextual evidence. |
| `EvidenceSnapshotItem.selected_excerpt_ref` | `ObjectRef` | YES | Separate protected excerpt if not identical to EvidenceItem content. |

### 7.2 `AccessEnvelope` schema

`AccessEnvelope` is schema-versioned immutable data embedded by reference in evidence and Context Pack entries. It MUST contain:

| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| `schema_version` | positive integer | YES | Wire/schema compatibility. |
| `workspace_id` | `WorkspaceId` | YES | Must equal owning record. |
| `classification` | `DataClassification` | YES | Strictest applicable classification. |
| `source_system`, `source_resource_id`, `source_version` | text | YES, YES, NO | Identifies the authority used for access recheck. |
| `source_acl_snapshot` | protected schema-versioned JSON or digest | YES | Minimum source ACL evidence required by policy; MUST NOT expose secrets in ordinary APIs. |
| `effective_principal` | `ActorRef` | YES | Human principal used at retrieval. |
| `retrieved_at` | `Instant` | YES | Access snapshot time. |
| `allowed_model_policy_ids` | list of `VersionRef` | YES | Empty means no model destination is allowed. D-005 determines approved policies. |
| `allowed_trace_destinations` | list of provider-connection IDs | YES | Empty means traces containing content are prohibited. |
| `allowed_export_targets` | list of destination classes/IDs | YES | Repository/Git is denied unless sanitized output is separately approved. |
| `git_allowed` | boolean | YES | MUST be false for full permissioned evidence and every `RESTRICTED` raw body. |
| `retention_class` | stable code | YES | Defined by D-009. |
| `redaction_state`, `redaction_digest`, `redaction_policy_version` | enum, `Digest`, `VersionRef` | YES, CONDITIONAL, CONDITIONAL | Digest/policy required when redacted content exists. |
| `access_recheck_policy` | schema-versioned JSON | YES | Freshness window and protected operations that force a live check. Values come from security policy, not this document. |
| `legal_hold` | boolean | YES | Blocks physical/cryptographic erasure while active. |

The envelope is not a bearer token. It records policy and provenance; every protected read still evaluates current workspace, object ACL, classification, destination, and source-access requirements (FR-043; AC-53, AC-60).

### 7.3 Stored objects

| Entity.attribute | Type | Nullable | Lifecycle ownership and constraint |
| --- | --- | --- | --- |
| `StoredObject.kind` | stable code | NO | Artifact body, evidence, context, log, quality report, export, preview, patch, transcript, or other registered kind. |
| `StoredObject.object_key` | opaque text | NO | Workspace-scoped, non-user-controlled key. Logical form is `workspaces/{workspace_id}/objects/{kind}/{digest}`; physical bucket/prefix is D-003. |
| `StoredObject.digest` | `Digest` | NO | Verified on write and read. Bytes are immutable for this identity. |
| `StoredObject.size_bytes` | unsigned integer | NO | Enforces NFR-020 without buffering whole objects in API memory. |
| `StoredObject.media_type` | text | NO | Validated against kind policy. |
| `StoredObject.classification` | `DataClassification` | NO | At least as restrictive as every input. |
| `StoredObject.access_envelope_id` | `OpaqueId` | CONDITIONAL | Required for protected content; repository-safe public metadata still remains workspace-scoped. |
| `StoredObject.retention_class` | stable code | NO | D-009-controlled. |
| `StoredObject.encryption_key_ref` | opaque secret-manager reference | CONDITIONAL | Required when cryptographic erasure or policy demands per-object/per-class keys. Exact mechanism is D-003/D-009. |
| `StoredObject.legal_hold` | boolean | NO | Prevents erasure. |
| `StoredObject.erasure_state` | `ErasureState` | NO | `LIVE`, `TOMBSTONED`, `ERASURE_PENDING`, or `ERASED`. |
| `StoredObject.erased_at`, `erasure_receipt` | `Instant`, protected `ObjectRef` | CONDITIONAL | Required when erased; receipt contains no recoverable body. |

Content deduplication MUST NOT cross workspaces or access envelopes merely because bytes match. Range/stream access MUST authorize before returning bytes. Signed object URLs, if used, are short-lived and destination-bound; their mechanism is an architecture decision under D-003.

### 7.4 `ContextPack` schema

A Context Pack is immutable, content-addressed, signed, and built at Plan Approval. PostgreSQL stores metadata; the manifest and protected entries reside in object storage.

| Field | Type | Required | Rule |
| --- | --- | --- | --- |
| `schema_version` | positive integer | YES | Parser compatibility. |
| `context_pack_id`, `workspace_id`, `initiative_id` | `OpaqueId` | YES | Stable workspace-scoped identity. |
| `plan_id`, `plan_generation`, `approved_prd_version_id` | typed IDs | YES | Exact Gate 2 subjects. |
| `scope_type`, `scope_id` | stable code, `OpaqueId` | YES | Identifies a plan, repository binding, or slice. A slice pins one pack; packs may be shared only when plan generation, repository binding/base SHA, allowed destinations, and every ordered entry digest are identical. |
| `repository_binding_id`, `base_branch`, `base_sha` | typed values | YES | Exact repository context. |
| `workflow_version_id`, `quality_policy_version_id` | `OpaqueId` | YES | Exact immutable policies. |
| `prompt_policy_version_id`, `model_policy_version_id`, `tool_policy_version_id` | `OpaqueId` | YES | Exact policies; actual model/provider remains attempt provenance. |
| `evidence_snapshot_ids` | ordered list of `OpaqueId` | YES | May be empty only when plan records that no evidence was used. |
| `entries` | ordered list of `ContextEntry` | YES | Each entry pins type, entity/version, digest, object ref, classification, envelope, and repository-safe label. |
| `requirement_ids`, `acceptance_ids` | ordered sets of IDs | YES | Slice/plan traceability. |
| `authorized_destinations` | schema-versioned JSON | YES | Sandboxes/models/tools allowed to receive each entry class. |
| `pack_digest` | `Digest` | YES | Digest of canonical manifest and ordered entry digests. The schema version identifies the canonical serialization/digest algorithm. |
| `signature`, `signing_key_id`, `signed_at` | bytes/text, text, `Instant` | YES | Trusted-controller signature. Algorithm and key management are selected under D-003 and recorded with the signature. |
| `created_at`, `created_by` | `Instant`, `ActorRef` | YES | Human-authorized Gate 2 causation plus controller identity. |
| `supersedes_context_pack_id` | `OpaqueId` | NO | Present only for a new, explicitly impact-assessed context. Active attempts remain pinned. |

`ContextEntry` contains no implicit latest-version pointer. Its `mount_name` is a validated relative name outside the repository working tree; it cannot contain traversal segments. Attempt start rechecks every protected entry's access envelope and records the resulting authorization digest.

The repository-safe `ContextManifest` is a different schema containing only: schema version, workspace-safe Curve links, initiative/plan/slice identifiers, approved artifact IDs and digests, approved non-sensitive summaries, FR/AC IDs, repository/base SHA, Context Pack digest, and generation timestamp. It MUST NOT include raw evidence, permissioned excerpts, secrets, prompts, full transcripts, or restricted architecture detail (FR-012; AC-15, AC-53). It is committed only through an explicitly planned named slice.

## 8. Provider, repository, planning, and execution entities

### 8.1 Provider and repository references

| Entity.attribute | Type | Nullable | Lifecycle ownership and constraint |
| --- | --- | --- | --- |
| `ProviderConnection` registration authority | derived policy context | NO | For local M0-S9A, an authenticated human's active Plane role `20` in the exact target workspace derives Curve `PLATFORM_ADMINISTRATOR` for provider register/administer only; core policy v2 evaluates `CURVE.PROVIDER_CONNECTION.REGISTER` against that existing workspace at resource version `1` and exact static target `curve.fake-local@1.0.0`. Caller-supplied roles/targets are rejected. |
| `ProviderConnection.provider_type` | stable code | NO | `FAKE_LOCAL` is the M0-S9A synthetic-only type. Later types include Onyx, general MCP, Orca human-assistance MCP profile, model gateway, OpenHands execution, GitHub, GitLab, prototype, quality, feature flag, documentation, and monitoring. Orca is never represented as `AgentExecutionProvider`. |
| `ProviderConnection.adapter_key`, `adapter_version` | stable code, version | NO | Exact statically registered adapter implementation; an unknown/dynamic module path is rejected. |
| `ProviderConnection.environment` | environment code | NO | M0-S9A accepts only `LOCAL`; staging/production require their package/decision activation evidence. |
| `ProviderConnection.display_name` | text | NO | Workspace-visible label; not an authorization input. |
| `ProviderConnection.external_tenant_ref` | text | YES | Organization/account/project scope in provider. Never globally unique by itself. |
| `ProviderConnection.configuration` | protected `ObjectRef`, validated JSON, or absent for a configuration-free adapter | CONDITIONAL | Non-secret configuration only; M0-S9A persists only the canonical empty-configuration digest. Secret values live behind `secret_reference`. |
| `ProviderConnection.configuration_digest` | `Digest` | NO | Pinned by plans/attempts when behavior depends on it. |
| `ProviderConnection.secret_reference` | opaque secret-broker reference | CONDITIONAL | Required when adapter authentication needs a service credential. D-002/D-008 select identity forms. |
| `ProviderConnection.current_capability_id` | immutable `ProviderCapability` reference | CONDITIONAL | Required for `ACTIVE` and `DEGRADED`; exact same-workspace capability/connection version. Prior versions remain append-only. |
| `ProviderConnection.allowed_classifications` | set of `DataClassification` | NO | M0-S9A fixes `INTERNAL`; real provider policy consumes its applicable D-005/D-007 or provider-specific decision. Empty denies use. |
| `ProviderConnection.status` | `ProviderConnectionState` | NO | `PENDING_VALIDATION`, `ACTIVE`, `DEGRADED`, `DISABLED`, or `REVOKED`. `DISABLED`/`REVOKED` connections cannot start new activity; `DEGRADED` requires per-capability policy revalidation. |
| `ProviderConnection.validated_at`, `validation_result_ref`, `last_reconciled_at` | `Instant`, versioned `ResourceRef`, `Instant` | YES | All are required for `ACTIVE`/`DEGRADED`; the result references the exact reconciliation Operation. |
| `ProviderConnection.next_reconcile_at`, `last_error` | `Instant`, `SafeError` | YES | Active connections carry an advisory next time; disabled/revoked connections do not. Degraded connections carry a safe normalized error. |
| `ProviderCapability.connection_id`, `connection_version`, `capability_version` | IDs and positive versions | NO | Unique by workspace/connection/capability version; history is append-only. |
| `ProviderCapability.adapter_key`, `adapter_version`, `protocol_versions` | stable/versioned values | NO | Exact implementation/protocol observation; cannot silently downgrade. |
| `ProviderCapability.capabilities`, `allowed_classifications` | closed versioned records and set | NO | Each capability has name/risk/enabled/schema reference; a document cannot widen the connection classification ceiling. |
| `ProviderCapability.observed_at`, `validated_at`, `expires_at` | instants | NO, NO, YES | Trusted receipt/validation times; freshness is adapter-policy controlled. |
| `RepositoryBinding.provider_connection_id` | `OpaqueId` | NO | GitHub or GitLab connection in same workspace. |
| `RepositoryBinding.external_repository_id` | text | NO | Provider-authoritative stable ID; repository name/URL is not sufficient identity. |
| `RepositoryBinding.canonical_url` | URI | YES | Display/navigation only. |
| `RepositoryBinding.product_id` | `OpaqueId` | YES | Optional Product association; an Initiative still names its Product. |
| `RepositoryBinding.default_branch` | text | NO | Provider-observed/configured branch; every plan pins a base SHA. |
| `RepositoryBinding.repository_policy_ref` | `VersionRef` | NO | Instructions, branch policy, CODEOWNERS resolution, commands, and supported capability snapshot. |
| `RepositoryBinding.provider_state_version`, `last_reconciled_at` | text, `Instant` | YES | Synchronization cursor/etag and freshness. |
| `InitiativeRepository.initiative_id`, `repository_binding_id` | `OpaqueId` | NO | Same workspace. One Initiative can bind up to the NFR-006 qualification limit. |
| `InitiativeRepository.role` | stable code | NO | Human-planning classification such as implementation, documentation, SDK, infrastructure, or telemetry. Exact extensible code list belongs in the API schema. |
| `InitiativeRepository.approved_base_branch`, `approved_base_sha` | text, `Sha` | CONDITIONAL | Required in submitted/approved plan context, not necessarily at initial discovery. |
| `InitiativeRepository.inspection_snapshot` | `ObjectRef` | YES | Content-addressed repository understanding output; never substitutes for live VCS truth. |

Repository and provider IDs are always carried as composite workspace-scoped references. The implementation MUST NOT create hard database foreign keys to GitHub, GitLab, Onyx, Orca, OpenHands, MCP, or another external system (FR-008, FR-044; AC-10, AC-33).

### 8.2 Budget and usage ledger

| Entity.attribute | Type | Nullable | Lifecycle ownership and constraint |
| --- | --- | --- | --- |
| `Budget.scope_type`, `scope_id` | stable code, `OpaqueId` | NO | `WORKSPACE`, `INITIATIVE`, `ACTIVITY`, or `ATTEMPT`; scope is in the same workspace. |
| `Budget.policy_version`, `price_catalog_version` | `VersionRef` | NO | Immutable policy and price inputs pinned by Gate 2. |
| `Budget.currency`, `limit_minor_units`, `period_timezone` | ISO currency, integer, IANA timezone | NO | R0B uses USD micro-units; period boundary is deterministic. |
| `Budget.period_start`, `period_end` | `Instant` | CONDITIONAL | Required for recurring workspace limits; initiative/activity/attempt lifetime scopes use their immutable lifecycle bounds. |
| `Budget.exception_of`, `expires_at`, `rationale` | `OpaqueId`, `Instant`, text | YES | Required for a temporary increase; Product and Platform approvals are separate Gate-bound references. |
| `BudgetReservation.idempotency_key`, `estimated_units` | text, integer | NO | Unique within workspace/provider action; reserved atomically across all applicable scopes before dispatch. |
| `BudgetReservation.state` | stable code | NO | `RESERVED`, `PARTIALLY_SETTLED`, `SETTLED`, `RELEASED`, or `RECONCILIATION_REQUIRED`; transitions append ledger events. |
| `UsageRecord.provider_usage_id`, `usage_payload` | text, schema-versioned JSON | CONDITIONAL, NO | Provider ID is unique per connection when supplied; raw provider payload is protected and normalized values are immutable. |
| `UsageRecord.monetary_units`, `pricing_version`, `observed_at` | integer, `VersionRef`, `Instant` | NO | Settlement uses the pinned price input; corrections append linked adjustments. |
| `UsageRecord.reservation_id`, `adjusts_usage_record_id` | `OpaqueId` | NO, YES | Every charge settles a reservation; a correction never edits its predecessor. |

The database implementation serializes reservation decisions for every shared budget scope or uses an equivalent atomic constraint. A provider call cannot be placed between a non-atomic balance read and reservation write. Reservations have a policy-defined reconciliation deadline; automatic expiry releases only actions proven not to have started.

### 8.3 Execution plan and slice definition

| Entity.attribute | Type | Nullable | Lifecycle ownership and constraint |
| --- | --- | --- | --- |
| `ExecutionPlan.initiative_id` | `OpaqueId` | NO | Same-workspace Initiative. |
| `ExecutionPlan.generation` | positive integer | NO | Monotonic within Initiative. A re-plan creates a new generation. |
| `ExecutionPlan.state` | `ExecutionPlanState` | NO | `DRAFT`, `SUBMITTED`, `APPROVED`, `ACTIVE`, or `SUPERSEDED`. |
| `ExecutionPlan.prd_version_id` | `OpaqueId` | NO | Exact submitted/approved PRD. |
| `ExecutionPlan.plan_artifact_version_id` | `OpaqueId` | NO | Immutable Architecture Delta/Impact Map/DAG/plan body or manifest linking those artifacts. |
| `ExecutionPlan.workflow_version_id` | `OpaqueId` | NO | Same as or explicitly compatible with Initiative-pinned version. |
| `ExecutionPlan.quality_policy_version_id` | `OpaqueId` | NO | Exact resolved baseline plus additive repository checks. |
| `ExecutionPlan.model_policy_version_id`, `tool_policy_version_id` | `OpaqueId` | NO | Exact policies authorized by Gate 2. |
| `ExecutionPlan.budget_policy_ref` | `VersionRef` | NO | Exact initiative/plan budget authorization; D-014 supplies production limits. |
| `ExecutionPlan.definition_digest` | `Digest` | NO | Covers slices, edges, repositories, bases, contract applicability, checks, budgets, rollback, and authorized side effects. |
| `ExecutionPlan.approved_gate_decision_id` | `OpaqueId` | CONDITIONAL | Required in `APPROVED`, `ACTIVE`, or `SUPERSEDED`. |
| `ExecutionPlan.activated_at` | `Instant` | CONDITIONAL | Required in `ACTIVE`; activation starts authorized orchestration. |
| `ExecutionPlan.supersedes_plan_id` | `OpaqueId` | YES | Prior generation; external resources remain linked through impact decisions. |
| `VerticalSlice.execution_plan_id` | `OpaqueId` | NO | Exactly one plan generation. |
| `VerticalSlice.slice_key` | text | NO | Stable within plan generation; used in branch pattern after validation. |
| `VerticalSlice.repository_binding_id` | `OpaqueId` | NO | Exactly one repository. |
| `VerticalSlice.state` | `VerticalSliceState` | NO | Normative runtime state. Definition fields freeze at Gate 2. |
| `VerticalSlice.user_outcome` | text | NO | Human outcome implemented by the slice. |
| `VerticalSlice.in_scope`, `out_of_scope` | `ObjectRef` or validated JSON | NO | Explicit boundaries. |
| `VerticalSlice.requirement_ids`, `acceptance_ids` | non-empty sets of IDs | NO | Every slice traces to PRD FR/AC IDs. |
| `VerticalSlice.expected_components`, `interfaces` | validated JSON | NO | Planned impact; missing values block Gate 2 rather than inviting agent inference. |
| `VerticalSlice.migration_impact`, `compatibility_impact` | validated JSON | NO | Explicit `NONE` with rationale is valid. |
| `VerticalSlice.contract_obligation_ids` | set of `OpaqueId` | NO | Empty for standalone/non-applicable work only when plan says so. |
| `VerticalSlice.verification_commands` | ordered validated list | NO | Repository commands plus expected results and timeout policy. |
| `VerticalSlice.branch_name`, `base_branch`, `base_sha` | text, text, `Sha` | NO | Branch is repository-scoped and follows `curve/<initiative-key>/<slice-key>` unless approved repository policy defines equivalent behavior. |
| `VerticalSlice.owner`, `code_approver` | `ActorRef` | NO | Humans; initiative Gate 3 assignment remains accountable. |
| `VerticalSlice.risk_tier` | `RiskTier` | NO | Cannot be lower than Initiative risk without approved policy evidence. |
| `VerticalSlice.budget_authorization` | `VersionRef` | NO | Hard limit before dispatch. |
| `VerticalSlice.rollback_plan` | `ObjectRef` or validated JSON | NO | Explicit recovery/rollback behavior. |
| `VerticalSlice.current_agent_run_id` | `OpaqueId` | YES | Convenience pointer; historical runs remain addressable. |
| `VerticalSlice.accepted_candidate_sha` | `Sha` | YES | Set only by trusted controller after candidate validation/commit. |
| `VerticalSlice.pull_request_binding_id` | `OpaqueId` | YES | At most one active binding; rework reuses it. |
| `SliceDependency.plan_id`, `predecessor_slice_id`, `successor_slice_id` | `OpaqueId` | NO | All slices belong to same plan generation; self-edge prohibited. |
| `SliceDependency.type` | `SliceDependencyType` | NO | `PLANNING_ORDER`, `EXECUTION_ORDER`, or `MERGE_ORDER`. |
| `SliceDependency.satisfaction_state` | stable state code | NO | Named state that releases the successor. `EXECUTION_ORDER` defaults to predecessor `DRAFT_ELIGIBLE`. |
| `SliceDependency.contract_or_artifact_ref` | typed reference | CONDITIONAL | Required when downstream consumes an unmerged interface, generated client, test double, or versioned artifact. |

The plan graph MUST be acyclic. Same-repository dependent slices are sequential in R1 unless Gate 2 approves an adapter-supported stacked-branch strategy. A Slice is independently implementable, testable, and reviewable, not necessarily independently releasable (scope invariants 4-5; AC-11-AC-14).

### 8.4 Agent run, attempt, question, and lease

| Entity.attribute | Type | Nullable | Lifecycle ownership and constraint |
| --- | --- | --- | --- |
| `AgentRun.vertical_slice_id` | `OpaqueId` | NO | Logical execution history for one slice. |
| `AgentRun.accepted_attempt_id` | `OpaqueId` | YES | At most one; only trusted validation can accept a candidate. |
| `AgentRun.current_attempt_id` | `OpaqueId` | YES | Convenience pointer to active/recent attempt. |
| `AgentRunAttempt.agent_run_id`, `attempt_number` | `OpaqueId`, positive integer | NO | Unique monotonic number per AgentRun. Retry always creates a new attempt. |
| `AgentRunAttempt.state` | `AgentRunAttemptState` | NO | Normative state. |
| `AgentRunAttempt.provider_connection_id`, `provider_run_id` | `OpaqueId`, text | NO, CONDITIONAL | External ID required after provider accepts start. Composite external uniqueness applies. |
| `AgentRunAttempt.context_pack_id`, `context_digest` | `OpaqueId`, `Digest` | NO | Immutable for attempt lifetime. |
| `AgentRunAttempt.model_policy_version_id`, `actual_model` | `OpaqueId`, text | NO, CONDITIONAL | Actual model required once model execution begins. Fallback reason is audited (AC-57). |
| `AgentRunAttempt.tool_policy_version_id`, `quality_policy_version_id` | `OpaqueId` | NO | Exact allowed tools and expected validation. |
| `AgentRunAttempt.budget_authorization`, `usage` | `VersionRef`, schema-versioned JSON | NO | Usage is append/projected from events; hard limit enforced before calls. |
| `AgentRunAttempt.sandbox_id`, `sandbox_profile_version` | external opaque ID, `VersionRef` | CONDITIONAL | Required once starting. Sandbox is workspace/run scoped. |
| `AgentRunAttempt.jit_identity_ref` | secret-broker reference | CONDITIONAL | Required while running; reference only, never credential material. |
| `AgentRunAttempt.started_at`, `heartbeat_at`, `ended_at` | `Instant` | YES | Required as lifecycle reaches corresponding state. |
| `AgentRunAttempt.candidate_artifact` | `ObjectRef` | YES | Quarantined patch/tree/output; never implicitly trusted or pushed. |
| `AgentRunAttempt.terminal_reason` | stable error plus detail object | CONDITIONAL | Required in terminal failure, timeout, lost, or cancellation state. |
| `AgentLease.agent_run_id`, `attempt_id`, `slice_id` | `OpaqueId` | NO | One active lease per Slice. |
| `AgentLease.token_digest` | `Digest` | NO | Lease secret itself is not persisted. |
| `AgentLease.acquired_at`, `heartbeat_at`, `expires_at` | `Instant` | NO | Expiry makes output untrusted until reconciled. |
| `AgentLease.released_at`, `release_reason` | `Instant`, stable code | YES | Required together when released. |
| `AgentEvent.attempt_id`, `provider_event_id` | `OpaqueId`, text | NO, CONDITIONAL | Provider ID required when supplied; normalized events still receive Curve ID/sequence. |
| `AgentEvent.event_type`, `provider_sequence` | stable code, integer/text | NO, YES | Unknown provider events retained as opaque observations without changing business state. |
| `AgentEvent.payload` | protected `ObjectRef` or validated JSON | NO | Classification and telemetry restrictions apply. |
| `AgentEvent.occurred_at`, `received_at` | `Instant` | NO | Preserve provider and Curve times. |
| `AgentQuestion.attempt_id`, `question_sequence` | `OpaqueId`, positive integer | NO | Durable human wait. |
| `AgentQuestion.body` | `ObjectRef` | NO | Classified prompt/question. |
| `AgentQuestion.allowed_responder_ids` | set of human actor IDs | NO | Derived from assignment and object access. |
| `AgentQuestion.context_version` | `Digest` | NO | Answer is evaluated against this pinned context. |
| `AgentQuestion.asked_at`, `answer_due_at` | `Instant` | NO, YES | Timeout behavior is policy-controlled. |
| `AgentAnswer.question_id`, `answered_by`, `answered_at` | `OpaqueId`, `ActorRef`, `Instant` | NO | `answered_by` MUST be an authorized human. |
| `AgentAnswer.body`, `impact_assessment_ref` | `ObjectRef`, typed reference | NO, YES | Material scope changes trigger PRD/plan impact control before resume. |

An attempt in `LOST` never resumes. Its artifacts remain quarantined, its JIT identity is revoked, and retry creates a new attempt only after cleanup (FR-014-FR-015, FR-042; AC-16-AC-22).

## 9. Quality, Feature Delivery, and VCS entities

### 9.1 Quality policy and results

| Entity.attribute | Type | Nullable | Lifecycle ownership and constraint |
| --- | --- | --- | --- |
| `QualityPolicyVersion.policy_name`, `version_number` | text, positive integer | NO | Immutable resolved policy. |
| `QualityPolicyVersion.baseline_ref`, `repository_policy_refs` | `VersionRef`, list of `VersionRef` | NO | X3M baseline plus additive repository policy. Repository policy cannot weaken baseline. |
| `QualityPolicyVersion.definition`, `digest` | `ObjectRef`, `Digest` | NO | Commands, tools, image digests, rulepacks, thresholds, applicability, waivability, and non-waivable classes. Production definition blocked by D-010. |
| `QualityRun.vertical_slice_id`, `pull_request_binding_id` | `OpaqueId` | NO, YES | Binding absent for preflight and present when run concerns a draft. |
| `QualityRun.phase` | `QualityPhase` | NO | `PREFLIGHT` or `VCS_VALIDATION`. Post-release contract verification is modeled as contract evidence, not silently mixed here. |
| `QualityRun.state` | `QualityRunState` | NO | `QUEUED`, `RUNNING`, `PASSED`, `FAILED`, `ERROR`, `CANCELLED`, or `STALE`. |
| `QualityRun.repository_binding_id`, `base_sha`, `head_sha` | `OpaqueId`, `Sha`, `Sha` | NO | Exact candidate coordinates. |
| `QualityRun.plan_id`, `context_digest`, `quality_policy_version_id` | `OpaqueId`, `Digest`, `OpaqueId` | NO | Exact approved inputs. |
| `QualityRun.tool_manifest`, `command_manifest` | `ObjectRef` | NO | Images, digests, rulepacks, commands, versions, and environment attestations. |
| `QualityRun.started_at`, `ended_at` | `Instant` | YES | Required by lifecycle. |
| `QualityRun.report`, `report_digest` | `ObjectRef`, `Digest` | CONDITIONAL | Required on completed `PASSED`, `FAILED`, or `ERROR` run. |
| `QualityRun.invalidated_by_sha` | `Sha` | CONDITIONAL | Required when `STALE` due to new head. |
| `QualityCheck.quality_run_id`, `check_key` | `OpaqueId`, text | NO | Key unique within run. |
| `QualityCheck.check_type` | stable code | NO | Repository conformance, build, type, lint, tests, E2E, secrets, dependency/image, static security, AI code/security review, or registered extension. |
| `QualityCheck.required`, `waivable` | boolean | NO | Resolved from policy. Non-waivable classes remain non-waivable. |
| `QualityCheck.state`, `outcome` | `QualityCheckState`, `QualityCheckOutcome` | NO, YES | State is `QUEUED`, `RUNNING`, `COMPLETED`, `CANCELLED`, or `STALE`; completed outcome is `PASS`, `FAIL`, `ERROR`, or `NOT_RUN`. Execution lifecycle and normalized outcome remain distinct. |
| `QualityCheck.evidence` | `ObjectRef` | YES | Logs/report/attestation; protected by classification. |
| `QualityCheck.waiver_id` | `OpaqueId` | YES | Only active policy-permitted waiver. |
| `ReviewFinding.quality_run_id`, `quality_check_id` | `OpaqueId` | NO | Stable finding belongs to exact run/check. |
| `ReviewFinding.fingerprint` | `Digest` | NO | Stable across re-runs when logically same finding. |
| `ReviewFinding.severity` | `FindingSeverity` | NO | `CRITICAL`, `MAJOR`, `MINOR`, or `INFO`. |
| `ReviewFinding.disposition` | `FindingDisposition` | NO | Current projection over append-only dispositions. |
| `ReviewFinding.title`, `rationale` | text | NO | Severity rationale is required. |
| `ReviewFinding.location`, `evidence` | validated JSON, `ObjectRef` | YES | File/line or artifact evidence when applicable. |
| `ReviewFinding.requirement_ids` | set of IDs | NO | May be empty only when finding is general safety/quality policy. |
| `ReviewFinding.tool_model_provenance` | schema-versioned JSON | NO | Tool/model/prompt/rulepack versions. |
| `ReviewFinding.commit_sha` | `Sha` | NO | Exact head. |
| `FindingDispositionHistory.finding_id`, `from`, `to` | `OpaqueId`, enums | NO | Append-only transition. |
| `FindingDispositionHistory.decided_by`, `decided_at`, `evidence` | `ActorRef`, `Instant`, `ObjectRef` | NO, NO, CONDITIONAL | Human and evidence required for reclassification/false-positive/waiver. Independent re-review is separately referenced. |
| `FindingDispositionHistory.original_severity`, `resulting_severity`, `decision_kind` | `FindingSeverity`, `FindingSeverity`, stable code | NO | Preserves normalized severity history; decision is `FIX`, `FALSE_POSITIVE`, `RECLASSIFY`, `ACCEPT_MINOR`, `WAIVE`, `EXPIRE`, or `STALE`. |
| `FindingDispositionHistory.policy_version_id`, `tool_rule_version`, `base_sha`, `head_sha` | `OpaqueId`, schema-versioned JSON, `Sha`, `Sha` | NO | A disposition cannot float to another policy/tool/rule or commit. |
| `FindingDispositionHistory.expires_at`, `follow_up_owner`, `rationale` | `Instant`, `ActorRef`, text | CONDITIONAL | Required for waiver; R0B permits only TL-approved Minor/Info non-security waiver and expires no later than 30 days or initiative termination. |

An AI result can block but cannot make a deterministic check pass. A new head marks applicable runs, findings, dispositions, waivers, manual evidence, and readiness decisions `STALE`; it does not delete or inherit prior evidence (FR-016-FR-018; AC-23-AC-25). Application Security alone decides security/secret/authorization/sandbox/data/destructive/license false positives or severity changes; the Technical Approver may decide evidence-backed non-security reclassification and the limited R0B Minor/Info waiver.

### 9.2 Feature Delivery Contract and waivers

| Entity.attribute | Type | Nullable | Lifecycle ownership and constraint |
| --- | --- | --- | --- |
| `FeatureDelivery.initiative_id`, `roadmap_item_id` | `OpaqueId` | NO | One-to-one with roadmap-backed Initiative and Item. Standalone opt-in still has no Roadmap Item and MUST be explicitly recorded at Gate 2. |
| `FeatureDelivery.prd_version_id`, `execution_plan_id` | `OpaqueId` | NO | Exact approved delivery definition. Plan supersession creates a new contract generation and PR set. |
| `FeatureDelivery.state` | `FeatureDeliveryState` | NO | Derived normative state; never changes Roadmap status. |
| `FeatureDelivery.current_contract_version_id`, `pull_request_set_id` | `OpaqueId` | NO | One each per active plan generation. |
| `FeatureDeliveryContract.feature_delivery_id`, `version_number` | `OpaqueId`, positive integer | NO | Immutable version unique within Feature Delivery. |
| `FeatureDeliveryContract.plan_id`, `prd_version_id` | `OpaqueId` | NO | Exact approved subjects. |
| `FeatureDeliveryContract.state` | `FeatureDeliveryState` | NO | Contract/release-readiness projection. |
| `FeatureDeliveryContract.definition`, `definition_digest` | `ObjectRef`, `Digest` | NO | Aggregate observability, documentation, and feature-toggle obligations. |
| `DeliveryContractCheck.contract_version_id`, `check_key` | `OpaqueId`, text | NO | Unique within contract version. |
| `DeliveryContractCheck.area` | `ContractArea` | NO | `OBSERVABILITY`, `DOCUMENTATION`, or `FEATURE_TOGGLE`. |
| `DeliveryContractCheck.state` | `ContractCheckState` | NO | `PENDING`, `PASSED`, `FAILED`, `NOT_APPLICABLE`, or `TEMPORARILY_WAIVED`. |
| `DeliveryContractCheck.responsible_slice_id` | `OpaqueId` | YES | Required when one planned slice owns delivery. External/manual evidence can instead name source. |
| `DeliveryContractCheck.acceptance_method` | validated JSON | NO | Exact pre/post-release evaluation and expected result. |
| `DeliveryContractCheck.evidence_refs`, `result_digest` | list of typed refs, `Digest` | NO, YES | Evidence is aggregate across contributing PRs. |
| `DeliveryContractCheck.applicability_decision_refs` | list of `GateDecision`/human decision refs | CONDITIONAL | Required for `NOT_APPLICABLE`; flag N/A requires product and technical approval at Gate 2. |
| `DeliveryContractCheck.waiver_id` | `OpaqueId` | CONDITIONAL | Required only while temporarily waived. |
| `DeliveryWaiver.contract_check_id` | `OpaqueId` | NO | Exact check and policy version. |
| `DeliveryWaiver.state` | `DeliveryWaiverState` | NO | `REQUESTED`, `ACTIVE`, `REVOKED`, or `EXPIRED`. |
| `DeliveryWaiver.failure_class`, `scope` | stable code, validated JSON | NO | Command rejects policy/non-waivable classes. |
| `DeliveryWaiver.rationale`, `approved_by`, `granted_at`, `expires_at` | text, `ActorRef`, `Instant`, `Instant` | CONDITIONAL | Required in `ACTIVE`; approver MUST be authorized human and expiry follows grant. |
| `DeliveryWaiver.policy_version_id` | `OpaqueId` | NO | Exact policy proving waivability. |
| `DeliveryWaiver.follow_up_work_item` | Plane `ExternalRef` | CONDITIONAL | Required before activation. |
| `DeliveryWaiver.revoked_at`, `revoked_by`, `revocation_reason` | corresponding types | CONDITIONAL | Required in `REVOKED`. |

Verified secrets, authorization bypass, sandbox escape, destructive-data risk, restricted-data leak, prohibited license, and other D-010 non-waivable classes cannot produce an active waiver (FR-039-FR-040; AC-45-AC-50).

### 9.3 Pull request set, binding, and provider observations

| Entity.attribute | Type | Nullable | Lifecycle ownership and constraint |
| --- | --- | --- | --- |
| `PullRequestSet.initiative_id`, `execution_plan_id` | `OpaqueId` | NO | One set for a plan generation. |
| `PullRequestSet.state` | `PullRequestSetState` | NO | Derived `INCOMPLETE`, `VALIDATING`, `REWORK_REQUIRED`, `CODE_READY`, or `CLOSED`. |
| `PullRequestSet.required_slice_ids` | immutable set of `OpaqueId` | NO | Exact set approved at Gate 2; membership changes require plan impact/reapproval. |
| `PullRequestBinding.vertical_slice_id`, `pull_request_set_id` | `OpaqueId` | NO | Exactly one required slice and set. |
| `PullRequestBinding.repository_binding_id`, `provider_connection_id` | `OpaqueId` | NO | Same repository as slice and same workspace. |
| `PullRequestBinding.state` | `PullRequestBindingState` | NO | Normative normalized state. |
| `PullRequestBinding.external_pr_id`, `external_number`, `canonical_url` | text, text/integer, URI | CONDITIONAL | Required after provider draft creation succeeds/reconciles. |
| `PullRequestBinding.provider_idempotency_marker` | text | NO | Created before mutation; reconciliation uses it after ambiguous response. |
| `PullRequestBinding.branch_name`, `base_branch`, `base_sha`, `head_sha` | text, text, `Sha`, `Sha` | NO | Exact provider-observed coordinates. |
| `PullRequestBinding.draft` | boolean | NO | VCS fact. `CURVE_READY_APPROVED` remains a separate Curve projection. |
| `PullRequestBinding.provider_state_version`, `last_reconciled_at` | text, `Instant` | YES | Etag/version/cursor and observation time. |
| `PullRequestBinding.current_preflight_run_id`, `current_vcs_validation_run_id` | `OpaqueId` | YES | Must match current head and policy to count. |
| `PullRequestBinding.current_code_readiness_decision_id` | `OpaqueId` | YES | Must reference current head; otherwise stale. |
| `PullRequestBinding.mergeability`, `protection_snapshot`, `ownership_snapshot` | stable code / `ObjectRef` | YES | Provider facts used at Gate 3. |
| `ProviderObservation.binding_id`, `provider_event_id` | `OpaqueId`, text | NO | Unique per connection/provider. Append-only raw normalized observation. |
| `ProviderObservation.observed_state`, `base_sha`, `head_sha` | validated JSON, `Sha`, `Sha` | NO | Provider truth at observation time. |
| `ProviderObservation.observed_at`, `received_at`, `signature_result` | `Instant`, `Instant`, stable code | NO | Forged/invalid observations remain security audit data but cannot project business state. |
| `ReviewCommentBinding.pull_request_binding_id`, `external_comment_id` | `OpaqueId`, text | NO | Provider comment/thread identity. |
| `ReviewCommentBinding.author`, `body_digest`, `provider_state` | external actor ref, `Digest`, validated JSON | NO | Content body may be protected object. |
| `ReviewCommentBinding.actionable`, `dispatched_slice_id` | boolean, `OpaqueId` | NO, CONDITIONAL | Dispatch requires authorized human command and same owning slice/branch/PR. |

VCS is authoritative for branch, commit, check, review, PR/MR, close, and merge facts. Curve is authoritative for its Gate 3 decision, contract status, and audit. A head mismatch causes fail-closed invalidation (FR-019-FR-020, FR-041, FR-044; AC-25-AC-33).

## 10. Operational, event, and audit entities

| Entity.attribute | Type | Nullable | Lifecycle ownership and constraint |
| --- | --- | --- | --- |
| `DomainEvent.event_id` | `OpaqueId` | NO | Globally unique event ID. |
| `DomainEvent.schema_version` | positive integer | NO | `/v1` compatible evolution; incompatible payload uses new version and dual-publish migration. |
| `DomainEvent.aggregate_type`, `aggregate_id`, `aggregate_version`, `sequence` | stable code, `OpaqueId`, integers | NO | Sequence is monotonically increasing per aggregate. |
| `DomainEvent.initiative_id` | `OpaqueId` | YES | Present whenever event is initiative-related. |
| `DomainEvent.workflow_version_id` | `OpaqueId` | YES | Required for lifecycle/workflow events. |
| `DomainEvent.actor`, `effective_principal` | `ActorRef` | NO, YES | Effective principal required for protected human-delegated operations. |
| `DomainEvent.occurred_at`, `recorded_at` | `Instant` | NO | Preserve business and persistence times. |
| `DomainEvent.correlation_id`, `causation_id`, `idempotency_key_digest` | opaque text/ID, `Digest` | NO, YES, YES | Causation is absent only for root commands. Effectful commands persist only the key digest; raw idempotency keys never enter an event. |
| `DomainEvent.classification` | `DataClassification` | NO | Payload cannot be less restrictive. |
| `DomainEvent.payload` | validated JSON or `ObjectRef` | NO | Ordinary event bus payload excludes raw prompts/code/evidence/secrets/tool output. |
| `OutboxEvent.event_id`, `destination` | `OpaqueId`, stable code | NO | Written in the same transaction as aggregate state and the durable `DomainEvent`; unique with workspace. |
| `OutboxEvent.state`, `attempt_count`, `next_attempt_at` | stable code, integer, `Instant` | NO, NO, YES | At-least-once relay state; state-dependent timestamps/errors follow the M0-S2 relational contract. |
| `OutboxEvent.delivered_at`, `last_error` | `Instant`, safe error | YES | `DELIVERED` requires non-null time; retry/dead-letter requires a redacted error. |
| `InboxMessage.consumer_id`, `event_id` | text, `OpaqueId` | NO | Unique with workspace; one consumer applies one event once. |
| `InboxMessage.received_at`, `processed_at`, `result_digest` | `Instant`, `Instant`, `Digest` | NO, YES, YES | Terminal states require their result/error fields and non-null processing time. |
| `IdempotencyRecord.principal_scope`, `command_scope`, `key_digest` | stable compound values, `Digest` | NO | Unique with workspace for the retention window. The raw key is never persisted or logged. |
| `IdempotencyRecord.request_digest`, `response_status`, `response_digest`, `response_resource_ref` | `Digest`, integer, `Digest`, `ResourceRef` | NO, YES, YES, YES | Same key/digest replays the original safe PostgreSQL resource; a changed request digest fails. |
| `IdempotencyRecord.external_effect_refs`, `expires_at` | list of typed refs, `Instant` | NO | Covers provider replay/reconciliation window per NFR-005; D-009 sets period. |
| `AuditEvent.action`, `target_ref`, `outcome` | stable code, typed reference, stable code | NO | Append-only security/product audit. Normalized target type/id support sequence uniqueness. |
| `AuditEvent.actor`, `effective_principal`, `policy_decision_ref` | `ActorRef`, `ActorRef`, typed ref | NO, YES, YES | Includes denied commands and cross-workspace probes. |
| `AuditEvent.before_digest`, `after_digest`, `details_ref` | `Digest`, `Digest`, protected `ObjectRef` | YES | M0-S2 leaves `details_ref` absent because protected storage is disabled. |
| `AuditEvent.occurred_at`, `correlation_id` | `Instant`, opaque ID | NO | Supports lineage and export. |
| `PolicyDecision.sequence`, `recorded_at`, `recorded_by` | positive integer, `Instant`, `ActorRef` | NO | Sequence is workspace/resource scoped and unique; recorder is the trusted service/system that persisted the immutable result; recording time is not earlier than evaluation time. |
| `PolicyDecision.action`, `resource_ref`, `effect`, `reason_codes` | stable code, `ResourceRef`, stable code, ordered code list | NO | Effect is `ALLOW`, `DENY`, or reserved `REQUIRE_HUMAN_CONFIRMATION`; M0 v1 emits allow/deny only. Allow contains only `POLICY_ALLOWED`; deny codes are non-empty and manifest-ordered. |
| `PolicyDecision.subject`, `effective_principal` | `ActorRef`, `ActorRef` | NO | Subject is authenticated; effective principal equals subject in M0 unless a later decided delegation applies. Agents cannot be allowed by the core manifest. |
| `PolicyDecision.policy_key`, `policy_version`, `policy_manifest_digest`, `input_digest` | stable code, positive integer, `Digest`, `Digest` | NO | Binds exact immutable policy bytes and canonical safe input without protected bodies, credentials, or raw idempotency keys. |
| `PolicyDecision.normalized_classification`, `permitted_projection` | `DataClassification`, code set | NO | `UNKNOWN` input becomes `RESTRICTED`. Projection is non-empty only for `ALLOW`. |
| `PolicyDecision.evaluated_at`, `correlation_id` | `Instant`, opaque ID | NO | Decision time equals the trusted input instant; the pure evaluator reads no clock. Correlation supports request/command lineage. Record is append-only. |
| `ProjectionCheckpoint.projection_name`, `partition_key` | text | NO | Workspace is part of partition key. |
| `ProjectionCheckpoint.last_event_sequence`, `last_event_id`, `updated_at` | integer, `OpaqueId`, `Instant` | NO | Rebuildable projection cursor. |
| `ReconciliationCase.provider_connection_id`, `resource_ref` | `OpaqueId`, `ExternalRef` | NO | Created for persistent or ambiguous divergence. |
| `ReconciliationCase.state`, `reason`, `last_attempt_at` | `ReconciliationCaseState`, protected detail, `Instant` | NO, NO, YES | State is `OPEN`, `RETRY_SCHEDULED`, `RECONCILING`, `RESOLVED`, `ESCALATED`, or `CLOSED_UNRESOLVED`. Unresolved states remain visible and fail closed for dependent mutations. |

The M0-S2 physical keys, state checks, transactions, and relay primitives are
normative in the [M0-S2 relational contract](../../contracts/database/m0-s2-relational-contract.md).
The M0-03 decision fields, evaluator input ownership, lookup order, transaction
binding, migration, and rollback are normative in the
[M0-03 policy relational contract](../../contracts/database/m0-03-policy-contract.md)
(append-only policy decisions and authorization transaction boundary).
The DomainEvent envelope fields are fixed by the PRD. The exact later
topic/stream layout and network broker remain architecture choices. Celery may
produce notifications or refresh projections but MUST NOT become a second
lifecycle authority.
