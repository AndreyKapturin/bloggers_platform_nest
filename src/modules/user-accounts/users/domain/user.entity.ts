import { Column, Entity, OneToOne } from 'typeorm';
import { BaseDbEntity } from '../../../../core/BaseDbEntity';
import { DomainCreateUserDto } from './dto/DomainCreateUser.dto';
import { EmailConfirmationCode } from './email-confirmation-code.entity';

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

  @OneToOne(
    () => EmailConfirmationCode,
    (emailConfirmationCode) => emailConfirmationCode.user,
    { cascade: true },
  )
  confirmationCode!: EmailConfirmationCode | null;

  setConfirmationCode(code: string, codeExpirationDate: Date): void {
    if (this.confirmationCode) {
      this.confirmationCode.code = code;
      this.confirmationCode.codeExpirationDate = codeExpirationDate;
    } else {
      this.confirmationCode = EmailConfirmationCode.create(code, codeExpirationDate, this)
    }
  }

  static create(dto: DomainCreateUserDto) {
    const user = new this();
    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    return user;
  }
}
