import { TCommentDocument } from '../domain/comment.entity';

export class ViewCommentDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  likesInfo: {
    likesCount: 0;
    dislikesCount: 0;
    myStatus: 'None';
  };
  createdAt: string;

  static toView(commentDocument: TCommentDocument): ViewCommentDto {
    return {
      id: commentDocument.id,
      content: commentDocument.content,
      commentatorInfo: commentDocument.commentatorInfo,
      likesInfo: commentDocument.likesInfo,
      createdAt: commentDocument.createdAt.toISOString(),
    };
  }
}
