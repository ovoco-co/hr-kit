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
- Node.js 18+ (matches existing `package.json` engines field, matches kit-validator) + `@ovoco/kit-validator` consumed via git URL pinned to `git+https://github.com/ovoco-co/kit-validator.git#v0.1.0`. No other dependencies introduced by this feature. (002-schema-validator-integration)
- Local filesystem only. The validator reads `schema/core/` and `schema/domains/<domain>/` directories at validation time. No databases, no network calls at run time. (002-schema-validator-integration)

## Recent Changes
- 002-schema-validator-integration: Added Node.js 18+ (matches existing `package.json` engines field, matches kit-validator) + `@ovoco/kit-validator` consumed via git URL pinned to `git+https://github.com/ovoco-co/kit-validator.git#v0.1.0`. No other dependencies introduced by this feature.
