import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/Comments.repository';
import { CommentReactionRepository } from '../../infrastructure/CommentReaction.repository';
import { LikeStatus } from '../../api/dto/HttpLikeComment.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentReaction,
  TCommentReactionDocument,
  type TCommentReactionModel,
} from '../../domain/comment-reaction.entity';
import { TCommentDocument } from '../../domain/comment.entity';

export class LikeCommentCommand extends Command<void> {
  constructor(
    public commentId: string,
    public status: LikeStatus,
    public userId: string,
  ) {
    super();
  }
}

@CommandHandler(LikeCommentCommand)
export class LikeCommentUseCase implements ICommandHandler<
  LikeCommentCommand,
  void
> {
  constructor(
    @InjectModel(CommentReaction.name)
    private CommentReactionModel: TCommentReactionModel,
    private commentsRepository: CommentsRepository,
    private commentReactionRepository: CommentReactionRepository,
  ) {}

  async execute(command: LikeCommentCommand): Promise<void> {
    const { commentId, userId, status: newLikeStatus } = command;
    const commentDocument =
      await this.commentsRepository.findByIdOrThrow(commentId);

    const oldReactionDocument =
      await this.commentReactionRepository.findByCommentIdAndUserId(
        commentId,
        userId,
      );

    let reactionDocument: TCommentReactionDocument;

    if (oldReactionDocument) {
      if (oldReactionDocument.status === newLikeStatus) return;
      reactionDocument = oldReactionDocument;
      this._updateOldReaction(reactionDocument, commentDocument, newLikeStatus);
    } else {
      if (newLikeStatus === LikeStatus.None) return;
      reactionDocument = this.CommentReactionModel.makeInstanse(command);
      this._addNewReaction(commentDocument, newLikeStatus);
    }

    await this.commentReactionRepository.save(reactionDocument);
    await this.commentsRepository.save(commentDocument);
  }

  private _updateOldReaction(
    reactionDocument: TCommentReactionDocument,
    commentDocument: TCommentDocument,
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
    commentDocument: TCommentDocument,
    newLikeStatus: LikeStatus,
  ) {
    if (newLikeStatus === LikeStatus.Like) {
      commentDocument.addLike();
    }
    if (newLikeStatus === LikeStatus.Dislike) {
      commentDocument.addDislike();
    }
  }
}
