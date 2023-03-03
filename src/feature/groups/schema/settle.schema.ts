import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from 'src/feature/user/schema/user.schema';
import { createSchemaForClassWithMethods } from 'src/shared/mongoose/create-schema';
import { ObjectId } from 'src/shared/mongoose/object-id';
import { Expense } from './expense.schema';
import { Group } from './group.schema';

@Schema({ timestamps: true })
export class Settle extends Document {
  @Prop({ type: ObjectId, ref: User.name })
  payer: User;

  @Prop({ type: ObjectId, ref: User.name })
  recipient: User;

  @Prop()
  description: string;

  @Prop()
  settleAmount: number;

  @Prop({ type: ObjectId, ref: Group.name })
  group: Group;

  @Prop({ type: ObjectId, ref: Expense.name })
  expense: Expense;

  @Prop({ type: ObjectId, ref: User.name })
  createdBy: User;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const SettleSchema = createSchemaForClassWithMethods(Settle);
