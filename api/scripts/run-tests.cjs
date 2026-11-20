const { readdirSync } = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..');
const testsRoot = path.join(projectRoot, 'tests');

const collectTests = (directory) => readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectTests(fullPath);
    return entry.isFile() && entry.name.endsWith('.test.ts') ? [fullPath] : [];
  });

const testFiles = collectTests(testsRoot).sort();
if (testFiles.length === 0) {
  console.error('No *.test.ts files were found under api/tests.');
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ['-r', 'ts-node/register', '--test', ...testFiles],
  { cwd: projectRoot, stdio: 'inherit' },
);

if (result.error) {
  console.error('Could not start the Node test runner:', result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
