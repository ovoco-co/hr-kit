// hr-kit kit-specific configuration consumed by @ovoco/kit-validator.
// Pure data: no functions, no imports, no rule logic.
// Per FR-003 of specs/002-schema-validator-integration/spec.md.
//
// LOAD_PRIORITY lists every importable Core type in dependency order:
// referenced types appear before types that reference them. Per FR-012 of
// specs/001-core-hr-schema/spec.md and Constitution III.
//
// To verify hr-kit holds no rule logic outside this file (per SC-005, FR-009):
//   grep -rnE '\^\[a-z\]\[a-zA-Z|\^\[A-Z\]\[a-zA-Z|attribute\.casing|data\.reference\.unresolved' \
//     /home/admin1/ovoco/hr-kit/ \
//     --exclude-dir=node_modules --exclude-dir=specs --exclude-dir=.git
// Expected: zero matches outside this file (and zero matches inside this file
// once the patterns are not embedded in this comment block).

const LOAD_PRIORITY = [
  // Lookups first (no internal dependencies)
  'Source Channel',
  'Employment Type',
  'Application Outcome',
  'Requisition Status',
  'Placement Status',
  // Stage (referenced by Application; no internal dependencies)
  'Stage',
  // Client (referenced by Job Requisition and Placement)
  'Client',
  // Job Requisition (references Client, Employment Type, Requisition Status)
  'Job Requisition',
  // Candidate (references Source Channel)
  'Candidate',
  // Application (references Candidate, Job Requisition, Stage, Source Channel, Application Outcome)
  'Application',
  // Placement (references Candidate, Job Requisition, Client, Application, Placement Status)
  'Placement',
];

const NESTED_TYPES = [];

const ATTR_NAME_MAP = {};

module.exports = { LOAD_PRIORITY, NESTED_TYPES, ATTR_NAME_MAP };
