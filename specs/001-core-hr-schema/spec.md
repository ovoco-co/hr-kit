# Feature Specification: Core HR Schema

**Feature Branch**: `001-core-hr-schema`
**Created**: 2026-04-24
**Status**: Draft
**Input**: User description: "Core HR schema covering Candidate, Job Requisition, Application, Placement, Client, and Stage, plus the lookup types those entities reference. Example data follows a fictional recruiting firm named Keystone Recruiting and tells an end-to-end candidate journey. This is hr-kit's foundational feature; the Hireology adapter and mock Hireology API server are queued as the next two specs and depend on this schema being stable."

## Clarifications

### Session 2026-04-24

- Q: Which attribute (or combination) does the Core schema designate as the canonical natural key for Candidate dedup? → A: Email is the primary natural key (case-insensitive); when email is missing, the combination of full name plus primary phone number acts as fallback.
- Q: How is Application stage history modeled in the Core schema? → A: Application carries a `currentStage` reference plus an inline `stageHistory` array of `{stage, enteredAt}` entries. No separate StageTransition type.
- Q: How does Core model Application outcome relative to Stage and Placement? → A: Clean separation. Stage is pipeline position only (Sourced, Screened, Interviewing, Offer, plus firm-defined variants). Application carries a separate `outcome` lookup with values Active, Placed, Rejected, Withdrawn, Expired. A Placement record exists if and only if `outcome = Placed`.
- Q: What scope should the Keystone Recruiting example dataset cover? → A: Small realistic. 3-5 clients, 5-6 requisitions, 15-20 candidates. Every Stage lookup value and every Application.outcome value MUST be exercised at least once across the dataset.

## User Scenarios and Testing *(mandatory)*

### User Story 1 - Adopt hr-kit Core as the schema-of-record for a new ATS rollout (Priority: P1)

A recruiting operations lead at a staffing firm is standing up a new ATS and wants a canonical,
platform-agnostic description of the data they need to track. They clone hr-kit, read the schema
files for Candidate, Job Requisition, Application, Placement, Client, and Stage, and recognize
each entity from their day-to-day work. They can map every field in their current spreadsheet or
legacy system to an attribute in Core without asking "where does this go?"

**Why this priority**: This is the whole point of hr-kit. If a recruiter cannot read Core and
recognize their business, nothing else in the kit matters. Every downstream spec (Hireology
adapter, mock API server, domain packages) depends on Core being legible.

**Independent Test**: A reader with recruiting-industry knowledge but no prior exposure to hr-kit
can open the schema directory and, within one sitting, name the six core entities, list the
lookup types, and explain how an Application links a Candidate to a Job Requisition. No code
execution required.

**Acceptance Scenarios**:

1. **Given** a fresh clone of hr-kit, **When** the reader opens the Core schema directory,
   **Then** they find one schema definition per core entity (Candidate, Job Requisition,
   Application, Placement, Client, Stage) and one definition per referenced lookup type.
2. **Given** the reader opens the Application schema, **When** they inspect its references,
   **Then** the references to Candidate, Job Requisition, and Stage are explicit and resolvable
   by name.
3. **Given** a reader who knows recruiting but not hr-kit, **When** they read attribute names on
   each entity, **Then** the names are self-explanatory in industry terms (e.g., "sourceChannel",
   "requisitionStatus", "placementStartDate") and do not require external glossary lookups.

### User Story 2 - Follow Keystone Recruiting's example data end-to-end (Priority: P1)

A new hr-kit contributor wants to understand how the schema is meant to be populated. They open
the example data set for the fictional Keystone Recruiting firm and follow one candidate from
the moment Keystone sources them, through application to a specific requisition, through the
hiring stages, to a placement at a client. Every reference resolves. The story is internally
consistent: dates move forward, the stage at placement matches the requisition's pipeline, and
the client on the placement matches the client on the requisition.

**Why this priority**: Example data is the fastest teaching tool in the kit. A contributor who
follows one candidate end-to-end learns the schema faster than from any README. Without a
coherent example, Core is just a set of JSON files.

