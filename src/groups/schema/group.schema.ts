import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from 'src/feature/user/schema/user.schema';
import { createSchemaForClassWithMethods } from 'src/shared/mongoose/create-schema';
import { ObjectId } from 'src/shared/mongoose/object-id';

@Schema({ timestamps: true })
export class Group extends Document {
  @Prop()
  name: string;

  @Prop()
  image: string;

  @Prop({ type: ObjectId, ref: 'User' })
  createdBy: User;

  @Prop({ type: [{ type: ObjectId, ref: 'User' }] })
  members: User[];

  @Prop({ default: false })
  isDeleted: boolean;
}

export const GroupSchema = createSchemaForClassWithMethods(Group);

GroupSchema.pre('find', function () {
  this.where({ isDeleted: false });
});

GroupSchema.pre('findOne', function () {
  this.where({ isDeleted: false });
});
