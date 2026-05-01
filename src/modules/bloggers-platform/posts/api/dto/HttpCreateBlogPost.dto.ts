import { IsNotEmpty, Length } from 'class-validator';
import { DB_POST_CONSTRAINTS } from '../../domain/Post.entity';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-trim-string.decorator';

export class HttpCreateBlogPostDto {
  @Length(1, DB_POST_CONSTRAINTS.TITLE_MAX_LENGTH)
  @IsStringWithTrim()
  @IsNotEmpty()
  title!: string;

  @Length(1, DB_POST_CONSTRAINTS.SHORT_DESCRIPTION_MAX_LENGTH)
  @IsStringWithTrim()
  @IsNotEmpty()
  shortDescription!: string;

  @Length(1, DB_POST_CONSTRAINTS.CONTENT_MAX_LENGTH)
  @IsStringWithTrim()
  @IsNotEmpty()
  content!: string;
}
