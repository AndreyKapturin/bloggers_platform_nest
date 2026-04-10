import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class InputEmailDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email!: string;
}