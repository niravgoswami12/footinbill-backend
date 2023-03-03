import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { FilterQuery, Model } from 'mongoose';
import { User } from '../schema/user.schema';

@Injectable()
export class UserService {
  private blockedFields: (keyof User)[] = [
    'password',
    'sessionToken',
    'email',
    'facebookId',
    'googleId',
    'friends',
    'isInvitePending',
    'isSocial',
  ];

  unpopulatedFields = '-' + this.blockedFields.join(' -');

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  getUserByEmail(mail: string) {
    const email = mail.toLowerCase(); // { $regex: new RegExp(`^${mail}$`, 'i') };

    return this.userModel.findOne({ email });
  }

  getSelfRegisteredUserByEmail(mail: string) {
    const email = mail.toLowerCase(); // { $regex: new RegExp(`^${mail}$`, 'i') };

    return this.userModel.findOne({ email, isInvitePending: false });
  }

  async validateUserByEmail(email: string) {
    const user = await this.getSelfRegisteredUserByEmail(email);

    if (!user) {
      throw new NotFoundException('User does not exist');
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
      throw new NotFoundException('User does not exist');
    }

    return user;
  }

  getOnlineUsers() {
    return this.userModel.find({ online: true });
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
    body.isInvitePending = false;
    const password = body.password;
    delete body.password;
    const user = await this.userModel.findOneAndUpdate(
      { email: body.email },
      body,
      { upsert: true, new: true },
    );
    if (password) {
      user.password = password;
    }
    user.generateSessionToken();

    return user.save();
  }

  async createUserAsInvited(body: Partial<User>) {
    body.isInvitePending = true;
    const user = await this.userModel.create(body);

    user.generateSessionToken();

    return user.save();
  }

  async addFriend(userId: string, friendId: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { friends: [friendId] },
    });
  }
}
