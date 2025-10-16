import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../user/user.service';
import {
  NovelsListResponseDto,
  PublicNovelInListResponseDto,
  PublicNovelResponseDto,
} from './dto/novelResponse.dto';

@Injectable()
export class PublicNovelService {
  constructor(
    @Inject('NOVEL_SERVICE') private readonly novelClient: ClientProxy,
    private readonly userService: UserService,
  ) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    genreIds?: number[];
    contributorId?: string;
    completionStatus?: 'completed' | 'ongoing';
    source?: 'original' | 'collected';
    sort?: 'ASC' | 'DESC';
    sortBy?:
      | 'latestPublishedChapterTime'
      | 'numberOfViews'
      | 'numberOfVotes'
      | 'averageRating';
  }): Promise<NovelsListResponseDto> {
    const { data, total, page, limit, totalPages } = await firstValueFrom<{
      data: PublicNovelInListResponseDto[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(this.novelClient.send({ cmd: 'novel.published.find-all' }, query));

    if (!data.length) return { data: [], total, page, limit, totalPages };

    const contributorIds = [...new Set(data.map((n) => n.contributorId))];
    const contributors = await firstValueFrom(
      this.userService.getUsersByIds(contributorIds),
    );
    const contributorMap = new Map(
      contributors.map((user) => [user.id, user.displayName]),
    );

    const novelsWithContributor = data.map((novel) => ({
      ...novel,
      contributorName: contributorMap.get(novel.contributorId) ?? '',
    }));

    return { data: novelsWithContributor, total, page, limit, totalPages };
  }

  async findOne(id: number): Promise<PublicNovelResponseDto> {
    const novel = await firstValueFrom<PublicNovelResponseDto>(
      this.novelClient.send({ cmd: 'novel.published.find-one' }, { id }),
    );

    const contributor = await firstValueFrom(
      this.userService.getUsersByIds([novel.contributorId]),
    );

    return {
      ...novel,
      contributorName: contributor[0]?.displayName ?? '',
    };
  }
}
