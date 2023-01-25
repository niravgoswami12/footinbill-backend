import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { User } from '../schema/user.schema';

@Injectable()
export class UserService {
  private blockedFields: (keyof User)[] = [
    'password',
    'sessionToken',
    'email',
    'facebookId',
    'googleId',
  ];

  unpopulatedFields = '-' + this.blockedFields.join(' -');

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  getUserByEmail(mail: string) {
    const email = { $regex: new RegExp(`^${mail}$`, 'i') };

    return this.userModel.findOne({ email });
  }

  async validateUserByEmail(email: string) {
    const user = await this.getUserByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  getUserBy(filter: FilterQuery<User>) {
    return this.userModel.findOne(filter);
  }

  getUserByGoogleId(id: string) {
    return this.userModel.findOne({ googleId: id });
  }

  getUserById(id: ObjectId | string) {
    return this.userModel.findById(id);
  }

  async validateUserById(id: string) {
    const user = await this.getUserById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  getOnlineUsers() {
    return this.userModel.find({ online: true });
  }

  async getUser(username: string) {
    return await this.getUserByEmail(username);
  }

  filterUser(user: User, allowedFields: (keyof User)[] = []) {
    const userObject = user.toObject({ virtuals: true });

    for (const field of this.blockedFields) {
      if (allowedFields.includes(field)) {
        continue;
      }

      delete userObject[field];
    }

    return userObject;
  }

  async create(body: Partial<User>) {
    const user = await this.userModel.create(body);

    user.generateSessionToken();

    return user.save();
  }
}
