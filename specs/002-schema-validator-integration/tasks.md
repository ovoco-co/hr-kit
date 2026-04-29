---

description: "Task list for Schema Validator Integration"
---

# Tasks: Schema Validator Integration

**Input**: Design documents from `/specs/002-schema-validator-integration/`
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/kit-validator-surface.md`, `quickstart.md`

**Tests**: Tests are NOT requested in the spec. Only verification tasks against acceptance scenarios and success criteria are included.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified independently. The integration is unusually thin (three file edits plus verifications); each user story is small.

## External gates

Two gates apply to nearly every implementation task. Tasks may be written and reviewed at any time, but execution waits for the relevant gate.

- **Gate A**: kit-validator publishes `v0.1.0` at https://github.com/ovoco-co/kit-validator. Until then, `npm install` cannot fetch the dependency. Most build tasks are gated on A.
- **Gate B**: 001-core-hr-schema's schema content lands (types in `schema/core/schema-structure.json` and `schema/core/schema-attributes.json`, plus example data files). Verification tasks that depend on a populated schema are gated on B.

Tasks below are annotated with `(Gate A)` or `(Gate A+B)` when they depend on these. Tasks with no gate annotation can be executed immediately.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other [P] tasks in the same phase (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3) for tasks in user-story phases
- File paths are absolute

## Path Conventions

- hr-kit project root: `/home/admin1/ovoco/hr-kit/`
- All paths in tasks are absolute under this root.

## Phase 1: Setup

No setup tasks. The repository scaffold is complete (Node 18+ engines declared, `tools/lib/` directory exists, `package.json` present). Skip directly to Phase 2.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the integration scaffolding that all user stories build on.

- [X] T001 Add `@ovoco/kit-validator` to the `dependencies` field of `/home/admin1/ovoco/hr-kit/package.json`, pinned via git URL: `"@ovoco/kit-validator": "git+https://github.com/ovoco-co/kit-validator.git#v0.1.0"`. Single one-line addition. (Per FR-004.)

**Checkpoint**: Foundation ready. User-story phases can begin.

## Phase 3: User Story 1 - Maintainer validates hr-kit's schema with one command (Priority: P1) MVP

**Goal**: Deliver the validator command. Maintainer runs `node tools/validate.js --schema schema/core` and gets either zero errors and zero warnings or a precise list of what is wrong.

**Independent Test**: From a fresh clone of hr-kit (post-Gate-A), `npm install` followed by `node tools/validate.js --schema schema/core` produces a clean exit on a known-good schema and a non-zero exit with a precise message on a deliberately broken one. No kit-validator-specific knowledge required to interpret either result. (Per spec User Story 1.)

### Implementation for User Story 1

- [X] T002 [P] [US1] Create `/home/admin1/ovoco/hr-kit/tools/lib/constants.js` exporting three constants: `LOAD_PRIORITY` (initially empty array, populated as 001 schema content lands), `NESTED_TYPES` (initially empty array, likely `['Person']` once Person type lands), `ATTR_NAME_MAP` (initially empty object, populated as attributes are added that need non-default Title Case rendering). Add a top-of-file comment naming the file's purpose ("kit-specific configuration consumed by @ovoco/kit-validator") and citing FR-003 of the spec. Pure data: no functions, no imports, no logic. (Per FR-003, data-model.md.)
- [X] T003 [P] [US1] Create `/home/admin1/ovoco/hr-kit/tools/validate.js` entry point. ≤20 lines including shebang. Imports: `validate` from `@ovoco/kit-validator`, and `LOAD_PRIORITY`, `NESTED_TYPES`, `ATTR_NAME_MAP` from `./lib/constants`. Parse `--schema <dir>` from `process.argv` (default `schema/core` if absent). Call `validate({ schemaDir, loadPriority: LOAD_PRIORITY, nestedTypes: NESTED_TYPES, attrNameMap: ATTR_NAME_MAP })`. Exit with `result.exitCode`. No rule logic, no casing regex, no reference-resolution traversal. (Per FR-001, FR-002, FR-005, FR-007, FR-008, data-model.md.) Implementation: 14 lines.
- [ ] T004 [US1] Run `npm install` from `/home/admin1/ovoco/hr-kit/`. Verify `@ovoco/kit-validator` resolves and installs into `node_modules/`. (Gate A: BLOCKED on kit-validator v0.1.0 publishing.)
- [ ] T005 [US1] Run `node /home/admin1/ovoco/hr-kit/tools/validate.js --schema /home/admin1/ovoco/hr-kit/schema/core` against the populated schema. Confirm exit 0 and zero errors and zero warnings (per FR-006). If kit-validator's empty-schema behavior on the as-yet-incomplete scaffold is to warn or error, refer to kit-validator's docs; this task verifies the rule outcome on a *populated* schema. (Gate A+B: BLOCKED on kit-validator v0.1.0 AND 001 schema content landing.)

**Checkpoint**: User Story 1 acceptance scenarios 1, 2, 3 are independently testable from this point. The MVP is delivered.

## Phase 4: User Story 2 - Contributor adds a new attribute without touching kit-validator (Priority: P1)

**Goal**: Verify the property that contributors can extend hr-kit's schema and constants without modifying kit-validator code.

**Independent Test**: A grep across `/home/admin1/ovoco/hr-kit/` (excluding `node_modules/` and `specs/`) for casing regex, reference-resolution code, or LOAD_PRIORITY traversal returns zero matches outside `tools/lib/constants.js` (which holds constants only). (Per spec User Story 2 acceptance scenario 2 and SC-005.)

### Implementation for User Story 2

- [X] T006 [US2] Run the no-rule-logic verification grep against `/home/admin1/ovoco/hr-kit/`: search for casing regex patterns (e.g., `/\^\[a-z\]\[a-zA-Z0-9\]\*\$/`), reference-resolution patterns (e.g., references to `Name` matching, exact-name lookup), and LOAD_PRIORITY iteration patterns. Exclude `node_modules/`, `specs/`, and `.git/`. Confirm zero matches outside `/home/admin1/ovoco/hr-kit/tools/lib/constants.js`. Document the exact grep invocation in a comment at the top of `tools/lib/constants.js` so future contributors can rerun it. (Per FR-009, SC-005.) Verified: zero rule-logic matches in code files; LOAD_PRIORITY appears only in tools/lib/constants.js (declaration) and tools/validate.js (require + pass-through, not traversal). One markdown-prose mention in docs/background/current-status.md is the noun "LOAD_PRIORITY" in a sentence, not code, and is therefore not rule logic.

**Checkpoint**: User Story 2's invariant is independently verifiable. No further tasks needed for this story; the property is preserved by US1's implementation discipline.

## Phase 5: User Story 3 - Maintainer upgrades kit-validator with a single deliberate edit (Priority: P2)

**Goal**: Verify the upgrade procedure produces the expected diff size on real kit-validator releases.

**Independent Test**: When kit-validator publishes its first MINOR (v0.2.0) post-launch, the hr-kit upgrade PR contains a single one-line edit to `package.json`. When a future MAJOR (e.g., v1.0.0) ships, the upgrade contains at most two file changes: `package.json` and `tools/validate.js`. (Per spec User Story 3.)

### Implementation for User Story 3

- [ ] T007 [P] [US3] When kit-validator publishes `v0.2.0` (gated externally), update `/home/admin1/ovoco/hr-kit/package.json` by changing the ref tag from `#v0.1.0` to `#v0.2.0`. Run `npm install`. Run the validator. Confirm: diff is exactly one line, validator continues to function (any new errors or warnings caused by additive rules are addressed in a follow-up commit, not by reverting the bump). Captures evidence for SC-003 and User Story 3 acceptance scenario 1. (Gate: BLOCKED on kit-validator v0.2.0 publishing.)

