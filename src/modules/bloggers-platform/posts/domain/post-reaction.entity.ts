import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { LikeStatus } from '../../dto/HttpLikeStatus.dto';
import { DomainCreatePostReaction } from './dto/DomainCreatePostReaction.dto';

@Schema({ timestamps: { createdAt: 'addedAt' } })
export class PostReaction {
  @Prop({ type: String, required: true })
  userId!: string;

  @Prop({ type: String, required: true })
  login!: string;

  @Prop({ type: String, required: true })
  postId!: string;

  @Prop({ type: String, enum: LikeStatus, default: LikeStatus.None })
  status!: LikeStatus;

  addedAt!: Date;

  static makeInstanse(dto: DomainCreatePostReaction): TPostReactionDocument {
    const postReaction = new this();
    postReaction.postId = dto.postId;
    postReaction.userId = dto.userId;
    postReaction.login = dto.login;
    postReaction.status = dto.status;
    return postReaction as TPostReactionDocument;
  }

  setStatus(newStatus: LikeStatus) {
    this.status = newStatus;
  }
}

export const PostReactionSchema = SchemaFactory.createForClass(PostReaction);
PostReactionSchema.loadClass(PostReaction);
export type TPostReactionDocument = HydratedDocument<PostReaction>;
export type TPostReactionModel = Model<PostReaction> & typeof PostReaction;
