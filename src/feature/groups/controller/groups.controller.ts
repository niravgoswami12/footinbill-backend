import { MailerService } from '@nestjs-modules/mailer';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ObjectId } from 'mongoose';
import { CurrentUser } from 'src/feature/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/feature/auth/guard/jwt-auth.guard';
import { User } from 'src/feature/user/schema/user.schema';
import { UserService } from 'src/feature/user/service/user.service';
import { ParseObjectIdPipe } from 'src/shared/pipe/parse-object-id.pipe';
import { AwsService } from 'src/shared/service/aws.service';
import { AddMemberDto } from '../dto/add-member.dto';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { Activity, ActivityType } from '../schema/activity.schema';
import { Group } from '../schema/group.schema';
import { ActivitiesService } from '../service/activities.service';
import { GroupsService } from '../service/groups.service';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(
    private readonly awsService: AwsService,
    private readonly groupsService: GroupsService,
    private readonly userService: UserService,
    private mailerService: MailerService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @CurrentUser() user: User,
    @Body() createGroupDto: CreateGroupDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif)$/,
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1000, // Allow 1 MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false,
        }),
    )
    file: Express.Multer.File,
  ) {
    const group = createGroupDto as Group;
    // Check file
    if (file) {
      // uplaod file to AWS
      const image = await this.awsService.uploadFile(
        file.buffer,
        file.originalname,
      );
      group.image = image;
    }
    // Create group
    group.createdBy = user.id;
    group.members = [user.id];
    const data = await this.groupsService.create(group);
    const activity: Partial<Activity> = {
      activityType: ActivityType.group_created,
      group: { groupId: data.id, groupName: data.name },
    };
    this.activitiesService.addActivity(user, activity);
    return { message: 'Group created successfully', data };
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    const data = await this.groupsService.findAll(user.id);
    return { message: 'success', data };
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseObjectIdPipe) groupId: ObjectId,
  ) {
    const data = await this.groupsService.findOne(groupId, user.id);
    return { message: 'success', data };
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseObjectIdPipe) groupId: ObjectId,
    @Body() updateGroupDto: UpdateGroupDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif)$/,
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1000, // Allow 1 MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false,
        }),
    )
    file: Express.Multer.File,
  ) {
    const group = await this.groupsService.findOne(groupId, user.id);
    if (!group) {
      throw new NotFoundException('Group does not exist');
    }
    const updateData = {} as Group;
    if (file) {
      // Upload image
      const image = await this.awsService.uploadFile(
        file.buffer,
        file.originalname,
      );
      updateData.image = image;
      // Delete old image
      if (group.image && group.image.key) {
        this.awsService.deleteFile(group.image.key);
      }
    }
    if (updateGroupDto.name) {
      updateData.name = updateGroupDto.name;
    }
    const data = await this.groupsService.update(groupId, updateData);
    return { message: 'success', data };
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseObjectIdPipe) groupId: ObjectId,
  ) {
    if (!(await this.groupsService.findOne(groupId, user.id))) {
      throw new UnauthorizedException('Only owner can delete group');
    }
    const data = await this.groupsService.remove(groupId);
    const activity: Partial<Activity> = {
      activityType: ActivityType.group_deleted,
      group: { groupId: data.id, groupName: data.name },
    };
    this.activitiesService.addActivity(user, activity);
    return { message: 'success' };
  }

  @Post(':id/members')
  @HttpCode(200)
  async addMember(
    @CurrentUser() user: User,
    @Param('id', ParseObjectIdPipe) groupId: ObjectId,
    @Body() body: AddMemberDto,
  ) {
    const group = await this.groupsService.findOne(groupId, user.id);
    if (!group) {
      throw new NotFoundException('Group does not exist');
    }
    for (const member of body.members) {
      // Check if friend exist in Users
      let friend = await this.userService.getUserByEmail(member.email);
      if (!friend) {
        // Create user
        const newUser = {
          name: member.name,
          email: member.email,
          friends: [user._id],
        };
        friend = await this.userService.createUserAsInvited(newUser);
      } else {
        //Add currentuser  to friend user
        await this.userService.addFriend(friend.id, user.id);
      }
      //Add friend to currentuser
      await this.userService.addFriend(user.id, friend.id);
      // Add  member to group
      await this.groupsService.addMember(group.id, friend.id);
      //send invite email to newly added friend
      try {
        // friend.email = 'niravgoswami12@gmail.com';
        await this.mailerService.sendMail({
          to: friend.email,
          subject: `${user.name} added you to the group '${group.name}' on FootInBill`,
          template: './add-member',
          context: {
            name: friend.name,
            addedBy: user.name,
            addedByEmail: user.email,
            groupName: group.name,
          },
        });

        const activity: Partial<Activity> = {
          activityType: ActivityType.group_member_added,
          group: { groupId: group.id, groupName: group.name },
          addedMember: { userId: friend.id, userName: friend.name },
        };
        this.activitiesService.addActivity(user, activity);
      } catch (e) {
        throw new InternalServerErrorException(
          `An error occurred sending email: ${e.message}`,
        );
      }
    }
    return { message: 'Member Added successfully.' };
  }

  @Get(':id/members')
  async getFriends(
    @CurrentUser() user: User,
    @Param('id', ParseObjectIdPipe) groupId: ObjectId,
  ) {
    const group = await this.groupsService.findOne(groupId, user.id);
    if (!group) {
      throw new NotFoundException('Group does not exist');
    }
    //Get Groups's Member List
    const data = await group.populate('members', 'name email');

    if (!data || !data.members.length) {
      throw new NotFoundException('Members not found');
    }
    return { message: 'success.', data: data.members };
  }
}
