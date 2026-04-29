# Phase 0 Research: Schema Validator Integration

## Scope

No NEEDS CLARIFICATION items in the plan's Technical Context. This research file consolidates dependency, integration, and best-practice findings that inform Phase 1 design and that future readers will want documented in one place.

## Decisions

### Decision: Consume `@ovoco/kit-validator` via git URL pinned to a tagged release

- **Decision**: Declare `@ovoco/kit-validator` in `package.json` as `"git+https://github.com/ovoco-co/kit-validator.git#v0.1.0"`. Bump the ref tag deliberately when adopting a new MAJOR or MINOR release.
- **Rationale**: kit-validator is a public GitHub repo, not yet on the npm registry. npm supports git URL dependencies natively with a `#<ref>` tag pin syntax. Pinning to a specific tag makes adoption of a new version a deliberate single-line edit, which matches the spec's FR-010 (single-line PR diff for MINOR upgrades) and the kit-validator constitution's semver discipline (Principle 3).
- **Alternatives considered**:
  - `npm publish` to a public registry. Faster for consumers but adds release machinery and a registry dependency at a stage when kit-validator has not shipped 0.1.0 yet. Worth revisiting once kit-validator stabilizes.
  - Range syntax (e.g., `^0.1.0`). Not supported by npm git URLs; ranges are a registry-only feature.
  - Submodule. Couples the kits at the git layer rather than the package layer; awkward for downstream consumers cloning hr-kit.
  - Workspace-relative path (`file:../kit-validator`). Breaks the moment a consumer clones hr-kit standalone, since the workspace path will not exist on their machine.

### Decision: Function-API surface treated as "approximate per kit-validator README" until 0.1.0 freezes

- **Decision**: hr-kit's `tools/validate.js` is written against the README sketch (`schemaDir`, `loadPriority`, `nestedTypes`, `attrNameMap`) and is updated mechanically once kit-validator's `/speckit.specify` and `/speckit.clarify` ratify the actual 0.1.0 surface.
- **Rationale**: kit-validator's README explicitly labels the usage example as a sketch. Asking hr-kit to commit to keys that kit-validator has not yet frozen would invent constraints kit-validator's spec might not carry. The mechanical update at freeze time is small (renaming keys in one entry-point file).
- **Alternatives considered**:
  - Wait for kit-validator's 0.1.0 freeze before writing hr-kit's plan and tasks. Throws away the parallel-work window the user explicitly wants to keep open.
  - Pin hr-kit's spec to specific config keys today and update both spec and code if kit-validator chooses different names. Same mechanical churn at twice the cost (spec edit plus code edit).

### Decision: Two-file integration footprint, no tests directory at v0.1.0

- **Decision**: The integration adds exactly two new files (`tools/validate.js`, `tools/lib/constants.js`) and modifies one (`package.json`). No `tests/` directory is introduced now.
- **Rationale**: The entry point is a 4-call sequence with no branching logic of its own; unit tests against it would test that import-and-call works, which Node's module loader already verifies at import time. Rule-level tests are owned by kit-validator. Smoke testing happens end-to-end via running the validator against the schema/core scaffold once 001's content lands. Adding a tests directory before there is anything kit-specific to test would be premature scaffolding (constitution writing rules favor minimal-and-grounded over scaffolded-for-the-future).
- **Alternatives considered**:
  - `tests/fixtures/passing` and `tests/fixtures/failing` synthetic schema dirs to smoke-test exit codes. Useful, but the same coverage comes for free from running the validator against the real `schema/core` (passing fixture) and against a deliberately broken commit (failing fixture). If end-to-end coverage proves insufficient, fixtures can land in a follow-on feature.
  - A Jest or vitest test runner. Heavier than `node --test` for this size of integration.

### Decision: Entry-point uses `process.argv` directly; no argv parser library

- **Decision**: `tools/validate.js` reads `--schema <dir>` from `process.argv` directly and passes `schemaDir` into the kit-validator config. If the kit-validator CLI accepts additional flags (e.g., `--domain`), the entry point either passes them through or hands `process.argv` to kit-validator's own parser, depending on how kit-validator's API surface freezes.
- **Rationale**: The entry point is meant to stay under 20 lines (SC-002). Pulling in `commander`, `yargs`, or `minimist` adds a dependency for something that is, at this scale, two lines of `process.argv` indexing. kit-validator's CLI binary handles the same parsing; hr-kit's entry point is for the `node tools/validate.js` form invoked from npm scripts.
- **Alternatives considered**:
  - Have hr-kit shell out to `node_modules/.bin/kit-validate` instead of importing `validate(config)`. Loses the function-API benefits (programmatic embedding in future tests, single import surface) and is one more layer of process indirection.

### Decision: `package.json` `validate` script unchanged

- **Decision**: Keep `"validate": "node tools/validate.js"` exactly as scaffolded. Pass `--schema schema/core` (and other flags) through CLI invocation, not by hardcoding inside the script.
- **Rationale**: The script entry has been in `package.json` since the initial scaffold. Hardcoding a default tier in `npm run validate` would couple the script to one tier, which fights the constitutional Core+Domains layering. Users pass `--schema schema/core` or `--schema schema/domains/<domain>` per run; if a default is wanted later, it goes into the entry point's argv parsing, not the npm script.
- **Alternatives considered**:
  - `"validate:core": "node tools/validate.js --schema schema/core"` plus `"validate:domain": "..."`. cmdb-kit uses this pattern. Consider revisiting if hr-kit's domain count grows; for v0.1.0 with no domains, a single script is enough.

### Decision: Implementation gated on kit-validator 0.1.0 publishing AND on 001 schema content landing

- **Decision**: Spec, plan, tasks, and contract artifacts complete now. Implementation (writing the actual `tools/validate.js` and `tools/lib/constants.js` and adding the `package.json` dependency) waits for both kit-validator 0.1.0 publishing AND 001's schema content landing. Either gate alone is insufficient: kit-validator 0.1.0 without 001 means the validator runs against an empty schema (kit-validator's empty-schema behavior is its own decision and outside hr-kit's scope, per FR-014); 001 without kit-validator means there is nothing to import from `@ovoco/kit-validator`.
- **Rationale**: Spec, plan, and tasks are documentation; they freeze decisions and surface risks before either external dependency lands. Implementation is non-trivial only after both are present, and is then mechanical.
- **Alternatives considered**:
  - Implement against a placeholder local stub of kit-validator (a `lib/index.js` that returns `{ errors: [], warnings: [], exitCode: 0 }`). Useful for CI smoke testing of the integration shape, but creates a stub that tests nothing of substance and that has to be deleted on the 0.1.0 publish day. Skipped.

## Open Coordination Items

These are not unknowns blocking the plan; they are coordination notes for the implementation phase.

- kit-validator's frozen 0.1.0 config-key names (e.g., `loadPriority` vs `loadOrder`, `domainDirs` vs `domainDir`, presence of `personnelTypes`). Update `tools/validate.js` to match at implementation time.
- kit-validator's published JSON Schema for error and warning record shapes (per their commitment: "I'll publish the error and warning record shapes as a JSON Schema file in the kit-validator repo, not just prose"). hr-kit's CI gates can validate against the schema file directly when CI is wired (a separate concern, not this feature).
- hr-kit's specific `LOAD_PRIORITY` content. Cannot be finalized until 001's schema content lands; the constants module ships with whatever types exist at that moment plus any lookup types referenced by them.
