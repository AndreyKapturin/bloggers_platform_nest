import { TUserDocument } from '../../domain/user.entity';

export class ViewUserDto {
  id!: string;
  login!: string;
  email!: string;
  createdAt!: string;

  static toView(userDocument: TUserDocument): ViewUserDto {
    return {
      id: userDocument.id,
      email: userDocument.email,
      login: userDocument.login,
      createdAt: userDocument.createdAt.toISOString(),
    };
  }
}