**Independent Test**: Starting from one Candidate record in the example data, a reader can
navigate by name references through every linked record (Application, Job Requisition, Client,
Stage history, Placement) without encountering a broken reference or a contradictory fact.

**Acceptance Scenarios**:

1. **Given** the Keystone Recruiting example data, **When** a reader picks any Candidate record,
   **Then** they can trace at least one full path from Candidate to Placement (or to a documented
   "did not place" outcome) through real, resolvable record names.
2. **Given** the example data, **When** the reader inspects dates across a candidate's journey,
   **Then** dates are in chronological order (source date, application date, stage transitions,
   placement start).
3. **Given** any referenced record in the example data, **When** the validator runs, **Then**
   the target record exists in the data set with an exact name match.
4. **Given** the example data, **When** the reader searches for placeholder strings like "Test",
   "Foo", "Sample Client", **Then** no such strings appear.

### User Story 3 - Validate a schema change without breaking the kit (Priority: P1)

A maintainer adds a new attribute to Candidate or adds a new lookup type. They run the kit's
validator and get a single clean result: zero errors, zero warnings, or a precise list of what
is wrong and where. LOAD_PRIORITY is checked. Name casing is checked. Reference resolution is
checked. Missing entries are flagged before a broken schema can land on main.

**Why this priority**: Schema Integrity is a constitutional principle. Without an enforceable
gate, conventions decay and the next adapter (Hireology) inherits the mess. The validator is
how the kit scales beyond a single author.

**Independent Test**: A deliberately malformed schema change (wrong casing, missing
LOAD_PRIORITY entry, unresolved reference) produces a non-zero exit from the validator with a
message that points to the specific file and field.

**Acceptance Scenarios**:

1. **Given** a valid Core schema and example data, **When** the maintainer runs the validator,
   **Then** it reports 0 errors and 0 warnings.
2. **Given** a new importable type added to schema, **When** the type is missing from
   LOAD_PRIORITY, **Then** the validator flags the omission.
3. **Given** a data file that references a record name that does not exist, **When** the
   validator runs, **Then** it reports the unresolved reference with file path and record name.
4. **Given** an attribute named in PascalCase or snake_case, **When** the validator runs,
   **Then** it flags the violation of the camelCase rule.

### Edge Cases

- A candidate applies to the same requisition twice (re-application after rejection). The
  schema must permit this without creating duplicate Candidate records.
- A candidate is placed and the placement ends (terminated, resigned). The schema must record
  placement end state without requiring the candidate record to be deleted or duplicated.
- A requisition is closed without any placement (cancelled, filled internally, pulled by
  client). The schema must represent this outcome without leaving dangling Applications.
- A client has multiple requisitions open simultaneously, and a single candidate is considered
  for more than one at the same client. Each Application must stand on its own.
- A stage is renamed or retired by the recruiting firm over time. Historical Applications must
  still resolve their stage references.
- A candidate provides minimal data up front (name and email only) and enriches over time. The
  schema must not force fields that a recruiter legitimately does not have at first contact.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Core schema MUST define exactly six core entity types: Candidate, Job
  Requisition, Application, Placement, Client, and Stage.
- **FR-002**: The Core schema MUST define every lookup type referenced by the six core
  entities (for example: source channels, employment types, application outcomes, placement
  statuses, requisition statuses, and similar enumerations the core entities depend on).
- **FR-003**: Every Application record MUST reference exactly one Candidate and exactly one
  Job Requisition, MUST reference at most one current Stage via `currentStage`, and MUST
  carry exactly one `outcome` value from the controlled vocabulary {Active, Placed,
  Rejected, Withdrawn, Expired}.
- **FR-003a**: Stage is a pipeline-position vocabulary only (e.g., Sourced, Screened,
  Interviewing, Offer, plus firm-defined variants). Terminal outcomes (Placed, Rejected,
  Withdrawn, Expired) MUST NOT appear as Stage values. Terminal outcomes live exclusively
  on Application.outcome.
- **FR-003b**: A Placement record MUST exist for an Application if and only if that
  Application's `outcome` is Placed. The validator MUST flag any Application with
  `outcome = Placed` that has no corresponding Placement, and any Placement whose referenced
  Application has an `outcome` other than Placed.
