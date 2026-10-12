import { IsArray, IsNotEmpty, IsString, Length } from 'class-validator';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-trim-string.decorator';

export const MIN_QUESTION_BODY_LENGTH = 10;
export const MAX_QUESTION_BODY_LENGTH = 500;

export class HttpCreateQuestionDto {
  @Length(MIN_QUESTION_BODY_LENGTH, MAX_QUESTION_BODY_LENGTH)
  @IsStringWithTrim()
  @IsNotEmpty()
  body!: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  correctAnswers!: string[];
}
