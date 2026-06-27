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

## O*NET Occupation Data

hr-kit's JD bootstrap pipeline (spec 003-jd-bootstrap) consumes O*NET occupation data from the workspace-shared `onet` PostgreSQL schema on VPS `ovoco.co`. The pipeline does NOT call O*NET Web Services directly; it queries the workspace schema via SSH tunnel.

Workspace spec defining the schema, refresh policy, and consumer contracts: `../onet/spec/`. See `consumer-contracts.md` in that directory for the canonical SQL query pattern hr-kit uses.

When O*NET publishes a new edition, the workspace refresh runs once on the VPS and all consuming apps (including hr-kit) see the new content on next query. No hr-kit-side action required for within-edition updates.

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
