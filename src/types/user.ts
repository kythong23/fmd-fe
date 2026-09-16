export type UserRole = 'manager' | 'worker' | 'viewer';

export interface User {
  id: string;
  farmId: string;
  fullName: string;
  username: string;
  role: UserRole;
  assignedBlock: string | null;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface Session {
  user: User;
  token: string;
}
