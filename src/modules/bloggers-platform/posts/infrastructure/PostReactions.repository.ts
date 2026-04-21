import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostReaction,
  TPostReactionDocument,
  type TPostReactionModel,
} from '../domain/post-reaction.entity';
import { LikeStatus } from '../../dto/HttpLikeStatus.dto';

@Injectable()
export class PostReactionsRepository {
  constructor(
    @InjectModel(PostReaction.name)
    private PostReactionModel: TPostReactionModel,
  ) {}

  async save(postReactionDocument: TPostReactionDocument): Promise<void> {
    await postReactionDocument.save();
  }

  async findByUserIdAndPostId(userId: string, postId: string): Promise<TPostReactionDocument | null> {
    return this.PostReactionModel.findOne({ userId, postId });
  }

  async getNewestLikes(postId: string, limit: number): Promise<TPostReactionDocument[]> {
    return this.PostReactionModel.find({ postId, status: LikeStatus.Like })
      .sort({ createdAt: 'desc' })
      .limit(limit);
  }

  async getUserReactions(userId: string, postIds: string[]): Promise<TPostReactionDocument[]> {
    return this.PostReactionModel.find({ userId, postId: { $in: postIds } });
  }
}
