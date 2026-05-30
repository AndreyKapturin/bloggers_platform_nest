import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/Comments.repository';
import { LikeStatus } from '../../../dto/HttpLikeStatus.dto';
import { TCommentUserReactionModel } from '../../domain/comment.entity';

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
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(command: LikeCommentCommand): Promise<void> {
    const { commentId, userId, status: newLikeStatus } = command;
    await this.commentsRepository.findByIdOrThrow(commentId);

    const oldReaction = await this.commentsRepository.findUserReaction(
      commentId,
      userId,
    );

    let reaction: TCommentUserReactionModel;

    if (oldReaction) {
      if (oldReaction.status === newLikeStatus) return;
      reaction = oldReaction;
      this.commentsRepository.changeReactionStatus(
        commentId,
        userId,
        newLikeStatus,
      );
    } else {
      if (newLikeStatus === LikeStatus.None) return;
      await this.commentsRepository.createReactionStatus(
        commentId,
        userId,
        newLikeStatus,
      );
    }
  }
}
