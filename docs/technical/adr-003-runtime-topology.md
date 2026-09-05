# ADR-003: Runtime topology contract

- Status: Public reference; environment activation requires private approval
- PRD decision: D-003 (runtime topology and trust-zone decision)
- Owner: Deployment decision owner
- Reviewers: Security and platform reviewers

## Context and constraints

Curve requires durable orchestration, authoritative domain persistence,
workspace-scoped identity and bounded service communication. The public
contract describes capabilities and controls. Actual infrastructure vendors,
topology, endpoints, account identities, placement, capacity, recovery values
and operational ownership belong in an approved private deployment profile.

## Decision drivers and options

Evaluate durable workflow replay, cancellation, idempotency, tenant isolation,
observability, upgrade compatibility, operator support and recovery. A local
disposable profile may exercise these controls using synthetic data. It does
not establish shared-environment approval or production readiness.

## Required runtime contract

- Keep Curve business state authoritative in PostgreSQL.
- Use durable orchestration for human waits, timers and provider operations.
- Resolve service discovery, network policy and credentials from reviewed
  environment configuration, outside the public repository.
- Authenticate shared-environment service communication and enforce encrypted
  transport, least privilege and default-deny provider access.
- Scope operations and their idempotency, logs and observations by workspace.
- Keep bodies and secrets outside workflow history and ordinary telemetry.
- Bind runtime versions, dependency pins and rollout/rollback evidence to the
  exact candidate; source metadata alone grants no activation authority.

## Verification and activation

Automated tests cover service readiness, duplicate delivery, cancellation,
restart recovery, replay, authorization denial, disabled behavior and cleanup.
Private deployment evidence additionally binds persistence, identity,
certificates, backup/restore, operational ownership and approval.

D-009 (retention, erasure and backup policy) gates protected persistence.
No placeholder identity, fictional owner or synthetic fixture is a human
approval. Historical signatures authenticate their original subject bytes,
not a sanitized derivative of those bytes.

## Rollback

Disable affected Curve capabilities, fence pending external effects and stop
only deployment-owned resources. Preserve unrelated workloads and data, and
record recovery/reconciliation before resuming an operation.

## Related contracts

- [Connectivity requirements](d003-private-platform-connectivity-amendment.md)
  (provider-neutral communication and verification controls).
- [Integration contracts](integration-contracts.md) (command, provider and
  reconciliation semantics).
- [Security and operations](security-and-operations.md) (disclosure, identity,
  storage and operational safeguards).
