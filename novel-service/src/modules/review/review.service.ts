import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/createReview.dto';
import { RpcException } from '@nestjs/microservices';
import { UpdateReviewDto } from './dto/updateReview.dto';
import { NovelService } from '../novel/novel.service';

@Injectable()
export class ReviewService {
  constructor(
    private readonly novelService: NovelService,
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
  ) {}

  async create(dto: CreateReviewDto, currentUserId: string) {
    const existed = await this.reviewRepo.findOneBy({
      novelId: dto.novelId,
      userId: currentUserId,
    });
    if (existed) {
      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: 'Bạn đã đánh giá truyện này rồi',
      });
    }

    const review = this.reviewRepo.create({ ...dto, userId: currentUserId });
    const savedReview = await this.reviewRepo.save(review);
    await this.novelService.updateRating(
      savedReview.novelId,
      savedReview.rating,
      1,
    );
    return savedReview;
  }

  async update(id: number, dto: UpdateReviewDto, currentUserId: string) {
    const review = await this.reviewRepo.findOneBy({ id });

    if (!review)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Review không tồn tại',
      });

    if (review.userId !== currentUserId)
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Bạn không có quyền chỉnh sửa đánh giá này',
      });

    const oldRating = review.rating;
    Object.assign(review, dto);
    const savedReview = await this.reviewRepo.save(review);
    await this.novelService.updateRating(
      savedReview.novelId,
      savedReview.rating - oldRating,
      0,
    );
    return savedReview;
  }

  async delete(id: number, currentUserId: string) {
    const review = await this.reviewRepo.findOneBy({ id });
    if (!review)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Review không tồn tại',
      });

    if (review.userId !== currentUserId)
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Bạn không có quyền xóa đánh giá này',
      });

    await this.reviewRepo.remove(review);
    await this.novelService.updateRating(review.novelId, -review.rating, -1);
    return { success: true };
  }

  async findOne(novelId: number, userId: string) {
    return this.reviewRepo.findOneBy({ novelId, userId });
  }

  async findAll(
    novelId: number,
    query: {
      page?: number;
      limit?: number;
      sort?: 'DESC' | 'ASC';
      rating?: number;
    },
  ) {
    const { page = 1, limit = 12, sort = 'DESC', rating } = query;

    const [data, total] = await this.reviewRepo.findAndCount({
      where: { novelId, ...(rating && { rating }) },
      order: { id: sort },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getReviewOverviewOfNovel(novelId: number, currentUserId?: string) {
    const statsRaw = await this.reviewRepo
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.novelId = :novelId', { novelId })
      .groupBy('review.rating')
      .getRawMany<{ rating: number; count: string }>();

    const ratingStats: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    statsRaw.forEach((row) => {
      const rating = Number(row.rating) as 1 | 2 | 3 | 4 | 5;
      if (ratingStats[rating] !== undefined) {
        ratingStats[rating] = Number(row.count);
      }
    });

    let myReview: Review | null = null;
    if (currentUserId) {
      myReview = await this.reviewRepo.findOne({
        where: { novelId, userId: currentUserId },
      });
    }

    return {
      myReview,
      ratingStats,
    };
  }
}
