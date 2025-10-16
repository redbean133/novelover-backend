import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Novel } from './novel.entity';
import { Repository } from 'typeorm';
import { CreateNovelDto } from './dto/createNovel.dto';
import { UpdateNovelDto } from './dto/updateNovel.dto';
import { RpcException } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { AuthorService } from '../author/author.service';
import { GenreService } from '../genre/genre.service';
import { Genre } from '../genre/genre.entity';
import { NovelService } from './novel.service';
import {
  FullInfoNovelResponseDto,
  MyNovelInListResponseDto,
} from './dto/novelResponse.dto';
import { CrawlerNovelDto } from './dto/crawlerNovel.dto';

@Injectable()
export class MyNovelService {
  constructor(
    @InjectRepository(Novel)
    private novelRepo: Repository<Novel>,
    private readonly novelService: NovelService,
    private readonly authorService: AuthorService,
    private readonly genreService: GenreService,
  ) {}

  async create(dto: CreateNovelDto): Promise<FullInfoNovelResponseDto> {
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
    return plainToInstance(FullInfoNovelResponseDto, savedNovel, {
      excludeExtraneousValues: true,
    });
  }

  async createFromCrawler(
    crawlerNovelDto: CrawlerNovelDto,
  ): Promise<FullInfoNovelResponseDto> {
    const genreIds = await this.genreService.resolveByNames(
      crawlerNovelDto.genres || [],
    );

    const createNovelDto: CreateNovelDto = {
      title: crawlerNovelDto.title,
      isOriginal: false,
      contributorId: crawlerNovelDto.contributorId,
      description: crawlerNovelDto.description,
      authorName: crawlerNovelDto.authorName,
      genreIds,
    };

    const novel = await this.create(createNovelDto);
    const updatedNovel = await this.update(
      novel.id,
      crawlerNovelDto.contributorId,
      {
        coverUrl: crawlerNovelDto.coverUrl,
      },
    );
    return updatedNovel;
  }

  async update(
    id: number,
    currentUserId: string,
    dto: UpdateNovelDto,
  ): Promise<FullInfoNovelResponseDto> {
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

    if (genreIds && genreIds.length > 0) {
      const genres = await this.genreService.getByIds(genreIds);
      novel.genres = genres;
    }

    Object.assign(novel, rest);

    if (novel.isPublished && !novel.description) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Truyện đã xuất bản phải có phần giới thiệu',
      });
    }

    await this.novelRepo.save(novel);

    const updatedNovel = await this.findOne({ id, currentUserId });
    return updatedNovel;
  }

  async publish(id: number, currentUserId: string, isPublished: boolean) {
    const novel = await this.novelRepo.findOneBy({ id });
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

    if (isPublished) {
      if (!novel.description)
        throw new RpcException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Phải có phần giới thiệu trước khi xuất bản',
        });
      if (novel.numberOfPublishedChapters <= 0)
        throw new RpcException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Phải đăng ít nhất một chương trước khi xuất bản',
        });
    }
    novel.isPublished = isPublished;
    novel.publishedAt = isPublished ? new Date() : null;
    await this.novelRepo.save(novel);
    const updatedNovel = await this.findOne({ id, currentUserId });
    return updatedNovel;
  }

  async complete(id: number, currentUserId: string, isCompleted: boolean) {
    const novel = await this.novelRepo.findOneBy({ id });
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

    if (isCompleted) {
      if (novel.numberOfPublishedChapters <= 0)
        throw new RpcException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Phải đăng ít nhất một chương trước khi kết thúc truyện',
        });
    }
    novel.isCompleted = isCompleted;
    novel.completedAt = isCompleted ? new Date() : null;
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
    contributorId: string;
    status: 'published' | 'draft';
    page: number;
    limit: number;
  }) {
    const { contributorId, status = 'published', page = 1, limit = 12 } = query;

    const queryBuilder = this.novelRepo
      .createQueryBuilder('novel')
      .leftJoinAndSelect('novel.author', 'author')
      .leftJoinAndSelect('novel.genres', 'genres')
      .andWhere('novel.contributorId = :contributorId', {
        contributorId,
      })
      .andWhere(
        `novel.isPublished = ${status === 'published' ? 'true' : 'false'}`,
      )
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('novel.lastUpdatedAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();
    return {
      data: plainToInstance(MyNovelInListResponseDto, data, {
        excludeExtraneousValues: true,
      }),
      total,
      page: +page,
      limit: +limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(payload: {
    id: number;
    currentUserId: string | null;
  }): Promise<FullInfoNovelResponseDto> {
    const novel = await this.novelService.findOne(payload.id);

    if (
      !novel ||
      (novel.isPublished === false &&
        novel.contributorId !== payload.currentUserId)
    ) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Không tìm thấy tiểu thuyết',
      });
    }

    return plainToInstance(FullInfoNovelResponseDto, novel, {
      excludeExtraneousValues: true,
    });
  }
}
