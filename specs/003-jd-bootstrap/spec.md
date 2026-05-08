# Feature Specification: Job Descriptions Domain plus Paylocity-to-O*NET Bootstrap Pipeline

**Feature Branch**: `003-jd-bootstrap`
**Created**: 2026-04-30
**Revised**: 2026-05-07 (FR-005 and FR-008 amended: pipeline now queries the workspace-shared `onet` PostgreSQL schema via SSH tunnel instead of calling O*NET Web Services directly; see workspace spec 011-onet-occupation-data)
**Status**: Draft
**Input**: User description: "Job Descriptions domain plus Paylocity-to-O*NET bootstrap pipeline. The domain introduces a Job Description type under schema/domains/job-descriptions/ carrying title, summary, tasks, knowledge/skills/abilities, O*NET provenance (SOC code, source date), applicable states, and a reference back to Core's Job Requisition. The bootstrap pipeline under tools/jd-bootstrap/ takes a Paylocity position-report export plus a list of operating states, dedupes by SOC code (using SOC codes already in the Paylocity report when present), fetches summary/tasks/etc. from O*NET Web Services, and generates draft JD records as JSON files in the domain's data layout. Pipeline output is editable; the team treats O*NET content as a starting draft, not authoritative. Constitutional constraint: no customer data in hr-kit; Keystone example JDs are fictional nursing home roles. State requirements (salary disclosure, licensure variants, training mandates) are tracked separately as a state-requirements matrix the recruiter consults at posting time. Suggested short-name: jd-bootstrap."

**Note on the Input description**: As written, the Input refers to the pipeline fetching from "O*NET Web Services". Per the 2026-05-07 amendment to FR-005, the pipeline now queries the workspace-shared `onet` schema. The Input is preserved verbatim for historical accuracy; FR-005 governs current behavior.

## User Scenarios and Testing *(mandatory)*

### User Story 1 - HR maintainer bootstraps an initial set of Job Descriptions from a Paylocity export (Priority: P1)

An HR or operations lead at a long-term-care employer has no centralized job description database. Their HRIS (Paylocity) holds a position report listing every active or budgeted role at the company, with SOC codes for EEO-1 reporting. They want a first draft of a job description for each unique role so the team has somewhere to start editing. They run the bootstrap pipeline against the Paylocity export plus a list of states the company operates in. The pipeline emits one draft Job Description record per unique SOC code, populated from O*NET Web Services data plus the Paylocity-side title variants and the operating-states list. The team then edits each draft into a finished JD; nothing the pipeline produces is authoritative.

**Why this priority**: This is the workflow the feature exists to deliver. Without an end-to-end pipeline that turns a Paylocity export into editable JD drafts, the company stays where it is: no JD database, manual writing per role.

**Independent Test**: Given a small synthetic Paylocity-shaped CSV (no real customer data; the test fixture is invented) and a list of two or three states, running the pipeline produces a directory of JSON Job Description records, one per unique SOC code in the fixture, each carrying the documented fields. The records validate clean against hr-kit's validator (when the JD domain is loaded). No O*NET network call is required for the test; a recorded fixture stands in for the live API response.

**Acceptance Scenarios**:

1. **Given** a Paylocity-shaped position-report CSV with three positions sharing two SOC codes, **When** the bootstrap pipeline runs against it plus a list of two operating states, **Then** the output contains exactly two Job Description JSON files (one per unique SOC code), each listing both Paylocity title variants under "Also known as" and both operating states under "Applicable states".
2. **Given** the same fixture, **When** the pipeline runs a second time, **Then** existing draft files are not overwritten by default; an explicit `--overwrite` flag is required to regenerate.
3. **Given** the JD domain loaded under `schema/domains/job-descriptions/`, **When** `node tools/validate.js --schema schema/domains/job-descriptions` runs, **Then** the validator reports zero errors and zero warnings against the fictional Keystone JD records that ship with the kit.

### User Story 2 - JD records reference Core requisitions and survive O*NET re-imports (Priority: P2)

A recruiter opens a new requisition for a role that already has a Job Description on file. The Job Requisition record references the Job Description record by Name. Later, when the team revisits the JD content (a year passes, O*NET ships a new database version, the team wants to refresh the seminal text), they re-run the pipeline. The team's edits since the original bootstrap survive because the pipeline preserves a separation between O*NET-derived "base" content and the company's "overlay" edits.

**Why this priority**: Without the base/overlay split, every refresh blows away the team's edits, and the team stops trusting the pipeline. With it, refreshes are routine and welcome.

