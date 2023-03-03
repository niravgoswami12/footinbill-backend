import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { Group } from '../schema/group.schema';

@Injectable()
export class GroupsService {
  constructor(@InjectModel(Group.name) private groupModel: Model<Group>) {}
  async create(createGroupDto: Group) {
    const group = await this.groupModel.create(createGroupDto);
    return group.save();
  }

  findAll(userId: ObjectId) {
    return this.groupModel.find({ members: { $in: userId } });
  }

  async findOne(id: ObjectId | string, userId?: ObjectId) {
    const group = await this.groupModel.findOne({
      _id: id,
      members: { $elemMatch: { $eq: userId } },
    });
    return group;
  }

  update(id: ObjectId, updateGroupDto: UpdateGroupDto) {
    return this.groupModel.findByIdAndUpdate(id, updateGroupDto, { new: true });
  }

  remove(id: ObjectId) {
    return this.groupModel.findByIdAndUpdate(id, { isDeleted: true });
  }

  async addMember(groupId: string, memberId: string) {
    return this.groupModel.findByIdAndUpdate(groupId, {
      $addToSet: { members: [memberId] },
    });
  }
}
