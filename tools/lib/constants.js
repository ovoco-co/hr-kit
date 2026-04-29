// hr-kit kit-specific configuration consumed by @ovoco/kit-validator.
// Pure data: no functions, no imports, no rule logic.
// Per FR-003 of specs/002-schema-validator-integration/spec.md.
//
// LOAD_PRIORITY, NESTED_TYPES, and ATTR_NAME_MAP are stubs at v0.1.0 of this
// integration. They populate as 001-core-hr-schema's content lands. The
// validator will flag the empty LOAD_PRIORITY against any non-empty
// schema-structure.json (per FR-011).
//
// To verify hr-kit holds no rule logic outside this file (per SC-005, FR-009):
//   grep -rnE '\^\[a-z\]\[a-zA-Z|\^\[A-Z\]\[a-zA-Z|attribute\.casing|data\.reference\.unresolved' \
//     /home/admin1/ovoco/hr-kit/ \
//     --exclude-dir=node_modules --exclude-dir=specs --exclude-dir=.git
// Expected: zero matches outside this file (and zero matches inside this file
// once the patterns are not embedded in this comment block).

const LOAD_PRIORITY = [];

const NESTED_TYPES = [];

const ATTR_NAME_MAP = {};

module.exports = { LOAD_PRIORITY, NESTED_TYPES, ATTR_NAME_MAP };
