import { User } from '../../../../user-accounts/users/domain/user.entity';
import { LikeStatus } from '../../../dto/HttpLikeStatus.dto';
import { Comment } from '../comment.entity';

export class DomainCreateCommentReactionDto {
  constructor(
    public comment: Comment,
    public user: User,
    public status: LikeStatus,
  ) {}
}
