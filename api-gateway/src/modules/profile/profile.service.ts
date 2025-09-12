import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IUserPublicInfo } from './interface/IUserPublicInfo';

@Injectable()
export class ProfileService {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  async getProfileInfo(profileId: string): Promise<{ user: IUserPublicInfo }> {
    const userPublicInfo = await firstValueFrom<IUserPublicInfo>(
      this.userServiceClient.send<IUserPublicInfo, string>(
        { cmd: 'user.get-public-information' },
        profileId,
      ),
    );

    return {
      user: userPublicInfo,
    };
  }
}
