# Public development record

## Scope

This public reference replaces conversation-derived execution notes. Private
conversations, participant identities, environment observations, operational
decisions and local machine details belong in an approved private system.
This document supplies no execution authorization or deployment approval.

## Public implementation sequence

1. Define versioned domain, API, event and provider contracts.
2. Implement isolated synthetic fixtures and negative authorization tests.
3. Validate immutable subject identity, optimistic concurrency and idempotency.
4. Review the candidate diff for source disclosure and security regressions.
5. Publish only public-safe code, tests, configuration contracts and summaries.
6. Bind deployment-specific approvals and evidence in the private control plane.

## Sources

- [Integration contracts](../technical/integration-contracts.md) (provider-neutral
  interfaces and external document authoring).
- [Security and operations](../technical/security-and-operations.md)
  (classification, public disclosure and protected-data handling).
- [Development plan](../technical/development-plan.md) (public work-package
  dependencies and acceptance criteria).

## Historical copies

Replacing a current file does not erase previous Git objects, forks, cached
pages, downloaded artifacts or other copies. Historical removal requires a
separately coordinated repository-history and hosting-provider procedure.
