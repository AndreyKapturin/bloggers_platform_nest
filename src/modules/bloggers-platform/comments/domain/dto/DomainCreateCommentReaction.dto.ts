import { LikeStatus } from '../../api/dto/HttpLikeComment.dto';

export class DomainCreateCommentReactionDto {
  constructor(
    public commentId: string,
    public userId: string,
    public status: LikeStatus,
  ) {}
}
