# Feature Specification: Schema Validator Integration

**Feature Branch**: `002-schema-validator-integration`
**Created**: 2026-04-28
**Status**: Draft
**Input**: User description: "Schema validator integration for hr-kit. Consumes @ovoco/kit-validator via git URL declared in package.json as \"git+https://github.com/ovoco-co/kit-validator.git#v0.1.0\", pinned to a specific tagged release of kit-validator starting at v0.1.0 and bumped deliberately on each new MAJOR or MINOR (npm git URLs do not support semver ranges). hr-kit's responsibility is two files: tools/validate.js (about ten lines: import { validate } from @ovoco/kit-validator, load constants, call validate, exit with result.exitCode), and tools/lib/constants.js exporting hr-kit's LOAD_PRIORITY array, NESTED_TYPES list, and ATTR_NAME_MAP overrides. CLI shape mirrors the kit-validator bin: `node tools/validate.js --schema schema/core` and `--schema schema/domains/<domain>`. Reports zero errors and zero warnings on a correct hr-kit schema. Implementation depends on kit-validator shipping 0.1.0 and on hr-kit's schema/core scaffold landing; spec, plan, and tasks phases proceed in parallel against the function-API surface documented in kit-validator's README, treating that surface as approximate until kit-validator's own /speckit.specify and /speckit.clarify freeze it in 0.1.0. Rule logic, error/warning record shapes, and CLI machinery are owned by kit-validator and explicitly out of scope here. The validator integration is the constitutional enforcement gate referenced by FR-013 of the Core HR schema spec; it must be in place before any real schema content can land."

## Clarifications

### Session 2026-04-28

- Q: Which operational gates ship as part of this feature? → A: Validator command only. CI workflow and pre-commit hook are explicitly out of scope, deferred to future features.

## User Scenarios and Testing *(mandatory)*

### User Story 1 - Maintainer validates hr-kit's schema with one command (Priority: P1)

A maintainer modifies hr-kit's schema (adds an attribute to Candidate, renames a Stage, defines a new Source Channel lookup value) and wants to know whether the change is constitutionally clean before committing. They run `node tools/validate.js --schema schema/core`. They get either zero errors and zero warnings, or a precise list of what is wrong and where. The fact that the rule logic lives in `@ovoco/kit-validator`, not in hr-kit, is invisible at the call site. They never need to read kit-validator's source to interpret the result.

**Why this priority**: This is the single workflow the integration exists to support. Schema Integrity is constitutional; without a one-command gate the convention decays. Every later feature in the queue (Hireology adapter, mock server, domains) depends on schema changes being pre-validated.

**Independent Test**: A maintainer with a fresh clone of hr-kit, having installed dependencies, can run the validator command against `schema/core` and observe a clean exit on a known-good schema, and a non-zero exit with a precise message on a deliberately broken schema. No kit-validator-specific knowledge is required to interpret either result.

**Acceptance Scenarios**:

1. **Given** a freshly installed hr-kit repository with a known-good Core schema, **When** the maintainer runs `node tools/validate.js --schema schema/core`, **Then** the validator exits with status 0 and reports zero errors and zero warnings.
2. **Given** a hr-kit schema with a deliberately introduced violation (e.g., an attribute named in PascalCase, a missing LOAD_PRIORITY entry, an unresolved reference), **When** the maintainer runs the validator, **Then** the validator exits with non-zero status and prints a message identifying the offending file and field.
3. **Given** the maintainer running the validator against a domain (`--schema schema/domains/<domain>`), **When** the domain's data references Core types that exist in hr-kit's Core schema, **Then** all references resolve and the validator exits clean.

### User Story 2 - Contributor adds a new attribute without touching kit-validator (Priority: P1)

A contributor adds a new HR-specific attribute to hr-kit's schema (for example, `licensureState` on Candidate to support healthcare placements per the Keystone Recruiting industry sketch). They update `schema/core/schema-attributes.json` and add the new attribute name to `tools/lib/constants.js` ATTR_NAME_MAP if it requires non-default Title Case rendering. They do NOT touch any file inside `node_modules/@ovoco/kit-validator/`. They run the validator and get a clean result.

