import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [SharedModule, UserModule],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
