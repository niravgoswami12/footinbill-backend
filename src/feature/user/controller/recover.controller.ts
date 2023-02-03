import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { Recover } from '../schema/recover.schema';
import { RecoverService } from '../service/recover.service';
import { RecoverPasswordDto } from '../dto/recover-password.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { environments } from '../../../environments/environments';

@Controller('recover')
export class RecoverController {
  constructor(
    private userService: UserService,
    private recoverService: RecoverService,
    private mailerService: MailerService,
  ) {}

  @Post()
  @HttpCode(200)
  async recoverPassword(@Body() body: RecoverPasswordDto) {
    const user = await this.userService.validateUserByEmail(body.email);

    const { code } = await this.recoverService.create(user);

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Recover your password',
        template: './recover', // This will fetch /template/recover.hbs
        context: {
          name: user.name,
          code,
        },
      });
      return { message: 'Please check your email' };
    } catch (e) {
      console.log('recoverPassword--', e);
      throw new InternalServerErrorException(
        `An error occurred sending email: ${e.message}`,
      );
    }
  }

  @Post(':code')
  @HttpCode(200)
  async changePassword(
    @Param('code') code: Recover['code'],
    @Body() body: UpdatePasswordDto,
  ) {
    const recover = await this.validateCode(code);

    if (body.password !== body.confirmPassword) {
      throw new BadRequestException(`Passwords does not match`);
    }

    const user = recover.owner;

    if (await user.validatePassword(body.password)) {
      throw new BadRequestException('Do not use your current password');
    }

    user.password = body.password;

    await this.recoverService.delete(user);

    await user.save();
    return { message: 'Password updated successfully.' };
  }

  private async validateCode(code: string) {
    const recover = await this.recoverService.get(code);

    if (!recover) {
      throw new NotFoundException('Code not found');
    }

    return recover;
  }
}
