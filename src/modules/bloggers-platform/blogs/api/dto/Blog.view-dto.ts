import { TBlogDocument } from '../../domain/blog.entity';

export class ViewBlogDto {
  private constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
  ) {}

  static toView(blogDocument: TBlogDocument): ViewBlogDto {
    return new ViewBlogDto(
      blogDocument.id,
      blogDocument.name,
      blogDocument.description,
      blogDocument.websiteUrl,
      blogDocument.createdAt.toISOString(),
      blogDocument.isMembership,
    );
  }
}
