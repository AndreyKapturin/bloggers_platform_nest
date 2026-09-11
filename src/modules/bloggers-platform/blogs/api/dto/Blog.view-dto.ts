import { Blog } from '../../domain/blog.entity';

export class ViewBlogDto {
  private constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
  ) {}

  static toView(blog: Blog): ViewBlogDto {
    return new ViewBlogDto(
      blog.id,
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.createdAt.toISOString(),
      false,
    );
  }
}
