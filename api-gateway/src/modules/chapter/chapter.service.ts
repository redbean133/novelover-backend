import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ChapterService {
  constructor(
    @Inject('NOVEL_SERVICE') private readonly novelClient: ClientProxy,
  ) {}

  findOne(chapterId: number) {
    return this.novelClient.send(
      { cmd: 'chapter.find-one' },
      {
        chapterId,
      },
    );
  }

  findAll(query: {
    novelId?: number;
    page?: number;
    limit?: number;
    sort?: 'ASC' | 'DESC';
  }) {
    return this.novelClient.send(
      { cmd: 'chapter.find-all' },
      {
        query,
      },
    );
  }
}
