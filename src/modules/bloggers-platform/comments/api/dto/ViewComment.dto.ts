import { TCommentDocument } from '../../domain/comment.entity';
import { LikeStatus } from './HttpLikeComment.dto';

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

  static toView(commentDocument: TCommentDocument): ViewCommentDto {
    return new this(
      commentDocument.id,
      commentDocument.content,
      commentDocument.commentatorInfo,
      {
        likesCount: commentDocument.likesInfo.likesCount,
        dislikesCount: commentDocument.likesInfo.dislikesCount,
        myStatus: LikeStatus.None
      },
      commentDocument.createdAt.toISOString(),
    );
  }
}
