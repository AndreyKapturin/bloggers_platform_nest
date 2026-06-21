import { TBlogModel } from '../../domain/blog.entity';

export class ViewBlogDto {
  private constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
  ) {}

  static toView(blogModel: TBlogModel): ViewBlogDto {
    return new ViewBlogDto(
      blogModel.id,
      blogModel.name,
      blogModel.description,
      blogModel.websiteUrl,
      blogModel.createdAt.toISOString(),
      false,
    );
  }
}
