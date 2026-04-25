import { IsNotEmpty, IsUrl, Length } from 'class-validator';
import { DB_BLOG_CONSTRAINTS } from '../../domain/blog.entity';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-trim-string.decorator';

export class HttpCreateBlogDto {
  @Length(1, DB_BLOG_CONSTRAINTS.NAME_MAX_LENGTH)
  @IsStringWithTrim()
  @IsNotEmpty()
  name!: string;

  @Length(1, DB_BLOG_CONSTRAINTS.DESCRIPTION_MAX_LENGTH)
  @IsStringWithTrim()
  @IsNotEmpty()
  description!: string;

  @Length(1, DB_BLOG_CONSTRAINTS.WEBSITE_URL_MAX_LENGTH)
  @IsUrl({ protocols: ['https'] })
  @IsStringWithTrim()
  @IsNotEmpty()
  websiteUrl!: string;
}
