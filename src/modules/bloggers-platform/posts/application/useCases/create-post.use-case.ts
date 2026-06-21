import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../infrastructure/Post.repository';
import { DomainCreatePostDto } from '../../domain/dto/DomainCreatePost.dto';

export class CreatePostCommand extends Command<string> {
  constructor(
    public blogId: string,
    public title: string,
    public shortDescription: string,
    public content: string,
  ) {
    super();
  }
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<
  CreatePostCommand,
  string
> {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<string> {
    await this.blogsRepository.findByIdOrThrow(command.blogId);

    const createPostDto = new DomainCreatePostDto(
      command.title,
      command.shortDescription,
      command.content,
      command.blogId,
    );

    const postId = await this.postsRepository.create(createPostDto);
    return postId;
  }
}
