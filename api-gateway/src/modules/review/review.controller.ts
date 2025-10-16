import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  Req,
  DefaultValuePipe,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/createReview.dto';
import { UpdateReviewDto } from './dto/updateReview.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import type { IRequestWithUser } from 'src/common/interface/IRequestWithUser';
import { OptionalAuthGuard } from 'src/common/guard/optionalAuth.guard';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreateReviewDto, @Req() req: IRequestWithUser) {
    return this.reviewService.create({ dto, currentUserId: req.user.sub });
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
    @Req() req: IRequestWithUser,
  ) {
    return this.reviewService.update({ id, dto, currentUserId: req.user.sub });
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number, @Req() req: IRequestWithUser) {
    return this.reviewService.delete({ id, currentUserId: req.user.sub });
  }

  @Get()
  findAll(
    @Query('novelId', ParseIntPipe) novelId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('sort') sort?: string,
    @Query('rating') rating?: string,
  ) {
    const ratingNumber =
      rating !== undefined ? parseInt(rating, 10) : undefined;
    return this.reviewService.findAll(novelId, {
      page,
      limit,
      sort,
      rating: ratingNumber,
    });
  }

  @UseGuards(OptionalAuthGuard)
  @Get('/overview')
  getReviewOverviewOfNovel(
    @Query('novelId', ParseIntPipe) novelId: number,
    @Req() req: IRequestWithUser,
  ) {
    return this.reviewService.getReviewOverviewOfNovel(novelId, req?.user?.sub);
  }
}
