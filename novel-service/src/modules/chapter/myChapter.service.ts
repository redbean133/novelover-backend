import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateChapterDto } from './dto/createChapter.dto';
import { UpdateChapterDto } from './dto/updateChapter.dto';
import { RpcException } from '@nestjs/microservices';
import { Chapter } from './chapter.entity';
import { NovelService } from '../novel/novel.service';
import { plainToInstance } from 'class-transformer';
import {
  MyChapterInListResponseDto,
  MyChapterResponseDto,
} from './dto/chapterResponse.dto';

const ORDER_STEP = 1024;

@Injectable()
export class MyChapterService {
  constructor(
    @InjectRepository(Chapter)
    private chapterRepo: Repository<Chapter>,
    private readonly novelService: NovelService,
  ) {}

  async create(
    dto: CreateChapterDto,
    currentUserId: string,
    afterChapterId?: number,
  ): Promise<Chapter> {
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

    let previousChapter: Chapter | null = null;
    let nextChapter: Chapter | null = null;
    if (afterChapterId) {
      previousChapter = await this.chapterRepo.findOneBy({
        id: afterChapterId,
      });
      if (!previousChapter) {
        throw new RpcException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Chương tham chiếu không tồn tại',
        });
      }
      if (previousChapter.nextChapterId) {
        nextChapter = await this.chapterRepo.findOneBy({
          id: previousChapter.nextChapterId,
        });
      }
    } else {
      // If no afterChapterId is provided, insert at the end
      previousChapter = await this.chapterRepo.findOne({
        where: { novelId: dto.novelId, nextChapterId: IsNull() },
      });
    }

    // Calculate orderIndex
    let orderIndex: number;
    if (!previousChapter && !nextChapter) {
      // First chapter
      orderIndex = ORDER_STEP;
    } else if (previousChapter && !nextChapter) {
      // Inserting at the end
      const result = await this.chapterRepo
        .createQueryBuilder('chapter')
        .select('MAX(chapter.orderIndex)', 'max')
        .where('chapter.novelId = :novelId', { novelId: dto.novelId })
        .getRawOne<{ max: string | null }>();

      const maxOrderIndex = result?.max ? parseInt(result.max, 10) : 0;
      orderIndex = maxOrderIndex + ORDER_STEP;
    } else if (previousChapter && nextChapter) {
      // Inserting in the middle
      let gap = nextChapter.orderIndex - previousChapter.orderIndex;
      if (gap <= 1) {
        const idToOrderIndexMap = await this._reindexOrderIndex(dto.novelId);
        if (previousChapter)
          previousChapter.orderIndex = idToOrderIndexMap.get(
            previousChapter.id,
          )!;
        if (nextChapter)
          nextChapter.orderIndex = idToOrderIndexMap.get(nextChapter.id)!;
      }
      gap = nextChapter.orderIndex - previousChapter.orderIndex;
      orderIndex = previousChapter.orderIndex + Math.floor(gap / 2);
    } else {
      // Inserting at the beginning
      orderIndex = Math.floor((nextChapter?.orderIndex ?? ORDER_STEP) / 2);
    }

    const chapter = this.chapterRepo.create({
      ...dto,
      orderIndex,
      prevChapterId: previousChapter?.id ?? null,
      nextChapterId: nextChapter?.id ?? null,
    });
    await this.chapterRepo.save(chapter);

    if (previousChapter) {
      previousChapter.nextChapterId = chapter.id;
      await this.chapterRepo.save(previousChapter);
    }
    if (nextChapter) {
      nextChapter.prevChapterId = chapter.id;
      await this.chapterRepo.save(nextChapter);
    }

    await this.novelService.updateCounter(dto.novelId, 'numberOfChapters', 1);
    return chapter;
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

    if (dto.content && dto.content !== chapter.content) {
      chapter.contentVersion = (chapter.contentVersion ?? 1) + 1;
      chapter.numberOfWords = dto.content
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
    }

    const wasPublished = chapter.isPublished;
    Object.assign(chapter, dto);

    const intentChangePublish = typeof dto.isPublished !== 'undefined';
    const isNowPublished = intentChangePublish ? dto.isPublished : wasPublished;

    if (intentChangePublish) {
      if (isNowPublished && (!chapter.title || !chapter.content)) {
        throw new RpcException({
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'Không thể xuất bản chương truyện khi chưa có tiêu đề hoặc nội dung',
        });
      }

      if (isNowPublished && !wasPublished) {
        chapter.publishedAt = new Date();
      } else if (!isNowPublished) {
        chapter.publishedAt = null;
      }

      const diff =
        isNowPublished && !wasPublished
          ? 1
          : !isNowPublished && wasPublished
            ? -1
            : 0;

      if (diff !== 0)
        await this.novelService.updateCounter(
          chapter.novelId,
          'numberOfPublishedChapters',
          diff,
        );

      await this.novelService.handlePublishAndCompleteState(chapter.novelId);
    } else if ((!chapter.title || !chapter.content) && isNowPublished) {
      chapter.isPublished = false;
      chapter.publishedAt = null;

      await this.novelService.updateCounter(
        chapter.novelId,
        'numberOfPublishedChapters',
        -1,
      );
      await this.novelService.handlePublishAndCompleteState(chapter.novelId);
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

    if (chapter.prevChapterId) {
      await this.chapterRepo.update(
        { id: chapter.prevChapterId },
        { nextChapterId: chapter.nextChapterId },
      );
    }
    if (chapter.nextChapterId) {
      await this.chapterRepo.update(
        { id: chapter.nextChapterId },
        { prevChapterId: chapter.prevChapterId },
      );
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
    await this.novelService.handlePublishAndCompleteState(chapter.novelId);
    return { success: true };
  }

  async findOne(chapterId: number, currentUserId: string) {
    const chapter = await this.chapterRepo.findOneBy({ id: chapterId });
    if (!chapter) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Không tìm thấy chương truyện',
      });
    }

    const novel = await this.novelService.findOne(chapter.novelId);
    const isContributor = novel.contributorId === currentUserId;

    if (!isContributor) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Bạn không có quyền truy cập dữ liệu này',
      });
    }

    const chapterResponse = {
      ...chapter,
      novelTitle: novel.title,
    };

    return plainToInstance(MyChapterResponseDto, chapterResponse, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    query: {
      novelId: number;
      page?: number;
      limit?: number;
      sort?: 'ASC' | 'DESC';
      isPublishedOnly?: boolean;
    },
    currentUserId: string,
  ) {
    const {
      novelId,
      page = 1,
      limit = 12,
      sort = 'ASC',
      isPublishedOnly = false,
    } = query;
    const novel = await this.novelService.findOne(novelId);
    const isContributor = novel.contributorId === currentUserId;

    if (!isContributor) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Bạn không có quyền truy cập dữ liệu này',
      });
    }

    const queryBuilder = this.chapterRepo
      .createQueryBuilder('chapter')
      .where('chapter.novelId = :novelId', {
        novelId,
      });

    if (isPublishedOnly) {
      queryBuilder.andWhere('chapter.isPublished = :isPublished', {
        isPublished: true,
      });
    }

    queryBuilder
      .orderBy('chapter.orderIndex', sort)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return {
      data: plainToInstance(MyChapterInListResponseDto, data, {
        excludeExtraneousValues: true,
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async _reindexOrderIndex(
    novelId: number,
  ): Promise<Map<number, number>> {
    const chapters = await this.chapterRepo.find({
      where: { novelId },
      order: { orderIndex: 'ASC' },
    });

    let order = ORDER_STEP;
    const mapping = new Map<number, number>();

    for (const chapter of chapters) {
      chapter.orderIndex = order;
      mapping.set(chapter.id, order);
      order += ORDER_STEP;
    }

    await this.chapterRepo.save(chapters);
    return mapping;
  }
}
