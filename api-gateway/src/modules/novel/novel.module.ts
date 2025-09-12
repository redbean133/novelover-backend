import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { NovelController } from './novel.controller';
import { NovelService } from './novel.service';
import { MediaModule } from '../media/media.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [SharedModule, MediaModule, UserModule],
  controllers: [NovelController],
  providers: [NovelService],
})
export class NovelModule {}
