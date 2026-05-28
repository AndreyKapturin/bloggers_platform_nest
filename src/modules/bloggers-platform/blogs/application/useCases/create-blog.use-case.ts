import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { plainToClass } from 'class-transformer';
import { DomainCreateBlogDto } from '../../domain/dto/DomainCreateBlog.dto';

export class CreateBlogCommand extends Command<string> {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {
    super();
  }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<
  CreateBlogCommand,
  string
> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: CreateBlogCommand): Promise<string> {
    const createBlogDto = plainToClass(DomainCreateBlogDto, command);
    const id = await this.blogsRepository.create(createBlogDto);
    return id;
  }
}
