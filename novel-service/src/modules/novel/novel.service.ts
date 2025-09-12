import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Novel } from './novel.entity';
import { Repository } from 'typeorm';
import { CreateNovelDto } from './dto/createNovel.dto';
import { UpdateNovelDto } from './dto/updateNovel.dto';
import { RpcException } from '@nestjs/microservices';
import { defaultPageNumber, defaultPageSize } from 'src/utils/constants';
import { Author } from '../author/author.entity';
import { Genre } from '../genre/genre.entity';
import { plainToInstance } from 'class-transformer';
import { NovelResponseDto } from './dto/novelResponse.dto';

@Injectable()
export class NovelService {
  constructor(
    @InjectRepository(Novel)
    private novelRepo: Repository<Novel>,
    @InjectRepository(Author)
    private authorRepo: Repository<Author>,
    @InjectRepository(Genre)
    private genreRepo: Repository<Genre>,
  ) {}

  async create(dto: CreateNovelDto): Promise<NovelResponseDto> {
    const novel = this.novelRepo.create({
      title: dto.title,
      isOriginal: dto.isOriginal,
      contributorId: dto.contributorId,
      description: dto.description,
      coverUrl: dto.coverUrl,
    });

    if (!dto.isOriginal && dto.authorId) {
      const author = await this.authorRepo.findOneBy({ id: dto.authorId });
      if (!author)
        throw new RpcException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Không tìm thấy tác giả',
        });
      novel.author = author;
    }

    const genres = await Promise.all(
      dto.genreIds.map((id) => this.genreRepo.findOneBy({ id })),
    );
    novel.genres = genres.filter((genre) => genre !== null);

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
    if (!novel)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Không tìm thấy tiểu thuyết',
      });
    if (novel.contributorId !== currentUserId)
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Bạn không có quyền sửa tiểu thuyết này',
      });
    Object.assign(novel, dto);
    const updatedNovel = await this.novelRepo.save(novel);
    return plainToInstance(NovelResponseDto, updatedNovel, {
      excludeExtraneousValues: true,
    });
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
    contributorId?: number;
    search?: string;
    isPublishedOnly?: boolean;
  }) {
    const { genreId, contributorId, search, isPublishedOnly = true } = query;
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

    if (isPublishedOnly) {
      queryBuilder.andWhere('novel.isPublished = true');
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('novel.publishedAt', 'DESC');

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
}
