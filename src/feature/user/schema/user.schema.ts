import { Prop, Schema } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Document } from 'mongoose';
import { ObjectId } from 'src/shared/mongoose/object-id';
import { createSchemaForClassWithMethods } from '../../../shared/mongoose/create-schema';
import { randomString } from '../../../shared/utils/random-string';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop()
  name: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  sessionToken: string;

  @Prop()
  password?: string;

  @Prop()
  facebookId?: string;

  @Prop()
  googleId?: string;

  get isSocial(): boolean {
    return !!(this.facebookId || this.googleId);
  }

  @Prop({ type: [{ type: ObjectId, ref: 'User' }] })
  friends: User[];

  @Prop({ default: false })
  isInvitePending: boolean;

  generateSessionToken() {
    this.sessionToken = randomString(60);
  }

  validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password || '');
  }
}

export const UserSchema = createSchemaForClassWithMethods(User);

// Update password into a hashed one.
UserSchema.pre('save', async function (next) {
  const user: User = this as any;

  if (!user.password || user.password.startsWith('$')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (e) {
    next(e);
  }
});
