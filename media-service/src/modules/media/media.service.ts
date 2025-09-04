import { Inject, Injectable } from '@nestjs/common';
import { UploadApiResponse } from 'cloudinary';
import { v2 } from 'cloudinary';

type SerializedBuffer = { type: 'Buffer'; data: number[] };

@Injectable()
export class MediaService {
  constructor(@Inject('CLOUDINARY') private cloudinary: typeof v2) {}

  async uploadFile(
    file: Express.Multer.File,
    folderName: string,
  ): Promise<{ url: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        { folder: folderName },
        (error, result) => {
          if (error) return reject(new Error(JSON.stringify(error)));
          resolve({ url: (result as UploadApiResponse).secure_url });
        },
      );

      const realBuffer = Buffer.isBuffer(file.buffer)
        ? file.buffer
        : Buffer.from((file.buffer as SerializedBuffer).data);

      uploadStream.end(realBuffer);
    });
  }
}
