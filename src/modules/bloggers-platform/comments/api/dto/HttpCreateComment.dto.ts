import { IsNotEmpty, IsString, Length } from 'class-validator';

export const COMMENT_CONTENT_CONSTRAINTS = {
  MIN_LENGTH: 20,
  MAX_LENGTH: 300,
};

export class HttpCreateCommentDto {
  @Length(
    COMMENT_CONTENT_CONSTRAINTS.MIN_LENGTH,
    COMMENT_CONTENT_CONSTRAINTS.MAX_LENGTH,
  )
  @IsString()
  @IsNotEmpty()
  content!: string;
}
