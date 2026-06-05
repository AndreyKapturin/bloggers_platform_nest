import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../infrastructure/Post.repository';
import { DomainUpdatePostDto } from '../../domain/dto/DomainUpdatePost.dto';

export class UpdatePostCommand extends Command<void> {
  constructor(
    public postId: string,
    public paramsBlogId: string,
    public title: string,
    public shortDescription: string,
    public content: string,
  ) {
    super();
  }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<
  UpdatePostCommand,
  void
> {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<void> {
    await this.blogsRepository.findByIdOrThrow(command.paramsBlogId);
    await this.postsRepository.findByIdOrThrow(command.postId);

    const updatePostDto = new DomainUpdatePostDto(
      command.title,
      command.shortDescription,
      command.content,
    );

    await this.postsRepository.update(command.postId, updatePostDto);
  }
}
