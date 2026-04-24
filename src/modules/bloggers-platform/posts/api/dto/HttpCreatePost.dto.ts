import { IsNotEmpty, IsString } from 'class-validator';
import { HttpCreateBlogPostDto } from './HttpCreateBlogPost.dto';

export class HttpCreatePostDto extends HttpCreateBlogPostDto {
  @IsString()
  @IsNotEmpty()
  blogId!: string;
}
