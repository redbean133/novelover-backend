import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { AuthorController } from './author.controller';
import { AuthorService } from './author.service';

@Module({
  imports: [SharedModule],
  controllers: [AuthorController],
  providers: [AuthorService],
})
export class AuthorModule {}
