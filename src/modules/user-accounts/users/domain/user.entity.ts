import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDto } from '../dto/User.create-dto';

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
  @Prop({ type: 'String', required: true })
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

  static makeInstanse(createUserDto: CreateUserDto): TUserDocument {
    const user = new this();
    user.login = createUserDto.login;
    user.email = createUserDto.email;
    user.passwordHash = createUserDto.passwordHash;
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
