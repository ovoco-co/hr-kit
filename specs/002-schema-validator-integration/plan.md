# Implementation Plan: Schema Validator Integration

**Branch**: `002-schema-validator-integration` | **Date**: 2026-04-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-schema-validator-integration/spec.md`

## Summary

hr-kit consumes the public `@ovoco/kit-validator` library via a single git URL pin in `package.json`, exposes a thin entry point at `tools/validate.js` that imports `validate(config)` and exits with `result.exitCode`, and supplies hr-kit-specific configuration through `tools/lib/constants.js` (LOAD_PRIORITY, NESTED_TYPES, ATTR_NAME_MAP, plus any additional keys the frozen 0.1.0 surface requires). All rule logic, output shapes, and CLI flag handling live in kit-validator. The integration discharges FR-013 of the parked Core HR schema spec.

The plan carves the work into two phases by external readiness: spec/plan/tasks artifacts can complete now against kit-validator's documented sketch, while implementation waits on kit-validator publishing v0.1.0 and on hr-kit's schema/core scaffold landing (which belongs to 001's implementation phase).

## Technical Context

**Language/Version**: Node.js 18+ (matches existing `package.json` engines field, matches kit-validator)
**Primary Dependencies**: `@ovoco/kit-validator` consumed via git URL pinned to `git+https://github.com/ovoco-co/kit-validator.git#v0.1.0`. No other dependencies introduced by this feature.
**Storage**: Local filesystem only. The validator reads `schema/core/` and `schema/domains/<domain>/` directories at validation time. No databases, no network calls at run time.
**Testing**: Smoke testing via direct CLI invocation against fixture schema directories. Unit testing of `tools/validate.js` is unnecessary because the entry point is a 4-call sequence (import, load constants, call validate, exit) with no branching logic of its own; rule-level testing is owned by kit-validator. Smoke fixtures live under a future `tests/fixtures/` if introduced; for v0.1.0 the validator is exercised end-to-end via the schema/core scaffold itself.
**Target Platform**: Cross-platform (Linux, macOS, Windows). Anywhere Node.js 18+ runs.
**Project Type**: CLI tool integration. hr-kit is a Node.js library/CLI starter kit; this feature is a thin shell over an external library.
**Performance Goals**: Validator run completes in under 5 seconds on a development laptop against a populated hr-kit Core schema (per SC-001). Performance is dominated by kit-validator; hr-kit's entry point overhead is negligible.
**Constraints**: Offline at validation time (FR-012). Single-line `package.json` edit for MINOR upgrades (FR-010). Two-file edit ceiling for MAJOR upgrades (FR-010). Entry point at most 20 lines of code (SC-002). No rule logic anywhere outside `node_modules/@ovoco/kit-validator/` (FR-009, SC-005).
**Scale/Scope**: hr-kit's Core schema (six core entity types plus lookup types per the parked 001 spec) and any future domains under `schema/domains/`. Order-of-magnitude small: the validator processes tens of types and hundreds of records when 001 lands, not thousands.

No NEEDS CLARIFICATION items. The three open variables flagged in spec Assumptions (final config-key names, PERSONNEL_TYPES presence, domainDir vs domainDirs) are deferred to kit-validator's frozen 0.1.0 surface and do not block planning.

## Constitution Check

GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.

Constitution v1.0.0 (ratified 2026-04-24). Each principle, evaluated against this feature:

- **I. Candidate-Journey-Centric Schema** — Not applicable. The validator integration adds no schema types. PASS.
- **II. Platform-Agnostic Design** — The integration is platform-agnostic by construction. Rule logic lives in `@ovoco/kit-validator`, which is itself kit-agnostic per its own constitution. hr-kit's constants module describes hr-kit's schema, not any target platform. PASS.
- **III. Schema Integrity** — This feature is the operational realization of Schema Integrity. The principle requires that "every schema change MUST validate clean (`node tools/validate.js --schema <dir>` returns 0 errors, 0 warnings)"; this feature delivers that command. PASS, satisfies.
- **IV. Layered Architecture** — Tooling sits adjacent to the three layers (schema, data, adapters) and does not couple them. The validator reads schema and data files but does not modify them, and adapters are not touched. PASS.
- **V. Core + Domains** — Not applicable. The integration treats Core and Domains uniformly via the `--schema` flag; it imposes no Core-references-Domain or Domain-references-Domain logic of its own. PASS.
- **VI. Example Data Tells a Story** — Not applicable. The integration is plumbing; the story belongs to 001's example data set. PASS.

**Quality Gates** (constitution): two gates apply directly:

- "Schema validates clean (0 errors, 0 warnings) before any merge" — the integration delivers this gate. PASS.
- "LOAD_PRIORITY includes every importable type in dependency order" — enforced by kit-validator at validation time, configured by hr-kit's `tools/lib/constants.js`. PASS, configurationally.

Constitution Check: PASS. No violations to justify in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-schema-validator-integration/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command, NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
hr-kit/
├── package.json                         # Modified: add @ovoco/kit-validator git URL dependency
├── tools/
│   ├── validate.js                      # New: thin entry point (about 10 lines)
│   └── lib/
│       └── constants.js                 # New: LOAD_PRIORITY, NESTED_TYPES, ATTR_NAME_MAP
├── schema/
│   ├── core/                            # Used by validator (schema content owned by 001)
│   └── domains/                         # Used by validator when domains exist
├── docs/
│   └── (no doc changes for this feature beyond background updates already on main)
└── (no other files changed)
```

**Structure Decision**: Single-project layout. hr-kit's existing scaffold already places tooling under `tools/` and `tools/lib/`; this feature populates two files inside that structure. No new top-level directories. No package extraction (the validator IS the package, consumed externally). No tests directory at v0.1.0 (smoke testing is end-to-end via the validator running against schema/core; if dedicated fixtures become useful later, they land at `tests/fixtures/` in a follow-on feature).

## Complexity Tracking

No violations. Section intentionally empty.
