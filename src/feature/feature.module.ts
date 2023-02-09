import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { GroupsModule } from './groups/groups.module';

@Module({
  imports: [AuthModule, GroupsModule],
})
export class FeatureModule {}
