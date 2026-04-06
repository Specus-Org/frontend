#!/usr/bin/env node

/**
 * Merge multiple OpenAPI 3.0 specs into a single spec file.
 *
 * - Combines paths from all specs
 * - Merges component schemas, deduplicating identical definitions
 * - Normalizes server-relative paths (e.g. auth.yaml uses `servers: [{url: /api/v1/auth}]`)
 *
 * Usage: node scripts/merge-specs.js
 * Output: ./openapi.yaml (merged spec for Hey API code generation)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PACKAGE_ROOT = join(__dirname, '..');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Load and parse a YAML spec file.
 */
function loadSpec(filename) {
  const filepath = join(PACKAGE_ROOT, 'specs', filename);
  const content = readFileSync(filepath, 'utf-8');
  return parse(content);
}

/**
 * Normalize paths from specs that use server-relative URLs.
 *
 * auth.yaml has `servers: [{url: /api/v1/auth}]` and paths like `/login`,
 * so the full path is `/api/v1/auth/login`.
 */
function normalizePaths(spec) {
  const paths = spec.paths || {};
  const servers = spec.servers || [];

  // Check if the server URL is a path prefix (not a full URL)
  let prefix = '';
  if (servers.length > 0) {
    const serverUrl = String(servers[0].url || '');
    if (serverUrl.startsWith('/')) {
      prefix = serverUrl.replace(/\/$/, '');
    }
  }

  if (!prefix) return { ...paths };

  const normalized = {};
  for (const [path, methods] of Object.entries(paths)) {
    normalized[prefix + path] = methods;
  }
  return normalized;
}

/**
 * Deep-equal comparison for schema objects.
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => deepEqual(a[k], b[k]));
}

// ---------------------------------------------------------------------------
// Main merge
// ---------------------------------------------------------------------------

const SPEC_FILES = [
  'openapi.yaml',       // health + screening
  'auth.yaml',          // customer auth
  'admin-auth.yaml',    // admin auth (local spec)
  'cms-admin.yaml',     // CMS admin CRUD
  'cms-public.yaml',    // CMS public read
];

console.log('Merging OpenAPI specs...');

const merged = {
  openapi: '3.0.3',
  info: {
    title: 'Specus API',
    version: '1.0.0',
    description:
      'Merged Specus API spec — health, screening, auth, admin auth, CMS admin, and CMS public endpoints.',
  },
  servers: [
    { url: 'http://localhost:8080', description: 'Local development server' },
  ],
  paths: {},
  components: { schemas: {} },
};

const specSources = {};

for (const file of SPEC_FILES) {
  console.log(`  Processing ${file}...`);
  const spec = loadSpec(file);

  // Merge paths
  const paths = normalizePaths(spec);
  for (const [path, methods] of Object.entries(paths)) {
    if (merged.paths[path]) {
      // Merge methods into existing path (e.g. GET + POST on same path)
      Object.assign(merged.paths[path], methods);
    } else {
      merged.paths[path] = methods;
    }
  }

  // Merge component schemas
  const schemas = (spec.components && spec.components.schemas) || {};
  for (const [name, schema] of Object.entries(schemas)) {
    if (merged.components.schemas[name]) {
      // Check if it's an identical duplicate (common across specs sharing types)
      if (!deepEqual(merged.components.schemas[name], schema)) {
        const existingSource = specSources[name];
        console.warn(
          `    WARNING: Schema "${name}" differs between ${existingSource} and ${file}. Keeping version from ${existingSource}.`
        );
      }
      // Skip duplicate (keep first definition)
    } else {
      merged.components.schemas[name] = schema;
      specSources[name] = file;
    }
  }
}

// Sort paths for readability
const sortedPaths = {};
for (const key of Object.keys(merged.paths).sort()) {
  sortedPaths[key] = merged.paths[key];
}
merged.paths = sortedPaths;

// Write merged spec
const outputPath = join(PACKAGE_ROOT, 'openapi.yaml');
const yamlContent = stringify(merged, {
  lineWidth: 120,
  singleQuote: false,
});
writeFileSync(outputPath, yamlContent, 'utf-8');

const pathCount = Object.keys(merged.paths).length;
const schemaCount = Object.keys(merged.components.schemas).length;
console.log(`\nMerged spec written to openapi.yaml`);
console.log(`  ${pathCount} paths, ${schemaCount} schemas`);
