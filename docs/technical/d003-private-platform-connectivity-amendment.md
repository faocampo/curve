# Runtime connectivity requirements

## Status and authority

Public provider-neutral reference. Deployment-specific connectivity decisions,
network names, account identities, operational ownership and evidence are
maintained in an approved private deployment profile. This document grants no
environment activation or coding-agent execution authority.

## Required controls

- Resolve network attachments and service endpoints from reviewed configuration.
- Scope provider connections, credentials and workload identity by workspace.
- Limit developer-facing endpoints to authorized local access.
- Require authenticated, encrypted service communication for shared environments.
- Restrict ingress and egress to approved purposes and destinations.
- Keep business state authoritative in the domain database.
- Use bounded retries, idempotent delivery and authoritative reconciliation.
- Fence external effects when identity, storage or workflow health is unknown.

## Verification

Use a disposable synthetic profile to test service discovery, API and worker
readiness, database access, duplicate delivery, restart recovery, cancellation,
replay, disabled behavior and cleanup. Record actual network topology and
correlatable run identifiers only in private evidence storage.

## Activation and rollback

Shared-environment activation requires the applicable approved identity,
retention, encryption, backup, recovery, ownership and operational evidence.
The rollback procedure disables affected integrations and stops only resources
owned by the authorized deployment; it preserves unrelated workloads and data.

See [ADR-003](adr-003-runtime-topology.md) (runtime decision requirements),
[integration contracts](integration-contracts.md) (provider communication), and
[security and operations](security-and-operations.md) (trust boundaries).
