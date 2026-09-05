# AI Coding Agent Rules

## Public-repository disclosure boundary

This repository is public. AI coding agents working in this repository **MUST
NOT disclose any information that is internal to X3M** in source code,
documentation, tests, fixtures, examples, generated artifacts, screenshots,
logs, command output, commit messages, branches, issues, pull requests, review
comments, or release notes.

An agent **MUST** treat information as internal unless it is already published
in an approved public source or an authorized X3M reviewer explicitly approves
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
configuration only in an approved private X3M system.

The normative handling rules are defined by
[Curve Security and Operations](docs/technical/security-and-operations.md)
(classification, publication controls, protected destinations, credentials,
and incident handling).
