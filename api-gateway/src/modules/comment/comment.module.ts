import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [SharedModule, UserModule],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
