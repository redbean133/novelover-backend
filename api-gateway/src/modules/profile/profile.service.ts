import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IUserPublicInfo } from './interface/IUserPublicInfo';
import {
  NovelsListResponseDto,
  PublicNovelInListResponseDto,
} from '../novel/dto/novelResponse.dto';

@Injectable()
export class ProfileService {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
    @Inject('NOVEL_SERVICE') private readonly novelServiceClient: ClientProxy,
  ) {}

  async findOne(profileId: string): Promise<{
    user: IUserPublicInfo;
    novels: { data: PublicNovelInListResponseDto[]; total: number };
  }> {
    const [userPublicInfo, novelsData] = await Promise.all([
      firstValueFrom<IUserPublicInfo>(
        this.userServiceClient.send<IUserPublicInfo, string>(
          { cmd: 'user.get-public-information' },
          profileId,
        ),
      ),
      firstValueFrom<NovelsListResponseDto>(
        this.novelServiceClient.send<NovelsListResponseDto, any>(
          { cmd: 'novel.published.find-all' },
          { contributorId: profileId, page: 1, limit: 6 },
        ),
      ),
    ]);

    return {
      user: userPublicInfo,
      novels: {
        data: novelsData.data as PublicNovelInListResponseDto[],
        total: novelsData.total,
      },
    };
  }
}
