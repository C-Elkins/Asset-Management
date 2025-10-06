#!/usr/bin/env node
// Guard to keep dark mode scoped to the app only.
// Fails the build if forbidden global selectors are found.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), 'src');
const FORBIDDEN = [
  'body.dark-mode',
  'html.dark-mode',
  'html.dark-mode body'
];

/** Recursively collect .css files under a directory */
function collectCssFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectCssFiles(full, out);
    else if (entry.isFile() && entry.name.endsWith('.css')) out.push(full);
  }
  return out;
}

function scanFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const hits = [];
  for (const pat of FORBIDDEN) {
    if (text.includes(pat)) hits.push(pat);
  }
  return hits.length ? { file, hits } : null;
}

const files = collectCssFiles(ROOT);
const problems = files.map(scanFile).filter(Boolean);

if (problems.length) {
  console.error('\n[dark-mode-scope-guard] Forbidden global selectors detected:');
  for (const p of problems) {
    console.error(` - ${p.file}`);
    for (const h of p.hits) console.error(`    contains: ${h}`);
  }
  console.error('\nPlease scope dark mode to #app-root only, e.g.:');
  console.error("  #app-root.dark-mode { /* ... */ }");
  process.exit(1);
} else {
  console.log('[dark-mode-scope-guard] Passed: no forbidden selectors found.');
}
