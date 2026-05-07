# Current Status

Snapshot taken 2026-05-07. Updated as the project moves.

Last update: 2026-05-07. Three feature branches in flight (001 Core HR schema, 002 schema validator integration, 003 JD bootstrap). None merged to main yet; main still carries only the scaffold and background docs. kit-validator has shipped 0.1.0 and is consumed from npm.

## What exists

The repository is scaffolded and public at https://github.com/ovoco-co/hr-kit. The directory layout follows cmdb-kit. main carries the scaffold, license, README, CLAUDE.md, the speckit installation, this background folder, and a placeholder package.json. main does not yet carry any schema, data, tools, or specs. All implementation work currently lives on feature branches.

The constitution is ratified at v1.0.0. See `constitution.md` in this folder for the full text. The six principles it establishes are binding: every schema change, data file, and adapter must comply.

The companion `ovoco-co/kit-validator` repo has shipped 0.1.0. hr-kit consumes it as `@ovoco/kit-validator` from the workspace, with a thin `tools/validate.js` entry point and a hr-kit-specific `tools/lib/constants.js`. The validator integration is implemented on the 002 branch.

## Where each feature stands

### 001-core-hr-schema (branch open, not merged)

Spec drafted and pushed, with four provisional clarifications recorded in `questions-for-geoff.md`. Plan, research, data model, quickstart, contracts, and tasks all landed (commit `bb08f0f`). Tasks T021 and T023 through T026 are marked done (commit `0094fbf`); the rest of the task list is untouched. The shipped artifacts include:

- `schema/core/schema-structure.json`, `schema/core/schema-attributes.json`, and `schema/core/README.md`
- Lookup data files: `application-outcome.json`, `employment-type.json`, `placement-status.json`, `requisition-status.json`

The Candidate, Job Requisition, Application, Placement, Client, and Stage types are defined in the structure file. No example records exist yet for those primary types; that work belongs to the remaining tasks.

Status: ungated implementation. Geoff has not reviewed; the four provisional clarifications stand.

### 002-schema-validator-integration (branch open, not merged)

Spec, plan, research, data model, contracts, quickstart, and tasks all landed (commit `b5210e2`), plus a follow-up surfacing validator output and locking the kit-validator install (commit `bc7fb3c`). Symlink-depth fix to `.specify/memory` landed in `211800d`.

Concrete shipped pieces:

- `tools/validate.js` (thin entry point that calls `@ovoco/kit-validator`)
- `tools/lib/constants.js` (hr-kit's LOAD_PRIORITY, PERSONNEL_TYPES, NESTED_TYPES, ATTR_NAME_MAP)
- Updated `package.json` and `package-lock.json` pinning `@ovoco/kit-validator`

Status: ungated implementation. The branch produces a green validator run when paired with 001's schema content.

### 003-jd-bootstrap (current branch, spec uncommitted)

Spec drafted at `specs/003-jd-bootstrap/spec.md` plus a requirements checklist. Both files are untracked on the branch; nothing has been committed for this feature yet.

Scope: a Job Descriptions domain under `schema/domains/job-descriptions/` plus a Paylocity-to-O*NET bootstrap pipeline at `tools/jd-bootstrap/`. Pipeline takes a Paylocity position-report export plus an operating-states list, dedupes by SOC code, fetches O*NET data, and writes draft JD records as JSON. Existing edits survive regeneration via a base-and-overlay split. State-specific posting requirements live in a separate matrix file, not embedded in the JDs themselves.

Geoff confirmed 2026-04-30 that Keystone Recruiting's industry is healthcare and long-term care (nursing homes). The example JD records this feature ships are nursing-home roles (Registered Nurse, Licensed Practical Nurse, Certified Nursing Assistant, MDS Coordinator, Director of Nursing, plus a small handful of operations roles).

Status: spec drafted, not yet committed. `/speckit.clarify`, `/speckit.plan`, and `/speckit.tasks` have not been run.

## What we're working on right now

Three things, in priority order:

- Land the three open branches. 001 and 002 should merge to main so the scaffold becomes real on the default branch. 003's spec needs to be committed on its own branch and taken through the rest of the speckit cycle (clarify, plan, tasks).
- Take 003 through `/speckit.clarify`, `/speckit.plan`, and `/speckit.tasks`. The spec is ready for it; the feature is well-scoped enough to slot in.
- Continue refining example data on 001 once Geoff confirms or amends the four provisional clarifications. The healthcare and long-term care confirmation from 003 implicitly resolves the industry pick on 001; the candidate dedup, stage history, stage-outcome-placement, and Keystone scope choices remain open.

## What comes after

The feature queue, in order:

- `004-hireology-adapter`: A containerized adapter that pushes Core schema and data into a live Hireology account. Modeled on cmdb-kit's JSM and ServiceNow adapters. Takes Hireology credentials from environment variables. Renumbered from 003 when JD bootstrap took the 003 slot.

- `005-hireology-mock-server`: A Docker container that stands up a local stub server mimicking Hireology's API with fixture data. Lets contributors iterate on the adapter without touching a real account. Renumbered from 004.

Domains beyond Job Descriptions (background checks, onboarding, commission tracking, compliance) come after Core, the validator, JD bootstrap, and the first adapter are all working. Each domain is its own spec.

## What is blocking

Nothing technical. Three soft blockers persist:

- Geoff has not yet reviewed the four provisional clarifications on 001-core-hr-schema (candidate dedup, stage history, stage-outcome-placement, Keystone data scope). Implementation can finish without his answers; the schema may need to flex if any provisional choice misses how his practice actually works.
- Hireology API survey has not been completed. Front-loaded research for the queued Hireology adapter spec; independent of any Core decision.
- The 001 and 002 branches need merging to main. Stacking work on feature branches indefinitely makes the scaffold harder to read for any new contributor cloning fresh from main.

## What is NOT in scope

- Any non-Hireology ATS (for now)
- HRIS features beyond recruiting (payroll, benefits, time tracking)
- A UI of any kind, beyond what the target platform already provides
- Discovery or automation features
- Multi-tenant or SaaS hosting

These may become future features, but they are not on the current plan.
