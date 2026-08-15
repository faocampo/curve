# Plane Foundation Inventory for Curve

## Document control

| Field | Value |
| ----- | ----- |
| Status | D-001 decided; accepted Plane foundation merged and pinned |
| Version | 0.8 |
| Review date | 2026-08-15 |
| Plane fork | `git@github.com:faocampo/plane.git` |
| Inspected branch and commit | `preview` at `31853ab2b8b7810c59dc30d22e52c8f4b5a71a47` |
| Official upstream | `https://github.com/makeplane/plane.git`, `preview` at `1c8a60f858d8472aa56e29994ec1c7926da2c6ce` |
| Candidate integration branch | `curve/plane-upstream-sync-2026-08-12` |
| License | GNU AGPL-3.0 in `LICENSE.txt` |
| Decision | D-001 |

## Conclusion

The inspected Plane community fork is a suitable additive foundation for Curve. It already provides workspace identity and membership, project/work-item coordination, pages, comments, estimates, relations, views, webhooks, notifications, API conventions, a Django/PostgreSQL backend, Celery bounded jobs, and a React/TypeScript workspace UI. Curve should reuse those primitives through their supported models/services/UI patterns while keeping its lifecycle, immutable evidence, gates, provider state, budgets, quality truth, and Temporal workflows in new Curve-owned domain boundaries.

The product sponsor approved using official Plane upstream as the updateable code baseline for Curve while implementing Curve in the fork. The `upstream` remote is configured as fetch-only. During candidate preparation, shared `preview` remained unchanged and the integration branch started from the exact upstream `preview` commit. After review, `preview` advanced only through Plane PR #1 to accepted merge `549db1aea8f3307b337b3686dbb844a87549cd95`. The historical fork baseline is an ancestor, so the update had no fork-only conflict: the fork was zero commits ahead and one commit behind before integration.

