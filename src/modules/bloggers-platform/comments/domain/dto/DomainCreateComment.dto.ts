import { User } from "../../../../user-accounts/users/domain/user.entity";
import { Post } from "../../../posts/domain/Post.entity";

export class DomainCreateCommentDto {
  constructor(
    public content: string,
    public post: Post,
    public user: User,
  ) {}
}
