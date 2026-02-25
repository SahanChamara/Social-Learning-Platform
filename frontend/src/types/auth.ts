// User Types
export const UserRole = {
  LEARNER: 'LEARNER',
  CREATOR: 'CREATOR',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  expertise?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

// Auth Input Types
export interface LoginInput {
  emailOrUsername: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

// Auth Response Types
export interface AuthPayload {
  token: string;
  refreshToken: string;
  user: User;
}

// GraphQL Response Types
export interface LoginResponse {
  login: AuthPayload;
}

export interface RegisterResponse {
  register: AuthPayload;
}

export interface RefreshTokenResponse {
  refreshToken: AuthPayload;
}

export interface MeResponse {
  me: User | null;
}

export interface UserResponse {
  user: User | null;
}