**Why this priority**: Kit-Specific configuration (LOAD_PRIORITY, NESTED_TYPES, ATTR_NAME_MAP) is the boundary that lets hr-kit evolve without forking the validator. If a contributor has to edit the validator to add an attribute, the integration has failed on its core promise (kit-validator is "kit-agnostic" per its constitution).

**Independent Test**: A contributor adds a new attribute to schema-attributes.json plus a corresponding ATTR_NAME_MAP entry, runs the validator, and gets a clean result. They never touch any file under `node_modules/@ovoco/kit-validator/`. They never modify rule logic, casing checks, or reference resolution code anywhere in hr-kit.

**Acceptance Scenarios**:

1. **Given** hr-kit's schema before the change, **When** a contributor adds a new attribute and a corresponding ATTR_NAME_MAP entry, **Then** the validator passes.
2. **Given** a search across the hr-kit tree for rule logic (casing regex, reference resolution, LOAD_PRIORITY traversal), **When** the search runs after the change, **Then** zero matches appear outside `node_modules/@ovoco/kit-validator/` and outside `tools/lib/constants.js` (which holds constants, not logic).
3. **Given** an upgrade to kit-validator that adds a new rule (e.g., a stricter casing check), **When** the maintainer bumps the git URL ref and reruns the validator, **Then** the new rule fires against hr-kit's schema without any other changes to hr-kit.

### User Story 3 - Maintainer upgrades kit-validator with a single deliberate edit (Priority: P2)

When kit-validator publishes 0.2.0 (a new MINOR with additive rules), the hr-kit maintainer updates one line in `package.json` (the git URL ref tag), runs `npm install`, and reruns the validator. They review whatever new errors or warnings the new rules produce, and either fix the schema or, if the new rules require it, file a kit-validator issue. MAJOR bumps follow the same workflow but trigger a known reworked-entry-point procedure: kit-validator's deprecation cycle gives the hr-kit maintainer one MINOR's notice before the contract changes.

**Why this priority**: Upgrade discipline is the test of whether the integration is actually thin. If upgrading kit-validator requires editing files beyond `package.json` and `tools/validate.js`, the integration has gained mass and the constitutional separation has broken down.

**Independent Test**: For a MINOR upgrade, the only file changed is `package.json`. For a MAJOR upgrade, the only files changed are `package.json` and `tools/validate.js` (entry point reshaping for the new config surface). No other file in the hr-kit tree is touched.

**Acceptance Scenarios**:

