import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDto } from '../dto/User.create-dto';
import { CreateUnconfirmedUserDto } from '../dto/User.create-unconfirmed-user-dto';

@Schema({ _id: false })
class EmailConfirmation {
  @Prop({ type: 'Boolean', required: true, default: false })
  isConfirmed!: boolean;

  @Prop({ type: 'String', required: true })
  code!: string;

  @Prop({ type: 'Date', required: true })
  codeExpirationDate!: Date;
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

  @Prop({ type: EmailConfirmation, required: true, default: {} })
  emailConfirmation!: EmailConfirmation;

  static makeConfirmedInstanse(createUserDto: CreateUserDto): TUserDocument {
    const user = new this();
    user.login = createUserDto.login;
    user.email = createUserDto.email;
    user.passwordHash = createUserDto.passwordHash;
    user.emailConfirmation.code = '';
    user.emailConfirmation.codeExpirationDate = new Date();
    user.emailConfirmation.isConfirmed = true;
    return user as TUserDocument;
  }

  static makeUnconfirmedInstanse(createUnconfirmedUserDto: CreateUnconfirmedUserDto): TUserDocument {
    const user = new this();
    user.login = createUnconfirmedUserDto.login;
    user.email = createUnconfirmedUserDto.email;
    user.passwordHash = createUnconfirmedUserDto.passwordHash;
    user.emailConfirmation.code = createUnconfirmedUserDto.confirmationCode;
    user.emailConfirmation.codeExpirationDate = createUnconfirmedUserDto.codeExpirationDate;
    user.emailConfirmation.isConfirmed = false;
    return user as TUserDocument;
  }
}

export type TUserDocument = HydratedDocument<User>;
export type TUserModel = Model<User> & typeof User;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);
