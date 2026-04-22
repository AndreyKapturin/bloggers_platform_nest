import { ViewCommentDto } from '../../api/dto/ViewComment.dto';
import { QueryHandler, Query, IQueryHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../infrastructure/Comments.query-repository';
import { CommentReactionRepository } from '../../infrastructure/CommentReaction.repository';
import { LikeStatus } from '../../../dto/HttpLikeStatus.dto';

export class GetCommentQuery extends Query<ViewCommentDto> {
  constructor(
    public commentId: string,
    public userId: string | null,
  ) {
    super();
  }
}

@QueryHandler(GetCommentQuery)
export class GetCommentQueryHandler implements IQueryHandler<
  GetCommentQuery,
  ViewCommentDto
> {
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private commentReactionRepository: CommentReactionRepository,
  ) {}

  async execute(query: GetCommentQuery) {
    let viewComment = await this.commentsQueryRepository.findByIdOrThrow(
      query.commentId,
    );

    if (query.userId) {
      const userReaction =
        await this.commentReactionRepository.findByCommentIdAndUserId(
          query.commentId,
          query.userId,
        );
      viewComment.likesInfo.myStatus = userReaction?.status ?? LikeStatus.None;
    }

    return viewComment;
  }
}
