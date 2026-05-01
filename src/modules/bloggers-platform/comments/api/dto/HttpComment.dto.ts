import { IsNotEmpty, Length } from 'class-validator';
import { COMMENT_CONTENT_CONSTRAINTS } from '../../domain/comment.entity';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-trim-string.decorator';

export class HttpCommentDto {
  @Length(
    COMMENT_CONTENT_CONSTRAINTS.MIN_LENGTH,
    COMMENT_CONTENT_CONSTRAINTS.MAX_LENGTH,
  )
  @IsStringWithTrim()
  @IsNotEmpty()
  content!: string;
}
