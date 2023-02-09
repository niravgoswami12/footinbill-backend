import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectId } from 'src/shared/mongoose/object-id';
import { createSchemaForClassWithMethods } from '../../../shared/mongoose/create-schema';

import { User } from './user.schema';

@Schema()
export class Recover extends Document {
  @Prop()
  code: string;

  @Prop({ type: ObjectId, ref: User.name })
  owner: User;

  @Prop({ type: Date, expires: '5m', default: Date.now })
  createdAt: Date;
}

export const RecoverSchema = createSchemaForClassWithMethods(Recover);
