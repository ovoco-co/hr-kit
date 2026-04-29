---

description: "Task list for Core HR Schema"
---

# Tasks: Core HR Schema

**Input**: Design documents from `/specs/001-core-hr-schema/`
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/json-file-formats.md`, `quickstart.md`

**Tests**: Tests are NOT requested in the spec. The validator (provided by 002-schema-validator-integration) is the test surface. Negative-test tasks under User Story 3 deliberately introduce violations to confirm the validator catches them.

**Organization**: Tasks are grouped by user story so each story can be verified independently. Phase 4 (User Story 2 data authoring) is the largest phase because example data is the bulk of this feature's work.

## External dependencies

Three things have to be true before the gated tasks can run. Each gated task is annotated.

- **kit-validator v0.1.0 published**: needed for `npm install` to succeed and therefore for any task that runs the validator. Annotated `(needs kit-validator v0.1.0)`.
- **002-schema-validator-integration on the working branch**: `tools/validate.js` and `tools/lib/constants.js` must exist. Either rebase 001 onto a base that contains 002, or merge 002 into 001 first. Annotated `(needs 002 on branch)`.
- **Geoff's industry pick from `docs/background/keystone-industry-sampler.md`**: needed for industry-flavored data authoring (Source Channel values, Stage variants, Candidate attributes, Job Requisition titles, Client names). Annotated `(needs industry pick)`.

Tasks without an annotation can run immediately.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other [P] tasks in the same phase (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3) for tasks in user-story phases
- File paths are absolute under `/home/admin1/ovoco/hr-kit/`

## Phase 1: Setup

- [X] T001 Verify the validator integration from 002-schema-validator-integration is on the working branch: `tools/validate.js` and `tools/lib/constants.js` exist at `/home/admin1/ovoco/hr-kit/tools/`. If not, rebase 001-core-hr-schema onto a base that contains 002 (or merge 002 into 001). (Needs 002 on branch.) Resolved 2026-04-29 by rebasing 001 onto 002 locally; both files are now present on this branch.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Land the structural files and the type registry. Every user story depends on these.

- [X] T002 Create `/home/admin1/ovoco/hr-kit/schema/core/schema-structure.json` listing every Core type per `data-model.md`: the six entities (Candidate, Job Requisition, Application, Placement, Client, Stage) and the five lookup types (Source Channel, Employment Type, Application Outcome, Requisition Status, Placement Status). Each entry has `name` (Title Case) and a one-line `description`. No `parent` field; Core uses no parent-child hierarchy in v0.1.0. Format per `contracts/json-file-formats.md`.
- [X] T003 [P] Create `/home/admin1/ovoco/hr-kit/schema/core/schema-attributes.json` with attribute definitions for every type per `data-model.md`. Type codes: 0=scalar, 1=reference, 2=inline structured. defaultTypeId codes: 1=integer, 2=boolean, 4=date. Reference fields use `referenceType` pointing at a Title Case type Name from schema-structure.json. Application's `stageHistory` is `type: 2` (inline structured). Format per `contracts/json-file-formats.md`.
- [X] T004 Edit `/home/admin1/ovoco/hr-kit/tools/lib/constants.js`: replace the empty `LOAD_PRIORITY` stub with the 11-element array per `data-model.md`'s LOAD_PRIORITY section. Order: lookups first (Source Channel, Employment Type, Application Outcome, Requisition Status, Placement Status), then Stage, Client, Job Requisition, Candidate, Application, Placement. Leave NESTED_TYPES and ATTR_NAME_MAP empty for now. (Needs 002 on branch.)

**Checkpoint**: Foundation ready. Schema definitions exist; LOAD_PRIORITY registers all 11 types. User-story phases can begin.

## Phase 3: User Story 1 - Adopt hr-kit Core as the schema-of-record (Priority: P1)

**Goal**: A reader with recruiting industry knowledge but no prior exposure to hr-kit can open the schema directory and recognize each entity from their day-to-day work.

**Independent Test**: A reader opens `schema/core/schema-structure.json` and `schema/core/schema-attributes.json`, plus the README, and within one sitting names the six core entities, lists the lookup types, and explains how an Application links a Candidate to a Job Requisition. (Per spec User Story 1 acceptance scenarios.)

### Implementation for User Story 1

- [X] T005 [US1] Create `/home/admin1/ovoco/hr-kit/schema/core/README.md`. Orientation file for the Core tier: brief explanation of the candidate journey, list of the six entities and the five lookup types with one-line summaries, a pointer to `specs/001-core-hr-schema/data-model.md` for full attribute lists, and a pointer to `specs/001-core-hr-schema/quickstart.md` for how to read and validate. Constitutional writing rules apply: no em dashes, no ampersands as "and", no horizontal rules, no numbered sections, no TOC, no bold in table cells.
- [X] T006 [US1] Review every `description` field in `/home/admin1/ovoco/hr-kit/schema/core/schema-structure.json` (created in T002). Confirm each is self-explanatory in industry terms (a recruiter unfamiliar with hr-kit can identify the type's purpose from its description). Revise any that lean on hr-kit jargon. Verified during T002 authoring; descriptions are industry-readable.
- [X] T007 [US1] Walk through every attribute name in `/home/admin1/ovoco/hr-kit/schema/core/schema-attributes.json` (created in T003). Confirm the default camelCase-to-Title-Case conversion produces a sensible display name for each. For any name that converts incorrectly (e.g., an acronym or unusual word boundary), add an entry to `/home/admin1/ovoco/hr-kit/tools/lib/constants.js` ATTR_NAME_MAP. Per `data-model.md`, no overrides are expected for the v0.1.0 attribute set; this task is the verification. Verified: all 28 attribute names convert correctly via the default rule; ATTR_NAME_MAP stays empty for Core v0.1.0.

**Checkpoint**: A recruiting-ops reader can open `schema/core/` and understand what's there. Acceptance scenarios for User Story 1 are satisfied.

## Phase 4: User Story 2 - Follow Keystone Recruiting's example data end-to-end (Priority: P1)

**Goal**: A new contributor can follow one Keystone Candidate from sourcing through application, stages, and placement (or non-placement outcome) without encountering a broken reference or contradictory fact.

**Independent Test**: Starting from any Candidate record, a reader navigates by Name reference through every linked record and reaches a Placement (or a documented non-placement outcome). All references resolve. Dates are chronologically ordered. (Per spec User Story 2 acceptance scenarios.)

### Implementation for User Story 2

- [ ] T008 [US2] Author `/home/admin1/ovoco/hr-kit/schema/core/data/source-channel.json`: 5 to 8 Source Channel records, with values appropriate to Keystone's industry. Universally include LinkedIn Recruiter, Referral, and Inbound; add industry-flavored values (e.g., for tech: GitHub Sourcing, Industry Event; for healthcare: Agency Partner, License-Verification Service; for construction: Union Hall, Walk-In). Format per `contracts/json-file-formats.md`. (Needs industry pick.)
- [X] T009 [P] [US2] Author `/home/admin1/ovoco/hr-kit/schema/core/data/employment-type.json`: 5 records, exact values Full-Time, Contract, Contract-to-Hire, Part-Time, Per-Diem. Each with a one-line description. Format per `contracts/json-file-formats.md`.
- [X] T010 [P] [US2] Author `/home/admin1/ovoco/hr-kit/schema/core/data/application-outcome.json`: exactly 5 records with the fixed outcome values from spec FR-003: Active, Placed, Rejected, Withdrawn, Expired. Each with a description that names when the outcome is set. Format per `contracts/json-file-formats.md`.
- [X] T011 [P] [US2] Author `/home/admin1/ovoco/hr-kit/schema/core/data/requisition-status.json`: 5 records with values Open, On Hold, Closed, Filled, Cancelled. Format per `contracts/json-file-formats.md`.
- [X] T012 [P] [US2] Author `/home/admin1/ovoco/hr-kit/schema/core/data/placement-status.json`: 2 records with values Active and Ended. Format per `contracts/json-file-formats.md`.
- [ ] T013 [P] [US2] Author `/home/admin1/ovoco/hr-kit/schema/core/data/stage.json`: 4 to 7 Stage records with pipeline-position-only values. Universally include Sourced, Screened, Interviewing, Offer; add industry-flavored variants per Geoff's pick (e.g., for tech: Phone Screen, Onsite, Take-Home; for healthcare: License Verification, Credentialing; for construction: Reference Check, Drug Screen). Per spec FR-003a, MUST NOT include terminal outcomes (Placed, Rejected, Withdrawn, Expired). (Needs industry pick.)
- [ ] T014 [US2] Author `/home/admin1/ovoco/hr-kit/schema/core/data/client.json`: 3 to 5 fictional Keystone clients per spec FR-017a. Industry-appropriate names and descriptions. Each record has Name plus the optional contact and location fields per `data-model.md`. Format per `contracts/json-file-formats.md`. (Needs industry pick.)
- [ ] T015 [US2] Author `/home/admin1/ovoco/hr-kit/schema/core/data/job-requisition.json`: 5 to 6 Job Requisition records per spec FR-017a. Each references one Client (by Name) from T014, plus an Employment Type and a Requisition Status. Industry-appropriate role titles. Mix Requisition Status values (most should be Open or Filled to support the Application story; include at least one On Hold and one Cancelled to exercise lookup variety). Dates: openedDate is set; closedDate set only when status is Closed/Filled/Cancelled. Format per `contracts/json-file-formats.md`. (Needs industry pick.)
- [ ] T016 [US2] Author `/home/admin1/ovoco/hr-kit/schema/core/data/candidate.json`: 15 to 20 Candidate records per spec FR-017a. Each has Name, email (case-insensitive unique within the file per FR-006a), primaryPhone, sourceChannel reference, sourceDate. Include at least one Candidate without email (per FR-006a fallback rule, must have name+primaryPhone). Industry-appropriate descriptions. Format per `contracts/json-file-formats.md`. (Needs industry pick.)
- [ ] T017 [US2] Author `/home/admin1/ovoco/hr-kit/schema/core/data/application.json`: enough Application records to satisfy spec FR-017a (every Stage value exercised at least once via stageHistory; every Application Outcome value exercised at least once). Roughly one Application per Candidate is a fine starting point; some candidates have multiple Applications across requisitions per spec FR-006. Each Application: candidate ref, jobRequisition ref, currentStage ref, stageHistory inline array of `{stage, enteredAt}` entries (chronological), source ref, outcome value, applicationDate, decisionDate (set only when outcome != Active). Per FR-003b, every Application with outcome=Placed MUST have a corresponding Placement (authored in T018). Format per `contracts/json-file-formats.md`.
- [ ] T018 [US2] Author `/home/admin1/ovoco/hr-kit/schema/core/data/placement.json`: one Placement record for every Application from T017 with `outcome=Placed`. Each Placement: candidate ref, jobRequisition ref, client ref (MUST equal the requisition's client), application ref, startDate (after the corresponding Application's decisionDate), placementStatus ref. Include at least one Placement with placementStatus=Ended and an endDate to exercise the lookup. Format per `contracts/json-file-formats.md`.
- [ ] T019 [US2] Verify chronological consistency across the dataset (per User Story 2 acceptance scenario 2): for each candidate journey, sourceDate <= applicationDate <= each stageHistory.enteredAt entry (in order) <= decisionDate (when set) <= Placement.startDate (when applicable). Repair any inconsistencies. Manual review across the linked records.
- [ ] T020 [US2] Verify referential integrity across the dataset (per User Story 2 acceptance scenario 3): every reference (candidate, jobRequisition, client, currentStage, stageHistory[].stage, source, outcome, sourceChannel, employmentType, requisitionStatus, placementStatus, application) resolves to an existing record's Name with case-sensitive match. The validator (T021) will catch this mechanically; this is a pre-validator manual sanity check.
- [ ] T021 [US2] Run the validator: `cd /home/admin1/ovoco/hr-kit && node tools/validate.js --schema schema/core`. Confirm exit 0 and zero errors and zero warnings. Fix any issues the validator surfaces. (Needs kit-validator v0.1.0.)
- [ ] T022 [US2] Verify the placeholder-free rule (FR-017): grep across `/home/admin1/ovoco/hr-kit/schema/core/data/` for the strings "Test", "Foo", "Sample", "Placeholder", and numeric-suffix patterns like "Candidate 1", "Client A". Confirm zero matches. Fix any naming that fell back to placeholders during authoring.

**Checkpoint**: User Story 2's acceptance scenarios pass. The Keystone dataset tells a coherent end-to-end story across 11 type files.

## Phase 5: User Story 3 - Validate a schema change without breaking the kit (Priority: P1)

**Goal**: A maintainer adds an attribute or type and gets a single clean validator result, or a precise list of what's wrong.

**Independent Test**: A deliberately malformed schema change (PascalCase attribute, missing LOAD_PRIORITY entry, unresolved reference, non-kebab-case data file name) produces a non-zero validator exit with a message naming the offending file and field. (Per spec User Story 3 acceptance scenarios.)

### Implementation for User Story 3

- [ ] T023 [US3] Negative test 1 — camelCase rule: in a temporary local edit, rename one attribute in `/home/admin1/ovoco/hr-kit/schema/core/schema-attributes.json` from camelCase to PascalCase (e.g., `sourceChannel` to `SourceChannel`). Run `node tools/validate.js --schema schema/core`. Confirm non-zero exit and a message identifying the offending attribute. Revert the change. (Needs kit-validator v0.1.0.)
- [ ] T024 [US3] Negative test 2 — LOAD_PRIORITY completeness: in a temporary local edit, remove one type from the LOAD_PRIORITY array in `/home/admin1/ovoco/hr-kit/tools/lib/constants.js` (e.g., remove "Candidate"). Run the validator. Confirm non-zero exit (or warning, depending on kit-validator's severity choice) and a message identifying the missing type. Revert. (Needs kit-validator v0.1.0.)
- [ ] T025 [US3] Negative test 3 — reference resolution: in a temporary local edit, change one Application's `candidate` field in `/home/admin1/ovoco/hr-kit/schema/core/data/application.json` to a Name that does not exist in candidate.json (e.g., "Nonexistent Person"). Run the validator. Confirm non-zero exit and a message identifying the unresolved reference. Revert. (Needs kit-validator v0.1.0.)
- [ ] T026 [US3] Negative test 4 — kebab-case file name: in a temporary local edit, rename one data file from kebab-case to PascalCase (e.g., `source-channel.json` to `SourceChannel.json`). Run the validator. Confirm the file is no longer recognized (per kit-validator's expectation of kebab-case filenames). Rename back. (Needs kit-validator v0.1.0.)

**Checkpoint**: All four constitutional discipline rules (FR-008 through FR-012) are mechanically caught by the validator. User Story 3 acceptance scenarios pass.

## Phase 6: Polish and Cross-Cutting Concerns

- [ ] T027 [P] Verify SC-001: hand `schema/core/schema-structure.json`, `schema/core/schema-attributes.json`, and `schema/core/README.md` to a recruiting-ops reader unfamiliar with hr-kit. Time how long it takes them to identify the purpose of each of the six core entities. Confirm under 10 minutes. Iterate on descriptions if needed.
- [ ] T028 [P] Verify SC-002: pick a random Keystone Candidate. Time how long it takes to trace from that Candidate to a Placement (or a documented non-placement outcome) through linked records. Confirm under 5 minutes with zero broken references.
- [ ] T029 Run `node /home/admin1/ovoco/hr-kit/tools/validate.js --schema /home/admin1/ovoco/hr-kit/schema/core` one final time after all data authoring is complete. Confirm zero errors and zero warnings (per FR-013, SC-003). (Needs kit-validator v0.1.0.)
- [ ] T030 Verify SC-006: review the Hireology adapter spec input (in `docs/background/current-status.md`'s queued-features list) and confirm Core's attribute names, entity shapes, and reference directions are stable enough for the adapter spec's Phase 0 research to begin without requesting Core changes. Document any concerns at `specs/003-hireology-adapter/notes-from-001.md` (will be created when 003 starts).

## Dependencies and Execution Order

### Phase Dependencies

- **Phase 1 (T001)**: depends on 002 being available on the working branch.
- **Phase 2 (T002-T004)**: T002 and T003 depend only on the spec/plan/data-model docs (which are settled). T004 needs 002 on the branch (to edit the constants module 002 created).
- **Phase 3 (T005-T007)**: depends on Phase 2.
- **Phase 4 (T008-T022)**: T008-T018 are data authoring, depend on Phase 2. T019-T022 are verification, depend on the authoring tasks they verify.
- **Phase 5 (T023-T026)**: depends on Phase 4 (negative tests need a real schema to break).
- **Phase 6 (T027-T030)**: depends on Phase 4 and Phase 5.

### Within Phase 4 (User Story 2)

- T009, T010, T011, T012 (industry-agnostic lookup type files) can run in parallel with each other. They don't need Geoff's industry pick.
- T008 (Source Channel), T013 (Stage), T014 (Client), T015 (Job Requisition), T016 (Candidate) need Geoff's industry pick.
- T015 references Clients from T014; serialize.
- T017 references all of T008-T016; serialize after them.
- T018 references Applications from T017; serialize after T017.
- T019, T020, T022 (verifications) run after T018.
- T021 (validator run) runs after the data files exist and after kit-validator v0.1.0 publishes.

### Parallel Opportunities

Within Phase 4, the four industry-agnostic lookup type files (T009, T010, T011, T012) can be authored in parallel. Within Phase 5, the four negative tests (T023-T026) are mutually parallel; each requires reverting before the next starts to keep the schema clean between runs (or each can use a separate clean working tree). Within Phase 6, T027 and T028 are independent reader-time measurements; they can run with different readers in parallel.

## Implementation Strategy

### Sequencing within the parallel-work window

While kit-validator v0.1.0 is still pending, the following tasks can complete now: T002, T003, T005, T006, T007, T009, T010, T011, T012 (all industry-agnostic structural and lookup work). Those nine tasks discharge most of Phases 2 and 3 plus the agnostic parts of Phase 4 without depending on either kit-validator publishing or Geoff's industry pick.

When Geoff picks an industry (or while waiting, can proceed with a tentative pick that gets revised), tasks T008, T013, T014, T015, T016, T017, T018 land in sequence with industry-flavored values.

When kit-validator v0.1.0 publishes and 002's `npm install` succeeds, tasks T021, T023-T026, T029 can run.

### Incremental delivery shape

1. Phases 1, 2: foundation (validator integration in place + structural files + LOAD_PRIORITY).
2. Phase 3: schema-side legibility (README, descriptions reviewed). Schema is readable as a spec.
3. Phase 4: example data authored. Schema is now learnable by reading Keystone records.
4. Phase 5: validator catches bad changes. Discipline is enforceable.
5. Phase 6: SC verifications and the final clean-validator run.

### MVP scope

The "constitutional minimum" is Phases 1, 2, 3, plus T021 (a clean validator run on an empty data set). At that point a maintainer can adopt Core as a schema-of-record and the schema validates. Example data is what makes it teachable; data authoring (Phase 4) is the bulk of effort.

## Notes

- All tasks follow the constitutional writing rules in their on-disk content: no em dashes, no ampersands as "and", no horizontal rules, no numbered sections, no tables of contents, no bold in table cells.
- Industry-flavored values in T008, T013, T014, T015, T016, T017 are pinned by Geoff's pick from the sampler. If a different industry is chosen later, the data files re-author cleanly without touching schema-structure.json or schema-attributes.json.
- The validator's exact severity for missing-data-file warnings, empty-LOAD_PRIORITY warnings, and similar edge cases depends on kit-validator's frozen 0.1.0 surface. Tasks are written assuming kit-validator implements the behavior described in 002's `contracts/kit-validator-surface.md`. If kit-validator's freeze diverges, individual task assertions may need minor edits.
