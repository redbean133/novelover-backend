import { Module } from '@nestjs/common';
import { NovelService } from './novel.service';
import { Novel } from './novel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/modules/shared/shared.module';
import { AuthorModule } from '../author/author.module';
import { GenreModule } from '../genre/genre.module';
import { MyNovelController } from './myNovel.controller';
import { MyNovelService } from './myNovel.service';
import { PublicNovelController } from './publicNovel.controller';
import { PublicNovelService } from './publicNovel.service';

@Module({
  controllers: [MyNovelController, PublicNovelController],
  providers: [MyNovelService, PublicNovelService, NovelService],
  imports: [
    TypeOrmModule.forFeature([Novel]),
    SharedModule,
    AuthorModule,
    GenreModule,
  ],
  exports: [NovelService],
})
export class NovelModule {}
