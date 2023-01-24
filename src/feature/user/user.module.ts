import { UserController } from './controller/user.controller';
import { SettingsController } from './controller/settings.controller';
import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserService } from './service/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { Recover, RecoverSchema } from './schema/recover.schema';
import { RecoverController } from './controller/recover.controller';
import { RecoverService } from './service/recover.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Recover.name,
        schema: RecoverSchema,
      },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController, SettingsController, RecoverController],
  providers: [UserService, RecoverService],
  exports: [UserService],
})
export class UserModule {}
