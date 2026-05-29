export class DomainCreateCommentDto {
  constructor(
    public postId: string,
    public content: string,
    public userId: string,
  ) {}
}
