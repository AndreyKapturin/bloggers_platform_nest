import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';
import { USER_CONSTRAINTS } from '../../domain/user.entity';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-trim-string.decorator';

export class HttpCreateUserDto {
  @Length(USER_CONSTRAINTS.LOGIN_MIN_LENGTH, USER_CONSTRAINTS.LOGIN_MAX_LENGTH)
  @Matches(new RegExp('^[a-zA-Z0-9_-]*$'), {
    message: 'login must consist of "a-Z", "0-9", "_", "-" characters',
  })
  @IsNotEmpty()
  login!: string;

  @IsEmail()
  @IsStringWithTrim()
  @IsNotEmpty()
  email!: string;

  @Length(
    USER_CONSTRAINTS.PASSWORD_MIN_LENGTH,
    USER_CONSTRAINTS.PASSWORD_MAX_LENGTH,
  )
  @IsStringWithTrim()
  @IsNotEmpty()
  password!: string;
}
