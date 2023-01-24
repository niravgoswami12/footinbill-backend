import {
  BadRequestException,
  Body,
  Controller,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { UpdateEmailDto } from '../dto/update-email.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { User } from '../schema/user.schema';
import { UserService } from '../service/user.service';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private userService: UserService) {}

  @Put('password')
  async updatePassword(
    @CurrentUser() user: User,
    @Body() body: UpdatePasswordDto,
  ) {
    if (!user.isSocial && !body.currentPassword) {
      throw new BadRequestException('currentPassword should not be empty test');
    }
    if (
      !user.isSocial &&
      !(await user.validatePassword(body.currentPassword))
    ) {
      throw new BadRequestException('Current password does not match');
    }
    if (body.password !== body.confirmPassword) {
      throw new BadRequestException('Passwords does not match');
    }
    if (await user.validatePassword(body.password)) {
      throw new BadRequestException('Do not use your current password');
    }

    user.password = body.password;

    await user.save();

    return { message: 'Password updated successfully.' };
  }
}
