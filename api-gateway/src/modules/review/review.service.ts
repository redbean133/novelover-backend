import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateReviewDto } from './dto/createReview.dto';
import { UpdateReviewDto } from './dto/updateReview.dto';
import { IReview } from './interface/IReview';
import { UserService } from '../user/user.service';

@Injectable()
export class ReviewService {
  constructor(
    @Inject('NOVEL_SERVICE') private client: ClientProxy,
    private readonly userService: UserService,
  ) {}

  async create(payload: { dto: CreateReviewDto; currentUserId: string }) {
    return firstValueFrom<IReview>(
      this.client.send({ cmd: 'review.create' }, payload),
    );
  }

  async update(payload: {
    id: number;
    dto: UpdateReviewDto;
    currentUserId: string;
  }) {
    return firstValueFrom<IReview>(
      this.client.send({ cmd: 'review.update' }, payload),
    );
  }

  async delete(payload: { id: number; currentUserId: string }) {
    return firstValueFrom<{ success: boolean }>(
      this.client.send({ cmd: 'review.delete' }, payload),
    );
  }

  async findOne(payload: { novelId: number; userId: string }) {
    return firstValueFrom<IReview>(
      this.client.send({ cmd: 'review.find-one' }, payload),
    );
  }

  async findAll(
    novelId: number,
    query: { page?: number; limit?: number; sort?: string; rating?: number },
  ) {
    const { data, total, page, limit, totalPages } = await firstValueFrom<{
      data: IReview[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(this.client.send({ cmd: 'review.find-all' }, { novelId, query }));

    if (!data.length) return { data: [], total, page, limit, totalPages };

    const userIds = [...new Set(data.map((n) => n.userId))];
    const users = await firstValueFrom(this.userService.getUsersByIds(userIds));
    const userMap = new Map(
      users.map((user) => [
        user.id,
        { displayName: user.displayName, avatarUrl: user.avatarUrl },
      ]),
    );

    const reviewsWithUserInfo = data.map((review) => ({
      ...review,
      userName: userMap.get(review.userId)?.displayName ?? '',
      userAvatarUrl: userMap.get(review.userId)?.avatarUrl ?? '',
    }));

    return { data: reviewsWithUserInfo, total, page, limit, totalPages };
  }

  getReviewOverviewOfNovel(novelId: number, currentUserId?: string) {
    return this.client.send(
      { cmd: 'review.get-overview-of-novel' },
      { novelId, currentUserId },
    );
  }
}
