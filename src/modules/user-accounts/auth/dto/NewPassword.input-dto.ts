import { IsString, IsNotEmpty, Length } from 'class-validator';
import { USER_CONSTRAINTS } from '../../users/domain/user.entity';

export class InputNewPasswordDto {
  @IsString()
  @IsNotEmpty()
  recoveryCode!: string;

  @Length(
    USER_CONSTRAINTS.PASSWORD_MIN_LENGTH,
    USER_CONSTRAINTS.PASSWORD_MAX_LENGTH,
  )
  @IsString()
  @IsNotEmpty()
  newPassword!: string;
}
