import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class DeleteBlogCommand extends Command<void> {
  constructor(public blogId: string) {
    super();
  }
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<
  DeleteBlogCommand,
  void
> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogCommand): Promise<void> {
    const blogDocument = await this.blogsRepository.findByIdOrThrow(
      command.blogId,
    );
    await this.blogsRepository.delete(blogDocument);
  }
}
