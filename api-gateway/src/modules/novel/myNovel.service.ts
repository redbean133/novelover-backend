import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateNovelDto } from './dto/createNovel.dto';
import { UpdateNovelDto } from './dto/updateNovel.dto';
import { firstValueFrom, Observable } from 'rxjs';
import { FullInfoNovelResponseDto } from './dto/novelResponse.dto';

@Injectable()
export class MyNovelService {
  constructor(
    @Inject('NOVEL_SERVICE') private readonly novelClient: ClientProxy,
  ) {}

  async create(
    payload: { contributorId: string } & CreateNovelDto,
  ): Promise<FullInfoNovelResponseDto> {
    const novel = await firstValueFrom<FullInfoNovelResponseDto>(
      this.novelClient.send({ cmd: 'novel.create' }, payload),
    );
    return novel;
  }

  async update(payload: {
    id: number;
    currentUserId: string;
    data: UpdateNovelDto;
  }): Promise<FullInfoNovelResponseDto> {
    const novel = await firstValueFrom<FullInfoNovelResponseDto>(
      this.novelClient.send({ cmd: 'novel.update' }, payload),
    );
    return novel;
  }

  async publish(payload: {
    id: number;
    currentUserId: string;
    isPublished: boolean;
  }) {
    const novel = await firstValueFrom<FullInfoNovelResponseDto>(
      this.novelClient.send({ cmd: 'novel.publish' }, payload),
    );
    return novel;
  }

  async complete(payload: {
    id: number;
    currentUserId: string;
    isCompleted: boolean;
  }) {
    const novel = await firstValueFrom<FullInfoNovelResponseDto>(
      this.novelClient.send({ cmd: 'novel.complete' }, payload),
    );
    return novel;
  }

  delete(payload: {
    id: number;
    currentUserId: string;
  }): Observable<{ success: boolean }> {
    return this.novelClient.send({ cmd: 'novel.delete' }, payload);
  }

  findAll(payload: {
    contributorId: string;
    status: 'published' | 'draft';
    page: number;
    limit: number;
  }) {
    return this.novelClient.send({ cmd: 'novel.own.find-all' }, payload);
  }

  findOne(payload: { contributorId: string; novelId: number }) {
    return this.novelClient.send({ cmd: 'novel.own.find-one' }, payload);
  }
}
