import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../dto/HttpLikeStatus.dto';
import { PostsRepository } from '../../infrastructure/Post.repository';
import { PostReactionsRepository } from '../../infrastructure/PostReactions.repository';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostReaction,
  TPostReactionDocument,
  type TPostReactionModel,
} from '../../domain/post-reaction.entity';
import { TPostDocument } from '../../domain/Post.entity';
import { UsersRepository } from '../../../../user-accounts/users/infrastructure/users.repository';
import { DomainCreatePostReaction } from '../../domain/dto/DomainCreatePostReaction.dto';

const NEWEST_LIKES_COUNT = 3;

export class LikePostCommand {
  constructor(
    public userId: string,
    public postId: string,
    public status: LikeStatus,
  ) {}
}

@CommandHandler(LikePostCommand)
export class LikePostUseCase implements ICommandHandler<LikePostCommand> {
  constructor(
    @InjectModel(PostReaction.name)
    private PostReactionModel: TPostReactionModel,
    private postsRepository: PostsRepository,
    private postReactionsRepository: PostReactionsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: LikePostCommand): Promise<void> {
    const { postId, userId, status: newLikeStatus } = command;

    const postDocument = await this.postsRepository.findByIdOrThrow(postId);
    const oldReactionDocument =
      await this.postReactionsRepository.findByUserIdAndPostId(userId, postId);

    let reactionDocument: TPostReactionDocument;

    if (oldReactionDocument) {
      if (oldReactionDocument.status === newLikeStatus) return;
      reactionDocument = oldReactionDocument;
      this._updateOldReaction(reactionDocument, postDocument, newLikeStatus);
    } else {
      if (newLikeStatus === LikeStatus.None) return;
      const userDocument = await this.usersRepository.findByIdOrThrow(userId);
      const dto = new DomainCreatePostReaction(
        postId,
        userId,
        userDocument.login,
        newLikeStatus,
      );
      reactionDocument = this.PostReactionModel.makeInstanse(dto);
      this._addNewReaction(postDocument, newLikeStatus);
    }

    await this.postReactionsRepository.save(reactionDocument);
    await this.updateNewestLikes(postDocument);
    await this.postsRepository.save(postDocument);
  }

  private async updateNewestLikes(postDocument: TPostDocument) {
    const lastLikes = await this.postReactionsRepository.getNewestLikes(
      postDocument.id,
      NEWEST_LIKES_COUNT,
    );
    const newestLikes = lastLikes.map((like) => ({
      addedAt: like.addedAt,
      userId: like.userId,
      login: like.login,
    }));
    postDocument.setNewestLikes(newestLikes);
  }

  private _updateOldReaction(
    reactionDocument: TPostReactionDocument,
    commentDocument: TPostDocument,
    newLikeStatus: LikeStatus,
  ) {
    if (reactionDocument.status === LikeStatus.Like) {
      if (newLikeStatus === LikeStatus.Dislike) {
        commentDocument.likeToDislike();
      }
      if (newLikeStatus === LikeStatus.None) {
        commentDocument.removeLike();
      }
    }

    if (reactionDocument.status === LikeStatus.Dislike) {
      if (newLikeStatus === LikeStatus.Like) {
        commentDocument.dislikeToLike();
      }
      if (newLikeStatus === LikeStatus.None) {
        commentDocument.removeDislike();
      }
    }

    if (reactionDocument.status === LikeStatus.None) {
      if (newLikeStatus === LikeStatus.Like) {
        commentDocument.addLike();
      }
      if (newLikeStatus === LikeStatus.None) {
        commentDocument.addDislike();
      }
    }

    reactionDocument.setStatus(newLikeStatus);
  }

  private _addNewReaction(
    postDocument: TPostDocument,
    newLikeStatus: LikeStatus,
  ) {
    if (newLikeStatus === LikeStatus.Like) {
      postDocument.addLike();
    }
    if (newLikeStatus === LikeStatus.Dislike) {
      postDocument.addDislike();
    }
  }
}
