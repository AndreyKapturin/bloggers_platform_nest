import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../infrastructure/Post.repository';
import { DomainUpdatePostDto } from '../../domain/dto/DomainUpdatePost.dto';

export class UpdatePostCommand extends Command<void> {
  constructor(
    public postId: string,
    public blogId: string,
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
    const postDocument = await this.postsRepository.findByIdOrThrow(
      command.postId,
    );

    const blogDocument = await this.blogsRepository.findByIdOrThrow(
      command.blogId,
    );

    const updatePostDto = new DomainUpdatePostDto(
      command.title,
      command.shortDescription,
      command.content,
      command.blogId,
      blogDocument.name,
    );

    postDocument.update(updatePostDto);

    await this.postsRepository.save(postDocument);
  }
}
