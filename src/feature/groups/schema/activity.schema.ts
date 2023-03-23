import { Prop, raw, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from 'src/feature/user/schema/user.schema';
import { createSchemaForClassWithMethods } from 'src/shared/mongoose/create-schema';
import { ObjectId } from 'src/shared/mongoose/object-id';
import { Expense } from './expense.schema';
import { Group } from './group.schema';

export enum ActivityType {
  group_created = 'group_created',
  group_deleted = 'group_deleted',
  group_member_added = 'group_member_added',
  expense_created = 'expense_created',
}

@Schema()
class UserIdName {
  @Prop({ type: ObjectId, ref: 'User' })
  userId: User;

  @Prop()
  userName: string;
}

@Schema()
class GroupIdName {
  @Prop({ type: ObjectId, ref: 'Group' })
  groupId: Group;

  @Prop()
  groupName: string;
}

@Schema()
class addedExpense {
  @Prop({ type: ObjectId, ref: 'Expense' })
  expenseId: Expense;

  @Prop()
  expenseDesc: string;
}

@Schema({ timestamps: true })
export class Activity extends Document {
  @Prop({ type: String, enum: ActivityType })
  activityType: ActivityType;

  @Prop(
    raw({
      type: {
        userName: String,
        userId: { type: ObjectId, ref: 'User' },
        _id: false,
      },
    }),
  )
  addedMember: UserIdName;

  @Prop(
    raw({
      type: {
        userName: String,
        userId: { type: ObjectId, ref: 'User' },
        _id: false,
      },
    }),
  )
  createdBy: UserIdName;

  @Prop(
    raw({
      type: {
        expenseDesc: String,
        expenseId: { type: ObjectId, ref: 'Expense' },
        _id: false,
      },
    }),
  )
  addedExpense: addedExpense;

  @Prop(
    raw({
      type: {
        groupName: String,
        groupId: { type: ObjectId, ref: 'Group' },
        _id: false,
      },
    }),
  )
  group: GroupIdName;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const ActivitySchema = createSchemaForClassWithMethods(Activity);
