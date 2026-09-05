# M1-01B (Curve-First Initiative Shell) Human Execution Grant

> Sanitized public reference. Fictional identities cannot authorize execution.
> Historical approvals apply only to their original bytes; see
> [public contract edition](public-reference-sanitization.md) (sanitization, integrity and approval boundaries).

## Document control

| Field | Value |
| --- | --- |
| Status | `ACTIVE / HUMAN_OPERATED_OUTSIDE_CURVE_DISPATCH / LOCAL_ONLY` |
| Version | 1.2 |
| Effective date | 2026-09-01 |
| Product | Curve |
| Work package | M1-01B (Curve-first Initiative shell) |
| Governing decision | [Coding-agent local execution and authority decision](coding-agent-local-execution-decision.md) (approved human-operated coding outside Curve dispatch, deferred machine profile, and production fail-closed boundary) |
| Implementation definition | [M1-01B implementation task packet](m1-01b-initiative-shell-implementation-task-packet.md) (typed Initiative client, Curve route, list/detail/create/lifecycle UI, tests, security, and rollback) |
| Experience contract | [M1-01B Initiative shell experience contract](ux-m1-01b-initiative-shell.md) (approved desktop/mobile behavior, accessibility, visual rules, and manual test cases) |
| Decision owner | Designated reviewer, Designated technical owner (`example-reviewer`) |
| Human reviewer | Designated reviewer (`example-reviewer`) |
| Implementer | Codex, operated under Designated reviewer's standing technical-work delegation |

## Execution classification

This is one bounded, human-operated repository attempt under
B-CODING-AUTHORITY-01 Option 3 (human-operated coding outside Curve dispatch).
It creates no Curve machine-dispatch claim, authorization receipt, or lease.
B-CODING-TOOLS-01 (machine coding-tool execution profile) remains
`DEFERRED_TO_M4`; production automated dispatch remains fail closed.

Designated reviewer's 2026-09-01 standing instruction authorizes Codex to make and execute
coding-only technical decisions autonomously. Product decisions and manual
UX/UI acceptance remain Designated reviewer's explicit gates. That instruction activates
this grant when the exact repository preflight below passes.

## Exact grant tuple

| Field | Bound value |
| --- | --- |
| Repository | `git@github.com:faocampo/plane.git` |
| Target branch | `preview` |
| Exact base SHA | `c516a612a29751b0d24bcbd32bfcba1bd73fe3af` |
| Feature branch | `curve/m1-01b-initiative-shell` |
| Dedicated worktree | `/private/tmp/plane-m1-01b-initiative-shell-20260901` |
| Curve normative revision before this grant | `77ab31d4ed4bc2fdd1a9800d92ff9b3f6604aac5` |
| Published packet | `CURVE-M1-01B` version 3; machine status remains `BLOCKED` |
| Published context digest | `sha256:f73da68a96dc75206967ec60b82c2e252c3ea0651fc5af33b0c1005ccfb19377` |
| GitHub Project item | `PVTI_lAHOBNjuQc4BgZzOzg4vNto` (M1-01B implementation; visual metadata only) |
| Data boundary | Existing authenticated local workspace metadata and synthetic `INTERNAL` test data; no protected body, credential, secret, provider payload, staging data, or production data |
| Budget | US$0 external spend; one active attempt; at most 120 local compute minutes |
| Validity | 2026-09-01 through 2026-09-04T23:59:59Z; any bound-value change invalidates the grant |

The original packet base `9f9bb14f46b80e1d05b4c900d25c1af7a229b55c`
is an ancestor of the bound base. A path-overlap preflight found no intervening
change to any declared M1-01B implementation path. The newer exact base is
therefore the operative human-execution base without altering product scope.

## Authorized file scope

The attempt may change only:

1. `packages/types/src/curve.ts` (shared Curve TypeScript contracts).
2. `packages/types/src/index.ts` (shared type export barrel, only if required).
3. `packages/services/src/curve/curve.service.ts` (authenticated Curve HTTP client).
4. `packages/services/src/index.ts` (shared service export barrel, only if required).
5. `apps/web/core/services/curve.service.ts` (web Curve service singleton, only if required).
6. `apps/web/app/routes/core.ts` (Curve route registry).
7. `apps/web/core/components/curve/curve-workspace-sidebar.tsx` (Curve-first navigation).
8. `apps/web/app/(all)/[workspaceSlug]/(projects)/curve/initiatives/page.tsx` (Initiatives route entry).
9. `apps/web/core/components/curve/initiatives/` (Initiative presentation components).
10. `apps/web/core/hooks/use-curve-initiatives.ts` (Initiative state/controller hook).
11. `apps/web/tests/curve/curve-initiative-service.test.ts` (typed-client tests).
12. `apps/web/tests/curve/curve-initiative-shell.test.tsx` (UI acceptance tests).

