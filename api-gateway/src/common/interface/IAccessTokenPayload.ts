import { UserRole } from 'src/modules/user/interface/IUser';

export interface IAccessTokenPayload {
  sub: string;
  exp: number;
  role: UserRole;
  username: string;
}
