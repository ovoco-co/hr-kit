# Quickstart: Schema Validator Integration

How to use hr-kit's schema validator. Aimed at a contributor who has just cloned the repo.

## Prerequisites

- Node.js 18 or newer.
- Git, with network access to GitHub at install time (for the kit-validator git URL).

## Install

From the repo root:

```bash
npm install
```

This pulls `@ovoco/kit-validator` from the pinned git tag in `package.json`. After install completes, the validator is wired and runnable. No further setup.

## Run the validator

Validate the Core schema:

```bash
node tools/validate.js --schema schema/core
```

Or via the npm script:

```bash
npm run validate -- --schema schema/core
```

(The `--` passes the flag through to the script.)

When a domain exists, validate it:

```bash
node tools/validate.js --schema schema/domains/onboarding
```

## Expected outcomes

- **Clean schema**: exit code 0, output reports zero errors and zero warnings.
- **Schema with violations**: exit code non-zero, output names each violation by rule identifier, source file, and offending field. Fix violations and rerun.

## Common workflows

### After adding a new attribute to schema

1. Edit `schema/core/schema-attributes.json`.
2. If the new attribute name does not render to Title Case correctly via the default conversion, add an entry to `tools/lib/constants.js` ATTR_NAME_MAP.
3. Run the validator. Fix any errors.

### After adding a new type to schema

1. Edit `schema/core/schema-structure.json` to declare the type.
2. Edit `schema/core/schema-attributes.json` to declare its attributes.
3. Add the type name to `tools/lib/constants.js` LOAD_PRIORITY in dependency order (referenced types come first).
4. If the type's data file uses the nested-wrapper format, add it to NESTED_TYPES.
5. Create the data file at `schema/core/data/<kebab-case-type>.json`.
6. Run the validator. Fix any errors.

### Upgrading kit-validator

When `@ovoco/kit-validator` publishes a new version:

1. Read the kit-validator changelog for the new release.
2. Edit `package.json` and bump the ref tag in the `@ovoco/kit-validator` dependency from `#vX.Y.Z` to the new version.
3. Run `npm install`.
4. Run the validator. Address any new errors or warnings caused by new rules in the upgrade.
5. Commit the `package.json` change.

For a MINOR upgrade, the diff is one line. For a MAJOR upgrade, a config-key rename in `tools/validate.js` may also be required; the kit-validator changelog calls this out.

## Troubleshooting

- **`Cannot find module '@ovoco/kit-validator'`**: `npm install` did not complete, or the git URL ref does not exist (typo, deleted tag, or kit-validator has not yet published the pinned version). Re-run `npm install`. If the tag genuinely does not exist, fix the ref in `package.json`.
- **Validator exits 1 immediately on a fresh clone**: hr-kit's `schema/core/` may not yet have content (the Core HR schema spec, 001, was parked at the time this integration was specified). Empty-schema behavior is determined by kit-validator; check kit-validator's documentation for what it does on an empty schema directory.
- **A new rule fires after a kit-validator upgrade and you disagree with it**: kit-validator's constitutional Principle 5 says every rule traces back to a constitutional clause. File an issue against `ovoco-co/kit-validator` referencing the rule identifier and the constitutional clause; do not patch the rule out in hr-kit.
- **Validator runs slowly**: SC-001 targets under 5 seconds on a development laptop against a populated Core schema. If it exceeds that, profile via `node --prof tools/validate.js --schema schema/core` and file an issue against kit-validator with the profile output. Performance is dominated by kit-validator; hr-kit's entry point overhead is negligible.

## What this integration does NOT do

- It does not enforce schema validation in CI. Wiring CI to run the validator on every push is a separate concern, intentionally not in scope for this feature. A maintainer can add a `.github/workflows/validate.yml` (or other CI shape) when ready; the validator command is the same.
- It does not block commits. A pre-commit hook running the validator is a separate concern, also out of scope. The constitution says "Validate before committing", which is contributor discipline; no hook is shipped here.
- It does not publish or test the validator's rules. Those are kit-validator's responsibility.
