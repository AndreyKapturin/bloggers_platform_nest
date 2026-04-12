import { IsString, IsNotEmpty, Length } from 'class-validator';
import { PASSWORD_CONSTRAINTS } from '../../users/constants';

export class InputNewPasswordDto {
  @IsString()
  @IsNotEmpty()
  recoveryCode!: string;

  @Length(PASSWORD_CONSTRAINTS.MIN_LENGTH, PASSWORD_CONSTRAINTS.MAX_LENGTH)
  @IsString()
  @IsNotEmpty()
  newPassword!: string;
}
