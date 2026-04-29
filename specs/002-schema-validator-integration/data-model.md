# Phase 1 Data Model: Schema Validator Integration

The integration adds no schema records or domain entities. The "data" of this feature is the configuration shape hr-kit hands to `validate(config)` and the structure of the constants module that supplies it. This file documents that shape.

## Module: `tools/lib/constants.js`

A CommonJS module exporting hr-kit-specific configuration consumed by `@ovoco/kit-validator`. Pure data: no functions, no I/O, no logic.

### Exports

#### `LOAD_PRIORITY`

- **Shape**: `string[]`
- **Purpose**: Ordered list of every importable schema type in dependency order. Referenced types must appear before types that reference them.
- **Source of truth**: Must match every type defined in `schema/core/schema-structure.json` (and, when domains exist, every type in any loaded domain's schema-structure.json). Constitution III mandates this completeness.
- **Initial content (v0.1.0 of the integration)**: Empty array, populated as 001's schema content lands. The complete v0.1.0 LOAD_PRIORITY corresponds to whatever types appear in 001's data-model.md when 001 unparks.
- **Example shape (illustrative, not authoritative)**:

```js
const LOAD_PRIORITY = [
  // Lookup types first (no dependencies)
  'Source Channel',
  'Employment Type',
  'Application Outcome',
  'Placement Status',
  'Requisition Status',
  // Directory next (referenced by core entities)
  'Person',
  // Core entities in dependency order
  'Stage',
  'Client',
  'Job Requisition',  // references Client
  'Candidate',
  'Application',      // references Candidate, Job Requisition, Stage
  'Placement',        // references Candidate, Job Requisition, Client
];
```

#### `NESTED_TYPES`

- **Shape**: `string[]`
- **Purpose**: Type names whose data files use the nested-wrapper format (`{ "TypeName": [...] }`) rather than a plain array. Mirrors the cmdb-kit convention; kit-validator's file loader uses this hint.
- **Initial content**: Likely `['Person']` to match cmdb-kit's NESTED_TYPES default. Final content depends on hr-kit's data-file authoring decisions in 001's implementation.

#### `ATTR_NAME_MAP`

- **Shape**: `Record<string, string>`
- **Purpose**: Optional camelCase-to-Title-Case override map for attribute names whose default conversion is wrong. Kit-validator falls back to a default conversion when a name is not in the map.
- **Initial content**: Empty object, populated as hr-kit attributes are added that need non-default rendering.
- **Example shape**:

```js
const ATTR_NAME_MAP = {
  // sourceChannel -> "Source Channel" (default conversion is correct, no override needed)
  // licensureState -> default conversion is "Licensure State" (correct)
  // i9Status -> default conversion is "I 9 Status" (incorrect), override required:
  // i9Status: 'I-9 Status',
};
```

#### Other exports (conditional on kit-validator's 0.1.0 surface)

- `PERSONNEL_TYPES` may be required as a separate export, depending on whether kit-validator's frozen surface treats it as a subset of NESTED_TYPES or as its own concept. cmdb-kit's lib has both. hr-kit's constants module mirrors whatever kit-validator's 0.1.0 expects.

## File: `tools/validate.js`

Thin entry point. Pure call-and-exit; no module-level state besides the require statements.

### Behavior contract

Input: process arguments containing `--schema <dir>` (and optionally `--domain <dir>`).
Output: a process exit with the integer exit code returned by `validate(config).exitCode`. Stdout and stderr from `validate(config)` pass through unmodified.

### Pseudocode shape (target form)

```js
#!/usr/bin/env node
const { validate } = require('@ovoco/kit-validator');
const { LOAD_PRIORITY, NESTED_TYPES, ATTR_NAME_MAP } = require('./lib/constants');

const schemaIdx = process.argv.indexOf('--schema');
const schemaDir = schemaIdx > -1 ? process.argv[schemaIdx + 1] : 'schema/core';

const result = validate({
  schemaDir,
  loadPriority: LOAD_PRIORITY,
  nestedTypes: NESTED_TYPES,
  attrNameMap: ATTR_NAME_MAP,
});
process.exit(result.exitCode);
```

This shape is illustrative. Final form depends on the kit-validator 0.1.0 surface (config keys may be renamed; `--domain` and other flags may need pass-through; `process.argv` parsing may be delegated to kit-validator's own parser if it exposes one).

## Module: `package.json`

One additive dependencies entry. The package.json otherwise stays as scaffolded.

### Diff shape (target form)

```json
{
  "name": "@ovoco/hr-kit",
  "version": "0.0.1",
  "dependencies": {
    "@ovoco/kit-validator": "git+https://github.com/ovoco-co/kit-validator.git#v0.1.0"
  }
}
```

## Validation Rules (drawn from spec FRs)

These constrain the *shape* of the data, not its *contents*:

- LOAD_PRIORITY MUST list every type in `schema/core/schema-structure.json` plus every type in any loaded domain. (FR-011, Constitution III, Quality Gate "LOAD_PRIORITY includes every importable type in dependency order".)
- LOAD_PRIORITY ordering MUST place referenced types before referencing types. (Constitution III, Quality Gate same.)
- NESTED_TYPES MUST contain every type whose data file uses the nested-wrapper format and no others. Mismatch causes kit-validator's file loader to misparse data files.
- ATTR_NAME_MAP keys MUST be camelCase attribute names. Values MUST be Title Case display strings. (Constitution III; specifically the camelCase rule on attribute names and the Title Case rule on display names.)
- The integration MUST NOT contain rule logic in any file (FR-009, SC-005). The constants module is data only; the entry point is import-and-call only.

## State Transitions

The integration has no runtime state and no transitions. The only transition is at upgrade time: when kit-validator publishes a new MAJOR or MINOR, the maintainer edits `package.json` (and possibly `tools/validate.js` if a MAJOR config-key rename is involved). The integration goes from "pinned to vN.M.P" to "pinned to vN'.M'.P'" in a single commit.
