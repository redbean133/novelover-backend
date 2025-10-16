import { HttpStatus, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { NovelService } from './novel.service';
import {
  PublicNovelInListResponseDto,
  PublicNovelResponseDto,
} from './dto/novelResponse.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Novel } from './novel.entity';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class PublicNovelService {
  constructor(
    private readonly novelService: NovelService,
    @InjectRepository(Novel)
    private novelRepo: Repository<Novel>,
  ) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    genreIds?: number[];
    contributorId?: string;
    completionStatus?: 'completed' | 'ongoing';
    source?: 'original' | 'collected';
    sort?: 'ASC' | 'DESC';
    sortBy?:
      | 'latestPublishedChapterTime'
      | 'numberOfViews'
      | 'numberOfVotes'
      | 'averageRating';
  }) {
    const {
      page = 1,
      limit = 24,
      search = '',
      genreIds = [],
      contributorId = '',
      completionStatus = '',
      source = '',
      sort = 'DESC',
      sortBy = 'latestPublishedChapterTime',
    } = query;

    const queryBuilder = this.novelRepo
      .createQueryBuilder('novel')
      .where('novel.isPublished = :isPublished', { isPublished: true })
      .leftJoinAndSelect('novel.author', 'author')
      .leftJoinAndSelect('novel.genres', 'genres');

    if (search) {
      queryBuilder.andWhere(
        `(
      novel.title ILIKE :search 
      OR author.name ILIKE :search
      OR similarity(novel.title, :rawSearch) > 0.3
      OR similarity(author.name, :rawSearch) > 0.6
    )`,
        {
          search: `%${search}%`,
          rawSearch: search,
        },
      );
    }

    if (genreIds.length) {
      queryBuilder.andWhere('genres.id IN (:...genreIds)', { genreIds });
    }

    if (contributorId) {
      queryBuilder.andWhere('novel.contributorId = :contributorId', {
        contributorId,
      });
    }

    if (completionStatus) {
      const isCompleted = completionStatus === 'completed';
      queryBuilder.andWhere('novel.isCompleted = :isCompleted', {
        isCompleted,
      });
    }

    if (source) {
      const isOriginal = source === 'original';
      queryBuilder.andWhere('novel.isOriginal = :isOriginal', { isOriginal });
    }

    queryBuilder.orderBy(`novel.${sortBy}`, sort);

    queryBuilder.skip((page - 1) * limit).take(limit);
    const [data, total] = await queryBuilder.getManyAndCount();
    const result = {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return {
      ...result,
      data: plainToInstance(PublicNovelInListResponseDto, result.data, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async findOne(id: number): Promise<PublicNovelResponseDto> {
    const queryBuilder = this.novelRepo
      .createQueryBuilder('novel')
      .leftJoinAndSelect('novel.author', 'author')
      .leftJoinAndSelect('novel.genres', 'genres')
      .where('novel.id = :id', { id })
      .andWhere('novel.isPublished = :isPublished', { isPublished: true });

    const novel = await queryBuilder.getOne();
    if (!novel) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Không tìm thấy tiểu thuyết',
      });
    }

    return plainToInstance(PublicNovelResponseDto, novel, {
      excludeExtraneousValues: true,
    });
  }
}
