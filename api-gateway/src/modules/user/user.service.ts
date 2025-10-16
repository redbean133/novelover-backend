import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from './dto/createUser.dto';
import { LocalLoginDto } from './dto/localLogin.dto';
import { ILoginResponse } from './interface/ILoginResponse';
import { Observable } from 'rxjs';
import { IRefreshTokenResponse } from './interface/IRefreshTokenResponse';
import { IUser } from './interface/IUser';
import { UpdateUserDTO } from './dto/updateUser.dto';
import { UpdatePasswordDto } from './dto/updatePassword.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
    @Inject('MEDIA_SERVICE') private readonly mediaServiceClient: ClientProxy,
  ) {}

  registerUser(createUserDto: CreateUserDto): Observable<IUser> {
    return this.userServiceClient.send({ cmd: 'user.register' }, createUserDto);
  }

  login(loginDto: LocalLoginDto): Observable<ILoginResponse> {
    return this.userServiceClient.send({ cmd: 'user.login' }, loginDto);
  }

  loginWithGoogle(params: {
    code: string;
    deviceId?: string;
  }): Observable<ILoginResponse> {
    return this.userServiceClient.send({ cmd: 'user.google-login' }, params);
  }

  refreshToken(params: {
    userId: string;
    deviceId: string;
    refreshToken: string;
  }): Observable<IRefreshTokenResponse> {
    return this.userServiceClient.send({ cmd: 'user.refresh-token' }, params);
  }

  logout(params: { userId: string; deviceId: string }): Observable<any> {
    return this.userServiceClient.send({ cmd: 'user.logout' }, params);
  }

  logoutAllDevices(params: { userId: string }): Observable<any> {
    return this.userServiceClient.send({ cmd: 'user.logout-all' }, params);
  }

  getUserInfo(userId: string): Observable<IUser> {
    return this.userServiceClient.send({ cmd: 'user.get-information' }, userId);
  }

  sendVerifyEmail(
    userId: string,
    email: string,
  ): Observable<{ success: boolean; message: string }> {
    return this.userServiceClient.send(
      { cmd: 'user.send-verify-email' },
      { userId, email },
    );
  }

  verifyEmail(
    token: string,
  ): Observable<{ success: boolean; message: string }> {
    return this.userServiceClient.send({ cmd: 'user.verify-email' }, token);
  }

  updateUserInfo(userId: string, updateData: UpdateUserDTO): Observable<IUser> {
    return this.userServiceClient.send(
      { cmd: 'user.update-information' },
      { userId, updateData },
    );
  }

  updatePassword(
    userId: string,
    updateData: UpdatePasswordDto,
  ): Observable<{ success: boolean }> {
    return this.userServiceClient.send(
      { cmd: 'user.update-password' },
      { userId, ...updateData },
    );
  }

  follow(userId: string, targetId: string): Observable<any> {
    return this.userServiceClient.send(
      { cmd: 'user.follow' },
      { userId, targetId },
    );
  }

  unfollow(userId: string, targetId: string): Observable<any> {
    return this.userServiceClient.send(
      { cmd: 'user.unfollow' },
      { userId, targetId },
    );
  }

  getFollowers(
    userId: string,
    currentUserId: string | null,
    query: { page?: number; limit?: number; search?: string },
  ): Observable<any> {
    return this.userServiceClient.send(
      { cmd: 'user.get-followers' },
      { userId, currentUserId, query },
    );
  }

  getFollowing(
    userId: string,
    currentUserId: string | null,
    query: { page?: number; limit?: number; search?: string },
  ): Observable<any> {
    return this.userServiceClient.send(
      { cmd: 'user.get-following' },
      { userId, currentUserId, query },
    );
  }

  isFollowing(userId: string, targetId: string): Observable<any> {
    return this.userServiceClient.send(
      { cmd: 'user.is-following' },
      { userId, targetId },
    );
  }

  getUsersByIds(ids: string[]) {
    return this.userServiceClient.send<
      { id: string; displayName: string; avatarUrl: string; username: string }[]
    >({ cmd: 'user.get-by-ids' }, ids);
  }
}
