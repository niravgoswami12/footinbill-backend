import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ParseObjectIdPipe } from './pipe/parse-object-id.pipe';
import { AwsService } from './service/aws.service';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [ParseObjectIdPipe, AwsService],
  exports: [ParseObjectIdPipe, AwsService],
})
export class SharedModule {}
