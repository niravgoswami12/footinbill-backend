import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/feature/auth/auth.module';
import { GroupsController } from './controller/groups.controller';
import { Group, GroupSchema } from './schema/group.schema';
import { GroupsService } from './service/groups.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Group.name,
        schema: GroupSchema,
      },
    ]),
    AuthModule,
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
