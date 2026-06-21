export class DomainUpdatePostDto {
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
  ) {}
}
