import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Novel } from './novel.entity';
import { Repository } from 'typeorm';
import { CreateNovelDto } from './dto/createNovel.dto';
import { UpdateNovelDto } from './dto/updateNovel.dto';
import { RpcException } from '@nestjs/microservices';
import { defaultPageNumber, defaultPageSize } from 'src/utils/constants';
import { plainToInstance } from 'class-transformer';
import { NovelResponseDto } from './dto/novelResponse.dto';
import { AuthorService } from '../author/author.service';
import { GenreService } from '../genre/genre.service';
import { Genre } from '../genre/genre.entity';

@Injectable()
export class NovelService {
  constructor(
    @InjectRepository(Novel)
    private novelRepo: Repository<Novel>,
    private readonly authorService: AuthorService,
    private readonly genreService: GenreService,
  ) {}

  async create(dto: CreateNovelDto): Promise<NovelResponseDto> {
    const novel = this.novelRepo.create({
      title: dto.title,
      isOriginal: dto.isOriginal,
      contributorId: dto.contributorId,
      description: dto.description,
    });

    if (!dto.isOriginal && dto.authorName) {
      const author = await this.authorService.createIfNotExists({
        name: dto.authorName,
      });
      novel.author = author;
    }

    let genres: Genre[] = [];
    if (dto.genreIds && dto.genreIds.length > 0) {
      genres = await this.genreService.getByIds(dto.genreIds);
    }
    novel.genres = genres;

    const savedNovel = await this.novelRepo.save(novel);
    return plainToInstance(NovelResponseDto, savedNovel, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    id: number,
    currentUserId: string,
    dto: UpdateNovelDto,
  ): Promise<NovelResponseDto> {
    const novel = await this.novelRepo.findOneBy({ id });
    const { authorName, genreIds, ...rest } = dto;

    if (!novel)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Không tìm thấy tiểu thuyết',
      });

    if (novel.contributorId !== currentUserId)
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Bạn không có quyền chỉnh sửa tiểu thuyết này',
      });

    if (!dto.isOriginal && authorName) {
      const author = await this.authorService.createIfNotExists({
        name: authorName,
      });
      novel.author = author;
    } else if (dto.isOriginal) {
      novel.author = null;
    }

    if (dto.isPublished !== undefined) {
      novel.publishedAt = dto.isPublished ? new Date() : null;
    }

    if (dto.isCompleted !== undefined) {
      novel.completedAt = dto.isCompleted ? new Date() : null;
    }

    if (genreIds && genreIds.length > 0) {
      const genres = await this.genreService.getByIds(genreIds);
      novel.genres = genres;
    }

    Object.assign(novel, rest);
    await this.novelRepo.save(novel);

    const updatedNovel = await this.findOne({ id, currentUserId });
    return updatedNovel;
  }

  async delete(
    id: number,
    currentUserId: string,
  ): Promise<{ success: boolean }> {
    const novel = await this.novelRepo.findOneBy({ id });
    if (!novel)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Không tìm thấy tiểu thuyết',
      });
    if (novel.contributorId !== currentUserId)
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Bạn không có quyền xoá tiểu thuyết này',
      });
    await this.novelRepo.softDelete(id);
    return { success: true };
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    genreId?: number;
    contributorId?: string;
    search?: string;
    status?: 'published' | 'draft' | 'all';
  }) {
    const { genreId, contributorId, search, status = 'published' } = query;
    const page = query?.page ? +query.page : defaultPageNumber;
    const limit = query?.limit ? +query.limit : defaultPageSize;

    const queryBuilder = this.novelRepo
      .createQueryBuilder('novel')
      .leftJoinAndSelect('novel.author', 'author')
      .leftJoinAndSelect('novel.genres', 'genres');

    if (genreId) {
      queryBuilder.innerJoin('novel.genres', 'genre', 'genre.id = :genreId', {
        genreId: +genreId,
      });
    }

    if (contributorId) {
      queryBuilder.andWhere('novel.contributorId = :contributorId', {
        contributorId,
      });
    }

    if (search) {
      queryBuilder.andWhere('novel.title LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (status === 'published') {
      queryBuilder.andWhere('novel.isPublished = true');
    } else if (status === 'draft') {
      queryBuilder.andWhere('novel.isPublished = false');
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('novel.lastUpdatedAt', 'DESC');

    const data = await queryBuilder.getMany();
    return {
      data: plainToInstance(NovelResponseDto, data, {
        excludeExtraneousValues: true,
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(payload: {
    id: number;
    currentUserId?: string | null;
  }): Promise<NovelResponseDto> {
    const { id, currentUserId } = payload;
    const queryBuilder = this.novelRepo
      .createQueryBuilder('novel')
      .leftJoinAndSelect('novel.author', 'author')
      .leftJoinAndSelect('novel.genres', 'genres')
      .where('novel.id = :id', { id });

    const novel = await queryBuilder.getOne();
    if (
      !novel ||
      (novel.isPublished === false && novel.contributorId !== currentUserId)
    ) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Không tìm thấy tiểu thuyết',
      });
    }

    return plainToInstance(NovelResponseDto, novel, {
      excludeExtraneousValues: true,
    });
  }

  async getDetailByContributor(payload: {
    contributorId: string;
    novelId: number;
  }) {
    const { contributorId, novelId } = payload;
    const novel = await this.findOne({
      id: novelId,
      currentUserId: contributorId,
    });
    return { novel };
  }

  async isContributorOwnsNovel(payload: {
    contributorId: string;
    novelId: number;
  }): Promise<boolean> {
    const { contributorId, novelId } = payload;
    const novel = await this.novelRepo.findOneBy({
      id: novelId,
      contributorId,
    });
    return !!novel;
  }

  async incrementChapterCount(novelId: number) {
    await this.novelRepo.increment({ id: novelId }, 'numberOfChapters', 1);
  }

  async decrementChapterCount(novelId: number) {
    await this.novelRepo.decrement({ id: novelId }, 'numberOfChapters', 1);
  }

  async updateCounter(
    novelId: number,
    field: keyof Pick<
      Novel,
      | 'numberOfChapters'
      | 'numberOfPublishedChapters'
      | 'numberOfReviews'
      | 'numberOfVotes'
      | 'numberOfViews'
    >,
    value: number,
  ) {
    await this.novelRepo.increment({ id: novelId }, field, value);
  }
}
