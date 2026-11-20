import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LoginSchema } from '../src/schemas/auth.schema';

test('login schema accepts valid credentials and returns useful 400 validation messages for invalid credentials', () => {
  assert.equal(LoginSchema.safeParse({ email: 'user@example.com', password: 'secret' }).success, true);

  const missing = LoginSchema.safeParse({});
  const empty = LoginSchema.safeParse({ email: '', password: '' });
  const wrongType = LoginSchema.safeParse({ email: 12, password: false });

  assert.equal(missing.success, false);
  assert.equal(empty.success, false);
  assert.equal(wrongType.success, false);

  if (!missing.success) {
    assert.match(missing.error.issues.map((issue: { message: string }) => issue.message).join(' '), /Email is required and must be a string|Password is required and must be a string/);
  }
  if (!empty.success) {
    assert.deepEqual(empty.error.issues.map((issue: { message: string }) => issue.message), ['Email is required', 'Password is required']);
  }
});
