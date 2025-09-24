import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Novel } from './novel.entity';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { defaultPageNumber, defaultPageSize } from 'src/utils/constants';

@Injectable()
export class NovelService {
  constructor(
    @InjectRepository(Novel)
    private novelRepo: Repository<Novel>,
  ) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    genreId?: number;
    contributorId?: string;
    search?: string;
    status?: 'published' | 'draft';
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
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const queryBuilder = this.novelRepo
      .createQueryBuilder('novel')
      .leftJoinAndSelect('novel.author', 'author')
      .leftJoinAndSelect('novel.genres', 'genres')
      .where('novel.id = :id', { id });

    const novel = await queryBuilder.getOne();
    if (!novel) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Không tìm thấy tiểu thuyết',
      });
    }

    return novel;
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

  async handlePublishAndCompleteState(novelId: number) {
    const novel = await this.novelRepo.findOneBy({ id: novelId });
    if (!novel) return;
    if (
      novel.numberOfPublishedChapters <= 0 &&
      (novel.isPublished || novel.isCompleted)
    ) {
      await this.novelRepo.update(
        { id: novelId },
        {
          isPublished: false,
          isCompleted: false,
          publishedAt: null,
          completedAt: null,
        },
      );
    }
  }
}
