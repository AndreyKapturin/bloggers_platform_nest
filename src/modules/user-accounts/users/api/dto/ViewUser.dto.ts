import { User } from '../../domain/user.entity';

export class ViewUserDto {
  id!: string;
  login!: string;
  email!: string;
  createdAt!: string;

  static toView(user: User): ViewUserDto {
    return {
      id: user.id,
      email: user.email,
      login: user.login,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
