import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Injectable()
export class MediaService {
  constructor(
    @Inject('MEDIA_SERVICE') private readonly mediaServiceClient: ClientProxy,
  ) {}

  uploadMedia(
    buffer: Buffer,
    folderName?: string,
    resourceType?: 'auto' | 'image' | 'video' | 'raw',
    fileName?: string,
  ): Observable<{ url: string }> {
    return this.mediaServiceClient.send(
      { cmd: 'media.upload-media' },
      { buffer, folderName, resourceType, fileName },
    );
  }
}
