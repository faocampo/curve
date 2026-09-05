# Product

> Sanitized public reference. Fictional identities cannot authorize execution.
> Historical approvals apply only to their original bytes; see
> [public contract edition](docs/technical/public-reference-sanitization.md) (sanitization, integrity and approval boundaries).

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Curve serves Example Organization product owners, technical leads, developers, and platform
operators who move product work from an initial idea through approved
requirements, implementation, quality review, and a draft pull or merge
request.

M1-01B focuses on an authenticated workspace member creating and managing a
manual-first Initiative, with Product Approver, Technical Approver, and Code
Approver assignments visible before execution begins.

## Product Purpose

Curve is Example Organization's AI-native product-development platform. It owns the end-to-end
product experience and uses Plane as its work-management foundation. Curve
combines durable workflow orchestration, governed knowledge, agent execution,
quality evidence, and human approvals while keeping every action attributable
and workspace scoped.

## Positioning

Curve links product intent, exact artifact versions, execution plans, repository
context, agent attempts, quality evidence, and human gates in one governed
lifecycle. Users can see why work is ready, blocked, running, or awaiting a
decision from the same product surface.

## Operating Context

- Example Organization operates Curve internally in local, staging, and production environments.
- The initial implementation uses the public Plane fork and the existing local
  Plane Docker stack.
- M1 begins with a manual-first lane. Provider, Onyx, model, and protected-body
  capabilities activate only after their named decisions and evidence exist.
- GitHub Project #2 is visual development tracking; Curve's own entities and
  workflows are the product system of record as implementation advances.

## Capabilities and Constraints

- Curve is the product identity and shell; Plane-backed capabilities appear
  under Work management.
- Every Initiative belongs to one active Product and one workspace.
- M1-01A supports STANDALONE Initiatives with DRAFT, ALIGNING, PAUSED, and
  CANCELLED states.
- Creation requires a title, description, case-insensitively unique keyword,
  risk tier, and the three mandatory active-human gate assignments.
- STANDARD and HIGH risk require three distinct approvers.
- Optimistic concurrency, idempotency, immutable policy/audit evidence, domain
  events, and outbox records govern every mutation.
- M1-01B provides list, create, detail, assignment visibility, and lifecycle
  controls. Idea Brief, PRD authoring, Roadmaps, providers, and agent execution
  remain later surfaces.
- Prototype data is synthetic and labeled. Production UI consumes only
  authorized API projections.

## Brand Commitments

- Product name: Curve.
- The approved horizontal Curve lockup is the primary identity.
- Curve Indigo `#4F5BFF`, Curve Violet `#6D4CFF`, Curve Ink `#101828`, and
  Curve Night `#0B1020` are approved brand colors.
- Plane attribution and the exact-version AGPL source link remain available
  without presenting Plane as the primary product.

## Evidence on Hand

- `docs/curve-ai-native-sdlc-prd.md` (Curve product requirements and lifecycle)
- `docs/technical/architecture.md` (system architecture and component boundaries)
- `docs/technical/m1-01a-initiative-core-implementation-evidence.md`
  (accepted Initiative backend behavior and evidence)
- `docs/technical/ux-m0-s4-foundation-probe.md` (approved Curve-first shell and
  task-based UX review pattern)
- `docs/design/curve-brand.md` (approved logo assets and brand rules)

No customer testimonial, external benchmark, adoption number, or production
usage claim is approved for this prototype.

## Product Principles

1. Make product intent and current readiness understandable before offering an
   action.
2. Bind important actions to visible evidence, authority, version, and state.
3. Preserve a usable manual-first path when optional AI or provider capabilities
   are unavailable.
4. Show blocked, partial, unknown, and stale states explicitly.
5. Keep human decisions deliberate, attributable, and recoverable.

## Accessibility & Inclusion

Curve user-facing surfaces target WCAG 2.2 AA, full keyboard operation, visible
focus, semantic structure, screen-reader status announcements, responsive
layouts, and state communication that does not depend on color alone.

## Prototype assumptions

The M1-01B prototype uses synthetic Example Organization examples, a split list/detail desktop
layout, and a responsive stacked layout as review hypotheses. These assumptions
remain unapproved until Designated reviewer completes the task-based UX review.
