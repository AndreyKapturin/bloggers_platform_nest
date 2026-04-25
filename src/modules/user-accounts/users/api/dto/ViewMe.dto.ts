import { TUserDocument } from '../../domain/user.entity';

export class ViewMeDto {
  email!: string;
  login!: string;
  userId!: string;

  static toView(userDocument: TUserDocument): ViewMeDto {
    return {
      email: userDocument.email,
      login: userDocument.login,
      userId: userDocument.id,
    };
  }
}
