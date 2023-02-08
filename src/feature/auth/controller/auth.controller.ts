import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FacebookAuthService } from 'facebook-auth-nestjs';
import { User } from '../../user/schema/user.schema';
import { UserService } from '../../user/service/user.service';
import { AuthNotRequired } from '../decorators/auth-not-required.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { AuthService } from '../service/auth.service';
import { GoogleAuthService } from '../service/google-auth.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private facebookService: FacebookAuthService,
    private googleService: GoogleAuthService,
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginDto) {
    const data = await this.authService.login(
      await this.authService.validate(body.email, body.password),
    );
    return {
      message: 'LoggedIn Successfully',
      data,
    };
  }

  @Post('facebook-login')
  @AuthNotRequired()
  @UseGuards(JwtAuthGuard)
  async facebookLogin(
    @CurrentUser() user: User,
    @Body('accessToken') accessToken: string,
  ) {
    const data = await this.authService.loginWithThirdParty('facebookId', () =>
      this.facebookService.getUser(
        accessToken,
        'id',
        'name',
        'email',
        'first_name',
        'last_name',
      ),
    );

    return {
      message: 'LoggedIn Successfully',
      data,
    };
  }

  @Post('google-login')
  @AuthNotRequired()
  @UseGuards(JwtAuthGuard)
  async googleLogin(
    @CurrentUser() user: User,
    @Body('accessToken') accessToken: string,
  ) {
    const data = await this.authService.loginWithThirdParty(
      'googleId',
      () => this.googleService.getUser(accessToken),
      user,
    );

    return {
      message: 'LoggedIn Successfully',
      data,
    };
  }

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    const data = await this.authService.loginWithRefreshToken(refreshToken);
    return {
      message: 'Token Updated Successfully',
      data,
    };
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    if (await this.userService.getSelfRegisteredUserByEmail(body.email)) {
      throw new BadRequestException('Email already exists');
    }

    const user = await this.userService.create(body);

    return {
      message: 'Registered Successfully',
      data: await this.authService.login(user),
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: User) {
    const data = await this.userService.filterUser(user, ['email']);
    return {
      message: 'Success!!!',
      data,
    };
  }
}