- **FR-004**: Every Placement record MUST reference exactly one Candidate, exactly one Job
  Requisition, and exactly one Client.
- **FR-005**: Every Job Requisition record MUST reference exactly one Client.
- **FR-006**: A Candidate record MUST be usable as the subject of more than one Application
  across more than one Job Requisition over time without data duplication.
- **FR-006a**: The Core schema MUST designate email address as the primary natural key for
  Candidate identity (case-insensitive match). When a Candidate record has no email, the
  combination of full name and primary phone number MUST act as the fallback natural key.
  Adapters SHOULD respect this rule when deciding whether an incoming candidate matches an
  existing one.
- **FR-007**: The schema MUST represent the transition of an Application through Stages as
  historical data, not only as a current-state field, so that the journey is reconstructable.
  Specifically, every Application MUST carry a `currentStage` reference and an inline
  `stageHistory` array whose entries each contain a Stage reference and an `enteredAt`
  timestamp. A separate top-level StageTransition type is explicitly out of scope for Core.
- **FR-008**: Every attribute name in schema and data files MUST be camelCase.
- **FR-009**: Every entity and lookup type display name MUST be Title Case.
- **FR-010**: Every JSON data file name MUST be kebab-case.
- **FR-011**: Every reference in a data file MUST use exact, case-sensitive Name matching to
  an existing record in the data set.
- **FR-012**: Every importable type MUST appear in LOAD_PRIORITY in an order consistent with
  its reference dependencies (referenced types load before types that reference them).
- **FR-013**: The kit MUST provide a validator command that reports, with zero errors and
  zero warnings on a correct Core schema, any violations of FR-008 through FR-012, plus any
  unresolved references.
- **FR-014**: The example data set MUST be labelled as belonging to the fictional recruiting
  firm "Keystone Recruiting" and MUST NOT reference Ovoco, any real client, or any real
  candidate.
- **FR-015**: The example data set MUST contain at least one candidate whose journey goes
  end-to-end from sourcing to an active Placement, with every referenced record present.
- **FR-016**: The example data set MUST contain at least one candidate whose journey ends
  without placement (e.g., withdrawn, rejected, or requisition closed), illustrating a
  non-placement outcome.
- **FR-017**: The example data set MUST NOT contain placeholder values such as "Test", "Foo",
  "Sample Candidate", "Client A", or numeric-suffix stubs ("Candidate 1", "Candidate 2").
- **FR-017a**: The Keystone Recruiting example dataset MUST contain 3 to 5 Client records,
  5 to 6 Job Requisition records, and 15 to 20 Candidate records. Every Stage lookup value
  defined in Core and every Application.outcome value (Active, Placed, Rejected, Withdrawn,
  Expired) MUST be exercised by at least one Application in the dataset.
- **FR-018**: The Core schema MUST NOT reference any domain type. Any type describing
  background checks, onboarding, commission tracking, or other specialized concerns is out of
  scope for this feature and belongs to a future domain package.
- **FR-019**: The Core schema MUST NOT contain any attribute, constraint, or field name that
  is specific to a target platform (for example, a Hireology field code or ATS-vendor-specific
  status value). Platform mappings belong in adapter overlay files that are out of scope for
  this feature.
- **FR-020**: The Core schema MUST remain stable enough to serve as the fixed input for the
  next two queued specs (the Hireology adapter and the mock Hireology API server), meaning
  that after this feature merges, core attribute names and reference shapes SHOULD NOT change
  without a deliberate amendment.

### Key Entities

- **Candidate**: A person being considered for one or more jobs. Carries identity, contact,
  and sourcing attributes. Independent of any single job or client, so a single Candidate can
  participate in many Applications and Placements over time. Identity is keyed on email
  (case-insensitive), with full name plus primary phone number as a documented fallback when
  email is absent.
- **Job Requisition**: A specific open role at a Client, with attributes describing what the
  role is, who it is for, when it opened, and its current lifecycle status (open, on hold,
  closed, filled, cancelled). Every Requisition references exactly one Client.