1. **Given** kit-validator at v0.1.0 wired into hr-kit, **When** kit-validator publishes v0.2.0 with additive rules, **Then** the hr-kit upgrade PR contains a single one-line change to `package.json`.
2. **Given** kit-validator at v0.x.y wired into hr-kit, **When** kit-validator publishes v1.0.0 with a renamed config key (e.g., `loadPriority` to `loadOrder`), **Then** the hr-kit upgrade PR contains exactly two file changes: the package.json ref bump and the entry-point key rename in tools/validate.js. No changes to `tools/lib/constants.js` (constants names are hr-kit's choice) or anywhere else.

### Edge Cases

- The git URL ref in package.json points to a tag that does not exist (typo, deleted tag, network outage). `npm install` MUST fail clearly. hr-kit's tools/validate.js does not need to detect this; npm and Node's resolution handle it.
- A domain directory references a Core type that is not in hr-kit's Core schema. kit-validator should report the reference as unresolved at validation time. hr-kit's integration does not invent additional logic to detect this.
- hr-kit's `tools/lib/constants.js` is missing a type that exists in `schema/core/schema-structure.json`. kit-validator's LOAD_PRIORITY completeness rule fires. The integration surfaces the warning unmodified.
- kit-validator publishes a new MAJOR version that adds a required config key. hr-kit's existing tools/validate.js continues to work against the previous MAJOR until the maintainer deliberately bumps. The package.json pin is the safety mechanism.
- kit-validator's network repo is unreachable during a CI run. CI should have already installed the dependency from a lockfile or cached module, so validation runs offline. The integration MUST NOT make any network call at validation time.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: hr-kit MUST expose a single validator entry point at `tools/validate.js`, invokable as `node tools/validate.js --schema schema/core` and `node tools/validate.js --schema schema/domains/<domain>`.
- **FR-002**: `tools/validate.js` MUST import the `validate` function from `@ovoco/kit-validator`, call it with hr-kit-specific configuration, and exit with the integer exit code returned by the call.
- **FR-003**: hr-kit MUST expose its kit-specific configuration in `tools/lib/constants.js`, exporting at minimum `LOAD_PRIORITY`, `NESTED_TYPES`, and `ATTR_NAME_MAP`. Additional keys (e.g., `PERSONNEL_TYPES`) MUST be added if and when kit-validator's frozen 0.1.0 surface requires them.
- **FR-004**: `package.json` MUST declare `@ovoco/kit-validator` as a dependency via git URL pinned to a specific tagged release. The initial pin is `git+https://github.com/ovoco-co/kit-validator.git#v0.1.0`. Version bumps MUST be deliberate single-line edits to the ref tag.
- **FR-005**: `tools/validate.js` MUST contain no rule logic, no casing regex, no reference-resolution traversal, no LOAD_PRIORITY traversal, and no schema-file parsing logic. Its only responsibilities are: import, load constants, call validate, exit.
- **FR-006**: Running the validator against a constitutionally clean hr-kit Core schema and example data set MUST report zero errors and zero warnings.
- **FR-007**: The validator entry point MUST exit with non-zero status when kit-validator reports any error.
- **FR-008**: The validator entry point MUST surface kit-validator's error and warning output to the user without modification, filtering, or relabeling. Adapters that customize output belong elsewhere if anywhere; the constitutional gate is unmediated.
- **FR-009**: hr-kit MUST NOT define rule logic, casing checks, or reference-resolution logic in any file outside the consumed kit-validator package. A grep of the hr-kit tree (excluding `node_modules/`) for such logic MUST return zero matches.
- **FR-010**: When kit-validator publishes a new MINOR release with additive rules, the hr-kit upgrade MUST be a single one-line change to `package.json`. When kit-validator publishes a new MAJOR release with surface changes, the hr-kit upgrade MUST be no more than two file changes (`package.json` and `tools/validate.js`).
- **FR-011**: `tools/lib/constants.js` MUST list every type in hr-kit's `schema-structure.json` in `LOAD_PRIORITY` in dependency order. This is enforced by kit-validator and is also a Core HR schema spec rule (FR-012 of 001).
- **FR-012**: The validator MUST run without internet access at validation time. The kit-validator dependency is resolved at install time and MUST NOT be re-fetched per run.
- **FR-013**: This integration SHALL satisfy the validator obligation referenced by FR-013 of the Core HR schema spec (001). When 002 ships and 001 unparks, the Core HR schema spec's FR-013 acceptance scenarios MUST pass against this integration.
- **FR-014**: Any rule logic, error or warning record shape, or CLI flag specification beyond hr-kit's needs is owned by kit-validator and is explicitly out of scope for this feature. Changes proposed to those concerns MUST be filed against kit-validator, not against hr-kit.
- **FR-015**: This feature MUST NOT ship a CI workflow file (e.g., `.github/workflows/validate.yml`) or any other CI configuration. Wiring the validator into CI is a separate concern, deferred to a future micro-feature. The validator command remains runnable manually and from any CI configuration the maintainer chooses to add later.
- **FR-016**: This feature MUST NOT ship a pre-commit hook (Husky-managed, plain git hook, or any other mechanism). Hook installation is a separate concern, deferred to a future micro-feature. The constitution's "Validate before committing" guidance remains contributor discipline at v0.1.0 of the integration.

### Key Entities

- **Validator entry point** (`tools/validate.js`): The thin shell script. Responsible for: importing the validate function, loading hr-kit constants, calling validate with the right config, and exiting with the returned exit code. Approximately ten lines.
- **Kit constants** (`tools/lib/constants.js`): hr-kit-specific configuration consumed by kit-validator. Holds LOAD_PRIORITY (array of type names in dependency order), NESTED_TYPES (list of types using the wrapped data format), ATTR_NAME_MAP (camelCase to Title Case overrides for HR-specific attributes), and any additional keys kit-validator's 0.1.0 surface requires.
- **kit-validator dependency**: External package consumed via git URL in `package.json`. Owns rule logic, error and warning record shapes, CLI flag definitions, and the function-API surface. Maintained at https://github.com/ovoco-co/kit-validator.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A maintainer can validate hr-kit's Core schema with a single shell command and receive a result in under 5 seconds on a development laptop.
- **SC-002**: `tools/validate.js` source is at most 20 lines (including imports and shebang). The thin-entry-point promise is verifiable by `wc -l tools/validate.js`.
- **SC-003**: When kit-validator publishes a new MINOR release that adds rules, the hr-kit upgrade PR diff is a single one-line change. Verifiable by inspecting the PR diff.
- **SC-004**: A new contributor can read `tools/validate.js` and `tools/lib/constants.js` together and understand the integration in under 5 minutes, without reading kit-validator's internals.
- **SC-005**: A grep of the hr-kit tree (excluding `node_modules/`) for casing regex (e.g., `/^[a-z][a-zA-Z0-9]*$/`), reference resolution code, or LOAD_PRIORITY traversal returns zero matches outside `tools/lib/constants.js`. Verifiable in CI with a static check.
- **SC-006**: When the Core HR schema spec (001) unparks and runs to implementation, its FR-013 acceptance scenarios all pass without any change to this integration.

## Assumptions

- kit-validator 0.1.0 will export a `validate(config)` function that returns `{ errors, warnings, exitCode }` (or a strict superset). The hr-kit entry point uses `result.exitCode` directly.
- The 0.1.0 config surface will accept at minimum: `schemaDir`, `loadPriority`, `nestedTypes`, `attrNameMap`. It will likely also accept `domainDirs` (or a singular `domainDir`) and possibly `personnelTypes`, but those keys are not yet frozen. hr-kit's spec defers final config-key naming to the moment kit-validator's spec ratifies its 0.1.0 surface.
- The README usage sketch in kit-validator's repo is approximate, not authoritative. The authoritative surface will be defined by kit-validator's own `/speckit.specify`, `/speckit.clarify`, and `/speckit.plan` outputs.
- kit-validator will publish tagged releases on GitHub (`v0.1.0`, `v0.2.0`, etc.) consumable via npm git URL with `#tag` syntax.
- hr-kit's schema directory layout follows the constitution: `schema/core/` for Core, `schema/domains/<domain>/` for each domain.
- hr-kit's `package.json` will gain a single `dependencies` entry for `@ovoco/kit-validator`. No other npm packages are introduced by this feature.
- A working development environment has Node.js 18 or newer (matches hr-kit's and kit-validator's stated `engines.node`).

## Dependencies

- hr-kit Constitution v1.0.0 (ratified 2026-04-24). Schema Integrity (Principle III) is the constitutional rule the validator enforces.
- 001-core-hr-schema spec (parked, awaiting external review). FR-013 of that spec mandates a validator that catches FR-008 through FR-012 violations. This integration discharges that obligation.
- `@ovoco/kit-validator` external package, tracked at https://github.com/ovoco-co/kit-validator. Ships its rule logic and surface contract. Implementation of this feature blocks on kit-validator publishing 0.1.0; spec, plan, and tasks phases proceed in parallel.
- hr-kit's `schema/core/` scaffold (currently empty). Implementation cannot demonstrate "passes against a clean schema" until at least one type lands in `schema-structure.json` and `schema-attributes.json`. Spec, plan, and tasks phases do not depend on schema content.
