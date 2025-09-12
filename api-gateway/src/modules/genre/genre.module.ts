import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { GenreController } from './genre.controller';
import { GenreService } from './genre.service';

@Module({
  imports: [SharedModule],
  controllers: [GenreController],
  providers: [GenreService],
})
export class GenreModule {}
