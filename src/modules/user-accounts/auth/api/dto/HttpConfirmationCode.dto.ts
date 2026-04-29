import { IsNotEmpty } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-trim-string.decorator';

export class HttpConfirmationCodeDto {
  @IsStringWithTrim()
  @IsNotEmpty()
  code!: string;
}
