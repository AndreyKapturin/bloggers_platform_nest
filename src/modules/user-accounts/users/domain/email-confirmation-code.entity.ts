import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('emailConfirmationCodes')
export class EmailConfirmationCode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, (user) => user.confirmationCode, { nullable: false })
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
    const emailConfirmationCode = new this();
    emailConfirmationCode.code = code;
    emailConfirmationCode.codeExpirationDate = codeExpirationDate;
    emailConfirmationCode.user = user;
    return emailConfirmationCode;
  }
}
