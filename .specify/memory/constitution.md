<!--
Sync Impact Report
Version change: provisional (unversioned) -> 1.0.0
Bump rationale: MAJOR. First ratified version. Promotes the six provisional
principles to non-negotiable rules, adds Quality Gates and Governance sections,
and replaces placeholder template tokens with concrete values.
Modified principles:
  - I. Candidate-Journey-Centric Schema (tightened to MUST, added scope test)
  - II. Platform-Agnostic Design (renamed provisional "Platform-Agnostic Design" and
    clarified overlay boundary)
  - III. Schema Integrity (added validator gate and LOAD_PRIORITY rule)
  - IV. Layered Architecture (added layer-swap invariant)
  - V. Core + Domains (added one-way reference rule)
  - VI. Example Data Tells a Story (named the fictional recruiting firm scenario)
Added sections:
  - Quality Gates
  - Governance
Removed sections:
  - "Notes" (provisional placeholder no longer needed)
Templates requiring updates:
  - .specify/templates/plan-template.md (OK, Constitution Check is dynamic) - verified
  - .specify/templates/spec-template.md (OK, no principle-specific content) - verified
  - .specify/templates/tasks-template.md (OK, no principle-specific content) - verified
  - .specify/templates/constitution-template.md (OK, this file is derived from it) - verified
Follow-up TODOs:
  - TODO(RECRUITING_FIRM_NAME): pick a canonical fictional recruiting firm name
    during the first /speckit.specify run, mirroring cmdb-kit's OvocoCRM.
-->

# hr-kit Constitution

## Core Principles

### I. Candidate-Journey-Centric Schema

The root organizing concept is the candidate's journey through a hiring process, not the
organization chart or the job board. Every type in Core MUST describe a step, actor, or
artifact in that journey. A type that cannot trace back to a Candidate, Job Requisition,
Application, Placement, Client, or Stage does not belong in Core. Process records that
live naturally in other systems (payroll ledgers, ticketing systems, CRM opportunities)
MUST NOT be modeled in Core.

Rationale: A single organizing axis keeps the schema legible as it grows and prevents
the drift toward an HRIS-of-everything that dooms most starter kits.

### II. Platform-Agnostic Design

Schema defines shape in JSON. Adapters push that shape to a target platform (Hireology
first, other ATS and HRIS targets later). No adapter-specific concepts MAY leak into
the schema layer. A type that works for Hireology MUST also be expressible in any other
adapter without changes to Core. Platform-specific field names, API quirks, and
transformation rules MUST live in adapter overlay files, not in the schema.

Rationale: Adapter leakage is how multi-target kits become single-target kits.

### III. Schema Integrity

Every schema change MUST validate clean (`node tools/validate.js --schema <dir>` returns
0 errors, 0 warnings) before it is merged. Every importable type MUST appear in
LOAD_PRIORITY in dependency order. Attribute names are camelCase in schema and data
files. Display names are Title Case. JSON data files are kebab-case. References use
exact Name matching and are case-sensitive.

Rationale: Convention enforced by tooling is the only convention that survives.

### IV. Layered Architecture

The kit has three layers: schema defines structure and attributes, data files contain
example records, adapters push both to a target platform. Each layer MUST be
self-contained. No layer depends on another layer's internals. Adapters MUST be
swappable without touching schema. Data MUST be addable without touching schema when
the type already exists.

Rationale: Layer independence is what lets users adopt one piece of the kit without
adopting all of it.

### V. Core + Domains

Core is one schema solving one problem: "Track a candidate through a hiring process and
place them with a client." Domains are opt-in packages for specialized concerns
(background checks, onboarding, commission tracking, compliance). A domain MAY reference
Core types. Core MUST NOT reference domain types. Domains MAY reference other domains
only when the dependency is explicitly declared.

Rationale: One-way references keep Core installable without any domain, which is the
whole point of having domains.

### VI. Example Data Tells a Story

All example data follows a single fictional recruiting firm scenario and demonstrates a
realistic candidate journey end to end. Data MUST be internally consistent and
illustrate the schema's value. Placeholder data ("Test Candidate 1", "Job A") MUST NOT
appear in committed data files. Every record should teach the reader something about
how to populate a real ATS.

Rationale: Example data is the fastest path from "I cloned this" to "I understand this."

## Writing and Documentation Standards

- No em dashes. Use hyphens or commas.
- No ampersands as "and" (proper acronyms like I-9 or EEO are fine).
- No horizontal rules.
- No numbered sections. Use header levels.
- No tables of contents.
- No bold in table cells.
- Use "section" not "chapter."
- Never hardcode type counts in prose or tables. They go stale.
- Title is plain text. First header is H1.
- Ground explanations in the fictional recruiting firm scenario and actual schema files.

## Development Workflow

- Main branch: `main`. All work merges to main.
- Commit schema changes separately from data changes.
- Validate before committing: `node tools/validate.js --schema schema/core` (or whichever
  tier is affected).
- Adapter changes require round-trip testing: import, export, validate-import against
  the target platform or a vendor sandbox.
- Documentation changes that reference schema MUST be verified against current schema
  files before merge.
- No Ovoco-internal, GovCon, or customer-specific content. This is a standalone
  open-source project.

## Quality Gates

- Schema validates clean (0 errors, 0 warnings) before any merge.
- LOAD_PRIORITY includes every importable type in dependency order.
- Data files match schema-attributes.json field names exactly (camelCase).
- All references in data files resolve to records that exist in the data set.
- Adapter overlay files map every Core attribute to a platform-native field.
- New types include: schema-structure entry, schema-attributes entry, LOAD_PRIORITY
  entry, data file, and documentation.
- New domains include: a manifest declaring which Core types and which other domains
  they reference.

## Governance

This constitution supersedes other practices in the hr-kit repository. Amendments
require updating this document and the `CLAUDE.md` project instructions in the same
pull request when the change affects agent behavior or contributor workflow. Schema
conventions are enforced by the validator, not by review alone. The `/speckit.plan`
Constitution Check gate MUST pass before Phase 0 research begins, and MUST be
re-checked after Phase 1 design.

Versioning follows semantic versioning for governance:

- MAJOR for backward-incompatible principle removals or redefinitions.
- MINOR for new principles or materially expanded guidance.
- PATCH for clarifications, wording, and non-semantic refinements.

**Version**: 1.0.0 | **Ratified**: 2026-04-24 | **Last Amended**: 2026-04-24
