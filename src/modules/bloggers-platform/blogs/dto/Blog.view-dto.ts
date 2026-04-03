import type { TBlogDocument } from '../domain/blog.entity';

export class ViewBlogDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;

  static toView(blogDocument: TBlogDocument): ViewBlogDto {
    return {
      id: blogDocument.id,
      name: blogDocument.name,
      description: blogDocument.description,
      websiteUrl: blogDocument.websiteUrl,
      isMembership: blogDocument.isMembership,
      createdAt: blogDocument.createdAt.toISOString(),
    };
  }
}
