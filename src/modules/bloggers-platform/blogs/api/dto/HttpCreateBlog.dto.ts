import { IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';
import { DB_BLOG_CONSTRAINTS } from '../../domain/blog.entity';

export class HttpCreateBlogDto {
  @Length(1, DB_BLOG_CONSTRAINTS.NAME_MAX_LENGTH)
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Length(1, DB_BLOG_CONSTRAINTS.DESCRIPTION_MAX_LENGTH)
  @IsString()
  @IsNotEmpty()
  description!: string;

  @Length(1, DB_BLOG_CONSTRAINTS.WEBSITE_URL_MAX_LENGTH)
  @IsUrl({ protocols: ['https'] })
  @IsString()
  @IsNotEmpty()
  websiteUrl!: string;
}
