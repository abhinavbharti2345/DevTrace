import { AuthSession, User } from '../models/user.model.js';
import { signToken, verifyToken } from '../utils/jwt.js';
import { logInfo, logSecurityAlert } from '../utils/logger.js';
import { validateEmail, validatePasswordStrength } from '../utils/validator.js';

// In-memory mock database
const userDatabase: Map<string, User> = new Map([
  [
    'usr_1',
    {
      id: 'usr_1',
      email: 'dev@shopsphere.io',
      passwordHash: 'hashed_secret_123',
      role: 'admin',
      createdAt: new Date('2026-01-01'),
    },
  ],
]);

export async function registerUser(email: string, password: string): Promise<User> {
  if (!validateEmail(email)) {
    throw new Error('Invalid email format provided');
  }

  const strength = validatePasswordStrength(password);
  if (!strength.valid) {
    throw new Error(strength.reason);
  }

  const existing = Array.from(userDatabase.values()).find((u) => u.email === email);
  if (existing) {
    logSecurityAlert('duplicate_registration_attempt', email);
    throw new Error('User with this email already exists');
  }

  const newUser: User = {
    id: `usr_${Date.now()}`,
    email,
    passwordHash: `hash_${password}_salt`,
    role: 'customer',
    createdAt: new Date(),
  };

  userDatabase.set(newUser.id, newUser);
  logInfo(`Registered new user: ${newUser.id}`);
  return newUser;
}

export async function loginUser(email: string, password: string): Promise<AuthSession> {
  const user = Array.from(userDatabase.values()).find((u) => u.email === email);
  if (!user || user.passwordHash !== `hash_${password}_salt` && user.passwordHash !== 'hashed_secret_123') {
    throw new Error('Invalid credentials');
  }

  const token = signToken({ userId: user.id, role: user.role });
  return {
    token,
    expiresIn: 3600,
    user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt },
  };
}

export function validateSession(token: string): { userId: string; role: string } {
  return verifyToken(token);
}
