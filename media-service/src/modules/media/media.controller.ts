import { Controller } from '@nestjs/common';
import { MediaService } from './media.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @MessagePattern({ cmd: 'media.upload-media' })
  async uploadFile(data: { file: Express.Multer.File; folderName?: string }) {
    const { file, folderName = 'common' } = data;
    return this.mediaService.uploadFile(file, folderName);
  }
}
