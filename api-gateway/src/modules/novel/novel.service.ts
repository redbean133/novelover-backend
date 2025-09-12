import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateNovelDto } from './dto/createNovel.dto';
import { UpdateNovelDto } from './dto/updateNovel.dto';
import { firstValueFrom, Observable } from 'rxjs';
import {
  NovelResponseDto,
  NovelResponseToClientDto,
} from './dto/novelResponse.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class NovelService {
  constructor(
    @Inject('NOVEL_SERVICE') private readonly novelClient: ClientProxy,
    private readonly userService: UserService,
  ) {}

  async createNovel(
    payload: { contributorId: string } & CreateNovelDto,
  ): Promise<NovelResponseToClientDto> {
    const novel = await firstValueFrom<NovelResponseDto>(
      this.novelClient.send({ cmd: 'novel.create' }, payload),
    );

    const contributor = await firstValueFrom(
      this.userService.getUsersByIds([novel.contributorId]),
    );

    return {
      ...novel,
      contributorName: contributor[0]?.displayName ?? '',
    };
  }

  async updateNovel(payload: {
    id: number;
    currentUserId: string;
    data: UpdateNovelDto;
  }): Promise<NovelResponseToClientDto> {
    const novel = await firstValueFrom<NovelResponseDto>(
      this.novelClient.send({ cmd: 'novel.update' }, payload),
    );

    const contributor = await firstValueFrom(
      this.userService.getUsersByIds([novel.contributorId]),
    );

    return {
      ...novel,
      contributorName: contributor[0]?.displayName ?? '',
    };
  }

  deleteNovel(payload: { id: number; currentUserId: string }): Observable<any> {
    return this.novelClient.send({ cmd: 'novel.delete' }, payload);
  }

  async findAll(payload: {
    page?: number;
    limit?: number;
    search?: string;
    genreId?: number;
    contributorId?: string;
    currentUserId?: string | null;
  }): Promise<any> {
    const { data, total, page, limit, totalPages } = await firstValueFrom<{
      data: NovelResponseDto[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(this.novelClient.send({ cmd: 'novel.find-all' }, payload));

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

  async findOne(payload: {
    id: number;
    currentUserId?: string | null;
  }): Promise<any> {
    const novel = await firstValueFrom<NovelResponseDto>(
      this.novelClient.send({ cmd: 'novel.find-one' }, payload),
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
