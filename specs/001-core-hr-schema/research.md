# Phase 0 Research: Core HR Schema

## Scope

No NEEDS CLARIFICATION items in the plan's Technical Context. This research consolidates the design decisions that shape Phase 1 and that future readers benefit from finding in one place.

## Decisions

### Decision: JSON file format follows cmdb-kit's two-file pattern (schema-structure + schema-attributes)

- **Decision**: Core ships two top-level JSON files: `schema-structure.json` (an array of type-definition objects, each with `name`, optional `parent`, and `description`) and `schema-attributes.json` (a map from type name to its attribute definitions). Per-type data lives in `data/<kebab-case-type-name>.json`. This mirrors cmdb-kit's existing format, which `@ovoco/kit-validator` is built to consume.
- **Rationale**: kit-validator's surface (per its README and the contract documented in 002) expects this structure. Reusing it eliminates an entire integration risk and lets the same validator serve hr-kit and cmdb-kit uniformly. The format is also what the `survey` of cmdb-kit confirmed earlier in the project (see kit-validator/CLAUDE.md and cmdb-kit/schema/core/).
- **Alternatives considered**:
  - YAML schema files. More readable for some, but kit-validator's loaders read JSON, and adding a YAML translation layer is complexity for no benefit. Rejected.
  - Inline data inside schema-structure.json. Bundles structure with content; harder to grep and harder to keep stable across firms with different example datasets. Rejected.
  - JSON Schema (the IETF standard) for the structure file. Overkill for a starter kit and orthogonal to the validator's rule set. Rejected.

### Decision: Stage is a single pipeline-position vocabulary across Keystone (no per-firm pipeline trees)

- **Decision**: Core ships a single Stage type with a flat list of pipeline-position values (Sourced, Screened, Interviewing, Offer). FR-003a forbids terminal outcomes (Placed, Rejected, Withdrawn, Expired) from appearing as Stage values; those live on `Application.outcome`. Firms that maintain different pipeline names would extend the Stage data file; Stage itself is not parameterized by firm.
- **Rationale**: Keeps the schema legible. A "pipeline per firm" model would require Stage to reference Client (or some firm-specific scope), which would couple Stage to Client in a way that complicates Application.currentStage. The single flat list is the simplest model that exercises the candidate-journey-centric principle.
- **Alternatives considered**:
  - Per-firm pipeline definitions where Stage references Client. Adds complexity beyond what Keystone needs and ties Stage's lifecycle to Client's. Rejected.
  - Tree-structured pipeline (Stage has parent). cmdb-kit uses parent-child for type hierarchies; for Stage, hierarchy isn't needed and would obscure the linear pipeline reading. Rejected.

### Decision: Application.stageHistory is an inline array, not a separate type

- **Decision**: Application carries an inline `stageHistory` array of `{stage, enteredAt}` entries plus a `currentStage` reference. There is no top-level StageTransition type.
- **Rationale**: This is one of the four ratified clarifications (Q2 from the clarify session, confirmed by Geoff 2026-04-29). It matches the candidate-journey-centric principle (history belongs to the journey, not a free-floating event log) and keeps the schema small. Validator-side support: kit-validator's data file loader handles inline arrays natively per cmdb-kit precedent.
- **Alternatives considered** (already considered and rejected during clarify):
  - Separate StageTransition top-level type. Cleaner architecturally but adds a type to maintain and triples example-data record count.
  - Application carries only `currentStage`; transition history out of Core. Loses reconstructability, fails FR-007.
  - Inline with richer entries (`exitedAt`, `actor`). More information but heavier for a starter kit.

### Decision: Outcome is on Application; Placement existence is derived

- **Decision**: Application has an `outcome` lookup field with values {Active, Placed, Rejected, Withdrawn, Expired}. A Placement record MUST exist if and only if `outcome = Placed`. The validator (kit-validator, configured via 002) flags any Application with `outcome = Placed` that has no matching Placement, and any Placement whose Application has `outcome` other than Placed.
- **Rationale**: One of the four ratified clarifications (Q3 from clarify, confirmed by Geoff). Cleanly separates "where in the pipeline" (Stage) from "what was the final outcome" (Application.outcome) from "the success record" (Placement). Adapters that combine these concepts on their target platform map them at the adapter layer, not in Core.
- **Alternatives considered** (already considered during clarify):
  - Stage includes terminal states; no separate outcome field. Loses platform-agnosticism.
  - Outcome inferred from Placement presence/absence. Simpler but undertestable; cannot represent "Rejected" vs "Withdrawn" vs "Expired" distinctions.

