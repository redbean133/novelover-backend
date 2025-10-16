import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/createReview.dto';
import { UpdateReviewDto } from './dto/updateReview.dto';

@Controller()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @MessagePattern({ cmd: 'review.create' })
  create(@Payload() payload: { dto: CreateReviewDto; currentUserId: string }) {
    return this.reviewService.create(payload.dto, payload.currentUserId);
  }

  @MessagePattern({ cmd: 'review.update' })
  update(
    @Payload()
    payload: {
      id: number;
      dto: UpdateReviewDto;
      currentUserId: string;
    },
  ) {
    return this.reviewService.update(
      payload.id,
      payload.dto,
      payload.currentUserId,
    );
  }

  @MessagePattern({ cmd: 'review.delete' })
  delete(@Payload() payload: { id: number; currentUserId: string }) {
    return this.reviewService.delete(payload.id, payload.currentUserId);
  }

  @MessagePattern({ cmd: 'review.find-one' })
  findOne(@Payload() payload: { novelId: number; userId: string }) {
    return this.reviewService.findOne(payload.novelId, payload.userId);
  }

  @MessagePattern({ cmd: 'review.find-all' })
  findAll(
    @Payload()
    payload: {
      novelId: number;
      query: {
        page?: number;
        limit?: number;
        sort?: 'DESC' | 'ASC';
        rating?: number;
      };
    },
  ) {
    return this.reviewService.findAll(payload.novelId, payload.query);
  }

  @MessagePattern({ cmd: 'review.get-overview-of-novel' })
  getReviewOverviewOfNovel(
    @Payload() payload: { novelId: number; currentUserId?: string },
  ) {
    return this.reviewService.getReviewOverviewOfNovel(
      payload.novelId,
      payload.currentUserId,
    );
  }
}
