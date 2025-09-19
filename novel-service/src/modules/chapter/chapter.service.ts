import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChapterDto } from './dto/createChapter.dto';
import { UpdateChapterDto } from './dto/updateChapter.dto';
import { RpcException } from '@nestjs/microservices';
import { Chapter } from './chapter.entity';
import { NovelService } from '../novel/novel.service';
import { plainToInstance } from 'class-transformer';
import { ChapterInListResponseDto } from './dto/chapterResponse.dto';

@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(Chapter)
    private chapterRepo: Repository<Chapter>,
    private readonly novelService: NovelService,
  ) {}

  async create(dto: CreateChapterDto, currentUserId: string): Promise<Chapter> {
    const isContributor = await this.novelService.isContributorOwnsNovel({
      contributorId: currentUserId,
      novelId: dto.novelId,
    });
    if (!isContributor) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Bạn không có quyền tạo chương cho truyện này',
      });
    }
    const chapter = this.chapterRepo.create({
      ...dto,
    });
    await this.chapterRepo.save(chapter);
    await this.novelService.updateCounter(dto.novelId, 'numberOfChapters', 1);
    return chapter;
  }

  async findOne(chapterId: number, currentUserId: string): Promise<Chapter> {
    const chapter = await this.chapterRepo.findOneBy({ id: chapterId });
    if (!chapter) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Không tìm thấy chương truyện',
      });
    }

    const isContributor = await this.novelService.isContributorOwnsNovel({
      contributorId: currentUserId,
      novelId: chapter.novelId,
    });

    if (!isContributor && !chapter.isPublished) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Bạn không có quyền xem chương truyện này',
      });
    }

    return chapter;
  }

  async findAll(
    query: {
      novelId: number;
      page?: number;
      limit?: number;
      sort?: 'ASC' | 'DESC';
    },
    currentUserId: string,
  ) {
    const isContributor = await this.novelService.isContributorOwnsNovel({
      contributorId: currentUserId,
      novelId: query.novelId,
    });

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 12;

    const queryBuilder = this.chapterRepo.createQueryBuilder('chapter');

    if (query.novelId) {
      queryBuilder.where('chapter.novelId = :novelId', {
        novelId: query.novelId,
      });
    }

    if (!isContributor) {
      queryBuilder.andWhere('chapter.isPublished = :isPublished', {
        isPublished: true,
      });
    }

    queryBuilder
      .orderBy('chapter.createdAt', query.sort ? query.sort : 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return {
      data: plainToInstance(ChapterInListResponseDto, data, {
        excludeExtraneousValues: true,
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    chapterId: number,
    dto: UpdateChapterDto,
    currentUserId: string,
  ): Promise<Chapter> {
    const chapter = await this.chapterRepo.findOneBy({ id: chapterId });
    if (!chapter) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Không tìm thấy chương truyện cần chỉnh sửa',
      });
    }

    const isContributor = await this.novelService.isContributorOwnsNovel({
      contributorId: currentUserId,
      novelId: chapter.novelId,
    });
    if (!isContributor) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Bạn không có quyền chỉnh sửa chương truyện này',
      });
    }

    const wasPublished = chapter.isPublished;
    Object.assign(chapter, dto);

    if (dto.content) {
      chapter.numberOfWords = dto.content
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
    }
    if (chapter.isPublished !== undefined) {
      if (chapter.isPublished && (!chapter.title || !chapter.content)) {
        throw new RpcException({
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'Không thể xuất bản chương truyện khi chưa có tiêu đề hoặc nội dung',
        });
      }
      chapter.publishedAt = chapter.isPublished ? new Date() : null;
      const diff = dto.isPublished
        ? wasPublished
          ? 0
          : 1
        : wasPublished
          ? -1
          : 0;
      await this.novelService.updateCounter(
        chapter.novelId,
        'numberOfPublishedChapters',
        diff,
      );
    }

    return this.chapterRepo.save(chapter);
  }

  async delete(
    chapterId: number,
    currentUserId: string,
  ): Promise<{ success: boolean }> {
    const chapter = await this.chapterRepo.findOneBy({ id: chapterId });
    if (!chapter) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Không tìm thấy chương truyện cần xóa',
      });
    }

    const isContributor = await this.novelService.isContributorOwnsNovel({
      contributorId: currentUserId,
      novelId: chapter.novelId,
    });
    if (!isContributor) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Bạn không có quyền xóa chương truyện này',
      });
    }

    await this.chapterRepo.delete(chapterId);
    await this.novelService.updateCounter(
      chapter.novelId,
      'numberOfChapters',
      -1,
    );
    if (chapter.isPublished) {
      await this.novelService.updateCounter(
        chapter.novelId,
        'numberOfPublishedChapters',
        -1,
      );
    }
    return { success: true };
  }
}
