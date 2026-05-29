import { Prop, Schema } from '@nestjs/mongoose';

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

export type TPostWithBlogName = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
};

@Schema({ _id: false })
export class NewestLike {
  @Prop({ type: Date, required: true })
  addedAt!: Date;

  @Prop({ type: String, required: true })
  userId!: string;

  @Prop({ type: String, required: true })
  login!: string;
}

@Schema({ _id: false })
export class ExtendedLikesInfo {
  @Prop({ type: Number, default: 0 })
  likesCount!: number;

  @Prop({ type: Number, default: 0 })
  dislikesCount!: number;

  @Prop({ type: () => [NewestLike], default: [] })
  newestLikes!: NewestLike[];
}
