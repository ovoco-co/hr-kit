# Phase 1 Data Model: Core HR Schema

This file describes hr-kit's Core entities, their attributes, and their relationships. It is the authoring guide for `schema/core/schema-structure.json`, `schema/core/schema-attributes.json`, and the per-type data files under `schema/core/data/`. Attribute names are camelCase (FR-008). Display names are Title Case (FR-009). Data file names are kebab-case (FR-010).

## Six Core entity types

### Candidate

A person being considered for one or more jobs.

| Attribute | Type | Required | Notes |
|----|----|----|----|
| Name | scalar (string) | yes | The natural-language identifier ("Jane Doe", "Marcus Lee"). Used for cross-record references. |
| email | scalar (string) | preferred | Primary natural key for dedup; case-insensitive match. May be absent for walk-ins. |
| primaryPhone | scalar (string) | preferred | Together with `Name`, acts as fallback natural key when `email` is absent. |
| sourceChannel | reference (Source Channel) | yes | How Keystone sourced the candidate. |
| sourceDate | scalar (date) | yes | When Keystone first added the candidate. ISO YYYY-MM-DD. |
| description | scalar (string) | optional | One-line summary; useful for example-data legibility. |

Identity rule (FR-006a): email is primary; when absent, the combination of full name and `primaryPhone` is the fallback. Adapters SHOULD respect this rule.

### Job Requisition

A specific open role at a Client.

| Attribute | Type | Required | Notes |
|----|----|----|----|
| Name | scalar (string) | yes | The requisition's natural-language identifier (e.g., "Senior Backend Engineer at Acme Payments"). |
| client | reference (Client) | yes | The end-organization the role is for. Exactly one (FR-005). |
| title | scalar (string) | yes | The role title as Keystone advertises it. |
| level | scalar (string) | optional | Seniority indicator (entry, mid, senior, etc.) when meaningful. |
| employmentType | reference (Employment Type) | yes | Full-time, contract, contract-to-hire, etc. |
| requisitionStatus | reference (Requisition Status) | yes | Open, On Hold, Closed, Filled, Cancelled. |
| openedDate | scalar (date) | yes | When the requisition was opened. |
| closedDate | scalar (date) | optional | When the requisition was closed (Filled, Cancelled, Closed). Empty for Open or On Hold. |
| description | scalar (string) | optional | Short scope description. |

### Application

A candidate's participation in a specific requisition.

| Attribute | Type | Required | Notes |
|----|----|----|----|
| Name | scalar (string) | yes | Composite identifier (e.g., "Jane Doe -> Acme Backend Engineer"). |
| candidate | reference (Candidate) | yes | Exactly one (FR-003). |
| jobRequisition | reference (Job Requisition) | yes | Exactly one (FR-003). |
| currentStage | reference (Stage) | optional | At most one (FR-003). May be absent only for `outcome=Withdrawn` before any stage was entered. |
| stageHistory | inline array of `{stage, enteredAt}` | yes | At least one entry. `stage` is a reference (Stage); `enteredAt` is an ISO date. Per FR-007. |
| applicationDate | scalar (date) | yes | When the candidate first applied to this requisition. |
| source | reference (Source Channel) | yes | The Source Channel that brought this candidate to this specific requisition (may differ from Candidate.sourceChannel for re-engagements). |
| outcome | reference (Application Outcome) | yes | One of {Active, Placed, Rejected, Withdrawn, Expired} (FR-003). |
| decisionDate | scalar (date) | optional | When the outcome was set (any value other than Active). Empty for outcome=Active. |

Cross-entity invariant (FR-003b): outcome=Placed requires a matching Placement record; the validator flags violations.

### Placement

The success record. A Candidate is placed into a Job Requisition at a Client.

| Attribute | Type | Required | Notes |
|----|----|----|----|
| Name | scalar (string) | yes | Composite identifier (e.g., "Jane Doe placed at Acme as Senior Backend Engineer"). |
| candidate | reference (Candidate) | yes | Exactly one (FR-004). |
| jobRequisition | reference (Job Requisition) | yes | Exactly one (FR-004). |
| client | reference (Client) | yes | Exactly one (FR-004). MUST equal the requisition's client. |
| application | reference (Application) | yes | The Application whose `outcome=Placed` led to this Placement. |
| startDate | scalar (date) | yes | The candidate's start date with the client. |
| placementStatus | reference (Placement Status) | yes | Active or Ended. |
| endDate | scalar (date) | optional | When the placement ended (terminated, resigned). Empty while placementStatus=Active. |

### Client

The end-organization the candidate is placed into.

| Attribute | Type | Required | Notes |
|----|----|----|----|
| Name | scalar (string) | yes | Client's name as Keystone refers to it. |
| primaryContact | scalar (string) | optional | Hiring manager or talent partner. |
| primaryContactEmail | scalar (string) | optional | |
| location | scalar (string) | optional | City, region, or full address. |
| description | scalar (string) | optional | Short description of what the client does. |

### Stage

A pipeline-position vocabulary entry.

