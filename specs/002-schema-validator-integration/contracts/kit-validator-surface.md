# Contract: kit-validator Function-API Surface

This file documents the contract hr-kit assumes from `@ovoco/kit-validator` at v0.1.0. The contract is owned by kit-validator; this file is hr-kit's recorded expectation, useful for spotting drift when kit-validator publishes its own frozen API.

## Source of authority

- **Primary**: `@ovoco/kit-validator` repository at https://github.com/ovoco-co/kit-validator. The `lib/index.js` exports define the authoritative surface as of any given tagged release.
- **Documented**: kit-validator's `README.md` (current usage sketch) and its forthcoming JSON Schema for error and warning record shapes.
- **This file**: hr-kit's recorded expectation as of 2026-04-28. Updated if kit-validator's frozen 0.1.0 differs.

## Module entry

- **Package name**: `@ovoco/kit-validator`
- **Main**: `lib/index.js` (per kit-validator's `package.json`)
- **Named export**: `validate`
- **CLI bin**: `kit-validate`, mapped to `bin/kit-validate.js` (per kit-validator's `package.json`)

## Function signature

```ts
function validate(config: ValidateConfig): ValidateResult;
```

Synchronous. No callback variant. No promise variant assumed at v0.1.0. If kit-validator chooses an async signature instead, hr-kit's entry point updates accordingly (a minor change: wrap in `(async () => { ... })()` and adjust the exit call).

## Input: `ValidateConfig`

Expected fields, based on kit-validator's README sketch as of 2026-04-28. Final names freeze when kit-validator's `/speckit.specify` and `/speckit.clarify` complete.

| Field | Type | Required | Source | Notes |
|------|------|----------|--------|-------|
| `schemaDir` | `string` | yes | `--schema <dir>` argv | Path to the tier root: `schema/core` or `schema/domains/<domain>`. May be relative or absolute. |
| `loadPriority` | `string[]` | yes | `tools/lib/constants.js` LOAD_PRIORITY | Type names in dependency order. |
| `nestedTypes` | `string[]` | yes | `tools/lib/constants.js` NESTED_TYPES | Type names whose data files use the nested-wrapper format. |
| `attrNameMap` | `Record<string,string>` | yes (may be empty) | `tools/lib/constants.js` ATTR_NAME_MAP | camelCase to Title Case overrides. |
| `domainDirs` (or `domainDir`) | `string[]` (or `string`) | optional | `--domain <dir>` argv (repeatable per kit-validator README) | Paths to domain directories that overlay the core schema. Singular or plural shape pending kit-validator's freeze. |
| `personnelTypes` | `string[]` | optional | `tools/lib/constants.js` PERSONNEL_TYPES | Subset of NESTED_TYPES treated as personnel. May or may not exist as a separate config key in 0.1.0. |

## Output: `ValidateResult`

Expected fields (per kit-validator's existing scaffold and our coordination):

| Field | Type | Notes |
|------|------|-------|
| `errors` | `ErrorRecord[]` | Empty array if no errors. Shape of each record defined by kit-validator's published JSON Schema. |
| `warnings` | `WarningRecord[]` | Empty array if no warnings. Shape per JSON Schema. |
| `exitCode` | `integer` | 0 when `errors` is empty, non-zero when `errors` is non-empty. hr-kit's entry point passes this directly to `process.exit`. |

The function MUST also write human-readable output to stdout/stderr so `node tools/validate.js` produces useful terminal output without any post-processing by hr-kit.

## Error and Warning record shapes

Owned by kit-validator. Per the architectural agreement, kit-validator publishes a JSON Schema file in its repo that hr-kit's CI gates can validate against. Until that ships, hr-kit treats the prose description in kit-validator's README as the contract.

Each record is expected to include at minimum:

- A stable rule identifier (e.g., `attribute.casing`, `data.reference.unresolved`). Per kit-validator's constitutional Principle 7 (Documented Rule Identity), these identifiers are part of the contract; renames are MAJOR.
- A human-readable message.
- Source location: file path, and where applicable, the offending field, record name, or attribute name.

## Versioning expectations

- v0.1.0: initial frozen surface. hr-kit's `package.json` pins `#v0.1.0`.
- v0.x.y MINOR bumps add new rules or new record fields. Additive only. hr-kit upgrades by editing one line in `package.json`.
- v0.x.y PATCH bumps fix bugs without changing rule outcomes. hr-kit upgrades by editing one line.
- v1.0.0 (or any future MAJOR) may rename config keys, change the function signature, or change record shapes. hr-kit upgrades by editing `package.json` plus `tools/validate.js`. Per kit-validator's constitutional governance, MAJOR bumps follow a deprecation cycle: one MINOR with deprecation warnings before the breaking change ships.

## What hr-kit MUST NOT depend on

- Internal module structure of kit-validator (e.g., `require('@ovoco/kit-validator/lib/rules/casing')`). hr-kit imports only the package's named exports.
- Side effects beyond returning `ValidateResult` and writing to stdout/stderr. The function reads filesystem (the schema/data files) but performs no network calls.
- Specific error/warning message text. hr-kit checks rule identifiers, not messages.
