import { IsNotEmpty } from 'class-validator';
import { HttpCreateBlogPostDto } from './HttpCreateBlogPost.dto';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-trim-string.decorator';

export class HttpCreatePostDto extends HttpCreateBlogPostDto {
  @IsStringWithTrim()
  @IsNotEmpty()
  blogId!: string;
}
