import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { DomainCreateCommentDto } from './dto/DomainCreateComment.dto';

@Schema({ _id: false })
class LikesInfo {
  @Prop({ type: Number, default: 0 })
  likesCount!: number;

  @Prop({ type: Number, default: 0 })
  dislikesCount!: number;
}

@Schema({ _id: false })
class CommentatorInfo {
  @Prop({ type: String, required: true })
  userId!: string;

  @Prop({ type: String, required: true })
  userLogin!: string;
}

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, required: true })
  content!: string;

  @Prop({ type: String, required: true })
  postId!: string;

  @Prop({ type: () => CommentatorInfo, required: true })
  commentatorInfo!: CommentatorInfo;

  @Prop({ type: () => LikesInfo, default: () => ({}) })
  likesInfo!: LikesInfo;

  createdAt!: Date;
  updatedAt!: Date;

  static makeInstanse(dto: DomainCreateCommentDto): TCommentDocument {
    const comment = new this();
    comment.content = dto.content;
    comment.postId = dto.postId;
    comment.commentatorInfo = {
      userId: dto.userId,
      userLogin: dto.userLogin,
    };
    return comment as TCommentDocument;
  }

  setContent(newContent: string) {
    this.content = newContent;
  }

  addLike() {
    this.likesInfo.likesCount += 1;
  }

  addDislike() {
    this.likesInfo.dislikesCount += 1;
  }

  removeLike() {
    this.likesInfo.likesCount -= 1;
  }

  removeDislike() {
    this.likesInfo.dislikesCount -= 1;
  }

  likeToDislike() {
    this.removeLike();
    this.addDislike();
  }

  dislikeToLike() {
    this.removeDislike();
    this.addLike();
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);

export type TCommentDocument = HydratedDocument<Comment>;
export type TCommentModel = Model<Comment> & typeof Comment;