**Independent Test**: Given a JD record that has been edited (the overlay contains team additions), running the pipeline against a refreshed fixture preserves the overlay and updates only the base. The merged JD reflects both.

**Acceptance Scenarios**:

1. **Given** a previously-generated JD record whose `companyOverlay` field contains a customized task list and a custom summary paragraph, **When** the pipeline regenerates the same record from a refreshed source, **Then** the record's `oNetBase` field updates to the new O*NET content but the `companyOverlay` field is unchanged.
2. **Given** a Job Requisition record that references a Job Description record by Name, **When** the JD record is regenerated, **Then** the Job Requisition's reference still resolves; the validator passes.

### User Story 3 - State-specific posting requirements are surfaced separately, not embedded in the JD (Priority: P3)

A recruiter posts an open requisition. They consult the state-requirements matrix shipped with the kit to see which states require salary range disclosure, which mandate specific training, which carry licensure variants. The JD record itself stays state-neutral; the matrix is the authority on per-state addenda.

**Why this priority**: Embedding state-specific content into every JD makes JDs unmaintainable; surfacing it as a separate matrix lets recruiters consult it at posting time without polluting the timeless JD content.

**Independent Test**: The kit ships a state-requirements matrix file documenting per-state requirements for the states the company operates in (the synthetic test fixture lists two or three). A reader can answer "what requirements apply when posting in California?" by reading the matrix without consulting any specific JD.

**Acceptance Scenarios**:

1. **Given** the state-requirements matrix shipped with the kit, **When** a recruiter looks up California, **Then** they find applicable rules: salary-range disclosure, pay-history ban, ban-the-box specifics.
2. **Given** the same matrix, **When** they look up a state with no current operations, **Then** they find either an explicit "not currently operating in this state" entry or no entry (the matrix only covers operating states).

### Edge Cases

