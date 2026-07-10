import { Column, Entity, OneToOne } from 'typeorm';
import { BaseDbEntity } from '../../../../core/BaseDbEntity';
import { DomainCreateUserDto } from './dto/DomainCreateUser.dto';
import { EmailConfirmationCode } from './email-confirmation-code.entity';
import { PasswordRecoveryCode } from './password-recovery-code.entity';

export const USER_CONSTRAINTS = {
  LOGIN_MIN_LENGTH: 3,
  LOGIN_MAX_LENGTH: 10,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 20,
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

  @OneToOne(() => EmailConfirmationCode, (code) => code.user, {
    nullable: true,
    cascade: true,
  })
  confirmationCode!: EmailConfirmationCode | null;

  @OneToOne(() => PasswordRecoveryCode, (code) => code.user, {
    nullable: true,
    cascade: true,
  })
  passwordRecoveryCode!: PasswordRecoveryCode | null;

  setConfirmationCode(code: string, codeExpirationDate: Date): void {
    if (this.confirmationCode) {
      this.confirmationCode.code = code;
      this.confirmationCode.codeExpirationDate = codeExpirationDate;
    } else {
      this.confirmationCode = EmailConfirmationCode.create(
        code,
        codeExpirationDate,
        this,
      );
    }
  }

  confirmRegistration() {
    this.isConfirmed = true;
  }

  deleteConfirmationCode() {
    this.confirmationCode = null;
  }

  setNewPasswordHash(passwordHash: string): void {
    this.passwordHash = passwordHash;
  }

  deletePasswordRecoveryCode() {
    this.passwordRecoveryCode = null;
  }

  static create(dto: DomainCreateUserDto) {
    const user = new this();
    user.confirmationCode = null;
    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    return user;
  }
}
