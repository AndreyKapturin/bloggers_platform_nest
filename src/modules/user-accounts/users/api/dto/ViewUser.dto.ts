import { TUserModel } from '../../domain/user.entity';

export class ViewUserDto {
  id!: string;
  login!: string;
  email!: string;
  createdAt!: string;

  static toView(userModel: TUserModel): ViewUserDto {
    return {
      id: userModel.id,
      email: userModel.email,
      login: userModel.login,
      createdAt: userModel.createdAt.toISOString(),
    };
  }
}
