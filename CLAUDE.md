# CLAUDE.md

## Project Overview

hr-kit is an open-source starter kit for recruiting and HR data. Follows the cmdb-kit three-layer pattern: schema (JSON structure + attributes, platform-agnostic), data (JSON example records), and adapters (push to target ATS or HRIS). First adapter target is Hireology.

## Architecture

Identical to cmdb-kit. See `../cmdb-kit/CLAUDE.md` for the full pattern. Key differences for HR:

- Root organizing concept is the candidate journey, not a product. Core entities are Candidate, Job Requisition, Application, Placement, Client, Stage.
- No infrastructure domain. Domains (opt-in) cover HR concerns: background checks, onboarding, commission tracking.
- Platform targets are ATS and HRIS (Hireology first), not ITSM.

## Related Projects

- `../cmdb-kit` for the architectural pattern this kit follows
- `../migration-kit` for migration tooling patterns

## Speckit

Initialized with `specify init --here --ai claude`. Workflow: `/speckit.specify` → `/speckit.clarify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.analyze` → `/speckit.implement`.

Shared constitution lives at `../.specify-projects/hr-kit/memory/constitution.md` and is symlinked into `.specify/memory/` by `../setup-workspace.sh`.

## Documentation Formatting Rules

- No em dashes (use hyphen or comma instead)
- No ampersands as "and" (proper acronyms are fine)
- No horizontal rules
- No numbered sections, just use header levels
- No tables of contents
- No bold in table cells

## Git Workflow

- Main branch: main
- Commit schema changes separately from data changes

## Active Technologies

- Node.js 18+ runtime; consumes `@ovoco/kit-validator` via git URL pinned to `git+https://github.com/ovoco-co/kit-validator.git#v0.1.0`. (002-schema-validator-integration)
- JSON for schema and data files. Schema definitions live in `schema/core/schema-structure.json` and `schema/core/schema-attributes.json`; data records live in `schema/core/data/<kebab-case-type-name>.json`. (001-core-hr-schema)
- Local filesystem only. No databases, no network calls at validation run time.

## Recent Changes

- 001-core-hr-schema: added JSON schema-structure and schema-attributes files plus per-type data files for the six entities and five lookup types making up Core.
- 002-schema-validator-integration: added the thin `tools/validate.js` entry point and `tools/lib/constants.js` constants module consuming `@ovoco/kit-validator`.
