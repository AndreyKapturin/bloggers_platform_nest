import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { LikeStatus } from '../../dto/HttpLikeStatus.dto';
import { DomainCreateCommentReactionDto } from './dto/DomainCreateCommentReaction.dto';

@Schema({ timestamps: { createdAt: true } })
export class CommentReaction {
  @Prop({ type: String, required: true })
  userId!: string;

  @Prop({ type: String, required: true })
  commentId!: string;

  @Prop({ type: String, enum: LikeStatus, default: LikeStatus.None })
  status!: LikeStatus;

  createdAt!: Date;

  static makeInstanse(
    dto: DomainCreateCommentReactionDto,
  ): TCommentReactionDocument {
    const commentReaction = new this();
    commentReaction.commentId = dto.commentId;
    commentReaction.userId = dto.userId;
    commentReaction.status = dto.status;
    return commentReaction as TCommentReactionDocument;
  }

  setStatus(newStatus: LikeStatus) {
    this.status = newStatus;
  }
}

export const CommentReactionSchema =
  SchemaFactory.createForClass(CommentReaction);
CommentReactionSchema.loadClass(CommentReaction);

export type TCommentReactionDocument = HydratedDocument<CommentReaction>;
export type TCommentReactionModel = Model<CommentReaction> &
  typeof CommentReaction;
