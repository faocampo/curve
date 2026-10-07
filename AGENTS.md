# AI Coding Agent Rules

## Reading and execution order

Follow the approved [repository delivery policy](docs/technical/repository-delivery-policy.md)
(PR scope, two-PR stack limit, integration gates and safe branch retirement).

Start with [coding handoff](docs/technical/coding-handoff.md) (authority, current
work and next task), then [pending stages](docs/technical/pending-stages.md)
(stage outcomes and gates). Load the selected packet and its referenced contracts;
use the full technical index for discovery, not as an instruction to load every
historical packet into a coding context.

- Separate product requirements, candidate contracts, implementation evidence,
  merge evidence and deployment evidence. Never promote one into another.
- Recheck repository, branch, base SHA and live PR status before coding.
- Preserve immutable schema/context/approval pins. Use a reviewed successor for
  incompatible changes; retain old evidence with its original scope.
- Public governance worksheets and fictional identities are examples. Resolve
  actual approvals from the approved private authority source; ask only for
  genuinely missing decisions. Never copy private policy values into this repo.
- Curve-dispatched agents use the controller/lease protocol. A human-operated
  development session uses its explicit user authorization and repository rules;
  it cannot self-approve a Curve gate or activate production.
- Explain each referenced document or task ID with a short parenthetical subject.
- Run `pnpm check` and relevant implementation tests. Documentation checks alone
  do not establish runtime behavior. Report exact tested commits and limitations.

## Public-repository disclosure boundary

This repository is public. AI coding agents working in this repository **MUST
NOT disclose any information that is internal to any adopting organization** in source code,
documentation, tests, fixtures, examples, generated artifacts, screenshots,
logs, command output, commit messages, branches, issues, pull requests, review
comments, or release notes.

An agent **MUST** treat information as internal unless it is already published
in an approved public source or an authorized reviewer for the adopting organization explicitly approves
that exact information for public disclosure. Uncertainty fails closed: the
agent stops publication and asks an authorized reviewer for a sanitized value.

Internal information includes, without limitation:

- real people, customers, users, email addresses, documents, Initiative names,
  meeting content, support cases, and business data;
- Google Workspace domains, Shared Drive or folder names and IDs, file IDs,
  document URLs, group membership, permission topology, and administrator
  configuration;
- OAuth clients, service accounts, callback or webhook endpoints, tokens,
  credentials, secrets, encryption-key references, and secret locations;
- private repository names or paths, infrastructure topology, hostnames,
  addresses, account or tenant identifiers, monitoring endpoints, incident
  details, and deployment configuration;
- internal classifications, retention values, policies, procedures, roadmaps,
  metrics, screenshots, logs, traces, prompts, tool output, and source excerpts;
- hashes, digests, metadata, or identifiers that could confirm, correlate, or
  reveal an internal resource.

Public artifacts **MUST** use provider-neutral descriptions and synthetic data,
including reserved example domains such as `example.invalid`, opaque fake IDs,
and fictional organizations and people. Sanitization must remove the sensitive
value and any contextual detail that would allow it to be reconstructed.

Before any public Git operation or public GitHub mutation, an agent **MUST**
inspect the complete outbound diff and all attached/generated material for
internal information. Automated secret scanning is additional evidence and
does not replace this disclosure review. If internal information is found, the
agent removes it from the public artifact and records environment-specific
configuration only in an approved private system of the adopting organization.

The normative handling rules are defined by
[Curve Security and Operations](docs/technical/security-and-operations.md)
(classification, publication controls, protected destinations, credentials,
and incident handling).
