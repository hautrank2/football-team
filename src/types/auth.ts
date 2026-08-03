import type { RoleEnum } from "./enums";

export type LoginDto = { username: string; password: string };

// Minimal client-side auth user kept in localStorage (see auth-context).
export type AuthUserModel = {
  id: string;
  username: string;
  fullName: string;
  role: RoleEnum;
  avatarUrl?: string | null;
};
