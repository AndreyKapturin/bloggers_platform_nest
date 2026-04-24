export class DomainCreateBlogDto {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {}
}
