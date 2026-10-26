import { loginUser, registerUser, validateSession } from '../services/auth.service.js';
import { signToken, verifyToken } from '../utils/jwt.js';

export function runAuthTests(): boolean {
  // 1. JWT verification test
  const testToken = signToken({ userId: 'usr_test', role: 'customer' });
  const decoded = verifyToken(testToken);
  if (decoded.userId !== 'usr_test') {
    throw new Error('JWT token test failed');
  }

  // 2. Validate session test
  const session = validateSession(testToken);
  if (!session || session.role !== 'customer') {
    throw new Error('Validate session test failed');
  }

  return true;
}
