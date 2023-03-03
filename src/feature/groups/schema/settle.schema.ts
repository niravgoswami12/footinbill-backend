import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from 'src/feature/user/schema/user.schema';
import { createSchemaForClassWithMethods } from 'src/shared/mongoose/create-schema';
import { ObjectId } from 'src/shared/mongoose/object-id';
import { Group } from './group.schema';

@Schema({ timestamps: true })
export class Settle extends Document {
  @Prop({ type: { type: ObjectId, ref: 'User' } })
  payer: User;

  @Prop({ type: { type: ObjectId, ref: 'User' } })
  recipientId: User;

  @Prop()
  description: string;

  @Prop()
  settleAmount: number;

  @Prop({ type: ObjectId, ref: 'Group' })
  group: Group;

  @Prop({ type: ObjectId, ref: 'User' })
  createdBy: User;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const SettleSchema = createSchemaForClassWithMethods(Settle);
