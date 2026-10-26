export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  createdAt: Date;
}

export interface AuthSession {
  token: string;
  expiresIn: number;
  user: Omit<User, 'passwordHash'>;
}
