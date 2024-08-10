import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import {User} from '../../../shared/user';

@Injectable()
export class AuthRepository {

  constructor(@InjectModel("User") private userModel: Model<User>) {

  }

  async addUser(user: Partial<User>) {
    const newUser = this.userModel(user);

    await newUser.save();

    return newUser.toObject({versionKey:false});
  }

}