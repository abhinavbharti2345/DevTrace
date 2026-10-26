import { logError, logInfo } from './logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-123';

export function signToken(payload: { userId: string; role: string }): string {
  logInfo(`Generating JWT token for user ${payload.userId}`);
  return `mock.jwt.${Buffer.from(JSON.stringify(payload)).toString('base64')}.sig`;
}

export function verifyToken(token: string): { userId: string; role: string } {
  try {
    if (!token || !token.startsWith('mock.jwt.')) {
      throw new Error('Invalid JWT format');
    }
    const parts = token.split('.');
    const decoded = JSON.parse(Buffer.from(parts[2], 'base64').toString('utf8'));
    return decoded;
  } catch (err) {
    logError('JWT validation failed', err);
    throw new Error('Unauthorized: Invalid or expired token');
  }
}
