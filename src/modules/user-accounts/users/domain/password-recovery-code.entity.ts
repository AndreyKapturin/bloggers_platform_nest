import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('passwordRecoveryCodes')
export class PasswordRecoveryCode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, (user) => user.passwordRecoveryCode, {
    nullable: false,
  })
  @Index({ unique: true })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', nullable: false })
  code!: string;

  @Column({ type: 'timestamptz' })
  codeExpirationDate!: Date;

  static create(code: string, codeExpirationDate: Date, user: User) {
    const passwordRecoveryCode = new this();
    passwordRecoveryCode.code = code;
    passwordRecoveryCode.codeExpirationDate = codeExpirationDate;
    passwordRecoveryCode.user = user;
    return passwordRecoveryCode;
  }
}
