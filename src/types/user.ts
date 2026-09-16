export type UserRole = 'manager' | 'worker' | 'viewer';

export interface User {
  id: string;
  farmId: string;
  fullName: string;
  email: string;
  role: UserRole;
  assignedBlock: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
}