Existing member-store files are read-only inputs. Package manifests and the
lockfile remain unchanged because the accepted stack already contains the
required runtime and test dependencies.

## Authorized behavior

The implementer may create the dedicated worktree and feature branch; implement
the exact approved frontend behavior; run local repository-native validation;
start a local web development server for technical verification; commit and
push the bounded change; open one draft Plane pull request into `preview`; read
commit-bound CI and CodeQL evidence; and update GitHub Project visual status.

The implementation must preserve all M1-01A authorization, idempotency, ETag,
pagination, workspace-isolation, and safe-error semantics. STANDARD and HIGH
risk creation must locally require three distinct active human IDs while the
backend remains authoritative. Every matching loaded Initiative must remain
visible on mobile, and the create form must reset on every new opening.

## Tool and security evidence

The human-operated local procedure records these observed tools without
claiming Curve machine enforcement:

| Tool | Version and path | SHA-256 |
| --- | --- | --- |
| Node.js | `v26.7.0`; `/opt/homebrew/bin/node` | `1ef99ea25fe70c9b67e7efe768ef8ee22148d3cabc703db6131b57aeb617d040` |
| pnpm | `11.3.0`; `/opt/homebrew/bin/pnpm` -> `/opt/homebrew/lib/node_modules/pnpm/bin/pnpm.mjs` | `ff3224d46b47fbb24a7e9fe15fededef7e00892d07d4e376b6762d4899906bfd` |

The primary install precondition is
`pnpm install --frozen-lockfile --offline --ignore-scripts`. When pnpm reports
an incomplete offline store after downloading zero packages, the human-operated
controller may instead reuse an already-installed local Plane dependency tree
only when the complete source and target workspace definition matches exactly:

1. `package.json` (workspace package-manager and script contract).
2. `pnpm-lock.yaml` (complete resolved dependency graph).
3. `pnpm-workspace.yaml` (workspace package topology).
4. Every workspace-package `package.json` discovered from that topology
   (package-local dependencies, scripts, name, and version).

The reuse procedure copy-on-write clones every ignored `node_modules`
directory while preserving relative pnpm links and records the source worktree
plus every definition digest pair. It then regenerates pnpm's ignored
`.pnpm-workspace-state-v1.json` for the target absolute workspace paths and a
post-verification timestamp; that generated state may never replace or modify a
tracked manifest or lockfile. The controller must run pnpm with
`--config.verify-deps-before-run=error`, verify that no tracked file changed,
and then run the complete required validation below. A digest mismatch,
missing workspace dependency directory, invalid pnpm link, pnpm dependency
status error, or failed validation stops the attempt. Package download,
lifecycle scripts, registry fallback, provider access, and arbitrary egress
remain excluded.

Required evidence at the exact implementation head is:

1. `pnpm --filter=web check:lint`.
2. `pnpm --filter=web check:types`.
3. `pnpm --filter=web test -- tests/curve/curve-initiative-service.test.ts tests/curve/curve-initiative-shell.test.tsx`.
4. `pnpm --filter=web test -- tests/curve`.
5. `pnpm check`.
6. `pnpm build`.
7. `git --no-pager diff --check --no-ext-diff --no-textconv --ignore-submodules=all`.
8. Repository-native Plane CI and CodeQL at the exact head.
9. A trusted exact-ref query proving zero open Critical or High finding.
10. Manual browser verification by Designated reviewer for desktop/mobile layout,
    keyboard/focus behavior, readable recovery states, and overall UX/UI.

## Exclusions

This grant excludes merge before manual UX acceptance, deployment, release,
staging or production mutation, backend or migration changes, dependency
changes, provider/model/Onyx/MCP/Temporal/VCS-controller behavior,
infrastructure changes, protected data, managed credentials, and any file or
external effect outside the declared scope.

## Stop conditions

Stop before mutation if `origin/preview` differs from the exact base; the
feature branch or worktree is occupied; a scoped path has an unreviewed
intervening change; neither the offline install nor the digest-identical local
dependency-tree reuse procedure completes; the target API differs from the
accepted M1-01A contract; or an out-of-scope change is required.

Stop during implementation for any product/UX alternative requiring human
choice, protected or cross-workspace data exposure, ambiguous member identity,
unapproved dependency, failing required test, missing same-head CI/CodeQL,
Critical/High finding, or failed cleanup.

## Review, merge, and rollback

Codex may complete the technical implementation, review, CI remediation, and
draft-PR preparation autonomously. Designated reviewer performs the required manual UX/UI
test on the exact candidate head. The Plane PR remains unmerged until that test
is explicitly accepted.

Before merge, rollback is branch abandonment or reversion. After a separately
accepted merge, rollback is reverting the one Plane merge commit or disabling
Curve with `CURVE_ENABLED=0` and omitting the Curve Compose profile. This
frontend-only package has no data migration or persistence rollback.
