import { test } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../src/errors';
import type { UserRecord, UserRepository } from '../src/repositories/interfaces';
import { AuthService } from '../src/services/auth.service';
import { JwtService } from '../src/services/jwt.service';

const secret = 'test-secret-that-is-long-enough-for-the-test-suite';
const user: UserRecord = {
  id: 17,
  email: 'user@example.com',
  password_hash: '',
  created_at: '2026-11-19 10:00:00',
};

test('AuthService issues a verifiable 24-hour user token for valid credentials', async () => {
  const passwordHash = await bcrypt.hash('correct-password', 4);
  const repository: UserRepository = { findByEmail: async () => ({ ...user, password_hash: passwordHash }) };
  const tokens = new JwtService(secret);
  const service = new AuthService(repository, tokens);

  const token = await service.login(user.email, 'correct-password');
  assert.equal(tokens.verifyUserToken(token), user.id);
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded !== 'object' || typeof decoded.exp !== 'number' || typeof decoded.iat !== 'number') {
    assert.fail('Expected JWT to contain numeric iat and exp claims');
  }
  assert.equal(decoded.exp - decoded.iat, 24 * 60 * 60);
});

test('unknown email and incorrect password produce the same 401 error', async () => {
  const passwordHash = await bcrypt.hash('correct-password', 4);
  const tokens = new JwtService(secret);
  const existingUserRepository: UserRepository = {
    findByEmail: async () => ({ ...user, password_hash: passwordHash }),
  };
  const missingUserRepository: UserRepository = { findByEmail: async () => undefined };

  const existingUserService = new AuthService(existingUserRepository, tokens);
  const missingUserService = new AuthService(missingUserRepository, tokens);

  const captureError = async (operation: Promise<string>) => {
    try {
      await operation;
      assert.fail('Expected login to fail');
    } catch (error) {
      assert.ok(error instanceof AppError);
      return { status: error.statusCode, message: error.message };
    }
  };

  const wrongPassword = await captureError(existingUserService.login(user.email, 'wrong-password'));
  const unknownEmail = await captureError(missingUserService.login('missing@example.com', 'wrong-password'));

  assert.deepEqual(wrongPassword, { status: 401, message: 'Invalid credentials' });
  assert.deepEqual(unknownEmail, wrongPassword);
});
