import { IsBoolean, IsNotEmpty, Equals } from 'class-validator';

export class HttpPublishQuestionDto {
  @IsBoolean()
  @IsNotEmpty()
  @Equals(true)
  published!: boolean;
}
