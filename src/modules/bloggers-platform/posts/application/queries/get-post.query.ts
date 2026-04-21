import { QueryHandler, Query, IQueryHandler } from '@nestjs/cqrs';
import { ViewPostDto } from '../../dto/Post.view-dto';
import { PostsQueryRepository } from '../../infrastructure/Post.query-repository';
import { PostReactionsRepository } from '../../infrastructure/PostReactions.repository';
import { LikeStatus } from '../../../dto/HttpLikeStatus.dto';

export class GetPostQuery extends Query<ViewPostDto> {
  constructor(
    public postId: string,
    public userId: string | null,
  ) {
    super();
  }
}

@QueryHandler(GetPostQuery)
export class GetPostsQueryHandler implements IQueryHandler<
  GetPostQuery,
  ViewPostDto
> {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private postsReactionRepository: PostReactionsRepository,
  ) {}

  async execute(query: GetPostQuery) {
    const { postId, userId } = query;
    const postDocument = await this.postsQueryRepository.findById(postId);

    if (userId) {
      const reactionDocument =
        await this.postsReactionRepository.findByUserIdAndPostId(
          userId,
          postId,
        );
      postDocument.extendedLikesInfo.myStatus = reactionDocument
        ? reactionDocument.status
        : LikeStatus.None;
    }

    return postDocument;
  }
}
