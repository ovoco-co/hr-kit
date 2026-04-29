# Implementation Plan: Core HR Schema

**Branch**: `001-core-hr-schema` | **Date**: 2026-04-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-core-hr-schema/spec.md`

## Summary

hr-kit's Core schema captures the candidate journey through six entities (Candidate, Job Requisition, Application, Placement, Client, Stage) plus referenced lookup types, expressed as JSON schema-structure and schema-attributes files alongside example data records under the fictional firm Keystone Recruiting. Validation is delegated entirely to the integration shipped by 002-schema-validator-integration, which consumes `@ovoco/kit-validator`. This plan defines the file layout, the entity shapes, and the conventions that the example data follows; it does not introduce new tooling, new languages, or new layers.

The four clarifications recorded in spec.md are confirmed by Geoff (2026-04-29): email-primary candidate identity with name-and-phone fallback, inline `stageHistory` array on Application, Stage limited to pipeline positions with a separate Application.outcome lookup driving Placement existence, and a small-realistic Keystone dataset of 3-5 clients, 5-6 requisitions, and 15-20 candidates.

## Technical Context

**Language/Version**: JSON for schema and data files. No executable code introduced by this feature. The kit's Node.js 18+ runtime is used only by the validator (provided by 002).

**Primary Dependencies**: The kit-validator integration (002-schema-validator-integration), which itself consumes `@ovoco/kit-validator`. No other dependencies.

**Storage**: Filesystem. Schema definitions live in `schema/core/schema-structure.json` and `schema/core/schema-attributes.json`. Data records live in `schema/core/data/<kebab-case-type-name>.json`.

**Testing**: The validator command from 002 (`node tools/validate.js --schema schema/core`) is the test surface. SC-003 and SC-004 are verified by running it. No additional test framework is introduced for this feature.

**Target Platform**: Cross-platform. Anywhere the validator runs.

**Project Type**: Schema-as-data. JSON files define the structure; example data instantiates it; the validator enforces conventions.

**Performance Goals**: Validator completes in under 5 seconds on a development laptop (per 002's SC-001). Performance is dominated by kit-validator; this feature contributes only the data volume.

**Constraints**:

- Constitutional naming conventions (camelCase attributes, Title Case display names, kebab-case data files).
- LOAD_PRIORITY in dependency order (referenced types before referencing types).
- All references use exact, case-sensitive Name matching.
- No domain references in Core (FR-018), no platform-specific fields in Core (FR-019).

**Scale/Scope**: Six core entity types plus approximately five lookup types. Example dataset of 3-5 Clients, 5-6 Requisitions, 15-20 Candidates, the Applications and Placements those imply, and the lookup values exercised by them. Total: roughly 60-80 records across all types.

No NEEDS CLARIFICATION items. The spec's four clarifications are all answered, and Geoff has confirmed them. Industry-flavor questions remain open (the Keystone industry sampler is still pending Geoff's pick), but they affect the *content* of example records, not the schema *shape* or the plan's structure; they are deferred to the implementation phase when the example data is authored.

## Constitution Check

GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.

Constitution v1.0.0 (ratified 2026-04-24). Each principle, evaluated against this feature:

- **I. Candidate-Journey-Centric Schema** — This feature is the candidate journey. Every entity (Candidate, Job Requisition, Application, Placement, Client, Stage) traces back to a step, actor, or artifact in that journey. PASS, satisfies.
- **II. Platform-Agnostic Design** — FR-019 explicitly forbids platform-specific attributes. The plan introduces no Hireology-specific (or any other ATS-specific) fields. PASS.
- **III. Schema Integrity** — Schema correctness is enforced by the validator from 002. The plan respects all five constitutional discipline rules: camelCase attribute names, Title Case display names, kebab-case data file names, exact-Name reference resolution, LOAD_PRIORITY dependency ordering. PASS.
- **IV. Layered Architecture** — This feature touches only the schema and data layers. No adapter coupling, no tools coupling beyond the validator dependency declared by 002. PASS.
- **V. Core + Domains** — FR-018 forbids Core from referencing any domain type. Background checks, onboarding, commission tracking, and compliance are all explicitly out of scope. PASS.
- **VI. Example Data Tells a Story** — The Keystone Recruiting example data tells a coherent end-to-end candidate journey (FR-015, FR-016, FR-017, FR-017a). PASS.

**Quality Gates** (constitution):

- "Schema validates clean (0 errors, 0 warnings) before any merge" — enforced by 002's validator. PASS.
- "LOAD_PRIORITY includes every importable type in dependency order" — addressed in data-model.md. PASS, configurationally.
- "Data files match schema-attributes.json field names exactly (camelCase)" — enforced by validator. PASS.
- "All references in data files resolve to records that exist in the data set" — enforced by validator. PASS.
- "Adapter overlay files map every Core attribute to a platform-native field" — not applicable; no adapter in this feature.
- "New types include: schema-structure entry, schema-attributes entry, LOAD_PRIORITY entry, data file, documentation" — the implementation tasks (Phase 2) MUST follow this checklist for every new type.
- "New domains include: a manifest declaring which Core types and which other domains they reference" — not applicable; no domain in this feature.

Constitution Check: PASS. No violations to justify in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-core-hr-schema/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
hr-kit/
├── schema/
│   └── core/
│       ├── README.md                       # New: orientation for the Core tier
│       ├── schema-structure.json           # New: type list with parent and description
│       ├── schema-attributes.json          # New: attribute definitions per type
│       └── data/
│           ├── source-channel.json         # New: lookup type
│           ├── employment-type.json        # New: lookup type
│           ├── application-outcome.json    # New: lookup type (Active/Placed/Rejected/Withdrawn/Expired)
│           ├── requisition-status.json     # New: lookup type
│           ├── placement-status.json       # New: lookup type
│           ├── stage.json                  # New: pipeline-position vocabulary
│           ├── client.json                 # New: 3-5 Keystone clients
│           ├── job-requisition.json        # New: 5-6 requisitions
│           ├── candidate.json              # New: 15-20 candidates
│           ├── application.json            # New: applications across the dataset
│           └── placement.json              # New: placements for outcome=Placed applications
├── tools/
│   ├── validate.js                         # Existing (002-schema-validator-integration)
│   └── lib/
│       └── constants.js                    # Existing (002), populated with Core types as they land
└── package.json                            # Existing; gains no new dependency for this feature
```

**Structure Decision**: Single-tier Core under `schema/core/`. Domains are out of scope (FR-018) and would land at `schema/domains/<domain>/` in future features. The validator's tools/ scaffolding is owned by 002 and reused as-is. The example data lives in per-type files following the kebab-case convention (FR-010); each type gets exactly one data file.

## Implementation Sequencing

This plan does not introduce new external dependencies, but it does depend on 002 having landed (because validation discipline is enforced there). Practically:

- Phase 0 research can complete now.
- Phase 1 design (data-model.md, contracts/, quickstart.md) can complete now.
- Phase 2 task generation (`/speckit.tasks`) can complete now.
- Implementation execution depends on 002's `tools/validate.js` and `tools/lib/constants.js` being available on the working branch (either by merging 002 into 001 first, or by merging both into main in sequence). The `LOAD_PRIORITY` array in `constants.js` gets populated incrementally as each Core type lands.

## Complexity Tracking

No violations. Section intentionally empty.
