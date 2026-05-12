import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { ViewBlogDto } from '../../api/dto/Blog.view-dto';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query-repository';
import { PaginatedView } from '../../../../../core/dto/PaginatedView.dto';
import { BlogsQueryParamsDto } from '../../api/dto/BlogQueryParams.dto';

export class GetBlogsQuery extends Query<PaginatedView<ViewBlogDto>> {
  constructor(public queryParams: BlogsQueryParamsDto) {
    super();
  }
}

@QueryHandler(GetBlogsQuery)
export class GetBlogsQueryHandler implements IQueryHandler<
  GetBlogsQuery,
  ViewBlogDto
> {
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}

  execute(query: GetBlogsQuery): Promise<PaginatedView<ViewBlogDto>> {
    return this.blogsQueryRepository.find(query.queryParams);
  }
}
