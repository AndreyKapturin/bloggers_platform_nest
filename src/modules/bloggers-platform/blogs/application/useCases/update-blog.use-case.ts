import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { plainToClass } from 'class-transformer';
import { DomainUpdateBlogDto } from '../../domain/dto/DomainUpdateBlog.dto';

export class UpdateBlogCommand extends Command<void> {
  constructor(
    public blogId: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {
    super();
  }
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<
  UpdateBlogCommand,
  void
> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<void> {
    const blogDocument = await this.blogsRepository.findByIdOrThrow(
      command.blogId,
    );
    const updateBlogDto = plainToClass(DomainUpdateBlogDto, command);
    blogDocument.update(updateBlogDto);
    await this.blogsRepository.save(blogDocument);
  }
}
