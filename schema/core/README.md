# Core Schema

This directory holds hr-kit's Core HR schema. Core captures the candidate journey through a hiring process: sourcing, application, pipeline progression, and placement (or non-placement) at a client.

Six entity types and five lookup types make up Core. Together they answer: who applied, for what job at which client, where in the pipeline they are, what the outcome was, and if placed, when they started.

## What's in this directory

- `schema-structure.json` lists every Core type with a one-line description.
- `schema-attributes.json` declares the attributes of each type, including types (scalar, reference, inline structured) and reference targets.
- `data/` holds one example record file per type, populated with a fictional recruiting firm called Keystone Recruiting. The data set tells a coherent end-to-end candidate journey.

## The six entity types

- **Candidate**. A person being considered for one or more jobs. Identity is keyed on email (case-insensitive); when email is absent, full name plus primary phone is the fallback.
- **Job Requisition**. A specific open role at a Client. Carries title, level, employment type, lifecycle status, and open and close dates.
- **Application**. A candidate's participation in a specific requisition. Carries the current pipeline Stage, the inline stage history, the application source, and the terminal outcome.
- **Placement**. The success record. A Candidate has been placed into a Job Requisition at a Client. Exists if and only if the corresponding Application's outcome is Placed.
- **Client**. The end-organization where a candidate is placed and the owner of one or more Job Requisitions.
- **Stage**. A pipeline position (Sourced, Screened, Interviewing, Offer). Pipeline-only; terminal outcomes (Placed, Rejected, Withdrawn, Expired) live on `Application.outcome`, not on Stage.

## The five lookup types

- **Source Channel**. How candidates are sourced (LinkedIn Recruiter, Referral, Walk-In, etc.).
- **Employment Type**. Full-Time, Contract, Contract-to-Hire, Part-Time, Per-Diem.
- **Application Outcome**. Active, Placed, Rejected, Withdrawn, Expired. Fixed values; spec FR-003.
- **Requisition Status**. Open, On Hold, Closed, Filled, Cancelled.
- **Placement Status**. Active, Ended.

## How the entities connect

```text
Client <--- Job Requisition  (Job Requisition.client)
   ^             ^
   |             |
Placement     Application
   ^             |
   +-- (when Application.outcome = Placed)

Candidate <-- Application.candidate
              Placement.candidate

Stage <------ Application.currentStage
              Application.stageHistory[].stage
```

Every reference resolves by exact, case-sensitive `Name` match.

## How to read this directory

- For full attribute lists with types and constraints, see `specs/001-core-hr-schema/data-model.md`.
- For JSON file format conventions, see `specs/001-core-hr-schema/contracts/json-file-formats.md`.
- For how to validate, extend, and follow a candidate journey, see `specs/001-core-hr-schema/quickstart.md`.

## What Core does NOT include

- Background checks, onboarding workflows, commission tracking, compliance records (EEO, OFCCP, I-9). Those belong to future domain packages.
- Hireology field codes or any ATS-vendor-specific attribute. Platform mappings live in adapter overlay files, not in Core.
- Process records that live naturally elsewhere (payroll, benefits administration, time tracking).

The constitution's principle V keeps Core minimal: "Track a candidate through a hiring process and place them with a client." Anything beyond that is a domain.
