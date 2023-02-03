import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from '../service/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
}
