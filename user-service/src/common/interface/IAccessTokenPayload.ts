import { UserRole } from 'src/modules/user/user.entity';

export interface IAccessTokenPayload {
  sub: string;
  exp: number;
  role: UserRole;
  username: string;
}
