import { QueryHandler, Query, IQueryHandler } from '@nestjs/cqrs';
import { ViewPostDto } from '../../api/dto/ViewPost.dto';
import { PostsQueryRepository } from '../../infrastructure/Post.query-repository';
import { PostsQueryParamsDto } from '../../api/dto/PostQueryParams.dto';
import { PaginatedView } from '../../../../../core/dto/PaginatedView.dto';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/blogs.query-repository';

export class GetPostsQuery extends Query<PaginatedView<ViewPostDto>> {
  constructor(
    public queryParams: PostsQueryParamsDto,
    public userId: string | null,
    public blogId: string | null = null,
  ) {
    super();
  }
}

@QueryHandler(GetPostsQuery)
export class GetPostsQueryHandler implements IQueryHandler<
  GetPostsQuery,
  PaginatedView<ViewPostDto>
> {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(query: GetPostsQuery) {
    const { queryParams, userId, blogId } = query;
    let paginatedViewPosts: PaginatedView<ViewPostDto>;

    if (blogId) {
      await this.blogsQueryRepository.findById(blogId);
      paginatedViewPosts = await this.postsQueryRepository.findForBlog(
        blogId,
        queryParams,
        userId,
      );
    } else {
      paginatedViewPosts = await this.postsQueryRepository.find(
        queryParams,
        userId,
      );
    }

    return paginatedViewPosts;
  }
}
