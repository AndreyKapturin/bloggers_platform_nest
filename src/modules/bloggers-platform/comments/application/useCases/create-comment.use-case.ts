import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/Comments.repository';
import { UsersRepository } from '../../../../user-accounts/users/infrastructure/users.repository';
import { PostsRepository } from '../../../posts/infrastructure/Post.repository';
import { DomainCreateCommentDto } from '../../domain/dto/DomainCreateComment.dto';

export class CreateCommentCommand extends Command<string> {
  constructor(
    public postId: string,
    public content: string,
    public userId: string,
  ) {
    super();
  }
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<
  CreateCommentCommand,
  string
> {
  constructor(
    private commentsRepository: CommentsRepository,
    private usersRepository: UsersRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute(command: CreateCommentCommand): Promise<string> {
    const { userId, postId, content } = command;
    const user = await this.usersRepository.findByIdOrThrow(userId);
    await this.postsRepository.findByIdOrThrow(postId);

    const createCommentDto = new DomainCreateCommentDto(
      postId,
      content,
      userId,
    );

    const commentId = await this.commentsRepository.create(createCommentDto);
    return commentId;
  }
}
