import { Blog } from "../../../blogs/domain/blog.entity";

export class DomainCreatePostDto {
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blog: Blog,
  ) {}
}
