import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  postId: string;

  commentatorInfo: {
    userId: string;
    userLogin: string;
  };

  likesInfo: {
    likesCount: 0;
    dislikesCount: 0;
    myStatus: 'None';
  };

  createdAt: Date;
  updatedAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);

export type TCommentDocument = HydratedDocument<Comment>;
export type TCommentModel = Model<Comment> & typeof Comment;
