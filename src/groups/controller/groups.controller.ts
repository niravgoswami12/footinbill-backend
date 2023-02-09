import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { CurrentUser } from 'src/feature/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/feature/auth/guard/jwt-auth.guard';
import { User } from 'src/feature/user/schema/user.schema';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { Group } from '../schema/group.schema';
import { GroupsService } from '../service/groups.service';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createGroupDto: CreateGroupDto,
  ) {
    const group = createGroupDto as Group;
    group.createdBy = user.id;
    const data = await this.groupsService.create(group);
    return { message: 'Group created successfully', data };
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    const data = await this.groupsService.findAll(user.id);
    return { message: 'success', data };
  }

  @Get(':id')
  async findOne(@CurrentUser() user: User, @Param('id') groupId: ObjectId) {
    const data = await this.groupsService.findOne(groupId, user.id);
    return { message: 'success', data };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') groupId: ObjectId,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    const data = await this.groupsService.update(groupId, updateGroupDto);
    return { message: 'success', data };
  }

  @Delete(':id')
  async remove(@CurrentUser() user: User, @Param('id') groupId: ObjectId) {
    if (!(await this.groupsService.findOne(groupId, user.id))) {
      throw new UnauthorizedException('Only owner can delete group');
    }
    await this.groupsService.remove(groupId);
    return { message: 'success' };
  }
}