- The Paylocity export contains a position with no SOC code. The pipeline cannot dedupe by SOC; it falls back to title-string matching for that record and flags the row in the run report so a human can resolve it manually.
- Two different Paylocity titles map to the same SOC code (e.g., "Registered Nurse" and "RN"). The pipeline produces one Job Description record listing both under "Also known as" and emitting a single output file.
- O*NET returns no match for a SOC code (rare, but possible for retired codes). The pipeline emits a placeholder JD record with empty O*NET-derived fields and a warning in the run report; the team fills in content manually.
- A previously-generated JD record has been deleted from the data directory between runs. The pipeline re-creates it from O*NET (no overlay to preserve since the file is gone).
- The state-requirements matrix is missing entries for some operating states. The pipeline does not block on this; it logs a warning, lists the missing states in the run report, and the team adds entries as needed.
- O*NET Web Services is unreachable during a pipeline run. The pipeline fails loudly per the kit-validator analogue (no silent network failures); the team retries when O*NET is reachable. Pipeline runs are not part of validator runs (Schema Integrity validation has no network dependency, FR-012 of 002).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: hr-kit MUST introduce a Job Description type under a new domain at `schema/domains/job-descriptions/` (containing `schema-structure.json`, `schema-attributes.json`, and `data/`). Per Constitution V, the domain MAY reference Core types (specifically `Job Requisition`); Core MUST NOT reference Job Description.
- **FR-002**: A Job Description record MUST carry at minimum: a Title Case `Name`, a `socCode` (the O*NET-SOC code), a `summary` (string), a `tasks` (array of strings), a `knowledgeSkillsAbilities` (array of strings), a `paylocityTitles` (array of strings; the original Paylocity-side titles that mapped to this SOC), an `applicableStates` (array of US state codes), an `oNetSourceDate` (ISO date), and a `companyOverlay` (object with optional fields: `summary`, `tasks`, `additionalRequirements`, etc.).
- **FR-003**: A Job Description record MUST NOT reference Core's Job Requisition directly. The reference flows the other way (Job Requisition references its Job Description by Name, when applicable). This preserves the Constitution V invariant that Core does not reference domain types; the JD domain extends Core, not the reverse.
- **FR-004**: hr-kit MUST add `Job Description` to its kit-validator constants (LOAD_PRIORITY in `tools/lib/constants.js`) only when the JD domain is the loaded tier (`--schema schema/domains/job-descriptions`). Core's `LOAD_PRIORITY` does not gain Job Description; loading Core does not load the domain.
- **FR-005**: hr-kit MUST ship a bootstrap pipeline at `tools/jd-bootstrap/` invokable as `node tools/jd-bootstrap/cli.js --positions <paylocity-export.csv> --states <state-list.json> --output <dir>`. The pipeline reads the Paylocity export, deduplicates positions by SOC code (falling back to title-string matching when SOC is absent), queries the workspace `onet` PostgreSQL schema (workspace spec 011-onet-occupation-data) via SSH tunnel for occupation data per unique SOC code, and writes one JD record per SOC code into the output directory. The pipeline does NOT call O*NET Web Services directly; the workspace refresh script is the sole writer to the `onet` schema. Consumer query pattern: `specs/011-onet-occupation-data/consumer-contracts.md` Consumer 1. Amended 2026-05-07 from "fetches O*NET Web Services data per unique SOC code" when the workspace-shared schema was introduced.
- **FR-006**: The pipeline MUST treat O*NET-derived content as the "base" of a JD and any prior team edits as the "overlay". When regenerating an existing JD record, the pipeline MUST refresh the base but preserve the overlay, unless an `--overwrite-overlay` flag is set.
- **FR-007**: The pipeline MUST record provenance per JD record: the SOC code, the O*NET source date (the date the data was fetched), and the Paylocity title variants that mapped to this SOC. The provenance fields are part of the JD record's stored shape.
- **FR-008**: The pipeline MUST NOT make network calls during validator runs. Workspace `onet` schema queries (via SSH tunnel to VPS PostgreSQL) happen only during pipeline runs (which are explicit user invocations), never during `node tools/validate.js`. The validator integration (002) remains offline-only per its FR-012. Amended 2026-05-07 from "O*NET fetching" wording when FR-005 changed to consume the workspace-shared `onet` schema.
- **FR-009**: The pipeline MUST emit a run report (text or JSON, default text to stdout) summarizing: how many positions were processed, how many unique SOC codes were resolved, how many fell back to title-string matching, how many JD records were created vs updated vs skipped, and any warnings (missing SOC codes, missing state entries, O*NET no-match cases).
- **FR-010**: hr-kit MUST ship a state-requirements matrix file at `schema/domains/job-descriptions/state-requirements.json` (or equivalent) covering at minimum the states represented in Keystone's example data. Each state entry includes: state code, salary-range-disclosure rule, pay-history-ban rule, ban-the-box rule, training mandates, and licensure variants for healthcare roles.
- **FR-011**: The state-requirements matrix MUST be referenced from the JD domain's README and from `quickstart.md` so a recruiter can find it from the JD they are working with. Recruiters consult the matrix at posting time, not at JD-authoring time.
- **FR-012**: The kit MUST NOT contain customer-specific data per the constitution. Keystone example JD records ship as nursing-home roles (Registered Nurse, Licensed Practical Nurse, Certified Nursing Assistant, MDS Coordinator, Director of Nursing, plus a small handful of operations roles). Real Paylocity data from any actual company MUST stay in private forks or downstream private repos.
- **FR-013**: The example Paylocity-shaped fixture and the synthetic operating-states list shipped with the kit MUST be invented (no real company), and a `tests/fixtures/` directory under `tools/jd-bootstrap/` MUST hold them for use by smoke tests and documentation walkthroughs.
- **FR-014**: The Job Description type's `Name` field MUST be unique within the domain's data set. The validator (kit-validator's reference-resolution rule) catches duplicates if any Job Requisition references a JD by ambiguous Name; this feature relies on that mechanical check rather than introducing new validator rules.
- **FR-015**: The pipeline MUST be runnable offline against a recorded fixture mirroring the workspace `onet` schema query results, so contributors can develop the pipeline without opening an SSH tunnel to the workspace database. A `--mock-workspace <fixture-dir>` flag lets the pipeline read recorded JSON shaped like a workspace query result instead of querying live. Renamed from `--mock-onet` 2026-05-07 when the workspace `onet` schema replaced direct O*NET API calls per workspace spec 011 FR-006.

### Key Entities

- **Job Description (new type, JD domain)**: A timeless template for a role. Survives across many specific Job Requisitions opened over time. Carries O*NET-derived base content, company overlay edits, SOC code, applicable states, and provenance. Display name uses the canonical role title (e.g., "Registered Nurse").
- **Bootstrap pipeline**: A node CLI under `tools/jd-bootstrap/` that consumes a Paylocity CSV plus a state list, emits draft JD records. Stateless between runs aside from the JSON files it reads and writes; no database.
- **State-requirements matrix**: A JSON file mapping US state codes to per-state HR requirements (salary disclosure, ban-the-box, licensure variants, training mandates). One file shipped with the kit; recruiters consult at posting time.
- **Paylocity position-report export (input)**: A CSV (Paylocity's standard format) containing one row per position with at minimum: title, SOC code (when present), department, FLSA classification, location.
- **O*NET Web Services (external)**: HTTP API at `services.onetcenter.org/ws/`. Read-only. Provides occupation summaries, tasks, knowledge/skills/abilities per SOC code. Requires registered API credentials.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A maintainer can run the pipeline against the synthetic Paylocity fixture plus a synthetic state list and produce JD records in under 60 seconds, including workspace `onet` schema queries (or instantly when `--mock-workspace` is used).
- **SC-002**: For a Paylocity export with N unique SOC codes, the pipeline generates exactly N draft Job Description records. Verifiable by counting output files vs counting unique SOC codes in the input.
- **SC-003**: Re-running the pipeline against the same input twice produces no new records the second time (default behavior); team-edited overlay content survives the regeneration.
- **SC-004**: Running `node tools/validate.js --schema schema/domains/job-descriptions` against the shipped Keystone JD records reports zero errors and zero warnings. Verifiable by validator exit code.
- **SC-005**: A recruiter consulting the state-requirements matrix can answer "what posting requirements apply in California?" in under one minute, without reading any specific JD record. Verifiable by directly inspecting the matrix file's California entry.
- **SC-006**: The kit's source tree contains zero references to any real Paylocity export, real company name, or real candidate data. Verifiable by a grep-based static check (the same kit-agnostic discipline kit-validator enforces, applied here to "no customer data").

## Assumptions

- Paylocity's position-report export format is broadly stable. The pipeline reads a CSV with documented columns; if Paylocity adds or renames columns in a future export version, the pipeline's CSV-reading layer is the only place that changes. Synthetic fixtures match the format Paylocity is known to emit as of 2026.
- Paylocity position reports include SOC codes for most positions because they are required for EEO-1 reporting. Positions without SOC codes are an edge case handled by title-string fallback (Edge Cases section).
- O*NET Web Services data is treated as a starting draft, not authoritative. The team will edit JDs after the bootstrap. O*NET database version drift between runs is not a concern at this level: medical-occupation content is broadly stable across O*NET releases. Provenance fields exist for traceability but the kit does not auto-refresh against O*NET version changes.
- Keystone Recruiting's industry, established by Geoff's confirmation 2026-04-30, is healthcare/long-term care (nursing homes). All Keystone-flavored example data in this feature reflects nursing-home roles. This implicitly aligns with the still-pending industry pick on 001-core-hr-schema; if 001 has not yet picked, this feature confirms healthcare/long-term care for both.
- The state-requirements matrix is hand-authored, not scraped or generated. Maintenance discipline is the responsibility of the kit's contributors; updates ride along with state-law changes. The matrix is part of the domain's shipped data.
- Customer-specific Paylocity exports stay outside hr-kit. A consuming organization (Geoff's company, or any other adopter) runs the pipeline in a private fork or downstream repo where their actual position report can land safely. The kit's repo contains only synthetic fixtures.
- Node.js 18+ is the runtime, matching hr-kit's existing engines field. The pipeline uses standard library plus whatever JSON Schema or CSV parser is selected during plan; no heavy frameworks introduced.

## Dependencies

- hr-kit Constitution v1.0.0 (ratified 2026-04-24). Especially Principle II (Platform-Agnostic Design: O*NET and Paylocity are sources of content; their formats do not leak into the JD type), Principle V (Core plus Domains: JD lives in a domain, references Core but not vice versa), and Principle VI (Example Data Tells a Story: Keystone JDs are fictional nursing-home roles).
- 001-core-hr-schema spec (currently parked at `001-core-hr-schema` branch on origin). The JD domain references Core's Job Requisition type. Implementation of this feature blocks on 001 merging to main, OR on this feature branch rebasing onto 001 in the same way 001 rebased onto 002. Spec, plan, and tasks phases proceed without that dependency.
- 002-schema-validator-integration (currently merged into 001 via rebase; on 001-core-hr-schema branch on origin). The JD domain is validated by the kit-validator integration. Implementation blocks on 002 being on the working branch.
- `@ovoco/kit-validator` v0.1.0+ (already published). The new domain extends the existing kit-validator integration; no validator changes required for this feature.
- O*NET Web Services credentials (external, registered free; live network during pipeline runs only). Not a kit dependency in the install-time sense; a runtime configuration the maintainer supplies via environment variables when running the pipeline.
- Paylocity (external; the source of position-report exports). The kit reads a CSV that Paylocity emits; no API integration required for v0.1.0 of this feature. Future enhancements could add a direct Paylocity API integration but are out of scope here.
