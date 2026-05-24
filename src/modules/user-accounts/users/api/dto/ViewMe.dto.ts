import { TUserModel } from '../../domain/user.entity';

export class ViewMeDto {
  email!: string;
  login!: string;
  userId!: string;

  static toView(userModel: TUserModel): ViewMeDto {
    return {
      email: userModel.email,
      login: userModel.login,
      userId: userModel.id,
    };
  }
}