D-001 is `DECIDED`. The verification run exposed and corrected an i18n type-generator formatting defect, and the approved candidate `d380678912e9b46805ef852d2e05411f1fea6d8b` is preserved as a parent of accepted fork `preview` merge `549db1aea8f3307b337b3686dbb844a87549cd95`. Full repository checks and the approved local deployment smoke passed on the candidate tree; the merge adds history metadata without changing that reviewed tree. The repository-level community/commercial audit, reuse/build recommendation, license obligations, repository boundary, exact-head dispositions, merge, and resulting base are accepted in [ADR-001](adr-001-plane-upstream-foundation.md#approval-record). M0-01 owns the feature-disabled migration and rollback implementation proof.

## Repository and integration state

| Property | Observation | Consequence |
| -------- | ----------- | ----------- |
| Fork branch | `origin/preview` at accepted merge `549db1aea8f3307b337b3686dbb844a87549cd95` | The merge preserves prior fork/upstream base `1c8a60f...` and approved candidate `d380678...` as parents without rewriting shared history. |
| Official upstream | Remote `upstream` fetches `https://github.com/makeplane/plane.git`; its push URL is disabled; `upstream/HEAD` and the selected ref are `preview` | Upstream changes are inspectable and fetchable without creating an accidental upstream push path. |
| Upstream pin | `upstream/preview` at `1c8a60f858d8472aa56e29994ec1c7926da2c6ce` | Candidate foundation base is reproducible and exact. |
| Historical ancestry/divergence | Before fork synchronization, merge base was `31853ab2b8b7810c59dc30d22e52c8f4b5a71a47`; fork was `0` ahead and `1` behind upstream | Explains the selected integration path without asserting the historical state is current. |
| Upstream delta | One commit, `[WEB-8632] fix(web): auto-reload on stale chunk load failure during navigation (#9579)`, changing three web files | No schema, dependency-lock, deployment, or license-file delta was introduced by this upstream update. |
| Candidate branch | Published `curve/plane-upstream-sync-2026-08-12` at `d380678912e9b46805ef852d2e05411f1fea6d8b` | Exact candidate is approved under D-001 and merged by Plane PR #1. |
| Accepted merge and working tree | `origin/preview` at `549db1aea8f3307b337b3686dbb844a87549cd95`; candidate `d380678...` is its second parent | Exact reviewed tree is reproducible and the resulting implementation base is pinned. |
| Original working tree | Clean when first inspected | No pre-existing user change was overwritten or incorporated. |
| Package manager | Pinned pnpm 11.3.0 in root package metadata | Use the repository-pinned package manager; do not substitute a global version. |
| Backend | Django/DRF, PostgreSQL, Celery, pytest/Docker test stack | Add Curve Django/API modules and a separate Temporal worker boundary; do not replace Plane/Celery jobs. |
| Frontend | React/TypeScript monorepo with workspace packages, route tables, MobX-oriented stores/services, shared UI | Add Curve navigation/routes/services/stores using existing conventions and feature-gated exposure. |

## Community capability inventory

| Capability | Evidence in inspected fork | Curve decision |
| ---------- | -------------------------- | -------------- |
| Workspace identity and membership | Workspace/member models, authentication providers/middleware, workspace routes and stores | **Reuse as authority.** Curve references Plane workspace/user/membership IDs and adds defense-in-depth workspace scoping; it does not duplicate membership truth. |
| Projects and work items | Project, Issue/work-item, state, label, assignee, link, relation, activity, comment, attachment, subscriber, version models and APIs | **Reuse for human work management.** Curve may create/link approved Plane work items through a trusted adapter; Curve Initiative/Slice state remains separate. |
| Relations and dependency-oriented work data | Issue blocker/relation/link models and APIs | **Reuse where semantics match.** Typed Curve slice dependencies remain Curve-owned and may project/link to Plane relationships rather than reinterpret them. |
| Cycles and modules | Cycle/Module models, membership/linking APIs, web routes and services | **Reuse as optional Plane planning/work views.** They do not replace Curve Milestone, Roadmap, Feature, or immutable snapshot semantics. |
| Estimates | Estimate and EstimatePoint models/APIs plus project settings UI | **Reuse for Plane work items.** Curve effort/KPI measurements and agent budgets are separate domains. |
| Views and filters | Workspace/project view models, APIs, stores and routes | **Reuse UI/filter patterns.** New Curve projections must enforce Curve authorization and cannot store lifecycle truth in Plane filters. |
| Pages/editor | Page, PageVersion, PageLog, labels, project-page models; editor/UI routes | **Reuse for collaborative presentation where useful.** Approved PRDs, evidence, plans, and manifests stay immutable Curve artifacts; a Plane page may link/render a version but is not its authority. |
| Comments, activities and notifications | Work-item comments/activity plus notification models/tasks/UI | **Reuse for human coordination and notification.** Comments cannot grant approvals; gate decisions remain typed Curve records. |
| Assets/object storage patterns | Asset endpoints/models/tasks and storage metadata jobs | **Reuse implementation conventions only after security review.** Permissioned evidence uses Curve Access Envelopes, protected object paths, retention, and erasure policy rather than ordinary project assets. |
| Webhooks and API tokens | Webhook models/logs/tasks, developer token UI/services, API schema generation | **Reuse patterns, not ambient credentials.** Curve provider connections, signed callbacks, controller credentials, idempotency, and reconciliation are workspace-scoped Curve boundaries. |
| API conventions | DRF base endpoints/pagination/middleware, URL modules, schema endpoint and tests | **Reuse framework conventions.** Curve remains versioned under `/api/v1/workspaces/{workspace_slug}/curve/` with its stronger ETag, idempotency, Problem Details, SSE, and authorization contract. |
| Background processing | Celery tasks for notification, export, cleanup, webhooks and bounded synchronization | **Reuse for bounded Plane work only.** Temporal exclusively owns durable Curve lifecycle waits/orchestration; Celery never advances Curve initiative state. |
| Deployment examples | AIO, CLI, Kubernetes and Swarm manifests | **Reference only.** X3M's approved Kubernetes/AWS topology and D-003 determine actual Curve deployment. |
| Frontend extension seams | Workspace route tables, services packages, shared state, UI/editor/constants/hooks packages | **Reuse additive patterns.** Curve entry points are disabled by default and removable without changing unrelated Plane navigation. |
| Gantt/scheduling | Public source contains work-item/module Gantt components, stores, layout roots, constants, types, and project-view wiring under `apps/web/core` and `packages`; the candidate production build passed | **Reuse only as a presentation primitive after an M2 integration proof.** It does not supply Curve Roadmap, Milestone, Feature, immutable snapshot, approval, or dependency truth. Curve owns those semantics and may project them into the public Gantt UI. |

## Curve-owned capabilities

Plane primitives do not satisfy these contracts and must be additive Curve domains or adapters:

- Initiative, WorkflowVersion, exactly three Gate types, immutable decisions, and impact/supersession behavior.
- Product Roadmap, Milestone, Feature, Roadmap Item history, immutable Roadmap Snapshot, and Feature Delivery Contract.
- EvidenceItem/Snapshot, AccessEnvelope, ContextPack/Manifest, classification, retention, legal hold, and cryptographic-erasure controls.
- ExecutionPlan, repository-local VerticalSlice DAG, provider-neutral AgentRun/Attempt, questions, leases, candidate artifacts, and budgets.
- Temporal orchestration, outbox/inbox delivery, idempotency, reconciliation, cancellation fencing, and replay/versioning.
- Onyx/MCP/model/OpenHands/GitHub/GitLab/quality/flag/documentation/monitoring provider boundaries. Orca is a developer-operated MCP client, not an automated execution provider.
- Trusted sandbox, runner, VCS and quality controllers; agents receive no mutation credentials.
- Commit-bound quality evidence, findings/dispositions, automatic draft eligibility, Code Readiness, and draft-to-ready mutation.
- Immutable audit, safe telemetry, KPI events, AGPL release manifest, source link, SBOM, and provenance.

## Commercial and license boundary

The inspected repository contains the complete GNU AGPL v3 license in `LICENSE.txt`; its README labels the project AGPL v3; inspected source headers use `SPDX-License-Identifier: AGPL-3.0-only`. It also contains product-tier constants, `plane.license` instance-administration routes, empty extension seams, and comments indicating that some implementations live in a separate enterprise repository. In particular, `apps/web/app/routes/extended.ts` exports an empty route list, `apps/api/plane/utils/instance_config_variables/extended.py` exports an empty configuration list, and the public page extended service says its additional implementation is in the enterprise repository. The `packages/editor/src/ee` files inspected merely re-export community (`ce`) types and extensions. These names and placeholders neither grant access to non-public implementation nor prove a commercial capability exists in this checkout.

### Reuse/build boundary

| Boundary | Verified public-source result | M0/M1 consequence |
| --- | --- | --- |
| Identity, workspace membership, projects, work items, comments, notifications, pages, estimates, relations, webhooks, API and UI conventions | Models, APIs, services, routes, and/or UI are present in the pinned public tree and the full candidate checks pass | Reuse through existing public interfaces; Curve adds workspace-scoped authorization and immutable lifecycle records without replacing Plane authority. |
| Work-item and module Gantt presentation | Public components, stores, types, and layout wiring are present and included in the successful production build | Candidate for an M2 projection adapter; do not equate it with Curve roadmap truth. |
| `extended` routes/config/services and `ee` paths | Empty, abstract, pass-through, or explicitly refer to implementation in another repository | Treat as unavailable. Curve must not depend on them unless a later legal and technical review proves a public implementation. |
| `plane.license` application | Public instance configuration/administration namespace mounted at `/api/instances/`; its name is not a declaration that Curve may use separate commercial code | Do not use module naming as licensing evidence. Legal review relies on file licenses, dependency licenses, provenance, and release obligations. |
| Curve lifecycle, immutable artifacts/evidence, gates, delivery kernel, Temporal orchestration, providers, quality truth, budgets and audit | No equivalent public aggregate with the required invariants was found | Build additively in `plane.curve`; integrate with Plane through explicit projections/adapters. |

The Curve implementation MUST:

1. Build and test only the pinned public/community source plus X3M's AGPL-covered modifications.
2. Treat an `extended` route, license gate, subscription constant, placeholder, or enterprise-reference comment as unavailable until the D-001 evidence proves the community implementation and legal permission.
3. Implement missing Curve behavior additively instead of copying or depending on non-public/commercial source.
4. Preserve AGPL license/notices and the exact-version corresponding-source release procedure.
5. Record every reused Plane primitive and every new dependency in the dependency/license manifest.

Federico Ocampo accepted the documented D-001 reuse/license boundary in his engineering and licensing-review roles. Qualified counsel remains the escalation authority for newly discovered licensing ambiguity and the release-qualification work tracked by R-020; directory names alone are not legal evidence.

## Safe upstream-integration procedure

The product sponsor authorized the official-upstream baseline and isolated-branch preparation on 2026-08-12. Steps 1-7 are complete for the approved candidate. Its merge and the resulting `preview` base pin are the remaining release-engineering actions before M0-01 dispatch.

1. Confirm the fork working tree is clean and preserve the current `preview` commit as an immutable baseline reference.
2. Add a remote named `upstream` for the approved official repository and fetch refs/tags without changing a branch.
3. Record the approved upstream base commit and compare ancestry, commit delta, changed paths, migrations, lockfiles, deployment manifests, and license/notices.
4. Create a new feature/integration branch from the approved fork baseline. Never force-rebase or force-push shared `preview`.
5. Integrate the approved upstream ref on that branch using the owner-selected merge/rebase policy, resolve conflicts with an explicit compatibility report, and retain rollback to the pinned fork baseline.
6. Run the complete baseline checks below and a deployment smoke test before calling the result the Curve foundation.
7. Pin the resulting integration commit in D-001/ADR evidence. Every later task packet uses an exact descendant base SHA.

If the fork cannot integrate upstream without commercial-only code, destructive migration, broken checks, or an unclear AGPL/source boundary, D-001 fails and the owner selects a different base or remediation; an AI agent does not conceal the failure.

## Baseline verification commands

Commands come from the inspected repository instructions and must run on the approved integration branch:

```text
pnpm check
pnpm build
docker compose -f docker-compose-test.yml up --build --abort-on-container-exit --exit-code-from api-tests
docker compose -f docker-compose-test.yml down -v
```

Targeted checks may provide fast feedback, but do not replace the full exit suite. Verification records command, environment, pnpm/container versions, start/end, exit status, logs/artifact digest, and commit SHA. The destructive `clean` script is not part of baseline verification.

## Verification result

| Verification | Result on candidate branch | Evidence and interpretation |
| ------------ | -------------------------- | --------------------------- |
| `docker compose ... config --quiet` | PASS | The repository-native backend test definition is valid. |
| `pnpm check` | PASS at exact candidate `d380678912e9b46805ef852d2e05411f1fea6d8b`; 60/60 Turbo tasks successful | The first run found that the ignored generated `keys.generated.ts` placed the terminating semicolon on a separate line, which pinned `oxfmt` rejected. The committed generator emits the semicolon on the final union member; the commit hook also replaced two `.sort()` calls with `.toSorted()` to satisfy lint. The post-commit full check passed. |
| `pnpm build` | PASS; 16/16 Turbo tasks successful | Admin, web, space, live, and shared packages built successfully. Existing Vite/React Router/deprecation warnings were non-fatal. |
| Backend Compose test suite | PASS; 516 passed, 92 warnings, 84.10 seconds | Contract, authorization/isolation, unit, smoke, and security-regression tests passed. Warnings were dependency/factory/openpyxl deprecations. Test containers, network, and disposable volumes were removed; pre-existing development containers were not removed. |
| `git diff --check` | PASS | The candidate correction has no whitespace errors. |
| Local deployment smoke | PASS at exact candidate `d380678912e9b46805ef852d2e05411f1fea6d8b` | Existing local Plane Compose project recreated from the candidate using its persistent development volumes. Migrator exited `0` with no pending migrations; API health returned `200 {"status":"OK"}`; worker and Beat initialized; a safe nonexistent-asset task was consumed. `check --deploy` exited `0` with five expected local-profile hardening warnings. See the detailed evidence below. |

The candidate correction was committed, published, reviewed, and accepted under D-001 at exact SHA `d380678912e9b46805ef852d2e05411f1fea6d8b`. Plane PR #1 merged it into `preview` at `549db1aea8f3307b337b3686dbb844a87549cd95`. This pins an implementation foundation; it is not a Curve product release.

### Local deployment-smoke evidence

The smoke test intentionally reused the existing local `plane` Docker Compose project and its named development volumes (`plane_pgdata`, `plane_redisdata`, `plane_rabbitmq_data`, and `plane_uploads`). The candidate checkout was `/Users/federico.ocampo/Development/tools/project_management/plane` at `d380678912e9b46805ef852d2e05411f1fea6d8b`.

An unrelated `x3m-hr-local-frappe-1` container already owned host ports `8000` and `9000`. It was not stopped or modified. A temporary, non-repository Compose override therefore exposed candidate Plane API/MinIO only on `127.0.0.1:18000`, `127.0.0.1:19000`, and `127.0.0.1:19090`; in-container service addresses and existing volumes were unchanged.

| Check | Result | Evidence |
| ----- | ------ | -------- |
| Candidate Compose recreation | PASS | API, worker, Beat, migrator, PostgreSQL, Valkey, RabbitMQ, and MinIO were recreated from the candidate stack with persistent local volumes retained. |
| Migrator | PASS | Exited `0`; applied no pending migrations. |
| API boot and storage initialization | PASS | API waited for the database/migrations, retained the registered local instance, confirmed the `uploads` MinIO bucket, cleared cache, and started Django on container port `8000`. |
| Health endpoint | PASS | `GET http://127.0.0.1:18000/` returned `200` with `{"status":"OK"}`. |
| Django deployment check | PASS with local-profile warnings | `python manage.py check --deploy --settings=plane.settings.local` exited `0`; it warned about HSTS, SSL redirect, secure session/CSRF cookies, and `DEBUG=True`, which are expected for this non-production local profile. |
| Worker | PASS with local hardening warning | Worker connected to RabbitMQ and registered Plane tasks. Celery warned that it runs as root in this local container; production runner identity remains a separate hardening requirement. |
| Beat | PASS with observed side effect | Beat initialized `django_celery_beat.schedulers.DatabaseScheduler`. Its persisted local schedule immediately dispatched overdue periodic jobs; displayed cleanup jobs reported zero deletions and telemetry reached `telemetry.plane.so`. This was an observed consequence of reusing persistent development state, not an intentional functional test. |
| Safe task delivery | PASS within disabled-result-backend limits | Task `plane.bgtasks.storage_metadata_task.get_asset_object_metadata` with task ID `ffb878bb-446f-4b3c-a79a-92b9fd1f8a9c` and random nonexistent asset ID was received. It was subsequently neither active nor reserved and no error/traceback was logged. Its code returns on `FileAsset.DoesNotExist`; Celery results are disabled, so no terminal result record exists. |

The local stack remains running for developer use. No `down -v`, volume deletion, push, merge, or external deployment was performed.

## D-001 closure checklist

- [x] Product sponsor selects official Plane upstream, fork-based development, and the non-destructive integration-branch strategy.
- [x] Fork baseline and selected upstream commit are pinned with an ancestry/divergence report.
- [x] Repository-level community-versus-commercial capability proof covers work items, pages, estimates, relations, Gantt, APIs, webhooks, auth, notifications, UI conventions, deployment, and public extension seams.
- [x] Reuse/build matrix is technically prepared and mapped to Curve logical components; Federico Ocampo is the named engineering approver and licensing reviewer.
- [x] Full frontend checks, production build, and backend tests pass on the candidate tree.
- [x] The i18n generator correction is committed and the resulting candidate foundation SHA is pinned.
- [x] Deployment smoke test passes on that exact candidate foundation commit in the approved local non-production topology.
- [x] D-001 allocates additive migration/rollback and feature-disabled behavior proof to the M0-01 acceptance contract.
- [x] Federico Ocampo formally accepts the license/notices/corresponding-source impact against the exact ADR version/digest.
- [x] Federico Ocampo is recorded as the Plane support/upgrade owner with review at every Plane foundation upgrade, material licensing change, or ownership change.
- [x] Federico Ocampo reviews the exact head of both draft PRs and [ADR-001](adr-001-plane-upstream-foundation.md) receives a complete approval record.
- [x] Merge the approved candidate and pin resulting fork `preview` SHA `549db1aea8f3307b337b3686dbb844a87549cd95` before M0-01 dispatch.
