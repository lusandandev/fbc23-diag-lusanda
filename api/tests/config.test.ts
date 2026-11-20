import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../src/config';

test('configuration gives an actionable JWT_SECRET error and applies documented defaults', () => {
  assert.throws(
    () => loadConfig({ NODE_ENV: 'test' }),
    /JWT_SECRET is required\. From the api folder, copy \.env\.example to \.env and set a private secret\./,
  );

  const config = loadConfig({ JWT_SECRET: 'test-secret', NODE_ENV: 'test' });
  assert.equal(config.port, 3001);
  assert.equal(config.webOrigin, 'http://localhost:3000');
  assert.equal(config.nodeEnv, 'test');
  assert.ok(config.databasePath.endsWith('/api/dev.db') || config.databasePath.endsWith('/dev.db'));
});
