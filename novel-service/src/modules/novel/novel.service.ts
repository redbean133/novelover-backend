import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Novel } from './novel.entity';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class NovelService {
  constructor(
    @InjectRepository(Novel)
    private novelRepo: Repository<Novel>,
  ) {}

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
      | 'numberOfVotes'
      | 'numberOfViews'
    >,
    value: number,
  ) {
    await this.novelRepo.increment({ id: novelId }, field, value);
  }

  async updateRating(novelId: number, point: number, count: number) {
    await this.novelRepo
      .createQueryBuilder()
      .update()
      .set({
        totalReviewPoints: () => `"total_review_points" + ${point}`,
        numberOfReviews: () => `"number_of_reviews" + ${count}`,
        averageRating: () =>
          `CASE 
         WHEN "number_of_reviews" + ${count} > 0 
         THEN ("total_review_points" + ${point})::float / ("number_of_reviews" + ${count}) 
         ELSE 0 
       END`,
      })
      .where('id = :id', { id: novelId })
      .execute();
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

  updateLatestPublishedChapterTime(novelId: number, time: Date) {
    this.novelRepo.update(novelId, { latestPublishedChapterTime: time });
  }
}
