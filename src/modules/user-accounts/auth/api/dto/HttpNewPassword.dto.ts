import { IsNotEmpty, Length } from 'class-validator';
import { USER_CONSTRAINTS } from '../../../users/domain/user.entity';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-trim-string.decorator';

export class HttpNewPasswordDto {
  @IsStringWithTrim()
  @IsNotEmpty()
  recoveryCode!: string;

  @Length(
    USER_CONSTRAINTS.PASSWORD_MIN_LENGTH,
    USER_CONSTRAINTS.PASSWORD_MAX_LENGTH,
  )
  @IsStringWithTrim()
  @IsNotEmpty()
  newPassword!: string;
}
