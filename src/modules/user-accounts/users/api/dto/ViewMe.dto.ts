import { User } from '../../domain/user.entity';

export class ViewMeDto {
  email!: string;
  login!: string;
  userId!: string;

  static toView(user: User): ViewMeDto {
    return {
      email: user.email,
      login: user.login,
      userId: user.id,
    };
  }
}
