import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmationCodeDto {
  @IsString()
  @IsNotEmpty()
  code!: string;
}
