export class DomainCreateCommentDto {
  constructor(
    public postId: string,
    public content: string,
    public userLogin: string,
    public userId: string,
  ) {}
}