| Attribute | Type | Required | Notes |
|----|----|----|----|
| Name | scalar (string) | yes | Sourced, Screened, Interviewing, Offer, plus firm-defined variants. |
| description | scalar (string) | optional | What this stage represents. |
| ordinal | scalar (integer) | optional | Suggested ordering for display purposes. The validator does not enforce stage order; the spec allows firms to skip stages or revisit them. |

Constraint (FR-003a): Stage MUST NOT include terminal outcomes (Placed, Rejected, Withdrawn, Expired). Those are Application.outcome values, not Stage values.

## Lookup Types

Each lookup type ships its values in `schema/core/data/<kebab-case>.json`. Lookup records have only `Name` and `description`.

### Source Channel

Where candidates come from. Keystone-suitable values include LinkedIn Recruiter, Referral, Inbound (job board), Agency Partner, Walk-In, Industry Event, Prior Placement Network. Specific entries are decided when industry is picked; the schema is industry-agnostic.

### Employment Type

How the candidate is engaged. Standard values: Full-Time, Contract, Contract-to-Hire, Part-Time, Per-Diem.

### Application Outcome

The terminal outcome of an Application. Fixed values per FR-003 and FR-003a: Active, Placed, Rejected, Withdrawn, Expired.

### Requisition Status

Lifecycle state of a Job Requisition. Standard values: Open, On Hold, Closed, Filled, Cancelled.

### Placement Status

Lifecycle state of a Placement. Standard values: Active, Ended.

## Relationships and Reference Direction

```text
Client <------- Job Requisition  (Job Requisition.client)
   ^                  ^
   |                  |
   |                  |
Placement.client      Application.jobRequisition
   ^                  ^
   |                  |
   +------- (linked via Application -> Placement when outcome=Placed)
   |
Candidate <-- Application.candidate
              Placement.candidate
              Placement.application

Stage <------ Application.currentStage
              Application.stageHistory[].stage

Source Channel <----- Candidate.sourceChannel
                      Application.source
Employment Type <---- Job Requisition.employmentType
Application Outcome <- Application.outcome
Requisition Status <-- Job Requisition.requisitionStatus
Placement Status <---- Placement.placementStatus
```

All references resolve by exact, case-sensitive `Name` match (FR-011).

## LOAD_PRIORITY (dependency order)

Per FR-012 and Constitution III, `tools/lib/constants.js` LOAD_PRIORITY MUST list every importable type with referenced types appearing before referencing types. The Core ordering:

```js
const LOAD_PRIORITY = [
  // Lookups first (no internal dependencies)
  'Source Channel',
  'Employment Type',
  'Application Outcome',
  'Requisition Status',
  'Placement Status',
  // Stage (referenced by Application; no internal dependencies)
  'Stage',
  // Client (referenced by Job Requisition and Placement; no internal dependencies)
  'Client',
  // Job Requisition (references Client, Employment Type, Requisition Status)
  'Job Requisition',
  // Candidate (references Source Channel)
  'Candidate',
  // Application (references Candidate, Job Requisition, Stage, Source Channel, Application Outcome)
  'Application',
  // Placement (references Candidate, Job Requisition, Client, Application, Placement Status)
  'Placement',
];
```

## NESTED_TYPES

```js
const NESTED_TYPES = []; // empty for v0.1.0 of Core
```

The cmdb-kit precedent uses NESTED_TYPES for personnel-style data files wrapped under a top-level type-name key. hr-kit's Core does not currently use that wrapper for any type; data files are plain arrays.

## ATTR_NAME_MAP

```js
const ATTR_NAME_MAP = {
  // The default camelCase-to-Title-Case conversion is correct for every
  // Core attribute introduced by this feature. Override only if a specific
  // attribute name converts incorrectly (none today).
};
```

## Validation Rules (drawn from spec FRs)

These are enforced by `@ovoco/kit-validator` via 002's integration:

- Every type listed in schema-structure.json appears in schema-attributes.json AND in LOAD_PRIORITY (FR-012).
- Every reference value resolves to an existing record's Name (FR-011).
- Attribute names are camelCase (FR-008); display names are Title Case (FR-009); data file names are kebab-case (FR-010).
- Application.outcome=Placed iff a Placement record references that Application (FR-003b). This requires either kit-validator to grow a cross-entity rule, or hr-kit's example data to be authored consistently and the rule to ride along when kit-validator adds inter-record validation. As of v0.1.0 of kit-validator, this constraint is enforced by *example data discipline* during authoring; if kit-validator later adds cross-entity rules, it will be picked up automatically.

## State Transitions

### Application

```text
applicationDate set
        |
        v
   stageHistory grows as candidate moves through stages
        |
        v
   outcome = Active (default while in pipeline)
        |
        +-> outcome = Placed     -> Placement record created
        +-> outcome = Rejected   -> decisionDate set
        +-> outcome = Withdrawn  -> decisionDate set
        +-> outcome = Expired    -> decisionDate set (requisition closed without action)
```

### Placement

```text
placementStatus = Active (set on creation)
        |
        v
   placementStatus = Ended, endDate set
```

### Job Requisition

```text
Open -> On Hold -> Open
   |--> Filled (closedDate set)
   |--> Cancelled (closedDate set)
   |--> Closed (closedDate set)
```

These transitions are descriptive, not validator-enforced. Example data must respect them.
