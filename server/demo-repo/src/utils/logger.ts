export function logInfo(message: string, meta?: Record<string, unknown>): void {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta) : '');
}

export function logError(message: string, error?: unknown): void {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
}

export function logSecurityAlert(action: string, userId: string): void {
  console.warn(`[SECURITY] Suspicious event '${action}' flagged for user: ${userId}`);
}
