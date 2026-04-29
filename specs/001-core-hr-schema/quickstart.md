# Quickstart: Core HR Schema

How to read hr-kit's Core schema and how to extend it. Aimed at a recruiting-ops reader or a contributor who has just cloned the repo.

## Prerequisites

- Node.js 18 or newer.
- The validator integration from 002 already in place: `tools/validate.js`, `tools/lib/constants.js`, and `@ovoco/kit-validator` declared in `package.json`.
- `npm install` has run successfully (depends on kit-validator v0.1.0 being published).

## Reading the schema

Two files describe the shape, one directory holds the example data:

- `schema/core/schema-structure.json`: a list of every Core type and a one-line description of each. Read this first.
- `schema/core/schema-attributes.json`: per-type attribute definitions. Open this alongside schema-structure.json to see what fields each type carries.
- `schema/core/data/`: one JSON file per type, holding the Keystone Recruiting example records.

## Tracing a candidate journey

The Keystone dataset is designed to be readable cover-to-cover. To follow one candidate end-to-end:

1. Open `schema/core/data/candidate.json` and pick any record. Note the Name (e.g., "Jane Doe").
2. Open `schema/core/data/application.json` and search for that Name in the `candidate` field. You'll find one or more Application records.
3. For each Application, follow `jobRequisition` to `schema/core/data/job-requisition.json`. That record's `client` field links to a Client.
4. Read `outcome` on the Application:
   - If `Active`: the candidate is mid-pipeline. `currentStage` tells you where.
   - If `Placed`: a matching record exists in `schema/core/data/placement.json` (look up by `application` field). The Placement carries the start date.
   - If `Rejected` / `Withdrawn` / `Expired`: the candidate did not place; the journey ended at this Application.
5. Read `stageHistory` on the Application to see every Stage the candidate moved through, with timestamps.

You can do this in any direction: pick a Client and find every Application referencing one of its Requisitions; pick a Stage and find every Application that touched it; pick a Placement and walk back to the Candidate.

## Validating a change

After editing any file under `schema/core/`:

```bash
node tools/validate.js --schema schema/core
```

A clean schema produces zero errors and zero warnings. A broken schema produces a precise list of what's wrong and where (file path, record name, field name).

## Common workflows

### Adding a new attribute to a Core entity

1. Edit `schema/core/schema-attributes.json` and add the attribute under the relevant type.
2. If the attribute name does not render to Title Case correctly via the default conversion, edit `tools/lib/constants.js` ATTR_NAME_MAP and add an entry mapping the camelCase name to the desired Title Case display.
3. Optionally update some or all records in `schema/core/data/<type>.json` to populate the new attribute.
4. Run the validator. Fix any errors.

### Adding a new lookup type

1. Edit `schema/core/schema-structure.json` and add an entry for the new type.
2. Edit `schema/core/schema-attributes.json` and declare its attributes (lookup types typically just have `description`).
3. Edit `tools/lib/constants.js` LOAD_PRIORITY and insert the new type ahead of any type that references it.
4. Create `schema/core/data/<kebab-case-type-name>.json` with at least one record.
5. Run the validator.

### Adding a new entity type

1. Edit `schema/core/schema-structure.json`, `schema/core/schema-attributes.json`, and `tools/lib/constants.js` LOAD_PRIORITY (every importable type MUST be in LOAD_PRIORITY in dependency order).
2. Create the data file at `schema/core/data/<kebab-case-name>.json`.
3. If the new type uses the nested-wrapper data format (`{ "TypeName": [...] }`), add it to NESTED_TYPES in constants.js. Core v0.1.0 has no such types.
4. Update `schema/core/README.md` (the per-tier orientation file) to describe the new type.
5. Run the validator.

### Ensuring the candidate-journey-centric principle holds

Before adding a new type, ask: does it describe a step, actor, or artifact in the candidate journey? If yes, it likely belongs in Core. If it describes background checks, onboarding, commission tracking, compliance, or any specialized concern, it belongs in a future domain, not Core (Constitution V).

## Troubleshooting

- **"Type X is missing from LOAD_PRIORITY"**: edit `tools/lib/constants.js` and insert X in dependency order.
- **"Unresolved reference: 'Acme Payments' in client.json"**: a record name was misspelled, or the referenced record does not exist. Reference resolution is case-sensitive.
- **"Attribute name 'PrimaryPhone' is not camelCase"**: the camelCase rule is enforced. Use `primaryPhone`.
- **"Display name 'Source channel' is not Title Case"**: rename to `Source Channel`.
- **"Application X has outcome=Placed but no Placement record references it"**: add the Placement record (or change the outcome).
- **"Validator runs slowly"**: SC-001 of 002 targets under 5 seconds. If you hit that, file a kit-validator issue with profiling output.

## What Core does NOT include

- Background checks (a future domain package).
- Onboarding workflows (a future domain).
- Commission tracking (a future domain).
- Compliance records like EEO, OFCCP, I-9 (a future domain, with regime-specific scope).
- Hireology field codes or any ATS-vendor-specific attribute (out of scope per FR-019; lives in adapter overlay files).
- Schema editor UI (kits are JSON-as-data; UIs come from the target platform when adapters land).

## Where to go next

- To consume Core in an ATS: see the (forthcoming) Hireology adapter spec at `specs/003-hireology-adapter/`.
- To add a domain: read Constitution principle V, then start a new feature spec at `specs/00N-<domain-name>/`.
- To extend the validator's rule set: file an issue against `ovoco-co/kit-validator`.
