import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { MediaService } from './media.service';

@Module({
  imports: [SharedModule],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
