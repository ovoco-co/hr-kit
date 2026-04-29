# Contract: Schema and Data JSON File Formats

This contract documents the JSON shapes hr-kit's Core ships. The shapes follow cmdb-kit's existing conventions, which `@ovoco/kit-validator` (consumed via 002) is built to read.

## File: `schema/core/schema-structure.json`

Top-level shape: an array of type-definition objects.

```json
[
  {
    "name": "Source Channel",
    "description": "How a candidate was discovered or contacted."
  },
  {
    "name": "Stage",
    "description": "A pipeline position. Pipeline-only: terminal outcomes live on Application.outcome."
  },
  {
    "name": "Candidate",
    "description": "A person being considered for one or more jobs."
  }
]
```

Per-entry fields:

- `name` (string, required): Title Case display name. Must match the type's name everywhere else in the kit.
- `parent` (string, optional): a parent type's name when this type is a subtype. Core does not use parent types in v0.1.0.
- `description` (string, optional): a short description. Avoid hard limits on length; the cmdb-kit JSM-Assets-specific 70-character cap is dropped per 002's research.

## File: `schema/core/schema-attributes.json`

Top-level shape: an object mapping type name to attribute definitions.

```json
{
  "Source Channel": {
    "description": { "type": 0 }
  },
  "Candidate": {
    "email":        { "type": 0 },
    "primaryPhone": { "type": 0 },
    "sourceChannel": { "type": 1, "referenceType": "Source Channel" },
    "sourceDate":   { "type": 0, "defaultTypeId": 4 },
    "description":  { "type": 0 }
  },
  "Application": {
    "candidate":        { "type": 1, "referenceType": "Candidate" },
    "jobRequisition":   { "type": 1, "referenceType": "Job Requisition" },
    "currentStage":     { "type": 1, "referenceType": "Stage" },
    "stageHistory":     { "type": 2 },
    "applicationDate":  { "type": 0, "defaultTypeId": 4 },
    "source":           { "type": 1, "referenceType": "Source Channel" },
    "outcome":          { "type": 1, "referenceType": "Application Outcome" },
    "decisionDate":     { "type": 0, "defaultTypeId": 4 }
  }
}
```

Attribute-definition fields (cmdb-kit convention):

- `type` (integer, required):
  - `0`: scalar value (string by default; specialized via `defaultTypeId`).
  - `1`: reference to another type.
  - `2`: inline structured value (array or object). Used here for `stageHistory` on Application.
- `defaultTypeId` (integer, optional, only when `type=0`):
  - `1`: integer
  - `2`: boolean
  - `4`: date (ISO YYYY-MM-DD)
  - omitted: string/text
- `referenceType` (string, required when `type=1`): the Name of the target type. Must match an entry in schema-structure.json.
- `max` (integer, optional, only when `type=1`): set to `-1` for multi-references (semicolon-separated values in data). Core does not currently use multi-references.

Note on `type=2` (`stageHistory`): kit-validator's v0.1.0 may or may not have first-class support for inline structured values. If support lags, hr-kit's data files still carry the array shape; the validator will simply not introspect inside the array. The constitutional invariant is satisfied by example-data authoring discipline plus the per-Application acceptance scenarios.

## File: `schema/core/data/<kebab-case-type-name>.json`

Top-level shape: a JSON array of record objects. Each record carries `Name` plus the attributes declared in schema-attributes.json for that type.

Example for `schema/core/data/source-channel.json`:

```json
[
  {
    "Name": "LinkedIn Recruiter",
    "description": "Outbound sourcing on LinkedIn Recruiter."
  },
  {
    "Name": "Referral",
    "description": "Introduced by an existing contact in Keystone's network."
  },
  {
    "Name": "Walk-In",
    "description": "Candidate approached Keystone directly without prior outreach."
  }
]
```

Example for `schema/core/data/candidate.json`:

```json
[
  {
    "Name": "Jane Doe",
    "email": "jane.doe@example.com",
    "primaryPhone": "+1-555-0100",
    "sourceChannel": "LinkedIn Recruiter",
    "sourceDate": "2026-01-15",
    "description": "Senior backend engineer, ten years at fintech."
  }
]
```

Example for `schema/core/data/application.json` showing inline `stageHistory`:

```json
[
  {
    "Name": "Jane Doe -> Acme Backend Engineer",
    "candidate": "Jane Doe",
    "jobRequisition": "Senior Backend Engineer at Acme Payments",
    "currentStage": "Offer",
    "stageHistory": [
      { "stage": "Sourced",      "enteredAt": "2026-01-15" },
      { "stage": "Screened",     "enteredAt": "2026-01-22" },
      { "stage": "Interviewing", "enteredAt": "2026-02-01" },
      { "stage": "Offer",        "enteredAt": "2026-02-18" }
    ],
    "applicationDate": "2026-01-15",
    "source": "LinkedIn Recruiter",
    "outcome": "Placed",
    "decisionDate": "2026-02-25"
  }
]
```

Per-record fields:

- `Name` (string, required): the natural-language identifier. Used for cross-record references (FR-011). Case-sensitive match.
- All other keys correspond to attributes declared in schema-attributes.json for this record's type. Reference fields hold the target's `Name`.
- Reserved metadata keys allowed alongside attributes: `description` (when not declared as a type-specific attribute, the validator tolerates it as metadata).
- Multi-references are not used in Core v0.1.0; if added later, values are semicolon-separated strings (cmdb-kit convention).

## File-name conventions

- Schema files (top-level): exactly `schema-structure.json` and `schema-attributes.json` under `schema/core/`. Lowercase, hyphenated.
- Data files: `<kebab-case-type-name>.json` under `schema/core/data/`. Examples: `source-channel.json`, `job-requisition.json`, `application-outcome.json`. The conversion rule is straight Title Case to kebab-case (drop spaces, lowercase, hyphenate).
- One data file per importable type. No bundling, no nesting (cmdb-kit's NESTED_TYPES wrapper is not used in Core v0.1.0).

## What this contract does NOT cover

- Adapter overlay files (`adapters/<target>/overlay.json`). Out of scope; will be defined when the Hireology adapter spec runs.
- Domain manifests. Out of scope for Core; defined when the first domain ships.
- Helper or generated files. Core ships no generated content; everything is hand-authored or example data.
