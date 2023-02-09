import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AwsService {
  constructor(private readonly configService: ConfigService) {}

  async uploadFile(dataBuffer: Buffer, fileName: string) {
    const s3 = new S3();
    const uploadResult = await s3
      .upload({
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Body: dataBuffer,
        Key: `${uuid()}-${fileName}`,
      })
      .promise();

    const fileStorageInDB = {
      fileName: fileName,
      fileUrl: uploadResult.Location,
      key: uploadResult.Key,
    };

    return fileStorageInDB;
  }

  async deleteFile(key: string) {
    const s3 = new S3();
    return await s3
      .deleteObject({
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Key: key,
      })
      .promise();
  }
}
