import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from './dto/createUser.dto';
import { LocalLoginDto } from './dto/localLogin.dto';
import { ILoginResponse } from './interface/ILoginResponse';
import { Observable } from 'rxjs';
import { IRefreshTokenResponse } from './interface/IRefreshTokenResponse';
import { IUser } from './interface/IUser';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  registerUser(createUserDto: CreateUserDto): Observable<IUser> {
    return this.userServiceClient.send({ cmd: 'user.register' }, createUserDto);
  }

  login(loginDto: LocalLoginDto): Observable<ILoginResponse> {
    return this.userServiceClient.send({ cmd: 'user.login' }, loginDto);
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
}
