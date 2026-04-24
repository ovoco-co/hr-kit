# Current Status

Snapshot taken 2026-04-24. Updated as the project moves.

## What exists

The repository is scaffolded and public at https://github.com/ovoco-co/hr-kit. The directory layout follows cmdb-kit: schema directories for Core and Domains, an adapter directory for the first target platform (Hireology), tools directory for validation, docs directory, and CSV templates directory. None of these contain content yet beyond placeholders.

The speckit workflow is installed. Speckit skills live in `.claude/skills/`. Feature specs will live in `specs/`, one branch per feature.

The constitution is ratified at v1.0.0. See `constitution.md` in this folder for the full text. The six principles it establishes are binding: every schema change, data file, and adapter must comply.

## What we're working on right now

The first feature spec, `001-core-hr-schema`, is in progress. It covers the Core schema for candidates, job requisitions, applications, placements, clients, and stages, plus the lookup types those entities reference. It uses Keystone Recruiting as the fictional firm in the example data.

The spec is being drafted now. Once the spec is complete, it gets clarified with structured questions, then planned, then broken into tasks, then implemented. See `how-specify-works.md` in this folder for a full explanation of that workflow.

## What comes after

Two more features are queued:

- `002-hireology-adapter`: A containerized adapter that pushes Core schema and data into a live Hireology account. Modeled on cmdb-kit's JSM and ServiceNow adapters. Takes Hireology credentials from environment variables.

- `003-hireology-mock-server`: A Docker container that stands up a local stub server mimicking Hireology's API with fixture data. Lets contributors iterate on the adapter without touching a real account. Built second so it can mirror the real API faithfully.

Domains (background checks, onboarding, commission tracking, compliance) come after Core and the first adapter are working. Each domain is its own spec.

## What is blocking

Nothing technical. The Core HR schema spec needs Geoff's input on a handful of scope questions before it can move from draft to implementation. See `questions-for-geoff.md` in this folder.

## What is NOT in scope

- Any non-Hireology ATS (for now)
- HRIS features beyond recruiting (payroll, benefits, time tracking)
- A UI of any kind, beyond what the target platform already provides
- Discovery or automation features
- Multi-tenant or SaaS hosting

These may become future features, but they are not on the current plan.
