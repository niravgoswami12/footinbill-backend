import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomNumber } from 'src/shared/utils/random-number';
import { Recover } from '../schema/recover.schema';
import { User } from '../schema/user.schema';

@Injectable()
export class RecoverService {
  constructor(
    @InjectModel(Recover.name) private recoveryModel: Model<Recover>,
  ) {}

  async create(user: User) {
    await this.delete(user);

    return this.recoveryModel.create({
      code: randomNumber(4),
      owner: user._id,
    });
  }

  get(code: Recover['code']) {
    return this.recoveryModel.findOne({ code }).populate('owner');
  }

  delete(user: User) {
    return this.recoveryModel.deleteMany({ owner: user._id });
  }
}
