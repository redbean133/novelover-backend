import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateChapterDto } from './dto/createChapter.dto';
import { UpdateChapterDto } from './dto/updateChapter.dto';

@Injectable()
export class MyChapterService {
  constructor(
    @Inject('NOVEL_SERVICE') private readonly novelClient: ClientProxy,
  ) {}

  create(dto: CreateChapterDto, currentUserId: string) {
    return this.novelClient.send(
      { cmd: 'chapter.create' },
      {
        dto,
        currentUserId,
      },
    );
  }

  update(chapterId: number, dto: UpdateChapterDto, currentUserId: string) {
    return this.novelClient.send(
      { cmd: 'chapter.update' },
      {
        chapterId,
        dto,
        currentUserId,
      },
    );
  }

  delete(chapterId: number, currentUserId: string) {
    return this.novelClient.send(
      { cmd: 'chapter.delete' },
      {
        chapterId,
        currentUserId,
      },
    );
  }

  findOne(chapterId: number, currentUserId: string) {
    return this.novelClient.send(
      { cmd: 'chapter.own.find-one' },
      {
        chapterId,
        currentUserId,
      },
    );
  }

  findAll(
    query: {
      novelId?: number;
      page?: number;
      limit?: number;
      sort?: 'ASC' | 'DESC';
      isPublishedOnly?: boolean;
    },
    currentUserId: string,
  ) {
    return this.novelClient.send(
      { cmd: 'chapter.own.find-all' },
      {
        query,
        currentUserId,
      },
    );
  }
}
