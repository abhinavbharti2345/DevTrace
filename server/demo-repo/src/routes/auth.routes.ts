import { loginUser, registerUser, validateSession } from '../services/auth.service.js';
import { logError } from '../utils/logger.js';

export function handleLoginRequest(req: { body: { email?: string; password?: string } }): Promise<unknown> {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  return loginUser(email, password);
}

export function handleRegisterRequest(req: { body: { email?: string; password?: string } }): Promise<unknown> {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  return registerUser(email, password);
}

export function authMiddleware(authHeader?: string): { userId: string; role: string } {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logError('Missing or malformed Authorization header');
    throw new Error('Missing or malformed Authorization header');
  }
  const token = authHeader.slice(7);
  return validateSession(token);
}
