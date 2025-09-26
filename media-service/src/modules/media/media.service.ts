import { Inject, Injectable } from '@nestjs/common';
import { UploadApiResponse } from 'cloudinary';
import { v2 } from 'cloudinary';

type SerializedBuffer = { type: 'Buffer'; data: number[] };

@Injectable()
export class MediaService {
  constructor(@Inject('CLOUDINARY') private cloudinary: typeof v2) {}

  /**
   * Upload file or base64 data to Cloudinary
   * @param file - Multer file
   * @param folderName - target folder
   * @param resourceType - 'image' | 'video' | 'raw' | 'auto'
   */
  async uploadFile(
    buffer: Buffer | SerializedBuffer,
    folderName: string,
    resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto',
    fileName: string,
  ): Promise<{ url: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: folderName,
          resource_type: resourceType,
          public_id: fileName,
        },
        (error, result) => {
          if (error) return reject(new Error(JSON.stringify(error)));
          resolve({ url: (result as UploadApiResponse).secure_url });
        },
      );

      const realBuffer = Buffer.isBuffer(buffer)
        ? buffer
        : Buffer.from(buffer.data);

      uploadStream.end(realBuffer);
    });
  }
}
