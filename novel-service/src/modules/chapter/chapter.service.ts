import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { Chapter } from './chapter.entity';
import { NovelService } from '../novel/novel.service';
import { plainToInstance } from 'class-transformer';
import {
  PublicChapterInListResponseDto,
  PublicChapterResponseDto,
} from './dto/chapterResponse.dto';

@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(Chapter)
    private chapterRepo: Repository<Chapter>,
    private readonly novelService: NovelService,
  ) {}

  async findOne(chapterId: number) {
    const chapter = await this.chapterRepo.findOneBy({ id: chapterId });
    if (!chapter) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Không tìm thấy chương truyện',
      });
    }

    const novel = await this.novelService.findOne(chapter.novelId);
    if (!novel.isPublished || !chapter.isPublished) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Bạn không có quyền xem chương truyện này',
      });
    }

    const [prevPublishedChapter] = await this.chapterRepo.find({
      where: {
        novelId: chapter.novelId,
        isPublished: true,
        orderIndex: LessThan(chapter.orderIndex),
      },
      order: { orderIndex: 'DESC' },
      take: 1,
    });

    const [nextPublishedChapter] = await this.chapterRepo.find({
      where: {
        novelId: chapter.novelId,
        isPublished: true,
        orderIndex: MoreThan(chapter.orderIndex),
      },
      order: { orderIndex: 'ASC' },
      take: 1,
    });

    const chapterResponse = {
      ...chapter,
      prevChapterId: prevPublishedChapter ? prevPublishedChapter.id : NaN,
      nextChapterId: nextPublishedChapter ? nextPublishedChapter.id : NaN,
      novelTitle: novel.title,
      totalChapters: novel.numberOfPublishedChapters,
    };

    return plainToInstance(PublicChapterResponseDto, chapterResponse, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(query: {
    novelId: number;
    page?: number;
    limit?: number;
    sort?: 'ASC' | 'DESC';
  }) {
    const { novelId, page = 1, limit = 12, sort = 'ASC' } = query;
    const novel = await this.novelService.findOne(novelId);

    if (!novel.isPublished) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Bạn không có quyền xem danh sách chương của truyện này',
      });
    }

    const queryBuilder = this.chapterRepo
      .createQueryBuilder('chapter')
      .where('chapter.novelId = :novelId', {
        novelId,
      })
      .andWhere('chapter.isPublished = :isPublished', {
        isPublished: true,
      });

    queryBuilder
      .orderBy('chapter.orderIndex', sort)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return {
      data: plainToInstance(PublicChapterInListResponseDto, data, {
        excludeExtraneousValues: true,
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
