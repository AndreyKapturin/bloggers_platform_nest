import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/Comments.repository';
import { UsersRepository } from '../../../../user-accounts/users/infrastructure/users.repository';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../../core/exceptions/DomainException';

export class UpdateCommentCommand extends Command<void> {
  constructor(
    public commentId: string,
    public content: string,
    public userId: string,
  ) {
    super();
  }
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<
  UpdateCommentCommand,
  void
> {
  constructor(
    private commentsRepository: CommentsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: UpdateCommentCommand): Promise<void> {
    const { commentId, userId, content } = command;
    const comment = await this.commentsRepository.findByIdOrThrow(commentId);
    const user = await this.usersRepository.findByIdOrThrow(userId);

    if (comment.userId !== user.id) {
      throw new DomainException(
        DomainExceptionStatus.PermissionError,
        `Attempt to update another user's comment`,
        [
          {
            field: 'userId',
            message: `Attempt to update another user's comment`,
          },
        ],
      );
    }

    comment.updateContent(content);
    await this.commentsRepository.save(comment);
  }
}
