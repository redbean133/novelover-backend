import { Module } from '@nestjs/common';
import { NovelController } from './novel.controller';
import { NovelService } from './novel.service';
import { Novel } from './novel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/modules/shared/shared.module';
import { AuthorModule } from '../author/author.module';
import { GenreModule } from '../genre/genre.module';

@Module({
  controllers: [NovelController],
  providers: [NovelService],
  imports: [
    TypeOrmModule.forFeature([Novel]),
    SharedModule,
    AuthorModule,
    GenreModule,
  ],
  exports: [TypeOrmModule],
})
export class NovelModule {}
