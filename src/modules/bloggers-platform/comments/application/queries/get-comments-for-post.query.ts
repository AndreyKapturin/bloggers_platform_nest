import { ViewCommentDto } from '../../api/dto/ViewComment.dto';
import { QueryHandler, Query, IQueryHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../infrastructure/Comments.query-repository';
import { CommentsQueryParamsDto } from '../../api/dto/CommentsQueryParams.dto';
import { PaginatedView } from '../../../../../core/dto/PaginatedView.dto';
import { PostsRepository } from '../../../posts/infrastructure/Post.repository';

export class GetPostCommentsQuery extends Query<PaginatedView<ViewCommentDto>> {
  constructor(
    public postId: string,
    public queryParams: CommentsQueryParamsDto,
    public userId: string | null,
  ) {
    super();
  }
}

@QueryHandler(GetPostCommentsQuery)
export class GetPostCommentsQueryHandler implements IQueryHandler<
  GetPostCommentsQuery,
  PaginatedView<ViewCommentDto>
> {
  constructor(
    private postsRepository: PostsRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async execute(query: GetPostCommentsQuery) {
    const { postId, queryParams, userId } = query;
    await this.postsRepository.findByIdOrThrow(postId);
    const paginatedViewComments =
      await this.commentsQueryRepository.findForPost(
        postId,
        queryParams,
        userId,
      );

    return paginatedViewComments;
  }
}
