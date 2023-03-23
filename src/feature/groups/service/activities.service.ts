import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { User } from 'src/feature/user/schema/user.schema';
import { GetActivitiesDto } from '../dto/get-activities.dto';
import { Activity, ActivityType } from '../schema/activity.schema';
import { Group } from '../schema/group.schema';

export interface IActivity {
  activityType: ActivityType;
  description: string;
  date: Date;
}

const ActivityLogTemplates = {
  [ActivityType.group_created]: `CREATOR_NAME created a group GROUP_NAME`,
  [ActivityType.group_deleted]: `CREATOR_NAME deleted a group GROUP_NAME`,
  [ActivityType.group_member_added]: `CREATOR_NAME added MEMBER_NAME to the group GROUP_NAME`,
  [ActivityType.expense_created]: `CREATOR_NAME added expense EXPENSE_DESC`,
};
@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<Activity>,
    @InjectModel(Group.name) private groupModel: Model<Group>,
  ) {}

  async addActivity(currentUser: User, activityData: Partial<Activity>) {
    const activity: Partial<Activity> = {
      activityType: activityData.activityType,

      createdBy: { userId: currentUser.id, userName: currentUser.name },
    };
    if (activityData.addedMember) {
      activity.addedMember = activityData.addedMember;
    }
    if (activityData.addedExpense) {
      activity.addedExpense = activityData.addedExpense;
    }
    if (activityData.group) {
      activity.group = activityData.group;
    }
    const result = await this.activityModel.create(activity);
    return { message: 'Activity is created!', data: result };
  }

  async getActivities(currentUser: User, query: GetActivitiesDto) {
    const activityQueryObj: any = {};

    // Get list of group Id for loggeding User
    let groupIds = await this.groupModel.find(
      {
        members: { $in: currentUser.id },
      },
      {
        _id: 1,
      },
    );
    groupIds = groupIds.map((g) => g._id);
    activityQueryObj.$or = [
      { 'group.groupId': { $in: groupIds } },
      { 'addedMember.userId': currentUser._id },
      { 'createdBy.userId': currentUser._id },
    ];
    console.log('activityQueryObj', activityQueryObj);
    const resultActivities = await this.activityModel
      .find(activityQueryObj)
      .sort({ createdAt: 'desc' });

    const activities: IActivity[] = resultActivities.map((activity) => {
      let creatorName = '';
      let memberName = '';
      const groupName = activity.group?.groupName || '';
      if (activity.addedMember?.userId.toString() === currentUser.id) {
        memberName = 'You';
      } else {
        memberName = activity.addedMember?.userName || '';
      }
      if (activity.createdBy?.userId.toString() === currentUser.id) {
        creatorName = 'You';
      } else {
        creatorName = activity.createdBy?.userName || '';
      }
      let desc = ActivityLogTemplates[activity.activityType]
        .replace('GROUP_NAME', groupName)
        .replace('MEMBER_NAME', memberName)
        .replace('CREATOR_NAME', creatorName);
      if (activity.addedExpense) {
        desc = desc.replace(
          'EXPENSE_DESC',
          `"${activity.addedExpense.expenseDesc}"` +
            (groupName ? ` in ${groupName}` : ''),
        );
      }
      return {
        date: activity.createdAt,
        activityType: activity.activityType,
        description: desc,
      };
    });
    return { data: activities };
  }
}
