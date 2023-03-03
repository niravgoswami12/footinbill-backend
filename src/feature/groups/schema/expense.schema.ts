import { Prop, raw, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from 'src/feature/user/schema/user.schema';
import { createSchemaForClassWithMethods } from 'src/shared/mongoose/create-schema';
import { ObjectId } from 'src/shared/mongoose/object-id';
import { Group } from './group.schema';

export enum SplitType {
  equally,
  unequally,
}

export enum SplitMethod {
  byExactAmount,
  byPercentage,
}
@Schema()
class PaidBy {
  @Prop({ type: ObjectId, ref: 'User' })
  paidByUser: User;

  @Prop()
  paidByAmount: number;
}

@Schema()
class SplitWith {
  @Prop({ type: ObjectId, ref: 'User' })
  splitWithUser: User;

  @Prop()
  splitWithAmount: number;
}

@Schema({ timestamps: true })
export class Expense extends Document {
  @Prop({ type: [{ type: ObjectId, ref: 'User' }] })
  members: User[];

  @Prop()
  description: string;

  @Prop()
  totalAmount: number;

  @Prop(
    raw({
      type: [
        {
          paidByAmount: Number,
          paidByUser: { type: ObjectId, ref: 'User' },
          _id: false,
        },
      ],
    }),
  )
  paidBy: PaidBy[];

  @Prop(
    raw({
      type: [
        {
          splitWithAmount: Number,
          splitWithUser: { type: ObjectId, ref: 'User' },
          _id: false,
        },
      ],
    }),
  )
  splitWith: SplitWith[];

  @Prop({ type: String, enum: SplitType })
  splitType: SplitType;

  @Prop({ type: String, enum: SplitMethod })
  splitMethod: SplitMethod;

  @Prop({ type: ObjectId, ref: 'Group' })
  group: Group;

  @Prop({ type: ObjectId, ref: 'User' })
  createdBy: User;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const ExpenseSchema = createSchemaForClassWithMethods(Expense);
