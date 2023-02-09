import { MailerService } from '@nestjs-modules/mailer';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@sentry/node';
import { CurrentUser } from 'src/feature/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/feature/auth/guard/jwt-auth.guard';
import { AddFriendDto } from '../dto/add-friend.dto';
import { UserService } from '../service/user.service';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private userService: UserService,
    private mailerService: MailerService,
  ) {}

  @Post('friend')
  @HttpCode(200)
  async addFriend(@CurrentUser() user: User, @Body() body: AddFriendDto) {
    // Check if friend exist in Users
    let friend = await this.userService.getUserByEmail(body.email);
    if (!friend) {
      // Create user
      const newUser: User = {
        name: body.name,
        email: body.email,
        friends: [user._id],
      };
      friend = await this.userService.createUserAsInvited(newUser);
    } else {
      //Add currentuser  to friend user
      await this.userService.addFriend(friend.id, user.id);
    }
    //Add friend to currentuser
    await this.userService.addFriend(user.id, friend.id);

    //send invite email to newly added friend
    try {
      // friend.email = 'niravgoswami12@gmail.com';
      await this.mailerService.sendMail({
        to: friend.email,
        subject: `${user.name} added you to the friendlist on FootInBill`,
        template: './add-friend',
        context: {
          name: friend.name,
          addedBy: user.name,
          addedByEmail: user.email,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(
        `An error occurred sending email: ${e.message}`,
      );
    }
    return { message: 'Friend Added successfully.' };
  }

  @Get('friend')
  async getFriends(@CurrentUser() user: User) {
    //Get User's Friend List
    const userData = await user.populate('friends', 'name email');
    if (!userData || !userData.friends.length) {
      throw new NotFoundException('Friends not found');
    }
    return { message: 'success.', data: userData.friends };
  }
}
