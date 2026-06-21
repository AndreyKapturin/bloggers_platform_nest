import { LikeStatus } from '../../../dto/HttpLikeStatus.dto';

export class DomainCreatePostReaction {
  constructor(
    public postId: string,
    public userId: string,
    public status: LikeStatus,
  ) {}
}
