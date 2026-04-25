import { IsNotEmpty, IsString, Length } from 'class-validator';
import { DB_POST_CONSTRAINTS } from '../../domain/Post.entity';

export class HttpCreateBlogPostDto {
  @Length(1, DB_POST_CONSTRAINTS.TITLE_MAX_LENGTH)
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Length(1, DB_POST_CONSTRAINTS.SHORT_DESCRIPTION_MAX_LENGTH)
  @IsString()
  @IsNotEmpty()
  shortDescription!: string;

  @Length(1, DB_POST_CONSTRAINTS.CONTENT_MAX_LENGTH)
  @IsString()
  @IsNotEmpty()
  content!: string;
}
