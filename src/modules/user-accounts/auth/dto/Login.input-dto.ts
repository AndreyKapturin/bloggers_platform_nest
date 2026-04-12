import { IsNotEmpty, IsString, Length } from 'class-validator';
import { PASSWORD_CONSTRAINTS } from '../../users/constants';

export class InputLoginDto {
  @IsString()
  @IsNotEmpty()
  loginOrEmail!: string;

  @Length(PASSWORD_CONSTRAINTS.MIN_LENGTH, PASSWORD_CONSTRAINTS.MAX_LENGTH)
  @IsString()
  @IsNotEmpty()
  password!: string;
}
