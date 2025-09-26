import { Controller } from '@nestjs/common';
import { MediaService } from './media.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @MessagePattern({ cmd: 'media.upload-media' })
  async uploadFile(data: {
    buffer: Buffer;
    folderName?: string;
    resourceType?: 'auto' | 'image' | 'video' | 'raw';
    fileName?: string;
  }) {
    const {
      buffer,
      folderName = 'common',
      resourceType = 'auto',
      fileName = 'file_' + Date.now(),
    } = data;
    return this.mediaService.uploadFile(
      buffer,
      folderName,
      resourceType,
      fileName,
    );
  }
}
