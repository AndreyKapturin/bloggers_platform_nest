import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentReaction,
  TCommentReactionDocument,
  type TCommentReactionModel,
} from '../domain/comment-reaction.entity';

@Injectable()
export class CommentReactionRepository {
  constructor(
    @InjectModel(CommentReaction.name)
    private CommentReactionModel: TCommentReactionModel,
  ) {}

  async save(commentReactionDocument: TCommentReactionDocument): Promise<void> {
    await commentReactionDocument.save();
  }

  async findByCommentIdAndUserId(
    commentId: string,
    userId: string,
  ): Promise<TCommentReactionDocument | null> {
    return this.CommentReactionModel.findOne({ commentId, userId });
  }
}
