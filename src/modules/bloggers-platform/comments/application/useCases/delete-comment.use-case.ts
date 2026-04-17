import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/Comments.repository';
import { UsersRepository } from '../../../../user-accounts/users/infrastructure/users.repository';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../../core/exceptions/DomainException';

export class DeleteCommentCommand extends Command<void> {
  constructor(
    public commentId: string,
    public userId: string,
  ) {
    super();
  }
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<
  DeleteCommentCommand,
  void
> {
  constructor(
    private commentsRepository: CommentsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: DeleteCommentCommand): Promise<void> {
    const { commentId, userId } = command;
    const commentDocument =
      await this.commentsRepository.findByIdOrThrow(commentId);
    const userDocument = await this.usersRepository.findByIdOrThrow(userId);

    if (commentDocument.commentatorInfo.userId !== userDocument.id) {
      throw new DomainException(
        DomainExceptionStatus.PermissionError,
        `Attempt to delete another user's comment`,
        [
          {
            field: 'userId',
            message: `Attempt to delete another user's comment`,
          },
        ],
      );
    }

    await this.commentsRepository.delete(commentDocument);
  }
}
