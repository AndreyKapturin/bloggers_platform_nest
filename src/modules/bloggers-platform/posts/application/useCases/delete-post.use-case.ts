import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/Post.repository';

export class DeletePostCommand extends Command<void> {
  constructor(public postId: string) {
    super();
  }
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<
  DeletePostCommand,
  void
> {
  constructor(private postsRepository: PostsRepository) {}

  async execute(command: DeletePostCommand): Promise<void> {
    const postDocument = await this.postsRepository.findByIdOrThrow(
      command.postId,
    );
    await this.postsRepository.delete(postDocument);
  }
}
