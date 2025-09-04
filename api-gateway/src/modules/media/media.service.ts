import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Injectable()
export class MediaService {
  constructor(
    @Inject('MEDIA_SERVICE') private readonly mediaServiceClient: ClientProxy,
  ) {}

  uploadMedia(
    file: Express.Multer.File,
    folderName?: string,
  ): Observable<{ url: string }> {
    return this.mediaServiceClient.send(
      { cmd: 'media.upload-media' },
      { file, folderName },
    );
  }
}
