import { LikeStatus } from '../../dto/HttpLikeStatus.dto';

export const COMMENT_CONTENT_CONSTRAINTS = {
  MIN_LENGTH: 20,
  MAX_LENGTH: 300,
};

export type TCommentModel = {
  id: string;
  content: string;
  postId: string;
  userId: string;
  createdAt: Date;
};

export type TExtendedCommentModel = {
  id: string;
  content: string;
  postId: string;
  userId: string;
  userLogin: string;
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
};

export type TCommentUserReactionModel = {
  userId: string;
  commentId: string;
  status: LikeStatus;
  createdAt: Date;
};
