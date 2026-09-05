# Public reference sanitization

## Scope

Public documents, schemas and fixtures use fictional people, reserved example
domains and synthetic configuration. Environment-specific conversations,
deployment decisions, operational observations, repository targets and pilot
measurements are maintained in approved private systems.

## Authorization and compatibility

Public contract edition `curve-public-contracts-v1` is a new sanitized
publication. Its versioned manifest is
[`public-contract-edition-v1.json`](../../contracts/publication/public-contract-edition-v1.json)
(exact SHA-256 pins for this public schema and reference bundle). Legacy schema
filenames retain their payload-format versions; their new reserved-domain
identifiers and this edition identify the successor publication. Consumers
must update the entire bundle together and rerun conformance checks.

The public-edition migration and fresh integrity pins were explicitly
authorized before publication. This authorization covers sanitization and
publication only. It supplies no execution identity, credential, deployment
approval or protected-data access.

Sanitization changes bytes and their digests. A previous approval authenticates
only its original subject, never the sanitized derivative. Public example
identities cannot establish human authority. Changed dispatch packets remain
blocked and require fresh source, context and approval binding before use.

Schema identifiers now use reserved example domains. Consumers must resolve
the current schema bundle consistently. This publication change grants no
provider access, protected persistence, environment activation or deployment.

Historical execution records replaced by guides supply reproducible checks,
not proof that any current deployment passed them. Raw runtime evidence and
actual operational ownership must be verified through a private control plane.

## Publication checks

Review all outbound files and generated text, use synthetic fixtures, run
disclosure and secret checks, validate schema references and recomputed
synthetic digests, and verify that affected authority remains fail closed.

## Historical copies

Current-tree cleanup does not erase earlier commits, branches, forks, caches,
release artifacts, issue edit history or previously downloaded copies.
History rewriting and hosting-provider removal need a coordinated procedure.
No history rewrite or credential rotation is implied by this document.

See [security and operations](security-and-operations.md) (public disclosure
and protected-data handling) and [integration contracts](integration-contracts.md)
(public interfaces and private deployment configuration).