- **Application**: A candidate's participation in a specific requisition. Carries the current
  pipeline Stage (`currentStage`), the inline `stageHistory`, the application source, and the
  terminal `outcome` (Active, Placed, Rejected, Withdrawn, Expired). Links one Candidate to
  one Job Requisition. An `outcome` of Placed REQUIRES a matching Placement record.
- **Placement**: The recorded outcome of a successful Application: a Candidate has been placed
  into a Job Requisition at a Client. Carries start date, placement status (active, ended),
  and end date when applicable.
- **Client**: The end organization where a candidate is placed, and the owner of one or more
  Job Requisitions. Carries identity and contact attributes relevant to recruiting operations.
- **Stage**: A named pipeline position (for example: Sourced, Screened, Interviewing, Offer,
  plus firm-defined variants). Stage is pipeline-position only and MUST NOT include terminal
  outcomes (Placed, Rejected, Withdrawn, Expired); those live on `Application.outcome`. An
  Application references its current Stage via `currentStage` and accumulates history as an
  inline `stageHistory` array of `{stage, enteredAt}` entries on the Application itself.
- **Lookup Types**: A set of controlled-vocabulary types that the six core entities depend on
  (for example: Source Channel, Employment Type, Requisition Status, Application Outcome
  {Active, Placed, Rejected, Withdrawn, Expired}, Placement Status). Lookups MUST be defined
  in Core when at least one core entity references them.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A recruiter or recruiting ops reader can open the Core schema and correctly
  identify the purpose of all six core entities within 10 minutes, with no external help.
- **SC-002**: Starting from any Keystone Recruiting Candidate record, a reader can trace the
  full candidate-to-placement (or candidate-to-non-placement) journey through linked records in
  under 5 minutes, with zero broken references.
- **SC-003**: The validator command reports zero errors and zero warnings on the merged Core
  schema and the Keystone Recruiting example data set.
- **SC-004**: Any deliberately introduced violation of naming, reference, or LOAD_PRIORITY
  rules is caught by the validator in 100% of test cases, with a message that names the
  offending file and field.
- **SC-005**: The Keystone dataset contains 3 to 5 Clients, 5 to 6 Requisitions, and 15 to
  20 Candidates, with at least one Application exercising each Stage lookup value and at
  least one Application exercising each `outcome` value (Active, Placed, Rejected, Withdrawn,
  Expired).
- **SC-006**: The Hireology adapter spec (queued next) can begin Phase 0 research without
  requesting changes to any Core attribute name, entity shape, or reference direction.

## Assumptions

- hr-kit follows the same three-layer architecture as cmdb-kit (schema, data, adapters). This
  feature delivers schema and data only. Adapter work is out of scope and belongs to the
  queued Hireology adapter spec.
- The validator concept and its rule set follow the cmdb-kit precedent: camelCase, Title
  Case, kebab-case file names, exact-name references, LOAD_PRIORITY dependency order. The
  Core HR Schema feature MAY reuse or adapt the cmdb-kit validator rather than invent a new
  validation discipline.
- Keystone Recruiting is a fictional firm. The intent is to mirror the pedagogical role that
  the fictional OvocoCRM product plays in cmdb-kit: a single consistent scenario that teaches
  the schema by example.
- The set of lookup types needed in Core is derived from the six core entities' attributes.
  Lookups that only matter for specialized concerns (background check vendors, onboarding
  document types, commission plans) are out of scope and belong to future domain packages.
- "End-to-end candidate journey" in the example data means at least one candidate goes from
  sourcing through Stage transitions to an active Placement at a Client, and at least one
  candidate goes through the pipeline to a non-placement outcome.
- The Hireology adapter and the mock Hireology API server are queued as the next two specs
  and are not part of this feature's scope.

## Dependencies

- hr-kit Constitution v1.0.0 (ratified 2026-04-24). All principles apply, especially
  Candidate-Journey-Centric Schema, Platform-Agnostic Design, Schema Integrity, Layered
  Architecture, Core plus Domains, and Example Data Tells a Story.
- Validator tooling: either adapted from cmdb-kit or specified in the plan phase. The
  validator is a prerequisite for SC-003 and SC-004 but its implementation choice is a
  planning decision.
