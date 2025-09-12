import { Gender } from 'src/modules/user/interface/IUser';

export interface IUserPublicInfo {
  id: string;
  username: string;
  displayName: string;
  birthday: string;
  gender: Gender;
  about: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  createdAt: string;
  followersCount: number;
  followingCount: number;
}
