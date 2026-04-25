import { IsNotEmpty, IsString, Length } from 'class-validator';
import { USER_CONSTRAINTS } from '../../users/domain/user.entity';

export class InputLoginDto {
  @IsString()
  @IsNotEmpty()
  loginOrEmail!: string;

  @Length(
    USER_CONSTRAINTS.PASSWORD_MIN_LENGTH,
    USER_CONSTRAINTS.PASSWORD_MAX_LENGTH,
  )
  @IsString()
  @IsNotEmpty()
  password!: string;
}