### Decision: Candidate identity is email-primary with a name-plus-phone fallback

- **Decision**: Email is the canonical natural key for Candidate dedup, compared case-insensitively. When email is missing, the combination of full name plus primary phone number is the fallback. Adapters SHOULD respect this rule.
- **Rationale**: One of the four ratified clarifications (Q1, confirmed by Geoff). Email is industry-standard candidate identity; the fallback handles walk-ins and referral flows where email is absent at first contact.
- **Alternatives considered** (already considered during clarify):
  - Email alone (no fallback). Simpler but breaks for legitimate edge cases.
  - Kit-assigned `candidateId` (no natural-key rule). Punts the dedup problem to each adapter.

### Decision: Lookup types ship with v0.1.0 of Core, not deferred

- **Decision**: Core ships five lookup types alongside the six entity types: Source Channel, Employment Type, Application Outcome, Requisition Status, Placement Status. These are the lookups that the six entities directly reference. Lookups specific to specialized concerns (background-check vendors, onboarding document types, commission plans) are out of scope and live in future domain packages.
- **Rationale**: FR-002 mandates that Core define every lookup it references. Deferring lookups to a "lookups domain" would create a circular Core-domain dependency that violates Constitution V (Core MUST NOT reference domain types). Lookups are part of Core because Core entities reference them.
- **Alternatives considered**:
  - Lookups in a "shared lookups" domain. Violates Core+Domains principle.
  - Lookups inlined as enums in schema-attributes.json (no separate type). Would force the validator's reference resolution to special-case enums; cleaner to treat lookups as first-class types.

### Decision: Validator integration is consumed from 002, not reinvented

- **Decision**: hr-kit Core does not ship its own validator. Validation runs through `tools/validate.js` and `tools/lib/constants.js` from 002-schema-validator-integration, which consumes `@ovoco/kit-validator`. Core's responsibility is to populate `tools/lib/constants.js` LOAD_PRIORITY, NESTED_TYPES, and ATTR_NAME_MAP with hr-kit's types as they land.
- **Rationale**: The validator decision was made in 002 (separate public repo, function-API surface, MIT licensed). Reinventing here would duplicate effort and break the kit-pattern alignment between cmdb-kit and hr-kit. The Schema Integrity principle is enforced by tooling that two kits share.
- **Alternatives considered**:
  - Inline a small validator inside hr-kit's tools/. Duplicates kit-validator's rule set; rejected by 002's architecture decision.
  - Skip the validator and rely on review. Constitution III rules out: "Convention enforced by tooling is the only convention that survives."

## Open Industry-Flavor Items (Tracked, Not Blocking)

These do not block Phase 1 design. They affect the *content* of example records (which industry's job titles, which Source Channels, which licensure attributes show up), not the schema *shape*.

- Industry/vertical: Geoff has not yet picked from the Keystone industry sampler (`docs/background/keystone-industry-sampler.md`). Default for now: write the data-model and contracts industry-agnostic; defer industry-specific Candidate attributes (e.g., `licensureState`, `oshaCardNumber`) to the implementation phase when Geoff picks an industry.
- Engagement model (contingent vs retained vs executive search): also pending. Default: Core supports any of these without engagement-specific attributes; commission, retainer, and confidentiality concerns belong in domains.
- Compliance regime: pending. Default: out of scope for Core (Constitution V); compliance attributes live in a future domain.
- Priority domain after Core: pending. Default: not relevant to Core's plan.

## Open Coordination Items

- 002-schema-validator-integration must land before Core's implementation phase can demonstrate "validator passes clean". The two specs interlock: 002 provides the gate; Core supplies content for the gate to validate.
- kit-validator must publish v0.1.0 before 002's `npm install` step succeeds. Same blocker chain.
