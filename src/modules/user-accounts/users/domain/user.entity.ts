import { Column, Entity } from 'typeorm';
import { BaseDbEntity } from '../../../../core/BaseDbEntity';
import { DomainCreateUserDto } from './dto/DomainCreateUser.dto';

export const USER_CONSTRAINTS = {
  LOGIN_MIN_LENGTH: 3,
  LOGIN_MAX_LENGTH: 10,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 20,
};

export type TUserModel = {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  isConfirmed: boolean;
};

@Entity('users')
export class User extends BaseDbEntity {
  @Column({ type: 'varchar', nullable: false, unique: true })
  login!: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email!: string;

  @Column({ type: 'varchar', nullable: false })
  passwordHash!: string;

  @Column({ type: 'boolean', default: false })
  isConfirmed!: boolean;

  static create(dto: DomainCreateUserDto) {
    const user = new this();
    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    return user;
  }
}
