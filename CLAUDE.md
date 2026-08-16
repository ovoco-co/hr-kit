# CLAUDE.md

Read `.specify/memory/constitution.md` before doing anything in this repository. It governs the schema pattern, how claims are established, and how documents are written. This file is a pointer to it, not a replacement.

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

## O*NET Occupation Data

hr-kit's JD bootstrap pipeline (spec 003-jd-bootstrap) consumes O*NET occupation data from the workspace-shared `onet` PostgreSQL schema on VPS `ovoco.co`. The pipeline does NOT call O*NET Web Services directly; it queries the workspace schema via SSH tunnel.

Workspace spec defining the schema, refresh policy, and consumer contracts: `../onet/spec/`. See `consumer-contracts.md` in that directory for the canonical SQL query pattern hr-kit uses.

When O*NET publishes a new edition, the workspace refresh runs once on the VPS and all consuming apps (including hr-kit) see the new content on next query. No hr-kit-side action required for within-edition updates.

## Documentation Formatting Rules

The full rules are in the constitution. The ones broken most often:

- State whether a claim was read or run. A schema claim is a conclusion until the validator or an adapter has been run against it.
- Name the tier, the entity, and the adapter every time. "The schema" is ambiguous once core and a domain both exist.
- A correction is finished when every document repeating the old claim has been found, not when the finding is recorded.
- One clause per sentence by default. No em dashes, split the sentence instead.
- No run-in bold headers. A bold phrase opening a paragraph is not a heading.
- No ampersands as "and", no horizontal rules, no numbered sections, no tables of contents, no bold in table cells.

## Git Workflow

- Main branch: main
- Commit schema changes separately from data changes
