#!/usr/bin/env node
const { validate, formatText, formatJson } = require('@ovoco/kit-validator');
const { LOAD_PRIORITY, NESTED_TYPES, ATTR_NAME_MAP } = require('./lib/constants');
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d; };
const result = validate({ schemaDir: arg('--schema', 'schema/core'), loadPriority: LOAD_PRIORITY, nestedTypes: NESTED_TYPES, attrNameMap: ATTR_NAME_MAP });
if (arg('--format', 'text') === 'json') {
  process.stdout.write(formatJson(result) + '\n');
} else {
  const out = formatText(result);
  for (const l of out.stdoutLines) process.stdout.write(l + '\n');
  for (const l of out.stderrLines) process.stderr.write(l + '\n');
}
process.exit(result.exitCode);
