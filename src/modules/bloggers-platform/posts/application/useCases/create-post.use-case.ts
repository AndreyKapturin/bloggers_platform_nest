import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Post, type TPostModel } from '../../domain/Post.entity';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../infrastructure/Post.repository';

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
    @InjectModel(Post.name)
    private PostModel: TPostModel,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<string> {
    const blogDocument = await this.blogsRepository.findByIdOrThrow(
      command.blogId,
    );

    const newPostDocument = this.PostModel.makeInstance(
      command.title,
      command.content,
      command.shortDescription,
      command.blogId,
      blogDocument.name,
    );

    await this.postsRepository.save(newPostDocument);

    return newPostDocument.id;
  }
}
