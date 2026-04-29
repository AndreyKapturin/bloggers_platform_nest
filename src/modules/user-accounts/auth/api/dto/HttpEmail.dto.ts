import { IsEmail, IsNotEmpty } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-trim-string.decorator';

export class HttpEmailDto {
  @IsEmail()
  @IsStringWithTrim()
  @IsNotEmpty()
  email!: string;
}
