import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { DomainCreateUserDto } from './dto/DomainCreateUser.dto';

export const USER_CONSTRAINTS = {
  LOGIN_MIN_LENGTH: 3,
  LOGIN_MAX_LENGTH: 10,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 20,
};

@Schema({ _id: false })
class EmailConfirmation {
  @Prop({ type: 'Boolean', default: false })
  isConfirmed!: boolean;

  @Prop({ type: 'String', default: '' })
  code!: string;

  @Prop({ type: 'Date', default: () => new Date() })
  codeExpirationDate!: Date;
}

@Schema({ _id: false })
class RecoveryCode {
  @Prop({ type: 'String', default: null })
  code!: string | null;

  @Prop({ type: 'Date', default: null })
  codeExpirationDate!: Date | null;
}

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: 'String',
    required: true,
    minLength: USER_CONSTRAINTS.LOGIN_MIN_LENGTH,
    maxLength: USER_CONSTRAINTS.LOGIN_MAX_LENGTH,
  })
  login!: string;

  @Prop({ type: 'String', required: true })
  email!: string;

  @Prop({ type: 'String', required: true })
  passwordHash!: string;

  createdAt!: Date;
  updatedAt!: Date;

  @Prop({ type: () => EmailConfirmation, required: true, default: () => ({}) })
  emailConfirmation!: EmailConfirmation;

  @Prop({ type: () => RecoveryCode, required: true, default: () => ({}) })
  recoveryCode!: RecoveryCode;

  static makeInstanse(dto: DomainCreateUserDto): TUserDocument {
    const user = new this();
    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    return user as TUserDocument;
  }

  confirmEmail() {
    this.emailConfirmation.code = '';
    this.emailConfirmation.isConfirmed = true;
    this.emailConfirmation.codeExpirationDate = new Date();
  }

  setEmailConfirmationCode(code: string, codeExpirationDate: Date) {
    this.emailConfirmation.code = code;
    this.emailConfirmation.codeExpirationDate = codeExpirationDate;
  }

  setRecoveryCode(code: string, codeExpirationDate: Date) {
    this.recoveryCode.code = code;
    this.recoveryCode.codeExpirationDate = codeExpirationDate;
  }

  removeRecoveryCode() {
    this.recoveryCode.code = null;
    this.recoveryCode.codeExpirationDate = null;
  }

  updatePasswordHash(newPasswordHash: string) {
    this.passwordHash = newPasswordHash;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);
export type TUserDocument = HydratedDocument<User>;
export type TUserModel = Model<User> & typeof User;
