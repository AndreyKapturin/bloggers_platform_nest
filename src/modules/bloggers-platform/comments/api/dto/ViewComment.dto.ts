import { TCommentDocument } from '../../domain/comment.entity';

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
      myStatus: 'None';
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
        myStatus: 'None',
      },
      commentDocument.createdAt.toISOString(),
    );
  }
}
