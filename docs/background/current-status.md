# Current Status

Snapshot taken 2026-04-24. Updated as the project moves.

Last update: 2026-04-24, evening. Spec drafted, clarified, and pushed; parallel work started while Geoff reviews.

## What exists

The repository is scaffolded and public at https://github.com/ovoco-co/hr-kit. The directory layout follows cmdb-kit: schema directories for Core and Domains, an adapter directory for the first target platform (Hireology), tools directory for validation, docs directory, and CSV templates directory. None of these contain content yet beyond placeholders.

The speckit workflow is installed. Speckit skills live in `.claude/skills/`. Feature specs will live in `specs/`, one branch per feature.

The constitution is ratified at v1.0.0. See `constitution.md` in this folder for the full text. The six principles it establishes are binding: every schema change, data file, and adapter must comply.

## What we're working on right now

The first feature spec, `001-core-hr-schema`, is drafted, clarified, and pushed to the `001-core-hr-schema` branch on `origin`. Four clarifications have provisional answers (see `questions-for-geoff.md`). The spec is parked at draft until Geoff reviews. `/speckit.plan` has not been run.

While Geoff reviews, the parallel work plan is:

- Schema validator integration. The validator itself is being built as a separate public repo, `ovoco-co/kit-validator`, since both cmdb-kit and hr-kit consume it and standalone clones of either kit need the library to be installable from npm or git, not from a workspace-internal path. A workspace-side Claude session is running speckit on the new repo to define the `validate(config) → { errors, warnings, exitCode }` surface, port the rules from cmdb-kit's existing validator, and add the camelCase, Title Case, and kebab-case lint that cmdb-kit's validator does not currently enforce. hr-kit's responsibility shrinks to a thin `tools/validate.js` entry point plus a `tools/lib/constants.js` carrying hr-kit's `LOAD_PRIORITY`, `PERSONNEL_TYPES`, `NESTED_TYPES`, and `ATTR_NAME_MAP`. Tracked here as `002-schema-validator`. Spec, plan, and tasks phases proceed in parallel; implementation waits on `kit-validator` shipping 0.1.0. Lead item.
- Draft a Keystone industry sampler in `keystone-industry-sampler.md` so Geoff can pick an industry by reading concrete one-paragraph sketches rather than answering an abstract question. Ready for review.
- Survey Hireology's public API. Captures auth model, candidate and requisition endpoints, rate limits, and how customizations (custom fields, stages, application forms) surface. Front-loads Phase 0 research for the queued Hireology adapter spec. Independent of any Core decision.

## What comes after

The feature queue, in order:

- `002-schema-validator`: Thin integration of the workspace-level `ovoco-co/kit-validator` library, plus hr-kit-specific constants. See the parallel work plan above. Slots in ahead of the Hireology specs because every later feature depends on the validator being green.

- `003-hireology-adapter`: A containerized adapter that pushes Core schema and data into a live Hireology account. Modeled on cmdb-kit's JSM and ServiceNow adapters. Takes Hireology credentials from environment variables. (Was queued as 002 before the validator integration was carved out.)

- `004-hireology-mock-server`: A Docker container that stands up a local stub server mimicking Hireology's API with fixture data. Lets contributors iterate on the adapter without touching a real account. Built second so it can mirror the real API faithfully. (Was queued as 003.)

Domains (background checks, onboarding, commission tracking, compliance) come after Core and the first adapter are working. Each domain is its own spec.

## What is blocking

Nothing technical. The Core HR schema spec needs Geoff's input on a handful of scope questions before it can move from draft to implementation. See `questions-for-geoff.md` in this folder. The parallel work above does not depend on Geoff's answers, so it proceeds while we wait.

## What is NOT in scope

- Any non-Hireology ATS (for now)
- HRIS features beyond recruiting (payroll, benefits, time tracking)
- A UI of any kind, beyond what the target platform already provides
- Discovery or automation features
- Multi-tenant or SaaS hosting

These may become future features, but they are not on the current plan.
