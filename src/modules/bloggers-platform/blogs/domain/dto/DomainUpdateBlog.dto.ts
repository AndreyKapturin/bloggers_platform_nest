import { DomainCreateBlogDto } from './DomainCreateBlog.dto';

export class DomainUpdateBlogDto extends DomainCreateBlogDto {
  constructor(
    public blogId: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {
    super(name, description, websiteUrl);
  }
}
