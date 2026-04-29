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
