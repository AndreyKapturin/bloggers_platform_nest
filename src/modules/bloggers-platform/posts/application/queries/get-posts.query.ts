import { QueryHandler, Query, IQueryHandler } from '@nestjs/cqrs';
import { ViewPostDto } from '../../dto/Post.view-dto';
import { PostsQueryRepository } from '../../infrastructure/Post.query-repository';
import { PostReactionsRepository } from '../../infrastructure/PostReactions.repository';
import { LikeStatus } from '../../../dto/HttpLikeStatus.dto';
import { PostsQueryParamsDto } from '../../dto/PostQueryParams.dto';
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
    private postsReactionRepository: PostReactionsRepository,
  ) {}

  async execute(query: GetPostsQuery) {
    const { queryParams, userId, blogId } = query;
    let paginatedViewPosts: PaginatedView<ViewPostDto>;

    if (blogId) {
      await this.blogsQueryRepository.findById(blogId);
      paginatedViewPosts = await this.postsQueryRepository.findForBlog(
        blogId,
        queryParams,
      );
    } else {
      paginatedViewPosts = await this.postsQueryRepository.find(queryParams);
    }

    await this.postsQueryRepository.find(queryParams);

    if (userId) {
      await this._setUserReactions(paginatedViewPosts, userId);
    }

    return paginatedViewPosts;
  }

  private async _setUserReactions(
    paginatedViewPosts: PaginatedView<ViewPostDto>,
    userId: string,
  ) {
    const postIds = paginatedViewPosts.items.map((post) => post.id);
    const reactionDocuments =
      await this.postsReactionRepository.getUserReactions(userId, postIds);

    paginatedViewPosts.items.forEach((postDocument) => {
      const reactionDocument = reactionDocuments.find(
        (r) => r.postId === postDocument.id,
      );
      postDocument.extendedLikesInfo.myStatus = reactionDocument
        ? reactionDocument.status
        : LikeStatus.None;
    });
  }
}
