import { TExtendedCommentModel } from '../../domain/comment.entity';
import { LikeStatus } from '../../../dto/HttpLikeStatus.dto';

export class ViewCommentDto {
  constructor(
    public id: string,
    public content: string,
    public commentatorInfo: {
      userId: string;
      userLogin: string;
    },
    public likesInfo: {
      likesCount: number;
      dislikesCount: number;
      myStatus: LikeStatus;
    },
    public createdAt: string,
  ) {}

  static toView(extendedComment: TExtendedCommentModel): ViewCommentDto {
    return new this(
      extendedComment.id,
      extendedComment.content,
      {
        userId: extendedComment.userId,
        userLogin: extendedComment.userLogin,
      },
      {
        likesCount: extendedComment.likesCount,
        dislikesCount: extendedComment.dislikesCount,
        myStatus: LikeStatus.None,
      },
      extendedComment.createdAt.toISOString(),
    );
  }
}
