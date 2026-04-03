import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDto } from '../dto/User.create-dto';

@Schema({ timestamps: true })
export class User {
  @Prop({ type: 'String', required: true })
  login: string;

  @Prop({ type: 'String', required: true })
  email: string;

  @Prop({ type: 'String', required: true })
  passwordHash: string;

  createdAt: Date;
  updatedAt: Date;

  static makeInstanse(createUserDto: CreateUserDto): TUserDocument {
    const user = new this();
    user.login = createUserDto.login;
    user.email = createUserDto.email;
    user.passwordHash = createUserDto.passwordHash;
    return user as TUserDocument;
  }
}

export type TUserDocument = HydratedDocument<User>;
export type TUserModel = Model<User> & typeof User;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);