**Checkpoint**: User Story 3 verified for the MINOR-bump path. The MAJOR-bump path repeats the procedure with the additional entry-point edit when needed.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verifications that confirm the integration meets the spec's measurable success criteria.

- [X] T008 [P] Verify SC-002: run `wc -l /home/admin1/ovoco/hr-kit/tools/validate.js`. Confirm output is at most 20. If the entry point grew past 20 lines during implementation, refactor toward `kit-validator`'s function API (the line count is a structural test of the "thin integration" promise). Depends on T003. Result: 14 lines.
- [ ] T009 Smoke-run the quickstart end-to-end: follow every step in `/home/admin1/ovoco/hr-kit/specs/002-schema-validator-integration/quickstart.md` (Install → Run the validator → Common workflows). Confirm steps work as documented. Update quickstart if any step is wrong. (Gate A+B: BLOCKED on kit-validator v0.1.0 AND 001 schema content landing; depends on Phases 2 through 5.)

## Dependencies and Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: skipped, no tasks.
- **Foundational (Phase 2)**: T001 has no internal dependencies. Gated by Gate A only when T004 (npm install) runs.
- **User Story 1 (Phase 3)**: T002 and T003 depend on no other tasks (different files). T004 depends on T001 plus Gate A. T005 depends on T002, T003, T004 plus Gate A+B.
- **User Story 2 (Phase 4)**: T006 depends on T002 and T003 having been written (so the grep checks the actual files in their target shape).
- **User Story 3 (Phase 5)**: T007 depends on T001-T005 plus the external publication of kit-validator v0.2.0.
- **Polish (Phase 6)**: T008 depends on T003. T009 depends on Phases 2-5.

### Within Each User Story

- US1: T002 and T003 in parallel; then T004 (after Gate A); then T005 (after Gate A+B).
- US2: T006 single-task.
- US3: T007 single-task, externally gated.

### Parallel Opportunities

- T002 and T003 (different files in `tools/`) run in parallel within US1.
- T006 (US2) and T007 (US3) are independent of each other and of T008 (Polish); could run in parallel once their respective gates are met.
- T008 (Polish wc -l check) is independent of T009 (Polish smoke-run); both can be run together at the end.

## Parallel Example: User Story 1 Implementation

```bash
# Within Phase 3, kick off the two file-creation tasks in parallel:
Task: "Create /home/admin1/ovoco/hr-kit/tools/lib/constants.js (T002)"
Task: "Create /home/admin1/ovoco/hr-kit/tools/validate.js (T003)"
```

## Implementation Strategy

### MVP (User Story 1 only)

1. Phase 2: T001.
2. Phase 3: T002, T003 (parallel) → T004 (Gate A) → T005 (Gate A+B).
3. STOP and validate: schema validates clean, exits 0. Demo the maintainer-validates-with-one-command workflow.

The MVP is the entire feature for most consumers. US2 and US3 are property/operational verifications, not new functionality.

### Incremental Delivery

1. Foundation + US1 → MVP shipped. Validator works.
2. US2 → no-rule-logic property verified. Confirms the constitutional separation holds in practice.
3. US3 → first real upgrade exercise when kit-validator v0.2.0 ships. Confirms the upgrade procedure scales.
4. Polish → SC-002 (line count) and SC-004 (legibility) checks; quickstart smoke-run.

### Notes on Gating

The implementation is gated on two external dependencies (kit-validator v0.1.0 and 001 schema content). Tasks T002 and T003 can proceed at any time because they create local files. T001 can proceed at any time because it edits `package.json` (the install is what's gated). Verification tasks (T005, T009) require both gates open. The task list is frozen now; execution will be straightforward whenever the gates open in any order.
