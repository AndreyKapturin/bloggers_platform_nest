import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { UpdatePostDto } from '../dto/Post.update-dto';

export const DB_POST_CONSTRAINTS = {
  TITLE_MAX_LENGTH: 30,
  SHORT_DESCRIPTION_MAX_LENGTH: 100,
  CONTENT_MAX_LENGTH: 1000,
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

@Schema({ timestamps: true })
export class Post {
  @Prop({
    type: String,
    required: true,
    maxLength: DB_POST_CONSTRAINTS.TITLE_MAX_LENGTH,
  })
  title!: string;

  @Prop({
    type: String,
    required: true,
    maxLength: DB_POST_CONSTRAINTS.SHORT_DESCRIPTION_MAX_LENGTH,
  })
  shortDescription!: string;

  @Prop({
    type: String,
    required: true,
    maxLength: DB_POST_CONSTRAINTS.CONTENT_MAX_LENGTH,
  })
  content!: string;

  @Prop({ type: String, required: true })
  blogId!: string;

  @Prop({ type: String, required: true })
  blogName!: string;

  @Prop({ type: () => ExtendedLikesInfo, default: {} })
  extendedLikesInfo!: ExtendedLikesInfo;

  createdAt!: Date;
  updatedAt!: Date;

  static makeInstance(
    title: string,
    content: string,
    shortDescription: string,
    blogId: string,
    blogName: string,
  ): TPostDocument {
    const postDocument = new this();
    postDocument.title = title;
    postDocument.content = content;
    postDocument.shortDescription = shortDescription;
    postDocument.blogId = blogId;
    postDocument.blogName = blogName;
    postDocument.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      newestLikes: [],
    };

    return postDocument as TPostDocument;
  }

  update(updatePostDto: UpdatePostDto): void {
    this.title = updatePostDto.title;
    this.shortDescription = updatePostDto.shortDescription;
    this.content = updatePostDto.content;
    this.blogId = updatePostDto.blogId;
    this.blogName = updatePostDto.blogName;
  }

  addLike() {
    this.extendedLikesInfo.likesCount += 1;
  }

  addDislike() {
    this.extendedLikesInfo.dislikesCount += 1;
  }

  removeLike() {
    this.extendedLikesInfo.likesCount -= 1;
  }

  removeDislike() {
    this.extendedLikesInfo.dislikesCount -= 1;
  }

  likeToDislike() {
    this.removeLike();
    this.addDislike();
  }

  dislikeToLike() {
    this.removeDislike();
    this.addLike();
  }

  setNewestLikes(newestLikes: NewestLike[]) {
    this.extendedLikesInfo.newestLikes = newestLikes;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);
export type TPostDocument = HydratedDocument<Post>;
export type TPostModel = Model<Post> & typeof Post;
