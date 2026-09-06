# Curve

Curve governs the software-delivery lifecycle on a Plane foundation. This
repository contains product requirements, architecture, versioned contracts,
synthetic conformance models and implementation evidence. Application code lives
in the [Plane fork](https://github.com/faocampo/plane) (runtime implementation).

## Start here

1. Read [AGENTS.md](AGENTS.md) (agent workflow and public-data boundary).
2. Read [coding handoff](docs/technical/coding-handoff.md) (authority, current
   implementation boundary, next task and verification).
3. Select a stage in [pending stages](docs/technical/pending-stages.md)
   (outcome, dependencies, deliverables, exit evidence and source packet).
4. Load only the selected packet's normative requirements and exact contracts.

The [PRD](docs/curve-ai-native-sdlc-prd.md) (product behavior) and
[technical index](docs/technical/README.md) (complete reference library) provide
the underlying specifications. Historical records and synthetic fixtures retain
their original scope; their presence does not authorize current execution.

## Validation

Use the pinned Node/pnpm versions in
[CI](.github/workflows/docs.yml) (documentation validation workflow). Run `pnpm install
--frozen-lockfile`, then `pnpm check`. Review the full outbound diff in addition
to automated disclosure checks. Avoid reinstalling or purging another worktree's
shared dependency directory to repair a local package-manager error.
