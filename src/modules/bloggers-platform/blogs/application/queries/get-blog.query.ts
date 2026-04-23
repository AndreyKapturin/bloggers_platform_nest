import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { ViewBlogDto } from '../../api/dto/Blog.view-dto';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query-repository';

export class GetBlogQuery extends Query<ViewBlogDto> {
  constructor(public blogId: string) {
    super();
  }
}

@QueryHandler(GetBlogQuery)
export class GetBlogQueryHandler implements IQueryHandler<
  GetBlogQuery,
  ViewBlogDto
> {
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}
  
  execute(query: GetBlogQuery): Promise<ViewBlogDto> {
    return this.blogsQueryRepository.findById(query.blogId);
  }
}
