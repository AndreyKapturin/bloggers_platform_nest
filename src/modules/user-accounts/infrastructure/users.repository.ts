import { Injectable } from '@nestjs/common';
import { User } from '../domain/user.entity';
import type { TUserDocument, TUserModel } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: TUserModel) {}

  async findById(id: string): Promise<TUserDocument | null> {
    return this.UserModel.findById(id);
  }

  async save(userDocument: TUserDocument): Promise<void> {
    await userDocument.save();
  }

  async delete(userDocument: TUserDocument): Promise<boolean> {
    const deleteResult = await userDocument.deleteOne();
    return deleteResult.deletedCount === 1;
  }
}
