import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/Comments.repository';
import { LikeStatus } from '../../../dto/HttpLikeStatus.dto';
import { CommentReaction } from '../../domain/CommentReaction.entity';
import { Comment } from '../../domain/comment.entity';
import { User } from '../../../../user-accounts/users/domain/user.entity';
import { CommentReactionsRepository } from '../../infrastructure/CommentReactions.repository';

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
    private commentsRepository: CommentsRepository,
    private readonly commentReactionsRepository: CommentReactionsRepository,
  ) {}

  async execute(command: LikeCommentCommand): Promise<void> {
    const { commentId, userId, status: newLikeStatus } = command;
    await this.commentsRepository.findByIdOrThrow(commentId);

    let reaction = await this.commentReactionsRepository.findUserReaction(
      commentId,
      userId,
    );

    if (reaction) {
      if (reaction.status === newLikeStatus) return;
      reaction.updateStatus(newLikeStatus);
    } else {
      if (newLikeStatus === LikeStatus.None) return;
      reaction = CommentReaction.create({
        comment: { id: commentId } as Comment,
        user: { id: userId } as User,
        status: newLikeStatus,
      });
    }

    await this.commentReactionsRepository.save(reaction);
  }
}
