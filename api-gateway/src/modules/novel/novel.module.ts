import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { MediaModule } from '../media/media.module';
import { UserModule } from '../user/user.module';
import { MyNovelController } from './myNovel.controller';
import { MyNovelService } from './myNovel.service';
import { PublicNovelController } from './publicNovel.controller';
import { PublicNovelService } from './publicNovel.service';

@Module({
  imports: [SharedModule, MediaModule, UserModule],
  controllers: [PublicNovelController, MyNovelController],
  providers: [PublicNovelService, MyNovelService],
})
export class NovelModule {}
