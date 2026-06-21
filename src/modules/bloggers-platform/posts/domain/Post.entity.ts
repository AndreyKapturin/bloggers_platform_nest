import { LikeStatus } from '../../dto/HttpLikeStatus.dto';

export const DB_POST_CONSTRAINTS = {
  TITLE_MAX_LENGTH: 30,
  SHORT_DESCRIPTION_MAX_LENGTH: 100,
  CONTENT_MAX_LENGTH: 1000,
};

export type TPostModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: Date;
};

export type TPostReactionModel = {
  postId: string;
  userId: string;
  status: LikeStatus;
  addedAt: Date;
};

export type TExtendedPost = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  createdAt: Date;
};

export type TExtendedPostWithLikes = TExtendedPost & {
  newestLikes: TViewNewestLike[];
};

export type TPostUserReactionModel = {
  userId: string;
  commentId: string;
  status: LikeStatus;
  addedAt: Date;
};

export type TNewestLike = {
  postId: string;
  userId: string;
  login: string;
  addedAt: Date;
};

export type TViewNewestLike = {
  userId: string;
  login: string;
  addedAt: string;
};

export type TExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  newestLikes: TViewNewestLike[];
};
