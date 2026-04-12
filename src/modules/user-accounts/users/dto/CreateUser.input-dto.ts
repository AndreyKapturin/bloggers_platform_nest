import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { LOGIN_CONSTRAINTS, PASSWORD_CONSTRAINTS } from '../constants';

export class InputCreateUserDto {
  @Length(LOGIN_CONSTRAINTS.MIN_LENGTH, LOGIN_CONSTRAINTS.MAX_LENGTH)
  @Matches(new RegExp('^[a-zA-Z0-9_-]*$'), {
    message: 'login must consist of "a-Z", "0-9", "_", "-" characters',
  })
  @IsNotEmpty()
  login!: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email!: string;

  @Length(PASSWORD_CONSTRAINTS.MIN_LENGTH, PASSWORD_CONSTRAINTS.MAX_LENGTH)
  @IsString()
  @IsNotEmpty()
  password!: string;
}
