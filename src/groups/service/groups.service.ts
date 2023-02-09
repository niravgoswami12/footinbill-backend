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

  findAll(createdBy: ObjectId) {
    return this.groupModel.find({ createdBy });
  }

  async findOne(id: ObjectId, createdBy: ObjectId) {
    console.log(createdBy, id);
    const group = await this.groupModel.findOne({ id, createdBy });
    console.log('group-----', group);
    return group;
  }

  update(id: ObjectId, updateGroupDto: UpdateGroupDto) {
    return `This action updates a #${id} group`;
  }

  remove(id: ObjectId) {
    return this.groupModel.findByIdAndUpdate(id, { isDeleted: true });
  }
}
