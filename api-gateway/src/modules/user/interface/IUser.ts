export const Gender = {
  Unknown: 0,
  Male: 1,
  Female: 2,
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export const UserRole = {
  Normal: 0,
  Admin: 1,
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const AccountStatus = {
  Normal: 0,
  SelfLocked: 1,
  AdminLocked: 2,
} as const;

export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

export interface IUser {
  id: string;
  username: string;
  displayName: string | null;
  email: string | null;
  gender: Gender;
  about: string | null;
  role: UserRole;
  status: AccountStatus;
  deletedAt: Date | null;
}
