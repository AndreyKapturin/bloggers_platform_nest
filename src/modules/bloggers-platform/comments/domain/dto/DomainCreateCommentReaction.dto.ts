import { LikeStatus } from '../../../dto/HttpLikeStatus.dto';

export class DomainCreateCommentReactionDto {
  constructor(
    public commentId: string,
    public userId: string,
    public status: LikeStatus,
  ) {}
}
