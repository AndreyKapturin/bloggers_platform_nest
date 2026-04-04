import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { UpdatePostDto } from '../dto/Post.update-dto';

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  shortDescription: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({ type: String, required: true })
  blogName: string;

  extendedLikesInfo: {
    likesCount: 0;
    dislikesCount: 0;
    myStatus: 'None';
    newestLikes: [];
  };

  createdAt: Date;
  updatedAt: Date;

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
      myStatus: 'None',
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
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);
export type TPostDocument = HydratedDocument<Post>;
export type TPostModel = Model<Post> & typeof Post;
