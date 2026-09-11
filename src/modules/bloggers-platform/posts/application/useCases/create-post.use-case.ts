import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../infrastructure/Post.repository';
import { DomainCreatePostDto } from '../../domain/dto/DomainCreatePost.dto';
import { Post } from '../../domain/Post.entity';

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
    const blog = await this.blogsRepository.findByIdOrThrow(command.blogId);

    const createPostDto = new DomainCreatePostDto(
      command.title,
      command.shortDescription,
      command.content,
      blog,
    );

    const post = Post.create(createPostDto);
    await this.postsRepository.save(post);
    return post.id;
  }
}
