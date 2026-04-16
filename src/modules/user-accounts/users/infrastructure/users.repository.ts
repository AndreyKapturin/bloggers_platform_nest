import { Injectable } from '@nestjs/common';
import { User } from '../domain/user.entity';
import type { TUserDocument, TUserModel } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: TUserModel) {}

  async findById(id: string): Promise<TUserDocument | null> {
    return this.UserModel.findById(id);
  }

  async findByIdOrThrow(id: string): Promise<TUserDocument> {
    const userDocument = await this.findById(id);

    if (!userDocument) {
      throw new DomainException(
        DomainExceptionStatus.NotFound,
        `User with id ${id} not found`,
        [{ field: 'userId', message: `User with id ${id} not found` }],
      );
    }

    return userDocument;
  }

  async findByEmail(email: string): Promise<TUserDocument | null> {
    return this.UserModel.findOne({ email });
  }

  async findByLogin(login: string): Promise<TUserDocument | null> {
    return this.UserModel.findOne({ login });
  }

  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<TUserDocument | null> {
    return this.UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }

  async findByConfirmationCode(
    confirmationCode: string,
  ): Promise<TUserDocument | null> {
    return this.UserModel.findOne({
      'emailConfirmation.code': confirmationCode,
    });
  }

  async findByRecoveryCode(
    recoveryCode: string,
  ): Promise<TUserDocument | null> {
    return this.UserModel.findOne({
      'recoveryCode.code': recoveryCode,
    });
  }

  async save(userDocument: TUserDocument): Promise<void> {
    await userDocument.save();
  }

  async delete(userDocument: TUserDocument): Promise<boolean> {
    const deleteResult = await userDocument.deleteOne();
    return deleteResult.deletedCount === 1;
  }
}
